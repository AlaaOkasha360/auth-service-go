import type { Role, Session } from '../types'

interface AccessClaims {
  user_id?: number
  role?: string
  type?: string
}

/**
 * Reads user_id and role from an access token, like AuthMiddleware does on the server.
 * The signature is not checked here; the server checks it on every request.
 */
export function sessionFromToken(token: string): Session | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(payload)) as AccessClaims
    if (claims.type !== 'access' || typeof claims.user_id !== 'number') return null
    const role: Role = claims.role === 'admin' ? 'admin' : 'user'
    return { userId: claims.user_id, role }
  } catch {
    return null
  }
}
