'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Car, Tractor, MapPin, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { getFilteredFleet, getLocations } from '@/app/actions'
import GlobalFleetList from '@/components/GlobalFleetList'
import { Car as CarType } from '@/types'

// Helper: Debounce (Wait 500ms before fetching while user slides price)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function SearchInterface({ initialFleet }: { initialFleet: CarType[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // -- 1. STATE --
  const [fleet, setFleet] = useState<CarType[]>(initialFleet)
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<{id: string, name_en: string}[]>([])
  
  // Filters
  const [category, setCategory] = useState(searchParams.get('category') || 'car')
  
  // 🔒 USE ID FOR STATE (Defaults to 'all')
  const [locationId, setLocationId] = useState(searchParams.get('locId') || 'all')
  
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 })
  const [showFilters, setShowFilters] = useState(false)

  // Debounced Price (prevents lag)
  const debouncedPrice = useDebounce(priceRange, 500)

  // -- 2. INIT: Load Locations from DB --
  useEffect(() => {
    getLocations().then(setLocations)
  }, [])

  // -- 3. REAL-TIME FETCHING --
  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      
      // Update URL silently (Shallow routing)
      const params = new URLSearchParams()
      params.set('category', category)
      params.set('locId', locationId) 
      params.set('min', debouncedPrice.min.toString())
      params.set('max', debouncedPrice.max.toString())
      
      // Uses browser history API to update URL without reloading page
      window.history.replaceState(null, '', `?${params.toString()}`)

      // Fetch new data based on filters
      const results = await getFilteredFleet({
        category,
        locationId, 
        minPrice: debouncedPrice.min,
        maxPrice: debouncedPrice.max,
      })
      
      setFleet(results)
      setLoading(false)
    }

    // Skip the very first fetch if we already have initial data matching our filters?
    // For simplicity, we just fetch to ensure consistency.
    fetchResults()
  }, [category, locationId, debouncedPrice])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- TOP BAR (Sticky) --- */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          
          {/* Location Dropdown (Using IDs from DB) */}
          <div className="relative group shrink-0">
             <select 
               value={locationId}
               onChange={(e) => setLocationId(e.target.value)}
               className="appearance-none bg-gray-100 hover:bg-gray-200 pl-9 pr-8 py-2.5 rounded-full text-sm font-bold text-gray-800 outline-none cursor-pointer transition-colors"
             >
               <option value="all">All Oman</option>
               {locations.map(loc => (
                 <option key={loc.id} value={loc.id}>{loc.name_en}</option>
               ))}
             </select>
             <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Type Toggle */}
          <div className="bg-gray-100 p-1 rounded-full flex shrink-0">
            <button 
               onClick={() => setCategory('car')}
               className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${category === 'car' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
            >
              <Car className="w-4 h-4" /> Cars
            </button>
            <button 
               onClick={() => setCategory('heavy')}
               className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${category === 'heavy' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
            >
              <Tractor className="w-4 h-4" /> Heavy
            </button>
          </div>
          
          {/* Price Filter Trigger */}
          <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 border transition-all ${
               showFilters ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'
             }`}
          >
             <SlidersHorizontal className="w-4 h-4" /> Price
          </button>
        </div>

        {/* --- EXPANDABLE FILTER PANEL --- */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-4 pb-2 animate-in slide-in-from-top-2">
             <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-md">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-900">Price Range (OMR)</h3>
                   <button onClick={() => setShowFilters(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                   <div className="flex-1">
                      <label className="text-xs text-gray-500 font-bold uppercase">Min</label>
                      <input 
                        type="number" 
                        value={priceRange.min} 
                        onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})} 
                        className="w-full p-2 border border-gray-200 rounded-lg font-bold outline-none focus:border-black" 
                      />
                   </div>
                   <div className="text-gray-300">-</div>
                   <div className="flex-1">
                      <label className="text-xs text-gray-500 font-bold uppercase">Max</label>
                      <input 
                        type="number" 
                        value={priceRange.max} 
                        onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})} 
                        className="w-full p-2 border border-gray-200 rounded-lg font-bold outline-none focus:border-black" 
                      />
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* --- RESULTS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
           <h2 className="text-lg font-bold text-gray-900">
             {loading ? 'Updating...' : `${fleet.length} Results`}
           </h2>
           {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        <div className={loading ? 'opacity-50 transition-opacity' : ''}>
           {/* Reusing your existing Fleet List component */}
           <GlobalFleetList fleet={fleet} />
        </div>
      </div>
    </div>
  )
}