'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Car, Tractor, Loader2, Upload, ChevronLeft, X, CheckCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { createVehicle } from '@/app/(app)/vendor/dashboard/actions'

export default function AddAssetPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [category, setCategory] = useState<'car' | 'heavy'>('car')
  
  // State for Images & Description
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState('')

  // --- 1. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    if (images.length + e.target.files.length > 5) {
        toast.error('Maximum 5 images allowed')
        return
    }

    // 1. Validation: Max Size 5MB
    const MAX_SIZE = 5 * 1024 * 1024 
    for (const file of Array.from(e.target.files)) {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" is too large. Max 5MB per image.`)
        return
      }
    }

    // 2. Fetch Tenant ID for Isolation
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        toast.error('You must be logged in')
        return
    }
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    const tenantId = profile?.tenant_id || 'unknown'

    try {
      setIsUploading(true)
      const newUrls: string[] = []

      for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${tenantId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('fleet-images') 
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data } = supabase.storage.from('fleet-images').getPublicUrl(fileName)
          newUrls.push(data.publicUrl)
      }

      setImages((prev) => [...prev, ...newUrls])
      toast.success('Images uploaded!')

    } catch (error) {
      console.error(error)
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  // --- 2. HANDLE IMAGE REMOVAL (Fix: Deletes from Storage) ---
  const removeImage = async (indexToRemove: number) => {
    const urlToRemove = images[indexToRemove]
    
    // Optimistic UI update (remove immediately from view)
    setImages(prev => prev.filter((_, i) => i !== indexToRemove))

    try {
      // Extract the path relative to the bucket (e.g., "tenant_id/image.jpg")
      const filePath = urlToRemove.split('/fleet-images/')[1]?.split('?')[0]
      
      if (filePath) {
        await supabase.storage.from('fleet-images').remove([filePath])
      }
    } catch (err) {
      console.error('Failed to delete image from storage:', err)
      // We don't restore the image in UI because an orphaned file is better than a broken UI state
    }
  }

  // --- 3. HANDLE SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    formData.append('category', category)
    formData.append('description', description)
    formData.append('image_urls', JSON.stringify(images))

    const result = await createVehicle(formData)

    if (result?.error) {
      toast.error(result.error)
      
      // 🗑️ CLEANUP: If DB save fails, delete the uploaded images
      if (images.length > 0) {
          const filesToDelete = images.map(url => {
             // Correct Path Extraction
             return url.split('/fleet-images/')[1]?.split('?')[0]
          }).filter(Boolean) as string[]

          if (filesToDelete.length > 0) {
             await supabase.storage.from('fleet-images').remove(filesToDelete)
          }
      }
      
      setIsSubmitting(false)
    } else {
      toast.success('Asset created successfully!')
      setSuccess(true) 
    }
  }

  // 🟢 1. SUCCESS VIEW
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center animate-in zoom-in duration-300">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-2">Vehicle Published!</h2>
           <p className="text-gray-500 mb-8">Your asset has been successfully added to the fleet and is now ready for bookings.</p>
           
           <div className="space-y-3">
              <Link 
                href="/vendor/dashboard"
                className="block w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Go to Dashboard
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="block w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                   <Plus className="w-4 h-4" /> Add Another Vehicle
                </div>
              </button>
           </div>
        </div>
      </div>
    )
  }

  // 📝 2. FORM VIEW
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans pb-20">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/dashboard" className="p-2 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Add New Asset</h1>
        </div>

        {/* Category Toggle */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            type="button"
            onClick={() => setCategory('car')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              category === 'car' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <Car className="w-6 h-6" />
            <span className="font-bold text-sm">Passenger Car</span>
          </button>

          <button 
            type="button"
            onClick={() => setCategory('heavy')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              category === 'heavy' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <Tractor className="w-6 h-6" />
            <span className="font-bold text-sm">Heavy Machinery</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          
          {/* Universal Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Make</label>
                <input 
                    name="make" 
                    required 
                    placeholder={category === 'car' ? "Toyota" : "Caterpillar"} 
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model</label>
                <input 
                    name="model" 
                    required 
                    placeholder={category === 'car' ? "Camry" : "320D Excavator"} 
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Year</label>
                <input 
                    name="year" 
                    type="number" 
                    required 
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    placeholder="2024" 
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Daily Rate (OMR)</label>
                <input 
                    name="daily_rate_omr" 
                    type="number" 
                    required 
                    min={1}
                    step="0.01"
                    placeholder="0.00" 
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" 
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC FIELDS */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            {category === 'car' ? (
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-2">
                  <Car className="w-3 h-3" /> Vehicle Details
                </label>
                <select name="transmission" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none text-gray-900 font-bold">
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
                <input 
                    name="features" 
                    placeholder="Features (e.g. GPS, Sunroof)" 
                    className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-2">
                  <Tractor className="w-3 h-3" /> Machine Specs
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input name="tonnage" placeholder="Capacity (Tons)" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" />
                  <input name="usage_hours" placeholder="Usage Hours" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" />
                </div>
                <input name="features" placeholder="Capabilities (e.g. 50m reach, Rock bucket)" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-normal" />
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
            <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black min-h-[100px] text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="Describe the condition, rules, or extra details..."
            />
          </div>

          {/* MULTI-IMAGE UPLOAD */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Photos (Max 5)</label>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
                {images.map((url, i) => (
                    <div key={i} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden group border border-gray-200 shadow-sm">
                        <Image 
                            src={url} 
                            alt="preview" 
                            fill 
                            sizes="150px" // Fix: Added sizes for performance
                            className="object-cover" 
                        />
                        <button 
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {images.length < 5 && (
                    <label className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors bg-gray-50">
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400"/> : <Upload className="w-6 h-6 text-gray-400" />}
                        <span className="text-xs text-gray-400 font-bold mt-2">Add Photo</span>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload} 
                            disabled={isUploading}
                        />
                    </label>
                )}
            </div>
            <p className="text-[10px] text-gray-400">First image will be the cover photo.</p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isUploading || images.length === 0}
            className="w-full bg-black text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50 shadow-lg active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'List Asset'}
          </button>

        </form>
      </div>
    </div>
  )
}