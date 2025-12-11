'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. DELETE CAR (Safe URL Parsing) ---
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

  // 3. Clean up Storage (Robust Parsing)
  if (car?.images && Array.isArray(car.images) && car.images.length > 0) {
    const filesToDelete = car.images.map((url: string) => {
        // Extract filename safely, ignoring query params
        return url.split('/').pop()?.split('?')[0]
    }).filter((name): name is string => !!name)

    if (filesToDelete.length > 0) {
        await supabase.storage.from('fleet-images').remove(filesToDelete)
    }
  }

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

  revalidatePath('/', 'layout')
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
    
    // Validate Price
    if (!finalPrice || finalPrice <= 0) {
        return { error: 'Invalid price amount' }
    }
    
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

// --- 5. CREATE VEHICLE (Validated & Clean) ---
export async function createVehicle(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) return { error: 'Unauthorized' }

  // Extract & Validate Data
  const category = formData.get('category')
  const make = formData.get('make')
  const model = formData.get('model')
  const year = Number(formData.get('year'))
  const price = Number(formData.get('daily_rate_omr'))
  const description = formData.get('description') as string
  const transmission = formData.get('transmission')
  
  // Validation
  const currentYear = new Date().getFullYear()
  if (isNaN(year) || year < 1900 || year > currentYear + 1) {
    return { error: 'Invalid year' }
  }
  if (isNaN(price) || price < 0) {
    return { error: 'Invalid price' }
  }

  // Handle Images (Safely parse JSON string from client)
  const image_urls = formData.get('image_urls') as string
  let images: string[] = []
  try {
      images = image_urls ? JSON.parse(image_urls) : []
  } catch (e) {
      console.error("Image parse error", e)
      images = []
  }
  
  // Specs Logic (Cleaned up duplication)
  // We only put 'extra' specs here. 'transmission' goes to its own column.
  const specs = category === 'car' 
      ? {} // No extra specs for cars, transmission is in column
      : { 
          tonnage: formData.get('tonnage'), 
          usage_hours: formData.get('usage_hours'),
          reach: formData.get('reach')
        }

  // Features Parsing (Safe)
  const featuresRaw = formData.get('features') as string
  const features = featuresRaw 
      ? featuresRaw.split(',').map(s => s.trim()).filter(Boolean) 
      : []

  const { error } = await supabase.from('fleet').insert({
    tenant_id: profile.tenant_id,
    category,
    make,
    model,
    year,
    daily_rate_omr: price,
    description,
    images, 
    specs,
    transmission: category === 'car' ? transmission : null,
    is_available: true,
    features
  })

  if (error) return { error: error.message }

  revalidatePath('/vendor/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}