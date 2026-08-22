import { useRole } from '../../hooks/useRole'

export function MetricsSection() {
  const { filteredMetrics } = useRole()

  if (filteredMetrics.length === 0) return null

  return (
    <section id="metrics" className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredMetrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-xl border p-6 text-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p
              className="text-3xl font-bold"
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
    </section>
  )
}
