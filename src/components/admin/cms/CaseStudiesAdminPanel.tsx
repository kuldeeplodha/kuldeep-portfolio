import { useCallback, useEffect, useState } from 'react'
import type { RoleId } from '../../../types'
import {
  CmsApiError,
  createCaseStudy,
  deleteCaseStudy,
  listAdminCaseStudies,
  nowIso,
  slugify,
  updateCaseStudy,
  type CmsCaseStudy,
  type ContentStatus,
} from '../../../lib/admin/cms'
import { adminInputClass, AdminCard } from '../AdminLayout'
import { RoleScopeEditor, RoleBadges } from '../RoleScopeEditor'
import { ConfirmModal } from '../ConfirmModal'
import { MediaUploadField } from './MediaUploadField'
import { TagsInput } from './TagsInput'
import { StatusBadge } from './StatusBadge'

function emptyCaseStudy(): CmsCaseStudy {
  const ts = nowIso()
  return {
    id: crypto.randomUUID(),
    slug: '',
    title: '',
    subtitle: '',
    summary: '',
    client_or_org: '',
    period: '',
    category: '',
    status: 'draft',
    featured: 0,
    published_at: null,
    created_at: ts,
    updated_at: ts,
    technologies: [],
    relevant_roles: [],
    problem: '',
    context: '',
    architecture: '',
    outcome: '',
    future_improvements: null,
    github_url: null,
    live_url: null,
    featured_media_url: null,
    media_urls: [],
  }
}

const SECTION_FIELDS: { field: 'problem' | 'context' | 'architecture' | 'outcome'; label: string }[] = [
  { field: 'problem', label: 'Problem' },
  { field: 'context', label: 'Context' },
  { field: 'architecture', label: 'Architecture' },
  { field: 'outcome', label: 'Outcome' },
]

export function CaseStudiesAdminPanel() {
  const [items, setItems] = useState<CmsCaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editing, setEditing] = useState<CmsCaseStudy | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CmsCaseStudy | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Reusable refetch for after create/save/delete — called from event
  // handlers, so the setLoading(true)/setLoadError(null) reset here runs
  // outside of an effect body.
  const load = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    listAdminCaseStudies()
      .then(setItems)
      .catch((err) => setLoadError(err instanceof CmsApiError ? err.message : 'Failed to load case studies.'))
      .finally(() => setLoading(false))
  }, [])

  // Mount-only fetch: `loading`/`loadError` already start at their reset
  // values, so this effect has no synchronous setState of its own — every
  // state update happens inside the promise callbacks.
  useEffect(() => {
    let cancelled = false
    listAdminCaseStudies()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof CmsApiError ? err.message : 'Failed to load case studies.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isNew = editing !== null && !items.some((i) => i.id === editing.id)

  const handleSave = async (nextStatus?: ContentStatus) => {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    const toSave: CmsCaseStudy = {
      ...editing,
      status: nextStatus ?? editing.status,
      published_at:
        (nextStatus ?? editing.status) === 'published' ? editing.published_at ?? nowIso() : editing.published_at,
      updated_at: nowIso(),
    }
    try {
      if (isNew) {
        await createCaseStudy(toSave)
      } else {
        await updateCaseStudy(toSave.id, toSave)
      }
      setEditing(null)
      load()
    } catch (err) {
      setSaveError(err instanceof CmsApiError ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <AdminCard
        title={isNew ? 'New Case Study' : `Edit: ${editing.title || 'Untitled'}`}
        description="Structured into Problem / Context / Architecture / Outcome — matching the /case-studies detail layout (V2.2 P3)."
      >
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Title</span>
          <input
            className={adminInputClass}
            value={editing.title}
            onChange={(e) => {
              const title = e.target.value
              setEditing({ ...editing, title, slug: editing.slug || slugify(title) })
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Slug</span>
          <input
            className={adminInputClass}
            value={editing.slug}
            onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Subtitle</span>
          <input
            className={adminInputClass}
            value={editing.subtitle}
            onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Summary</span>
          <textarea
            className={adminInputClass}
            rows={2}
            value={editing.summary}
            onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-400">Client / org</span>
            <input
              className={adminInputClass}
              value={editing.client_or_org}
              onChange={(e) => setEditing({ ...editing, client_or_org: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-400">Period</span>
            <input
              className={adminInputClass}
              value={editing.period}
              onChange={(e) => setEditing({ ...editing, period: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-400">Category</span>
            <input
              className={adminInputClass}
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={Boolean(editing.featured)}
              onChange={(e) => setEditing({ ...editing, featured: e.target.checked ? 1 : 0 })}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
            />
            Featured
          </label>
        </div>
        <TagsInput
          label="Technologies"
          value={editing.technologies}
          onChange={(technologies) => setEditing({ ...editing, technologies })}
        />
        <RoleScopeEditor
          value={editing.relevant_roles as RoleId[]}
          onChange={(roles) => setEditing({ ...editing, relevant_roles: roles })}
        />
        <MediaUploadField
          label="Featured image"
          value={editing.featured_media_url}
          onChange={(url) =>
            setEditing({
              ...editing,
              featured_media_url: url,
              media_urls: url ? [...new Set([...editing.media_urls, url])] : editing.media_urls,
            })
          }
        />

        {SECTION_FIELDS.map(({ field, label }) => (
          <label key={field} className="block">
            <span className="mb-1 block text-sm text-slate-400">{label}</span>
            <textarea
              className={adminInputClass}
              rows={5}
              value={editing[field]}
              onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
            />
          </label>
        ))}
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Future improvements (optional)</span>
          <textarea
            className={adminInputClass}
            rows={3}
            value={editing.future_improvements ?? ''}
            onChange={(e) => setEditing({ ...editing, future_improvements: e.target.value || null })}
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-400">GitHub URL (optional)</span>
            <input
              className={adminInputClass}
              value={editing.github_url ?? ''}
              onChange={(e) => setEditing({ ...editing, github_url: e.target.value || null })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-400">Live URL (optional)</span>
            <input
              className={adminInputClass}
              value={editing.live_url ?? ''}
              onChange={(e) => setEditing({ ...editing, live_url: e.target.value || null })}
            />
          </label>
        </div>

        {saveError && (
          <p className="text-sm text-red-400" role="alert">
            {saveError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || !editing.title || !editing.slug}
            onClick={() => handleSave('draft')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-base)] border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving || !editing.title || !editing.slug}
            onClick={() => handleSave('published')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-base)] bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-base)] px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Cancel
          </button>
        </div>
      </AdminCard>
    )
  }

  return (
    <AdminCard title="Case Studies" description="Structured engineering write-ups, authored server-side (Turso).">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{items.length} case stud{items.length === 1 ? 'y' : 'ies'}</p>
        <button
          type="button"
          onClick={() => setEditing(emptyCaseStudy())}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-base)] bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          + New Case Study
        </button>
      </div>

      {loading && (
        <p className="text-sm text-slate-400" role="status">
          Loading…
        </p>
      )}
      {loadError && (
        <p className="text-sm text-red-400" role="alert">
          {loadError}
        </p>
      )}
      {!loading && !loadError && items.length === 0 && (
        <div className="rounded-[var(--radius-base)] border border-dashed border-slate-700 p-8 text-center">
          <p className="text-sm text-slate-400">No case studies yet.</p>
        </div>
      )}

      {deleteError && (
        <p className="text-sm text-red-400" role="alert">
          {deleteError}
        </p>
      )}

      <ul className="divide-y divide-slate-800">
        {items.map((cs) => (
          <li key={cs.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{cs.title || 'Untitled'}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={cs.status} />
                {Boolean(cs.featured) && (
                  <span className="rounded-[var(--radius-pill)] border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-300">
                    Featured
                  </span>
                )}
                <span className="text-xs text-slate-500">{new Date(cs.updated_at).toLocaleDateString()}</span>
                <RoleBadges roles={cs.relevant_roles as RoleId[]} />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditing(cs)}
                className="rounded-[var(--radius-base)] border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(cs)}
                className="rounded-[var(--radius-base)] border border-rose-700/60 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-900/30 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Case Study"
        itemName={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          setDeleteError(null)
          try {
            await deleteCaseStudy(deleteTarget.id)
            setDeleteTarget(null)
            load()
          } catch (err) {
            setDeleteError(err instanceof CmsApiError ? err.message : 'Delete failed.')
            setDeleteTarget(null)
          }
        }}
      />
    </AdminCard>
  )
}
