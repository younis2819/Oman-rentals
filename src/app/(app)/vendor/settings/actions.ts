'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Update Logo (with Validation & Cleanup)
export async function updateVendorLogo(logoUrl: string, oldLogoUrl?: string) {
  // 1. Validation
  if (!logoUrl || !logoUrl.startsWith('http')) {
    return { error: 'Invalid logo URL' }
  }

  const supabase = await createClient()

  // 2. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // 3. Get Tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'No vendor profile found' }

  // 4. Update Tenant
  const { error } = await supabase
    .from('tenants')
    .update({ logo_url: logoUrl })
    .eq('id', profile.tenant_id)

  if (error) return { error: error.message }

  // 5. Cleanup Old Logo from Storage
  if (oldLogoUrl) {
    try {
      // Extract path: ".../logos/tenantId/filename.jpg" -> "tenantId/filename.jpg"
      const oldPath = oldLogoUrl.split('/logos/')[1]?.split('?')[0]
      if (oldPath) {
        await supabase.storage.from('logos').remove([oldPath])
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup old logo:', cleanupError)
      // Non-blocking error
    }
  }

  revalidatePath('/vendor/settings')
  revalidatePath('/company', 'layout') // Revalidate all company pages
  return { success: true }
}

// 2. Update Text Details (with Validation)
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

  // Get Data & Validate
  const name = (formData.get('name') as string)?.trim()
  const whatsapp = (formData.get('whatsapp') as string)?.trim()
  const address = (formData.get('address') as string)?.trim()

  if (!name || name.length < 2) {
    return { error: 'Company Name must be at least 2 characters' }
  }

  // Optional: Basic WhatsApp validation
  if (whatsapp && !/^[0-9+\s-]{8,15}$/.test(whatsapp.replace(/\s/g, ''))) {
    return { error: 'Invalid WhatsApp number format' }
  }

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
  revalidatePath('/company', 'layout')
  
  return { success: true }
}