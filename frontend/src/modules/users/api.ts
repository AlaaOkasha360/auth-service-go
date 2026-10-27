import { request } from '@/shared/api/client'
import type { Pagination } from '@/shared/api/types'
import type { UpdateProfileInput, User } from './types'

export interface UserPage {
  users: User[]
  pagination: Pagination
}

export async function getMe(): Promise<User> {
  const res = await request<User>('/me')
  return res.data as User
}

export async function updateMe(input: UpdateProfileInput): Promise<User> {
  const res = await request<User>('/me', { method: 'PATCH', body: input })
  return res.data as User
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
