import { z } from 'zod'

// Mirrors ResetPasswordRequest.OTP: the server issues a 6-digit code.
export const otpSchema = z.string().trim().regex(/^\d{6}$/, 'The code is 6 digits')
