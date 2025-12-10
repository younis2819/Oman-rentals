'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Car, Tractor, Loader2, Upload, ChevronLeft, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner' // <--- 1. Beautiful Alerts

export default function AddAssetPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [category, setCategory] = useState<'car' | 'heavy'>('car')
  
  // New State for Multi-Image & Description
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState('')

  // --- 1. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    // Limit check
    if (images.length + e.target.files.length > 5) {
        toast.error('Maximum 5 images allowed')
        return
    }

    try {
      setIsUploading(true)
      const newUrls: string[] = []

      // Upload each file
      for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('fleet-images') // Your existing bucket
            .upload(fileName, file)

          if (uploadError) throw uploadError

          // Get Public URL
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

  // Remove image from list
  const removeImage = (indexToRemove: number) => {
      setImages(images.filter((_, i) => i !== indexToRemove))
  }

  // --- 2. HANDLE SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get Tenant ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user?.id)
      .single()

    if (!profile?.tenant_id) {
      toast.error('Error: You are not a vendor.')
      setIsSubmitting(false)
      return
    }

    // Prepare Base Data
    const baseData = {
      tenant_id: profile.tenant_id,
      category: category,
      make: formData.get('make'),
      model: formData.get('model'),
      year: Number(formData.get('year')),
      daily_rate_omr: Number(formData.get('price')),
      is_available: true,
      features: (formData.get('features') as string).split(',').map(s => s.trim()),
      
      // 👇 NEW FIELDS
      description: description,
      images: images, // Send the array of URLs
    }

    // Prepare Dynamic Specs
    const specs = category === 'car' 
      ? { 
          transmission: formData.get('transmission'),
        } 
      : { 
          tonnage: formData.get('tonnage'), 
          usage_hours: formData.get('hours'),
          reach: formData.get('reach')
        } 

    // Insert into Supabase
    const { error } = await supabase.from('fleet').insert({
      ...baseData,
      transmission: category === 'car' ? formData.get('transmission') : null,
      specs: specs 
    })

    if (error) {
      toast.error(error.message)
      setIsSubmitting(false)
    } else {
      toast.success('Asset created successfully!')
      router.push('/vendor/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans pb-20">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/dashboard" className="p-2 bg-white rounded-full border border-gray-200 shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Add New Asset</h1>
        </div>

        {/* Category Toggle */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            type="button"
            onClick={() => setCategory('car')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              category === 'car' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <Car className="w-6 h-6" />
            <span className="font-bold text-sm">Passenger Car</span>
          </button>

          <button 
            type="button"
            onClick={() => setCategory('heavy')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              category === 'heavy' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500'
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
                <input name="make" required placeholder={category === 'car' ? "Toyota" : "Caterpillar"} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Model</label>
                <input name="model" required placeholder={category === 'car' ? "Camry" : "320D Excavator"} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Year</label>
                <input name="year" type="number" required placeholder="2024" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Daily Rate (OMR)</label>
                <input name="price" type="number" required placeholder="0.00" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
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
                <select name="transmission" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none">
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
                <input name="features" placeholder="Features (e.g. GPS, Sunroof)" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none" />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-2">
                  <Tractor className="w-3 h-3" /> Machine Specs
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input name="tonnage" placeholder="Capacity (Tons)" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none" />
                  <input name="hours" placeholder="Usage Hours" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none" />
                </div>
                <input name="features" placeholder="Capabilities (e.g. 50m reach, Rock bucket)" className="w-full p-3 bg-white rounded-lg border border-gray-200 outline-none" />
              </div>
            )}
          </div>

          {/* 👇 NEW: DESCRIPTION FIELD */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
            <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                placeholder="Describe the condition, rules, or extra details..."
            />
          </div>

          {/* 👇 NEW: MULTI-IMAGE UPLOAD */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Photos (Max 5)</label>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* 1. Previews */}
                {images.map((url, i) => (
                    <div key={i} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden group border border-gray-200">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* 2. Upload Button */}
                {images.length < 5 && (
                    <label className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
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
            <p className="text-xs text-gray-400">First image will be the cover photo.</p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="w-full bg-black text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50 shadow-lg active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'List Asset'}
          </button>

        </form>
      </div>
    </div>
  )
}