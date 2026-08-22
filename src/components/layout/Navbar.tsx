import { portfolioConfig } from '../../config'
import { useRole } from '../../hooks/useRole'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'ask', label: 'Ask Kuldeep' },
  { id: 'contact', label: 'Contact' },
]

export function Navbar() {
  const { profile } = portfolioConfig

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 85%, transparent)',
      }}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="#home"
          className="font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          {profile.name}
        </a>
        <ul className="hidden gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export function ContactSection() {
  const { profile } = portfolioConfig
  const { role } = useRole()

  return (
    <section id="contact" className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Contact
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Interested in collaborating? Reach out.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
        >
          {profile.email}
        </a>
        <p className="mt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Resume variant: {role.resumeVariant.replace('_', ' ')}
        </p>
      </div>
    </section>
  )
}
