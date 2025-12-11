'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    
    // Updates the password for the CURRENTLY logged in user
    // (The magic link from email already logged you in)
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Success! Send them to home
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Set New Password</h1>
        <p className="text-gray-500 mb-6 text-sm">Please enter your new secure password.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-gray-900 font-bold"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}