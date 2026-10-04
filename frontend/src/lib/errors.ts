import { ApiError } from './api'

/** Turns a thrown error into something safe to show the user. */
export function errorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong. Please try again.'
  // Gin returns raw go-playground/validator text for binding errors; don't show it verbatim.
  if (err instanceof ApiError && err.message.startsWith('Key: ')) {
    return 'Some fields are invalid. Please check the form and try again.'
  }
  return err.message
}
