import { motion } from 'framer-motion'
import { portfolioConfig } from '../../config'
import { useRole } from '../../hooks/useRole'
import { RoleSwitcher } from '../ui/RoleSwitcher'
import { CareerPipeline } from '../ui/CareerPipeline'

export function Hero() {
  const { roleId, role, theme, setRole, allRoles, isTransitioning } = useRole()
  const { profile } = portfolioConfig

  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 py-20 md:py-28"
      style={{ background: theme.heroGradient }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          key={roleId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isTransitioning ? 0.7 : 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p
            className="mb-2 text-sm font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            {profile.name} · {profile.location}
          </p>
          <h1
            className="mb-4 text-3xl font-bold leading-tight md:text-5xl"
            style={{ color: 'var(--color-text)' }}
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
          </div>

          <CareerPipeline roleId={roleId} />
        </motion.div>
      </div>
    </section>
  )
}
