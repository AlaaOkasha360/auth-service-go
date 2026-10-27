import type { RouteObject } from 'react-router'
import { RequireAuth, type Role } from '@/modules/auth'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { ProfilePage } from './pages/ProfilePage'

// Mirrors modules/users/routes.go. The app mounts these behind RequireAuth and its layout.
export const usersRoutes: RouteObject[] = [
  { path: 'profile', element: <ProfilePage /> },
  {
    element: <RequireAuth role="admin" />,
    children: [{ path: 'admin/users', element: <AdminUsersPage /> }],
  },
]

export interface NavItem {
  to: string
  label: string
  /** Only shown to this role. */
  role?: Role
}

export const usersNav: NavItem[] = [
  { to: '/profile', label: 'Profile' },
  { to: '/admin/users', label: 'Users', role: 'admin' },
]
