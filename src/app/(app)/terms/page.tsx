import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="prose prose-blue max-w-none">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              Welcome to Oman Rentals. By accessing our website and using our services, you agree to be bound by these terms. 
              We act as an intermediary platform connecting Renters (You) with verified Rental Companies (Vendors).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Booking & Payments</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><strong>Reservations:</strong> A booking request is not confirmed until accepted by the Rental Company.</li>
              <li><strong>Payments:</strong> You agree to pay the total rental fees including any security deposits required by the Vendor.</li>
              <li><strong>Cancellations:</strong> Cancellations made less than 24 hours before pickup may incur a fee charged by the Vendor.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Liability</h2>
            <p className="text-gray-600">
              Oman Rentals is a marketplace. We verify partners, but we are not responsible for the mechanical condition of vehicles 
              or the actions of Rental Companies. Any disputes regarding damage or service quality must be resolved directly with the Vendor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
            <p className="text-gray-600">
              You agree to provide accurate information when booking. Use of the vehicle must comply with the laws of the Sultanate of Oman.
            </p>
          </section>

          <p className="text-sm text-gray-400 mt-12 border-t pt-8">
            Questions? Contact us at support@omanrentals.com
          </p>
        </div>
      </div>
    </div>
  )
}