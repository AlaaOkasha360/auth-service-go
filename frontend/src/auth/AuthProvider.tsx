import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest, type LoginInput } from '../api/auth'
import { getMe } from '../api/me'
import { setUnauthorizedHandler } from '../lib/api'
import { clearToken, getToken, setToken } from '../lib/token'
import { AuthContext, ME_QUERY_KEY, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setTokenState] = useState(getToken)

  const me = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: getMe,
    enabled: token !== null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const logout = useCallback(() => {
    // The API has no logout endpoint; dropping the token client-side ends the session.
    clearToken()
    setTokenState(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(
    async (input: LoginInput) => {
      const newToken = await loginRequest(input)
      setToken(newToken)
      setTokenState(newToken)
      return queryClient.fetchQuery({ queryKey: ME_QUERY_KEY, queryFn: getMe })
    },
    [queryClient],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token ? (me.data ?? null) : null,
      isLoading: token !== null && me.isPending,
      login,
      logout,
    }),
    [token, me.data, me.isPending, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
