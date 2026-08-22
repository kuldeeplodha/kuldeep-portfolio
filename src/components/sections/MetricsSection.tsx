import { useRole } from '../../hooks/useRole'
import type { RoleId } from '../../types'
import { RoleTransition } from '../ui/RoleTransition'

function ChartAccent({ roleId, index }: { roleId: RoleId; index: number }) {
  const heights = roleId === 'data'
    ? [40, 65, 50, 80, 55, 70, 45]
    : [30, 50, 35, 60, 40, 55, 38]

  return (
    <div className="mb-3 flex h-8 items-end justify-center gap-0.5" aria-hidden>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-t-sm transition-all"
          style={{
            height: `${h * (i === index % heights.length ? 1.2 : 0.7)}%`,
            backgroundColor:
              i === index % heights.length
                ? 'var(--color-accent)'
                : 'color-mix(in srgb, var(--color-accent) 30%, var(--color-border))',
            opacity: i === index % heights.length ? 1 : 0.5,
          }}
        />
      ))}
    </div>
  )
}

export function MetricsSection() {
  const { filteredMetrics, roleId } = useRole()

  if (filteredMetrics.length === 0) return null

  const isDataRole = roleId === 'data'

  return (
    <section id="metrics" className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
      <RoleTransition>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredMetrics.map((metric, index) => (
          <div
            key={metric.id}
            className="role-card group relative overflow-hidden border p-6 text-center transition-shadow hover:shadow-md"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: isDataRole
                ? 'color-mix(in srgb, var(--color-bg) 50%, var(--color-surface))'
                : 'var(--color-surface)',
            }}
          >
            {(isDataRole || roleId === 'system') && (
              <ChartAccent roleId={roleId} index={index} />
            )}

            {isDataRole && (
              <div
                className="absolute right-0 top-0 h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, var(--color-accent), transparent)`,
                  opacity: 0.3,
                }}
                aria-hidden
              />
            )}

            <p
              className="text-3xl font-bold tabular-nums"
              style={{ color: 'var(--color-accent)' }}
            >
              {metric.value}
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {metric.label}
            </p>
          </div>
        ))}
        </div>
      </RoleTransition>
    </section>
  )
}
