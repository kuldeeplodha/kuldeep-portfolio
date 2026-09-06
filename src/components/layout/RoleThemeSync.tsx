import { useRole } from '../../hooks/useRole'

// V2.2 P3 (PRD §7.2): mounted in App.tsx OUTSIDE <Routes>, so document-level
// theme sync (data-role, data-layout, --color-* vars — see useRole's effect)
// keeps running on every route, including /admin where Navbar (the other
// component that happens to call useRole()) is intentionally hidden. Renders
// nothing; the side effect is the point.
export function RoleThemeSync() {
  useRole()
  return null
}
