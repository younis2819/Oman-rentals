'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Car, Tractor } from 'lucide-react'

export default function CategoryTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'car' 

  const setCategory = (newCat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', newCat)
    // IMPORTANT: Clear sub-filters when switching main category
    params.delete('features')
    router.replace(`/?${params.toString()}`) 
  }

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-100 p-1.5 rounded-xl flex gap-1 shadow-inner border border-gray-200">
        <button
          onClick={() => setCategory('car')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            category === 'car' 
              ? 'bg-white text-blue-600 shadow-sm scale-105 ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Cars</span>
        </button>

        <button
          onClick={() => setCategory('heavy')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            category === 'heavy' 
              ? 'bg-white text-orange-600 shadow-sm scale-105 ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tractor className="w-4 h-4" />
          <span>Heavy</span>
        </button>
      </div>
    </div>
  )
}