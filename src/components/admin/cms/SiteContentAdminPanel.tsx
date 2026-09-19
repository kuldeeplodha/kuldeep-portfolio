import { useCallback, useEffect, useState } from 'react'
import { getAdminContent, updateAdminContent, type SiteContentRecord } from '../../../lib/admin/siteContent'
import { CmsApiError } from '../../../lib/admin/cms'
import { adminInputClass, AdminCard } from '../AdminLayout'
import { CmsFormEditor } from './CmsFormEditor'

// CMS-RESTORE-FRIENDLY-PANEL: the restored per-section Configuration
// Panel (src/pages/AdminPage.tsx) now owns friendly forms for profile,
// experience, projects, roles, metrics, skills, education,
// certifications, research, and ai-knowledge — those 10 keys were
// removed from this list so they aren't editable from two places at
// once (risk of one tab clobbering the other's unsaved change). This
// panel stays the catch-all/raw-JSON editor for every key that has no
// friendly form yet.
const SECTION_GROUPS: { label: string; keys: { key: string; label: string }[] }[] = [
  {
    label: 'P1 — high-touch copy',
    keys: [
      { key: 'contact', label: 'Contact' },
      { key: 'footer', label: 'Footer' },
      { key: 'engineering-signal', label: 'Engineering Signal' },
      { key: 'impact-metrics', label: 'Impact Metrics' },
      { key: 'experience-story', label: 'Experience Story' },
    ],
  },
  {
    label: 'P3 — remaining sections',
    keys: [
      { key: 'career-journey', label: 'Career Journey' },
      { key: 'currently-exploring', label: 'Currently Exploring' },
      { key: 'philosophy', label: 'Philosophy' },
      { key: 'ask-kuldeep', label: 'Ask Kuldeep' },
      { key: 'resumes', label: 'Resumes' },
    ],
  },
]

const ALL_KEYS = SECTION_GROUPS.flatMap((g) => g.keys)

function nowIso(): string {
  return new Date().toISOString()
}

export function SiteContentAdminPanel() {
  const [selectedKey, setSelectedKey] = useState(ALL_KEYS[0].key)
  const [record, setRecord] = useState<SiteContentRecord | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [isRawMode, setIsRawMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<string | null>(null)

  const load = useCallback((key: string) => {
    setLoading(true)
    setLoadError(null)
    setSaveError(null)
    setSaveOk(false)
    getAdminContent(key)
      .then((r) => {
        setRecord(r)
        setJsonText(JSON.stringify(r.data, null, 2))
      })
      .catch((err) => {
        // A 404 means this key hasn't been published yet — not an error
        // state, just an empty starting point the human can fill in and
        // publish for the first time.
        if (err instanceof CmsApiError && err.status === 404) {
          setRecord(null)
          setJsonText('{}')
        } else {
          setLoadError(err instanceof CmsApiError ? err.message : 'Failed to load content.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(selectedKey)
  }, [selectedKey, load])

  const handleSave = useCallback(
    async (status: 'draft' | 'published') => {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonText)
      } catch (err) {
        setSaveError(`Invalid JSON: ${err instanceof Error ? err.message : 'could not parse'}`)
        return
      }
      setSaving(true)
      setSaveError(null)
      setSaveOk(false)
      try {
        const ts = nowIso()
        const saved = await updateAdminContent(selectedKey, {
          data: parsed,
          status,
          published_at: status === 'published' ? ts : (record?.published_at ?? null),
          updated_at: ts,
        })
        setRecord(saved)
        setSaveOk(true)
      } catch (err) {
        setSaveError(err instanceof CmsApiError ? err.message : 'Save failed.')
      } finally {
        setSaving(false)
      }
    },
    [jsonText, selectedKey, record],
  )

  // CMS-UNIFY-CONFIG-EDITOR step (c): "keep import/export working, now
  // against the DB path." The retired legacy panel's export/import
  // round-tripped a single PortfolioConfig JSON via a browser download +
  // file input; there's no equivalent single object anymore (20 independent
  // DB rows), so this exports/imports ALL site_content keys as one JSON
  // file -- a full backup/restore rather than a config snapshot. Each
  // imported key is PUT with whatever status/data it already had in the
  // file (a true restore, not a forced re-publish).
  const handleExportAll = useCallback(async () => {
    setBulkBusy(true)
    setBulkStatus(null)
    try {
      const results = await Promise.allSettled(ALL_KEYS.map((k) => getAdminContent(k.key)))
      const bundle: Record<string, SiteContentRecord> = {}
      let missing = 0
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') bundle[ALL_KEYS[i].key] = r.value
        else missing += 1
      })
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'site-content-export.json'
      a.click()
      URL.revokeObjectURL(url)
      setBulkStatus(
        missing > 0
          ? `Exported ${ALL_KEYS.length - missing} of ${ALL_KEYS.length} keys (${missing} not yet published).`
          : `Exported all ${ALL_KEYS.length} keys.`,
      )
    } catch (err) {
      setBulkStatus(err instanceof CmsApiError ? `Export failed: ${err.message}` : 'Export failed.')
    } finally {
      setBulkBusy(false)
    }
  }, [])

  const handleImportAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      const reader = new FileReader()
      reader.onload = async () => {
        let bundle: Record<string, Partial<SiteContentRecord>>
        try {
          bundle = JSON.parse(reader.result as string)
          if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
            throw new Error('Expected a JSON object of section_key -> record.')
          }
        } catch (err) {
          setBulkStatus(`Import failed: invalid JSON — ${err instanceof Error ? err.message : 'could not parse'}`)
          return
        }

        setBulkBusy(true)
        setBulkStatus(null)
        let succeeded = 0
        let failed = 0
        for (const [key, entry] of Object.entries(bundle)) {
          if (!entry || typeof entry !== 'object' || !('data' in entry)) {
            failed += 1
            continue
          }
          try {
            await updateAdminContent(key, {
              data: entry.data,
              status: entry.status ?? 'draft',
              published_at: entry.published_at ?? null,
              updated_at: nowIso(),
            })
            succeeded += 1
          } catch {
            failed += 1
          }
        }
        setBulkBusy(false)
        setBulkStatus(`Imported ${succeeded} key(s)${failed > 0 ? `, ${failed} failed` : ''}.`)
        load(selectedKey)
      }
      reader.readAsText(file)
    },
    [load, selectedKey],
  )

  // CmsFormEditor's switch has no case for 'experience-story' — falls
  // through to `default: return null` (a silently blank form) — force
  // raw JSON for it rather than risk that.
  const isComplexShape = ['experience-story'].includes(selectedKey)
  
  let parsedData: any = {}
  let parseError = false
  if (!isRawMode && !isComplexShape) {
    try {
      parsedData = JSON.parse(jsonText || '{}')
    } catch {
      parseError = true
    }
  }

  return (
    <AdminCard
      title="Site Content"
      description="Every homepage/section payload, admin-editable here instead of a code commit. The public site always falls back to the bundled default if a key is unpublished or the backend is unreachable."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={handleExportAll}
          disabled={bulkBusy}
          className="inline-flex min-h-[36px] items-center rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bulkBusy ? 'Working…' : 'Export all as JSON'}
        </button>
        <label className="inline-flex min-h-[36px] cursor-pointer items-center rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-white">
          Import JSON
          <input type="file" accept=".json" onChange={handleImportAll} disabled={bulkBusy} className="hidden" />
        </label>
        {bulkStatus && (
          <span className="text-xs text-slate-400" role="status">
            {bulkStatus}
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav aria-label="Site content sections" className="space-y-4">
          {SECTION_GROUPS.map((group) => (
            <div key={group.label}>
              {/* text-slate-500 measured 3.96:1 on this surface — fails
                  WCAG AA (needs 4.5:1); text-slate-400 passes with 0
                  Axe violations (Imagine, QA-CMS-FE-ADMIN-EDITOR). */}
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
              <ul className="space-y-0.5">
                {group.keys.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(item.key)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                        selectedKey === item.key
                          ? 'bg-cyan-400/10 font-medium text-cyan-400'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{selectedKey}</h3>
              {record && (
                <p className="text-xs text-slate-400">
                  {record.status} · updated {new Date(record.updated_at).toLocaleString()}
                </p>
              )}
              {!record && !loading && !loadError && (
                <p className="text-xs text-amber-300">Not yet published — save to create it.</p>
              )}
            </div>
            {!loading && !loadError && (
              <button
                type="button"
                onClick={() => setIsRawMode(!isRawMode)}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
              >
                {isRawMode ? 'Switch to Form Editor' : 'Switch to Raw JSON'}
              </button>
            )}
          </div>

          {loading && (
            <p className="text-sm text-slate-400" role="status">
              Loading…
            </p>
          )}

          {loadError && (
            <p className="mb-4 text-sm text-red-400" role="alert">
              {loadError}
            </p>
          )}

          {!loading && !loadError && (
            <>
              {isComplexShape ? (
                <div className="space-y-4">
                  <div className="p-4 border border-amber-900/50 bg-amber-950/20 rounded-lg">
                    <p className="text-sm font-semibold text-amber-400 mb-2">Complex Shape: Edit as JSON</p>
                    <p className="text-sm text-amber-300/80">
                      The `{selectedKey}` section contains deeply nested arrays and complex structures. To prevent silent data loss, form-editing is disabled for this section.
                    </p>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-sm text-slate-400">Data (JSON)</span>
                    <textarea
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      rows={18}
                      spellCheck={false}
                      className={`${adminInputClass} font-mono text-xs`}
                    />
                  </label>
                </div>
              ) : isRawMode ? (
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-400">Data (JSON)</span>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    rows={18}
                    spellCheck={false}
                    className={`${adminInputClass} font-mono text-xs`}
                  />
                </label>
              ) : parseError ? (
                <div className="p-4 border border-red-900/50 bg-red-950/20 rounded-lg">
                  <p className="text-sm text-red-400 mb-2">The current JSON is invalid. Please fix it in Raw JSON mode before using the form editor.</p>
                  <button type="button" onClick={() => setIsRawMode(true)} className="text-sm text-cyan-400 hover:underline">Switch to Raw JSON</button>
                </div>
              ) : (
                <CmsFormEditor
                  sectionKey={selectedKey}
                  value={parsedData}
                  onChange={(newVal) => setJsonText(JSON.stringify(newVal, null, 2))}
                />
              )}

              {saveError && (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {saveError}
                </p>
              )}
              {saveOk && (
                <p className="mt-3 text-sm text-emerald-400" role="status">
                  Saved.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Publishing…' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save draft
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminCard>
  )
}
