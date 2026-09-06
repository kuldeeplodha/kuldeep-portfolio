import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AdminLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  header: ReactNode
  onSignOut: () => void
  dirty?: boolean
}

export function AdminLayout({ sidebar, children, header, onSignOut, dirty }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900/80 p-4 lg:flex">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Portfolio CMS</p>
            <p className="mt-1 text-sm text-slate-400">Content manager</p>
          </div>
          {sidebar}
          <div className="mt-auto space-y-2 border-t border-slate-800 pt-4">
            <Link to="/" className="block text-sm text-slate-400 hover:text-cyan-400">
              ← View site
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="text-sm text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col min-w-0">
          <header className="lg:sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-white">Configuration Panel</h1>
                {dirty && (
                  <span className="text-xs font-medium text-amber-400">Unsaved changes</span>
                )}
              </div>
              <div className="flex items-center gap-3 lg:hidden">
                <Link to="/" className="text-sm text-cyan-400 hover:underline">← Site</Link>
                <button type="button" onClick={onSignOut} className="text-sm text-slate-400 hover:text-slate-200">Sign out</button>
              </div>
            </div>
            {header}
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-pt-28">
            <div className="mx-auto max-w-3xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

interface AdminCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function AdminCard({ title, description, children }: AdminCardProps) {
  return (
    <section className="rounded-[var(--radius-card)] border border-slate-700/80 bg-slate-900/60 p-6 shadow-lg shadow-black/20 scroll-mt-28">
      <h2 className="mb-1 text-base font-semibold text-white">{title}</h2>
      {description && <p className="mb-5 text-sm text-slate-400">{description}</p>}
      {!description && <div className="mb-5" />}
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export const adminInputClass =
  'w-full rounded-[var(--radius-base)] border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400'
