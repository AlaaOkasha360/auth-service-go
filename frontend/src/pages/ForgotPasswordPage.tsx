import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { forgotPassword } from '../api/auth'
import { Alert } from '../components/Alert'
import { AuthCard } from '../components/AuthCard'
import { Button } from '../components/Button'
import { FormField } from '../components/FormField'
import { errorMessage } from '../lib/errors'
import { emailSchema } from '../lib/validation'

const schema = z.object({ email: emailSchema })
type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ email }) => {
    setServerError(null)
    try {
      const res = await forgotPassword(email)
      setSentMessage(res.message || 'If that email exists, a reset code has been sent.')
    } catch (err) {
      setServerError(errorMessage(err))
    }
  })

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a reset link and a 6-digit code"
      footer={
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Back to sign in
        </Link>
      }
    >
      {sentMessage ? (
        <div className="space-y-4">
          <Alert kind="success">{sentMessage}</Alert>
          <p className="text-sm text-slate-600">
            Open the link in the email and enter the 6-digit code to choose a new password. The link expires in 15
            minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {serverError && <Alert>{serverError}</Alert>}
          <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send reset code
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
