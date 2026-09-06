import { Link, useParams } from 'react-router-dom'
import { portfolioConfig } from '../config'
import { isValidSafeUrl } from '../lib/config/exportImport'
import { useRole } from '../hooks/useRole'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { NotFoundPage } from './NotFoundPage'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  useRole()

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
    <main className="container mx-auto max-w-3xl px-4 py-16" style={{ minHeight: '80vh' }}>
      <Link to="/#projects" className="mb-8 inline-flex items-center text-sm font-medium hover:underline focus:outline-none focus:ring-2" style={{ color: 'var(--color-accent)' }}>
        ← Back to projects
      </Link>

      <article>
        <header className="mb-10">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <time>{project.period}</time>
            {project.category && (
              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {project.category}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="blog-content max-w-none" style={{ color: 'var(--color-text)' }}>
          <p>{project.overview}</p>

          {project.problem && (
            <>
              <h2>The Problem</h2>
              <p>{project.problem}</p>
            </>
          )}

          {project.approach && (
            <>
              <h2>Context</h2>
              <p>{project.approach}</p>
            </>
          )}

          <h2>Architecture</h2>
          <div
            className="overflow-x-auto rounded-[var(--radius-card)] border p-4 sm:p-6 not-prose"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', marginTop: '1.25em' }}
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

          {project.result && (
            <>
              <h2>Outcome</h2>
              <p>{project.result}</p>
            </>
          )}

          {project.futureImprovements && (
            <>
              <h2>Future Improvements</h2>
              <p>{project.futureImprovements}</p>
            </>
          )}

          <h2>Technology</h2>
          <div className="flex flex-wrap gap-2 not-prose" style={{ marginTop: '1.25em' }}>
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-[var(--radius-pill)] border px-3 py-1 text-sm"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {tech}
              </span>
            ))}
          </div>

          <div style={{ marginTop: '3em' }}>
            {project.githubUrl && isValidSafeUrl(project.githubUrl) ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-[var(--radius-base)] px-6 py-3 text-sm font-semibold !text-white no-underline hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                View on GitHub
              </a>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                GitHub link: not configured (placeholder in config)
              </p>
            )}
          </div>
        </div>
      </article>
    </main>
  )
}
