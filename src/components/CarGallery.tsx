'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react'

export default function CarGallery({ 
  images, 
  primaryColor 
}: { 
  images: string[] | null, 
  primaryColor: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  // Fallback if no images
  if (!images || images.length === 0) {
    return (
        <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
            No Images Available
        </div>
    )
  }

  // Handle Lightbox Navigation
  const next = (e: any) => { e.stopPropagation(); setIdx((prev) => (prev + 1) % images.length) }
  const prev = (e: any) => { e.stopPropagation(); setIdx((prev) => (prev - 1 + images.length) % images.length) }

  return (
    <>
      {/* 1. THE BENTO GRID (Compact & Beautiful) */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative">
         
         {/* Main Image (Takes half width) */}
         <div 
           onClick={() => { setIdx(0); setIsOpen(true) }}
           className="md:col-span-2 md:row-span-2 relative cursor-pointer group bg-gray-100"
         >
            <Image src={images[0]} alt="Main View" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
         </div>

         {/* Side Images (Hidden on mobile, visible on desktop) */}
         {/* If we have fewer than 5 images, we just show what we have, or placeholders */}
         {[1, 2, 3, 4].map((i) => (
             <div 
               key={i}
               onClick={() => { if(images[i]) { setIdx(i); setIsOpen(true); } }}
               className={`relative bg-gray-100 cursor-pointer group hidden md:block ${!images[i] ? 'bg-gray-50' : ''}`}
             >
                {images[i] && (
                    <>
                        <Image src={images[i]} alt={`View ${i}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </>
                )}
             </div>
         ))}

         {/* "Show All" Button */}
         <button 
           onClick={() => setIsOpen(true)}
           className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition-transform flex items-center gap-2"
         >
            <Grid className="w-3.5 h-3.5" /> Show all photos
         </button>
      </div>

      {/* 2. LIGHTBOX MODAL (Full Screen View) */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200">
            {/* Close */}
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2">
                <X className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="relative w-full max-w-5xl aspect-video mx-4">
                <Image src={images[idx]} alt="Full view" fill className="object-contain" />
            </div>

            {/* Navigation */}
            <button onClick={prev} className="absolute left-4 text-white p-4 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={next} className="absolute right-4 text-white p-4 hover:bg-white/10 rounded-full transition-colors">
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-6 text-white/50 text-sm font-medium tracking-widest">
                {idx + 1} / {images.length}
            </div>
        </div>
      )}
    </>
  )
}