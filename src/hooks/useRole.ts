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
      document.documentElement.classList.add('is-switching-role')
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
      window.setTimeout(() => {
        setIsTransitioning(false)
        document.documentElement.classList.remove('is-switching-role')
      }, 450)
    },
    [roleId, setSearchParams],
  )

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-role', roleId)
    root.setAttribute('data-layout', theme.layoutVariant)
    root.style.setProperty('--color-bg', theme.background)
    root.style.setProperty('--color-surface', theme.surface)
    root.style.setProperty('--color-text', theme.text)
    root.style.setProperty('--color-text-muted', theme.textMuted)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-border', theme.border)
    // V1.6 UI Modernization Phase 2 (docs/design/ui-v1.6-design-spec.md §1):
    // per-role gradient mesh tokens for future components (hero, featured blog).
    root.style.setProperty('--color-gradient-1', theme.accent)
    root.style.setProperty('--color-gradient-2', theme.accentMuted)
    root.style.setProperty('--color-gradient-3', theme.surface)
    document.body.style.backgroundColor = theme.background
    document.body.style.color = theme.text
  }, [theme, roleId])

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

  const filteredSkills = useMemo(() => {
    return portfolioConfig.skills
      .filter((cat) => cat.relevantRoles.includes(roleId) || roleId === 'system')
      .map((cat) => ({
        ...cat,
        skills:
          role.highlightedSkillIds.length > 0
            ? cat.skills.filter(
                (s) =>
                  role.highlightedSkillIds.includes(s.id) ||
                  roleId === 'system',
              )
            : cat.skills,
      }))
      .filter((cat) => cat.skills.length > 0)
  }, [role, roleId])

  const filteredCertifications = useMemo(() => {
    const variant = role.resumeVariant
    return portfolioConfig.certifications.filter(
      (c) =>
        c.sourceVariants.includes(variant) || roleId === 'system',
    )
  }, [role, roleId])

  const skillChains = useMemo(() => {
    const chains: Record<RoleId, string[][]> = {
      software: [
        ['Python', 'Django', 'REST', 'PostgreSQL'],
        ['Git', 'Docker', 'CI/CD'],
        ['Python', 'Airflow', 'ETL'],
      ],
      ai: [
        ['Python', 'ML', 'NLP', 'Deep Learning'],
        ['TensorFlow', 'PyTorch', 'Scikit-learn'],
        ['MLOps', 'MLflow', 'Airflow', 'SageMaker'],
      ],
      data: [
        ['Python', 'Pandas', 'SQL', 'Airflow'],
        ['Superset', 'Metabase', 'Power BI'],
        ['ETL', 'Excel', 'Reporting'],
      ],
      system: [
        ['Software', 'Data', 'ML', 'AI'],
        ['Python', 'Django', 'Airflow', 'NLP'],
      ],
    }
    return chains[roleId]
  }, [roleId])

  return {
    roleId,
    role,
    theme,
    setRole,
    isTransitioning,
    filteredMetrics,
    filteredProjects,
    sortedExperience,
    filteredSkills,
    filteredCertifications,
    skillChains,
    allRoles: ROLE_IDS.map((id) => portfolioConfig.roles[id]),
  }
}
