import type { ReactNode } from 'react'

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
 */
export function SectionShell({ id, children, muted, narrow, className }: SectionShellProps) {
  return (
    <section
      id={id}
      className={`px-4 py-16 sm:px-6 sm:py-20${className ? ` ${className}` : ''}`}
      style={muted ? { backgroundColor: 'var(--color-surface)' } : undefined}
    >
      <div className={narrow ? 'mx-auto max-w-3xl' : 'mx-auto max-w-5xl'}>{children}</div>
    </section>
  )
}
