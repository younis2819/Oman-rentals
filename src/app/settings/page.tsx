'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from './actions'
import { Loader2, User, Phone, Save, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CustomerSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

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
        .select('full_name, phone, email')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setPhone(profile.phone || '')
        setEmail(profile.email || user.email || '')
      }
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('phone', phone)

    const result = await updateProfile(formData)
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated successfully!')
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-black text-gray-900">Account Settings</h1>
          <p className="text-gray-500">Manage your personal profile.</p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
           
           {/* Email (Read Only) */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
              <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-medium text-gray-500 cursor-not-allowed select-none">
                {email}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Email cannot be changed.</p>
           </div>

           {/* Name */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 flex items-center gap-1">
                 <User className="w-3 h-3" /> Full Name
              </label>
              <input 
                type="text" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                placeholder="John Doe"
                required
                minLength={2}
              />
           </div>

           {/* Phone */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 flex items-center gap-1">
                 <Phone className="w-3 h-3" /> Mobile Number
              </label>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                placeholder="968 9000 0000"
              />
           </div>

           <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={saving} 
                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
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