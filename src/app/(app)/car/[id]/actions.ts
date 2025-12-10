'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitBooking(formData: FormData) {
  const supabase = await createClient()

  // 1. Extract Data
  const carId = formData.get('carId') as string
  const tenantId = formData.get('tenantId') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const customerName = formData.get('customerName') as string
  const customerPhone = formData.get('customerPhone') as string
  const dailyRate = Number(formData.get('dailyRate'))

  // 2. Validate Dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 1) return { error: 'End date must be after start date' }

  // 3. Check Availability (Prevent Double Booking)
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('car_id', carId)
    .neq('status', 'cancelled') // Ignore cancelled bookings
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`) // Overlap logic

  if (conflicts && conflicts.length > 0) {
    return { error: 'Car is already booked for these dates.' }
  }

  // 4. Calculate Total
  const totalPrice = days * dailyRate

  // 5. Insert Booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      car_id: carId,
      tenant_id: tenantId,
      customer_name: customerName,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      total_price_omr: totalPrice,
      status: 'pending' // Default status
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // 6. Success! Redirect to a "Thank You" page
  revalidatePath('/admin') // Update your dashboard immediately
  redirect(`/booking/success?id=${data.id}`)
}