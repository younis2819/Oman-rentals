'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Car, Tractor, MapPin, Calendar, X } from 'lucide-react'

const OMAN_CITIES = ['All Oman', 'Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Duqm']

export default function SearchFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state from URL params
  const [category, setCategory] = useState(searchParams.get('category') || 'car')
  const [location, setLocation] = useState(searchParams.get('location') || 'All Oman')
  
  // Update URL when filters change
  const applyFilters = (newCategory: string, newLocation: string) => {
    setCategory(newCategory)
    setLocation(newLocation)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', newCategory)
    if (newLocation === 'All Oman') {
      params.delete('location')
    } else {
      params.set('location', newLocation)
    }
    
    router.replace(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        
        {/* Top Row: Category Switcher (Segmented Control) */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => applyFilters('car', location)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              category === 'car' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Car className="w-4 h-4" /> Cars
          </button>
          <button
            onClick={() => applyFilters('heavy', location)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              category === 'heavy' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tractor className="w-4 h-4" /> Heavy Machinery
          </button>
        </div>

        {/* Bottom Row: Location & Dates Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          
          {/* Location Chip */}
          <select 
            value={location}
            onChange={(e) => applyFilters(category, e.target.value)}
            className="appearance-none bg-black text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 cursor-pointer text-center"
            style={{ backgroundImage: 'none' }} // Remove default arrow
          >
            {OMAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
          </select>

          {/* Static Chips for UX (Active logic can be added later) */}
          <div className="bg-gray-100 px-4 py-2 rounded-full text-xs font-bold text-gray-600 flex-shrink-0 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Any Date
          </div>
          
          {category === 'car' && (
             <>
               <div className="border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-600 flex-shrink-0">SUV</div>
               <div className="border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-600 flex-shrink-0">Sedan</div>
             </>
          )}
          
          {category === 'heavy' && (
             <>
               <div className="border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-600 flex-shrink-0">Crane</div>
               <div className="border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-600 flex-shrink-0">Excavator</div>
             </>
          )}

        </div>
      </div>
    </div>
  )
}