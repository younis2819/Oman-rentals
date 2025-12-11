import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation' 
import { TrendingUp, CheckCircle, UserPlus, Phone, MessageCircle, FileText, ArrowRight, Truck, Calendar } from 'lucide-react' // 👈 Fixed: Removed ShieldAlert
import { approveVendor } from './actions'
import { Database } from '@/types/database.types' 
import SignOutButton from '@/components/SignOutButton'
import HomeButton from '@/components/HomeButton'
import Link from 'next/link'
import AdminStatusSelect from '@/components/AdminStatusSelect'

export const dynamic = 'force-dynamic'

type BookingWithDetails = Database['public']['Tables']['bookings']['Row'] & {
  fleet: {
    make: string
    model: string
    year: number
    base_rate: number | null
    daily_rate_omr: number
  } | null
  tenants: {
    name: string
    whatsapp_number: string | null
  } | null
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. SECURITY GUARD
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return redirect('/') 
  }

  // 2. FETCH DATA (Wrapped in Try/Catch for stability)
  let allBookings: BookingWithDetails[] = []
  let pendingTenants: any[] = []

  try {
    const [bookingsResult, pendingTenantsResult] = await Promise.all([
        supabase
        .from('bookings')
        .select(`*, fleet ( make, model, year, base_rate, daily_rate_omr ), tenants ( name, whatsapp_number )`)
        .order('created_at', { ascending: false })
        .returns<BookingWithDetails[]>(), 
        supabase
        .from('tenants')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    ])
    
    allBookings = bookingsResult.data || []
    pendingTenants = pendingTenantsResult.data || []

  } catch (error) {
      console.error("Dashboard Data Fetch Error:", error)
      // Optional: You could redirect to an error page here if you wanted
  }

  // Filter for active operational bookings
  const activeBookings = allBookings.filter(b => ['pending', 'paid', 'confirmed'].includes(b.status || ''))

  let totalRevenue = 0
  let totalProfit = 0

  allBookings.forEach(b => {
    if (b.status !== 'cancelled' && b.fleet) {
      const days = Math.ceil(Math.abs(new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / (8.64e7)) || 1
      const marketPrice = b.fleet.daily_rate_omr
      const basePrice = b.fleet.base_rate || marketPrice 
      
      totalRevenue += (marketPrice * days)
      totalProfit += ((marketPrice - basePrice) * days)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="flex items-center gap-4">
            <HomeButton />
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Command Center</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Live</span>
                <span>•</span>
                <span>{activeBookings.length} Active Orders</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Link 
               href="/admin/audit" 
               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
             >
                <FileText className="w-4 h-4" /> Audit Log
             </Link>
             <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
             <div className="flex items-center gap-3">
                <div className="hidden md:block bg-black text-white px-3 py-1 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider">
                    Super Admin
                </div>
                <SignOutButton />
             </div>
          </div>
        </div>

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Volume (GMV)</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2">{totalRevenue.toLocaleString()} <span className="text-sm text-gray-400 font-medium">OMR</span></h3>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
            <p className="text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 relative z-10">
              <TrendingUp className="w-3 h-3" /> Net Profit
            </p>
            <h3 className="text-3xl font-black relative z-10">+{totalProfit.toLocaleString()} <span className="text-sm text-gray-500 font-medium">OMR</span></h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-3xl font-black text-blue-600 mt-2">{pendingTenants.length}</h3>
          </div>
        </div>

        {/* --- SECTION 1: VENDOR ONBOARDING --- */}
        {pendingTenants.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                    <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">New Vendor Requests</h2>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {pendingTenants.map((tenant) => (
                  <div key={tenant.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 last:border-0 gap-6 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{tenant.name}</h3>
                          <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Review Needed</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-8 text-sm text-gray-500">
                        <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5"/> {tenant.whatsapp_number}</span>
                      </div>
                    </div>
                    <form 
                      action={async (formData) => {
                        'use server'
                        await approveVendor(formData)
                      }} 
                      className="flex-shrink-0"
                    >
                      <input type="hidden" name="tenantId" value={tenant.id} />
                      <button className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Approve Vendor
                      </button>
                    </form>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* --- SECTION 2: TRANSACTION CONTROL CENTER --- */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Truck className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Transaction Control</h2>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                        <tr>
                        <th className="p-5">Order Ref</th>
                        <th className="p-5">Vendor & Asset</th>
                        <th className="p-5">Customer Info</th>
                        <th className="p-5">Logistics</th>
                        <th className="p-5 text-right">Vendor Payout</th>
                        <th className="p-5 text-center">Status</th>
                        <th className="p-5 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {activeBookings.map((booking) => {
                        const days = Math.ceil(Math.abs(new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (8.64e7)) || 1
                        const baseDaily = booking.fleet?.base_rate || booking.fleet?.daily_rate_omr || 0
                        const vendorTotal = baseDaily * days 
                        const refId = booking.id.slice(0, 8).toUpperCase()
                        
                        const vendorPhone = booking.tenants?.whatsapp_number
                        
                        const message = `🔔 *NEW BOOKING DISPATCH* 🔔\n\n` +
                                        `🆔 *Ref:* #${refId}\n` +
                                        `🚗 *Asset:* ${booking.fleet?.make} ${booking.fleet?.model} (${booking.fleet?.year})\n\n` +
                                        `👤 *Customer:* ${booking.customer_name}\n` +
                                        `📞 *Contact:* ${booking.customer_phone}\n\n` +
                                        `📅 *Start:* ${new Date(booking.start_date).toLocaleDateString('en-GB')}\n` +
                                        `📅 *End:* ${new Date(booking.end_date).toLocaleDateString('en-GB')}\n` +
                                        `🗓️ *Duration:* ${days} Days\n\n` +
                                        `💰 *VENDOR PAYOUT:* ${vendorTotal} OMR\n` + 
                                        `(Please collect via Cash or Link)\n\n` +
                                        `👉 *Action:* Please confirm availability & dispatch immediately.`

                        const waLink = `https://wa.me/${vendorPhone}?text=${encodeURIComponent(message)}`

                        return (
                            <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-5">
                                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">#{refId}</span>
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-gray-900">{booking.tenants?.name}</div>
                                    <div className="text-xs text-gray-500">{booking.fleet?.make} {booking.fleet?.model}</div>
                                </td>
                                <td className="p-5">
                                    <div className="font-medium text-gray-900">{booking.customer_name}</div>
                                    <div className="text-xs text-gray-400">{booking.customer_phone}</div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        {new Date(booking.start_date).toLocaleDateString('en-GB')} 
                                        <ArrowRight className="w-3 h-3 text-gray-300" />
                                        {new Date(booking.end_date).toLocaleDateString('en-GB')}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-bold pl-6">{days} Days Total</div>
                                </td>
                                <td className="p-5 text-right">
                                    <span className="font-bold text-gray-900">{vendorTotal} OMR</span>
                                    <div className="text-[10px] text-green-600 font-medium">Profit Hidden</div>
                                </td>
                                <td className="p-5 text-center">
                                    <AdminStatusSelect id={booking.id} currentStatus={booking.status || 'pending'} />
                                </td>
                                <td className="p-5 text-center">
                                    {/* 👇 FIX: Check for vendorPhone before showing button */}
                                    {(booking.status === 'confirmed' || booking.status === 'paid') && vendorPhone ? (
                                        <a 
                                            href={waLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold shadow-md hover:bg-green-600 hover:-translate-y-0.5 transition-all w-full justify-center"
                                        >
                                            <MessageCircle className="w-4 h-4" /> Dispatch Job
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">
                                            {vendorPhone ? 'Verify first' : 'Missing Phone'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        )
                        })}
                    </tbody>
                    </table>
                    
                    {activeBookings.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">All Caught Up</h3>
                            <p className="text-gray-400 text-sm">No active transactions pending dispatch.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>

      </div>
    </div>
  )
}