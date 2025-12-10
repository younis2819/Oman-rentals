'use client'

import { useState } from 'react'
import { payForBooking } from '@/app/(app)/my-bookings/actions'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner' // <--- Import Sonner

export default function PayButton({ bookingId, amount }: { bookingId: string, amount: number }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    
    // Call your Server Action
    const result = await payForBooking(bookingId)
    
    if (result?.paymentToken) {
       // Success! Let the user know we are moving them
       toast.loading('Redirecting to secure payment gateway...')
       
       const frameId = process.env.NEXT_PUBLIC_PAYMOB_FRAME_ID 
       window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${frameId}?payment_token=${result.paymentToken}`
    } else {
       // Failure
       toast.error('Payment Error: ' + (result?.error || 'Unknown error occurred'))
       setLoading(false)
    }
  }

  return (
    <button 
      onClick={handlePay}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
      Pay {amount} OMR
    </button>
  )
}