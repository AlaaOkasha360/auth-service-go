import { request } from '../lib/api'
import type { Pagination, User } from '../types/api'

export interface UserPage {
  users: User[]
  pagination: Pagination
}

export async function listUsers(page: number, limit: number): Promise<UserPage> {
  const res = await request<User[]>(`/admin/users?page=${page}&limit=${limit}`)
  return {
    users: res.data ?? [],
    pagination: res.pagination ?? { page, limit, total: 0, total_pages: 0 },
  }
}

export function deleteUser(id: number) {
  return request<null>(`/admin/users/${id}`, { method: 'DELETE' })
}
