import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function TopNav() {
  const cookieStore = await cookies()

  // Create client directly for this component to ensure latest session check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let isOwner = false
  let isActiveVendor = false
  let isPendingVendor = false

  if (user) {
    // Single query to get everything we need
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id, tenants(status)')
      .eq('id', user.id)
      .single()

    if (profile) {
        // Safe access to the joined tenant data
        // @ts-ignore
        const tenant = Array.isArray(profile.tenants) ? profile.tenants[0] : profile.tenants
        const tenantStatus = tenant?.status

        isOwner = profile.role === 'owner' && !!profile.tenant_id
        isActiveVendor = isOwner && tenantStatus === 'active'
        isPendingVendor = isOwner && tenantStatus !== 'active'
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* 1. GUEST: Show 'List Your Fleet' (Sales) + 'Login' */}
      {!user && (
        <>
          <Link href="/list-your-car" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors hidden md:block">
            List Your Fleet
          </Link>
          <Link href="/login" className="px-5 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all">
            Login
          </Link>
        </>
      )}

      {/* 2. CUSTOMER (Logged in, but not a vendor): Show 'Become Partner' + 'My Bookings' */}
      {user && !isOwner && (
        <>
          <Link href="/list-your-car" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors hidden md:block">
            Become a Partner
          </Link>
          <Link href="/my-bookings" className="px-5 py-2 rounded-full bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition-all">
            My Bookings
          </Link>
        </>
      )}

      {/* 3. PENDING VENDOR: Show 'Status Check' */}
      {user && isPendingVendor && (
        <Link href="/vendor/pending" className="px-5 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold hover:bg-yellow-200 transition-all border border-yellow-200 flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" /> Status Check
        </Link>
      )}

      {/* 4. ACTIVE VENDOR: Show 'Dashboard' */}
      {user && isActiveVendor && (
        <Link href="/vendor/dashboard" className="px-5 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
          Vendor Dashboard
        </Link>
      )}
    </div>
  )
}