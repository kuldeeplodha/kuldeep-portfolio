import { portfolioConfig } from '../../config'
import { useRole } from '../../hooks/useRole'
import { RoleTransition } from '../ui/RoleTransition'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

export function AboutSection() {
  const { profile } = portfolioConfig
  const { roleId } = useRole()

  const story =
    roleId === 'software'
      ? 'Started with computer science and backend engineering — building Django services, REST APIs, and reliable data pipelines that teams depend on daily.'
      : roleId === 'data'
        ? 'Transforms operational data into dashboards and decisions — ETL pipelines, SQL automation, and visualization for program teams.'
        : roleId === 'ai'
          ? 'Expanded into machine learning, NLP, and MLOps through formal education, hands-on projects, and research on explainable multilingual NLP.'
          : 'Software engineering is the foundation. Data is the material. Machine learning and AI are the direction — a coherent journey, not three separate careers.'

  return (
    <SectionShell id="about" narrow>
      <RoleTransition>
        <SectionHeader slug="about" title="About" />
        <p className="mb-4 text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {profile.summary}
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {story}
        </p>
      </RoleTransition>
    </SectionShell>
  )
}
