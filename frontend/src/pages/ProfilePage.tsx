import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateMe, type UpdateProfileInput } from '../api/me'
import { ME_QUERY_KEY, useAuth } from '../auth/auth-context'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { FormField } from '../components/FormField'
import { RoleBadge } from '../components/RoleBadge'
import { errorMessage } from '../lib/errors'
import { formatDate } from '../lib/format'
import { nameSchema } from '../lib/validation'
import type { User } from '../types/api'

const schema = z
  .object({
    name: nameSchema,
    password: z.string().refine((v) => v === '' || v.length >= 8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const { user } = useAuth()
  // RequireAuth guarantees a user here.
  return <ProfileContent user={user!} />
}

function ProfileContent({ user }: { user: User }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, password: '', confirmPassword: '' },
  })

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      queryClient.setQueryData(ME_QUERY_KEY, updated)
      reset({ name: updated.name, password: '', confirmPassword: '' })
    },
  })

  const onSubmit = handleSubmit(({ name, password }) => {
    const input: UpdateProfileInput = {}
    if (name !== user.name) input.name = name
    if (password) input.password = password
    mutation.mutate(input)
  })

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{user.name}</h1>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Role</dt>
            <dd>
              <RoleBadge role={user.role} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Member since</dt>
            <dd>{formatDate(user.CreatedAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">User ID</dt>
            <dd className="font-mono">{user.ID}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold">Edit profile</h2>
        <p className="mt-1 text-sm text-slate-500">Leave the password fields empty to keep your current password.</p>
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {mutation.isError && <Alert>{errorMessage(mutation.error)}</Alert>}
          {mutation.isSuccess && !isDirty && <Alert kind="success">Profile updated.</Alert>}
          <FormField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <FormField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
