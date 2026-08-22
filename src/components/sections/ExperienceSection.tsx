import { useRole } from '../../hooks/useRole'

export function ExperienceSection() {
  const { sortedExperience, roleId } = useRole()

  return (
    <section id="experience" className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Experience
        </h2>
        <div className="space-y-8">
          {sortedExperience.map((exp) => {
            const achievements = exp.achievements.filter(
              (a) => a.relevantRoles.includes(roleId) || roleId === 'system',
            )
            return (
              <article
                key={exp.id}
                className="rounded-xl border p-6"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <header className="mb-4">
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                    {exp.role} · {exp.organization}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {exp.period} · {exp.location}
                  </p>
                </header>
                <ul className="mb-4 list-disc space-y-2 pl-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {achievements.map((a) => (
                    <li key={a.id}>{a.text}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border px-3 py-1 text-xs"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
