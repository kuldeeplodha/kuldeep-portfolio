import { Link, useParams } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import { withRoleQuery } from '../lib/roleLink'
import { useCaseStudyBySlug } from '../lib/content/usePublicContent'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { isValidSafeUrl } from '../lib/config/exportImport'
import { RoleBadges } from '../components/admin/RoleScopeEditor'
import type { RoleId } from '../types'
import { NotFoundPage } from './NotFoundPage'

const SECTIONS: { key: 'problem' | 'context' | 'architecture' | 'outcome'; label: string }[] = [
  { key: 'problem', label: 'Problem' },
  { key: 'context', label: 'Context' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'outcome', label: 'Outcome' },
]

// V2.2 P3 (PRD §6.3): "/case-studies/:slug: Comprehensive engineering case
// study layout: Problem, Context, Architecture, Outcome, Tech Stack, and
// Media attachments." The single-GET public endpoint 404s for anything not
// `status='published'` (AC-3.4, draft posts are strictly inaccessible) —
// that 404 renders the same NotFoundPage a broken/typo'd slug would, which
// is the correct behavior either way (no distinction leaked to visitors
// between "doesn't exist" and "exists but is a draft").
export function CaseStudyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { roleId } = useRole()
  const { data: cs, loading, error } = useCaseStudyBySlug(slug)

  useDocumentMeta(cs ? `${cs.title} | Kuldeep Lodha` : undefined, cs?.summary)

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center" role="status">
        <span style={{ color: 'var(--color-text-muted)' }}>Loading…</span>
      </main>
    )
  }

  if (error || !cs) {
    return <NotFoundPage />
  }

  return (
    <main
      className="min-h-screen px-4 py-12 sm:px-6"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to={withRoleQuery('/case-studies', roleId)}
          className="mb-8 inline-block text-sm transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-accent)' }}
        >
          ← Back to case studies
        </Link>

        <span
          className="mb-3 inline-block rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
        >
          {cs.category}
        </span>
        <h1 className="text-3xl font-bold sm:text-4xl">{cs.title}</h1>
        <p className="mt-2 text-lg" style={{ color: 'var(--color-text-muted)' }}>
          {cs.subtitle}
        </p>
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {cs.client_or_org} · {cs.period}
        </p>
        <RoleBadges roles={cs.relevant_roles as RoleId[]} />

        {cs.featured_media_url && (
          <img
            src={cs.featured_media_url}
            alt=""
            className="mt-8 w-full rounded-[var(--radius-card)] object-cover"
          />
        )}

        <div className="mt-10 space-y-8">
          {SECTIONS.map(({ key, label }) => (
            <section key={key}>
              <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                {label}
              </h2>
              <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {cs[key]}
              </p>
            </section>
          ))}

          {cs.future_improvements && (
            <section>
              <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Future improvements
              </h2>
              <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {cs.future_improvements}
              </p>
            </section>
          )}
        </div>

        {cs.technologies.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Tech stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {cs.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {cs.media_urls.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cs.media_urls.map((url) => (
              <img key={url} src={url} alt="" className="aspect-video w-full rounded-[var(--radius-base)] object-cover" />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          {cs.github_url && isValidSafeUrl(cs.github_url) && (
            <a
              href={cs.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-accent)' }}
            >
              View source →
            </a>
          )}
          {cs.live_url && isValidSafeUrl(cs.live_url) && (
            <a
              href={cs.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-accent)' }}
            >
              View live →
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
