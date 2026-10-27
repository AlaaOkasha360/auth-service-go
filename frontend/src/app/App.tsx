import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { authRoutes, RequireAuth } from '@/modules/auth'
import { usersRoutes } from '@/modules/users'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'

// Mirrors routes/routes.go: each module contributes its own routes.
const router = createBrowserRouter([
  { index: true, element: <Navigate to="/profile" replace /> },
  ...authRoutes,
  {
    element: <RequireAuth />,
    children: [{ element: <AppLayout />, children: usersRoutes }],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
