'use client'

import { useState } from 'react'
import { Search, Calendar, X, Car, Tractor } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Optional: if you have sonner/toast, otherwise remove

// Props: accept both ID and Name to support the new backend engine
export default function MobileSearch({ 
  defaultCityId = 'all', 
  defaultCityName = 'All Oman' 
}: { 
  defaultCityId?: string
  defaultCityName?: string 
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  
  // Search State
  const [category, setCategory] = useState('car') 
  const [dates, setDates] = useState({ start: '', end: '' })

  const handleSearch = () => {
    // 2. Validate Dates
    if (dates.start && dates.end) {
      if (dates.start >= dates.end) {
        // Simple alert if you don't have a toast library yet
        alert("End date must be after start date") 
        return
      }
    }

    const params = new URLSearchParams()
    if (category) params.set('category', category)
    
    // 1. IMPORTANT: Pass the UUID (locationId) if specific
    if (defaultCityId && defaultCityId !== 'all') {
       params.set('locId', defaultCityId) // Matches the new backend param
       // Optional: pass name for display purposes if needed
       // params.set('location', defaultCityName)
    }

    if (dates.start) params.set('start', dates.start)
    if (dates.end) params.set('end', dates.end)
    
    setIsOpen(false)
    
    // ROUTING: Go to the dedicated search page
    router.push(`/search?${params.toString()}`) 
  }

  // 3. UX: Helper to show selected date text
  const dateText = dates.start && dates.end 
    ? `${dates.start} → ${dates.end}`
    : "Tap to filter by dates"

  return (
    <>
      {/* 4. THE TRIGGER (Converted to button for accessibility) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mx-auto max-w-lg mt-6 bg-white rounded-full shadow-lg border border-gray-100 p-4 flex items-center gap-4 active:scale-95 transition-transform text-left"
      >
        <Search className="w-5 h-5 text-black ml-2" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">
             {defaultCityName === 'All Oman' ? 'Search in Oman...' : `Search in ${defaultCityName}...`}
          </p>
          <p className="text-xs text-gray-500 truncate">{dateText}</p>
        </div>
        <div className="p-2 bg-gray-100 rounded-full border border-gray-200">
           <div className="w-4 h-4 flex items-center justify-center">
             <span className="block w-1 h-1 bg-black rounded-full" />
             <span className="block w-1 h-1 bg-black rounded-full mx-0.5" />
           </div>
        </div>
      </button>

      {/* 2. THE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col animate-in slide-in-from-bottom-10 duration-200">
          <div className="p-4 flex justify-between items-center">
            <button onClick={() => setIsOpen(false)} className="p-2 bg-white rounded-full shadow-sm">
              <X className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg">Search Filters</span>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Vehicle Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setCategory('car')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${category === 'car' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500'}`}
                >
                  <Car className="w-8 h-8" />
                  <span className="font-bold text-sm">Rent a Car</span>
                </button>
                <button 
                  onClick={() => setCategory('heavy')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${category === 'heavy' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500'}`}
                >
                  <Tractor className="w-8 h-8" />
                  <span className="font-bold text-sm">Heavy Equipment</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900">Dates (Optional)</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                    <input type="date" className="w-full bg-gray-50 p-3 rounded-lg text-sm font-bold outline-none" onChange={(e) => setDates({...dates, start: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                    <input type="date" className="w-full bg-gray-50 p-3 rounded-lg text-sm font-bold outline-none" onChange={(e) => setDates({...dates, end: e.target.value})} />
                  </div>
               </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 pb-8">
            <button onClick={handleSearch} className="w-full bg-black text-white font-bold py-4 rounded-xl text-lg shadow-xl flex justify-center items-center gap-2">
              <Search className="w-5 h-5" />
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  )
}