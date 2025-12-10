'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateAsset(formData: FormData) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // 2. Data Extraction
  const id = formData.get('id') as string
  const category = formData.get('category') as 'car' | 'heavy'
  const make = formData.get('make')
  const model = formData.get('model')
  const year = formData.get('year')
  const price = formData.get('price')
  
  // 3. Security: Check Tenant Ownership
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  
  if (!profile?.tenant_id) return { error: 'Unauthorized' }

  // 4. Handle Dynamic Specs
  let specs = {}
  let transmission = null

  if (category === 'car') {
    transmission = formData.get('transmission')
    specs = { 
      transmission: transmission, 
      seats: formData.get('seats'),
      fuel: formData.get('fuel')
    }
  } else {
    // Heavy Machinery
    specs = {
      tonnage: formData.get('tonnage'),
      usage_hours: formData.get('hours'),
      reach: formData.get('reach')
    }
  }

  // 5. Update Database
  const { error } = await supabase
    .from('fleet')
    .update({
      make,
      model,
      year: Number(year),
      daily_rate_omr: Number(price),
      features: (formData.get('features') as string).split(',').map(s => s.trim()),
      transmission: transmission, // Only set for cars
      specs: specs // The JSONB magic
    })
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id) // CRITICAL SECURITY

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/vendor/dashboard')
  redirect('/vendor/dashboard')
}