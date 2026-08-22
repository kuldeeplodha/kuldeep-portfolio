import { portfolioConfig } from '../../config'

export function Footer() {
  const { profile } = portfolioConfig
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t px-6 py-8 text-center text-sm"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-muted)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <p>
        © {year} {profile.name} · {profile.location}
      </p>
      <p className="mt-1 text-xs">
        Built with React, TypeScript, Vite — configuration-first architecture
      </p>
    </footer>
  )
}
