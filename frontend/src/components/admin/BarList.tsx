import { formatNumber } from '@/lib/format'

interface BarItem {
  label: string
  value: number
  /** Tailwind background class of the bar. */
  color: string
}

interface BarListProps {
  items: BarItem[]
  emptyText: string
}

/** Horizontal bars scaled to the largest value: a chart for a handful of categories, without a chart library. */
export function BarList({ items, emptyText }: BarListProps) {
  const max = Math.max(...items.map((item) => item.value), 1)
  if (items.length === 0) return <p className="px-5 py-8 text-center text-sm text-ink-500">{emptyText}</p>

  return (
    <ul className="space-y-3.5 p-5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink-700">{item.label}</span>
            <span className="font-semibold text-ink-900 tabular-nums">{formatNumber(item.value)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
