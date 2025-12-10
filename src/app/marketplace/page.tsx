import Link from 'next/link'
import { getRentalCompanies, getFeaturedCars } from '../actions'
import { Building2, Car, Star, ArrowRight, ShieldCheck, User } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { createClient } from '@/utils/supabase/server' // <--- Import this

// Force dynamic so we always see new companies/ads
export const dynamic = 'force-dynamic'

export default async function MarketplaceHome() {
  const supabase = await createClient()
  
  // 1. Check User Session
  const { data: { user } } = await supabase.auth.getUser()

  // Parallel fetching for speed
  const [companies, featuredCars] = await Promise.all([
    getRentalCompanies(),
    getFeaturedCars()
  ])

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              OMAN<span className="text-blue-600">RENTALS</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/list-your-car" 
              className="hidden md:flex text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              List your Fleet
            </Link>

            {/* DYNAMIC AUTH BUTTONS */}
            {user ? (
              <Link 
                href="/my-bookings" 
                className="bg-gray-100 text-gray-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                My Trips
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="bg-gray-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --- 2. HERO SECTION --- */}
      <div className="relative bg-white border-b border-gray-200 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide mb-4 border border-blue-100">
            🇴🇲 #1 Marketplace in Oman
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            Rent directly from <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              verified local companies.
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            Compare fleets, chat via WhatsApp, and book instantly. No middleman fees.
          </p>

          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* --- 3. FEATURED ADS (The Monetization Layer) --- */}
        {featuredCars.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Featured Deals
              </h2>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sponsored</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <Link 
                  href={`/car/${car.id}`} 
                  key={car.id} 
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {car.images?.[0] ? (
                        <img 
                          src={car.images[0]} 
                          alt={car.model} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Car /></div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        {car.transmission}
                      </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            {/* @ts-ignore */}
                            <p className="text-xs text-gray-400 font-medium mb-1">{car.tenants?.name}</p>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{car.make} {car.model}</h3>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                        <div>
                            <span className="block text-xs text-gray-400">Daily Rate</span>
                            <span className="text-xl font-black text-blue-600">{car.daily_rate_omr} <span className="text-xs font-normal text-gray-400">OMR</span></span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* --- 4. RENTAL COMPANIES GRID (The New Core) --- */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted Rental Partners</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Browse fleets from Oman's top rated rental companies directly.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {companies.map((company) => (
              <Link 
                key={company.id} 
                href={`/company/${company.slug}`} 
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-4 group cursor-pointer"
              >
                {/* Avatar / Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-600 transition-all border border-gray-200">
                  <Building2 className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{company.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-400">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    <span>Verified</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}