import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <p className="mb-2 font-mono text-sm" style={{ color: 'var(--color-accent)' }}>
        404
      </p>
      <h1 className="mb-4 text-3xl font-bold">Page not found</h1>
      <p className="mb-8 max-w-md text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ color: 'var(--color-accent)' }}
      >
        ← Back to home
      </Link>
    </main>
  )
}
