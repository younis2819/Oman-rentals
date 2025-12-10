import { createClient } from '@/utils/supabase/server'
import GlobalFleetList from '@/components/GlobalFleetList'
import SearchFilterBar from '@/components/SearchFilterBar'
import { Car, Tractor, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage(props: Props) {
  const searchParams = await props.searchParams
  
  // 1. Get Params
  const category = (searchParams.category as string) || 'car'
  const location = searchParams.location as string
  const features = searchParams.features as string
  
  // Date params
  const startDate = searchParams.start as string
  const endDate = searchParams.end as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Base Query
  let query = supabase
    .from('fleet')
    .select(`
      *,
      tenants!inner (
        name, 
        slug, 
        whatsapp_number,
        address 
      )
    `)
    .eq('is_available', true)
    .eq('category', category) 
    .order('daily_rate_omr', { ascending: true })

  // 3. Filters
  if (location && location !== 'All Oman') {
    query = query.ilike('tenants.address', `%${location}%`)
  }
  if (features) {
    query = query.contains('features', [features])
  }

  // 4. Date Availability Check
  if (startDate && endDate) {
    const { data: busyBookings } = await supabase
      .from('bookings')
      .select('car_id')
      .neq('status', 'cancelled')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    const busyCarIds = busyBookings?.map((b) => b.car_id) || []

    if (busyCarIds.length > 0) {
      query = query.not('id', 'in', `(${busyCarIds.join(',')})`)
    }
  }

  const { data: fleet, error } = await query

  if (error) {
    console.error("Search Error:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* --- HEADER (Unified with Homepage) --- */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
             {/* BACK BUTTON: Explicitly goes to Home */}
             <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black" title="Back to Home">
                <ArrowLeft className="w-5 h-5" />
             </Link>
             
             {/* LOGO: Resets filters */}
             <Link href="/" className="flex items-center gap-2 group">
                <div className={`p-1.5 rounded-lg transition-colors ${category === 'car' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                  {category === 'car' ? <Car className="w-5 h-5 text-white" /> : <Tractor className="w-5 h-5 text-white" />}
                </div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900 hidden md:block">
                  OMAN<span className={category === 'car' ? 'text-blue-600' : 'text-orange-500'}>RENTALS</span>
                </span>
             </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/my-bookings" className="hidden md:flex bg-gray-100 text-gray-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition-all items-center gap-2">
                  <User className="w-4 h-4" /> My Trips
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>
                <SignOutButton className="!text-xs" />
              </>
            ) : (
              <Link href="/login" className="bg-gray-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-sm">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* THE FILTER BAR (Replaces the pill toggle here) */}
        <SearchFilterBar />
      </header>

      {/* --- RESULTS INFO --- */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {fleet?.length || 0} {category === 'heavy' ? 'Machines' : 'Cars'} Found
          {location ? ` in ${location}` : ' in Oman'}
          {startDate ? ` for selected dates` : ''}
        </p>
      </div>

      {/* --- GRID --- */}
      <div className="max-w-7xl mx-auto px-4">
        {fleet && fleet.length > 0 ? (
          <GlobalFleetList fleet={fleet as any} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
               {category === 'heavy' ? <Tractor className="w-8 h-8 text-gray-400" /> : <Car className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900">No results found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              We couldn't find any {category === 'car' ? 'cars' : 'machines'} matching your criteria.
            </p>
            <Link href="/" className="mt-4 text-blue-600 font-bold text-sm hover:underline">
               Clear Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}