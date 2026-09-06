import { Link, useParams } from 'react-router-dom'
import { portfolioConfig } from '../config'
import { isValidSafeUrl } from '../lib/config/exportImport'
import { useRole } from '../hooks/useRole'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { NotFoundPage } from './NotFoundPage'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { theme } = useRole()

  const project = portfolioConfig.projects.find((p) => p.id === projectId)

  // Per-project <title>/description (V2-P6 SEO). Skipped when there's no
  // project — the not-found render below keeps the site-wide default.
  useDocumentMeta(
    project ? `${project.title} | Kuldeep Lodha` : undefined,
    project?.overview,
  )

  if (!project) {
    // V2-P6: a silent redirect to the homepage swallowed the fact that the
    // link was actually broken (a stale share link, a typo'd id). Render an
    // explicit not-found state instead, same as the route-level 404.
    return <NotFoundPage />
  }

  return (
    <main
      className="min-h-screen px-4 py-12 sm:px-6"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/#projects"
          className="mb-8 inline-block text-sm transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-accent)' }}
        >
          ← Back to projects
        </Link>

        {project.category && (
          <span
            className="mb-3 inline-block rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              color: 'var(--color-accent)',
            }}
          >
            {project.category}
          </span>
        )}
        <p className="mb-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {project.period}
        </p>
        <h1 className="mb-6 text-3xl font-bold">{project.title}</h1>
        <p className="mb-8 text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {project.overview}
        </p>

        {/* V2.1 P2 (spec §31/32): case-study section order — Problem,
            Context (the existing "Approach" field — real content, no
            rename of its meaning, just its position), Architecture (the
            existing pipeline data, relabeled — see below), Outcome, Future
            Improvements, Technology last. Sections spec calls for that have
            no backing field (My Contribution / Engineering Challenges /
            Technical Decisions / Optimization as their own headings) are
            OMITTED per spec §32 rather than invented. */}
        {project.problem && (
          <section className="mb-8">
            <h2 className="mb-2 text-lg font-semibold">The Problem</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{project.problem}</p>
          </section>
        )}

        {project.approach && (
          <section className="mb-8">
            <h2 className="mb-2 text-lg font-semibold">Context</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{project.approach}</p>
          </section>
        )}

        {/* "Architecture" — the existing pipeline steps ARE the real,
            per-project data-flow architecture (spec §33 wants a diagram
            only where real architecture info exists; this data has existed
            since before V2 and is genuinely per-project, not decorative). */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Architecture</h2>
          <div
            className="overflow-x-auto rounded-[var(--radius-card)] border p-4 sm:p-6"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            tabIndex={0}
            aria-label="Architecture / pipeline steps"
          >
            <div className="flex min-w-max flex-nowrap items-center gap-2">
              {project.pipeline.map((step, i) => (
                <span key={step} className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded-[var(--radius-base)] border px-3 py-2 text-sm font-mono whitespace-nowrap"
                    style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                  >
                    {step}
                  </span>
                  {i < project.pipeline.length - 1 && (
                    <span style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        {project.result && (
          <section className="mb-8">
            <h2 className="mb-2 text-lg font-semibold">Outcome</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{project.result}</p>
          </section>
        )}

        {project.futureImprovements && (
          <section className="mb-8">
            <h2 className="mb-2 text-lg font-semibold">Future Improvements</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{project.futureImprovements}</p>
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Technology</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-[var(--radius-pill)] border px-3 py-1 text-sm"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {project.githubUrl && isValidSafeUrl(project.githubUrl) ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-[var(--radius-base)] px-6 py-3 text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-accent)', color: theme.background }}
          >
            View on GitHub
          </a>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            GitHub link: not configured (placeholder in config)
          </p>
        )}
      </div>
    </main>
  )
}
