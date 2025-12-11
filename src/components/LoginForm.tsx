'use client'

import { useState } from 'react'
import { login } from '@/app/(app)/login/actions'
import { Loader2, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    
    // Server Action
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      
      {/* Email Input */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Email Address</label>
        <div className="relative group">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="you@example.com"
              // 👇 Added 'text-gray-900' for dark typing color
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-black/5 focus:border-black/10 text-sm font-bold text-gray-900 placeholder:text-gray-400 transition-all" 
            />
        </div>
      </div>

      {/* Password Input */}
      <div>
        {/* 👇 Flex container for Label + Forgot Password Link */}
        <div className="flex items-center justify-between mb-1 ml-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
        </div>

        <div className="relative group">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              // 👇 Added 'text-gray-900' here too
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-black/5 focus:border-black/10 text-sm font-bold text-gray-900 placeholder:text-gray-400 transition-all" 
            />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-black text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-black/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? (
            <>
                <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
            </>
        ) : (
            <>
                Sign In <ArrowRight className="w-4 h-4" />
            </>
        )}
      </button>

    </form>
  )
}