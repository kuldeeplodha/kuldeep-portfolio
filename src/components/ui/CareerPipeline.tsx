import { motion } from 'framer-motion'
import type { RoleId } from '../../types'

const STAGES = ['Software', 'Data', 'ML', 'AI'] as const

interface CareerPipelineProps {
  roleId: RoleId
}

export function CareerPipeline({ roleId }: CareerPipelineProps) {
  const emphasis =
    roleId === 'software'
      ? 0
      : roleId === 'data'
        ? 1
        : roleId === 'ai'
          ? 2
          : -1

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      {STAGES.map((stage, index) => {
        const isEmphasized = emphasis === -1 || index <= emphasis + 1
        return (
          <div key={stage} className="flex items-center gap-4">
            <motion.div
              className="rounded-lg border px-4 py-2 text-sm font-mono"
              style={{
                borderColor: isEmphasized ? 'var(--color-accent)' : 'var(--color-border)',
                color: isEmphasized ? 'var(--color-accent)' : 'var(--color-text-muted)',
                opacity: isEmphasized ? 1 : 0.5,
              }}
              animate={{ scale: isEmphasized ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {stage}
            </motion.div>
            {index < STAGES.length - 1 && (
              <span
                className="hidden text-lg sm:inline"
                style={{ color: 'var(--color-text-muted)' }}
                aria-hidden
              >
                →
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
