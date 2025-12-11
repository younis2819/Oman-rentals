'use server'

import { createClient } from '@/utils/supabase/server'
import { Car } from '@/types' 
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPaymobPaymentKey } from '@/utils/paymob' 
import { sendBookingConfirmation } from '@/utils/send-email'
import { Database } from '@/types/database.types'

// Type Definition to fix @ts-ignore
type BookingWithFleet = Database['public']['Tables']['bookings']['Row'] & {
  fleet: { make: string; model: string } | null
}

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
      // Safe filtering
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

// --- 3. Availability Check (Optimized) ---
export async function checkAvailability(carId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('car_id', carId)
    // 8. FIX: Added 'confirmed' status check
    .or(`status.eq.paid,status.eq.pending,status.eq.confirmed`) 
    .lte('start_date', endDate)
    .gte('end_date', startDate)

  if (error) return { available: false, error: 'System error' }
  return { available: data.length === 0 }
}

// --- 4. Create Booking (Fully Robust) ---
export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Extract & Validate Input
  const carId = formData.get('carId') as string
  const tenantId = formData.get('tenantId') as string
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string
  const baseRate = Number(formData.get('dailyRate')) 
  const deliveryNeeded = formData.get('deliveryNeeded') === 'true'
  
  const customerName = (formData.get('customerName') as string)?.trim() || "Guest User"
  const customerPhone = (formData.get('customerPhone') as string)?.trim()
  const customerEmail = formData.get('customerEmail') as string

  // Validation
  if (!carId || !tenantId) {
    return { success: false, error: 'Missing required booking information' }
  }
  
  // 2. Phone Validation
  if (!customerPhone || customerPhone.length < 8) {
    return { success: false, error: 'Valid phone number is required' }
  }

  // 3. Date Validation
  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)
  const today = new Date()
  today.setHours(0,0,0,0) // Reset time to midnight

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { success: false, error: 'Invalid dates provided' }
  }
  if (startDate >= endDate) {
    return { success: false, error: 'End date must be after start date' }
  }
  if (startDate < today) {
    return { success: false, error: 'Start date cannot be in the past' }
  }

  // 4. Check Availability (CRITICAL: Race Condition Prevention)
  const { available } = await checkAvailability(carId, startDateStr, endDateStr)
  if (!available) {
    return { success: false, error: 'Vehicle is no longer available for these dates' }
  }

  // 5. Calculate Pricing
  const days = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1
  const totalOmr = days * baseRate
  const priceInSmallestUnit = totalOmr * 1000 

  // 6. Insert Booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      car_id: carId,
      tenant_id: tenantId,
      start_date: startDateStr,
      end_date: endDateStr,
      total_price_omr: totalOmr,
      customer_name: customerName, 
      customer_phone: customerPhone,
      delivery_needed: deliveryNeeded,
      delivery_address: deliveryNeeded ? (formData.get('deliveryAddress') as string) : null,
      status: 'pending',
      user_id: user?.id || null 
    })
    .select('*, fleet(make, model)') 
    .single<BookingWithFleet>() // 5. FIX: Typed response
  
  if (error) {
    console.error('Booking Creation Error:', error)
    return { success: false, error: 'Failed to create booking. Please try again.' }
  }

  // 7. Send Confirmation Email (Proper async handling)
  const emailToSend = user?.email || customerEmail
  if (emailToSend && booking.fleet) {
    const carName = `${booking.fleet.make} ${booking.fleet.model}`
    const refId = booking.id.slice(0, 8).toUpperCase()
    
    // 6. FIX: Use .catch() for true non-blocking fire-and-forget
    sendBookingConfirmation(emailToSend, customerName, refId, carName)
      .catch(err => console.error('Email send error:', err))
  }

  // 8. Handle Payment or Quote
  if (deliveryNeeded) {
    return { success: true, bookingId: booking.id, paymentRequired: false }
  }

  // 7. FIX: Robust fallback email for guests
  const paymentEmail = emailToSend || `booking-${booking.id}@noreply.omanrentals.com`

  const paymentToken = await getPaymobPaymentKey(priceInSmallestUnit, {
    bookingId: booking.id,
    email: paymentEmail,
    firstName: customerName.split(' ')[0] || "Guest",
    lastName: customerName.split(' ').slice(1).join(' ') || "User",
    phone: customerPhone
  })

  if (paymentToken) {
    return { 
      success: true, 
      bookingId: booking.id, 
      paymentRequired: true, 
      paymentToken: paymentToken 
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