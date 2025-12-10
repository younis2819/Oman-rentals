import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updateAsset } from './actions'
import { Car, Tractor, Save, X, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditAssetPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Fetch Asset & Verify Ownership
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  
  const { data: asset } = await supabase
    .from('fleet')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', profile?.tenant_id) // Security Check
    .single()

  if (!asset) return notFound()

  // Helper to safely get specs
  const specs = asset.specs as any || {}

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans flex justify-center items-center">
      <div className="max-w-xl w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard" className="p-2 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-black text-gray-900">Edit Asset</h1>
          </div>
          <div className="px-3 py-1 bg-gray-200 rounded-lg text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
             {asset.category === 'car' ? <Car className="w-3 h-3"/> : <Tractor className="w-3 h-3"/>}
             {asset.category}
          </div>
        </div>

        {/* 👇 FIX: Wrapped action to satisfy TypeScript */}
        <form 
          action={async (formData) => {
            'use server'
            await updateAsset(formData)
          }} 
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6"
        >
          <input type="hidden" name="id" value={asset.id} />
          <input type="hidden" name="category" value={asset.category} />

          {/* Image Preview (Read Only) */}
          <div className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
             {asset.images?.[0] ? (
                <img src={asset.images[0]} className="w-full h-full object-cover opacity-90" />
             ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image Uploaded</div>
             )}
             <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center backdrop-blur-sm">
                To change images, please delete and re-list (Beta)
             </div>
          </div>

          {/* Universal Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Make</label>
                <input name="make" defaultValue={asset.make} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-900" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model</label>
                <input name="model" defaultValue={asset.model} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Year</label>
                <input name="year" type="number" defaultValue={asset.year} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rate (OMR)</label>
                <input name="price" type="number" defaultValue={asset.daily_rate_omr} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-black text-blue-600" />
              </div>
            </div>
          </div>

          {/* DYNAMIC FIELDS: Car vs Heavy */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
            {asset.category === 'car' ? (
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-2">
                  <Car className="w-3 h-3" /> Vehicle Details
                </label>
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
                <input name="features" defaultValue={asset.features?.join(', ')} className="w-full p-3 bg-white rounded-xl border border-gray-200" />
            </div>
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95">
            <Save className="w-5 h-5" /> Save Changes
          </button>

        </form>
      </div>
    </div>
  )
}