'use client'

import { useState } from 'react'
import { sendQuote } from '@/app/(app)/vendor/dashboard/actions'
import { X, Loader2, Calculator } from 'lucide-react'

export default function QuoteModal({ 
  bookingId, 
  currentPrice, 
  isOpen, 
  onClose 
}: { 
  bookingId: string, 
  currentPrice: number, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [amount, setAmount] = useState(currentPrice)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    setLoading(true)
    await sendQuote(bookingId, Number(amount))
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Send Price Quote</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
            Final Total Price (OMR)
          </label>
          <div className="relative mb-2">
            <Calculator className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-lg font-black text-gray-900 focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Includes rental duration + delivery fees.
          </p>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-black text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-gray-800 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Quote to Customer'}
          </button>
        </div>

      </div>
    </div>
  )
}