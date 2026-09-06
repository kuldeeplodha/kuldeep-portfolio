import { useState } from 'react'
import { portfolioConfig } from '../../config'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

// uiContentRules.limits: collapsed/homepage view shows up to 4 bullets;
// expanded view shows the full list (already capped at 5 in the source content).
const HOMEPAGE_BULLET_LIMIT = 4

export function ExperienceSection() {
  const { experienceStory } = portfolioConfig
  const [expandedId, setExpandedId] = useState<string | null>(experienceStory[0]?.id ?? null)

  return (
    <SectionShell id="experience">
      <SectionHeader slug="experience" title="Experience" />

      <div className="relative">
        <div
          className="absolute left-3 top-0 h-full w-px sm:left-4 md:left-6"
          style={{ backgroundColor: 'var(--color-border)' }}
          aria-hidden="true"
        />

        <div className="space-y-4">
          {experienceStory.map((exp) => {
            const isExpanded = expandedId === exp.id
            const bullets = exp.selectedHighlights ?? exp.highlights ?? []
            const teaserBullets = bullets.slice(0, HOMEPAGE_BULLET_LIMIT)

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
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${exp.company}`}
                />

                {/* V2.1 P2 (spec §26 "current role should have slightly
                    stronger visual emphasis"): a subtle accent-tinted
                    surface on the current role only, on top of the shared
                    hover/expand states — not a new decorative treatment. */}
                <div
                  className="role-card border transition-shadow"
                  style={{
                    borderColor: isExpanded ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: exp.current
                      ? 'color-mix(in srgb, var(--color-accent) 4%, var(--color-surface))'
                      : 'var(--color-surface)',
                  }}
                >
                  <button
                    type="button"
                    className="w-full p-6 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`exp-panel-${exp.id}`}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${exp.role} at ${exp.company}`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold sm:text-lg" style={{ color: 'var(--color-text)' }}>
                            {exp.role}
                          </h3>
                          {exp.current && (
                            <span
                              className="rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                          {exp.company}
                        </p>
                      </div>
                      <div className="text-left text-sm sm:text-right" style={{ color: 'var(--color-text-muted)' }}>
                        <p>{exp.period}</p>
                        <p>{exp.location}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {exp.summary}
                    </p>

                    {!isExpanded && teaserBullets.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {teaserBullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </button>

                  {isExpanded && (
                    <div id={`exp-panel-${exp.id}`} className="border-t px-6 pb-6 pt-4" style={{ borderColor: 'var(--color-border)' }}>
                      {bullets.length > 0 && (
                        <>
                          {/* V2.1 P2 (spec §25's Engineering/Leadership/Systems
                              grouping): these are engineering-flavored bullets
                              for every role (verified against the real
                              content — building/optimizing/architecting), so
                              "Engineering" is an accurate heading, not a
                              reframe of different content. */}
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            Engineering
                          </h4>
                          <ul className="mb-4 list-disc space-y-2 pl-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {bullets.map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {exp.domains && exp.domains.length > 0 && (
                        <>
                          {/* V2.1 P2 (spec §25): renamed "Domains" → "Systems"
                              — same real data (EMR/Billing/CRM), the exact
                              category name the spec uses for this grouping. */}
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            Systems
                          </h4>
                          <div className="mb-4 flex flex-wrap gap-2">
                            {exp.domains.map((domain) => (
                              <span
                                key={domain.name}
                                className="rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium"
                                title={domain.description}
                                style={{
                                  backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                                  color: 'var(--color-accent)',
                                }}
                              >
                                {domain.name}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {exp.integrations && exp.integrations.length > 0 && (
                        <>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            Integrations
                          </h4>
                          <div className="mb-4 flex flex-wrap gap-2">
                            {exp.integrations.map((integration) => (
                              <span
                                key={integration}
                                className="rounded-[var(--radius-pill)] border px-3 py-1 text-xs"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                              >
                                {integration}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {exp.leadership && exp.leadership.length > 0 && (
                        <>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            Leadership
                          </h4>
                          <div className="mb-4 flex flex-wrap gap-2">
                            {exp.leadership.map((item) => (
                              <span
                                key={item}
                                className="rounded-[var(--radius-pill)] border px-3 py-1 text-xs"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {exp.impact && exp.impact.length > 0 && (
                        <>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            Impact
                          </h4>
                          <div className="mb-4 grid grid-cols-3 gap-3">
                            {exp.impact.map((item) => (
                              <div key={item.label}>
                                <p className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
                                  {item.value}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                  {item.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technology.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-[var(--radius-pill)] border px-3 py-1 text-xs"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
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
    </SectionShell>
  )
}
