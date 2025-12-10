'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Car, Tractor, MapPin, Calendar, X } from 'lucide-react'

const OMAN_CITIES = ['All Oman', 'Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Duqm']

export default function SearchFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 1. Get current state from URL
  const category = searchParams.get('category') || 'car'
  const location = searchParams.get('location') || 'All Oman'
  const activeFeature = searchParams.get('features')

  // 2. Helper to update URL
  const updateParams = (newCategory: string, newLocation: string, newFeature?: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Set Category
    params.set('category', newCategory)
    
    // Set Location
    if (newLocation && newLocation !== 'All Oman') {
      params.set('location', newLocation)
    } else {
      params.delete('location')
    }

    // Set/Remove Feature
    if (newFeature) {
      params.set('features', newFeature)
    } else if (newFeature === null) {
      params.delete('features')
    }
    // If undefined, leave it alone (preserve current feature) - logic below handles this explicitly

    router.replace(`/search?${params.toString()}`, { scroll: false })
  }

  // 3. Handlers
  const handleCategoryChange = (cat: string) => {
    // When changing category, we usually want to clear specific features (e.g. clear "Sedan" if switching to Heavy)
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', cat)
    params.delete('features') // Clear sub-filters to avoid invalid states
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }

  const toggleFeature = (feature: string) => {
    if (activeFeature === feature) {
      updateParams(category, location, null) // Remove
    } else {
      updateParams(category, location, feature) // Set
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        
        {/* TOP ROW: Category Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => handleCategoryChange('car')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              category === 'car' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Car className="w-4 h-4" /> Cars
          </button>
          <button
            onClick={() => handleCategoryChange('heavy')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              category === 'heavy' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tractor className="w-4 h-4" /> Heavy Machinery
          </button>
        </div>

        {/* BOTTOM ROW: Filters Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar items-center">
          
          {/* Location Dropdown */}
          <div className="relative flex-shrink-0">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white z-10 pointer-events-none" />
             <select 
                value={location}
                onChange={(e) => updateParams(category, e.target.value, activeFeature)}
                className="appearance-none bg-black text-white pl-8 pr-8 py-2 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer text-center outline-none hover:bg-gray-800 transition-colors"
             >
                {OMAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
             </select>
          </div>

          {/* Date Placeholder (Visual Only for MVP) */}
          <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-500 flex-shrink-0 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Any Date
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-gray-200 flex-shrink-0 mx-1"></div>

          {/* Dynamic Filter Chips */}
          {category === 'car' ? (
            <>
              {['SUV', 'Sedan', 'Luxury', '4x4'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => toggleFeature(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    activeFeature === tag 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </>
          ) : (
            <>
              {['Excavator', 'Crane', 'Bulldozer', 'Truck'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => toggleFeature(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    activeFeature === tag 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  )
}