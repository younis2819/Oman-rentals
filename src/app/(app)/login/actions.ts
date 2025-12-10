'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Sign In
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid credentials' }
  }

  // 2. Get User ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Auth failed' }

  // 3. Check Profile Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 4. SMART REDIRECT (UPDATED)
  if (profile?.role === 'super_admin') {
    redirect('/admin')
  } else if (profile?.role === 'owner') {
    redirect('/vendor/dashboard')
  } else {
    // Customers go to Marketplace to shop (instead of empty bookings page)
    revalidatePath('/', 'layout') // Force UI to update authentication state
    redirect('/') 
  }
}

// --- Sign Out Action ---
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}