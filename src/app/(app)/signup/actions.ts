'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string // <--- NEW
  const role = formData.get('role') as string 

  // 1. Sign Up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone, // Save in metadata too just in case
        role: role
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // 2. Create Profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        role: role === 'owner' ? 'owner' : 'customer',
        full_name: fullName,
        phone: phone, // <--- SAVE PHONE HERE
      })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
    }
  }

  // 3. Smart Redirect
  if (data.session) {
    if (role === 'owner') {
      redirect('/list-your-car') 
    } else {
      redirect('/') 
    }
  }

  return { success: true }
}