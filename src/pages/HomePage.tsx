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
// MetricsSection (V2-P3) and SkillsSection (V2-P4) are deliberately NOT
// rendered here anymore. MetricsSection's old content restated the same
// achievements now covered authoritatively by ProjectsSection's impact-metrics
// strip. SkillsSection is superseded by EngineeringSignalSection (categories)
// + EngineeringStackSection (the full technology matrix) — both uiContentRules
// violations (repeating content / a redundant skills listing) if left in
// alongside their replacements. Both components and their config are left
// intact (AdminPage still manages them) in case they're repurposed later.
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
