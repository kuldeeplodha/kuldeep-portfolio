import type { SkillCategory } from '../types'

export const skills: SkillCategory[] = [
  {
    id: 'programming',
    name: 'Programming',
    relevantRoles: ['software', 'ai', 'data', 'system'],
    skills: [
      { id: 'python', name: 'Python', relatedIds: ['django', 'pandas', 'machine-learning'] },
      { id: 'java', name: 'Java' },
      { id: 'sql', name: 'SQL', relatedIds: ['postgresql', 'mysql'] },
    ],
  },
  {
    id: 'web',
    name: 'Web Development',
    relevantRoles: ['software', 'system'],
    skills: [
      { id: 'django', name: 'Django', relatedIds: ['python', 'rest'] },
      { id: 'flask', name: 'Flask' },
      { id: 'react', name: 'React' },
      { id: 'rest', name: 'REST APIs' },
      { id: 'docker', name: 'Docker' },
      { id: 'git', name: 'Git' },
    ],
  },
  {
    id: 'data-engineering',
    name: 'Data Engineering',
    relevantRoles: ['data', 'software', 'system'],
    skills: [
      { id: 'airflow', name: 'Apache Airflow', relatedIds: ['etl', 'python'] },
      { id: 'etl', name: 'ETL' },
      { id: 'pandas', name: 'Pandas', relatedIds: ['python', 'sql'] },
      { id: 'excel', name: 'MS Excel' },
    ],
  },
  {
    id: 'databases',
    name: 'Databases',
    relevantRoles: ['software', 'data', 'system'],
    skills: [
      { id: 'postgresql', name: 'PostgreSQL' },
      { id: 'mysql', name: 'MySQL' },
      { id: 'mongodb', name: 'MongoDB' },
    ],
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    relevantRoles: ['ai', 'system'],
    skills: [
      { id: 'machine-learning', name: 'Machine Learning', relatedIds: ['python'] },
      { id: 'pytorch', name: 'PyTorch' },
      { id: 'scikit-learn', name: 'Scikit-learn' },
    ],
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning & NLP',
    relevantRoles: ['ai', 'system'],
    skills: [
      { id: 'deep-learning', name: 'Deep Learning' },
      { id: 'nlp', name: 'NLP', relatedIds: ['llm'] },
      { id: 'llm', name: 'LLM / Generative AI' },
      { id: 'mlops', name: 'MLOps', relatedIds: ['airflow'] },
    ],
  },
  {
    id: 'visualization',
    name: 'Visualization',
    relevantRoles: ['data', 'system'],
    skills: [
      { id: 'superset', name: 'Apache Superset' },
      { id: 'metabase', name: 'Metabase' },
      { id: 'power-bi', name: 'Power BI' },
      { id: 'tableau', name: 'Tableau' },
    ],
  },
]
