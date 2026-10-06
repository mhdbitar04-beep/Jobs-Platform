import { cn } from '@/lib/format'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-ink-200/70', className)} />
}
