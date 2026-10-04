import type { ApiResponse } from '../types/api'
import { clearToken, getToken } from './token'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Called when an authenticated request comes back 401 (expired or invalid token). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Attach the bearer token. Off for the public /auth endpoints. */
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

export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, auth = true } = options
  const token = auth ? getToken() : null

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the API running?')
  }

  // Middleware rejections (401) come back with an empty body, so parse defensively.
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
    if (res.status === 401 && token) {
      clearToken()
      unauthorizedHandler?.()
    }
    throw new ApiError(res.status, payload?.message || fallbackMessage(res.status))
  }

  return payload ?? { success: true, message: '' }
}
