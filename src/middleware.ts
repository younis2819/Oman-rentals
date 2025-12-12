import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Refresh session
  const response = await updateSession(request)
  const url = request.nextUrl.clone()

  // 2. Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  // 3. Get user
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Helper: redirect to login with ?next=
  const redirectToLogin = () => {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', url.pathname + url.search)
    return NextResponse.redirect(loginUrl)
  }

  // 5. Fetch profile + tenant in ONE query (if logged in)
  let profile: { role: string | null; tenant_id: string | null } | null = null
  let tenantStatus: string | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, tenant_id, tenants(status)')
      .eq('id', user.id)
      .maybeSingle()

    if (data) {
      profile = { role: data.role, tenant_id: data.tenant_id }
      // Handle the join safely (could be array or object depending on Supabase version)
      const tenant = Array.isArray(data.tenants) ? data.tenants[0] : data.tenants
      // @ts-ignore
      tenantStatus = tenant?.status ?? null
    }
  }

  // 6. Define user states
  const isAdmin = profile?.role === 'super_admin'
  const isOwner = profile?.role === 'owner' && !!profile?.tenant_id
  const isActiveVendor = isOwner && tenantStatus === 'active'
  const isPendingVendor = isOwner && tenantStatus !== 'active'

  // 7. PROTECT: /admin routes
  if (url.pathname.startsWith('/admin')) {
    if (!user) return redirectToLogin()
    if (!isAdmin) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // 8. PROTECT: /vendor routes
  if (url.pathname.startsWith('/vendor')) {
    if (!user) return redirectToLogin()

    // Admins can access vendor routes for debugging
    if (isAdmin) return response

    // Not a vendor at all -> send to become a vendor page
    if (!isOwner) {
      url.pathname = '/list-your-car' 
      return NextResponse.redirect(url)
    }

    // Vendor exists but not approved
    // Allow settings page and pending page, block dashboard until active
    const allowedForPending = ['/vendor/settings', '/vendor/pending']
    const isAllowedRoute = allowedForPending.some(path => url.pathname.startsWith(path))

    if (isPendingVendor && !isAllowedRoute) {
      url.pathname = '/vendor/pending' 
      return NextResponse.redirect(url)
    }
  }

  // 9. REDIRECT: Logged-in users away from login/signup
  if ((url.pathname === '/login' || url.pathname === '/signup') && user) {
    // Check for ?next= parameter first
    const next = request.nextUrl.searchParams.get('next')
    if (next && !next.startsWith('/login') && !next.startsWith('/signup')) {
      url.pathname = next
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Default redirects based on role
    if (isAdmin) {
      url.pathname = '/admin'
    } else if (isActiveVendor) {
      url.pathname = '/vendor/dashboard'
    } else if (isPendingVendor) {
      url.pathname = '/vendor/pending'
    } else {
      url.pathname = '/'
    }
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}