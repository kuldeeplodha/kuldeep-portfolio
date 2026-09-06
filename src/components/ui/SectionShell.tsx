import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { GRID_PADDING, GRID_WIDTH, GRID_WIDTH_NARROW } from './grid'

interface SectionShellProps {
  id: string
  children: ReactNode
  /** Alternating surface background, matching the existing section rhythm. */
  muted?: boolean
  /** Narrower reading column for prose-heavy sections (e.g. About). */
  narrow?: boolean
  className?: string
}

/**
 * Consistent grid/max-width container + spacing rhythm for section shells
 * (docs/design/portfolio-v2-design-spec.md §1). Wraps existing section
 * content — it does not replace or reinterpret it.
 *
 * V2-P6: also wraps content in the shared `Reveal` primitive so every
 * section gets the same scroll-triggered fade+translateY treatment for
 * free, instead of each section hand-rolling its own animation.
 */
export function SectionShell({ id, children, muted, narrow, className }: SectionShellProps) {
  return (
    <section
      id={id}
      className={`${GRID_PADDING} py-16 sm:py-20${className ? ` ${className}` : ''}`}
      style={muted ? { backgroundColor: 'var(--color-surface)' } : undefined}
    >
      <Reveal className={`mx-auto ${narrow ? GRID_WIDTH_NARROW : GRID_WIDTH}`}>{children}</Reveal>
    </section>
  )
}
