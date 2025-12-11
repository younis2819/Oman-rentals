'use server'

import { createClient } from '@/utils/supabase/server'
import { Car } from '@/types' 
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPaymobPaymentKey } from '@/utils/paymob' 
// 👇 1. Import the email utility
import { sendBookingConfirmation } from '@/utils/send-email'

// --- 1. Get Rental Companies ---
export async function getRentalCompanies() {
  const supabase = await createClient()
  const { data: companies, error } = await supabase
    .from('tenants')
    .select('id, name, slug, whatsapp_number, logo_url') 
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }
  return companies
}

// --- 2. Unified Fleet Fetcher ---
export async function getFleet(params: {
  category: 'car' | 'heavy',
  features?: string,
  location?: string,
  start?: string,
  end?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('fleet')
    .select(`*, tenants!inner ( name, slug, whatsapp_number, address, logo_url )`)
    .eq('is_available', true)
    .eq('category', params.category)

  if (params.location && params.location !== 'All Oman') {
    query = query.ilike('tenants.address', `%${params.location}%`)
  }
  
  if (params.features) {
    query = query.contains('features', [params.features])
  }

  if (params.start && params.end) {
    const { data: busy } = await supabase
      .from('bookings')
      .select('car_id')
      .neq('status', 'cancelled')
      .or(`start_date.lte.${params.end},end_date.gte.${params.start}`)
    
    const busyIds = busy?.map(b => b.car_id) || []
    
    if (busyIds.length > 0) {
      query = query.not('id', 'in', `(${busyIds.join(',')})`)
    }
  }

  const isFiltering = params.location || params.features || params.start
  
  if (!isFiltering) {
    query = query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)
  } else {
    query = query.order('daily_rate_omr', { ascending: true })
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Fleet Fetch Error:', error)
    return []
  }
  return data as Car[]
}

// --- 3. Availability Check ---
export async function checkAvailability(carId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('car_id', carId)
    .or(`status.eq.paid,status.eq.pending`) 
    .lte('start_date', endDate)
    .gte('end_date', startDate)

  if (error) return { available: false, error: 'System error' }
  return { available: data.length === 0 }
}

// --- 4. Create Booking ---
export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const carId = formData.get('carId')
  const startDate = new Date(formData.get('startDate') as string)
  const endDate = new Date(formData.get('endDate') as string)
  const baseRate = Number(formData.get('dailyRate')) 
  const deliveryNeeded = formData.get('deliveryNeeded') === 'true'

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
  const totalOmr = days * baseRate
  const priceInSmallestUnit = totalOmr * 1000 

  const customerName = formData.get('customerName') as string || "Guest User"
  const customerPhone = formData.get('customerPhone') as string
  
  const rawData = {
    car_id: carId,
    tenant_id: formData.get('tenantId'),
    start_date: formData.get('startDate'),
    end_date: formData.get('endDate'),
    total_price_omr: totalOmr,
    customer_name: customerName, 
    customer_phone: customerPhone,
    delivery_needed: deliveryNeeded,
    delivery_address: formData.get('deliveryAddress') as string || null,
    status: 'pending',
    user_id: user ? user.id : null 
  }

  // 👇 UPDATE: Select fleet details (make, model) to use in the email
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(rawData)
    .select('*, fleet(make, model)') 
    .single()
  
  if (error) {
    console.error('Booking Creation Error:', error)
    return { success: false, error: error.message }
  }

  // 👇 2. FIRE EMAIL (Fire & Forget)
  try {
      const emailToSend = user?.email || (formData.get('customerEmail') as string) // Note: Ensure your widget captures email if guest
      if (emailToSend) {
        // We construct the car name safely
        // @ts-ignore
        const carName = booking.fleet ? `${booking.fleet.make} ${booking.fleet.model}` : 'Vehicle'
        const refId = booking.id.slice(0, 8).toUpperCase()
        
        // Call the utility function (no await needed, let it run in background)
        sendBookingConfirmation(emailToSend, customerName, refId, carName)
      }
  } catch (err) {
      console.error('Email trigger error (non-blocking):', err)
  }

  if (deliveryNeeded) {
    return { success: true, bookingId: booking.id, paymentRequired: false }
  }

  if (!deliveryNeeded) {
    const paymentToken = await getPaymobPaymentKey(priceInSmallestUnit, {
      bookingId: booking.id,
      email: user?.email || "guest@omanrentals.com",
      firstName: customerName.split(' ')[0] || "Guest",
      lastName: customerName.split(' ')[1] || "User",
      phone: customerPhone.toString()
    })

    if (paymentToken) {
      return { 
        success: true, 
        bookingId: booking.id, 
        paymentRequired: true, 
        paymentToken: paymentToken 
      }
    }
  }

  return { success: true, bookingId: booking.id, paymentRequired: false }
}

// --- 5. Get Company Details ---
export async function getCompanyBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tenants').select('*').eq('slug', slug).single()
  if (error) return null
  return data
}

// --- 6. Get Company Fleet ---
export async function getCompanyFleet(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fleet')
    .select(`*, tenants ( name, slug, whatsapp_number, logo_url )`) 
    .eq('tenant_id', tenantId)
    .eq('is_available', true)
    .order('daily_rate_omr', { ascending: true })
  if (error) return []
  return data
}

// --- DEPRECATED HELPER ---
export async function getFeaturedCars(category: 'car' | 'heavy' = 'car', features?: string) {
  return getFleet({ category, features })
}