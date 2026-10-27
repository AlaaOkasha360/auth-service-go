import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { FormField } from '@/shared/components/FormField'
import { ApiError } from '@/shared/api/client'
import { errorMessage } from '@/shared/lib/errors'
import { emailSchema } from '@/shared/lib/validation'
import { useAuth } from '../session/auth-context'
import { AuthCard } from '../components/AuthCard'

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

interface LocationState {
  from?: string
  notice?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as LocationState
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await login(values)
      navigate(state.from ?? '/', { replace: true })
    } catch (err) {
      // The API answers 404 for an unknown email and 400 for a wrong password;
      // show one message so the form doesn't reveal which emails exist.
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
        setServerError('Incorrect email or password.')
      } else {
        setServerError(errorMessage(err))
      }
    }
  })

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back"
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {state.notice && <Alert kind="success">{state.notice}</Alert>}
        {serverError && <Alert>{serverError}</Alert>}
        <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthCard>
  )
}
