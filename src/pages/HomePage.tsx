import { Hero } from '../components/sections/Hero'
import { MetricsSection } from '../components/sections/MetricsSection'
import { ExperienceSection } from '../components/sections/ExperienceSection'
import { ProjectsSection } from '../components/sections/ProjectsSection'
import { AskKuldeepSection } from '../components/sections/AskKuldeepSection'
import { ContactSection } from '../components/layout/Navbar'

export function HomePage() {
  return (
    <main style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Hero />
      <MetricsSection />
      <ExperienceSection />
      <ProjectsSection />
      <AskKuldeepSection />
      <ContactSection />
    </main>
  )
}
