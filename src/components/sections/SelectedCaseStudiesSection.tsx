import { Link } from 'react-router-dom'
import { useRole } from '../../hooks/useRole'
import { withRoleQuery } from '../../lib/roleLink'
import { usePublishedCaseStudies, latestForRole } from '../../lib/content/usePublicContent'
import { RoleBadges } from '../admin/RoleScopeEditor'
import type { RoleId } from '../../types'
import { RoleTransition } from '../ui/RoleTransition'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

// V2.2 P3 (PRD §6.1.1): CMS-backed "Selected Case Studies" homepage strip —
// latest 3 published, filtered to the active role. Distinct from the
// existing "Selected Work" section (config-driven Project entities); this
// reads from the Turso-backed case_studies table via the public API.
export function SelectedCaseStudiesSection() {
  const { roleId } = useRole()
  const { data, loading, error } = usePublishedCaseStudies()

  const latest = data ? latestForRole(data, roleId, 3) : []

  // Nothing published yet (or backend unreachable) is a valid, honest state
  // for a brand-new content type — hide the section rather than show an
  // empty/error strip on the homepage.
  if (!loading && (error || latest.length === 0)) return null

  return (
    <SectionShell id="case-studies">
      <RoleTransition>
        <SectionHeader
          slug="case-studies"
          title="Selected Case Studies"
          description="Structured write-ups: problem, architecture, outcome."
        />
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-[var(--radius-card)] border"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((cs) => (
              <Link
                key={cs.id}
                to={withRoleQuery(`/case-studies/${cs.slug}`, roleId)}
                className="role-card hover-lift group flex flex-col overflow-hidden border p-6 transition-colors duration-300 hover:border-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
              >
                <span
                  className="mb-2 w-max rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {cs.category}
                </span>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  {cs.title}
                </h3>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {cs.period}
                </p>
                <p className="mt-3 flex-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {cs.summary}
                </p>
                {cs.technologies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cs.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <RoleBadges roles={cs.relevant_roles as RoleId[]} />
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link
            to={withRoleQuery('/case-studies', roleId)}
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-accent)' }}
          >
            View All Case Studies →
          </Link>
        </div>
      </RoleTransition>
    </SectionShell>
  )
}
