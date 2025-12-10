import Link from 'next/link'
import { Car, Tractor, Instagram, Twitter, Facebook, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
               <div className="bg-blue-600 p-1.5 rounded-lg">
                 <Car className="w-5 h-5 text-white" />
               </div>
               <span className="text-xl font-extrabold tracking-tight">
                 OMAN<span className="text-blue-500">RENTALS</span>
               </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The first verified marketplace for mobility and heavy machinery in the Sultanate of Oman.
            </p>
          </div>

          {/* Links: Discover */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Discover</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/?category=car" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Car className="w-4 h-4" /> Rent a Car
                </Link>
              </li>
              <li>
                <Link href="/?category=heavy" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Tractor className="w-4 h-4" /> Heavy Equipment
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-300 hover:text-white transition-colors">
                  Browse All
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Partners */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Partners</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/vendor/add-car" className="text-gray-300 hover:text-white transition-colors">
                  List Your Fleet
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Partner Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Support</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4" /> +968 9000 0000
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" /> support@omanrentals.com
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-xs">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-xs">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Oman Rentals. All rights reserved. CR: 1234567
          </p>
          
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}