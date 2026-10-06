import { Search } from 'lucide-react'
import { useEffect, useId, useState, type ComponentType } from 'react'
import { cn } from '@/lib/format'
import { controlStyles } from './fieldStyles'

const DEBOUNCE_MS = 350

interface SearchFieldProps {
  label: string
  value: string
  onCommit: (value: string) => void
  placeholder?: string
  icon?: ComponentType<{ className?: string }>
  className?: string
}

/** A text filter that reports what was typed once the typing pauses. */
export function SearchField({ label, value, onCommit, placeholder, icon: Icon = Search, className }: SearchFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  const [committed, setCommitted] = useState(value)
  const [seenValue, setSeenValue] = useState(value)

  // The value changed. If it is not the echo of our own commit, it came from outside
  // (back button, "clear filters"), so the box follows it.
  if (value !== seenValue) {
    setSeenValue(value)
    if (value !== committed) {
      setCommitted(value)
      setDraft(value)
    }
  }

  useEffect(() => {
    if (draft === committed) return
    const timer = window.setTimeout(() => {
      setCommitted(draft)
      onCommit(draft)
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [draft, committed, onCommit])

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-800">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          id={id}
          type="search"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          className={cn(controlStyles, 'h-10 pl-9')}
        />
      </div>
    </div>
  )
}
