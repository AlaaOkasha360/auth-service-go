import { ApiError, configureAuth } from '@/shared/api/client'
import { refresh } from '../api'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../tokens'

let inflight: Promise<string | null> | null = null

/**
 * Exchanges the refresh token for a new pair. Concurrent callers share one request,
 * because the server revokes a refresh token as soon as it is used.
 */
function refreshAccessToken(): Promise<string | null> {
  inflight ??= (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearTokens()
      return null
    }
    try {
      const tokens = await refresh(refreshToken)
      setTokens(tokens)
      return tokens.access_token
    } catch (err) {
      // A rejected refresh token ends the session. A network error does not; the user can retry.
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        clearTokens()
        return null
      }
      throw err
    } finally {
      inflight = null
    }
  })()
  return inflight
}

/** Lets the shared API client attach and refresh tokens. Call once before rendering. */
export function setupAuth() {
  configureAuth({ getAccessToken, refreshAccessToken })
}
