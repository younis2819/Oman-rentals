'use client'

import { useState } from 'react'
import { MoreHorizontal, Truck, ChevronDown, MessageCircle, Phone, MapPin } from 'lucide-react'
import VendorBookingActions from './VendorBookingActions'
import Image from 'next/image'

export default function VendorBookingRow({ booking }: { booking: any }) {
  const [expanded, setExpanded] = useState(false)

  // Helpers
  const carName = booking.fleet ? `${booking.fleet.make} ${booking.fleet.model}` : 'Unknown Asset'
  const startDate = new Date(booking.start_date).toLocaleDateString('en-GB')
  const endDate = new Date(booking.end_date).toLocaleDateString('en-GB')
  
  // WhatsApp Link for Vendor -> Customer
  const waMessage = `Hi ${booking.customer_name}, I received your booking request for the ${carName}. regarding delivery...`
  const waLink = `https://wa.me/${booking.customer_phone}?text=${encodeURIComponent(waMessage)}`

  return (
    <div className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      
      {/* --- MAIN ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
        
        {/* Col 1: Asset & Customer */}
        <div className="col-span-12 md:col-span-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-200">
                 {booking.fleet?.images?.[0] && (
                    <Image src={booking.fleet.images[0]} alt="car" fill className="object-cover" sizes="40px" />
                 )}
              </div>
              <div>
                 <p className="font-bold text-gray-900 text-sm">{carName}</p>
                 <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">#{booking.id.slice(0,6).toUpperCase()}</p>
                    {/* MOBILE ONLY: Tiny status badge */}
                    <span className="md:hidden text-[10px] bg-gray-100 px-2 rounded-full">{booking.status}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Col 2: Dates & Logistics (Desktop) */}
        <div className="hidden md:block col-span-3">
           <p className="text-sm text-gray-600 font-medium">{startDate} <span className="text-gray-300">→</span> {endDate}</p>
           {booking.delivery_needed ? (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-full">
                 <Truck className="w-3 h-3" /> Delivery Req.
              </div>
           ) : (
              <div className="mt-1 text-[10px] text-gray-400">Self Pickup</div>
           )}
        </div>

        {/* Col 3: Status (Desktop) */}
        <div className="hidden md:block col-span-2">
           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize
              ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                booking.status === 'confirmed' || booking.status === 'paid' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-600'}
           `}>
              <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'pending' ? 'bg-yellow-500' : 'bg-current'}`} />
              {booking.status}
           </span>
        </div>

        {/* Col 4: Price & Expand */}
        <div className="col-span-12 md:col-span-3 flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0">
           <div className="flex items-center gap-2 md:hidden">
              {/* Mobile Date */}
              <span className="text-xs text-gray-500">{startDate}</span>
           </div>

           <div className="flex items-center gap-4">
               <p className="font-black text-gray-900 text-sm">{booking.total_price_omr} <span className="text-xs text-gray-400 font-normal">OMR</span></p>
               
               <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-bold text-gray-400 hover:text-black flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
               >
                  {expanded ? 'Close' : 'Details'} <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
               </button>
           </div>
        </div>
      </div>

      {/* --- EXPANDED DETAILS PANEL (The "Work Area") --- */}
      {expanded && (
         <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* LEFT: Customer Contact */}
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Contact</h4>
                  <div className="flex items-center gap-3">
                     <a href={waLink} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-green-600 transition-colors">
                        <MessageCircle className="w-4 h-4" /> WhatsApp Customer
                     </a>
                     <a href={`tel:${booking.customer_phone}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
                        <Phone className="w-4 h-4" /> Call
                     </a>
                  </div>
                  <div className="text-sm font-medium text-gray-900 pl-1">{booking.customer_name} • {booking.customer_phone}</div>
               </div>

               {/* RIGHT: Logistics & Actions */}
               <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logistics & Status</h4>
                  
                  {booking.delivery_needed ? (
                     <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                           <Truck className="w-3.5 h-3.5" /> Delivery Required
                        </div>
                        <div className="flex items-start gap-2 text-blue-900/80 text-xs">
                           <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                           {booking.delivery_address || 'No address provided'}
                        </div>
                     </div>
                  ) : (
                     <p className="text-xs text-gray-500 italic">Customer will pick up vehicle.</p>
                  )}

                  <div className="pt-2">
                     <VendorBookingActions bookingId={booking.id} status={booking.status} customerPhone={booking.customer_phone} />
                  </div>
               </div>

            </div>
         </div>
      )}

    </div>
  )
}