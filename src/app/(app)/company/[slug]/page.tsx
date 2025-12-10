import { notFound } from 'next/navigation'
import { getCompanyBySlug, getCompanyFleet } from '@/app/actions' 
import { Building2, Car, ShieldCheck, MapPin, ArrowLeft, Tractor, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image' 
import CarCard from '@/components/CarCard' 
import { createClient } from '@/utils/supabase/server' 

// Next.js 15: Params must be awaited
type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props) {
  const params = await props.params
  const company = await getCompanyBySlug(params.slug)
  return {
    title: company ? `${company.name} - Oman Rentals` : 'Company Not Found',
  }
}

export default async function CompanyPage(props: Props) {
  const params = await props.params
  const company = await getCompanyBySlug(params.slug)

  if (!company) {
    return notFound()
  }

  // 2. CHECK IF CURRENT USER IS THE OWNER
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isOwner = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
      
    if (profile?.tenant_id === company.id) {
        isOwner = true
    }
  }

  const fleet = await getCompanyFleet(company.id)
  
  // 3. SPLIT THE FLEET (Cars vs Heavy)
  const cars = fleet.filter((item: any) => item.category === 'car' || !item.category)
  const heavy = fleet.filter((item: any) => item.category === 'heavy')
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* 🔴 HEADER REMOVED (Handled globally) */}

      {/* --- 1. COMPANY HERO SECTION --- */}
      <div className="bg-white border-b border-gray-200 relative">
        
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            
            {/* LOGO AVATAR */}
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm shrink-0 overflow-hidden relative">
              {company.logo_url ? (
                 <Image 
                   src={company.logo_url} 
                   alt={company.name} 
                   fill 
                   className="object-cover"
                 />
              ) : (
                 <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-600" />
                 </div>
              )}
            </div>

            <div className="flex-1">
              {/* HEADER ROW: Name + Verified Badge + Edit Button */}
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">{company.name}</h1>
                
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-green-200">
                  <ShieldCheck className="w-3 h-3" /> Verified Partner
                </span>

                {/* ✨ OPTION 1: INLINE EDIT BUTTON */}
                {isOwner && (
                    <Link 
                      href="/vendor/settings" 
                      className="ml-1 bg-gray-100 hover:bg-black hover:text-white text-gray-600 px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-200"
                    >
                       <Settings className="w-3 h-3" /> Edit Profile
                    </Link>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {company.address || 'Muscat, Oman'}
                </div>
                <div className="flex items-center gap-1">
                  <Car className="w-4 h-4 text-gray-400" />
                  {fleet.length} assets listed
                </div>
              </div>

               <p className="text-gray-600 max-w-2xl leading-relaxed mx-auto md:mx-0">
                   Rent directly from {company.name}. We offer a wide range of verified vehicles maintained to the highest standards.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. FLEET GRID --- */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        
        {/* CARS SECTION */}
        {cars.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
               <Car className="w-5 h-5 text-blue-600" />
               <h2 className="text-lg font-bold text-gray-900">Passenger Fleet</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car: any) => (
                 // @ts-ignore
                 <CarCard key={car.id} car={car} />
              ))}
            </div>
          </section>
        )}

        {/* HEAVY MACHINERY SECTION */}
        {heavy.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
               <Tractor className="w-5 h-5 text-orange-600" />
               <h2 className="text-lg font-bold text-gray-900">Heavy Equipment</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {heavy.map((item: any) => (
                 // @ts-ignore
                 <CarCard key={item.id} car={item} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {fleet.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <Car className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">This partner has no active listings.</p>
          </div>
        )}
      </main>
    </div>
  )
}