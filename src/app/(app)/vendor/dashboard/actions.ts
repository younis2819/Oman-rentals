'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. DELETE CAR (Updated for Multiple Images) ---
export async function deleteCar(carId: string) {
  const supabase = await createClient()

  // Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // Get Tenant ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'Unauthorized' }

  // 1. Get Images BEFORE deleting database row
  const { data: car } = await supabase
    .from('fleet')
    .select('images')
    .eq('id', carId)
    .eq('tenant_id', profile.tenant_id)
    .single()

  // 2. Delete from Database
  const { error } = await supabase
    .from('fleet')
    .delete()
    .eq('id', carId)
    .eq('tenant_id', profile.tenant_id)

  if (error) return { error: error.message }

  // 3. Clean up Storage (Loop through ALL images)
  if (car?.images && Array.isArray(car.images) && car.images.length > 0) {
    const filesToDelete = car.images.map((url: string) => {
        // Extract filename (e.g. .../fleet-images/12345.jpg -> 12345.jpg)
        return url.split('/').pop()
    }).filter((name): name is string => !!name) // Filter out nulls

    if (filesToDelete.length > 0) {
        await supabase.storage.from('fleet-images').remove(filesToDelete)
    }
  }

  // 4. Strong Cache Clear
  revalidatePath('/', 'layout') 
  return { success: true }
}

// --- 2. TOGGLE AVAILABILITY ---
export async function toggleCarAvailability(carId: string, currentStatus: boolean) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('fleet')
    .update({ is_available: !currentStatus })
    .eq('id', carId)
    .eq('tenant_id', profile.tenant_id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout') // <--- Stronger refresh
  return { success: true }
}

// --- 3. UPDATE BOOKING STATUS ---
export async function updateBookingStatus(bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'paid') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .eq('tenant_id', profile.tenant_id) 

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

// --- 4. SEND QUOTE ---
export async function sendQuote(bookingId: string, finalPrice: number) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not logged in' }
  
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('bookings')
      .update({ 
        total_price_omr: finalPrice,
        status: 'quote_sent' 
      })
      .eq('id', bookingId)
      .eq('tenant_id', profile.tenant_id)
  
    if (error) return { error: error.message }
    
    revalidatePath('/', 'layout')
    return { success: true }
}

// --- 5. CREATE VEHICLE (NEW) ---
export async function createVehicle(formData: FormData) {
  const supabase = await createClient()

  // Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // Tenant Check
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) return { error: 'Unauthorized' }

  // Extract Data
  const category = formData.get('category')
  const make = formData.get('make')
  const model = formData.get('model')
  const year = Number(formData.get('year'))
  const price = Number(formData.get('daily_rate_omr'))
  const description = formData.get('description') as string
  const transmission = formData.get('transmission')
  
  // Handle Images (Sent as JSON string)
  const imagesString = formData.get('images') as string 
  // Note: In the form component we append 'images' which is an array of strings
  // but FormData sends it weirdly if we don't stringify it.
  // However, looking at your AddAssetPage component, you passed `images` directly in the object to supabase .insert() 
  // BUT here we are using a Server Action. Server actions receive FormData.
  // In the AddAssetPage component I gave you, I manually appended `images` as a JSON string to `image_urls`?
  // Let's check the previous step. Ah, in step 3 I told you to append `image_urls`.
  // So we grab it here:
  
  // If you used my previous code exactly:
  // formData.append('images', images) -> This passes array of strings if using Supabase client directly,
  // BUT for Server Actions, we need to be careful.
  
  // Let's assume the previous client component passed "images" as an array of strings.
  // In a Server Action with FormData, arrays are tricky.
  // SAFE WAY: In the client component, we passed the whole object to .insert() directly using client-side supabase.
  // WAIT! Your previous component code (AddAssetPage) was using CLIENT-SIDE Supabase to insert directly.
  // If you stick with CLIENT-SIDE insert (which your last pasted code did), you don't actually use this action.
  
  // HOWEVER, if you switched to the `handleSubmit` that calls `createVehicle(formData)` (my recommendation),
  // then we need this code here.
  
  // Let's standardize on the Server Action approach for safety.
  
  // 1. Get images from form data. 
  // In the client component `handleSubmit`, ensure you do: formData.append('image_urls', JSON.stringify(images))
  const image_urls = formData.get('image_urls') as string
  const images = image_urls ? JSON.parse(image_urls) : []
  
  // Specs Logic
  const specs = category === 'car' 
      ? { transmission: transmission } 
      : { 
          tonnage: formData.get('tonnage'), 
          usage_hours: formData.get('usage_hours'),
          reach: formData.get('reach')
        }

  const { error } = await supabase.from('fleet').insert({
    tenant_id: profile.tenant_id,
    category,
    make,
    model,
    year,
    daily_rate_omr: price,
    description,
    images, // Save the array
    specs,
    transmission: category === 'car' ? transmission : null,
    is_available: true,
    features: (formData.get('features') as string)?.split(',').map(s => s.trim()) || []
  })

  if (error) return { error: error.message }

  revalidatePath('/vendor/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}