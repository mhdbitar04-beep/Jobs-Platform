import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginInput, type RegisterInput } from '@/api/auth'
import { UNAUTHORIZED_EVENT } from '@/lib/http'
import { queryKeys } from '@/lib/queryKeys'
import { tokenStorage } from '@/lib/storage'
import type { AuthResponse, User } from '@/types'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [token, setToken] = useState(tokenStorage.get)

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
    enabled: token !== null,
    staleTime: Infinity,
    retry: false,
  })

  const startSession = useCallback(
    ({ user, token: newToken }: AuthResponse): User => {
      tokenStorage.set(newToken)
      queryClient.clear()
      queryClient.setQueryData(queryKeys.me, user)
      setToken(newToken)
      return user
    },
    [queryClient],
  )

  const endSession = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    const handleUnauthorized = () => {
      endSession()
      navigate('/login', { replace: true })
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [endSession, navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token !== null ? (meQuery.data ?? null) : null,
      isLoading: token !== null && meQuery.isPending,
      login: (input: LoginInput) => authApi.login(input).then(startSession),
      register: (input: RegisterInput) => authApi.register(input).then(startSession),
      logout: async () => {
        // The session ends locally even if the server cannot be reached.
        await authApi.logout().catch(() => undefined)
        endSession()
        navigate('/')
      },
      setUser: (user: User) => queryClient.setQueryData(queryKeys.me, user),
    }),
    [token, meQuery.data, meQuery.isPending, startSession, endSession, navigate, queryClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
