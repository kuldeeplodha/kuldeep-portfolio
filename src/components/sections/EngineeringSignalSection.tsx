import { portfolioConfig } from '../../config'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2 §2.3 Engineering Signal — high-signal categories replacing generic
 * skill-percentage bars. Content is portfolioConfig.engineeringSignal
 * (home.valueProposition.items, verbatim).
 */
export function EngineeringSignalSection() {
  const { engineeringSignal } = portfolioConfig

  return (
    <SectionShell id="signal" muted>
      <SectionHeader
        slug="signal"
        title="What I Build"
        description="My work sits across software engineering, data, and AI, with a focus on turning complex requirements into reliable, maintainable systems."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {engineeringSignal.map((item) => (
          <article
            key={item.title}
            className="rounded-[var(--radius-card)] border p-5"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
          >
            <h3 className="mb-2 text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
