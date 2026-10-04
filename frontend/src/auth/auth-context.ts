import { createContext, useContext } from 'react'
import type { LoginInput } from '../api/auth'
import type { User } from '../types/api'

export interface AuthContextValue {
  user: User | null
  /** True while a stored token is being checked against GET /me. */
  isLoading: boolean
  login: (input: LoginInput) => Promise<User>
  logout: () => void
}

export const ME_QUERY_KEY = ['me'] as const

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
