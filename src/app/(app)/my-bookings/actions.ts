'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getPaymobPaymentKey } from '@/utils/paymob' // <--- New Import

// --- 1. EXISTING: Get Bookings ---
export async function getUserBookings() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      fleet ( make, model, images, year ),
      tenants ( name, whatsapp_number, address )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }

  return bookings
}

// --- 2. NEW: Pay for Quote (The "Pay Now" Button Action) ---
export async function payForBooking(bookingId: string) {
  const supabase = await createClient()
  
  // A. Get the Booking & User Details
  // We need the profile info to pre-fill the Paymob form
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, profiles(email, full_name, phone)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) return { error: 'Booking not found' }

  // B. Convert Price to Smallest Unit (Baisa)
  // 1 OMR = 1000 Baisa
  const priceInSmallestUnit = Math.round(booking.total_price_omr * 1000)
  
  // C. Get Paymob Token
  const paymentToken = await getPaymobPaymentKey(priceInSmallestUnit, {
    bookingId: booking.id,
    // @ts-ignore - Handle possible nulls safely
    email: booking.profiles?.email || 'guest@omanrentals.com',
    // @ts-ignore
    firstName: booking.profiles?.full_name?.split(' ')[0] || 'Guest',
    // @ts-ignore
    lastName: booking.profiles?.full_name?.split(' ')[1] || 'User',
    // @ts-ignore
    phone: booking.profiles?.phone || '00000000'
  })

  if (!paymentToken) return { error: 'Payment gateway connection failed' }

  // D. Return Token to Client
  return { success: true, paymentToken }
}