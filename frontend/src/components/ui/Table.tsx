import type { ComponentProps } from 'react'
import { cn } from '@/lib/format'

/** A table that scrolls sideways inside its card on narrow screens. */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className={cn('w-full min-w-160 text-left text-sm', className)} {...props} />
    </div>
  )
}

export function Th({ className, ...props }: ComponentProps<'th'>) {
  return <th scope="col" className={cn('border-b border-ink-200 bg-ink-50 px-4 py-3 text-xs font-semibold text-ink-600', className)} {...props} />
}

export function Td({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('border-b border-ink-100 px-4 py-3 align-middle', className)} {...props} />
}
