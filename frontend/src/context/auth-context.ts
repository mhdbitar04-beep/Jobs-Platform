import { createContext, useContext } from 'react'
import type { LoginInput, RegisterInput } from '@/api/auth'
import type { User } from '@/types'

export interface AuthContextValue {
  user: User | null
  /** True while a stored token is being exchanged for the user it belongs to. */
  isLoading: boolean
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  /** Replaces the cached user after a profile change. */
  setUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
