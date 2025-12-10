'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Settings, User } from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()
  
  // Only show for vendor pages
  if (!pathname.includes('/vendor')) return null

  const isActive = (path: string) => pathname === path

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
      <Link href="/vendor/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/vendor/dashboard') ? 'text-black' : 'text-gray-400'}`}>
        <LayoutDashboard className="w-6 h-6" />
        <span className="text-[10px] font-bold">Home</span>
      </Link>

      <Link href="/vendor/fleet" className={`flex flex-col items-center gap-1 ${isActive('/vendor/fleet') ? 'text-black' : 'text-gray-400'}`}>
        <Car className="w-6 h-6" />
        <span className="text-[10px] font-bold">Fleet</span>
      </Link>

      <Link href="/vendor/settings" className={`flex flex-col items-center gap-1 ${isActive('/vendor/settings') ? 'text-black' : 'text-gray-400'}`}>
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-bold">Settings</span>
      </Link>
      
      {/* Profile/Logout Placeholder */}
      <Link href="/vendor/profile" className={`flex flex-col items-center gap-1 ${isActive('/vendor/profile') ? 'text-black' : 'text-gray-400'}`}>
        <User className="w-6 h-6" />
        <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </div>
  )
}