import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { FormField } from '@/shared/components/FormField'
import { errorMessage } from '@/shared/lib/errors'
import { emailSchema, nameSchema, passwordSchema } from '@/shared/lib/validation'
import { register as registerRequest } from '../api'
import { useAuth } from '../session/auth-context'
import { AuthCard } from '../components/AuthCard'

const schema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setServerError(null)
    try {
      await registerRequest({ name, email, password })
    } catch (err) {
      setServerError(errorMessage(err))
      return
    }
    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch {
      navigate('/login', { replace: true, state: { notice: 'Account created. Please sign in.' } })
    }
  })

  return (
    <AuthCard
      title="Create an account"
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <Alert>{serverError}</Alert>}
        <FormField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
