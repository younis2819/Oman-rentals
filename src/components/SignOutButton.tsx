'use client'

import { createClient } from '@/utils/supabase/client'
import { LogOut } from 'lucide-react'

export default function SignOutButton({ className = "" }: { className?: string }) {
  const supabase = createClient()

  const handleSignOut = async () => {
    // 1. Tell Supabase to kill the session
    await supabase.auth.signOut()
    
    // 2. Force a HARD refresh to the login page
    // This wipes the browser memory and guarantees a clean slate
    window.location.href = '/login'
  }

  return (
    <button 
      onClick={handleSignOut}
      className={`flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  )
}