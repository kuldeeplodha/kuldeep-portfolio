import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { portfolioConfig, getResumeForVariant } from '../../config'
import { isValidSafeUrl } from '../../lib/config/exportImport'
import { useRole } from '../../hooks/useRole'
import { GRID_PADDING, GRID_WIDTH } from '../ui/grid'

// Anchor ids are unchanged from V1.6 (role.navEmphasis + existing e2e/section
// ids key off these) — only the visible labels move to V2 terminology.
const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Work' },
  { id: 'research', label: 'Lab' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'education', label: 'Education' },
  { id: 'about', label: 'About' },
  { id: 'ask', label: 'Ask Kuldeep' },
  { id: 'contact', label: 'Contact' },
]

// V2 IA (docs/design/portfolio-v2-design-spec.md §2.1): primary bar is
// Work / Experience / Lab / About, in that order. Ask Kuldeep + Resume are
// standalone secondary CTAs. Everything else (Stack/Education/Contact/
// Blog) is demoted into the "More" menu — Blog stays reachable there.
// 'stack' (Engineering Stack, V2-P4) replaced the old 'skills' anchor —
// SkillsSection is no longer rendered on the homepage.
const PRIMARY_IDS = ['projects', 'experience', 'research', 'about'] as const
const PRIMARY_ITEMS = PRIMARY_IDS.map((id) => NAV_ITEMS.find((item) => item.id === id)!)

type MoreItem = { id: string; label: string; to?: string }
const MORE_ITEMS: MoreItem[] = [
  { id: 'stack', label: 'Stack' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
  { id: 'blog', label: 'Blog', to: '/blog' },
  // V2.2 P3: case studies are new public content (PRD §6.2) — reachable
  // from the homepage strip already, added here too so they're discoverable
  // from every page, matching how Blog already works.
  { id: 'case-studies', label: 'Case Studies', to: '/case-studies' },
]

function navLinkStyle(active: boolean) {
  return {
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
  }
}

export function Navbar() {
  const { profile } = portfolioConfig
  const { role } = useRole()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLLIElement>(null)
  const moreTriggerRef = useRef<HTMLButtonElement>(null)
  const resume = getResumeForVariant(role.resumeVariant)

  // V2-P6 a11y: standard disclosure-menu keyboard behavior — move focus
  // into the menu on open, and back to the trigger button on close (click
  // outside, Escape, or picking an item), so keyboard users never lose
  // their place.
  useEffect(() => {
    if (!moreOpen) return

    const firstItem = moreRef.current?.querySelector<HTMLElement>('[role="menuitem"]')
    firstItem?.focus()

    function handlePointerDown(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMoreOpen(false)
        moreTriggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [moreOpen])

  // V2.1 P1 (spec: "mobile menu: Escape-close, scroll-lock, keyboard, large
  // targets"). Large targets (min-h-11) and keyboard reachability (plain
  // links) already existed; Escape-close and scroll-lock did not.
  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  return (
    <header className="sticky top-3 z-50 px-3 sm:top-4 sm:px-4">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav
        className={`mx-auto flex ${GRID_WIDTH} items-center justify-between gap-3 rounded-[var(--radius-pill)] border px-4 py-2.5 shadow-[var(--shadow-glass-sm)] backdrop-blur-xl sm:px-5`}
        style={{
          borderColor: 'color-mix(in srgb, var(--color-border) 55%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-bg) 78%, transparent)',
        }}
        aria-label="Main navigation"
      >
        <Link
          to={{ pathname: '/', hash: 'home', search: location.search }}
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
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {PRIMARY_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                to={{ pathname: '/', hash: item.id, search: location.search }}
                className="rounded-[var(--radius-base)] px-3 py-2 text-sm transition-colors nav-hover"
                style={navLinkStyle(role.navEmphasis.includes(item.id))}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="relative" ref={moreRef}>
            <button
              ref={moreTriggerRef}
              type="button"
              className="flex items-center gap-1 rounded-[var(--radius-base)] px-3 py-2 text-sm transition-colors nav-hover"
              style={navLinkStyle(MORE_ITEMS.some((item) => role.navEmphasis.includes(item.id)))}
              onClick={() => setMoreOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
            >
              More
              <span aria-hidden className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {moreOpen && (
              <div
                role="menu"
                aria-label="More navigation links"
                className="menu-pop-in absolute right-0 top-[calc(100%+0.5rem)] w-48 overflow-hidden rounded-[var(--radius-base)] border p-1.5 shadow-[var(--shadow-glass-md)] backdrop-blur-xl"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-border) 55%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
                }}
              >
                {MORE_ITEMS.map((item) => (
                  <Link
                    key={item.id}
                    role="menuitem"
                    // V2.2 P3: a plain-path item (Blog, Case Studies) must
                    // carry `search` forward explicitly too, same as the
                    // hash-anchor items already did — otherwise clicking
                    // through drops ?role= and silently resets the theme
                    // (PRD §7.1).
                    to={
                      item.to
                        ? { pathname: item.to, search: location.search }
                        : { pathname: '/', hash: item.id, search: location.search }
                    }
                    className="block rounded-[calc(var(--radius-base)-4px)] px-3 py-2 text-sm transition-colors nav-hover"
                    style={
                      item.to
                        ? { color: location.pathname.startsWith(item.to) ? 'var(--color-text)' : 'var(--color-text-muted)' }
                        : navLinkStyle(role.navEmphasis.includes(item.id))
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </li>
          <li>
            <Link
              to={{ pathname: '/', hash: 'ask', search: location.search }}
              className="rounded-[var(--radius-base)] px-3 py-2 text-sm font-medium transition-colors nav-hover"
              style={navLinkStyle(role.navEmphasis.includes('ask'))}
            >
              Ask Kuldeep
            </Link>
          </li>
          <li>
            <a
              href={resume.path}
              download={resume.filename}
              className="rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm font-medium transition-transform hover:scale-105"
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
          className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-pill)] border p-2 lg:hidden"
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
          className={`menu-pop-in mx-auto mt-2 ${GRID_WIDTH} rounded-[var(--radius-card)] border px-6 py-4 shadow-[var(--shadow-glass-md)] backdrop-blur-xl lg:hidden`}
          style={{
            borderColor: 'color-mix(in srgb, var(--color-border) 55%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
          }}
        >
          <ul className="space-y-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  to={{ pathname: '/', hash: item.id, search: location.search }}
                  className="block min-h-11 py-3 text-sm leading-none"
                  style={{ color: 'var(--color-text)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={{ pathname: '/blog', search: location.search }}
                className="block min-h-11 py-3 text-sm leading-none"
                style={{
                  color: location.pathname.startsWith('/blog')
                    ? 'var(--color-accent)'
                    : 'var(--color-text)',
                }}
                onClick={() => setMobileOpen(false)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to={{ pathname: '/case-studies', search: location.search }}
                className="block min-h-11 py-3 text-sm leading-none"
                style={{
                  color: location.pathname.startsWith('/case-studies')
                    ? 'var(--color-accent)'
                    : 'var(--color-text)',
                }}
                onClick={() => setMobileOpen(false)}
              >
                Case Studies
              </Link>
            </li>
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
  const { profile, contactContent } = portfolioConfig
  const { role } = useRole()
  const resume = getResumeForVariant(role.resumeVariant)
  const hasLinkedIn = profile.links.linkedin && isValidSafeUrl(profile.links.linkedin)
  const hasGitHub = profile.links.github && isValidSafeUrl(profile.links.github)

  return (
    <section
      id="contact"
      className={`${GRID_PADDING} py-16`}
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="mx-auto max-w-3xl text-center">
        {/* V2.1 P4 (spec §46), real content verbatim (content.contact). */}
        <h2 className="mb-4 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-text)' }}>
          {contactContent.title}
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {contactContent.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="inline-block rounded-[var(--radius-base)] px-6 py-3 text-sm font-semibold"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg)',
            }}
          >
            Get in touch
          </a>
          <a
            href={resume.path}
            download={resume.filename}
            className="inline-block rounded-[var(--radius-base)] border px-6 py-3 text-sm font-semibold"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Download {resume.label}
          </a>
        </div>
        <a
          href={`mailto:${profile.email}`}
          className="mt-4 inline-block text-sm hover:underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {profile.email}
        </a>
        {profile.showPhone && profile.phone && (
          <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {profile.phone}
          </p>
        )}
        {/* V2.1 P4: gracefully omit LinkedIn/GitHub entirely when no real
            URL is configured, rather than showing a "not configured"
            placeholder or a dead "#" link (spec §46's boundary). */}
        {(hasLinkedIn || hasGitHub) && (
          <div className="mt-6 flex justify-center gap-4 text-sm">
            {hasLinkedIn && (
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-accent)' }}
              >
                LinkedIn
              </a>
            )}
            {hasGitHub && (
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-accent)' }}
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
