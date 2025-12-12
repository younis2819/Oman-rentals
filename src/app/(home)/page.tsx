import Link from 'next/link'
import Image from 'next/image'
import { getRentalCompanies, getFleet } from '@/app/actions' 
import { Building2, Star, ShieldCheck, Wallet, Clock, MessageCircle } from 'lucide-react'
import MobileSearch from '@/components/MobileSearch'
import CategoryTabs from '@/components/CategoryTabs'
import QuickFilters from '@/components/QuickFilters'
import CarCard from '@/components/CarCard'
import FeaturedFleetScroller from '@/components/FeaturedFleetScroller'
import { Car } from '@/types' // ✅ Fix types

export const dynamic = 'force-dynamic'

const SUPPORT_WHATSAPP = '96877408996'

// Safe Company Interface
interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MarketplaceHome(props: Props) {
  const searchParams = await props.searchParams
  
  const category = (searchParams.category as 'car' | 'heavy') || 'car'
  const features = searchParams.features as string | undefined
  const location = searchParams.location as string | undefined
  const start = searchParams.start as string | undefined
  const end = searchParams.end as string | undefined

  // 1. Crash-Proof Data Fetching
  const results = await Promise.allSettled([
    getRentalCompanies(),
    getFleet({ category, features, location, start, end })
  ])

  const companies = results[0].status === 'fulfilled' ? results[0].value : []
  const fleet = results[1].status === 'fulfilled' ? results[1].value : []

  const isSearching = features || location || start

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 md:pb-0 relative">
      
      {/* HERO SECTION */}
      <div className="relative bg-white border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[150%] bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-full blur-3xl opacity-60 animate-in fade-in duration-1000" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-gradient-to-l from-orange-50/50 to-yellow-50/50 rounded-full blur-3xl opacity-60 animate-in fade-in duration-1000 delay-200" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" /> 
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 sm:px-6 lg:px-8 text-center z-10">
          <div className="flex justify-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
             <CategoryTabs />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight animate-in slide-in-from-bottom-6 duration-700">
            Rent <span className={`transition-colors duration-300 ${category === 'car' ? 'text-blue-600' : 'text-orange-600'}`}>
              {category === 'car' ? 'Cars' : 'Heavy Equipment'}
            </span> directly.
          </h1>
          
          <div className="mt-6 mb-8 max-w-lg mx-auto animate-in slide-in-from-bottom-8 duration-1000">
            <MobileSearch />
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
                {isSearching ? `Search Results (${fleet.length})` : `Featured ${category === 'car' ? 'Vehicles' : 'Machines'}`}
              </h2>
            </div>
            
            {isSearching ? (
                fleet.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {fleet.map((car) => (
                            <CarCard key={car.id} car={car as Car} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">No results found</h3>
                        <p className="text-gray-400">Try changing your filters.</p>
                    </div>
                )
            ) : (
                fleet.length > 0 ? (
                      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                         <FeaturedFleetScroller fleet={fleet as Car[]} />
                      </div>
                ) : (
                      <div className="text-center py-10 text-gray-400">No featured vehicles available at the moment.</div>
                )
            )}
        </section>

        {!isSearching && (
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted Rental Partners</h2>
                </div>
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
                        <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 truncate w-full">{company.name}</h3>
                    </Link>
                    ))}
                </div>
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