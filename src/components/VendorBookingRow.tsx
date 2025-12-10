'use client'

import { MoreHorizontal, Truck } from 'lucide-react'
import VendorQuoteButton from './VendorQuoteButton'
import VendorBookingActions from './VendorBookingActions'
import Image from 'next/image'

export default function VendorBookingRow({ booking }: { booking: any }) {
  // Helpers
  const carName = booking.fleet ? `${booking.fleet.make} ${booking.fleet.model}` : 'Unknown Asset'
  const startDate = new Date(booking.start_date).toLocaleDateString()
  const endDate = new Date(booking.end_date).toLocaleDateString()
  
  // Logic: When do we show the Quote Button?
  const isPending = booking.status === 'pending'
  const needsQuote = booking.delivery_needed && isPending

  return (
    <div className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      
      {/* --- DESKTOP VIEW (Grid) --- */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center">
        
        {/* Col 1: Asset & Customer */}
        <div className="col-span-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative">
                 {booking.fleet?.images?.[0] && (
                    <Image src={booking.fleet.images[0]} alt="car" fill className="object-cover" sizes="40px" />
                 )}
              </div>
              <div>
                 <p className="font-bold text-gray-900 text-sm">{carName}</p>
                 <p className="text-xs text-gray-500">Ref: #{booking.id.slice(0,6).toUpperCase()}</p>
              </div>
           </div>
           {booking.delivery_needed && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 w-fit px-2 py-0.5 rounded-full">
                 <Truck className="w-3 h-3" /> Delivery: {booking.delivery_address}
              </div>
           )}
        </div>

        {/* Col 2: Dates */}
        <div className="col-span-3 text-sm text-gray-600">
           <p>{startDate} <span className="text-gray-300">→</span> {endDate}</p>
        </div>

        {/* Col 3: Status */}
        <div className="col-span-2">
           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize
              ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                booking.status === 'confirmed' || booking.status === 'paid' ? 'bg-green-100 text-green-700' :
                booking.status === 'quote_sent' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'}
           `}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                  booking.status === 'pending' ? 'bg-yellow-500' : 'bg-current'
              }`} />
              {booking.status === 'quote_sent' ? 'Quote Sent' : booking.status}
           </span>
        </div>

        {/* Col 4: Price & Actions */}
        <div className="col-span-3 flex items-center justify-end gap-4">
           <p className="font-bold text-gray-900 text-sm">{booking.total_price_omr} OMR</p>
           
           <div className="w-32">
             {needsQuote ? (
                <VendorQuoteButton booking={booking} />
             ) : (
                booking.status === 'pending' ? (
                  <VendorBookingActions bookingId={booking.id} status={booking.status} customerPhone={booking.customer_phone} />
                ) : (
                  <button className="text-gray-400 hover:text-black p-2 ml-auto block">
                     <MoreHorizontal className="w-5 h-5" />
                  </button>
                )
             )}
           </div>
        </div>
      </div>

      {/* --- MOBILE VIEW (Stacked) --- */}
      <div className="md:hidden p-4 flex flex-col gap-4">
          <div className="flex justify-between items-start">
             <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative">
                   {booking.fleet?.images?.[0] && <Image src={booking.fleet.images[0]} alt="car" fill className="object-cover" sizes="48px" />}
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">{carName}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                          ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}
                      `}>
                         {booking.status}
                      </span>
                      <span className="text-xs text-gray-500">{startDate}</span>
                   </div>
                </div>
             </div>
             <p className="font-black text-gray-900">{booking.total_price_omr} OMR</p>
          </div>
          
          {/* Mobile Actions Area */}
          {(needsQuote || isPending) && (
             <div className="pt-3 border-t border-gray-50">
                {needsQuote ? (
                   <VendorQuoteButton booking={booking} />
                ) : (
                   <VendorBookingActions bookingId={booking.id} status={booking.status} customerPhone={booking.customer_phone} />
                )}
             </div>
          )}
      </div>

    </div>
  )
}