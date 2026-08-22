import { useRole } from '../../hooks/useRole'
import { isValidSafeUrl } from '../../lib/config/exportImport'

export function CertificationsSection() {
  const { filteredCertifications } = useRole()

  if (filteredCertifications.length === 0) return null

  return (
    <section id="certifications" className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Certifications
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {filteredCertifications.map((cert) => (
            <li
              key={cert.id}
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
                {cert.name}
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {cert.issuer}
                {cert.date ? ` · ${cert.date}` : ''}
              </p>
              {cert.url && isValidSafeUrl(cert.url) ? (
                <a
                  href={cert.url}
                  className="mt-2 inline-block text-xs underline"
                  style={{ color: 'var(--color-accent)' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View certificate
                </a>
              ) : (
                <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Certificate URL not configured
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
