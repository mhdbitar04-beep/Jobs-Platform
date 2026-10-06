import type { ComponentProps } from 'react'
import { cn } from '@/lib/format'

/** The page's centred content column. */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6', className)} {...props} />
}
