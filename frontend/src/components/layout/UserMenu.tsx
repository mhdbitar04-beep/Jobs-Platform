import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/context/auth-context'
import { useDismiss } from '@/hooks/useDismiss'
import { ROLE_LABELS } from '@/lib/options'

const itemStyles = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-50'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setIsOpen(false), [])
  useDismiss(containerRef, isOpen, close)

  if (!user) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-ink-100"
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden max-w-32 truncate text-sm font-medium text-ink-800 sm:block">{user.name}</span>
        <ChevronDown className="size-4 text-ink-500" aria-hidden />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg shadow-ink-900/10">
          <div className="border-b border-ink-200 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
            <p className="mt-1 text-xs font-medium text-brand-600">{ROLE_LABELS[user.role]}</p>
          </div>
          <Link to="/profile" role="menuitem" className={itemStyles} onClick={close}>
            <UserRound className="size-4" aria-hidden />
            Profile
          </Link>
          <button type="button" role="menuitem" className={itemStyles} onClick={() => void logout()}>
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
