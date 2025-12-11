'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper: Centralize the security check to avoid repeating code
async function assertSuperAdmin() {
  const supabase = await createClient()
  
  // 1. Fail Fast: Check if user exists
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { authorized: false, supabase }
  }

  // 2. Check Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { authorized: false, supabase }
  }

  return { authorized: true, supabase }
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  // 1. Validate Input (Prevent "banana" status)
  const validStatuses = ['pending', 'paid', 'confirmed', 'cancelled', 'completed']
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Invalid status provided' }
  }

  // 2. Security Check
  const { authorized, supabase } = await assertSuperAdmin()
  if (!authorized) return { error: 'Unauthorized' }

  // 3. Perform Update
  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function approveVendor(formData: FormData) {
  const tenantId = formData.get('tenantId') as string
  if (!tenantId) return { error: 'Tenant ID is required' }

  // 1. Security Check
  const { authorized, supabase } = await assertSuperAdmin()
  if (!authorized) return { error: 'Unauthorized' }

  // 2. Update Status
  const { error } = await supabase
    .from('tenants')
    .update({ status: 'active' })
    .eq('id', tenantId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}