'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateVendorLogo, updateVendorDetails } from './actions' 
import { Loader2, Upload, Image as ImageIcon, Save, Building2, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Define types for Tenant Data
type TenantData = {
  name: string | null
  logo_url: string | null
  whatsapp_number: string | null
  address: string | null
}

export default function VendorSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  
  // State for Form Fields
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')

  // 1. Fetch Current Data on Mount
  useEffect(() => {
    const fetchData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            router.push('/login')
            return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id, tenants(name, logo_url, whatsapp_number, address)')
          .eq('id', user.id)
          .single()

        if (profile?.tenant_id) {
            setTenantId(profile.tenant_id)
        }

        // Properly handle the tenant data type
        const rawTenant = profile?.tenants
        
        // 👇 FIX: Double cast to 'unknown' first to bypass the overlap error
        const tenant = (Array.isArray(rawTenant) ? rawTenant[0] : rawTenant) as unknown as TenantData | null

        if (tenant) {
            setCurrentLogo(tenant.logo_url)
            setName(tenant.name || '')
            setWhatsapp(tenant.whatsapp_number || '')
            setAddress(tenant.address || '')
        }
        setLoading(false)
    }
    fetchData()
  }, [router])

  // 2. Handle Text Details Update
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const formData = new FormData()
    formData.append('name', name)
    formData.append('whatsapp', whatsapp)
    formData.append('address', address)

    const result = await updateVendorDetails(formData)
    setSaving(false)

    if (result.error) {
       toast.error(result.error)
    } else {
       toast.success('Company details updated successfully!')
    }
  }

  // 3. Handle Logo Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE) {
        toast.error('Logo must be under 2MB')
        return
    }
    
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('Only JPG, PNG, or WebP images are allowed')
        return
    }

    if (!tenantId) {
        toast.error('Session error. Please refresh.')
        return
    }

    try {
      setUploading(true)
      const supabase = createClient()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${tenantId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      const result = await updateVendorLogo(urlData.publicUrl, currentLogo || undefined)
      if (result.error) throw new Error(result.error)

      setCurrentLogo(urlData.publicUrl)
      toast.success('Logo updated successfully!')
      
    } catch (error: any) {
      console.error(error)
      toast.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans pb-20">
       <div className="max-w-2xl mx-auto space-y-6">
          
          <div>
            <h1 className="text-2xl font-black text-gray-900">Settings</h1>
            <p className="text-gray-500">Manage your public company profile.</p>
          </div>

          {/* CARD 1: LOGO UPLOAD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-400" /> Company Logo
             </h2>
             
             <div className="flex items-start gap-8">
                <div className="relative w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                   {currentLogo ? (
                      <Image 
                        src={currentLogo} 
                        alt="Logo" 
                        fill 
                        sizes="96px" 
                        className="object-cover" 
                      />
                   ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                   )}
                   {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                         <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                   )}
                </div>

                <div className="flex-1">
                   <label className="block">
                      <div className="relative group cursor-pointer w-fit">
                         <div className={`flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                            <Upload className="w-4 h-4" /> 
                            {uploading ? 'Uploading...' : 'Change Logo'}
                         </div>
                         <input 
                           type="file" 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                           accept="image/png, image/jpeg, image/webp"
                           onChange={handleFileChange}
                           disabled={uploading}
                         />
                      </div>
                   </label>
                   <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Recommended: Square JPG or PNG (400x400px), max 2MB.
                   </p>
                </div>
             </div>
          </div>

          {/* CARD 2: COMPANY DETAILS FORM */}
          <form onSubmit={handleSaveDetails} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" /> Company Details
             </h2>
             
             {/* Name */}
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Company Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  placeholder="e.g. Budget Muscat"
                  required
                  minLength={2}
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> WhatsApp Number
                    </label>
                    <input 
                      type="tel" 
                      value={whatsapp} 
                      onChange={e => setWhatsapp(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                      placeholder="e.g. 96812345678"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Office Location
                    </label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                      placeholder="e.g. Al Khuwair, Muscat"
                    />
                </div>
             </div>

             <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving || uploading} 
                  className={`bg-black text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   Save Changes
                </button>
             </div>
          </form>

       </div>
    </div>
  )
}