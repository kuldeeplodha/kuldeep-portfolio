import { m } from 'framer-motion'
import { portfolioConfig, getResumeForVariant } from '../../config'
import { useRole } from '../../hooks/useRole'
import { RoleSwitcher } from '../ui/RoleSwitcher'
import { CareerPipeline } from '../ui/CareerPipeline'
import { HeroBackground } from '../ui/HeroBackground'

export function Hero() {
  const { roleId, role, theme, setRole, allRoles, isTransitioning } = useRole()
  const { profile } = portfolioConfig
  const resume = getResumeForVariant(role.resumeVariant)

  return (
    <section
      id="home"
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-28"
      style={{ background: theme.heroGradient }}
      aria-labelledby="hero-heading"
    >
      <HeroBackground roleId={roleId} />
      <div className="relative z-10 mx-auto max-w-5xl">
        <m.div
          key={roleId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isTransitioning ? 0.7 : 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            Viewing {role.label} perspective
          </p>
          <p
            className="mb-2 text-sm font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            {profile.name} · {profile.location}
          </p>
          <h1
            id="hero-heading"
            className={`mb-4 font-bold leading-tight ${
              roleId === 'software'
                ? 'font-mono text-2xl sm:text-3xl md:text-4xl'
                : roleId === 'ai'
                  ? 'text-2xl sm:text-3xl md:text-5xl'
                  : roleId === 'data'
                    ? 'text-3xl sm:text-4xl md:text-5xl tracking-tight'
                    : 'text-2xl sm:text-3xl md:text-5xl'
            }`}
            style={{ color: roleId === 'ai' ? undefined : 'var(--color-text)' }}
          >
            {role.hero.headline}
          </h1>
          <p
            className="mb-8 max-w-2xl text-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {role.hero.subtitle}
          </p>

          <div className="mb-10">
            <RoleSwitcher
              currentRole={roleId}
              roles={allRoles.map((r) => ({ id: r.id, label: r.label }))}
              onRoleChange={setRole}
            />
          </div>

          <div className="mb-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: theme.background,
              }}
            >
              {role.hero.primaryCta}
            </a>
            {role.hero.secondaryCta && (
              <a
                href="#experience"
                className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {role.hero.secondaryCta}
              </a>
            )}
            <a
              href={resume.path}
              download={resume.filename}
              className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
              style={{
                borderColor: 'var(--color-accent)',
                color: 'var(--color-accent)',
              }}
            >
              Download Resume
            </a>
          </div>

          <CareerPipeline roleId={roleId} />
        </m.div>
      </div>
    </section>
  )
}
