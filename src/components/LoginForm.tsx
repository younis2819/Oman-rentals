'use client'

import { useState } from 'react'
import { login } from '@/app/(app)/login/actions'
import { Loader2, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react'

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
    <form action={handleSubmit} className="space-y-4">
      
      {/* Email Input */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Email Address</label>
        <div className="relative group">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="partner@company.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-black/5 focus:border-black/10 text-sm font-medium transition-all" 
            />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Password</label>
        <div className="relative group">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-black/5 focus:border-black/10 text-sm font-medium transition-all" 
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
                Login to Dashboard <ArrowRight className="w-4 h-4" />
            </>
        )}
      </button>

    </form>
  )
}