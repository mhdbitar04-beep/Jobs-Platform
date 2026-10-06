import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/format'
import { Navbar } from './Navbar'
import type { NavItem } from './navigation'

interface DashboardLayoutProps {
  title: string
  items: NavItem[]
}

/** The company and admin areas: a sidebar on wide screens, a scrolling tab strip on narrow ones. */
export function DashboardLayout({ title, items }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
        <aside className="lg:w-56 lg:shrink-0">
          <nav aria-label={title} className="lg:sticky lg:top-24">
            <p className="mb-2 hidden px-3 text-xs font-semibold text-ink-500 lg:block">{title}</p>
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                        isActive ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-ink-200/60',
                      )
                    }
                  >
                    {Icon && <Icon className="size-4" aria-hidden />}
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
