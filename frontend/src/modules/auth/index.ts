// Public API of the auth module. Other modules and the app import from here, never from inside the module.
export { authRoutes } from './routes'
export { AuthProvider } from './session/AuthProvider'
export { useAuth } from './session/auth-context'
export { GuestOnly, RequireAuth } from './session/guards'
export { setupAuth } from './session/setup'
export type { Role, Session } from './types'
