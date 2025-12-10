import Link from 'next/link'
import { CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

type Props = {
  searchParams: Promise<{ id: string; status?: string }>
}

export default async function SuccessPage(props: Props) {
  const searchParams = await props.searchParams
  const bookingId = searchParams.id
  const isQuoteRequest = searchParams.status === 'quote_requested'
  
  const supabase = await createClient()
  
  // Fetch booking details to show the car/machine name
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, fleet(make, model, images)')
    .eq('id', bookingId)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        
        {/* Icon based on Status */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isQuoteRequest ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
        }`}>
          {isQuoteRequest ? <Clock className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isQuoteRequest ? 'Request Received!' : 'Booking Confirmed!'}
        </h1>
        
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          {isQuoteRequest 
            ? "We've sent your delivery details to the vendor. They will calculate the transport fee and send you a final quote shortly."
            : "Your payment was successful. The vendor has been notified and will prepare your vehicle."
          }
        </p>

        {/* Order Summary Card */}
        {booking && (
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 text-left flex gap-4">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  {booking.fleet?.images?.[0] && (
                      <img src={booking.fleet.images[0]} className="w-full h-full object-cover" alt="Vehicle" />
                  )}
              </div>
              <div>
                  <h3 className="font-bold text-gray-900 text-sm">{booking.fleet?.make} {booking.fleet?.model}</h3>
                  <p className="text-xs text-gray-500 mt-1">Ref: #{booking.id.slice(0,8).toUpperCase()}</p>
              </div>
           </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/my-bookings" 
            className="block w-full py-3.5 rounded-xl bg-black text-white font-bold shadow-lg hover:bg-gray-800 transition-all flex justify-center items-center gap-2"
          >
            Track Status <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link 
            href="/" 
            className="block w-full py-3.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all text-center"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}