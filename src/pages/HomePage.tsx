import { lazy, Suspense } from 'react'
import { Hero } from '../components/sections/Hero'
import { EngineeringSignalSection } from '../components/sections/EngineeringSignalSection'
import { AboutSection } from '../components/sections/AboutSection'
import { ContactSection } from '../components/layout/Navbar'

const ExperienceSection = lazy(() => import('../components/sections/ExperienceSection').then(m => ({ default: m.ExperienceSection })))
const ProjectsSection = lazy(() => import('../components/sections/ProjectsSection').then(m => ({ default: m.ProjectsSection })))
const ResearchLabSection = lazy(() => import('../components/sections/ResearchLabSection').then(m => ({ default: m.ResearchLabSection })))
const EngineeringStackSection = lazy(() => import('../components/sections/EngineeringStackSection').then(m => ({ default: m.EngineeringStackSection })))
const EducationSection = lazy(() => import('../components/sections/EducationSection').then(m => ({ default: m.EducationSection })))
const CertificationsSection = lazy(() => import('../components/sections/CertificationsSection').then(m => ({ default: m.CertificationsSection })))
const AskKuldeepSection = lazy(() => import('../components/sections/AskKuldeepSection').then(m => ({ default: m.AskKuldeepSection })))

function SectionLoader() {
  return <div className="min-h-[20vh]" aria-hidden="true" />
}

// Order follows src/config/sectionOrder.ts (signal -> work -> experience ->
// about -> lab -> stack -> ask).
//
// V2.1 P2: the MetricsSection and SkillsSection *components* (unrendered
// since V2-P3/P4 — see git history) were deleted outright, reconciling them
// into the one categorical EngineeringStackSection per spec §38-40 and
// removing dead code rather than leaving zombie components around. Their
// underlying config (portfolioConfig.skills / .metrics) and admin-editing
// UI are untouched — that data model is still part of the AdminPage CMS
// surface, which this phase does not touch.
export function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <Hero />
      <EngineeringSignalSection />
      <Suspense fallback={<SectionLoader />}>
        <ProjectsSection />
        <ExperienceSection />
      </Suspense>
      <AboutSection />
      <Suspense fallback={<SectionLoader />}>
        <ResearchLabSection />
        <EngineeringStackSection />
        <EducationSection />
        <CertificationsSection />
        <AskKuldeepSection />
      </Suspense>
      <ContactSection />
    </main>
  )
}
