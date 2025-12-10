import LoginForm from '@/components/LoginForm'
import HomeButton from '@/components/HomeButton'
import Link from 'next/link'
import { Car } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans relative overflow-hidden">
      
      {/* Background Decor (Subtle Gradients) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl" />

      {/* 1. THE ESCAPE HATCH */}
      <div className="absolute top-6 left-6 z-10">
        <HomeButton />
      </div>

      {/* 2. THE LOGIN CARD */}
      <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-gray-200/50 border border-white relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-4 shadow-lg shadow-gray-200">
             <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Enter your details to manage your fleet.
          </p>
        </div>

        {/* The Form */}
        <LoginForm />

        {/* Register Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
            New to Oman Rentals?
          </p>
          <Link 
            href="/signup" 
            className="block w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:border-black hover:text-black hover:bg-gray-50 transition-all"
          >
            Apply as a Partner
          </Link>
        </div>

      </div>
    </div>
  )
}