import type { RoleId } from '../../types'
import { ROLE_IDS, ROLE_LABELS } from '../../lib/admin/roleLabels'

interface RoleScopeEditorProps {
  value: RoleId[]
  onChange: (roles: RoleId[]) => void
  label?: string
  hint?: string
}

export function RoleScopeEditor({
  value,
  onChange,
  label = 'Visible on resume pages',
  hint = 'Select which role perspectives show this content.',
}: RoleScopeEditorProps) {
  const toggle = (role: RoleId) => {
    if (value.includes(role)) {
      onChange(value.filter((r) => r !== role))
    } else {
      onChange([...value, role])
    }
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-300">{label}</legend>
      {hint && <p className="mb-3 text-xs text-slate-500">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {ROLE_IDS.filter((r) => r !== 'system').map((role) => {
          const active = value.includes(role)
          return (
            <button
              key={role}
              type="button"
              onClick={() => toggle(role)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                borderColor: active ? '#22d3ee' : '#334155',
                backgroundColor: active ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                color: active ? '#22d3ee' : '#94a3b8',
              }}
            >
              {ROLE_LABELS[role]}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => toggle('system')}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
          style={{
            borderColor: value.includes('system') ? '#34d399' : '#334155',
            backgroundColor: value.includes('system') ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
            color: value.includes('system') ? '#34d399' : '#94a3b8',
          }}
        >
          System view
        </button>
      </div>
    </fieldset>
  )
}

export function RoleBadges({ roles }: { roles: RoleId[] }) {
  if (roles.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <span
          key={role}
          className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: 'rgba(34, 211, 238, 0.12)',
            color: '#22d3ee',
          }}
        >
          {ROLE_LABELS[role]}
        </span>
      ))}
    </div>
  )
}
