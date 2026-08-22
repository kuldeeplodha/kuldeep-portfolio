import { useRole } from '../../hooks/useRole'

export function SkillsSection() {
  const { filteredSkills, skillChains, roleId } = useRole()

  return (
    <section id="skills" className="px-4 py-16 sm:px-6" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-xl font-bold sm:text-2xl" style={{ color: 'var(--color-text)' }}>
          Skills
        </h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Technology clusters — no proficiency percentages, only evidence-based groupings.
        </p>

        {/* Role-specific skill chains */}
        <div className="mb-10 space-y-4">
          {skillChains.map((chain, ci) => (
            <div
              key={ci}
              className="overflow-x-auto pb-2"
              role="list"
              aria-label={`Skill chain ${ci + 1}`}
              tabIndex={0}
            >
              <div className="flex min-w-max flex-nowrap items-center gap-2">
                {chain.map((skill, si) => (
                  <span key={skill} className="flex shrink-0 items-center gap-2" role="listitem">
                    <span
                      className="rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap"
                    style={{
                      borderColor: si === 0 ? 'var(--color-accent)' : 'var(--color-border)',
                      color: si === 0 ? 'var(--color-accent)' : 'var(--color-text)',
                      backgroundColor: 'var(--color-bg)',
                    }}
                  >
                    {skill}
                  </span>
                  {si < chain.length - 1 && (
                    <span style={{ color: 'var(--color-text-muted)' }} aria-hidden>
                      →
                    </span>
                  )}
                </span>
              ))}
              </div>
            </div>
          ))}
        </div>

        {/* Category clusters */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3
                className="mb-3 text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-accent)' }}
              >
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {roleId === 'system' && filteredSkills.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Select a role perspective to see highlighted skill clusters.
          </p>
        )}
      </div>
    </section>
  )
}
