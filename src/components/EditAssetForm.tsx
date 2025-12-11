'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateAsset } from '@/app/(app)/vendor/edit-car/[id]/actions'
import { Car, Tractor, Save, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
// 👇 Import Database Types
import { Database } from '@/types/database.types'

type FleetRow = Database['public']['Tables']['fleet']['Row']

// Define specific shape for the JSONB specs
type AssetSpecs = {
  transmission?: string
  seats?: number
  fuel?: string
  tonnage?: string
  usage_hours?: string
  reach?: string
}

type AssetProps = {
  asset: FleetRow
  specs: AssetSpecs
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-black text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
      ) : (
        <><Save className="w-5 h-5" /> Save Changes</>
      )}
    </button>
  )
}

export default function EditAssetForm({ asset, specs }: AssetProps) {
  const [state, formAction] = useActionState(updateAsset, null)

  return (
    <form action={formAction} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
      
      <input type="hidden" name="id" value={asset.id} />
      <input type="hidden" name="category" value={asset.category} />

      {state?.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4" /> {state.error}
        </div>
      )}

      {/* Image Preview */}
      <div className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
         {asset.images?.[0] ? (
            <Image 
                src={asset.images[0]} 
                alt={`${asset.make} ${asset.model}`}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover opacity-90"
            />
         ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image Uploaded</div>
         )}
         <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center backdrop-blur-sm">
            To change images, please delete and re-list (Beta)
         </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Make</label>
            <input name="make" defaultValue={asset.make} required minLength={2} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-900" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model</label>
            <input name="model" defaultValue={asset.model} required minLength={2} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-900" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Year</label>
            <input name="year" type="number" defaultValue={asset.year} required min={1990} max={new Date().getFullYear() + 1} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rate (OMR)</label>
            <input name="price" type="number" defaultValue={asset.daily_rate_omr} required min={1} step="0.01" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-black text-blue-600" />
          </div>
        </div>
      </div>

      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
        {asset.category === 'car' ? (
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-2">
              <Car className="w-3 h-3" /> Vehicle Details
            </label>
            {/* Note: 'transmission' is typed as a string field in DB, but often handled in specs for display. 
                We save it to the column directly here for filtering. */}
            <select name="transmission" defaultValue={asset.transmission || 'Automatic'} className="w-full p-3 bg-white rounded-xl border border-gray-200 outline-none">
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
               <input name="seats" type="number" defaultValue={specs.seats} placeholder="Seats" className="w-full p-3 bg-white rounded-xl border border-gray-200" />
               <input name="fuel" defaultValue={specs.fuel} placeholder="Fuel Type" className="w-full p-3 bg-white rounded-xl border border-gray-200" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-2">
              <Tractor className="w-3 h-3" /> Machine Specs
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input name="tonnage" defaultValue={specs.tonnage} placeholder="Capacity (Tons)" className="w-full p-3 bg-white rounded-xl border border-gray-200" />
              <input name="hours" defaultValue={specs.usage_hours} placeholder="Usage Hours" className="w-full p-3 bg-white rounded-xl border border-gray-200" />
            </div>
            <input name="reach" defaultValue={specs.reach} placeholder="Max Reach (e.g. 50m)" className="w-full p-3 bg-white rounded-xl border border-gray-200" />
          </div>
        )}
        
        <div className="mt-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Features (Comma separated)</label>
            {/* Handle features array safely */}
            <input name="features" defaultValue={asset.features?.join(', ')} className="w-full p-3 bg-white rounded-xl border border-gray-200" />
        </div>
      </div>

      <SubmitButton />

    </form>
  )
}