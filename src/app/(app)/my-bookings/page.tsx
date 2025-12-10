import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Clock, Car, AlertCircle, MapPin, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import PayButton from '@/components/PayButton'

export const dynamic = 'force-dynamic'

export default async function MyBookings() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch User's Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      fleet (
        make, 
        model, 
        year, 
        images,
        daily_rate_omr
      ),
      tenants (
        name,
        whatsapp_number
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* NOTE: Header removed. Global Navbar handles this now. */}
        <div className="mb-6">
           <h1 className="text-2xl font-black text-gray-900">My Trips</h1>
           <p className="text-sm text-gray-500">Manage your upcoming rentals</p>
        </div>

        {(!bookings || bookings.length === 0) ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              You haven't rented any cars with us yet. Your future trips will appear here.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center bg-black text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Find a Car
            </Link>
          </div>
        ) : (
          /* Booking List */
          <div className="space-y-4">
            {bookings.map((booking) => {
              // @ts-ignore
              const car = booking.fleet
              // @ts-ignore
              const vendor = booking.tenants
              
              const isQuoteReady = booking.status === 'quote_sent'

              const startDate = new Date(booking.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              const endDate = new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              
              return (
                <div key={booking.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group
                    ${isQuoteReady ? 'border-blue-200 ring-4 ring-blue-50' : 'border-gray-100'}
                `}>
                  
                  {/* Status Bar */}
                  <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center ${
                    booking.status === 'paid' ? 'bg-green-50 text-green-700' :
                    booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                    booking.status === 'quote_sent' ? 'bg-blue-600 text-white shadow-md' :
                    booking.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-orange-50 text-orange-700'
                  }`}>
                    <span className="flex items-center gap-2">
                      {booking.status === 'quote_sent' ? (
                          <><AlertCircle className="w-4 h-4" /> Action Required: Pay Now</>
                      ) : booking.status === 'pending' ? (
                          <><Clock className="w-3 h-3" /> Waiting for Approval</>
                      ) : (
                          <><CheckCircle className="w-3 h-3" /> {booking.status}</>
                      )}
                    </span>
                    <span className={booking.status === 'quote_sent' ? 'text-blue-200' : 'text-gray-400'}>
                        #{booking.id.slice(0, 6).toUpperCase()}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col md:flex-row gap-6">
                    {/* Car Image */}
                    <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {car?.images?.[0] ? (
                        <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Car className="w-10 h-10 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                             <h3 className="font-bold text-gray-900 text-xl">{car?.make} {car?.model}</h3>
                             <p className="font-black text-gray-900 text-lg">{booking.total_price_omr} OMR</p>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-4">{vendor?.name}</p>

                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {startDate} - {endDate}
                            </div>
                            
                            {booking.delivery_needed && (
                                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Delivery Requested
                                </div>
                            )}
                        </div>
                      </div>

                      {/* ACTION AREA - SHOW PAY BUTTON IF QUOTE SENT */}
                      {isQuoteReady && (
                          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                             <div className="text-xs text-gray-500">
                                Vendor has updated the price including delivery.
                             </div>
                             <PayButton bookingId={booking.id} amount={booking.total_price_omr} />
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}