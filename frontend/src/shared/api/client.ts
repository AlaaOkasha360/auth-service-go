import type { ApiResponse } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * How the client authenticates requests. The auth module installs this at startup
 * (see setupAuth in modules/auth) so shared code never imports a module.
 */
export interface AuthAdapter {
  getAccessToken: () => string | null
  /** Exchanges the refresh token for a new pair. Resolves to the new access token, or null if the session is over. */
  refreshAccessToken: () => Promise<string | null>
}

let authAdapter: AuthAdapter | null = null

export function configureAuth(adapter: AuthAdapter) {
  authAdapter = adapter
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Attach the bearer token and refresh it on 401. Off for the public /auth endpoints. */
  auth?: boolean
}

function fallbackMessage(status: number) {
  switch (status) {
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'Not found.'
    default:
      return status >= 500 ? 'Something went wrong on the server.' : `Request failed (${status}).`
  }
}

async function send(path: string, method: string, body: unknown, token: string | null) {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    return await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the API running?')
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, auth = true } = options
  const token = auth ? (authAdapter?.getAccessToken() ?? null) : null

  let res = await send(path, method, body, token)

  // Access tokens live 15 minutes. On 401, get a fresh one and retry once.
  if (res.status === 401 && auth && authAdapter) {
    const current = authAdapter.getAccessToken()
    // Another request may already have refreshed while this one was in flight.
    const fresh = current && current !== token ? current : await authAdapter.refreshAccessToken()
    if (fresh) res = await send(path, method, body, fresh)
  }

  // Middleware rejections (401/403) come back with an empty body, so parse defensively.
  const text = await res.text()
  let payload: ApiResponse<T> | null = null
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>
    } catch {
      payload = null
    }
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiError(res.status, payload?.message || fallbackMessage(res.status))
  }

  return payload ?? { success: true, message: '' }
}
