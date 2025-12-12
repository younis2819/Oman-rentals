'use client'

import { Clock, ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Verification in Progress</h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your company profile is currently under review by our admin team. This usually takes <strong>1-2 business hours</strong>.
        </p>

        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 mb-8 flex items-start gap-3 text-left">
           <Building2 className="w-5 h-5 shrink-0 mt-0.5" />
           <p>We are verifying your commercial registration details. You will receive a WhatsApp message once approved.</p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
          >
            Return to Home
          </Link>
          
          <div className="flex justify-center">
             <SignOutButton />
          </div>
        </div>

      </div>
    </div>
  )
}