import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '../components/Spinner'
import type { Role } from '../types/api'
import { useAuth } from './auth-context'

/** Only signed-in users (optionally with a given role) can see child routes. */
export function RequireAuth({ role }: { role?: Role }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to="/profile" replace />

  return <Outlet />
}

/** Keeps signed-in users away from login/register screens. */
export function GuestOnly() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Spinner />
  if (user) return <Navigate to="/profile" replace />

  return <Outlet />
}
