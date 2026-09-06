import type { RoleId } from '../../types'

interface HeroBackgroundProps {
  roleId: RoleId
}

/**
 * CSS-only decorative backgrounds per role.
 * See docs/DESIGN_SYSTEM.md § Role-specific visual language.
 */
export function HeroBackground({ roleId }: HeroBackgroundProps) {
  if (roleId === 'software') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-accent) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute bottom-8 left-6 font-mono text-xs opacity-20"
          style={{ color: 'var(--color-accent)' }}
        >
          {'> portfolio --role=software'}
          <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-current" />
        </div>
      </div>
    )
  }

  if (roleId === 'data') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <svg className="absolute bottom-0 right-0 h-48 w-full opacity-[0.08]" preserveAspectRatio="none" viewBox="0 0 400 120">
          <polyline
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            points="0,100 60,80 120,90 180,50 240,60 300,30 360,40 400,20"
          />
          <polyline
            fill="none"
            stroke="var(--color-accent-muted, var(--color-accent))"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            points="0,110 80,95 160,85 240,70 320,55 400,45"
          />
        </svg>
      </div>
    )
  }

  if (roleId === 'ai') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -right-20 -top-20 h-80 w-80 rounded-[var(--radius-pill)] opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-10 -left-10 h-60 w-60 rounded-[var(--radius-pill)] opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, var(--color-accent-muted, var(--color-accent)) 0%, transparent 70%)',
          }}
        />
      </div>
    )
  }

  // system — hybrid gradient overlay
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, color-mix(in srgb, #22d3ee 10%, transparent) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 80%, color-mix(in srgb, #a78bfa 8%, transparent) 0%, transparent 40%)
          `,
        }}
      />
    </div>
  )
}
