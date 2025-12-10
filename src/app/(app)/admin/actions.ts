'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ... existing imports

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const supabase = await createClient()
  
  // Security: Check if user is Super Admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  if (profile?.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function approveVendor(formData: FormData) {
  const supabase = await createClient()
  const tenantId = formData.get('tenantId') as string

  // Security check: Ensure only super_admin can do this
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  // Update Status
  const { error } = await supabase
    .from('tenants')
    .update({ status: 'active' })
    .eq('id', tenantId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}