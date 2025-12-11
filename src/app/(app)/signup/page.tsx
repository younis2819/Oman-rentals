'use client'

import { useState } from 'react'
import { signup } from './actions'
import { Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 👇 NEW: Specific state for "Check Email" screen
  const [showVerify, setShowVerify] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(event.currentTarget)
    const result = await signup(formData)
    
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.verify) {
      // 🛑 STOP: Show "Check Email" screen
      setShowVerify(true)
    } else if (result?.success) {
      // 🚀 GO: Auto-redirect if no verification needed
      if (result.role === 'owner') router.push('/list-your-car')
      else router.push('/')
    }
  }

  // 👇 1. THE "CHECK YOUR EMAIL" SCREEN
  if (showVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center animate-in zoom-in">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your Email</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            We sent a verification link to your inbox.<br/>
            Please click it to activate your account.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-400 mb-6">
             Can't find it? Check your Spam folder.
          </div>
          <Link href="/login" className="block w-full py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all">
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  // 👇 2. THE FORM (Standard)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-6">Create Account</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input name="fullName" required className="w-full p-3 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input name="phone" type="tel" required className="w-full p-3 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="968 9000 0000" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full p-3 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="you@example.com" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full p-3 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
          </div>

          <div className="pt-2">
             <label className="block text-sm font-bold text-gray-700 mb-2">I am a:</label>
             <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                   <input type="radio" name="role" value="customer" defaultChecked className="peer sr-only" />
                   <div className="p-3 rounded-lg border border-gray-200 text-center text-sm font-medium text-gray-500 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all">
                      Customer
                   </div>
                </label>
                <label className="flex-1 cursor-pointer">
                   <input type="radio" name="role" value="owner" className="peer sr-only" />
                   <div className="p-3 rounded-lg border border-gray-200 text-center text-sm font-medium text-gray-500 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 transition-all">
                      Vendor
                   </div>
                </label>
             </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center transition-colors shadow-lg mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}