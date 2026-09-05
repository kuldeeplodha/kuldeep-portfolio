import { lazy, Suspense } from 'react'
import { Hero } from '../components/sections/Hero'
import { MetricsSection } from '../components/sections/MetricsSection'
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

export function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <Hero />
      <MetricsSection />
      <AboutSection />
      <Suspense fallback={<SectionLoader />}>
        <ExperienceSection />
        <ProjectsSection />
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
