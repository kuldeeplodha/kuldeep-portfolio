import { portfolioConfig } from '../../config'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2 §2.8 / V2.1 §38-40 Engineering Stack — categorized technology matrix.
 * Deliberately NO percentage bars or proficiency levels; only real
 * technologies, grouped. This is now the SOLE public-facing skills display
 * — the old SkillsSection and MetricsSection components were deleted in
 * V2.1-P2 as dead code (see HomePage.tsx). Content already excludes the
 * spec's illustrative-only examples (FastAPI, Redis, Twilio, "Payment
 * systems") per Kelly's v2.1-content-check.md.
 */
export function EngineeringStackSection() {
  const { engineeringStack } = portfolioConfig

  return (
    <SectionShell id="stack" muted>
      <SectionHeader slug="stack" title="Engineering Stack" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {engineeringStack.map((category) => (
          <div
            key={category.id}
            className="hover-lift rounded-[var(--radius-base)] border p-5"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
          >
            <h3
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-accent)' }}
            >
              {category.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-[var(--radius-pill)] border px-3 py-1 text-xs"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
