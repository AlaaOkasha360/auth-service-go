import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { login as loginRequest, logout as logoutRequest } from '../api'
import { clearTokens, getAccessToken, getRefreshToken, setTokens, subscribe } from '../tokens'
import type { LoginInput } from '../types'
import { AuthContext, type AuthContextValue } from './auth-context'
import { sessionFromToken } from './claims'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const accessToken = useSyncExternalStore(subscribe, getAccessToken)
  const session = useMemo(() => (accessToken ? sessionFromToken(accessToken) : null), [accessToken])

  // Whatever ended the session (logout, a rejected refresh, another tab), drop the previous user's cached data.
  useEffect(() => {
    if (!session) queryClient.clear()
  }, [session, queryClient])

  const login = useCallback(async (input: LoginInput) => {
    setTokens(await loginRequest(input))
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    clearTokens()
    if (refreshToken) {
      // Revoke the refresh token on the server. The local session is already gone, so failures don't matter.
      await logoutRequest(refreshToken).catch(() => undefined)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({ session, login, logout }), [session, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}
