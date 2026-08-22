import { useState } from 'react'
import { portfolioConfig, getResumeForVariant } from '../../config'
import { isValidSafeUrl } from '../../lib/config/exportImport'
import { useRole } from '../../hooks/useRole'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'about', label: 'About' },
  { id: 'ask', label: 'Ask Kuldeep' },
  { id: 'contact', label: 'Contact' },
]

export function Navbar() {
  const { profile } = portfolioConfig
  const { role } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const resume = getResumeForVariant(role.resumeVariant)

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 90%, transparent)',
      }}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
        aria-label="Main navigation"
      >
        <a
          href="#home"
          className="flex shrink-0 items-center gap-2.5 min-w-0"
          style={{ color: 'var(--color-text)' }}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-[var(--color-accent)]"
            />
          ) : (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
              }}
              aria-hidden
            >
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
          )}
          <span className="whitespace-nowrap font-semibold text-sm sm:text-base">
            <span className="lg:hidden">{profile.navDisplayName ?? profile.name}</span>
            <span className="hidden lg:inline">{profile.name}</span>
          </span>
        </a>

        <ul className="hidden items-center gap-5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="rounded-md px-2 py-2 text-sm transition-opacity hover:opacity-80"
                style={{
                  color: role.navEmphasis.includes(item.id)
                    ? 'var(--color-accent)'
                    : 'var(--color-text-muted)',
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={resume.path}
              download={resume.filename}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                borderColor: 'var(--color-accent)',
                color: 'var(--color-accent)',
              }}
            >
              Resume
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border p-2 lg:hidden"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="border-t px-6 py-4 lg:hidden"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          <ul className="space-y-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block min-h-11 py-3 text-sm leading-none"
                  style={{ color: 'var(--color-text)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={resume.path}
                download={resume.filename}
                className="block py-1 text-sm font-medium"
                style={{ color: 'var(--color-accent)' }}
              >
                Download Resume
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export function ContactSection() {
  const { profile } = portfolioConfig
  const { role } = useRole()
  const resume = getResumeForVariant(role.resumeVariant)

  return (
    <section id="contact" className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Contact
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Interested in collaborating? Reach out.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
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
          <a
            href={resume.path}
            download={resume.filename}
            className="inline-block rounded-lg border px-6 py-3 text-sm font-semibold"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Download {resume.label}
          </a>
        </div>
        {profile.showPhone && profile.phone && (
          <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {profile.phone}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-4 text-sm">
          {profile.links.linkedin && isValidSafeUrl(profile.links.linkedin) ? (
            <a href={profile.links.linkedin} style={{ color: 'var(--color-accent)' }}>
              LinkedIn
            </a>
          ) : (
            <span style={{ color: 'var(--color-text-muted)' }}>LinkedIn: not configured</span>
          )}
          {profile.links.github && isValidSafeUrl(profile.links.github) ? (
            <a href={profile.links.github} style={{ color: 'var(--color-accent)' }}>
              GitHub
            </a>
          ) : (
            <span style={{ color: 'var(--color-text-muted)' }}>GitHub: not configured</span>
          )}
        </div>
      </div>
    </section>
  )
}
