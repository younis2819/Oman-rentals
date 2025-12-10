'use client'

import { useState } from 'react'
import { Car, Trash2, Eye, EyeOff, Loader2, Edit, Tractor } from 'lucide-react'
import { deleteCar, toggleCarAvailability } from '@/app/(app)/vendor/dashboard/actions'
import Link from 'next/link'
import Image from 'next/image' // <--- 1. Import Next.js Image

type CarProps = {
  car: {
    id: string
    make: string
    model: string
    year: number
    transmission: string | null
    daily_rate_omr: number
    base_rate: number | null
    images: string[] | null
    is_available: boolean | null
    category?: 'car' | 'heavy'
    specs?: any
  }
}

export default function VendorCarCard({ car }: CarProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset? This cannot be undone.')) return
    
    setIsDeleting(true)
    const res = await deleteCar(car.id)
    if (res?.error) {
      alert(res.error)
      setIsDeleting(false)
    }
  }

  const handleToggle = async () => {
    setIsToggling(true)
    await toggleCarAvailability(car.id, !!car.is_available)
    setIsToggling(false)
  }

  return (
    <div className={`bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 transition-all ${!car.is_available ? 'opacity-75 bg-gray-50 border-gray-200' : 'border-gray-100'}`}>
      
      {/* Top Row: ID & Status Badge */}
      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
        <span className="font-mono text-xs text-gray-400">#{car.id.slice(0,6).toUpperCase()}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${car.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {car.is_available ? 'Active' : 'Hidden'}
        </span>
      </div>

      {/* Car Info */}
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative flex items-center justify-center">
          {car.images?.[0] ? (
            // 2. OPTIMIZED IMAGE COMPONENT
            <Image 
              src={car.images[0]} 
              alt={car.model} 
              fill 
              className="object-cover"
              sizes="64px" // Tells browser "this is just a thumbnail", don't download 5MB file
            />
          ) : (
            // Fallback Icons
            car.category === 'heavy' ? (
               <Tractor className="w-6 h-6 text-gray-300" />
            ) : (
               <Car className="w-6 h-6 text-gray-300" />
            )
          )}
        </div>
        
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{car.make} {car.model}</h3>
          
          <p className="text-xs text-gray-500 mt-1">
            {car.year} • {car.category === 'heavy' ? 'Heavy Equip' : (car.transmission || 'Auto')}
          </p>
          
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm font-bold text-blue-600">{car.base_rate ?? car.daily_rate_omr} OMR</span>
            <span className="text-[10px] text-gray-400">(Vendor Net)</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-gray-50 flex gap-2">
        
        {/* 1. EDIT BUTTON */}
        <Link 
          href={`/vendor/edit-car/${car.id}`}
          className="flex-1 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
           <Edit className="w-3 h-3" /> Edit
        </Link>

        {/* 2. TOGGLE BUTTON */}
        <button 
          onClick={handleToggle}
          disabled={isToggling}
          className="flex-1 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {isToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : (
             car.is_available ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Activate</>
          )}
        </button>

        {/* 3. DELETE BUTTON */}
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : (
            <><Trash2 className="w-3 h-3" /> Delete</>
          )}
        </button>
      </div>
    </div>
  )
}