import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers' // 👈 Import cookies
import { getRentalCompanies, getFleet, getLocations } from '@/app/actions' 
import { Building2, Star, ShieldCheck, Wallet, Clock, MessageCircle } from 'lucide-react'
import MobileSearch from '@/components/MobileSearch'
import CategoryTabs from '@/components/CategoryTabs'
import QuickFilters from '@/components/QuickFilters'
import CarCard from '@/components/CarCard'
import FeaturedFleetScroller from '@/components/FeaturedFleetScroller'
import CityPicker from '@/components/CityPicker' // 👈 Import CityPicker
import { Car } from '@/types' 

export const dynamic = 'force-dynamic'

const SUPPORT_WHATSAPP = '96877408996'

interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  city: string | null
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MarketplaceHome(props: Props) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()

  // 1. DETERMINE USER LOCATION (Priority: URL > Cookie > Default)
  const cookieId = cookieStore.get('or_loc_id')?.value
  const cookieName = cookieStore.get('or_city_name')?.value
  
  // Has the user ever set a preference?
  const hasPreference = !!cookieId 

  // URL params always override cookies (useful for sharing links)
  const urlLocation = searchParams.location as string | undefined
  
  const displayLocationName = urlLocation || cookieName || 'All Oman'
  // If URL has a location text, we default ID to 'all' (since we don't have the ID lookup handy here),
  // otherwise we use the cookie ID.
  const locationId = urlLocation ? 'all' : (cookieId || 'all')

  const category = (searchParams.category as 'car' | 'heavy') || 'car'
  const features = searchParams.features as string | undefined
  const start = searchParams.start as string | undefined
  const end = searchParams.end as string | undefined

  // 2. FETCH DATA (Parallel)
  // We add getLocations() to the parallel fetch
  const [locationsResult, companiesResult, fleetResult] = await Promise.allSettled([
    getLocations(),
    getRentalCompanies(true, displayLocationName), 
    getFleet({ category, features, location: displayLocationName, start, end })
  ])

  const locationsList = locationsResult.status === 'fulfilled' ? locationsResult.value : []
  let companies = companiesResult.status === 'fulfilled' ? companiesResult.value : []
  const fleet = fleetResult.status === 'fulfilled' ? fleetResult.value : []

  // 🔒 FALLBACK: If no featured companies in this city, show ALL companies in this city
  if (companies.length === 0 && displayLocationName !== 'All Oman') {
     const fallback = await getRentalCompanies(false, displayLocationName)
     companies = fallback
  }

  // 🔒 FIX: Only hide partners if actually filtering by DATES or FEATURES
  // We WANT to show partners if just filtering by City.
  const isSearching = !!features || !!start

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 md:pb-0 relative">
      
      {/* HERO SECTION */}
      <div className="relative bg-white border-b border-gray-200 overflow-hidden">
        
        {/* 🏙️ CITY PICKER (Absolute Positioned) */}
        <div className="absolute top-4 left-4 z-20">
           <CityPicker 
              locations={locationsList}
              currentCityName={displayLocationName}
              currentCityId={locationId}
              hasPreference={hasPreference}
           />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[150%] bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-full blur-3xl opacity-60 animate-in fade-in duration-1000" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-gradient-to-l from-orange-50/50 to-yellow-50/50 rounded-full blur-3xl opacity-60 animate-in fade-in duration-1000 delay-200" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" /> 
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-10 sm:px-6 lg:px-8 text-center z-10">
          <div className="flex justify-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
             <CategoryTabs />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight animate-in slide-in-from-bottom-6 duration-700">
            Rent <span className={`transition-colors duration-300 ${category === 'car' ? 'text-blue-600' : 'text-orange-600'}`}>
              {category === 'car' ? 'Cars' : 'Heavy Equipment'}
            </span> directly.
          </h1>
          
          <div className="mt-6 mb-8 max-w-lg mx-auto animate-in slide-in-from-bottom-8 duration-1000">
            {/* 📱 PASS LOCATION TO MOBILE SEARCH */}
            <MobileSearch 
              defaultCityId={locationId}
              defaultCityName={displayLocationName} 
            />
          </div>

          <div className="flex justify-center animate-in slide-in-from-bottom-10 duration-1000 delay-100">
             <QuickFilters />
          </div>
        </div>
      </div>

      {/* TRUST INDICATORS */}
      {!isSearching && (
        <div className="bg-white/50 backdrop-blur-sm py-10 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
                <div className="bg-blue-50 p-3 rounded-full mb-3 text-blue-600"><ShieldCheck className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900">Verified Companies</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">Every vendor is vetted. No scams, just reliable local businesses.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-green-50 p-3 rounded-full mb-3 text-green-600"><Wallet className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900">Zero Hidden Fees</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">You pay exactly what you see. Direct prices from the owner.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-orange-50 p-3 rounded-full mb-3 text-orange-600"><Clock className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900">Instant Availability</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">Real-time booking. Get the equipment you need, when you need it.</p>
            </div>
            </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <section className="animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {isSearching 
                  ? `Search Results (${fleet.length})` 
                  : `Featured in ${displayLocationName}`}
              </h2>
            </div>
            
            {fleet.length > 0 ? (
                isSearching ? (
                    // GRID VIEW for Search
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {fleet.map((car) => (
                            <CarCard key={car.id} car={car as Car} />
                        ))}
                    </div>
                ) : (
                    // SCROLLER VIEW for Featured
                    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                        <FeaturedFleetScroller fleet={fleet as Car[]} />
                    </div>
                )
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">No vehicles found</h3>
                    <p className="text-gray-400">
                       {displayLocationName !== 'All Oman' 
                         ? `No featured vehicles in ${displayLocationName} yet.` 
                         : 'Try changing your filters.'}
                    </p>
                </div>
            )}
        </section>

        {/* TRUSTED PARTNERS (Always show unless searching specific dates) */}
        {!isSearching && (
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Trusted Rental Partners {displayLocationName && displayLocationName !== 'All Oman' ? `in ${displayLocationName}` : ''}
                    </h2>
                </div>
                
                {companies.length > 0 ? (
                  <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible no-scrollbar">
                      {(companies as Company[]).map((company) => (
                      <Link key={company.id} href={`/company/${company.slug}`} className="min-w-[160px] md:min-w-0 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-4 group cursor-pointer snap-center">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 border border-gray-200 group-hover:border-blue-200 transition-colors overflow-hidden relative shadow-sm">
                              {company.logo_url ? (
                                  <Image 
                                    src={company.logo_url} 
                                    alt={`${company.name} logo`} 
                                    fill 
                                    sizes="64px" 
                                    className="object-cover"
                                  />
                              ) : (
                                  <Building2 className="w-6 h-6" />
                              )}
                          </div>
                          <div className="w-full">
                              <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 truncate w-full">{company.name}</h3>
                              {company.city && (
                                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">{company.city}</p>
                              )}
                          </div>
                      </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    No partners listed in {displayLocationName} yet.
                  </div>
                )}
            </section>
        )}
      </main>

      <a 
        href={`https://wa.me/${SUPPORT_WHATSAPP}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 md:px-6 md:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden md:inline font-bold">Chat with us</span>
      </a>
    </div>
  )
}