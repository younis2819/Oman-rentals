'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, AlertCircle, Truck, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { checkAvailability, createBooking } from '@/app/actions' // Ensure this path is correct based on your folder structure
import Link from 'next/link'

export default function BookingWidget({ 
  carId, 
  tenantId, 
  carName, 
  rate, 
  primaryColor,
  vendorPhone,
  currentUser 
}: { 
  carId: string, 
  tenantId: string, 
  carName: string, 
  rate: number, 
  primaryColor: string,
  vendorPhone: string,
  currentUser?: { name: string, phone: string } | null
}) {
  const router = useRouter()
  const [dates, setDates] = useState({ start: '', end: '' })
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'busy' | 'submitting'>('idle')
  
  // NEW: Delivery State
  const [deliveryNeeded, setDeliveryNeeded] = useState(false)
  const [address, setAddress] = useState('')

  const handleCheck = async () => {
    if (!dates.start || !dates.end) return
    
    // Sanity Check
    const startObj = new Date(dates.start)
    const endObj = new Date(dates.end)
    
    if (endObj <= startObj) {
      alert('End date must be after start date!')
      setDates(prev => ({ ...prev, end: '' })) 
      return
    }

    setStatus('checking')
    const result = await checkAvailability(carId, dates.start, dates.end)
    setStatus(result.available ? 'available' : 'busy')
  }

  const handleBooking = async () => {
    // Safety check: Should not be clickable if no user
    if (!currentUser) return 

    // Calculate Estimated Total for UI display only (Server does real math)
    const start = new Date(dates.start)
    const end = new Date(dates.end)
    const diffMs = end.getTime() - start.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) || 1
    const total = days * rate

    setStatus('submitting')

    const formData = new FormData()
    formData.append('carId', carId)
    formData.append('tenantId', tenantId)
    formData.append('startDate', dates.start)
    formData.append('endDate', dates.end)
    formData.append('dailyRate', rate.toString()) // Backend needs this to calculate price
    formData.append('customerName', currentUser.name)
    formData.append('customerPhone', currentUser.phone)
    
    // NEW: Delivery Data
    formData.append('deliveryNeeded', deliveryNeeded.toString())
    formData.append('deliveryAddress', address)

    const result = await createBooking(formData)

    if (!result.success) {
      alert(result.error || 'Something went wrong. Please try again.')
      setStatus('available')
      return
    }

    // --- THE FORK: Paymob vs Quote ---

    // 1. Redirect to Paymob (Self Pickup)
    if (result.paymentRequired && result.paymentToken) {
        // Use your Test Frame ID from .env
        const frameId = process.env.NEXT_PUBLIC_PAYMOB_FRAME_ID 
        window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${frameId}?payment_token=${result.paymentToken}`
        return
    }

    // 2. Quote Request (Delivery Needed) - Go to Success Page
    // We append a flag so the success page can show "Waiting for Quote" text
    router.push(`/booking/success?id=${result.bookingId}&status=quote_requested`)
    setStatus('idle') 
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-4">
      
      {/* Price Header */}
      <div className="mb-6">
         <span className="text-3xl font-black text-gray-900">{rate} <span className="text-sm font-medium text-gray-500">OMR / day</span></span>
      </div>

      <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Select Dates</h3>
      
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start</label>
          <input 
            type="date" 
            value={dates.start}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2"
            style={{ '--tw-ring-color': primaryColor } as any}
            onChange={(e) => {
              setDates(prev => ({ ...prev, start: e.target.value }))
              setStatus('idle')
            }}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End</label>
          <input 
            type="date" 
            value={dates.end}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2"
            style={{ '--tw-ring-color': primaryColor } as any}
            onChange={(e) => {
              setDates(prev => ({ ...prev, end: e.target.value }))
              setStatus('idle')
            }}
          />
        </div>
      </div>

      {status === 'idle' && (
        <button 
          onClick={handleCheck}
          disabled={!dates.start || !dates.end}
          className="w-full py-4 rounded-xl font-bold text-white shadow-sm disabled:opacity-50 transition-all active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          Check Availability
        </button>
      )}

      {status === 'checking' && (
        <button disabled className="w-full py-4 rounded-xl bg-gray-100 text-gray-500 font-bold flex justify-center items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Checking...
        </button>
      )}

      {status === 'busy' && (
        <div className="w-full py-4 rounded-xl bg-red-50 text-red-600 font-bold flex justify-center items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5" /> Not Available
        </div>
      )}

      {(status === 'available' || status === 'submitting') && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold mb-4 flex items-center gap-2 border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Available!
          </div>

          {/* --- NEW: DELIVERY TOGGLE --- */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <Truck className="w-4 h-4 text-gray-600" />
                   <span className="text-sm font-bold text-gray-900">Need Delivery?</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={deliveryNeeded}
                  onChange={(e) => setDeliveryNeeded(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer" 
                />
             </div>
             
             {deliveryNeeded && (
               <div className="mt-3 animate-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Site Address / Location</label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                     <div className="p-3 bg-gray-100 border-r border-gray-300"><MapPin className="w-4 h-4 text-gray-500"/></div>
                     <input 
                       type="text" 
                       placeholder="e.g. Muscat, Al Khoud, Site #4"
                       className="w-full p-2 text-sm outline-none"
                       value={address}
                       onChange={(e) => setAddress(e.target.value)}
                     />
                  </div>
                  <p className="text-[10px] text-orange-600 mt-2 font-medium">
                     * Vendor will quote delivery fee separately.
                  </p>
               </div>
             )}
          </div>

          {/* LOGIC SPLIT: Registered vs Guest */}
          {currentUser ? (
             <div className="space-y-4">
                {/* 1. Show Summary */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 text-xs font-bold uppercase">Booking As</span>
                        <Link href="/profile" className="text-blue-600 text-xs hover:underline">Change</Link>
                    </div>
                    <p className="font-bold text-gray-900 text-base">{currentUser.name}</p>
                    <p className="text-gray-600">{currentUser.phone}</p>
                </div>

                {/* 2. Confirm Button (UPDATED UI) */}
                <button 
                    onClick={handleBooking}
                    disabled={status === 'submitting' || (deliveryNeeded && !address)}
                    className="w-full py-4 rounded-xl text-white font-bold flex justify-center items-center gap-2 shadow-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'black' }}
                >
                    {status === 'submitting' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                    <>
                        {deliveryNeeded ? (
                            <><CheckCircle className="w-5 h-5" /> Request Quote</>
                        ) : (
                            <><CheckCircle className="w-5 h-5" /> Pay Now</>
                        )}
                    </>
                    )}
                </button>
             </div>
          ) : (
            /* 3. Force Login (No Guest Checkout) */
            <div className="text-center p-6 border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-600 mb-4 font-medium">To finalize your booking, please log in.</p>
                <Link 
                    href="/login"
                    className="block w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all shadow-sm text-center"
                >
                    Login to Continue
                </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}