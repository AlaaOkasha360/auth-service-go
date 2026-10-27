import type { RouteObject } from 'react-router'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { GuestOnly } from './session/guards'

// Mirrors modules/auth/routes.go: the public /auth/* screens.
export const authRoutes: RouteObject[] = [
  {
    element: <GuestOnly />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  { path: 'forgot-password', element: <ForgotPasswordPage /> },
  { path: 'reset-password/:token?', element: <ResetPasswordPage /> },
]
