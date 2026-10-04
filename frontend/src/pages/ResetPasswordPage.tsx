import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { resetPassword } from '../api/auth'
import { Alert } from '../components/Alert'
import { AuthCard } from '../components/AuthCard'
import { Button } from '../components/Button'
import { FormField } from '../components/FormField'
import { ApiError } from '../lib/api'
import { errorMessage } from '../lib/errors'
import { otpSchema, passwordSchema } from '../lib/validation'

const schema = z
  .object({
    otp: otpSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

const requestNewLink = (
  <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
    Request a new link
  </Link>
)

/** Opened from the emailed link: /reset-password/:token. The user only types the code from the email. */
export function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [linkError, setLinkError] = useState<string | null>(token ? null : 'This reset link is invalid.')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ otp, newPassword }) => {
    if (!token) return
    setServerError(null)
    try {
      await resetPassword({ token, otp: Number(otp), new_password: newPassword })
      navigate('/login', { replace: true, state: { notice: 'Password updated. Sign in with your new password.' } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setLinkError('This reset link is invalid or has already been used.')
      } else if (err instanceof ApiError && err.message === 'token has been expired') {
        setLinkError('This reset link has expired.')
      } else if (err instanceof ApiError && err.message === 'Invalid OTP') {
        setError('otp', { message: 'That code is incorrect' })
      } else {
        setServerError(errorMessage(err))
      }
    }
  })

  if (linkError) {
    return (
      <AuthCard title="Reset link not valid" footer={requestNewLink}>
        <Alert>{linkError} Reset links expire after 15 minutes and can only be used once.</Alert>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Enter the 6-digit code from your email" footer={requestNewLink}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <Alert>{serverError}</Alert>}
        <FormField
          label="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          className="font-mono tracking-widest"
          error={errors.otp?.message}
          {...register('otp')}
        />
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <FormField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Reset password
        </Button>
      </form>
    </AuthCard>
  )
}
