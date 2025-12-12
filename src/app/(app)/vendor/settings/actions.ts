'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Update Logo (Unchanged, just kept for context)
export async function updateVendorLogo(logoUrl: string, oldLogoUrl?: string) {
  if (!logoUrl || !logoUrl.startsWith('http')) {
    return { error: 'Invalid logo URL' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'No vendor profile found' }

  const { error } = await supabase
    .from('tenants')
    .update({ logo_url: logoUrl })
    .eq('id', profile.tenant_id)

  if (error) return { error: error.message }

  if (oldLogoUrl) {
    try {
      const oldPath = oldLogoUrl.split('/logos/')[1]?.split('?')[0]
      if (oldPath) {
        await supabase.storage.from('logos').remove([oldPath])
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup old logo:', cleanupError)
    }
  }

  revalidatePath('/vendor/settings')
  revalidatePath('/company', 'layout') 
  return { success: true }
}

// 2. Update Text Details (Updated with City & Phone Cleaning)
export async function updateVendorDetails(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'No vendor profile found' }

  // Extract Data
  const name = (formData.get('name') as string)?.trim()
  const whatsappRaw = (formData.get('whatsapp') as string)?.trim()
  const address = (formData.get('address') as string)?.trim()
  const city = (formData.get('city') as string)?.trim() // 👈 New Field

  // Validation
  if (!name || name.length < 2) {
    return { error: 'Company Name must be at least 2 characters' }
  }

  // Clean WhatsApp (Remove spaces, dashes, ensure only numbers/plus)
  const whatsapp = whatsappRaw ? whatsappRaw.replace(/[\s-]/g, '') : null

  if (whatsapp && !/^[0-9+]{8,15}$/.test(whatsapp)) {
    return { error: 'Invalid WhatsApp number format' }
  }

  // Update DB
  const { error } = await supabase
    .from('tenants')
    .update({ 
      name, 
      whatsapp_number: whatsapp, 
      address,
      city // 👈 Save the city
    })
    .eq('id', profile.tenant_id)

  if (error) return { error: error.message }

  revalidatePath('/vendor/settings')
  revalidatePath('/company', 'layout')
  
  return { success: true }
}