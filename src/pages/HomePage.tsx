import { lazy, Suspense } from 'react'
import { Hero } from '../components/sections/Hero'
import { EngineeringSignalSection } from '../components/sections/EngineeringSignalSection'
import { AboutSection } from '../components/sections/AboutSection'
import { ContactSection } from '../components/layout/Navbar'

const ExperienceSection = lazy(() => import('../components/sections/ExperienceSection').then(m => ({ default: m.ExperienceSection })))
const ProjectsSection = lazy(() => import('../components/sections/ProjectsSection').then(m => ({ default: m.ProjectsSection })))
const ResearchLabSection = lazy(() => import('../components/sections/ResearchLabSection').then(m => ({ default: m.ResearchLabSection })))
const SkillsSection = lazy(() => import('../components/sections/SkillsSection').then(m => ({ default: m.SkillsSection })))
const EducationSection = lazy(() => import('../components/sections/EducationSection').then(m => ({ default: m.EducationSection })))
const CertificationsSection = lazy(() => import('../components/sections/CertificationsSection').then(m => ({ default: m.CertificationsSection })))
const AskKuldeepSection = lazy(() => import('../components/sections/AskKuldeepSection').then(m => ({ default: m.AskKuldeepSection })))

function SectionLoader() {
  return <div className="min-h-[20vh]" aria-hidden="true" />
}

// V2-P3: order follows src/config/sectionOrder.ts (signal -> work -> experience
// -> about -> lab -> stack -> ask) for the 4 sections this phase rebuilds.
// MetricsSection is deliberately NOT rendered here anymore — its old content
// (years-experience, manual-entry-reduction, etc.) restated the same
// achievements now covered authoritatively by ProjectsSection's impact-metrics
// strip, which uiContentRules explicitly warns against ("repeating the same
// achievement in multiple sections"). The component/config are left intact
// (AdminPage still manages them) in case they're repurposed later.
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
        <SkillsSection />
        <EducationSection />
        <CertificationsSection />
        <AskKuldeepSection />
      </Suspense>
      <ContactSection />
    </main>
  )
}
