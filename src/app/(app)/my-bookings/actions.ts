'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getPaymobPaymentKey } from '@/utils/paymob'
import { Database } from '@/types/database.types'

// 1. Strict Typing to fix @ts-ignore
type BookingWithProfile = Database['public']['Tables']['bookings']['Row'] & {
  profiles: {
    email: string | null
    full_name: string | null
    phone: string | null
  } | null
}

// --- 1. Get User Bookings ---
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

// --- 2. Pay for Quote (Secure) ---
export async function payForBooking(bookingId: string) {
  const supabase = await createClient()
  
  // 2. AUTH CHECK: Must be logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // A. Fetch Booking & Verify Ownership
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, profiles(email, full_name, phone)')
    .eq('id', bookingId)
    .eq('user_id', user.id) // 🔒 CRITICAL: Security Check
    .single<BookingWithProfile>()

  if (error || !booking) return { error: 'Booking not found or unauthorized' }

  // 3. STATUS CHECK: Only pay if a quote has been sent
  if (booking.status !== 'quote_sent') {
      return { error: 'This booking is not ready for payment' }
  }

  // B. Price Conversion
  const priceInSmallestUnit = Math.round(booking.total_price_omr * 1000)
  
  // 4. Robust Name & Contact Parsing
  const profile = booking.profiles
  const fullName = profile?.full_name || booking.customer_name || 'Guest User'
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || 'User'

  // 5. Fallback Contact Info
  const email = profile?.email || `booking-${booking.id}@noreply.omanrentals.com`
  const phone = profile?.phone || booking.customer_phone || '00000000'

  // C. Get Paymob Token
  const paymentToken = await getPaymobPaymentKey(priceInSmallestUnit, {
    bookingId: booking.id,
    email: email,
    firstName: firstName,
    lastName: lastName,
    phone: phone
  })

  if (!paymentToken) return { error: 'Payment gateway connection failed' }

  // D. Return Token
  return { success: true, paymentToken }
}