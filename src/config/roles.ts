import type { RoleConfig } from '../types'

export const roles: Record<string, RoleConfig> = {
  software: {
    id: 'software',
    label: 'Software Engineer',
    themeId: 'software',
    hero: {
      headline: 'I engineer reliable systems, APIs and data pipelines.',
      subtitle:
        'Backend-focused developer building Django services, REST APIs, ETL workflows, and production-ready automation.',
      primaryCta: 'Explore My Work',
      secondaryCta: 'View Architecture',
    },
    highlightedSkillIds: [
      'python',
      'django',
      'rest',
      'postgresql',
      'docker',
      'git',
      'airflow',
    ],
    highlightedProjectIds: [],
    highlightedMetricIds: [
      'years-experience',
      'deployment-improvement',
      'api-improvement',
      'manual-entry-reduction',
    ],
    experiencePriorityIds: ['shelter-associates', 'swadhar-idwc'],
    resumeVariant: 'software',
    navEmphasis: ['experience', 'skills', 'projects'],
  },
  ai: {
    id: 'ai',
    label: 'AI / ML',
    themeId: 'ai',
    hero: {
      headline: 'I build intelligent systems from data, language and models.',
      subtitle:
        'ML, NLP, deep learning, and MLOps — from gesture recognition to multilingual NLP research.',
      primaryCta: 'Explore Research Lab',
      secondaryCta: 'View ML Projects',
    },
    highlightedSkillIds: [
      'nlp',
      'machine-learning',
      'deep-learning',
      'llm',
      'mlops',
      'pytorch',
    ],
    highlightedProjectIds: [
      'gesture-recognition',
      'ticket-classification',
      'sentiment-recommendation',
    ],
    highlightedMetricIds: ['years-experience'],
    experiencePriorityIds: ['shelter-associates', 'swadhar-idwc'],
    resumeVariant: 'ai_ml',
    navEmphasis: ['research', 'projects', 'skills'],
  },
  data: {
    id: 'data',
    label: 'Data Analyst',
    themeId: 'data',
    hero: {
      headline: 'I turn messy data into decisions people can act on.',
      subtitle:
        'SQL, dashboards, ETL pipelines, and analytics that help teams move faster with confidence.',
      primaryCta: 'See Impact Metrics',
      secondaryCta: 'View Dashboards Work',
    },
    highlightedSkillIds: [
      'sql',
      'pandas',
      'excel',
      'superset',
      'metabase',
      'airflow',
      'etl',
    ],
    highlightedProjectIds: [],
    highlightedMetricIds: [
      'reporting-time-reduction',
      'data-accuracy',
      'survey-forms',
      'program-teams',
    ],
    experiencePriorityIds: ['swadhar-idwc', 'shelter-associates'],
    resumeVariant: 'data_analyst',
    navEmphasis: ['experience', 'skills', 'projects'],
  },
  system: {
    id: 'system',
    label: 'System View',
    themeId: 'system',
    hero: {
      headline: 'Software → Data → Machine Learning → AI',
      subtitle:
        'A coherent engineering journey: systems as foundation, data as material, AI as specialization.',
      primaryCta: 'Explore Full Profile',
      secondaryCta: 'Ask Kuldeep',
    },
    highlightedSkillIds: [],
    highlightedProjectIds: [
      'gesture-recognition',
      'ticket-classification',
      'sentiment-recommendation',
    ],
    highlightedMetricIds: ['years-experience'],
    experiencePriorityIds: ['shelter-associates', 'swadhar-idwc'],
    resumeVariant: 'software',
    navEmphasis: ['experience', 'research', 'projects', 'skills'],
  },
}
