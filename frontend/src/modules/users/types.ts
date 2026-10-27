import type { Role } from '@/modules/auth'

// The handlers return users.User, which embeds gorm.Model without json tags, so those fields are PascalCase.
export interface User {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  name: string
  email: string
  role: Role
}

// Mirrors modules/users/requests.go.
export interface UpdateProfileInput {
  name?: string
  password?: string
}
