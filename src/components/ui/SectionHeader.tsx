import type { SectionSlug } from '../../config/sectionOrder'
import { sectionNumber } from '../../config/sectionOrder'

interface SectionHeaderProps {
  slug: SectionSlug
  title: string
  description?: string
}

/**
 * Reusable numbered section header (docs/design/portfolio-v2-design-spec.md
 * §1 "Section Headers"): `01 / Title`, muted number + full-contrast title,
 * with an optional supporting line.
 */
export function SectionHeader({ slug, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className="mb-2 flex items-baseline gap-3">
        <span
          aria-hidden
          className="font-mono text-sm font-semibold tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {sectionNumber(slug)} /
        </span>
        <h2 className="text-xl font-bold sm:text-2xl" style={{ color: 'var(--color-text)' }}>
          {title}
        </h2>
      </div>
      {description && (
        <p className="max-w-2xl text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
