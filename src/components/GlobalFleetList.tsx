import Link from 'next/link'
import { ArrowRight, Car, Tractor } from 'lucide-react'

// Define the shape of the data we expect
interface FleetItem {
  id: string
  make: string
  model: string
  year: number
  daily_rate_omr: number
  images: string[] | null
  category: 'car' | 'heavy' | null
  transmission: string | null
  specs: any
  tenants?: {
    name: string
  } | null
}

export default function GlobalFleetList({ fleet }: { fleet: FleetItem[] }) {
  
  if (!fleet || fleet.length === 0) {
    return null // Empty state is handled by the parent page
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fleet.map((item) => (
        <Link key={item.id} href={`/car/${item.id}`} className="block group">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-all flex flex-col h-full">
            
            {/* Image Section */}
            <div className="h-48 relative bg-gray-200">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                   {item.category === 'heavy' ? <Tractor className="w-8 h-8"/> : <Car className="w-8 h-8"/>}
                </div>
              )}
              
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-black shadow-sm">
                {item.daily_rate_omr} OMR
              </div>

              {/* Badges */}
              {item.category === 'car' ? (
                 <div className="absolute top-3 left-3 bg-black/50 text-white backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase">
                   {item.transmission || 'Auto'}
                 </div>
              ) : (
                 <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">
                   Heavy
                 </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.make} {item.model}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.year} • {item.tenants?.name || 'Partner'}
                  </p>
                </div>
              </div>

              {/* Specs (Heavy Only) */}
              {item.category === 'heavy' && item.specs && (
                <div className="mt-3 flex gap-2 flex-wrap">
                   {/* @ts-ignore */}
                   {item.specs.tonnage && (
                     <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded border border-orange-100">
                       {/* @ts-ignore */}
                       {item.specs.tonnage} Tons
                     </span>
                   )}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-end gap-2 text-blue-600 font-bold text-sm">
                 View Details <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}