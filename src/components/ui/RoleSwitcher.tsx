import { m } from 'framer-motion'
import type { RoleId } from '../../types'

interface RoleSwitcherProps {
  currentRole: RoleId
  roles: { id: RoleId; label: string }[]
  onRoleChange: (role: RoleId) => void
}

export function RoleSwitcher({ currentRole, roles, onRoleChange }: RoleSwitcherProps) {
  return (
    <div
      className="relative flex flex-wrap gap-2"
      role="tablist"
      aria-label="Professional perspective"
    >
      {roles.map((role) => {
        const isActive = role.id === currentRole
        return (
          <m.button
            key={role.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onRoleChange(role.id)}
            layout
            whileTap={{ scale: 0.97 }}
            className="relative rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
              color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
            }}
          >
            {role.label}
          </m.button>
        )
      })}
    </div>
  )
}
