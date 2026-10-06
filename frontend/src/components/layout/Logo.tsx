import { Link } from 'react-router-dom'
import { cn } from '@/lib/format'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2 font-display text-lg font-bold', inverted ? 'text-white' : 'text-ink-900')}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <rect width="32" height="32" rx="7" className={inverted ? 'fill-white/15' : 'fill-brand-600'} />
        <path d="M9 21.5V12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="20" r="2.6" className="fill-accent-400" />
      </svg>
      Jobs Platform
    </Link>
  )
}
