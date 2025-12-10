import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, Gauge, Cog, Tractor, Car, Fuel, Users, ShieldCheck, Star, MapPin, Building2, Calendar, Info } from 'lucide-react'
import CarGallery from '@/components/CarGallery'
import BookingWidget from '@/components/BookingWidget'
import { Metadata } from 'next'

// Next.js 15+ Props
type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const supabase = await createClient()

  const { data: car } = await supabase
    .from('fleet')
    .select('*, tenants(name)')
    .eq('id', params.id)
    .single()

  if (!car) return { title: 'Car Not Found' }

  return {
    title: `Rent ${car.make} ${car.model} | Oman Rentals`,
    openGraph: {
      images: car.images?.[0] ? [car.images[0]] : [],
    },
  }
}

export default async function CarDetailsPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()

  const { data: car } = await supabase
    .from('fleet')
    .select('*, tenants(*)')
    .eq('id', params.id)
    .single()

  if (!car) return notFound()

  // Fetch User
  const { data: { user } } = await supabase.auth.getUser()
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
    if (profile) userProfile = { name: profile.full_name, phone: profile.phone }
  }

  const tenant = car.tenants
  const primaryColor = tenant.brand_config?.primary || '#2563eb' 

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      
      {/* 1. HEADER (Clean & Simple) */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
         <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
               <ArrowLeft className="w-4 h-4" /> Back to Search
            </Link>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* 2. TITLE SECTION (More Padding) */}
        <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                {car.make} {car.model} <span className="text-gray-300 font-medium">'{car.year}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5 text-black bg-gray-100 px-2 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-black" /> 5.0
                </span>
                <span className="flex items-center gap-1.5">
                    {car.category === 'heavy' ? <Tractor className="w-4 h-4"/> : <Car className="w-4 h-4"/>}
                    {car.category === 'heavy' ? 'Heavy Machinery' : 'Passenger Vehicle'}
                </span>
                <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {tenant.address || 'Muscat, Oman'}
                </span>
            </div>
        </div>

        {/* 3. GALLERY (Fixed Aspect Ratio + No Black Bars) */}
        {/* We wrap the gallery in a specific height to force spacing */}
        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-16 bg-gray-50 aspect-[16/10] md:aspect-[21/9] relative">
            <CarGallery images={car.images} primaryColor={primaryColor} />
        </div>

        {/* 4. MAIN GRID (More Gap: gap-16) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            
            {/* LEFT CONTENT */}
            <div className="lg:col-span-2 space-y-16">
                
                {/* HOST INFO CARD */}
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden relative shadow-sm">
                           {tenant.logo_url ? (
                               <Image src={tenant.logo_url} alt={tenant.name} fill className="object-cover" />
                           ) : (
                               <Building2 className="w-7 h-7 text-gray-300" />
                           )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">Hosted by {tenant.name}</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <span className="text-blue-600">Verified Vendor</span>
                                <span>•</span>
                                <span>Joined 2024</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">About this vehicle</h3>
                    <p className="text-gray-600 leading-loose text-lg font-light">
                        Rent this premium {car.make} {car.model} directly from {tenant.name}. 
                        This vehicle is perfectly maintained and ready for your {car.category === 'heavy' ? 'construction needs' : 'journey'}. 
                        Includes {car.features?.length || 0} premium features and comes with our Best Price Guarantee.
                    </p>
                </section>

                <hr className="border-gray-100" />

                {/* SPECS (Larger Icons) */}
                <section>
                   <h3 className="text-xl font-bold text-gray-900 mb-6">Vehicle Specifications</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-6 rounded-2xl border border-gray-200 flex flex-col items-center text-center gap-3 hover:border-black transition-colors group">
                          <Cog className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                          <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Transmission</p>
                              <p className="font-bold text-gray-900">{car.transmission || 'Auto'}</p>
                          </div>
                      </div>
                      <div className="p-6 rounded-2xl border border-gray-200 flex flex-col items-center text-center gap-3 hover:border-black transition-colors group">
                          <Fuel className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                          <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Fuel</p>
                              <p className="font-bold text-gray-900">Petrol</p>
                          </div>
                      </div>
                      <div className="p-6 rounded-2xl border border-gray-200 flex flex-col items-center text-center gap-3 hover:border-black transition-colors group">
                          <Users className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                          <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Capacity</p>
                              <p className="font-bold text-gray-900">5 Seats</p>
                          </div>
                      </div>
                      <div className="p-6 rounded-2xl border border-gray-200 flex flex-col items-center text-center gap-3 hover:border-black transition-colors group">
                          <Gauge className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                          <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Mileage</p>
                              <p className="font-bold text-gray-900">Unlimited</p>
                          </div>
                      </div>
                   </div>
                </section>

                <hr className="border-gray-100" />

                {/* FEATURES */}
                {car.features && car.features.length > 0 && (
                   <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Included Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                         {car.features.map((feature: string) => (
                             <div key={feature} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                   <Check className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700 font-medium">{feature}</span>
                             </div>
                         ))}
                      </div>
                   </section>
                )}
            </div>

            {/* RIGHT STICKY COLUMN */}
            <div className="relative h-full">
                <div className="sticky top-24 space-y-6">
                    <div className="border border-gray-200 shadow-2xl shadow-gray-200/50 rounded-2xl overflow-hidden bg-white">
                        {/* Header */}
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                             <div>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-3xl font-black">{car.daily_rate_omr}</span>
                                     <span className="text-sm font-bold">OMR</span>
                                 </div>
                                 <p className="text-xs text-gray-400">per day</p>
                             </div>
                             <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                                Best Price
                             </div>
                        </div>
                        
                        <div className="p-6">
                            <BookingWidget
                                carId={car.id}
                                tenantId={tenant.id}
                                carName={`${car.make} ${car.model}`}
                                rate={car.daily_rate_omr}
                                primaryColor={primaryColor}
                                vendorPhone={tenant.whatsapp_number}
                                currentUser={userProfile}
                            />
                        </div>

                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-start gap-3">
                            <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500 leading-relaxed">
                                You won't be charged yet. The vendor will confirm availability shortly after you book.
                            </p>
                        </div>
                    </div>
                    
                    {/* Support Box */}
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                        <ShieldCheck className="w-3 h-3" /> Secure Booking System
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  )
}