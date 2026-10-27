import type { Role } from '@/modules/auth'

// Mirrors UserResponse in modules/users/responses.go.
export interface User {
  id: number
  name: string
  email: string
  role: Role
  created_at: string
}

// Mirrors modules/users/requests.go.
export interface UpdateProfileInput {
  name?: string
  password?: string
}
