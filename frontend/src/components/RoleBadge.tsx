import type { Role } from '../types/api'

export function RoleBadge({ role }: { role: Role }) {
  const style = role === 'admin' ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-slate-100 text-slate-700 ring-slate-200'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${style}`}>{role}</span>
}
