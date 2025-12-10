import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'
import Navbar from '@/components/Navbar'
import { Toaster } from 'sonner' // <--- 1. Import Sonner

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Oman Rentals | Cars & Heavy Machinery',
  description: 'Rent verified cars and heavy equipment directly from local companies in Oman.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        
        {/* 2. Top Navbar (Handles Logic: Vendor vs Customer) */}
        <Navbar />

        {/* 3. Main Content (Wrapped to ensure minimum height) */}
        <main className="min-h-screen">
            {children}
        </main>
        
        {/* 4. Global Footer */}
        <Footer /> 
        
        {/* 5. Sticky Mobile Nav (Vendor Only) */}
        <MobileNav />

        {/* 6. Notification Toaster (Invisible until triggered) */}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}