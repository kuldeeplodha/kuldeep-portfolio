import { useState } from 'react'
import { useRole } from '../../hooks/useRole'

export function ExperienceSection() {
  const { sortedExperience, roleId } = useRole()
  const [expandedId, setExpandedId] = useState<string | null>(
    sortedExperience[0]?.id ?? null,
  )

  return (
    <section id="experience" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-xl font-bold sm:text-2xl" style={{ color: 'var(--color-text)' }}>
          Experience
        </h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Interactive timeline — achievements reorder based on your selected perspective.
        </p>

        <div className="relative">
          <div
            className="absolute left-3 top-0 h-full w-px sm:left-4 md:left-6"
            style={{ backgroundColor: 'var(--color-border)' }}
            aria-hidden="true"
          />

          <div className="space-y-4">
            {sortedExperience.map((exp) => {
              const isExpanded = expandedId === exp.id
              const achievements = exp.achievements.filter(
                (a) => a.relevantRoles.includes(roleId) || roleId === 'system',
              )

              return (
                <article key={exp.id} className="relative pl-8 sm:pl-10 md:pl-14">
                  <button
                    type="button"
                    className="absolute left-0 top-6 flex h-6 w-6 min-h-11 min-w-11 items-center justify-center rounded-full border-2 sm:left-1 md:left-4"
                    style={{
                      borderColor: isExpanded ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: isExpanded ? 'var(--color-accent)' : 'var(--color-bg)',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`exp-panel-${exp.id}`}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${exp.organization}`}
                  />

                  <div
                    className="role-card border transition-shadow"
                    style={{
                      borderColor: isExpanded ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    <button
                      type="button"
                      className="w-full p-6 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`exp-panel-${exp.id}`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold sm:text-lg" style={{ color: 'var(--color-text)' }}>
                            {exp.role}
                          </h3>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                            {exp.organization}
                          </p>
                        </div>
                        <div className="text-left text-sm sm:text-right" style={{ color: 'var(--color-text-muted)' }}>
                          <p>{exp.period}</p>
                          <p>{exp.location}</p>
                        </div>
                      </div>
                      {!isExpanded && achievements[0] && (
                        <p className="mt-3 text-sm line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                          {achievements[0].text}
                        </p>
                      )}
                    </button>

                    {isExpanded && (
                      <div id={`exp-panel-${exp.id}`} className="border-t px-6 pb-6 pt-4" style={{ borderColor: 'var(--color-border)' }}>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                          Impact
                        </h4>
                        <ul className="mb-4 list-disc space-y-2 pl-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {achievements.map((a) => (
                            <li key={a.id}>{a.text}</li>
                          ))}
                        </ul>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                          Technologies
                        </h4>
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
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
