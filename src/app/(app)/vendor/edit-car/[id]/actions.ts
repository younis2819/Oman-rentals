'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateAsset(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // Data Extraction
  const id = formData.get('id') as string
  const make = (formData.get('make') as string)?.trim()
  const model = (formData.get('model') as string)?.trim()
  const year = Number(formData.get('year'))
  const price = Number(formData.get('price')) 
  
  if (!make || !model) return { error: 'Make and Model are required' }
  if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) return { error: 'Invalid year' }
  if (isNaN(price) || price <= 0) return { error: 'Price must be greater than 0' }

  // Security Check
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) return { error: 'Unauthorized' }

  const { data: existingAsset } = await supabase
    .from('fleet')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (!existingAsset) return { error: 'Asset not found or access denied' }

  // Dynamic Specs
  const category = formData.get('category') as 'car' | 'heavy'
  let specs = {}
  let transmission = null

  if (category === 'car') {
    transmission = formData.get('transmission')
    specs = { 
      transmission: transmission, 
      seats: Number(formData.get('seats')),
      fuel: formData.get('fuel')
    }
  } else {
    specs = {
      tonnage: formData.get('tonnage'),
      usage_hours: formData.get('hours'),
      reach: formData.get('reach')
    }
  }

  const featuresRaw = formData.get('features') as string
  const features = featuresRaw 
    ? featuresRaw.split(',').map(s => s.trim()).filter(Boolean) 
    : []

  // Update Database
  const { error } = await supabase
    .from('fleet')
    .update({
      make,
      model,
      year,
      daily_rate_omr: price, // Keeping simple logic as discussed
      features,
      transmission, 
      specs 
    })
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/vendor/dashboard')
  redirect('/vendor/dashboard')
}