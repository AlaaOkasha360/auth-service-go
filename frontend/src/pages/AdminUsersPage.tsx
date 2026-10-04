import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { deleteUser, listUsers } from '../api/admin'
import { useAuth } from '../auth/auth-context'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { RoleBadge } from '../components/RoleBadge'
import { Spinner } from '../components/Spinner'
import { errorMessage } from '../lib/errors'
import { formatDate } from '../lib/format'
import type { User } from '../types/api'

const PAGE_SIZE = 10

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => listUsers(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  })

  const remove = useMutation({
    mutationFn: (u: User) => deleteUser(u.ID),
    onSuccess: () => {
      // Deleting the last user on a page would leave it empty; step back one page.
      if (data?.users.length === 1 && page > 1) setPage((p) => p - 1)
      return queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  function handleDelete(u: User) {
    if (window.confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) {
      remove.mutate(u)
    }
  }

  if (isPending) return <Spinner />
  if (isError) return <Alert>{errorMessage(error)}</Alert>

  const { users, pagination } = data
  const totalPages = Math.max(pagination.total_pages, 1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? 'user' : 'users'} in total
          </p>
        </div>
        {isFetching && <span className="text-sm text-slate-400">Refreshing…</span>}
      </div>

      {remove.isError && <Alert>{errorMessage(remove.error)}</Alert>}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const isSelf = u.ID === currentUser?.ID
              return (
                <tr key={u.ID} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">{u.ID}</td>
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(u.CreatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      disabled={isSelf || remove.isPending}
                      title={isSelf ? "You can't delete your own account here" : undefined}
                      onClick={() => handleDelete(u)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {pagination.page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
