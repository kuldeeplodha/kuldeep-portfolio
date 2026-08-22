import { Link } from 'react-router-dom'
import { useRole } from '../../hooks/useRole'
import { RoleTransition } from '../ui/RoleTransition'

export function ProjectsSection() {
  const { filteredProjects, roleId } = useRole()

  return (
    <section id="projects" className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
      <RoleTransition>
        <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Projects
        </h2>
        <div className={`grid gap-6 ${roleId === 'data' ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="role-card group flex flex-col overflow-hidden border p-0 transition-all duration-300 hover:border-[var(--color-accent)]"
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
                    className="rounded-full border px-2 py-0.5 text-xs"
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
        </div>
      </RoleTransition>
    </section>
  )
}
