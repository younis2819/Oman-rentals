import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function HomeButton({ className = "" }: { className?: string }) {
  return (
    <Link 
      href="/" 
      className={`group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors ${className}`}
      title="Back to Marketplace"
    >
      <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
        <Home className="w-4 h-4 text-gray-600 group-hover:text-black" />
      </div>
      <span className="hidden md:inline">Marketplace</span>
    </Link>
  )
}