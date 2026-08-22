import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { RoleId } from '../types'
import { portfolioConfig } from '../config'

const ROLE_IDS: RoleId[] = ['software', 'ai', 'data', 'system']

function parseRole(value: string | null): RoleId {
  if (value && ROLE_IDS.includes(value as RoleId)) {
    return value as RoleId
  }
  return 'system'
}

export function useRole() {
  const [searchParams, setSearchParams] = useSearchParams()
  const roleId = parseRole(searchParams.get('role'))
  const [isTransitioning, setIsTransitioning] = useState(false)

  const role = portfolioConfig.roles[roleId]
  const theme = portfolioConfig.themes[role.themeId]

  const setRole = useCallback(
    (nextRole: RoleId) => {
      if (nextRole === roleId) return
      setIsTransitioning(true)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (nextRole === 'system') {
            next.delete('role')
          } else {
            next.set('role', nextRole)
          }
          return next
        },
        { replace: true },
      )
      window.setTimeout(() => setIsTransitioning(false), 300)
    },
    [roleId, setSearchParams],
  )

  useEffect(() => {
    document.documentElement.style.setProperty('--color-bg', theme.background)
    document.documentElement.style.setProperty('--color-surface', theme.surface)
    document.documentElement.style.setProperty('--color-text', theme.text)
    document.documentElement.style.setProperty('--color-text-muted', theme.textMuted)
    document.documentElement.style.setProperty('--color-accent', theme.accent)
    document.documentElement.style.setProperty('--color-border', theme.border)
  }, [theme])

  const filteredMetrics = useMemo(
    () =>
      portfolioConfig.metrics.filter((m) =>
        role.highlightedMetricIds.length > 0
          ? role.highlightedMetricIds.includes(m.id)
          : m.relevantRoles.includes(roleId),
      ),
    [role, roleId],
  )

  const filteredProjects = useMemo(
    () =>
      portfolioConfig.projects.filter((p) =>
        role.highlightedProjectIds.length > 0
          ? role.highlightedProjectIds.includes(p.id)
          : p.relevantRoles.includes(roleId),
      ),
    [role, roleId],
  )

  const sortedExperience = useMemo(() => {
    const order = role.experiencePriorityIds
    return [...portfolioConfig.experience].sort((a, b) => {
      const aIdx = order.indexOf(a.id)
      const bIdx = order.indexOf(b.id)
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
  }, [role])

  return {
    roleId,
    role,
    theme,
    setRole,
    isTransitioning,
    filteredMetrics,
    filteredProjects,
    sortedExperience,
    allRoles: ROLE_IDS.map((id) => portfolioConfig.roles[id]),
  }
}
