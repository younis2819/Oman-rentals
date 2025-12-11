'use client'

import { useState } from 'react'
// 👇 FIX 1: Import the correct function name
import { createCompany } from './actions'
import { Loader2, CheckCircle, Building2, MapPin, FileText, Phone, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ListYourCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    // 👇 FIX 2: Call the correct function
    const result = await createCompany(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Success! Redirect to dashboard
      router.push('/vendor/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <Link href="/" className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
        &larr; Back to Marketplace
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-blue-50/50 border border-gray-100 w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Application</h1>
            <p className="text-gray-500 text-sm">Join Oman's #1 verified car rental network.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-gray-400" /> Company Name
              </label>
              <input 
                name="companyName" 
                placeholder="e.g. Salalah Tours" 
                required 
                minLength={3}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Note: CR Number is not currently saved in actions.ts, but kept for UI completeness if you add it later */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-gray-400" /> CR Number
              </label>
              <input 
                name="crNumber" 
                placeholder="e.g. 1234567" 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-gray-400" /> WhatsApp Number
              </label>
              {/* 👇 FIX 3: Changed name="phone" to "whatsapp" to match actions.ts */}
              <input 
                name="whatsapp" 
                type="tel"
                placeholder="968 9999 9999" 
                required 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-gray-400" /> Email Address
              </label>
              <input 
                name="email" 
                type="email"
                placeholder="manager@company.com" 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" /> Main Office Location
            </label>
            <input 
              name="address" 
              placeholder="e.g. Building 4, Al Khuwair, Muscat" 
              required 
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit Application'}
            </button>
          </div>
          
          <p className="text-xs text-center text-gray-400">
            By applying, you verify that you hold a valid commercial license in Oman.
          </p>
        </form>
      </div>
    </div>
  )
}