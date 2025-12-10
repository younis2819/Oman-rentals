import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Car, LayoutDashboard, User, LogOut } from 'lucide-react'
import SignOutButton from './SignOutButton'

export default async function Navbar() {
  const supabase = await createClient()

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Determine Role (Default: Customer)
  let isVendor = false
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    
    // If they have a tenant_id, they are a Vendor
    if (profile?.tenant_id) {
        isVendor = true
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* LOGO (Clicking this always goes to Homepage) */}
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
                /* SCENARIO A: GUEST (Not Logged In) */
                <>
                   <Link href="/signup" className="hidden sm:block text-sm font-bold text-gray-500 hover:text-black transition-colors">
                      List Your Fleet
                   </Link>
                   <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
                   <Link href="/login" className="px-5 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all shadow-sm">
                      Login
                   </Link>
                </>
            ) : isVendor ? (
                /* SCENARIO B: VENDOR (Show Dashboard) */
                <>
                   <span className="hidden md:inline text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      Vendor Mode
                   </span>
                   <Link 
                      href="/vendor/dashboard" 
                      className="flex items-center gap-2 text-sm font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-all"
                   >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                   </Link>
                   <div className="h-6 w-px bg-gray-200"></div>
                   <SignOutButton />
                </>
            ) : (
                /* SCENARIO C: CUSTOMER (Show My Trips) */
                <>
                   <Link href="/signup" className="hidden sm:inline text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wide">
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