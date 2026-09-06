import { useEffect, useState } from 'react'
import { adminInputClass } from '../AdminLayout'
import { cmsLogin, cmsVerify, clearCmsToken, isCmsAuthenticated, CmsApiError } from '../../../lib/admin/cms'

interface CmsAuthGateProps {
  children: React.ReactNode
}

// Gates access to the content-authoring tabs (Blog Posts / Case Studies)
// behind a real server-issued JWT — distinct from AdminGate's client-side
// hash check, which only protects the static-config panel. Verifies any
// stored token on mount so a stale/expired one doesn't render the CMS UI
// only to have every request bounce with 401.
export function CmsAuthGate({ children }: CmsAuthGateProps) {
  // Lazy initializer decides the starting state synchronously (no stored
  // token = nothing to verify), so the effect below only ever needs to run
  // when there IS a token to check, and never has to setState on mount itself.
  const [status, setStatus] = useState<'checking' | 'authed' | 'unauthed'>(() =>
    isCmsAuthenticated() ? 'checking' : 'unauthed',
  )
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
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-6">
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
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
