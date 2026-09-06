import type { ReactNode } from 'react'
import { m } from 'framer-motion'

/**
 * Single reusable reveal-on-scroll primitive (V2-P6 global polish —
 * docs/design/portfolio-v2-design-spec.md motion system: opacity+translateY,
 * 400-700ms, staggered 50-100ms). Every section is meant to reuse this
 * rather than hand-roll its own scroll animation.
 *
 * Reduced motion is handled globally (main.tsx's <MotionConfig
 * reducedMotion="user">), so this component needs no reduced-motion branch
 * of its own — framer-motion disables the transform/opacity animation for
 * users who ask for it and jumps straight to the end state.
 */
const REVEAL_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }

interface RevealProps {
  children: ReactNode
  /** Stagger offset in seconds, e.g. index * 0.06 for a list. */
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ ...REVEAL_TRANSITION, delay }}
    >
      {children}
    </m.div>
  )
}

interface RevealStaggerProps {
  children: ReactNode[]
  className?: string
  /** Delay step between successive children, in seconds (50-100ms range). */
  step?: number
}

/** Wraps a list of items (e.g. a card grid) so each reveals in sequence. */
export function RevealStagger({ children, className, step = 0.06 }: RevealStaggerProps) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  )
}
