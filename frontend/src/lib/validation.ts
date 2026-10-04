import { z } from 'zod'

// These mirror the `binding` tags in requests/*.go so users get clear messages before a round trip.
export const nameSchema = z
  .string()
  .trim()
  .min(3, 'Name must be at least 3 characters')
  .max(100, 'Name must be at most 100 characters')

export const emailSchema = z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address'))

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const otpSchema = z.string().trim().regex(/^\d{6}$/, 'The code is 6 digits')
