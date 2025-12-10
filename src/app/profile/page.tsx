import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Mail } from 'lucide-react'
// 👇 FIX: Added (app) to the path so it matches your folder structure
import { signOut } from '@/app/(app)/login/actions' 

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-lg mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {profile?.full_name?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{profile?.full_name}</h2>
              <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Email</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                {user.email}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Phone Number</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                {profile?.phone || 'Not set'}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <form action={signOut}>
              <button className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}