'use client'

import CarCard from '@/components/CarCard'
import { useEffect, useState } from 'react'

export default function FeaturedFleetScroller({ fleet }: { fleet: any[] }) {
  // If we don't have enough cars to scroll smoothly, we just show a grid.
  // But to fake the "Infinite" look, we need to duplicate the list enough times to fill the screen width.
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Duplicate the fleet 3 times to ensure smooth infinite looping even on wide screens
  const loopFleet = [...fleet, ...fleet, ...fleet]

  return (
    <div className="w-full overflow-hidden py-4 bg-white border-y border-gray-100 group">
      
      {/* The Animation Container 
         - animate-scroll: Custom CSS animation we will define
         - group-hover:paused: Stops moving when user wants to click
      */}
      <div className="flex gap-6 w-max animate-scroll hover:[animation-play-state:paused]">
        {loopFleet.map((car, index) => (
          // We wrap it in a div with fixed width so cards look consistent
          <div key={`${car.id}-${index}`} className="w-[300px] md:w-[350px] flex-shrink-0 transition-opacity duration-300 hover:opacity-100 opacity-90">
             {/* @ts-ignore */}
             <CarCard car={car} />
          </div>
        ))}
      </div>
      
    </div>
  )
}