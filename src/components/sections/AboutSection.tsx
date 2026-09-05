import { portfolioConfig } from '../../config'
import { RoleTransition } from '../ui/RoleTransition'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

// The real content model's "about" has 4 paragraphs; per uiContentRules
// (avoid walls of text, medium density) only the first is used here as a
// short lead-in above the numbered philosophy points, not all 4.
const ABOUT_LEAD_IN =
  'I began my professional journey in 2021 as a software developer, working on backend applications, APIs, databases, automation, and data-driven systems.'

/**
 * V2 §2.6 "How I Engineer" — replaces the old biography paragraphs with an
 * engineering-philosophy overview: a short lead-in plus 5 numbered points
 * (content.philosophy, verbatim). Text-heavy, no background cards — relies
 * on whitespace and typographic hierarchy per the design spec.
 */
export function AboutSection() {
  const { philosophy } = portfolioConfig

  return (
    <SectionShell id="about" narrow>
      <RoleTransition>
        <SectionHeader slug="about" title={philosophy.title} description={ABOUT_LEAD_IN} />
        <ol className="space-y-6">
          {philosophy.items.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span
                className="mt-0.5 shrink-0 font-mono text-sm font-semibold"
                style={{ color: 'var(--color-accent)' }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="mb-1 text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </RoleTransition>
    </SectionShell>
  )
}
