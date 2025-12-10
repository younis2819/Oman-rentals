'use client'

import { useState } from 'react'
// 👇 FIXED IMPORT: Added (app) to the path
import { updateBookingStatus } from '@/app/(app)/admin/actions'
import { Loader2 } from 'lucide-react'

export default function AdminStatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    if (!confirm(`Change status to ${newStatus}?`)) return

    setLoading(true)
    await updateBookingStatus(id, newStatus)
    setLoading(false)
  }

  return (
    <div className="relative">
      {loading && <Loader2 className="absolute left-2 top-2 w-3 h-3 animate-spin text-gray-500" />}
      <select 
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className={`appearance-none pl-2 pr-6 py-1 rounded text-xs font-bold uppercase cursor-pointer border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50
          ${currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
            currentStatus === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
            currentStatus === 'completed' ? 'bg-gray-100 text-gray-700 border-gray-200' :
            'bg-red-50 text-red-700 border-red-100'}
        `}
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  )
}