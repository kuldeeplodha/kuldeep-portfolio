import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { useRole } from '../hooks/useRole'
import { withRoleQuery } from '../lib/roleLink'
import { usePublishedCaseStudies } from '../lib/content/usePublicContent'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { GRID_PADDING, GRID_WIDTH } from '../components/ui/grid'
import { RoleBadges } from '../components/admin/RoleScopeEditor'
import type { RoleId } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// V2.2 P3 (PRD §6.2, AC-3.2): "/case-studies Archive: Grid of all published
// engineering case studies with filter controls for Technology and Role
// Perspective." Role filtering reuses the same ?role= the rest of the site
// already uses — there's no separate "role perspective" filter UI beyond
// that, since introducing a second, page-local role selector would
// contradict the single persistent role switcher in the navbar.
export function CaseStudiesListPage() {
  useDocumentMeta('Case Studies | Kuldeep Lodha', 'Structured engineering case studies: problem, architecture, outcome.')
  const { roleId } = useRole()
  const { data, loading, error } = usePublishedCaseStudies()
  const [techFilter, setTechFilter] = useState<string>('all')

  const roleFiltered = useMemo(() => {
    if (!data) return []
    return roleId === 'system'
      ? data
      : data.filter((cs) => cs.relevant_roles.length === 0 || cs.relevant_roles.includes(roleId) || cs.relevant_roles.includes('system'))
  }, [data, roleId])

  const allTechnologies = useMemo(() => {
    const set = new Set<string>()
    roleFiltered.forEach((cs) => cs.technologies.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [roleFiltered])

  const visible = useMemo(() => {
    if (techFilter === 'all') return roleFiltered
    return roleFiltered.filter((cs) => cs.technologies.includes(techFilter))
  }, [roleFiltered, techFilter])

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${GRID_PADDING} mx-auto ${GRID_WIDTH} py-16 sm:py-20`}
      style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Case Studies</h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Structured engineering write-ups — problem, architecture, outcome.
      </p>

      {allTechnologies.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by technology">
          <button
            type="button"
            onClick={() => setTechFilter('all')}
            aria-pressed={techFilter === 'all'}
            className="rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium"
            style={{
              borderColor: techFilter === 'all' ? 'var(--color-accent)' : 'var(--color-border)',
              color: techFilter === 'all' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}
          >
            All
          </button>
          {allTechnologies.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => setTechFilter(tech)}
              aria-pressed={techFilter === tech}
              className="rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium"
              style={{
                borderColor: techFilter === tech ? 'var(--color-accent)' : 'var(--color-border)',
                color: techFilter === tech ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            >
              {tech}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <p role="status" style={{ color: 'var(--color-text-muted)' }}>
          Loading case studies…
        </p>
      )}
      {error && !loading && (
        <p role="alert" style={{ color: 'var(--color-text-muted)' }}>
          Case studies aren't available right now. Please check back later.
        </p>
      )}
      {!loading && !error && visible.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No case studies match this filter yet.</p>
      )}

      {!loading && !error && visible.length > 0 && (
        <m.div className="grid grid-cols-1 gap-6 md:grid-cols-2" variants={containerVariants} initial="hidden" animate="visible">
          {visible.map((cs) => (
            <m.article
              key={cs.id}
              variants={cardVariants}
              className="role-card hover-lift flex flex-col gap-3 border p-6"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <span
                className="w-max rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
              >
                {cs.category}
              </span>
              <Link to={withRoleQuery(`/case-studies/${cs.slug}`, roleId)} className="hover:underline">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  {cs.title}
                </h2>
              </Link>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {cs.client_or_org} · {cs.period}
              </p>
              <p style={{ color: 'var(--color-text-muted)' }}>{cs.summary}</p>
              {cs.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cs.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <RoleBadges roles={cs.relevant_roles as RoleId[]} />
            </m.article>
          ))}
        </m.div>
      )}
    </main>
  )
}
