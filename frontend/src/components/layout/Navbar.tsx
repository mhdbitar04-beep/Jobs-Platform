import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/format'
import { Logo } from './Logo'
import { GUEST_NAV, TOP_NAV, type NavItem } from './navigation'
import { NotificationBell } from './NotificationBell'
import { UserMenu } from './UserMenu'

function navLinkStyles({ isActive }: { isActive: boolean }): string {
  return cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  )
}

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return items.map((item) => (
    <NavLink key={item.to} to={item.to} className={navLinkStyles} onClick={onNavigate}>
      {item.label}
    </NavLink>
  ))
}

export function Navbar() {
  const { user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const items = user ? TOP_NAV[user.role] : GUEST_NAV
  const closeMobile = () => setIsMobileOpen(false)

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <NavLinks items={items} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className={buttonStyles('ghost')}>
                Log in
              </Link>
              <Link to="/register" className={buttonStyles('primary')}>
                Create account
              </Link>
            </div>
          )}
          <button
            type="button"
            className="rounded-md p-2 text-ink-700 hover:bg-ink-100 md:hidden"
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="flex flex-col gap-1 border-t border-ink-200 px-4 py-3 md:hidden">
          <NavLinks items={items} onNavigate={closeMobile} />
          {!user && (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink-200 pt-3">
              <Link to="/login" className={buttonStyles('secondary')} onClick={closeMobile}>
                Log in
              </Link>
              <Link to="/register" className={buttonStyles('primary')} onClick={closeMobile}>
                Create account
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
