import { useCallback, useMemo, useReducer, useState } from 'react'
import { portfolioConfig } from '../config'
import type {
  Experience,
  Metric,
  PortfolioConfig,
  Profile,
  Project,
  RoleId,
  SkillCategory,
  Education,
  Certification,
  Research,
  AIKnowledgeEntry,
} from '../types'
import { AdminGate } from '../components/admin/AdminGate'
import { AdminCard, AdminLayout, adminInputClass } from '../components/admin/AdminLayout'
import { AttachmentsEditor, ImageField } from '../components/admin/MediaFields'
import { RoleBadges, RoleScopeEditor } from '../components/admin/RoleScopeEditor'
import { ConfirmModal } from '../components/admin/ConfirmModal'
import { EntityToolbar } from '../components/admin/EntityToolbar'
import { logoutAdmin } from '../lib/admin/auth'
import { RESUME_LABELS, ROLE_IDS, ROLE_LABELS } from '../lib/admin/roleLabels'
import {
  clearDraft,
  downloadConfig,
  loadDraftFromLocalStorage,
  parseImportedConfig,
  saveDraftToLocalStorage,
  validateFullConfig,
  getQuarantinedDraft,
  clearQuarantine,
} from '../lib/config/exportImport'
import { configDraftReducer, initialConfig, type ConfigSection } from '../lib/admin/configReducer'
import { createDefaultEntity } from '../lib/admin/defaultTemplates'

type AdminTab =
  | 'profile'
  | 'experience'
  | 'projects'
  | 'roles'
  | 'metrics'
  | 'skills'
  | 'education'
  | 'certs'
  | 'research'
  | 'aiKnowledge'

const TAB_META: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'roles', label: 'Role pages', icon: '🎭' },
  { id: 'metrics', label: 'Metrics', icon: '📊' },
  { id: 'skills', label: 'Skills', icon: '🛠️' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'certs', label: 'Certifications', icon: '📜' },
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'aiKnowledge', label: 'AI Knowledge', icon: '🧠' },
]

function filterByRole<T extends { relevantRoles: RoleId[] }>(
  items: T[],
  filterRole: RoleId | 'all',
): T[] {
  if (filterRole === 'all') return items
  return items.filter((item) => item.relevantRoles.includes(filterRole))
}

function AdminPanel() {
  const [initialDraft] = useState<PortfolioConfig | null>(() => loadDraftFromLocalStorage())
  const [config, dispatch] = useReducer(configDraftReducer, initialDraft ?? initialConfig)
  const [tab, setTab] = useState<AdminTab>('profile')
  const [filterRole, setFilterRole] = useState<RoleId | 'all'>('all')

  const [selectedExpId, setSelectedExpId] = useState(config.experience[0]?.id ?? '')
  const [selectedProjectId, setSelectedProjectId] = useState(config.projects[0]?.id ?? '')
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>('software')
  const [selectedMetricId, setSelectedMetricId] = useState(config.metrics[0]?.id ?? '')
  const [selectedSkillCategoryId, setSelectedSkillCategoryId] = useState(config.skills[0]?.id ?? '')
  const [selectedEduId, setSelectedEduId] = useState(config.education[0]?.id ?? '')
  const [selectedCertId, setSelectedCertId] = useState(config.certifications[0]?.id ?? '')
  const [selectedResearchId, setSelectedResearchId] = useState(config.research[0]?.id ?? '')
  const [selectedAIKnowledgeId, setSelectedAIKnowledgeId] = useState(config.aiKnowledge[0]?.id ?? '')

  const [errors, setErrors] = useState<string[]>([])
  const [dirty, setDirty] = useState(Boolean(initialDraft))
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [showQuarantineBanner, setShowQuarantineBanner] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<{
    section: ConfigSection
    id: string
    title: string
    itemName: string
  } | null>(null)

  const tabCounts = useMemo<Record<AdminTab, number | undefined>>(
    () => ({
      profile: undefined,
      experience: config.experience.length,
      projects: config.projects.length,
      roles: Object.keys(config.roles).length,
      metrics: config.metrics.length,
      skills: config.skills.length,
      education: config.education.length,
      certs: config.certifications.length,
      research: config.research.length,
      aiKnowledge: config.aiKnowledge.length,
    }),
    [config],
  )

  const filteredExperience = useMemo(
    () => filterByRole(config.experience, filterRole),
    [config.experience, filterRole],
  )
  const filteredProjects = useMemo(
    () => filterByRole(config.projects, filterRole),
    [config.projects, filterRole],
  )
  const filteredMetrics = useMemo(
    () => filterByRole(config.metrics, filterRole),
    [config.metrics, filterRole],
  )
  const filteredSkills = useMemo(
    () => filterByRole(config.skills, filterRole),
    [config.skills, filterRole],
  )

  const handleProfileChange = useCallback((field: keyof Profile, value: string | boolean) => {
    dispatch({ type: 'patchProfile', patch: { [field]: value } })
    setDirty(true)
  }, [])

  const handleMoveEntity = useCallback(
    (section: ConfigSection, id: string, delta: -1 | 1) => {
      dispatch({ type: 'moveEntity', section, id, delta, direction: delta })
      setDirty(true)
    },
    [],
  )

  const handleDuplicateEntity = useCallback(
    (section: ConfigSection, id: string) => {
      dispatch({ type: 'duplicateEntity', section, id })
      setDirty(true)
    },
    [],
  )

  const handleAddEntity = useCallback(
    (section: ConfigSection) => {
      const newEntity = createDefaultEntity(section)
      dispatch({ type: 'insertEntity', section, entity: newEntity })
      switch (section) {
        case 'experience':
          setSelectedExpId(newEntity.id)
          break
        case 'projects':
          setSelectedProjectId(newEntity.id)
          break
        case 'metrics':
          setSelectedMetricId(newEntity.id)
          break
        case 'skills':
          setSelectedSkillCategoryId(newEntity.id)
          break
        case 'education':
          setSelectedEduId(newEntity.id)
          break
        case 'certifications':
          setSelectedCertId(newEntity.id)
          break
        case 'research':
          setSelectedResearchId(newEntity.id)
          break
        case 'aiKnowledge':
          setSelectedAIKnowledgeId(newEntity.id)
          break
      }
      setDirty(true)
    },
    [],
  )

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return
    const { section, id } = deleteTarget
    const currentList = (config[section] as { id: string }[]) || []
    const currentIndex = currentList.findIndex((item) => item.id === id)
    const remaining = currentList.filter((item) => item.id !== id)

    let nextSelectedId = ''
    if (remaining.length > 0) {
      const nextIndex = Math.min(Math.max(0, currentIndex - 1), remaining.length - 1)
      nextSelectedId = remaining[nextIndex].id
    }

    switch (section) {
      case 'experience':
        setSelectedExpId(nextSelectedId)
        break
      case 'projects':
        setSelectedProjectId(nextSelectedId)
        break
      case 'metrics':
        setSelectedMetricId(nextSelectedId)
        break
      case 'skills':
        setSelectedSkillCategoryId(nextSelectedId)
        break
      case 'education':
        setSelectedEduId(nextSelectedId)
        break
      case 'certifications':
        setSelectedCertId(nextSelectedId)
        break
      case 'research':
        setSelectedResearchId(nextSelectedId)
        break
      case 'aiKnowledge':
        setSelectedAIKnowledgeId(nextSelectedId)
        break
    }

    dispatch({ type: 'removeEntity', section, id })
    setDirty(true)
    setDeleteTarget(null)
  }, [config, deleteTarget])

  const handleSaveDraft = useCallback(() => {
    const validationErrors = validateFullConfig(config)
    setErrors(validationErrors)
    if (validationErrors.length > 0) return
    saveDraftToLocalStorage(config)
    setDirty(false)
    setImportStatus('Draft saved to browser localStorage. Export JSON to publish via GitHub.')
  }, [config])

  const handleExport = useCallback(() => {
    const validationErrors = validateFullConfig(config)
    setErrors(validationErrors)
    if (validationErrors.length > 0) return
    downloadConfig(config)
    setImportStatus('Configuration exported as JSON.')
  }, [config])

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImportedConfig(reader.result as string)
        dispatch({ type: 'replaceConfig', config: imported })
        setDirty(true)
        setImportStatus('Config imported. Review and save draft or export.')
        setErrors([])
      } catch (err) {
        setImportStatus(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleReset = useCallback(() => {
    dispatch({ type: 'replaceConfig', config: portfolioConfig })
    clearDraft()
    setDirty(false)
    setErrors([])
    setImportStatus('Reset to default configuration.')
  }, [])

  const handleDismissQuarantine = useCallback(() => {
    clearQuarantine()
    setShowQuarantineBanner(false)
  }, [])

  const selectedExp = config.experience.find((e) => e.id === selectedExpId) ?? config.experience[0]
  const selectedProject = config.projects.find((p) => p.id === selectedProjectId) ?? config.projects[0]
  const selectedRole = config.roles[selectedRoleId]
  const selectedMetric = config.metrics.find((m) => m.id === selectedMetricId) ?? config.metrics[0]
  const selectedSkillCategory = config.skills.find((s) => s.id === selectedSkillCategoryId) ?? config.skills[0]
  const selectedEdu = config.education.find((e) => e.id === selectedEduId) ?? config.education[0]
  const selectedCert = config.certifications.find((c) => c.id === selectedCertId) ?? config.certifications[0]
  const selectedResearch = config.research.find((r) => r.id === selectedResearchId) ?? config.research[0]
  const selectedAIKnowledge = config.aiKnowledge.find((k) => k.id === selectedAIKnowledgeId) ?? config.aiKnowledge[0]

  const updateExperience = useCallback(
    (patch: Partial<Experience>) => {
      if (!selectedExp?.id) return
      dispatch({ type: 'patchEntity', section: 'experience', id: selectedExp.id, patch })
      setDirty(true)
    },
    [selectedExp],
  )

  const updateProject = useCallback(
    (patch: Partial<Project>) => {
      if (!selectedProject?.id) return
      dispatch({ type: 'patchEntity', section: 'projects', id: selectedProject.id, patch })
      setDirty(true)
    },
    [selectedProject],
  )

  const updateRoleHero = useCallback(
    (field: 'headline' | 'subtitle', value: string) => {
      dispatch({
        type: 'patchRole',
        id: selectedRoleId,
        patch: { hero: { ...config.roles[selectedRoleId].hero, [field]: value } },
      })
      setDirty(true)
    },
    [selectedRoleId, config.roles],
  )

  const updateMetric = useCallback(
    (patch: Partial<Metric>) => {
      if (!selectedMetric?.id) return
      dispatch({ type: 'patchEntity', section: 'metrics', id: selectedMetric.id, patch })
      setDirty(true)
    },
    [selectedMetric],
  )

  const updateSkillCategory = useCallback(
    (patch: Partial<SkillCategory>) => {
      if (!selectedSkillCategory?.id) return
      dispatch({ type: 'patchEntity', section: 'skills', id: selectedSkillCategory.id, patch })
      setDirty(true)
    },
    [selectedSkillCategory],
  )

  const updateEdu = useCallback(
    (patch: Partial<Education>) => {
      if (!selectedEdu?.id) return
      dispatch({ type: 'patchEntity', section: 'education', id: selectedEdu.id, patch })
      setDirty(true)
    },
    [selectedEdu],
  )

  const updateCert = useCallback(
    (patch: Partial<Certification>) => {
      if (!selectedCert?.id) return
      dispatch({ type: 'patchEntity', section: 'certifications', id: selectedCert.id, patch })
      setDirty(true)
    },
    [selectedCert],
  )

  const updateResearch = useCallback(
    (patch: Partial<Research>) => {
      if (!selectedResearch?.id) return
      dispatch({ type: 'patchEntity', section: 'research', id: selectedResearch.id, patch })
      setDirty(true)
    },
    [selectedResearch],
  )

  const updateAIKnowledge = useCallback(
    (patch: Partial<AIKnowledgeEntry>) => {
      if (!selectedAIKnowledge?.id) return
      dispatch({ type: 'patchEntity', section: 'aiKnowledge', id: selectedAIKnowledge.id, patch })
      setDirty(true)
    },
    [selectedAIKnowledge],
  )

  const sidebar = (
    <nav className="space-y-1" aria-label="Admin sections">
      {TAB_META.map((t) => {
        const count = tabCounts[t.id]
        const isActive = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              isActive
                ? 'bg-cyan-400/10 text-cyan-400 font-medium'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
            </span>
            {count !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-mono font-medium ${
                  isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )

  const roleFilterHeader = (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-400">
        <span>Filter by resume page:</span>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as RoleId | 'all')}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="all">All pages</option>
          {ROLE_IDS.filter((r) => r !== 'system').map((r) => (
            <option key={r} value={r}>
              {RESUME_LABELS[r]}
            </option>
          ))}
        </select>
      </label>
      {filterRole !== 'all' && (
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-400 font-medium">
          Editing content for: {ROLE_LABELS[filterRole]}
        </span>
      )}
    </div>
  )

  return (
    <AdminLayout
      sidebar={sidebar}
      dirty={dirty}
      onSignOut={() => {
        logoutAdmin()
        window.location.reload()
      }}
      header={tab !== 'profile' && tab !== 'roles' ? roleFilterHeader : null}
    >
      {/* Mobile Horizontal Tab Navigation */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2 lg:hidden scrollbar-thin" aria-label="Mobile sections">
        {TAB_META.map((t) => {
          const count = tabCounts[t.id]
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
              {count !== undefined && (
                <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="mb-6 text-sm text-slate-400">
        Pick a section, choose or reorder items, then set which resume page(s) each appears on. Export JSON to publish.
      </p>

      {showQuarantineBanner && getQuarantinedDraft() && (
        <div
          className="mb-6 rounded-lg border border-amber-600 bg-amber-900/30 p-4 text-sm text-amber-200 flex items-center justify-between"
          role="alert"
        >
          <span>
            Corrupted draft quarantined.{' '}
            <button
              type="button"
              onClick={handleDismissQuarantine}
              className="underline hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
            >
              Dismiss
            </button>
          </span>
        </div>
      )}

      {importStatus && (
        <div
          className="mb-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300"
          role="status"
        >
          {importStatus}
        </div>
      )}

      {errors.length > 0 && (
        <ul className="mb-6 list-disc pl-5 text-sm text-red-400" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSaveDraft()
        }}
        className="space-y-6"
      >
        {tab === 'profile' && (
          <AdminCard title="Profile" description="Global info shown across all resume pages.">
            {(['name', 'navDisplayName', 'title', 'email'] as const).map((field) => (
              <label key={field} className="block">
                <span className="mb-1 block text-sm text-slate-400">
                  {field === 'navDisplayName' ? 'Navbar name (short, single line)' : field}
                </span>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={(config.profile[field] as string) ?? ''}
                  onChange={(e) => handleProfileChange(field, e.target.value)}
                  placeholder={field === 'navDisplayName' ? 'K. Lodha' : undefined}
                  className={adminInputClass}
                />
              </label>
            ))}
            <ImageField
              label="Profile photo"
              value={config.profile.avatarUrl}
              onChange={(url) => handleProfileChange('avatarUrl', url)}
              hint="Place image in public/ and use path like /images/avatar.jpg"
            />
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Summary</span>
              <textarea
                value={config.profile.summary}
                onChange={(e) => handleProfileChange('summary', e.target.value)}
                rows={3}
                className={adminInputClass}
              />
            </label>
          </AdminCard>
        )}

        {tab === 'experience' && (
          <AdminCard
            title="Experience"
            description="Each entry can appear on different resume pages. Use role scope to control visibility."
          >
            {config.experience.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No experience entries found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('experience')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Experience
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select experience</span>
                  <select
                    value={selectedExp?.id ?? ''}
                    onChange={(e) => setSelectedExpId(e.target.value)}
                    className={adminInputClass}
                  >
                    {(filteredExperience.length > 0 ? filteredExperience : config.experience).map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.role} @ {e.organization}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedExp && (
                  <>
                    <EntityToolbar
                      sectionTitle="Experience"
                      itemName={`${selectedExp.role} @ ${selectedExp.organization}`}
                      currentIndex={config.experience.findIndex((e) => e.id === selectedExp.id)}
                      totalCount={config.experience.length}
                      onMoveUp={() => handleMoveEntity('experience', selectedExp.id, -1)}
                      onMoveDown={() => handleMoveEntity('experience', selectedExp.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('experience', selectedExp.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'experience',
                          id: selectedExp.id,
                          title: 'Delete Experience',
                          itemName: `${selectedExp.role} @ ${selectedExp.organization}`,
                        })
                      }
                      onAdd={() => handleAddEntity('experience')}
                    />

                    <RoleBadges roles={selectedExp.relevantRoles} />
                    <RoleScopeEditor
                      value={selectedExp.relevantRoles}
                      onChange={(roles) => updateExperience({ relevantRoles: roles })}
                    />
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Organization</span>
                      <input
                        value={selectedExp.organization}
                        onChange={(e) => updateExperience({ organization: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Role</span>
                      <input
                        value={selectedExp.role}
                        onChange={(e) => updateExperience({ role: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Period</span>
                      <input
                        value={selectedExp.period}
                        onChange={(e) => updateExperience({ period: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Location</span>
                      <input
                        value={selectedExp.location}
                        onChange={(e) => updateExperience({ location: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <ImageField
                      label="Company / role image"
                      value={selectedExp.imageUrl}
                      onChange={(url) => updateExperience({ imageUrl: url })}
                    />
                    <AttachmentsEditor
                      value={selectedExp.attachments}
                      onChange={(attachments) => updateExperience({ attachments })}
                    />
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        {tab === 'projects' && (
          <AdminCard
            title="Projects"
            description="Projects can differ per resume page — set role scope and add images."
          >
            {config.projects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No project entries found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('projects')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Project
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select project</span>
                  <select
                    value={selectedProject?.id ?? ''}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className={adminInputClass}
                  >
                    {(filteredProjects.length > 0 ? filteredProjects : config.projects).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedProject && (
                  <>
                    <EntityToolbar
                      sectionTitle="Project"
                      itemName={selectedProject.title}
                      currentIndex={config.projects.findIndex((p) => p.id === selectedProject.id)}
                      totalCount={config.projects.length}
                      onMoveUp={() => handleMoveEntity('projects', selectedProject.id, -1)}
                      onMoveDown={() => handleMoveEntity('projects', selectedProject.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('projects', selectedProject.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'projects',
                          id: selectedProject.id,
                          title: 'Delete Project',
                          itemName: selectedProject.title,
                        })
                      }
                      onAdd={() => handleAddEntity('projects')}
                    />

                    <RoleBadges roles={selectedProject.relevantRoles} />
                    <RoleScopeEditor
                      value={selectedProject.relevantRoles}
                      onChange={(roles) => updateProject({ relevantRoles: roles })}
                    />
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Title</span>
                      <input
                        value={selectedProject.title}
                        onChange={(e) => updateProject({ title: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Period</span>
                      <input
                        value={selectedProject.period}
                        onChange={(e) => updateProject({ period: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Overview</span>
                      <textarea
                        value={selectedProject.overview}
                        onChange={(e) => updateProject({ overview: e.target.value })}
                        rows={4}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">GitHub URL</span>
                      <input
                        value={selectedProject.githubUrl || ''}
                        onChange={(e) => updateProject({ githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className={adminInputClass}
                      />
                    </label>
                    <ImageField
                      label="Project thumbnail"
                      value={selectedProject.imageUrl}
                      onChange={(url) => updateProject({ imageUrl: url })}
                    />
                    <AttachmentsEditor
                      value={selectedProject.attachments}
                      onChange={(attachments) => updateProject({ attachments })}
                    />
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        {tab === 'roles' && selectedRole && (
          <AdminCard
            title="Role page copy"
            description="Each resume page has its own hero headline and subtitle. This is what visitors see when they switch perspectives."
          >
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Resume page</span>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value as RoleId)}
                className={adminInputClass}
              >
                {Object.values(config.roles).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {RESUME_LABELS[r.id]}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400 font-semibold">Live preview context</p>
              <p className="text-sm font-medium text-cyan-400">{selectedRole.label}</p>
              <p className="mt-1 text-xs text-slate-400">
                Theme: {config.themes[selectedRoleId].layoutVariant} · Resume: {selectedRole.resumeVariant}
              </p>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Headline</span>
              <input
                value={selectedRole.hero.headline}
                onChange={(e) => updateRoleHero('headline', e.target.value)}
                className={adminInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Subtitle</span>
              <textarea
                value={selectedRole.hero.subtitle}
                onChange={(e) => updateRoleHero('subtitle', e.target.value)}
                rows={3}
                className={adminInputClass}
              />
            </label>
          </AdminCard>
        )}

        {tab === 'metrics' && (
          <AdminCard title="Metrics" description="Stats shown on each resume page — scoped by role.">
            {config.metrics.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No metrics found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('metrics')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Metric
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select metric</span>
                  <select
                    value={selectedMetric?.id ?? ''}
                    onChange={(e) => setSelectedMetricId(e.target.value)}
                    className={adminInputClass}
                  >
                    {(filteredMetrics.length > 0 ? filteredMetrics : config.metrics).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} ({m.value})
                      </option>
                    ))}
                  </select>
                </label>

                {selectedMetric && (
                  <>
                    <EntityToolbar
                      sectionTitle="Metric"
                      itemName={selectedMetric.label}
                      currentIndex={config.metrics.findIndex((m) => m.id === selectedMetric.id)}
                      totalCount={config.metrics.length}
                      onMoveUp={() => handleMoveEntity('metrics', selectedMetric.id, -1)}
                      onMoveDown={() => handleMoveEntity('metrics', selectedMetric.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('metrics', selectedMetric.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'metrics',
                          id: selectedMetric.id,
                          title: 'Delete Metric',
                          itemName: selectedMetric.label,
                        })
                      }
                      onAdd={() => handleAddEntity('metrics')}
                    />

                    <RoleBadges roles={selectedMetric.relevantRoles} />
                    <RoleScopeEditor
                      value={selectedMetric.relevantRoles}
                      onChange={(roles) => updateMetric({ relevantRoles: roles })}
                    />
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Value</span>
                      <input
                        value={selectedMetric.value}
                        onChange={(e) => updateMetric({ value: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Label</span>
                      <input
                        value={selectedMetric.label}
                        onChange={(e) => updateMetric({ label: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        {tab === 'skills' && (
          <AdminCard title="Skills" description="Skills grouped by category and scoped by role.">
            {config.skills.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No skill categories found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('skills')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Skill Category
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select skill category</span>
                  <select
                    value={selectedSkillCategory?.id ?? ''}
                    onChange={(e) => setSelectedSkillCategoryId(e.target.value)}
                    className={adminInputClass}
                  >
                    {(filteredSkills.length > 0 ? filteredSkills : config.skills).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.skills.length} skills)
                      </option>
                    ))}
                  </select>
                </label>

                {selectedSkillCategory && (
                  <>
                    <EntityToolbar
                      sectionTitle="Skill Category"
                      itemName={selectedSkillCategory.name}
                      currentIndex={config.skills.findIndex((s) => s.id === selectedSkillCategory.id)}
                      totalCount={config.skills.length}
                      onMoveUp={() => handleMoveEntity('skills', selectedSkillCategory.id, -1)}
                      onMoveDown={() => handleMoveEntity('skills', selectedSkillCategory.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('skills', selectedSkillCategory.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'skills',
                          id: selectedSkillCategory.id,
                          title: 'Delete Skill Category',
                          itemName: selectedSkillCategory.name,
                        })
                      }
                      onAdd={() => handleAddEntity('skills')}
                    />

                    <RoleBadges roles={selectedSkillCategory.relevantRoles} />
                    <RoleScopeEditor
                      value={selectedSkillCategory.relevantRoles}
                      onChange={(roles) => updateSkillCategory({ relevantRoles: roles })}
                    />
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Category name</span>
                      <input
                        value={selectedSkillCategory.name}
                        onChange={(e) => updateSkillCategory({ name: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-medium text-slate-300">
                          Skills ({selectedSkillCategory.skills.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextSkills = [
                              ...selectedSkillCategory.skills,
                              { id: crypto.randomUUID(), name: 'New Skill' },
                            ]
                            updateSkillCategory({ skills: nextSkills })
                          }}
                          aria-label={`Add skill to ${selectedSkillCategory.name}`}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-cyan-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                          + Add Skill
                        </button>
                      </div>

                      {selectedSkillCategory.skills.map((skill, index) => (
                        <div key={skill.id || index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={skill.name}
                            placeholder="Skill name"
                            className={adminInputClass}
                            onChange={(e) => {
                              const nextSkills = [...selectedSkillCategory.skills]
                              nextSkills[index] = { ...skill, name: e.target.value }
                              updateSkillCategory({ skills: nextSkills })
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextSkills = selectedSkillCategory.skills.filter((_, i) => i !== index)
                              updateSkillCategory({ skills: nextSkills })
                            }}
                            aria-label={`Remove skill ${skill.name || 'item'}`}
                            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:border-rose-700 hover:bg-rose-950/30 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        {tab === 'education' && (
          <AdminCard title="Education" description="Education degrees and details.">
            {config.education.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No education entries found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('education')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Education
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select education entry</span>
                  <select
                    value={selectedEdu?.id ?? ''}
                    onChange={(e) => setSelectedEduId(e.target.value)}
                    className={adminInputClass}
                  >
                    {config.education.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.degree} @ {e.institution}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedEdu && (
                  <>
                    <EntityToolbar
                      sectionTitle="Education"
                      itemName={`${selectedEdu.degree} @ ${selectedEdu.institution}`}
                      currentIndex={config.education.findIndex((e) => e.id === selectedEdu.id)}
                      totalCount={config.education.length}
                      onMoveUp={() => handleMoveEntity('education', selectedEdu.id, -1)}
                      onMoveDown={() => handleMoveEntity('education', selectedEdu.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('education', selectedEdu.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'education',
                          id: selectedEdu.id,
                          title: 'Delete Education',
                          itemName: `${selectedEdu.degree} @ ${selectedEdu.institution}`,
                        })
                      }
                      onAdd={() => handleAddEntity('education')}
                    />

                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Degree</span>
                      <input
                        value={selectedEdu.degree}
                        onChange={(e) => updateEdu({ degree: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Institution</span>
                      <input
                        value={selectedEdu.institution}
                        onChange={(e) => updateEdu({ institution: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Period</span>
                      <input
                        value={selectedEdu.period}
                        onChange={(e) => updateEdu({ period: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Location</span>
                      <input
                        value={selectedEdu.location}
                        onChange={(e) => updateEdu({ location: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">GPA</span>
                      <input
                        value={selectedEdu.gpa || ''}
                        onChange={(e) => updateEdu({ gpa: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Research</span>
                      <input
                        value={selectedEdu.research || ''}
                        onChange={(e) => updateEdu({ research: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        {tab === 'certs' && (
          <AdminCard title="Certifications" description="Professional certifications.">
            {config.certifications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No certifications found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('certifications')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Certification
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select certification</span>
                  <select
                    value={selectedCert?.id ?? ''}
                    onChange={(e) => setSelectedCertId(e.target.value)}
                    className={adminInputClass}
                  >
                    {config.certifications.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.issuer})
                      </option>
                    ))}
                  </select>
                </label>

                {selectedCert && (
                  <>
                    <EntityToolbar
                      sectionTitle="Certification"
                      itemName={selectedCert.name}
                      currentIndex={config.certifications.findIndex((c) => c.id === selectedCert.id)}
                      totalCount={config.certifications.length}
                      onMoveUp={() => handleMoveEntity('certifications', selectedCert.id, -1)}
                      onMoveDown={() => handleMoveEntity('certifications', selectedCert.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('certifications', selectedCert.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'certifications',
                          id: selectedCert.id,
                          title: 'Delete Certification',
                          itemName: selectedCert.name,
                        })
                      }
                      onAdd={() => handleAddEntity('certifications')}
                    />

                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Name</span>
                      <input
                        value={selectedCert.name}
                        onChange={(e) => updateCert({ name: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Issuer</span>
                      <input
                        value={selectedCert.issuer}
                        onChange={(e) => updateCert({ issuer: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Date</span>
                      <input
                        value={selectedCert.date || ''}
                        onChange={(e) => updateCert({ date: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">URL</span>
                      <input
                        value={selectedCert.url || ''}
                        onChange={(e) => updateCert({ url: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <div className="space-y-2">
                      <span className="block text-sm font-medium text-slate-300">Resume variants</span>
                      <div className="flex gap-4">
                        {(['software', 'ai_ml', 'data_analyst'] as const).map((variant) => {
                          const active = selectedCert.sourceVariants.includes(variant)
                          return (
                            <label key={variant} className="flex items-center gap-2 text-sm text-slate-300">
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...selectedCert.sourceVariants, variant]
                                    : selectedCert.sourceVariants.filter((v) => v !== variant)
                                  updateCert({ sourceVariants: next })
                                }}
                                className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-400"
                              />
                              {variant}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        {tab === 'research' && (
          <AdminCard title="Research" description="Academic research or publications.">
            {config.research.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No research entries found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('research')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Research
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select research entry</span>
                  <select
                    value={selectedResearch?.id ?? ''}
                    onChange={(e) => setSelectedResearchId(e.target.value)}
                    className={adminInputClass}
                  >
                    {config.research.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedResearch && (
                  <>
                    <EntityToolbar
                      sectionTitle="Research"
                      itemName={selectedResearch.title}
                      currentIndex={config.research.findIndex((r) => r.id === selectedResearch.id)}
                      totalCount={config.research.length}
                      onMoveUp={() => handleMoveEntity('research', selectedResearch.id, -1)}
                      onMoveDown={() => handleMoveEntity('research', selectedResearch.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('research', selectedResearch.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'research',
                          id: selectedResearch.id,
                          title: 'Delete Research',
                          itemName: selectedResearch.title,
                        })
                      }
                      onAdd={() => handleAddEntity('research')}
                    />

                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Title</span>
                      <input
                        value={selectedResearch.title}
                        onChange={(e) => updateResearch({ title: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Description</span>
                      <textarea
                        value={selectedResearch.description}
                        onChange={(e) => updateResearch({ description: e.target.value })}
                        rows={4}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Status</span>
                      <input
                        value={selectedResearch.status}
                        onChange={(e) => updateResearch({ status: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        {tab === 'aiKnowledge' && (
          <AdminCard title="AI Knowledge Base" description="Grounding data for the Ask Kuldeep AI Assistant.">
            {config.aiKnowledge.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No AI knowledge entries found.</p>
                <button
                  type="button"
                  onClick={() => handleAddEntity('aiKnowledge')}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  + Add Q&A Entry
                </button>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Select Q&A Entry</span>
                  <select
                    value={selectedAIKnowledge?.id ?? ''}
                    onChange={(e) => setSelectedAIKnowledgeId(e.target.value)}
                    className={adminInputClass}
                  >
                    {config.aiKnowledge.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.questionPatterns[0] || 'Untitled Q&A'}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedAIKnowledge && (
                  <>
                    <EntityToolbar
                      sectionTitle="Q&A Entry"
                      itemName={selectedAIKnowledge.questionPatterns[0] || 'Q&A Entry'}
                      currentIndex={config.aiKnowledge.findIndex((k) => k.id === selectedAIKnowledge.id)}
                      totalCount={config.aiKnowledge.length}
                      onMoveUp={() => handleMoveEntity('aiKnowledge', selectedAIKnowledge.id, -1)}
                      onMoveDown={() => handleMoveEntity('aiKnowledge', selectedAIKnowledge.id, 1)}
                      onDuplicate={() => handleDuplicateEntity('aiKnowledge', selectedAIKnowledge.id)}
                      onDelete={() =>
                        setDeleteTarget({
                          section: 'aiKnowledge',
                          id: selectedAIKnowledge.id,
                          title: 'Delete Q&A Entry',
                          itemName: selectedAIKnowledge.questionPatterns[0] || 'Q&A Entry',
                        })
                      }
                      onAdd={() => handleAddEntity('aiKnowledge')}
                    />

                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Question patterns (one per line)</span>
                      <textarea
                        value={selectedAIKnowledge.questionPatterns.join('\n')}
                        onChange={(e) =>
                          updateAIKnowledge({
                            questionPatterns: e.target.value.split('\n').filter(Boolean),
                          })
                        }
                        rows={3}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Answer</span>
                      <textarea
                        value={selectedAIKnowledge.answer}
                        onChange={(e) => updateAIKnowledge({ answer: e.target.value })}
                        rows={4}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Tags (comma-separated)</span>
                      <input
                        value={selectedAIKnowledge.tags.join(', ')}
                        onChange={(e) =>
                          updateAIKnowledge({
                            tags: e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-400">Source (variant or document)</span>
                      <input
                        value={selectedAIKnowledge.source}
                        onChange={(e) => updateAIKnowledge({ source: e.target.value })}
                        className={adminInputClass}
                      />
                    </label>
                  </>
                )}
              </>
            )}
          </AdminCard>
        )}

        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <button
            type="submit"
            className="min-h-[44px] min-w-[44px] rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Export JSON
          </button>
          <label className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400">
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Accessible Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title ?? 'Confirm Delete'}
        itemName={deleteTarget?.itemName ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export function AdminPage() {
  return (
    <AdminGate>
      <AdminPanel />
    </AdminGate>
  )
}