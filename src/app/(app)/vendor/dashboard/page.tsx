import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Wallet, Clock, CheckCircle, Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
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

  // 2. Fetch Data
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`*, fleet(make, model, images, category)`)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  // 3. Compute Metrics
  const safeBookings = bookings || []
  const pendingItems = safeBookings.filter(b => b.status === 'pending')
  const activeItems = safeBookings.filter(b => b.status === 'confirmed' || b.status === 'paid')
  
  const totalRevenue = safeBookings.reduce((sum, b) => {
    return (b.status === 'paid' || b.status === 'confirmed') ? sum + b.total_price_omr : sum
  }, 0)

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      {/* NOTE: We removed the <nav> block here because 
         src/components/Navbar.tsx is now handling the top bar globally.
      */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* --- PAGE HEADER (Title + Add Button) --- */}
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

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h2 className="font-bold text-gray-900 flex items-center gap-2">
               <LayoutDashboard className="w-4 h-4 text-gray-400" /> 
               Recent Bookings
             </h2>
             
             {/* Search (Visual Only) */}
             <div className="flex items-center gap-2">
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search ref or name..." 
                     className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all w-full sm:w-64"
                   />
                </div>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                   <Filter className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
             <div className="col-span-4">Asset / Customer</div>
             <div className="col-span-3">Dates</div>
             <div className="col-span-2">Status</div>
             <div className="col-span-3 text-right">Price / Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {safeBookings.length === 0 ? (
               <div className="p-12 text-center text-gray-400">
                  <p>No bookings found.</p>
               </div>
            ) : (
               safeBookings.map((booking) => (
                  <VendorBookingRow key={booking.id} booking={booking} />
               ))
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-500 text-center">
             Showing latest {safeBookings.length} bookings
          </div>
        </div>

      </main>
    </div>
  )
}