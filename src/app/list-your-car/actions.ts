'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCompany(formData: FormData) {
  const supabase = await createClient()
  
  // --- 1. AUTH CHECK ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in' }

  // --- 2. DUPLICATE CHECK (Hardened) ---
  // Check the tenants table directly to see if this user owns anything
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (existingTenant) {
    return { error: 'You have already registered a company.' }
  }

  // --- 3. INPUT VALIDATION ---
  const companyName = formData.get('companyName') as string
  const whatsapp = formData.get('whatsapp') as string
  const address = formData.get('address') as string
  const email = (formData.get('email') as string) || null 

  if (!companyName || companyName.trim().length < 3) {
    return { error: 'Company name must be at least 3 characters' }
  }
  
  const cleanPhone = whatsapp.replace(/[\s-]/g, '')
  if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
    return { error: 'Please enter a valid WhatsApp number (e.g. 96812345678)' }
  }

  // --- 4. SLUG GENERATION ---
  let slug = companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  
  const { data: existingSlugs } = await supabase
    .from('tenants')
    .select('slug')
    .ilike('slug', `${slug}%`)

  if (existingSlugs && existingSlugs.length > 0) {
     slug = `${slug}-${existingSlugs.length + 1}`
  }

  // --- 5. CREATE TENANT ---
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: companyName.trim(),
      whatsapp_number: cleanPhone,
      address: address,
      email: email, 
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

  // --- 6. LINK PROFILE (SECURE RPC) ---
  const { error: rpcError } = await supabase
    .rpc('attach_tenant_to_me', { p_tenant_id: tenant.id })

  // 🚨 ROLLBACK if linking fails
  if (rpcError) {
    console.error('Profile Link Error:', rpcError)
    // Clean up the tenant we just made so the user isn't stuck
    await supabase.from('tenants').delete().eq('id', tenant.id)
    return { error: 'Failed to link profile. Please try again.' }
  }

  // --- 7. SUCCESS ---
  revalidatePath('/admin') 
  revalidatePath('/')      
  
  return { success: true }
}