// CMS-UNIFY-CONFIG-EDITOR: extracted out of the retired
// src/lib/config/exportImport.ts (which re-exported it from the also-
// retired validationRegistry.ts) — this is the one validator function
// with real public-facing consumers (Navbar/Footer social links,
// CertificationsSection, Project/CaseStudy detail github/live links),
// so it survives on its own rather than being deleted with the rest of
// the legacy config-draft validation machinery.

/**
 * Validates whether a given URL is safe (http, https, or a relative path).
 * Disallows javascript:, data:, vbscript:, protocol-relative //, and malformed inputs.
 */
export function isValidSafeUrl(url: string | undefined | null): boolean {
  if (!url) return true
  const trimmed = url.trim()
  if (!trimmed) return true
  // Allow relative paths starting with '/' but not protocol-relative '//'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
