import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  hint?: string
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <Icon className="size-5 text-brand-400" aria-hidden />
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ink-900 tabular-nums">{formatNumber(value)}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </Card>
  )
}
