import { request } from '../lib/api'
import type { User } from '../types/api'

export interface UpdateProfileInput {
  name?: string
  password?: string
}

export async function getMe(): Promise<User> {
  const res = await request<User>('/me')
  return res.data as User
}

export async function updateMe(input: UpdateProfileInput): Promise<User> {
  const res = await request<User>('/me', { method: 'PATCH', body: input })
  return res.data as User
}
