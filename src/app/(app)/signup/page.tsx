'use client'

import { useState } from 'react'
import { signup } from './actions'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(event.currentTarget)
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center animate-in zoom-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 mb-6">
            You are now registered. Redirecting...
          </p>
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

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

          {/* NEW PHONE INPUT */}
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

          {/* Role Selection */}
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