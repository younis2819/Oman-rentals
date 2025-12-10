'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

export default function QuickFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 1. Detect the World (Car vs Heavy)
  const currentCategory = searchParams.get('category') || 'car'
  
  // 2. Get active sub-filters
  const features = searchParams.get('features') 

  // Helper to toggle filters
  const toggleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Toggle logic: if clicking the active one, remove it. Else set it.
    if (params.get('features') === value) {
      params.delete('features')
    } else {
      params.set('features', value)
    }
    
    // Ensure category persists
    if (!params.has('category')) {
      params.set('category', currentCategory)
    }
    
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  const clearAll = () => {
    const params = new URLSearchParams()
    params.set('category', currentCategory) // Reset to category root
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      
      {/* Clear Button (Visible if filtered) */}
      {features && (
        <button 
          onClick={clearAll}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-red-50 text-red-600 text-xs font-bold whitespace-nowrap hover:bg-red-100 transition-colors"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}

      {/* --- CAR FILTERS --- */}
      {currentCategory === 'car' && (
        <>
          {['SUV', 'Sedan', 'Luxury', '4x4'].map((tag) => (
            <button 
              key={tag}
              onClick={() => toggleFilter(tag)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                features === tag 
                  ? 'bg-black text-white border-black shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </>
      )}

      {/* --- HEAVY FILTERS --- */}
      {currentCategory === 'heavy' && (
        <>
          {['Excavator', 'Crane', 'Bulldozer', 'Truck'].map((tag) => (
            <button 
              key={tag}
              onClick={() => toggleFilter(tag)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                features === tag 
                  ? 'bg-black text-white border-black shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </>
      )}
    </div>
  )
}