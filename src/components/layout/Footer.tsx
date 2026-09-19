import { portfolioConfig } from '../../config'
import { useSiteContent } from '../../lib/content/SiteContentProvider'
import { isValidSafeUrl } from '../../lib/validation/safeUrl'
import { GRID_PADDING, GRID_WIDTH } from '../ui/grid'

/**
 * V2.1 P4 (spec §47) — minimal footer: name, title, a subdued tagline,
 * social links (real URLs only), and the copyright line. CMS-FE-WIRE-P1:
 * footerContent is admin-editable via the `footer` site_content key,
 * falling back to portfolioConfig.footerContent (content.footer)
 * whenever the DB is empty/unreachable. LinkedIn/GitHub are rendered
 * only when a real URL exists — never a dead "#" link.
 */
export function Footer() {
  const { profile } = portfolioConfig
  const footerContent = useSiteContent('footer', portfolioConfig.footerContent)
  const hasLinkedIn = profile.links.linkedin && isValidSafeUrl(profile.links.linkedin)
  const hasGitHub = profile.links.github && isValidSafeUrl(profile.links.github)

  return (
    <footer
      className={`border-t ${GRID_PADDING} py-10 text-center text-sm`}
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-muted)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div className={`mx-auto ${GRID_WIDTH}`}>
        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
          {profile.name}
        </p>
        <p className="mt-1 text-xs">{footerContent.subtext}</p>

        {(hasLinkedIn || hasGitHub || profile.email) && (
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
            {hasGitHub && (
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                GitHub
              </a>
            )}
            {hasLinkedIn && (
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                LinkedIn
              </a>
            )}
            <a href={`mailto:${profile.email}`} className="hover:underline" style={{ color: 'var(--color-accent)' }}>
              Email
            </a>
          </div>
        )}

        <p className="mt-4 text-xs">{footerContent.copyright}</p>
      </div>
    </footer>
  )
}
