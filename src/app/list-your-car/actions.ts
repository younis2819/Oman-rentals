'use server'

import { createClient } from '@/utils/supabase/server'

export async function applyVendor(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('companyName') as string
  const phone = formData.get('phone') as string
  const crNumber = formData.get('crNumber') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string

  // Generate a simple slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  // 1. Strict Validation
  if (!name || !phone || !crNumber || !address) {
    return { error: 'Please fill in all required fields (CR Number is mandatory).' }
  }

  // 2. Insert Tenant (Status: 'pending')
  const { error } = await supabase
    .from('tenants')
    .insert({
      name,
      whatsapp_number: phone,
      slug,
      cr_number: crNumber,
      address: address,
      email: email,
      status: 'pending' 
    })

  if (error) {
    if (error.code === '23505') return { error: 'Company name or Slug already taken' }
    return { error: error.message }
  }

  // 3. Success
  return { success: true }
}