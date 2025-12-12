import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Wallet, Clock, CheckCircle, Plus, Search, Filter, Car } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import DashboardStat from '@/components/DashboardStat'
import VendorBookingRow from '@/components/VendorBookingRow'

export const dynamic = 'force-dynamic'

export default async function VendorDashboard() {
  const supabase = await createClient()

  // 1. Auth & Profile Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return <div className="p-20 text-center">No Access</div>

  const tenantId = profile.tenant_id

  // 2. Fetch Data (Bookings + Fleet)
  const [bookingsResult, fleetResult] = await Promise.all([
    supabase
      .from('bookings')
      .select(`*, fleet(make, model, images, category)`)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('fleet')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
  ])

  const bookings = bookingsResult.data || []
  const fleet = fleetResult.data || []

  // 3. Compute Metrics
  const pendingItems = bookings.filter(b => b.status === 'pending')
  const activeItems = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid')
  
  const totalRevenue = bookings.reduce((sum, b) => {
    return (b.status === 'paid' || b.status === 'confirmed') ? sum + b.total_price_omr : sum
  }, 0)

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of your rental operations.</p>
          </div>
          <Link 
            href="/vendor/add-car" 
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </Link>
        </div>

        {/* --- METRICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStat 
             label="Total Revenue" 
             value={`${totalRevenue.toLocaleString()} OMR`} 
             subValue="Lifetime earnings"
             icon={Wallet} 
             trend="up"
          />
          <DashboardStat 
             label="Action Required" 
             value={pendingItems.length.toString()} 
             subValue="Pending requests"
             icon={Clock} 
             trend={pendingItems.length > 0 ? 'down' : 'neutral'}
          />
          <DashboardStat 
             label="Active Rentals" 
             value={activeItems.length.toString()} 
             subValue="Currently out"
             icon={CheckCircle} 
             trend="neutral"
          />
        </div>

        {/* --- BOOKINGS TABLE --- */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h2 className="font-bold text-gray-900 flex items-center gap-2">
               <LayoutDashboard className="w-4 h-4 text-gray-400" /> 
               Recent Bookings
             </h2>
             <div className="flex items-center gap-2">
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search ref or name..." 
                     className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all w-full sm:w-64 text-gray-900 font-bold placeholder:font-normal placeholder:text-gray-400"
                   />
                </div>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                   <Filter className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
             <div className="col-span-4">Asset / Customer</div>
             <div className="col-span-3">Dates</div>
             <div className="col-span-2">Status</div>
             <div className="col-span-3 text-right">Price / Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
               <div className="p-12 text-center text-gray-400">
                  <p>No bookings found.</p>
               </div>
            ) : (
               bookings.map((booking) => (
                  <VendorBookingRow key={booking.id} booking={booking} />
               ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-500 text-center">
              Showing latest {bookings.length} bookings
          </div>
        </div>

        {/* --- MY FLEET SECTION (New) --- */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" /> 
                    My Fleet ({fleet.length})
                </h2>
            </div>
            
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fleet.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                        No assets listed yet.
                    </div>
                ) : (
                    fleet.map((car) => (
                        <div key={car.id} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-3 hover:border-gray-300 transition-colors bg-gray-50/30">
                            {/* Car Image */}
                            <div className="aspect-video bg-gray-100 rounded-lg relative overflow-hidden">
                                {car.images?.[0] ? (
                                    <Image 
                                        src={car.images[0]} 
                                        alt={car.model} 
                                        fill 
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <Car className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm truncate">{car.make} {car.model}</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">{car.year}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${car.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {car.is_available ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                            </div>

                            {/* 👇 THE REQUESTED EDIT BUTTON */}
                            <Link
                                href={`/vendor/edit-car/${car.id}`}
                                className="mt-auto w-full py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-center text-gray-700 transition-all"
                            >
                                Edit Details
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>

      </main>
    </div>
  )
}