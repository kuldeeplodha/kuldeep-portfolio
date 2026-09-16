import { Link, useParams } from 'react-router-dom'
import { isValidSafeUrl } from '../lib/config/exportImport'
import { useRole } from '../hooks/useRole'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { useCaseStudyBySlug } from '../lib/content/usePublicContent'
import { NotFoundPage } from './NotFoundPage'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  useRole()

  const { data: project, loading, error } = useCaseStudyBySlug(projectId)

  useDocumentMeta(
    project ? `${project.title} | Kuldeep Lodha` : undefined,
    project?.summary,
  )

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16" style={{ minHeight: '80vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading case study...</p>
      </main>
    )
  }

  if (error || !project) {
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
          <p>{project.summary}</p>

          {project.problem && (
            <>
              <h2>The Problem</h2>
              <p>{project.problem}</p>
            </>
          )}

          {project.context && (
            <>
              <h2>Context</h2>
              <p>{project.context}</p>
            </>
          )}

          {project.architecture && (
            <>
              <h2>Architecture</h2>
              <p>{project.architecture}</p>
            </>
          )}

          {project.outcome && (
            <>
              <h2>Outcome</h2>
              <p>{project.outcome}</p>
            </>
          )}

          {project.future_improvements && (
            <>
              <h2>Future Improvements</h2>
              <p>{project.future_improvements}</p>
            </>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <>
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
            </>
          )}

          <div style={{ marginTop: '3em' }}>
            {project.github_url && isValidSafeUrl(project.github_url) ? (
              <a
                href={project.github_url}
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
