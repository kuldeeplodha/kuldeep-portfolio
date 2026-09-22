import { useRole } from '../../hooks/useRole'
import { isValidSafeUrl } from '../../lib/validation/safeUrl'
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
            {cert.mediaUrl && isValidSafeUrl(cert.mediaUrl) && (
              <img
                src={cert.mediaUrl}
                alt={cert.name}
                loading="lazy"
                className="mb-2 h-24 w-full rounded-[var(--radius-base)] object-cover"
              />
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {cert.name}
              </h3>
              {cert.verified === true &&
                (cert.verifyUrl && isValidSafeUrl(cert.verifyUrl) ? (
                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}
                  >
                    Verified
                  </a>
                ) : (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}
                  >
                    Verified
                  </span>
                ))}
            </div>
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
