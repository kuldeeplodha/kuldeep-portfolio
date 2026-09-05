import { portfolioConfig } from '../../config'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2 §2.8 Engineering Stack — categorized technology matrix. Deliberately
 * NO percentage bars or proficiency levels; only real technologies, grouped.
 * Supersedes the old SkillsSection (still present in the codebase but no
 * longer rendered on the homepage — see HomePage.tsx).
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
            className="rounded-[var(--radius-base)] border p-5"
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
