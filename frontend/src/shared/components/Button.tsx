import type { ComponentProps } from 'react'

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
  danger: 'bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50 focus-visible:outline-red-500',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants
  loading?: boolean
}

export function Button({ variant = 'primary', loading = false, className = '', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}
