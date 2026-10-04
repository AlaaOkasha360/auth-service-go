import { request } from '../lib/api'
import type { User } from '../types/api'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ResetPasswordInput {
  token: string
  otp: number
  new_password: string
}

export function register(input: RegisterInput) {
  return request<User>('/auth/register', { method: 'POST', body: input, auth: false })
}

/** Returns the JWT. The API sends it as a bare string in `data`. */
export async function login(input: LoginInput): Promise<string> {
  const res = await request<string>('/auth/login', { method: 'POST', body: input, auth: false })
  if (!res.data) throw new Error('Login response did not include a token')
  return res.data
}

export function forgotPassword(email: string) {
  return request<null>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false })
}

export function resetPassword(input: ResetPasswordInput) {
  return request<null>('/auth/reset-password', { method: 'POST', body: input, auth: false })
}
