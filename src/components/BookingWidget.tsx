'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, AlertCircle, Truck, MapPin, User, Phone, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { checkAvailability, createBooking } from '@/app/actions'
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
  
  // Delivery State
  const [deliveryNeeded, setDeliveryNeeded] = useState(false)
  const [address, setAddress] = useState('')

  // 👇 NEW: Guest Details State
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const handleCheck = async () => {
    if (!dates.start || !dates.end) return
    
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
    // 1. Validation Logic
    const finalName = currentUser?.name || guestName
    const finalPhone = currentUser?.phone || guestPhone
    const finalEmail = guestEmail // Only used if guest

    // If guest, ensure all fields are filled
    if (!currentUser && (!finalName || !finalPhone || !finalEmail)) {
        alert("Please fill in all your details to continue.")
        return
    }

    if (deliveryNeeded && !address) {
        alert("Please enter a delivery address.")
        return
    }

    setStatus('submitting')

    const formData = new FormData()
    formData.append('carId', carId)
    formData.append('tenantId', tenantId)
    formData.append('startDate', dates.start)
    formData.append('endDate', dates.end)
    formData.append('dailyRate', rate.toString())
    
    // 👇 NEW: Handle User vs Guest Data
    formData.append('customerName', finalName)
    formData.append('customerPhone', finalPhone)
    if (!currentUser) {
        formData.append('customerEmail', finalEmail) // Pass email to actions for Resend
    }
    
    formData.append('deliveryNeeded', deliveryNeeded.toString())
    formData.append('deliveryAddress', address)

    const result = await createBooking(formData)

    if (!result.success) {
      alert(result.error || 'Something went wrong. Please try again.')
      setStatus('available')
      return
    }

    // Redirect Logic
    if (result.paymentRequired && result.paymentToken) {
        const frameId = process.env.NEXT_PUBLIC_PAYMOB_FRAME_ID 
        window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${frameId}?payment_token=${result.paymentToken}`
        return
    }

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

          {/* --- DELIVERY TOGGLE --- */}
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

          {/* 👇 GUEST / USER FORM SECTION */}
          <div className="space-y-4">
               {currentUser ? (
                   // LOGGED IN USER VIEW
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-gray-500 text-xs font-bold uppercase">Booking As</span>
                           <Link href="/profile" className="text-blue-600 text-xs hover:underline">Change</Link>
                       </div>
                       <p className="font-bold text-gray-900 text-base">{currentUser.name}</p>
                       <p className="text-gray-600">{currentUser.phone}</p>
                   </div>
               ) : (
                   // GUEST INPUT VIEW
                   <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <h4 className="text-sm font-bold text-gray-900 mb-2">Your Details</h4>
                       
                       <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                           <div className="p-2.5 bg-gray-100 border-r border-gray-300"><User className="w-4 h-4 text-gray-400"/></div>
                           <input 
                               type="text" 
                               placeholder="Full Name" 
                               className="w-full p-2 text-sm outline-none"
                               value={guestName}
                               onChange={e => setGuestName(e.target.value)}
                           />
                       </div>

                       <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                           <div className="p-2.5 bg-gray-100 border-r border-gray-300"><Phone className="w-4 h-4 text-gray-400"/></div>
                           <input 
                               type="text" 
                               placeholder="WhatsApp Number" 
                               className="w-full p-2 text-sm outline-none"
                               value={guestPhone}
                               onChange={e => setGuestPhone(e.target.value)}
                           />
                       </div>

                       <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                           <div className="p-2.5 bg-gray-100 border-r border-gray-300"><Mail className="w-4 h-4 text-gray-400"/></div>
                           <input 
                               type="email" 
                               placeholder="Email Address (for receipt)" 
                               className="w-full p-2 text-sm outline-none"
                               value={guestEmail}
                               onChange={e => setGuestEmail(e.target.value)}
                           />
                       </div>
                   </div>
               )}

               <button 
                   onClick={handleBooking}
                   disabled={status === 'submitting'}
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
          
        </div>
      )}
    </div>
  )
}