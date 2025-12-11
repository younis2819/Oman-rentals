import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ✅ Correct Syntax: Function call with parentheses
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // ✅ Correct Syntax: Redirect to login with error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=CouldNotVerify`)
}