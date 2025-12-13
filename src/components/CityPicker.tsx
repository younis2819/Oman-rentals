'use client'

import { useState } from 'react'
import { MapPin, X, Check, ChevronDown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { setCityPreference } from '@/app/actions'

type LocationItem = {
  id: string
  name_en: string
}

type Props = {
  locations: LocationItem[] // Passed from server (Fast ⚡)
  currentCityName: string
  currentCityId: string
  hasPreference: boolean    // True if cookie exists
}

export default function CityPicker({ locations, currentCityName, currentCityId, hasPreference }: Props) {
  const router = useRouter()
  
  // If no preference, force open. Otherwise closed by default.
  const [isOpen, setIsOpen] = useState(!hasPreference)
  const [loading, setLoading] = useState(false)

  const handleSelectCity = async (id: string, name: string) => {
    setLoading(true)
    
    // 1. Save both ID and Name to cookies
    await setCityPreference(id, name)
    
    // 2. Refresh page to reload data with new city context
    setIsOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {/* 1. THE TRIGGER PILL */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 hover:bg-gray-50 transition-all"
      >
        <MapPin className="w-3 h-3 text-blue-600" />
        {currentCityName}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {/* 2. THE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              </div>
            )}

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <div>
                  <h2 className="text-lg font-black text-gray-900">Where are you?</h2>
                  <p className="text-xs text-gray-500">We'll show you cars near you.</p>
               </div>
               
               {/* 🔒 FORCE CHOICE: Only show close button if user ALREADY has a preference */}
               {hasPreference && (
                 <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
               {/* "All Oman" Option */}
               <button
                  onClick={() => handleSelectCity('all', 'All Oman')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between mb-1 ${currentCityId === 'all' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-700'}`}
               >
                  <span className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentCityId === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>
                        <MapPin className="w-4 h-4" />
                     </div>
                     All Oman
                  </span>
                  {currentCityId === 'all' && <Check className="w-4 h-4" />}
               </button>

               <div className="h-px bg-gray-100 my-2 mx-4" />

               {/* Location List from Server */}
               {locations.map((loc) => (
                 <button
                   key={loc.id}
                   onClick={() => handleSelectCity(loc.id, loc.name_en)}
                   className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between mb-1 ${currentCityId === loc.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                 >
                    <span className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentCityId === loc.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                          <MapPin className="w-4 h-4" />
                       </div>
                       {loc.name_en}
                    </span>
                    {currentCityId === loc.id && <Check className="w-4 h-4" />}
                 </button>
               ))}
            </div>

          </div>
        </div>
      )}
    </>
  )
}