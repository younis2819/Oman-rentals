'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCompany(formData: FormData) {
  const supabase = await createClient()
  
  // --- 1. AUTH & DUPLICATE CHECK ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in' }

  // Check if user already owns a company (Rate Limit / Duplicate Protection)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (existingProfile?.tenant_id) {
    return { error: 'You have already registered a company.' }
  }

  // --- 2. INPUT VALIDATION ---
  const companyName = formData.get('companyName') as string
  const whatsapp = formData.get('whatsapp') as string
  const address = formData.get('address') as string

  if (!companyName || companyName.trim().length < 3) {
    return { error: 'Company name must be at least 3 characters' }
  }
  
  // Basic phone validation (removes spaces/dashes, checks for 8-15 digits)
  const cleanPhone = whatsapp.replace(/[\s-]/g, '')
  if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
    return { error: 'Please enter a valid WhatsApp number (e.g. 96812345678)' }
  }

  // --- 3. SLUG GENERATION (With Collision Check) ---
  let slug = companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  
  // Check if slug exists
  const { data: existingSlugs } = await supabase
    .from('tenants')
    .select('slug')
    .ilike('slug', `${slug}%`)

  // If collision found (e.g. "golden-cars" exists), append number ("golden-cars-1")
  if (existingSlugs && existingSlugs.length > 0) {
     slug = `${slug}-${existingSlugs.length + 1}`
  }

  // --- 4. CREATE TENANT ---
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: companyName.trim(),
      whatsapp_number: cleanPhone,
      address: address,
      status: 'pending', 
      slug: slug,
      owner_id: user.id
    })
    .select()
    .single()

  if (tenantError) {
    console.error('Tenant Create Error:', tenantError)
    return { error: 'System error: Could not create company.' }
  }

  // --- 5. LINK PROFILE (With Manual Rollback) ---
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      tenant_id: tenant.id,
      role: 'owner' 
    })
    .eq('id', user.id)

  // 🚨 CRITICAL: If profile link fails, DELETE the company we just made
  // This prevents "Orphaned" companies that belong to no one.
  if (profileError) {
    console.error('Profile Link Error:', profileError)
    await supabase.from('tenants').delete().eq('id', tenant.id)
    return { error: 'Failed to link profile. Please try again.' }
  }

  // --- 6. SUCCESS ---
  revalidatePath('/admin') // Notify admin dashboard of new request
  return { success: true }
}