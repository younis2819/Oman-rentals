'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Existing Logo Action
export async function updateVendorLogo(logoUrl: string) {
  const supabase = await createClient()

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // 2. Get Tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'No vendor profile found' }

  // 3. Update Tenant
  const { error } = await supabase
    .from('tenants')
    .update({ logo_url: logoUrl })
    .eq('id', profile.tenant_id)

  if (error) return { error: error.message }

  revalidatePath('/vendor/settings')
  revalidatePath(`/company`) // Clear cache for public pages
  return { success: true }
}

// 2. NEW: Update Text Details (Name, Phone, Address)
export async function updateVendorDetails(formData: FormData) {
  const supabase = await createClient()
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'No vendor profile found' }

  // Get Data from Form
  const name = formData.get('name') as string
  const whatsapp = formData.get('whatsapp') as string
  const address = formData.get('address') as string

  if (!name) return { error: 'Company Name is required' }

  // Update DB
  const { error } = await supabase
    .from('tenants')
    .update({ 
      name, 
      whatsapp_number: whatsapp, 
      address 
    })
    .eq('id', profile.tenant_id)

  if (error) return { error: error.message }

  // Refresh pages
  revalidatePath('/vendor/settings')
  revalidatePath('/company')
  
  return { success: true }
}