import { motion, useReducedMotion } from 'framer-motion'
import { portfolioConfig } from '../../config'
import { useRole } from '../../hooks/useRole'

const SAMPLE_TOKENS = [
  { text: '[CLS]', x: 40, y: 30 },
  { text: 'explain', x: 120, y: 20, highlight: true },
  { text: 'मशीन', x: 200, y: 35 },
  { text: '语言', x: 280, y: 25 },
  { text: 'token', x: 360, y: 30, highlight: true },
  { text: 'attention', x: 440, y: 22 },
  { text: '?', x: 520, y: 32 },
]

const ATTENTION_LINES = [
  { from: 1, to: 4, strength: 0.9 },
  { from: 0, to: 1, strength: 0.5 },
  { from: 4, to: 5, strength: 0.7 },
  { from: 2, to: 3, strength: 0.4 },
]

export function ResearchLabSection() {
  const { roleId } = useRole()
  const reduceMotion = useReducedMotion()
  const research = portfolioConfig.research[0]

  if (!research) return null

  const isEmphasized = roleId === 'ai' || roleId === 'system'

  return (
    <section
      id="research"
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20"
      style={{
        background: isEmphasized
          ? 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)'
          : 'var(--color-bg)',
      }}
      aria-labelledby="research-heading"
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-2 text-sm font-medium uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Research Lab
        </p>
        <h2
          id="research-heading"
          className="mb-6 text-xl font-bold sm:text-2xl md:text-3xl"
          style={{ color: 'var(--color-text)' }}
        >
          {research.title}
        </h2>
        <p
          className="mb-10 max-w-3xl text-base leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {research.description}
        </p>

        <div
          className="relative rounded-2xl border p-4 sm:p-8"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {/* Attention visualization — decorative SVG + token flow */}
          <div className="relative mb-8 hidden h-16 md:block" aria-hidden="true">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 60" preserveAspectRatio="xMidYMid meet">
              {ATTENTION_LINES.map((line, i) => {
                const from = SAMPLE_TOKENS[line.from]
                const to = SAMPLE_TOKENS[line.to]
                return (
                  <motion.line
                    key={i}
                    x1={from.x + 30}
                    y1={from.y + 10}
                    x2={to.x + 20}
                    y2={to.y + 10}
                    stroke="var(--color-accent)"
                    strokeWidth={line.strength * 2}
                    initial={reduceMotion ? { strokeOpacity: line.strength * 0.5 } : { strokeOpacity: 0 }}
                    animate={{ strokeOpacity: line.strength * 0.5 }}
                    transition={{ duration: 1, delay: i * 0.2, ease: 'easeOut' }}
                  />
                )
              })}
            </svg>
          </div>

          <div
            className="mb-8 flex flex-nowrap gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:pb-0"
            aria-hidden="true"
          >
            {SAMPLE_TOKENS.map((token, i) => (
              <motion.span
                key={token.text}
                className="shrink-0 rounded-md border px-3 py-1.5 font-mono text-xs whitespace-nowrap"
                style={{
                  borderColor: token.highlight ? 'var(--color-accent)' : 'var(--color-border)',
                  color: token.highlight ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  opacity: 1,
                }}
                animate={
                  reduceMotion
                    ? {}
                    : {
                        opacity: token.highlight ? [0.85, 1, 0.85] : 1,
                        y: isEmphasized ? [0, -2, 0] : 0,
                      }
                }
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: reduceMotion ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
              >
                {token.text}
              </motion.span>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                label: 'Focus',
                text: 'Low-resource language settings where labeled data is scarce',
              },
              {
                label: 'Approach',
                text: 'Explainability techniques for multilingual NLP model decisions',
              },
              {
                label: 'Status',
                text: research.status,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h3
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {item.label}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Visual elements are illustrative. No specific datasets, metrics, or unpublished
            results are claimed.
          </p>
        </div>
      </div>
    </section>
  )
}
