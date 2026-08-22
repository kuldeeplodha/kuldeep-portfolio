import { Hero } from '../components/sections/Hero'
import { MetricsSection } from '../components/sections/MetricsSection'
import { AboutSection } from '../components/sections/AboutSection'
import { ExperienceSection } from '../components/sections/ExperienceSection'
import { ProjectsSection } from '../components/sections/ProjectsSection'
import { ResearchLabSection } from '../components/sections/ResearchLabSection'
import { SkillsSection } from '../components/sections/SkillsSection'
import { EducationSection } from '../components/sections/EducationSection'
import { CertificationsSection } from '../components/sections/CertificationsSection'
import { AskKuldeepSection } from '../components/sections/AskKuldeepSection'
import { ContactSection } from '../components/layout/Navbar'

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
      <ExperienceSection />
      <ProjectsSection />
      <ResearchLabSection />
      <SkillsSection />
      <EducationSection />
      <CertificationsSection />
      <AskKuldeepSection />
      <ContactSection />
    </main>
  )
}
