import type { Education, Certification, Research, Metric } from '../types'

// V2 §Education: content.education, verbatim. Fixed a real factual bug found
// here — the GPA (3.58/4.0) was previously attached to the WRONG degree
// (Exec PG instead of the MS); the real content model ties it to the MS.
export const education: Education[] = [
  {
    id: 'ms-ml-ai',
    degree: 'MS in Machine Learning & Artificial Intelligence',
    institution: 'Liverpool John Moores University & UpGrad',
    period: "Jul '24",
    location: 'Liverpool, England',
    gpa: '3.58 / 4.0',
    research: 'Explainability in Low-Resource and Multilingual NLP Applications',
    focus: ['Machine Learning', 'Artificial Intelligence', 'Natural Language Processing', 'Deep Learning', 'MLOps', 'Generative AI'],
  },
  {
    id: 'exec-pg-ml',
    degree: 'Executive PG in Machine Learning & Artificial Intelligence',
    institution: 'IIIT Bangalore & UpGrad',
    period: "Mar '23 – May '24",
    location: 'Bengaluru, IN',
    focus: ['Machine Learning', 'Deep Learning', 'NLP', 'MLOps', 'Generative AI', 'Data Science'],
  },
  {
    id: 'btech-cs',
    degree: 'B.Tech in Computer Science',
    institution: 'Hitkarini College of Engineering & Technology',
    period: "Aug '17 – Jul '21",
    location: 'Jabalpur, IN',
    gpa: '8.00 CGPA',
  },
]

// V2 §Certifications: content.certifications, verbatim — exactly these 7.
// Three certifications previously listed here (Building React and Django
// Apps, Docker Foundations Professional Certificate, Data Analyst Associate)
// are NOT in the human-provided real content model and have been removed
// rather than kept as unverified claims.
export const certifications: Certification[] = [
  {
    id: 'ms-linkedin-sw',
    name: 'Career Essentials in Software Development',
    issuer: 'Microsoft & LinkedIn',
    date: '2025',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'aws-dev',
    name: 'Getting Started as an AWS Developer',
    issuer: 'LinkedIn',
    date: '2025',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'vertex-ai',
    name: 'Prompt Design in Vertex AI',
    issuer: 'Google Cloud Skills Boost',
    date: '2025',
    sourceVariants: ['ai_ml'],
  },
  {
    id: 'pyspark',
    name: 'Apache PySpark by Example',
    issuer: 'LinkedIn',
    date: '2025',
    sourceVariants: ['ai_ml', 'data_analyst'],
  },
  {
    id: 'excel-coursera',
    name: 'Excel Skills for Data Analytics and Visualization',
    issuer: 'Macquarie University / Coursera',
    date: '2024',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'sql-hackerrank',
    name: 'SQL Advanced',
    issuer: 'HackerRank',
    date: '2023',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving — Intermediate',
    issuer: 'HackerRank',
    date: '2023',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
]

// V2 §2.7: this is the ONLY real research entry (MS thesis, completed 2024) —
// content.research.featured, verbatim. Do not add other "experiments"; Kelly's
// content audit flagged multi-experiment framing here as very-high fabrication risk.
export const research: Research[] = [
  {
    id: 'nlp-explainability',
    title: 'Explainability in Low-Resource and Multilingual NLP Applications',
    type: 'MS Research Thesis · 2024',
    description:
      'Research focused on explainability and interpretability challenges in NLP systems operating across low-resource and multilingual settings.',
    status: 'Completed · 2024',
    areas: ['Explainable AI', 'Natural Language Processing', 'Low-Resource NLP', 'Multilingual NLP', 'Model Interpretability'],
  },
]

// content.research.intro, verbatim.
export const researchIntro =
  'My interest in AI goes beyond applying models. I am particularly interested in understanding how models behave, how their decisions can be explained, and how AI can work effectively where data and language resources are limited.'

export const metrics: Metric[] = [
  {
    id: 'years-experience',
    label: 'Years of experience',
    value: '4+',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
    relevantRoles: ['software', 'ai', 'data', 'system'],
  },
  {
    id: 'deployment-improvement',
    label: 'Feature deployment improvement',
    value: '30%',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
    relevantRoles: ['software', 'system'],
  },
  {
    id: 'api-improvement',
    label: 'API response improvement',
    value: '60%+',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
    relevantRoles: ['software', 'system'],
  },
  {
    id: 'manual-entry-reduction',
    label: 'Manual data entry reduction',
    value: '75%',
    sourceVariants: ['software'],
    relevantRoles: ['software'],
  },
  {
    id: 'data-accuracy',
    label: 'Data accuracy improvement',
    value: '30%',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
    relevantRoles: ['data', 'system'],
  },
  {
    id: 'reporting-time-reduction',
    label: 'Reporting time reduction',
    value: '50%',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
    relevantRoles: ['data', 'system'],
  },
  {
    id: 'survey-forms',
    label: 'Custom survey forms & workflows',
    value: '30+',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
    relevantRoles: ['data', 'software', 'system'],
  },
  {
    id: 'program-teams',
    label: 'Program teams supported',
    value: '5+',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
    relevantRoles: ['data', 'system'],
  },
]
