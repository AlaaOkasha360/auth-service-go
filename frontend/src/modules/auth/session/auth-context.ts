import { createContext, useContext } from 'react'
import type { LoginInput, Session } from '../types'

export interface AuthContextValue {
  /** Null when signed out. Comes from the access token, so it is available without a request. */
  session: Session | null
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
