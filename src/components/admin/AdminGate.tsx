import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  isAdminAuthenticated,
  isAdminConfigured,
  loginAdmin,
} from '../../lib/admin/auth'

interface AdminGateProps {
  children: React.ReactNode
}

export function AdminGate({ children }: AdminGateProps) {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (authenticated) {
    return <>{children}</>
  }

  if (!isAdminConfigured()) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
      >
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-xl font-bold">Admin not configured</h1>
          <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Set <code>VITE_ADMIN_PASSWORD_HASH</code> in <code>.env.local</code> and restart the
            dev server. This gate protects the configuration panel on the static site.
          </p>
          <Link to="/" style={{ color: 'var(--color-accent)' }}>
            ← Back to portfolio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <form
        className="w-full max-w-sm rounded-[var(--radius-card)] border p-8"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        onSubmit={async (e) => {
          e.preventDefault()
          try {
            if (await loginAdmin(password)) {
              setAuthenticated(true)
              setError(null)
            } else {
              setError('Incorrect password')
            }
          } catch {
            setError('Sign-in unavailable in this browser (no WebCrypto)')
          }
        }}
      >
        <h1 className="mb-2 text-xl font-bold">Admin login</h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Configuration panel is restricted. Enter your admin password to continue.
        </p>
        <label htmlFor="admin-password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mb-4 w-full rounded-[var(--radius-base)] border px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
          }}
        />
        {error && (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-[var(--radius-base)] py-2.5 text-sm font-semibold"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
        >
          Sign in
        </button>
        <Link
          to="/"
          className="mt-4 block text-center text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          ← Back to portfolio
        </Link>
      </form>
    </main>
  )
}
