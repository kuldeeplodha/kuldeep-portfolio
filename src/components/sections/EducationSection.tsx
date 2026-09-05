import { portfolioConfig } from '../../config'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2 §Background — education kept deliberately compact and visually
 * secondary to the engineering story (uiContentRules: not a primary
 * section). A simple stacked list, not the timeline treatment Experience
 * gets.
 */
export function EducationSection() {
  const { education } = portfolioConfig

  return (
    <SectionShell id="education">
      <SectionHeader slug="education" title="Education" />
      <div className="space-y-4">
        {education.map((edu) => (
          <article
            key={edu.id}
            className="rounded-[var(--radius-base)] border p-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {edu.degree}
              </h3>
              <time className="text-xs" style={{ color: 'var(--color-text-muted)' }} dateTime={edu.period}>
                {edu.period}
              </time>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {edu.institution}
              {edu.gpa ? ` · ${edu.gpa}` : ''}
            </p>
            {edu.research && (
              <p className="mt-2 text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                Research: {edu.research}
              </p>
            )}
            {edu.focus && edu.focus.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {edu.focus.map((item) => (
                  <span
                    key={item}
                    className="rounded-[var(--radius-pill)] border px-2 py-0.5 text-[11px]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
