'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCar(formData: FormData) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'No vendor account found' }

  // 2. Image Upload
  const imageFile = formData.get('image') as File
  let publicUrl = null

  if (imageFile && imageFile.size > 0) {
    const fileName = `${profile.tenant_id}-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const { error: uploadError } = await supabase.storage
      .from('fleet-images')
      .upload(fileName, imageFile)

    if (uploadError) return { error: 'Upload failed: ' + uploadError.message }

    const { data: urlData } = supabase.storage.from('fleet-images').getPublicUrl(fileName)
    publicUrl = urlData.publicUrl
  }

  // --- 3. PRICING LOGIC (UPDATED) ---
  const vendorPrice = Number(formData.get('price'))
  
  // CHANGED: Increased from 5% (0.05) to 10% (0.10)
  const COMMISSION_PERCENT = 0.10 
  
  // Calculate Market Price: (e.g. 50 * 1.10 = 55)
  const marketPrice = Math.ceil(vendorPrice * (1 + COMMISSION_PERCENT))

  // 4. Save to DB
  const rawData = {
    tenant_id: profile.tenant_id,
    make: formData.get('make'),
    model: formData.get('model'),
    year: Number(formData.get('year')),
    transmission: formData.get('transmission'),
    
    // Save the split
    base_rate: vendorPrice,       
    daily_rate_omr: marketPrice,  
    
    features: (formData.get('features') as string).split(',').map(f => f.trim()).filter(Boolean),
    images: publicUrl ? [publicUrl] : [],
    is_available: true
  }

  const { error: dbError } = await supabase.from('fleet').insert(rawData)
  if (dbError) return { error: dbError.message }

  revalidatePath('/vendor/dashboard')
  redirect('/vendor/dashboard')
}