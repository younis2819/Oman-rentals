'use client'

import { useState } from 'react'
import { Check, X, Loader2, Phone, CheckCircle, XCircle } from 'lucide-react'
import { updateBookingStatus } from '@/app/(app)/vendor/dashboard/actions'
import { toast } from 'sonner' // <--- 1. Import Sonner

export default function VendorBookingActions({ 
  bookingId, 
  status,
  customerPhone 
}: { 
  bookingId: string, 
  status: string,
  customerPhone: string
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (newStatus: 'confirmed' | 'cancelled') => {
    // Optional: You can keep this check, or remove it for faster clicking
    if (!confirm(`Are you sure you want to ${newStatus} this booking?`)) return
    
    setIsUpdating(true)
    const result = await updateBookingStatus(bookingId, newStatus)
    setIsUpdating(false)

    if (result?.error) {
      // 2. Error Toast (Red)
      toast.error(result.error)
    } else {
      // 3. Success Toast (Green)
      const action = newStatus === 'confirmed' ? 'Accepted' : 'Rejected'
      toast.success(`Booking ${action} successfully`)
    }
  }

  // --- 1. IF ACCEPTED ---
  if (status === 'confirmed') {
    return (
      <div className="flex flex-col gap-2 w-full animate-in fade-in">
         <div className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 border border-gray-200">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Accepted
         </div>
         <a 
           href={`https://wa.me/${customerPhone}`} 
           target="_blank" 
           rel="noreferrer"
           className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-green-600 transition-colors"
         >
            <Phone className="w-3 h-3" /> WhatsApp
         </a>
      </div>
    )
  }

  // --- 2. IF REJECTED ---
  if (status === 'cancelled') {
    return (
      <div className="bg-gray-50 text-gray-400 px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 border border-gray-100 w-full animate-in fade-in">
         <XCircle className="w-3.5 h-3.5" /> Rejected
      </div>
    )
  }

  // --- 3. IF PAID ---
  if (status === 'paid') {
     return (
      <div className="flex flex-col gap-2 w-full animate-in fade-in">
        <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 border border-green-100 w-full">
           <CheckCircle className="w-3.5 h-3.5" /> Paid Online
        </div>
        <a 
           href={`https://wa.me/${customerPhone}`} 
           target="_blank" 
           rel="noreferrer"
           className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-green-600 transition-colors"
         >
            <Phone className="w-3 h-3" /> Contact
         </a>
      </div>
     )
  }

  // --- DEFAULT: ACTIONS ---
  return (
    <div className="flex items-center gap-2 w-full">
      
      {/* Accept Button: Solid Black (Premium) */}
      <button 
        onClick={() => handleUpdate('confirmed')}
        disabled={isUpdating}
        className="flex-1 bg-black text-white h-9 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 hover:bg-gray-800 hover:-translate-y-0.5 transition-all shadow-sm active:scale-95"
      >
        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Accept</>}
      </button>

      {/* Reject Button: Clean White (Subtle) */}
      <button 
        onClick={() => handleUpdate('cancelled')}
        disabled={isUpdating}
        className="h-9 px-3 bg-white text-gray-400 border border-gray-200 rounded-lg text-xs font-bold flex justify-center items-center hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
        title="Reject Booking"
      >
         {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
      </button>

    </div>
  )
}