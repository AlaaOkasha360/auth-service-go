import { Navigate, Outlet, useLocation } from 'react-router'
import type { Role } from '../types'
import { useAuth } from './auth-context'

/** Only signed-in users (optionally with a given role) can see child routes. Like AuthMiddleware + RoleMiddleware. */
export function RequireAuth({ role }: { role?: Role }) {
  const { session } = useAuth()
  const location = useLocation()

  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && session.role !== role) return <Navigate to="/" replace />

  return <Outlet />
}

/** Keeps signed-in users away from login/register screens. */
export function GuestOnly() {
  const { session } = useAuth()

  if (session) return <Navigate to="/" replace />

  return <Outlet />
}
