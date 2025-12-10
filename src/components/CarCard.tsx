'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Car, Fuel, Gauge, Users, ArrowRight, Tractor, Store } from 'lucide-react'

type CarProps = {
  car: {
    id: string
    make: string
    model: string
    year: number
    transmission: string | null
    daily_rate_omr: number
    images: string[] | null
    is_available: boolean | null 
    category?: 'car' | 'heavy'
    tenants?: {
      name: string
      logo_url?: string | null
    }
  }
}

export default function CarCard({ car }: CarProps) {
  const isHeavy = car.category === 'heavy'
  const isAvailable = car.is_available !== false 

  return (
    <Link 
      href={isAvailable ? `/car/${car.id}` : '#'} 
      className={`group block h-full ${!isAvailable ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
    >
      <div className="relative h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
        
        {/* IMAGE SECTION */}
        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          {car.images?.[0] ? (
            <Image 
              src={car.images[0]} 
              alt={car.model} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300">
               {isHeavy ? <Tractor className="w-12 h-12" /> : <Car className="w-12 h-12" />}
             </div>
          )}
          
          {/* Badge: Status or Type */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
             {!isAvailable && (
                 <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Booked
                 </span>
             )}
             <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isHeavy ? 'bg-orange-500' : 'bg-blue-500'}`} />
                {isHeavy ? 'Heavy' : (car.transmission || 'Auto')}
             </div>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="p-5 flex flex-col flex-1">
          
          {/* Vendor Name & Logo */}
          {car.tenants && (
            <div className="flex items-center gap-2 mb-2">
               <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative border border-gray-100">
                  {car.tenants.logo_url ? (
                      <Image 
                        src={car.tenants.logo_url} 
                        alt={car.tenants.name} 
                        fill 
                        className="object-cover"
                      />
                  ) : (
                      <Store className="w-2.5 h-2.5" />
                  )}
               </div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                 {car.tenants.name}
               </p>
            </div>
          )}

          {/* Car Title */}
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-4">
             {car.make} {car.model} <span className="text-gray-300 font-normal text-sm">'{car.year.toString().slice(2)}</span>
          </h3>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
             <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-medium text-gray-600">Unltd</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-medium text-gray-600">Petrol</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-medium text-gray-600">5 Seat</span>
             </div>
          </div>

          {/* Footer: Price & Action */}
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium line-through">
                   {(car.daily_rate_omr * 1.15).toFixed(0)} OMR
                </span>
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-black text-blue-600">{car.daily_rate_omr}</span>
                   <span className="text-xs font-bold text-gray-900">OMR</span>
                   <span className="text-[10px] text-gray-400 font-medium">/ day</span>
                </div>
             </div>

             <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden group-hover:w-24 group-hover:rounded-xl
                 ${!isAvailable ? 'bg-gray-200 text-gray-400' : 'bg-black text-white'}
             `}>
                {!isAvailable ? (
                    <span className="text-[10px] font-bold">Sold</span>
                ) : (
                    <>
                        <ArrowRight className="w-4 h-4 absolute group-hover:translate-x-10 transition-transform" />
                        <span className="text-xs font-bold opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
                        Book
                        </span>
                    </>
                )}
             </div>
          </div>

        </div>
      </div>
    </Link>
  )
}