import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `request` object contains the URL from the email link
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // "next" is where they go after login (e.g., /reset-password)
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    
    // 🔏 This exchanges the secret code for a real User Session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ✅ Success! Log them in and send them to the next page
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // ❌ Error? Send them back to login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=CouldNotVerify`)
}