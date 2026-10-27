// Mirrors responses/response.go and responses/pagination.go in the Go service.
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
