import { Link } from 'react-router-dom'
import { portfolioConfig } from '../../config'
import { useRole } from '../../hooks/useRole'
import { withRoleQuery } from '../../lib/roleLink'
import { usePublishedCaseStudies, latestForRole } from '../../lib/content/usePublicContent'
import { RoleTransition } from '../ui/RoleTransition'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2 §2.4 Selected Work — impact metrics strip grouped with the case-study
 * previews (content.impact, verbatim, already exactly 5 items per
 * uiContentRules.limits.impactMetrics).
 */
function ImpactMetricsStrip() {
  const { impactMetrics } = portfolioConfig

  return (
    <div className="mt-12 border-t pt-10" style={{ borderColor: 'var(--color-border)' }}>
      <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
        {impactMetrics.title}
      </h3>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {impactMetrics.description}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {impactMetrics.items.map((item) => (
          <div key={item.label} className="rounded-[var(--radius-base)] border p-4" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              {item.metric}
            </p>
            <p className="mt-1 text-xs font-medium" style={{ color: 'var(--color-text)' }}>
              {item.label}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {item.context}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectsSection() {
  const { roleId } = useRole()
  const { data, loading, error } = usePublishedCaseStudies(1, 3)
  
  const latest = data ? latestForRole(data.items, roleId, 3) : []

  if (!loading && (error || latest.length === 0)) {
    return (
      <SectionShell id="projects" muted>
        <RoleTransition>
          <SectionHeader
            slug="work"
            title="Selected Engineering Work"
            description="Systems built around real-world constraints."
          />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>More case studies coming soon.</p>
          <ImpactMetricsStrip />
        </RoleTransition>
      </SectionShell>
    )
  }

  return (
    <SectionShell id="projects" muted>
      <RoleTransition>
        <SectionHeader
          slug="work"
          title="Selected Engineering Work"
          description="Systems built around real-world constraints."
        />
        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[var(--radius-card)] border"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((project) => (
              <Link
                key={project.id}
                to={withRoleQuery(`/projects/${project.slug}`, roleId)}
                className="role-card hover-lift group flex flex-col border p-6 transition-colors duration-300 hover:border-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              >
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <time>{project.period}</time>
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  {project.title}
                </h3>
                <p className="mt-2 flex-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {project.summary}
                </p>
                {project.category && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span
                      className="rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {project.category}
                    </span>
                  </div>
                )}
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
            View all case studies →
          </Link>
        </div>

        <ImpactMetricsStrip />
      </RoleTransition>
    </SectionShell>
  )
}
