const SESSION_KEY = 'kuldeep-portfolio-admin-session'

export function getAdminPassword(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD ?? ''
}

export function isAdminConfigured(): boolean {
  return getAdminPassword().length > 0
}

export function isAdminAuthenticated(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(SESSION_KEY) === 'authenticated'
}

export function loginAdmin(password: string): boolean {
  const expected = getAdminPassword()
  if (!expected) return false
  if (password !== expected) return false
  sessionStorage.setItem(SESSION_KEY, 'authenticated')
  return true
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
