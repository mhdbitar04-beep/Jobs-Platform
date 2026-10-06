import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/format'
import type { PaginationMeta } from '@/types'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

/** The current page, its neighbours, and the first and last page; null marks a gap. */
function visiblePages(current: number, last: number): (number | null)[] {
  const wanted = [1, current - 1, current, current + 1, last].filter((page) => page >= 1 && page <= last)
  const pages = [...new Set(wanted)].sort((a, b) => a - b)
  return pages.flatMap((page, index) => (index > 0 && page - pages[index - 1] > 1 ? [null, page] : [page]))
}

const stepStyles =
  'flex size-9 items-center justify-center rounded-md border border-ink-300 bg-white text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40'

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page: current, last_page: last } = meta
  if (last <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <button type="button" className={stepStyles} disabled={current === 1} onClick={() => onPageChange(current - 1)} aria-label="Previous page">
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {visiblePages(current, last).map((page, index) =>
        page === null ? (
          <span key={`gap-${index}`} className="px-1 text-ink-400" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === current ? 'page' : undefined}
            className={cn(
              'size-9 rounded-md text-sm font-semibold',
              page === current ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-ink-100',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button type="button" className={stepStyles} disabled={current === last} onClick={() => onPageChange(current + 1)} aria-label="Next page">
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  )
}
