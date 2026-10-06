import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/format'

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn('animate-spin', className ?? 'size-5')} aria-hidden />
}

/** A centred spinner for a page or panel that is still loading. */
export function PageSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-64 items-center justify-center text-brand-500">
      <Spinner className="size-7" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
