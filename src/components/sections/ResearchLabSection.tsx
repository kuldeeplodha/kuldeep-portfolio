import { portfolioConfig } from '../../config'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2.1 P3 (spec §35-37) Research Lab — engineering-notebook aesthetic
 * (monospace metadata, thin borders, editorial type, restrained motion —
 * explicitly NOT a hacker-terminal look) built honestly around the ONE
 * real research entry (MS thesis). Kelly's content audit flagged
 * multi-"experiment" framing as very-high fabrication risk: no numbered
 * "EXPERIMENT 00N" cards, no fake DB-optimization/API-perf/caching
 * entries. Per the dispatch's own guidance ("if the section feels thin
 * with one card, design it to stand on its own"), this renders as one
 * larger feature panel — a metadata sidebar + the real write-up — rather
 * than a small card that reads like a placeholder. "Currently Exploring"
 * lists real interest areas, explicitly not framed as completed work.
 */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
      <p className="font-mono text-sm" style={{ color: 'var(--color-text)' }}>
        {value}
      </p>
    </div>
  )
}

export function ResearchLabSection() {
  const { research, researchIntro, currentlyExploring } = portfolioConfig
  const featured = research[0]

  if (!featured) return null

  return (
    <SectionShell id="research">
      <SectionHeader slug="lab" title="Research Lab" description={researchIntro} />

      <article
        className="hover-lift overflow-hidden rounded-[var(--radius-card)] border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
          {/* Metadata sidebar — the notebook aesthetic's labeled key/value
              rows, using only real fields (status, type, areas). */}
          <div
            className="flex flex-col gap-5 border-b p-6 lg:border-b-0 lg:border-r"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <MetaRow label="Status" value={featured.status} />
            {featured.type && <MetaRow label="Type" value={featured.type} />}
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="mb-3 text-xl font-semibold sm:text-2xl" style={{ color: 'var(--color-text)' }}>
              {featured.title}
            </h3>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {featured.description}
            </p>

            {featured.areas && featured.areas.length > 0 && (
              <>
                <p
                  className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Focus areas
                </p>
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
              </>
            )}
          </div>
        </div>
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
