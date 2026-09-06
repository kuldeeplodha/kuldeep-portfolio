import { portfolioConfig } from '../../config'

/**
 * Compact factual timeline of the software -> data -> ML -> AI evolution
 * (V2 career journey, real content from careerJourney.ts). Kept intentionally
 * light for the hero: period + title only, full description available via
 * `title` attribute rather than inline text, per uiContentRules (medium
 * density, avoid walls of text).
 */
export function CareerJourney() {
  const { careerJourney } = portfolioConfig

  return (
    <div className="w-full" role="group" aria-label="Career evolution: software to AI">
      <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-0">
        {careerJourney.map((step, index) => (
          <li key={step.period} className="flex items-center sm:flex-1">
            <div
              className="flex w-full flex-col gap-0.5 rounded-[var(--radius-base)] border px-3 py-2"
              style={{ borderColor: 'var(--color-border)' }}
              title={step.description}
            >
              <span
                className="font-mono text-[11px] font-semibold tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {step.period.toUpperCase()}
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {step.title}
              </span>
            </div>
            {index < careerJourney.length - 1 && (
              <div
                className="mx-2 hidden h-0.5 w-4 shrink-0 rounded-[var(--radius-pill)] sm:block"
                style={{ backgroundColor: 'var(--color-border)' }}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
