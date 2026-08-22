import { useRole } from '../../hooks/useRole'

export function ProjectsSection() {
  const { filteredProjects } = useRole()

  return (
    <section id="projects" className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Projects
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="rounded-xl border p-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="mb-2 font-semibold" style={{ color: 'var(--color-text)' }}>
                {project.title}
              </h3>
              <p className="mb-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {project.period}
              </p>
              <p className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {project.overview}
              </p>
              <div className="flex flex-wrap gap-1">
                {project.pipeline.map((step, i) => (
                  <span key={step} className="text-xs" style={{ color: 'var(--color-accent)' }}>
                    {step}
                    {i < project.pipeline.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
