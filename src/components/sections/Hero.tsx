import { m } from 'framer-motion'
import { portfolioConfig, getResumeForVariant } from '../../config'
import { useRole } from '../../hooks/useRole'
import { RoleSwitcher } from '../ui/RoleSwitcher'
import { CareerJourney } from '../ui/CareerJourney'
import { HeroBackground } from '../ui/HeroBackground'

/** Resolves a hero CTA's href — 'resume' downloads the resume, anything else is an in-page anchor. */
function ctaHref(target: string, resumePath: string): string {
  return target === 'resume' ? resumePath : target
}

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
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            Viewing {role.label} perspective
          </p>

          <p
            className="mb-2 text-sm font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            {role.hero.eyebrow}
          </p>
          <p
            className="mb-4 text-sm font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {profile.name} · {profile.title} · {profile.location}
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
          {/* uiContentRules.limits.heroParagraphs = 1 */}
          <p className="mb-6 max-w-2xl text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {role.hero.subtitle}
          </p>

          <ul className="mb-8 flex flex-wrap gap-2" aria-label={`${role.label} focus areas`}>
            {role.hero.focus.map((keyword) => (
              <li
                key={keyword}
                className="rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                  color: 'var(--color-accent)',
                }}
              >
                {keyword}
              </li>
            ))}
          </ul>

          <div className="mb-10 flex flex-wrap gap-4">
            <a
              href={ctaHref(role.hero.primaryCtaTarget, resume.path)}
              className="rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)', color: theme.background }}
            >
              {role.hero.primaryCta}
            </a>
            {role.hero.secondaryCta && role.hero.secondaryCtaTarget && (
              <a
                href={ctaHref(role.hero.secondaryCtaTarget, resume.path)}
                download={role.hero.secondaryCtaTarget === 'resume' ? resume.filename : undefined}
                className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {role.hero.secondaryCta}
              </a>
            )}
          </div>

          <CareerJourney />
        </m.div>

        {/* V2 §2.2: role switcher demoted below the main hero message — a
            secondary "explore another perspective" interaction, not the
            primary identity toggle. Fully functional: ?role= params,
            theming, and smooth transition are unchanged from before. */}
        <div className="mt-10 border-t pt-8" style={{ borderColor: 'var(--color-border)' }}>
          <p
            className="mb-3 text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Explore another perspective
          </p>
          <RoleSwitcher
            currentRole={roleId}
            roles={allRoles.map((r) => ({ id: r.id, label: r.label }))}
            onRoleChange={setRole}
          />
        </div>
      </div>
    </section>
  )
}
