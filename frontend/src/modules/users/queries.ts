import { useQuery } from '@tanstack/react-query'
import { getMe } from './api'

export const ME_QUERY_KEY = ['me'] as const
export const ADMIN_USERS_QUERY_KEY = ['admin-users'] as const

/** The signed-in user's profile from GET /me. */
export function useCurrentUser() {
  return useQuery({ queryKey: ME_QUERY_KEY, queryFn: getMe, staleTime: 5 * 60 * 1000 })
}
