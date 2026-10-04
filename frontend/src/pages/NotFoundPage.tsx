import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
        Go home
      </Link>
    </div>
  )
}
