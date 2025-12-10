import { LucideIcon } from 'lucide-react'

export default function DashboardStat({ 
  label, 
  value, 
  subValue, 
  icon: Icon,
  trend 
}: { 
  label: string, 
  value: string, 
  subValue?: string, 
  icon: LucideIcon,
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        {subValue && <p className="text-xs text-gray-500 mt-1 font-medium">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${
        trend === 'up' ? 'bg-green-50 text-green-600' : 
        trend === 'down' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}