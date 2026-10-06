import { cn, getInitials } from '@/lib/format'

const PALETTE = [
  'bg-brand-100 text-brand-800',
  'bg-accent-100 text-accent-700',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
  'bg-lime-100 text-lime-800',
]

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-lg',
}

interface AvatarProps {
  name: string
  size?: keyof typeof SIZES
  /** Companies get a rounded square, people a circle. */
  shape?: 'square' | 'circle'
  className?: string
}

/** Initials on a colour picked from the name, so the same name always looks the same. */
export function Avatar({ name, size = 'md', shape = 'circle', className }: AvatarProps) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center font-display font-bold',
        shape === 'circle' ? 'rounded-full' : 'rounded-lg',
        PALETTE[hash % PALETTE.length],
        SIZES[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
