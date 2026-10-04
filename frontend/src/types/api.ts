// Mirrors responses/response.go in the Go service.
export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  pagination?: Pagination
}

export type Role = 'user' | 'admin'

// models.User embeds gorm.Model, which has no json tags, so those fields are PascalCase.
export interface User {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  name: string
  email: string
  role: Role
}
