import { useState } from 'react'
import { AdminLayout } from '../components/admin/AdminLayout'
import { clearCmsToken, clearDevBypass } from '../lib/admin/cms'
import { CmsAuthGate } from '../components/admin/cms/CmsAuthGate'
import { BlogsAdminPanel } from '../components/admin/cms/BlogsAdminPanel'
import { CaseStudiesAdminPanel } from '../components/admin/cms/CaseStudiesAdminPanel'
import { SiteContentAdminPanel } from '../components/admin/cms/SiteContentAdminPanel'

// CMS-UNIFY-CONFIG-EDITOR: the legacy localStorage Configuration Panel
// (profile/experience/projects/roles/metrics/skills/education/certs/
// research/aiKnowledge tabs, ~1500 lines of bespoke per-entity forms) is
// retired. Its "Save Draft" wrote ONLY to localStorage — zero network —
// which is what produced the PR #78 bug report (a save that looked like
// it worked but never touched Turso). Every one of those 10 sections now
// has a site_content DB key (see feat/cms-unify-add-keys) and is
// editable here through SiteContentAdminPanel, the same generic editor
// blog posts and case studies already used. /admin now has exactly one
// editor, and every edit is a real PUT to /api/admin/content/{key}.
type AdminTab = 'siteContent' | 'blogPosts' | 'caseStudies'

const TAB_META: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'siteContent', label: 'Site Content', icon: '🧩' },
  { id: 'blogPosts', label: 'Blog Posts', icon: '📝' },
  { id: 'caseStudies', label: 'Case Studies', icon: '🗂️' },
]

function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('siteContent')

  const sidebar = (
    <nav className="space-y-1" aria-label="Admin sections">
      {TAB_META.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          className={`flex w-full items-center gap-2 rounded-[var(--radius-base)] px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            tab === t.id
              ? 'bg-cyan-400/10 text-cyan-400 font-medium'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
          }`}
        >
          <span aria-hidden>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )

  return (
    <AdminLayout
      sidebar={sidebar}
      header={null}
      onSignOut={() => {
        clearCmsToken()
        clearDevBypass()
        window.location.reload()
      }}
    >
      {/* Mobile Horizontal Tab Navigation */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2 lg:hidden scrollbar-thin" aria-label="Mobile sections">
        {TAB_META.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-[var(--radius-base)] px-3 py-2 text-xs font-medium min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              tab === t.id
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50 font-semibold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <p className="mb-6 text-sm text-slate-400">
        Blog posts, case studies, and site content are authored and published directly here — no export step.
      </p>

      <CmsAuthGate>
        {tab === 'siteContent' && <SiteContentAdminPanel />}
        {tab === 'blogPosts' && <BlogsAdminPanel />}
        {tab === 'caseStudies' && <CaseStudiesAdminPanel />}
      </CmsAuthGate>
    </AdminLayout>
  )
}

export function AdminPage() {
  return (
    <CmsAuthGate>
      <AdminPanel />
    </CmsAuthGate>
  )
}
