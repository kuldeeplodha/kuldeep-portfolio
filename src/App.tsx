import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { RoleThemeSync } from './components/layout/RoleThemeSync'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)
// V2.2 P3: /blog and /blog/:slug now render the CMS-backed pages (PRD's
// official Phase 3/4 plan — Phase 3 cuts the live routes over, Phase 4
// migrates the 3 existing markdown posts into Turso and verifies a static
// fallback). src/pages/BlogListPage.tsx / BlogDetailPage.tsx and
// src/lib/blog/* are deliberately left in place, just no longer imported
// here — P4's job, not this phase's, to migrate or retire them.
const CmsBlogListPage = lazy(() =>
  import('./pages/CmsBlogListPage').then((m) => ({ default: m.CmsBlogListPage })),
)
const CmsBlogDetailPage = lazy(() =>
  import('./pages/CmsBlogDetailPage').then((m) => ({ default: m.CmsBlogDetailPage })),
)
const CaseStudiesListPage = lazy(() =>
  import('./pages/CaseStudiesListPage').then((m) => ({ default: m.CaseStudiesListPage })),
)
const CaseStudyDetailPage = lazy(() =>
  import('./pages/CaseStudyDetailPage').then((m) => ({ default: m.CaseStudyDetailPage })),
)

function PageLoader() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      style={{ color: 'var(--color-text-muted)' }}
      role="status"
      aria-label="Loading page"
    >
      Loading…
    </div>
  )
}

function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    // Some homepage sections are lazy-loaded behind <Suspense> (see
    // HomePage.tsx / .perf-budget.json code-splitting), so the target
    // element may not exist yet the instant the hash changes — poll
    // briefly for it to mount before giving up.
    let frame: number
    let attempts = 0
    const tryScroll = () => {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
      attempts += 1
      if (attempts < 60) {
        frame = requestAnimationFrame(tryScroll)
      }
    }
    frame = requestAnimationFrame(tryScroll)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <>
      <RoleThemeSync />
      <ScrollToHash />
      {!isAdminRoute && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/blog" element={<CmsBlogListPage />} />
          <Route path="/blog/:slug" element={<CmsBlogDetailPage />} />
          <Route path="/case-studies" element={<CaseStudiesListPage />} />
          <Route path="/case-studies/:slug" element={<CaseStudyDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  )
}
