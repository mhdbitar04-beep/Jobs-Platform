import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/auth-context'
import { ROLE_HOME } from '@/lib/roles'
import type { Role } from '@/types'

/** Where a guest was heading when they were sent to log in. */
export interface LoginRedirectState {
  from?: string
}

/** Lets signed-in users through; with `roles`, only those roles. Everyone else is redirected. */
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (!user) {
    const state: LoginRedirectState = { from: location.pathname + location.search }
    return <Navigate to="/login" replace state={state} />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role]} replace />
  return <Outlet />
}

/** Login and register: a signed-in user is sent on to where they were heading, or to their home. */
export function GuestOnly() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (user) {
    const { from } = (location.state as LoginRedirectState | null) ?? {}
    return <Navigate to={from ?? ROLE_HOME[user.role]} replace />
  }
  return <Outlet />
}
