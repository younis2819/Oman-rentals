import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="prose prose-blue max-w-none">
          <h1 className="text-3xl font-black text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            At Oman Rentals, we value your privacy. This policy outlines how we collect, use, and protect your personal information 
            in compliance with Oman's Data Protection laws.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Information We Collect</h3>
              <p className="text-gray-600">
                We collect your name, phone number, and email address solely to facilitate booking requests. 
                We do not store credit card details directly on our servers.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">How We Use Your Data</h3>
              <p className="text-gray-600">
                Your contact details are shared <strong>only</strong> with the specific Rental Company you book with. 
                This allows them to contact you for vehicle delivery or pickup coordination.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Data Security</h3>
              <p className="text-gray-600">
                We use industry-standard encryption (SSL) to protect your account and booking details. 
                Access to your personal data is restricted to authorized personnel only.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Rights</h3>
              <p className="text-gray-600">
                You have the right to request deletion of your account and data at any time by contacting support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}