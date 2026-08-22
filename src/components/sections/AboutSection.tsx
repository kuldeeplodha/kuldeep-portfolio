import { portfolioConfig } from '../../config'
import { useRole } from '../../hooks/useRole'
import { RoleTransition } from '../ui/RoleTransition'

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
    <section id="about" className="px-6 py-16">
      <RoleTransition>
        <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          About
        </h2>
        <p className="mb-4 text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {profile.summary}
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {story}
        </p>
        </div>
      </RoleTransition>
    </section>
  )
}
