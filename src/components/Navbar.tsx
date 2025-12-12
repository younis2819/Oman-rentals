import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Car, LayoutDashboard, User, Loader2, Building2 } from 'lucide-react'
import SignOutButton from './SignOutButton'

export default async function Navbar() {
  const cookieStore = await cookies()

  // 1. Robust Supabase Client
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

  // 2. Fetch User & Role Data
  const { data: { user } } = await supabase.auth.getUser()

  let isOwner = false
  let isActiveVendor = false
  let isPendingVendor = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id, tenants(status)')
      .eq('id', user.id)
      .maybeSingle()

    if (profile) {
      // Safe access to joined tenant data
      // @ts-ignore
      const tenant = Array.isArray(profile.tenants) ? profile.tenants[0] : profile.tenants
      const tenantStatus = tenant?.status

      isOwner = profile.role === 'owner' && !!profile.tenant_id
      isActiveVendor = isOwner && tenantStatus === 'active'
      isPendingVendor = isOwner && tenantStatus !== 'active'
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
           <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-black transition-colors">
              <Car className="w-5 h-5" />
           </div>
           <span className="font-black text-xl tracking-tighter text-gray-900">
             OMAN<span className="text-blue-600 group-hover:text-black transition-colors">RENTALS</span>
           </span>
        </Link>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-4">
            
            {!user ? (
                /* SCENARIO A: GUEST */
                <>
                   <Link href="/list-your-car" className="hidden sm:block text-sm font-bold text-gray-500 hover:text-black transition-colors">
                      List Your Fleet
                   </Link>
                   <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
                   <Link href="/login" className="px-5 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all shadow-sm">
                      Login
                   </Link>
                </>
            ) : isPendingVendor ? (
                /* SCENARIO B: PENDING VENDOR */
                <>
                   <Link 
                      href="/vendor/pending" 
                      className="flex items-center gap-2 text-sm font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full hover:bg-yellow-100 transition-all animate-pulse"
                   >
                      <Loader2 className="w-4 h-4 animate-spin" /> Application Under Review
                   </Link>
                   <div className="h-6 w-px bg-gray-200"></div>
                   <SignOutButton />
                </>
            ) : isActiveVendor ? (
                /* SCENARIO C: ACTIVE VENDOR */
                <>
                   <span className="hidden md:inline text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      Vendor Mode
                   </span>
                   <Link 
                      href="/vendor/dashboard" 
                      className="flex items-center gap-2 text-sm font-bold text-white bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition-all shadow-md"
                   >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                   </Link>
                   <div className="h-6 w-px bg-gray-200"></div>
                   <SignOutButton />
                </>
            ) : (
                /* SCENARIO D: CUSTOMER */
                <>
                   <Link href="/list-your-car" className="hidden sm:inline text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wide">
                      Partner with us
                   </Link>
                   <Link 
                      href="/my-bookings" 
                      className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-white border border-gray-200 px-4 py-2 rounded-full hover:border-black transition-all"
                   >
                      <User className="w-4 h-4" /> My Trips
                   </Link>
                   <div className="h-6 w-px bg-gray-200"></div>
                   <SignOutButton />
                </>
            )}

        </div>
      </div>
    </nav>
  )
}