import { useEffect, useState } from 'react'
import { adminInputClass } from '../AdminLayout'
import {
  activateDevBypass,
  cmsLogin,
  cmsVerify,
  clearCmsToken,
  isCmsAuthenticated,
  isDevBypassActive,
  CmsApiError,
} from '../../../lib/admin/cms'

interface CmsAuthGateProps {
  children: React.ReactNode
}

// Gates access to a real server-issued JWT. V2.2 P4 promoted this to the
// single gate for the whole /admin page (it used to protect only the
// content-authoring tabs, with AdminPage.tsx wrapped by a separate
// client-side hash check — that gate is gone; see docs/CICD_PLAN.md).
// Verifies any stored token on mount so a stale/expired one doesn't render
// the admin UI only to have every request bounce with 401.
export function CmsAuthGate({ children }: CmsAuthGateProps) {
  // Lazy initializer decides the starting state synchronously (no stored
  // token = nothing to verify), so the effect below only ever needs to run
  // when there IS a token to check, and never has to setState on mount itself.
  const [status, setStatus] = useState<'checking' | 'authed' | 'unauthed'>(() => {
    if (isDevBypassActive()) return 'authed'
    return isCmsAuthenticated() ? 'checking' : 'unauthed'
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status !== 'checking') return
    let cancelled = false
    cmsVerify().then((ok) => {
      if (!cancelled) setStatus(ok ? 'authed' : 'unauthed')
    })
    return () => {
      cancelled = true
    }
  }, [status])

  if (status === 'checking') {
    return (
      <p className="text-sm text-slate-400" role="status">
        Checking backend session…
      </p>
    )
  }

  if (status === 'authed') {
    return <>{children}</>
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-slate-700/80 bg-slate-900/60 p-6">
      <h2 className="mb-1 text-base font-semibold text-white">Connect to the content backend</h2>
      <p className="mb-5 text-sm text-slate-400">
        Blog posts and case studies are stored server-side (Turso). Sign in with the admin
        password to get a session token — run the FastAPI backend locally first (see{' '}
        <code>backend/README.md</code>).
      </p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setSubmitting(true)
          setError(null)
          try {
            await cmsLogin(password)
            setPassword('')
            setStatus('authed')
          } catch (err) {
            clearCmsToken()
            setError(err instanceof CmsApiError ? err.message : 'Sign-in failed.')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <label htmlFor="cms-password" className="block">
          <span className="mb-1 block text-sm text-slate-400">Admin password</span>
          <input
            id="cms-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={adminInputClass}
          />
        </label>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !password}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-base)] bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => {
            activateDevBypass()
            setStatus('authed')
          }}
          className="mt-4 text-sm text-slate-400 underline hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
        >
          Continue without backend (dev only)
        </button>
      )}
    </div>
  )
}
