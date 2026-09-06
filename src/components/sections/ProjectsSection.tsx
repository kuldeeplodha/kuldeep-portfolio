import { Link } from 'react-router-dom'
import { portfolioConfig } from '../../config'
import { useRole } from '../../hooks/useRole'
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
  useRole() // keeps this section's RoleTransition timing in sync with the rest of the page
  // Deliberately NOT role-filtered: the real content model has exactly 3
  // projects total and none are tagged relevant to the software/data roles,
  // which would otherwise leave "Selected Work" empty for those two modes.
  // Honest content beats an empty section — show all 3 for every role.
  const { projects } = portfolioConfig

  return (
    <SectionShell id="projects" muted>
      <RoleTransition>
        <SectionHeader slug="work" title="Selected Work" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            // V2.1 P1 (spec §57/59): glass shadows are reserved for the
            // navbar/floating menus/Ask Kuldeep input, not every card —
            // depth here comes from the border + subtle hover-lift instead,
            // matching how the other section cards already work.
            <article
              key={project.id}
              className="role-card hover-lift group flex flex-col overflow-hidden border p-0 transition-colors duration-300 hover:border-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
            >
              {project.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                {project.category && (
                  <span
                    className="mb-2 w-max rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {project.category}
                  </span>
                )}
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--color-text)' }}>
                  {project.title}
                </h3>
                <p className="mb-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {project.period}
                </p>
                <p className="mb-4 flex-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {project.overview}
                </p>
                <div className="mb-4 flex flex-wrap gap-1">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-[var(--radius-pill)] border px-2 py-0.5 text-xs"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View case study →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <ImpactMetricsStrip />
      </RoleTransition>
    </SectionShell>
  )
}
