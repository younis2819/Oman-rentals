import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/database.types' 
import SignOutButton from '@/components/SignOutButton'
import Link from 'next/link'
import { ArrowLeft, Archive, XCircle, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type BookingWithDetails = Database['public']['Tables']['bookings']['Row'] & {
  tenants: { name: string } | null
}

export default async function AuditLog() {
  const supabase = await createClient()

  // Fetch only Completed/Cancelled
  const { data: history } = await supabase
    .from('bookings')
    .select(`*, tenants ( name )`)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .returns<BookingWithDetails[]>()

  const logs = history || []

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white rounded-full text-gray-500 hover:text-black transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Archive className="w-6 h-6 text-gray-400" /> Audit Log
              </h1>
              <p className="text-sm text-gray-500">Historical records of finished bookings</p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="p-4">Ref</th>
                <th className="p-4">Date</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Final Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-xs text-gray-400">#{log.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-900">{log.tenants?.name}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{log.customer_name}</div>
                    <div className="text-xs text-gray-400">{log.customer_phone}</div>
                  </td>
                  <td className="p-4 text-right font-mono">{log.total_price_omr} OMR</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${
                      log.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {log.status === 'completed' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">No history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}