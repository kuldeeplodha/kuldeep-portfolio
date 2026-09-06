import { portfolioConfig } from '../../config'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2 §2.7 Research Lab — technical-notebook aesthetic (monospace type,
 * status tag, dashed border) built honestly around the ONE real research
 * entry (MS thesis). Kelly's content audit flagged multi-"experiment"
 * framing here as very-high fabrication risk — do not add fake entries,
 * dates, or results. "Currently Exploring" lists real interest areas, not
 * completed experiments.
 */
export function ResearchLabSection() {
  const { research, researchIntro, currentlyExploring } = portfolioConfig
  const featured = research[0]

  if (!featured) return null

  return (
    <SectionShell id="research">
      <SectionHeader slug="lab" title="Research Lab" description={researchIntro} />

      <article
        className="hover-lift rounded-[var(--radius-card)] border border-dashed p-6 sm:p-8"
        style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {featured.type && (
            <span
              className="font-mono text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-accent)' }}
            >
              {featured.type}
            </span>
          )}
          <span
            className="rounded-[var(--radius-pill)] px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
              color: 'var(--color-accent)',
            }}
          >
            {featured.status}
          </span>
        </div>

        <h3 className="mb-3 text-lg font-semibold sm:text-xl" style={{ color: 'var(--color-text)' }}>
          {featured.title}
        </h3>
        <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {featured.description}
        </p>

        {featured.areas && featured.areas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {featured.areas.map((area) => (
              <span
                key={area}
                className="rounded-[var(--radius-pill)] border px-3 py-1 font-mono text-xs"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Currently Exploring — real interest areas, explicitly not framed as completed work. */}
      <div className="mt-10">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {currentlyExploring.title}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {currentlyExploring.items.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-base)] border p-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h4 className="mb-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {item.title}
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
