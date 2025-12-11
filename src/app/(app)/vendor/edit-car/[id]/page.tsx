import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Car, Tractor, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import EditAssetForm from '@/components/EditAssetForm'

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
    .eq('tenant_id', profile?.tenant_id)
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

        {/* Client Form Component */}
        <EditAssetForm asset={asset} specs={specs} />

      </div>
    </div>
  )
}