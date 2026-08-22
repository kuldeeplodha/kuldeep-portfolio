import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { RoleId } from '../../types'

const STAGES = [
  { id: 'software', label: 'Software' },
  { id: 'data', label: 'Data' },
  { id: 'ml', label: 'ML' },
  { id: 'ai', label: 'AI' },
] as const

type StageId = (typeof STAGES)[number]['id']

interface CareerPipelineProps {
  roleId: RoleId
}

function roleEmphasisIndex(roleId: RoleId): number {
  if (roleId === 'software') return 0
  if (roleId === 'data') return 1
  if (roleId === 'ai') return 3
  return -1 // system: all emphasized
}

export function CareerPipeline({ roleId }: CareerPipelineProps) {
  const [hoveredId, setHoveredId] = useState<StageId | null>(null)
  const [focusedId, setFocusedId] = useState<StageId | null>(null)
  const reduceMotion = useReducedMotion()
  const emphasisEnd = roleEmphasisIndex(roleId)
  const isSystem = roleId === 'system'

  const activeId = focusedId ?? hoveredId

  function isNodeActive(index: number): boolean {
    if (activeId) {
      const activeIndex = STAGES.findIndex((s) => s.id === activeId)
      return index <= activeIndex
    }
    if (isSystem) return true
    return index <= emphasisEnd + 1
  }

  function isEdgeActive(fromIndex: number): boolean {
    return isNodeActive(fromIndex) && isNodeActive(fromIndex + 1)
  }

  return (
    <div
      className="relative w-full"
      role="group"
      aria-label="Career progression pipeline"
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-0">
        {STAGES.map((stage, index) => {
          const active = isNodeActive(index)
          const isCurrentRole =
            (roleId === 'software' && stage.id === 'software') ||
            (roleId === 'data' && stage.id === 'data') ||
            (roleId === 'ai' && stage.id === 'ai') ||
            (roleId === 'system' && stage.id === 'ai')

          return (
            <div key={stage.id} className="flex items-center sm:flex-1 sm:justify-center">
              <motion.button
                type="button"
                className="relative z-10 w-full rounded-lg border px-4 py-2.5 text-sm font-mono transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
                style={{
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  opacity: active ? 1 : 0.45,
                  outlineColor: 'var(--color-accent)',
                  boxShadow: isCurrentRole && isSystem
                    ? '0 0 12px color-mix(in srgb, var(--color-accent) 40%, transparent)'
                    : undefined,
                }}
                aria-pressed={active}
                aria-label={`${stage.label} stage${active ? ', active in career path' : ''}`}
                onMouseEnter={() => setHoveredId(stage.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setFocusedId(stage.id)}
                onBlur={() => setFocusedId(null)}
                animate={
                  reduceMotion
                    ? {}
                    : {
                        scale: active && (hoveredId === stage.id || focusedId === stage.id) ? 1.05 : 1,
                      }
                }
                transition={{ duration: 0.2 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                    }}
                    aria-hidden
                  />
                  {stage.label}
                </span>
              </motion.button>

              {index < STAGES.length - 1 && (
                <div
                  className="mx-auto hidden h-0.5 w-8 sm:mx-2 sm:block sm:h-0.5 sm:w-12 lg:w-16"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: isEdgeActive(index)
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                      opacity: isEdgeActive(index) ? 0.8 : 0.35,
                    }}
                  />
                </div>
              )}

              {index < STAGES.length - 1 && (
                <div className="mx-auto h-4 w-0.5 sm:hidden" aria-hidden>
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: isEdgeActive(index)
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                      opacity: isEdgeActive(index) ? 0.8 : 0.35,
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isSystem && !reduceMotion && (
        <motion.p
          className="mt-3 text-center text-xs"
          style={{ color: 'var(--color-text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Hover or focus nodes to explore the career path
        </motion.p>
      )}
    </div>
  )
}
