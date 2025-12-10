'use client'

import { useState } from 'react'
import { Send, Loader2, X, Calculator } from 'lucide-react'
import { sendQuote } from '@/app/(app)/vendor/dashboard/actions' 
import { toast } from 'sonner' // <--- The new Notification system

export default function VendorQuoteButton({ booking }: { booking: any }) {
  const [isOpen, setIsOpen] = useState(false)
  // Pre-fill with current price if available, else empty
  const [price, setPrice] = useState(booking.total_price_omr?.toString() || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!price) return

    setLoading(true)
    // Call the server action
    const result = await sendQuote(booking.id, parseFloat(price))
    setLoading(false)

    if (result?.error) {
      toast.error(result.error) // <--- Red Error Toast
    } else {
      toast.success('Quote sent to customer!') // <--- Green Success Toast
      setIsOpen(false)
    }
  }

  // 1. CLOSED STATE (Just the button)
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-sm active:scale-95"
      >
        <Calculator className="w-3 h-3" /> Calculate & Send Quote
      </button>
    )
  }

  // 2. OPEN STATE (The Inline Form)
  return (
    <div className="mt-3 bg-white border border-blue-100 shadow-md rounded-xl p-3 animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
       {/* Decorative gradient background opacity */}
       <div className="absolute inset-0 bg-blue-50/50 pointer-events-none" />

       <div className="relative z-10">
           <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-900">Enter Total Price (OMR)</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black bg-white rounded-full p-1 hover:bg-gray-100 transition-colors">
                 <X className="w-3.5 h-3.5" />
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">OMR</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 150" 
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    autoFocus
                  />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                 {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                 Send
              </button>
           </form>
           <p className="text-[10px] text-blue-400 mt-2 font-medium">
              * Includes delivery & fees. Customer will receive a payment link.
           </p>
       </div>
    </div>
  )
}