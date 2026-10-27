import type { TokenPair } from './types'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

const listeners = new Set<() => void>()

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function getAccessToken() {
  return read(ACCESS_KEY)
}

export function getRefreshToken() {
  return read(REFRESH_KEY)
}

export function setTokens(tokens: TokenPair) {
  localStorage.setItem(ACCESS_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
  notify()
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    // storage unavailable; nothing to clear
  }
  notify()
}

/** Subscribe to token changes in this tab and others (for useSyncExternalStore). */
export function subscribe(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === ACCESS_KEY || e.key === REFRESH_KEY) listener()
  }
  listeners.add(listener)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}
