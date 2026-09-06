import { useRole } from '../../hooks/useRole'
import { isValidSafeUrl } from '../../lib/config/exportImport'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

/**
 * V2 §Background — compact certification cards, kept secondary (small,
 * dense, no large tiles) per uiContentRules.
 */
export function CertificationsSection() {
  const { filteredCertifications } = useRole()

  if (filteredCertifications.length === 0) return null

  return (
    <SectionShell id="certifications" muted>
      <SectionHeader slug="certifications" title="Certifications" />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCertifications.map((cert) => (
          <li
            key={cert.id}
            className="hover-lift rounded-[var(--radius-base)] border p-3"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
          >
            <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {cert.name}
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {cert.issuer}
              {cert.date ? ` · ${cert.date}` : ''}
            </p>
            {cert.url && isValidSafeUrl(cert.url) && (
              <a
                href={cert.url}
                className="mt-1 inline-block text-xs underline"
                style={{ color: 'var(--color-accent)' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                View certificate
              </a>
            )}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
