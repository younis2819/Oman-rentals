import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Run the standard Supabase session refresh (Keeps your existing logic safe)
  // This handles the cookies and returns the response we will eventually send.
  const response = await updateSession(request)

  // 2. Create a lightweight client to check "Who is this user?"
  // We need this because updateSession returns a Response, not the User object.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // We don't need to set cookies here because updateSession already did it.
          // This is just to satisfy the TypeScript interface.
        },
      },
    }
  )

  // 3. Get the User
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. SECURITY RULES
  const url = request.nextUrl.clone()

  // RULE A: Protect Vendor Routes
  // If user tries to go to /vendor/... and is NOT logged in -> Send to Login
  if (url.pathname.startsWith('/vendor') && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // RULE B: Redirect Logged-in Users away from Login/Signup
  // If user is ALREADY logged in and goes to /login -> Send to Vendor Dashboard
  if ((url.pathname === '/login' || url.pathname === '/signup') && user) {
    url.pathname = '/vendor/dashboard' // Or '/' if you prefer
    return NextResponse.redirect(url)
  }

  // 5. Return the response (with the refreshed cookies from step 1)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}