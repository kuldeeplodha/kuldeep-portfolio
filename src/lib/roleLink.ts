import type { RoleId } from '../types'

// V2.2 P3 (PRD §7, "Role-Theme Inheritance Requirement"): useRole() already
// re-syncs document.documentElement's data-role/theme vars on every render
// wherever it's mounted (Navbar, on every non-admin route) — but that only
// helps if the URL's own `?role=` survives navigation. React Router <Link>
// targets are plain paths, so any internal link that doesn't explicitly
// carry the current role param drops it the instant the user clicks it,
// silently resetting the theme to the default. This is a pre-existing app
// pattern (see ProjectDetailPage's "← Back to projects" link), not
// introduced here — every new link this phase adds uses this helper so the
// new blog/case-study pages don't repeat that bug.
export function roleQuery(roleId: RoleId): string {
  return roleId === 'system' ? '' : `?role=${roleId}`
}

export function withRoleQuery(path: string, roleId: RoleId): string {
  return `${path}${roleQuery(roleId)}`
}
