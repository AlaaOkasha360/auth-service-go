import { request } from '@/shared/api/client'
import type { LoginInput, RegisterInput, ResetPasswordInput, TokenPair } from './types'

async function tokenRequest(path: string, body: unknown): Promise<TokenPair> {
  const res = await request<TokenPair>(path, { method: 'POST', body, auth: false })
  if (!res.data?.access_token || !res.data.refresh_token) throw new Error('The server did not return tokens')
  return res.data
}

export function register(input: RegisterInput) {
  return request<unknown>('/auth/register', { method: 'POST', body: input, auth: false })
}

export function login(input: LoginInput) {
  return tokenRequest('/auth/login', input)
}

/** The API rotates refresh tokens: the one sent is revoked and a new pair comes back. */
export function refresh(refreshToken: string) {
  return tokenRequest('/auth/refresh', { refresh_token: refreshToken })
}

export function logout(refreshToken: string) {
  return request<null>('/auth/logout', { method: 'POST', body: { refresh_token: refreshToken }, auth: false })
}

export function forgotPassword(email: string) {
  return request<null>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false })
}

export function resetPassword(input: ResetPasswordInput) {
  return request<null>('/auth/reset-password', { method: 'POST', body: input, auth: false })
}
