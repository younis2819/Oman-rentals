'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageSlider({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fallback if no images
  if (!images || images.length === 0) {
    return <div className="h-48 w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">No Photos</div>
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link clicks if wrapped in Link
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100 group">
      <Image 
        src={images[currentIndex]} 
        alt="Vehicle view" 
        fill 
        className="object-cover" 
      />
      
      {/* Navigation Buttons (Only show if >1 image) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prev} 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          
          <button 
            onClick={next} 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
          >
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}