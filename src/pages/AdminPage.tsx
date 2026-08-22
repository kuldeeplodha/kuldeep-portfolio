import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { logoutAdmin } from '../lib/admin/auth'
import { RESUME_LABELS, ROLE_IDS, ROLE_LABELS } from '../lib/admin/roleLabels'
import {
  clearDraft,
  downloadConfig,
  loadDraftFromLocalStorage,
  parseImportedConfig,
  saveDraftToLocalStorage,
  validateFullConfig,
} from '../lib/config/exportImport'

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
  const [config, setConfig] = useState<PortfolioConfig>(portfolioConfig)
  const [profile, setProfile] = useState<Profile>(portfolioConfig.profile)
  const [tab, setTab] = useState<AdminTab>('profile')
  const [filterRole, setFilterRole] = useState<RoleId | 'all'>('all')
  const [selectedExpId, setSelectedExpId] = useState(portfolioConfig.experience[0]?.id ?? '')
  const [selectedProjectId, setSelectedProjectId] = useState(portfolioConfig.projects[0]?.id ?? '')
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>('software')
  const [selectedMetricId, setSelectedMetricId] = useState(portfolioConfig.metrics[0]?.id ?? '')
  const [selectedSkillCategoryId, setSelectedSkillCategoryId] = useState(portfolioConfig.skills[0]?.id ?? '')
  const [selectedEduId, setSelectedEduId] = useState(portfolioConfig.education[0]?.id ?? '')
  const [selectedCertId, setSelectedCertId] = useState(portfolioConfig.certifications[0]?.id ?? '')
  const [selectedResearchId, setSelectedResearchId] = useState(portfolioConfig.research[0]?.id ?? '')
  const [selectedAIKnowledgeId, setSelectedAIKnowledgeId] = useState(portfolioConfig.aiKnowledge[0]?.id ?? '')

  const [errors, setErrors] = useState<string[]>([])
  const [dirty, setDirty] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)

  useEffect(() => {
    const draft = loadDraftFromLocalStorage()
    if (draft) {
      setConfig(draft)
      setProfile(draft.profile)
      setDirty(true)
    }
  }, [])

  const persist = useCallback((next: PortfolioConfig) => {
    setConfig(next)
    setDirty(true)
  }, [])

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

  const handleProfileChange = (field: keyof Profile, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  const handleSaveDraft = () => {
    const validationErrors = validateFullConfig({ ...config, profile })
    setErrors(validationErrors)
    if (validationErrors.length > 0) return
    const updated = { ...config, profile }
    setConfig(updated)
    saveDraftToLocalStorage(updated)
    setDirty(false)
    setImportStatus('Draft saved to browser localStorage. Export JSON to publish via GitHub.')
  }

  const handleExport = () => {
    const validationErrors = validateFullConfig({ ...config, profile })
    setErrors(validationErrors)
    if (validationErrors.length > 0) return
    downloadConfig({ ...config, profile })
    setImportStatus('Configuration exported as JSON.')
  }

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImportedConfig(reader.result as string)
        setConfig(imported)
        setProfile(imported.profile)
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

  const handleReset = () => {
    setConfig(portfolioConfig)
    setProfile(portfolioConfig.profile)
    clearDraft()
    setDirty(false)
    setErrors([])
    setImportStatus('Reset to default configuration.')
  }

  const selectedExp = config.experience.find((e) => e.id === selectedExpId)
  const selectedProject = config.projects.find((p) => p.id === selectedProjectId)
  const selectedRole = config.roles[selectedRoleId]
  const selectedMetric = config.metrics.find((m) => m.id === selectedMetricId)
  const selectedSkillCategory = config.skills.find((s) => s.id === selectedSkillCategoryId)
  const selectedEdu = config.education.find((e) => e.id === selectedEduId)
  const selectedCert = config.certifications.find((c) => c.id === selectedCertId)
  const selectedResearch = config.research.find((r) => r.id === selectedResearchId)
  const selectedAIKnowledge = config.aiKnowledge.find((k) => k.id === selectedAIKnowledgeId)

  const updateExperience = (patch: Partial<Experience>) => {
    persist({
      ...config,
      profile,
      experience: config.experience.map((e) =>
        e.id === selectedExpId ? { ...e, ...patch } : e,
      ),
    })
  }

  const updateProject = (patch: Partial<Project>) => {
    persist({
      ...config,
      profile,
      projects: config.projects.map((p) =>
        p.id === selectedProjectId ? { ...p, ...patch } : p,
      ),
    })
  }

  const updateRoleHero = (field: 'headline' | 'subtitle', value: string) => {
    persist({
      ...config,
      profile,
      roles: {
        ...config.roles,
        [selectedRoleId]: {
          ...config.roles[selectedRoleId],
          hero: { ...config.roles[selectedRoleId].hero, [field]: value },
        },
      },
    })
  }

  const updateMetric = (patch: Partial<Metric>) => {
    persist({
      ...config,
      profile,
      metrics: config.metrics.map((m) =>
        m.id === selectedMetricId ? { ...m, ...patch } : m,
      ),
    })
  }

  const updateSkillCategory = (patch: Partial<SkillCategory>) => {
    persist({
      ...config,
      profile,
      skills: config.skills.map((s) =>
        s.id === selectedSkillCategoryId ? { ...s, ...patch } : s,
      ),
    })
  }

  const updateEdu = (patch: Partial<Education>) => {
    persist({
      ...config,
      profile,
      education: config.education.map((e) =>
        e.id === selectedEduId ? { ...e, ...patch } : e,
      ),
    })
  }

  const updateCert = (patch: Partial<Certification>) => {
    persist({
      ...config,
      profile,
      certifications: config.certifications.map((c) =>
        c.id === selectedCertId ? { ...c, ...patch } : c,
      ),
    })
  }

  const updateResearch = (patch: Partial<Research>) => {
    persist({
      ...config,
      profile,
      research: config.research.map((r) =>
        r.id === selectedResearchId ? { ...r, ...patch } : r,
      ),
    })
  }

  const updateAIKnowledge = (patch: Partial<AIKnowledgeEntry>) => {
    persist({
      ...config,
      profile,
      aiKnowledge: config.aiKnowledge.map((k) =>
        k.id === selectedAIKnowledgeId ? { ...k, ...patch } : k,
      ),
    })
  }

  const sidebar = (
    <nav className="space-y-1" aria-label="Admin sections">
      {TAB_META.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
          style={{
            backgroundColor: tab === t.id ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
            color: tab === t.id ? '#22d3ee' : '#94a3b8',
          }}
        >
          <span aria-hidden>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )

  const roleFilterHeader = (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-400">
        <span>Filter by resume page:</span>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as RoleId | 'all')}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200"
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
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-400">
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
      <p className="mb-6 text-sm text-slate-400">
        Pick a section, choose the item, then set which resume page(s) it appears on.
        Export JSON to publish.
      </p>

      {importStatus && (
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300" role="status">
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
                  value={(profile[field] as string) ?? ''}
                  onChange={(e) => handleProfileChange(field, e.target.value)}
                  placeholder={field === 'navDisplayName' ? 'K. Lodha' : undefined}
                  className={adminInputClass}
                />
              </label>
            ))}
            <ImageField
              label="Profile photo"
              value={profile.avatarUrl}
              onChange={(url) => handleProfileChange('avatarUrl', url)}
              hint="Place image in public/ and use path like /images/avatar.jpg"
            />
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Summary</span>
              <textarea
                value={profile.summary}
                onChange={(e) => handleProfileChange('summary', e.target.value)}
                rows={3}
                className={adminInputClass}
              />
            </label>
          </AdminCard>
        )}

        {tab === 'experience' && selectedExp && (
          <AdminCard
            title="Experience"
            description="Each entry can appear on different resume pages. Use role scope to control visibility."
          >
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select experience</span>
              <select
                value={selectedExpId}
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
            <RoleBadges roles={selectedExp.relevantRoles} />
            <RoleScopeEditor
              value={selectedExp.relevantRoles}
              onChange={(roles) => updateExperience({ relevantRoles: roles })}
            />
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Organization</span>
              <input value={selectedExp.organization} onChange={(e) => updateExperience({ organization: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Role</span>
              <input value={selectedExp.role} onChange={(e) => updateExperience({ role: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Period</span>
              <input value={selectedExp.period} onChange={(e) => updateExperience({ period: e.target.value })} className={adminInputClass} />
            </label>
            <ImageField label="Company / role image" value={selectedExp.imageUrl} onChange={(url) => updateExperience({ imageUrl: url })} />
            <AttachmentsEditor value={selectedExp.attachments} onChange={(attachments) => updateExperience({ attachments })} />
          </AdminCard>
        )}

        {tab === 'projects' && selectedProject && (
          <AdminCard title="Projects" description="Projects can differ per resume page — set role scope and add images.">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select project</span>
              <select
                value={selectedProjectId}
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
            <RoleBadges roles={selectedProject.relevantRoles} />
            <RoleScopeEditor
              value={selectedProject.relevantRoles}
              onChange={(roles) => updateProject({ relevantRoles: roles })}
            />
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Title</span>
              <input value={selectedProject.title} onChange={(e) => updateProject({ title: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Overview</span>
              <textarea value={selectedProject.overview} onChange={(e) => updateProject({ overview: e.target.value })} rows={4} className={adminInputClass} />
            </label>
            <ImageField label="Project thumbnail" value={selectedProject.imageUrl} onChange={(url) => updateProject({ imageUrl: url })} />
            <AttachmentsEditor value={selectedProject.attachments} onChange={(attachments) => updateProject({ attachments })} />
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
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Live preview context</p>
              <p className="text-sm font-medium text-cyan-400">{selectedRole.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                Theme: {config.themes[selectedRoleId].layoutVariant} · Resume: {selectedRole.resumeVariant}
              </p>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Headline</span>
              <input value={selectedRole.hero.headline} onChange={(e) => updateRoleHero('headline', e.target.value)} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Subtitle</span>
              <textarea value={selectedRole.hero.subtitle} onChange={(e) => updateRoleHero('subtitle', e.target.value)} rows={3} className={adminInputClass} />
            </label>
          </AdminCard>
        )}

        {tab === 'metrics' && selectedMetric && (
          <AdminCard title="Metrics" description="Stats shown on each resume page — scoped by role.">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select metric</span>
              <select
                value={selectedMetricId}
                onChange={(e) => setSelectedMetricId(e.target.value)}
                className={adminInputClass}
              >
                {(filteredMetrics.length > 0 ? filteredMetrics : config.metrics).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <RoleBadges roles={selectedMetric.relevantRoles} />
            <RoleScopeEditor
              value={selectedMetric.relevantRoles}
              onChange={(roles) => updateMetric({ relevantRoles: roles })}
            />
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Value</span>
              <input value={selectedMetric.value} onChange={(e) => updateMetric({ value: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Label</span>
              <input value={selectedMetric.label} onChange={(e) => updateMetric({ label: e.target.value })} className={adminInputClass} />
            </label>
          </AdminCard>
        )}

        {tab === 'skills' && selectedSkillCategory && (
          <AdminCard title="Skills" description="Skills grouped by category and scoped by role.">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select skill category</span>
              <select
                value={selectedSkillCategoryId}
                onChange={(e) => setSelectedSkillCategoryId(e.target.value)}
                className={adminInputClass}
              >
                {(filteredSkills.length > 0 ? filteredSkills : config.skills).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
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
            <div className="space-y-2 mt-4">
              <span className="block text-sm font-medium text-slate-300">Skills list</span>
              {selectedSkillCategory.skills.map((skill, index) => (
                <div key={skill.id || index} className="flex gap-2">
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
                </div>
              ))}
            </div>
          </AdminCard>
        )}

        {tab === 'education' && selectedEdu && (
          <AdminCard title="Education" description="Education degrees and details.">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select education entry</span>
              <select
                value={selectedEduId}
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
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Degree</span>
              <input value={selectedEdu.degree} onChange={(e) => updateEdu({ degree: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Institution</span>
              <input value={selectedEdu.institution} onChange={(e) => updateEdu({ institution: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Period</span>
              <input value={selectedEdu.period} onChange={(e) => updateEdu({ period: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Location</span>
              <input value={selectedEdu.location} onChange={(e) => updateEdu({ location: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">GPA</span>
              <input value={selectedEdu.gpa || ''} onChange={(e) => updateEdu({ gpa: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Research</span>
              <input value={selectedEdu.research || ''} onChange={(e) => updateEdu({ research: e.target.value })} className={adminInputClass} />
            </label>
          </AdminCard>
        )}

        {tab === 'certs' && selectedCert && (
          <AdminCard title="Certifications" description="Professional certifications.">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select certification</span>
              <select
                value={selectedCertId}
                onChange={(e) => setSelectedCertId(e.target.value)}
                className={adminInputClass}
              >
                {config.certifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Name</span>
              <input value={selectedCert.name} onChange={(e) => updateCert({ name: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Issuer</span>
              <input value={selectedCert.issuer} onChange={(e) => updateCert({ issuer: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Date</span>
              <input value={selectedCert.date || ''} onChange={(e) => updateCert({ date: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">URL</span>
              <input value={selectedCert.url || ''} onChange={(e) => updateCert({ url: e.target.value })} className={adminInputClass} />
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
                        className="rounded border-slate-600 bg-slate-800 text-cyan-500"
                      />
                      {variant}
                    </label>
                  )
                })}
              </div>
            </div>
          </AdminCard>
        )}

        {tab === 'research' && selectedResearch && (
          <AdminCard title="Research" description="Academic research or publications.">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select research entry</span>
              <select
                value={selectedResearchId}
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
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Title</span>
              <input value={selectedResearch.title} onChange={(e) => updateResearch({ title: e.target.value })} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Description</span>
              <textarea value={selectedResearch.description} onChange={(e) => updateResearch({ description: e.target.value })} rows={4} className={adminInputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Status</span>
              <input value={selectedResearch.status} onChange={(e) => updateResearch({ status: e.target.value })} className={adminInputClass} />
            </label>
          </AdminCard>
        )}

        {tab === 'aiKnowledge' && selectedAIKnowledge && (
          <AdminCard title="AI Knowledge Base" description="Grounding data for the Ask Kuldeep AI Assistant.">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Select Q&A Entry</span>
              <select
                value={selectedAIKnowledgeId}
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
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Question patterns (one per line)</span>
              <textarea
                value={selectedAIKnowledge.questionPatterns.join('\n')}
                onChange={(e) => updateAIKnowledge({ questionPatterns: e.target.value.split('\n').filter(Boolean) })}
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
                onChange={(e) => updateAIKnowledge({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                className={adminInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Source (variant or document)</span>
              <input value={selectedAIKnowledge.source} onChange={(e) => updateAIKnowledge({ source: e.target.value })} className={adminInputClass} />
            </label>
          </AdminCard>
        )}

        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <button type="submit" className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
            Save Draft
          </button>
          <button type="button" onClick={handleExport} className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400">
            Export JSON
          </button>
          <label className="cursor-pointer rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400">
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button type="button" onClick={handleReset} className="rounded-lg px-5 py-2.5 text-sm text-slate-500 hover:text-slate-300">
            Reset
          </button>
        </div>
      </form>
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
