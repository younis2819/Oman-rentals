'use server'

import { createClient } from '@/utils/supabase/server'
// ❌ REMOVED: import { redirect } from 'next/navigation' (We handle this on client now)

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string 

  // 1. Sign Up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: role
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // 2. Create Profile (Redundant with Trigger, but safe to keep)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        role: role === 'owner' ? 'owner' : 'customer',
        full_name: fullName,
        phone: phone,
      })
      // Ignore duplicates if trigger ran first
      .select() 
  }

  // 3. 👇 NEW LOGIC: Return status instead of redirecting
  
  // Case A: Email Confirmation is ON (Session is null, User exists)
  if (data.user && !data.session) {
    return { success: true, verify: true }
  }

  // Case B: Email Confirmation is OFF (Session exists, Auto-login)
  if (data.session) {
    return { success: true, verify: false, role: role }
  }

  return { error: "Unknown state. Please try logging in." }
}