const SESSION_KEY = 'kuldeep-portfolio-admin-session'

// Deterrence-grade gate for a statically hosted site: the public bundle can
// only ever contain a SHA-256 digest of the admin password, never the
// password itself. This is NOT server-side authentication — see
// docs/CICD_PLAN.md for the standing security caveat.
export function getAdminPasswordHash(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD_HASH ?? ''
}

export function isAdminConfigured(): boolean {
  return getAdminPasswordHash().length > 0
}

export function isAdminAuthenticated(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(SESSION_KEY) === 'authenticated'
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Length-checked XOR fold over the hex digests; cheap constant-time-ish
// comparison so timing leaks are not useful against a 64-char space.
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function loginAdmin(password: string): Promise<boolean> {
  const expected = getAdminPasswordHash()
  if (!expected) return false
  const candidate = await sha256Hex(password)
  if (!constantTimeEqual(candidate, expected.toLowerCase())) return false
  sessionStorage.setItem(SESSION_KEY, 'authenticated')
  return true
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
