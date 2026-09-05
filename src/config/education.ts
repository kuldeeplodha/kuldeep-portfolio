import type { Education, Certification, Research, Metric } from '../types'

export const education: Education[] = [
  {
    id: 'ms-ml-ai',
    degree: 'MS in Machine Learning & Artificial Intelligence',
    institution: 'Liverpool John Moores University & UpGrad',
    period: "Jul '24",
    location: 'Liverpool, England',
    research: 'Explainability in Low-Resource and Multilingual NLP Applications',
  },
  {
    id: 'exec-pg-ml',
    degree: 'Executive PG in Machine Learning & Artificial Intelligence',
    institution: 'IIIT Bangalore & UpGrad',
    period: "Mar '23 – May '24",
    location: 'Bengaluru, IN',
    gpa: '3.58 / 4',
    highlights: [
      'Machine Learning, Deep Learning, NLP, MLOps',
      'CNNs, RNNs, Gesture Recognition',
      'Encoder-Decoder models, LLMs, Generative AI',
      'MLflow, Airflow, AWS SageMaker',
    ],
  },
  {
    id: 'btech-cs',
    degree: 'B.Tech. in Computer Science',
    institution: 'Hitkarini College of Engineering & Technology',
    period: "Aug '17 – Jul '21",
    location: 'Jabalpur, IN',
    gpa: '8.00 CGPA',
  },
]

export const certifications: Certification[] = [
  {
    id: 'ms-linkedin-sw',
    name: 'Career Essentials in Software Development',
    issuer: 'Microsoft and LinkedIn',
    date: 'Feb 2025',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'aws-dev',
    name: 'Getting Started as an AWS Developer',
    issuer: 'LinkedIn',
    date: 'Mar 2025',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'react-django',
    name: 'Building React and Django Apps',
    issuer: 'LinkedIn',
    date: 'Feb 2025',
    sourceVariants: ['software'],
  },
  {
    id: 'docker',
    name: 'Docker Foundations Professional Certificate',
    issuer: 'Docker',
    date: 'Mar 2025',
    sourceVariants: ['software'],
  },
  {
    id: 'vertex-ai',
    name: 'Prompt Design in Vertex AI',
    issuer: 'Google Cloud Skills Boost',
    date: 'May 2025',
    sourceVariants: ['ai_ml'],
  },
  {
    id: 'datacamp-da',
    name: 'Data Analyst Associate certificate',
    issuer: 'DataCamp',
    date: 'Nov 2024',
    sourceVariants: ['data_analyst'],
  },
  {
    id: 'excel-coursera',
    name: 'Excel Skills for Data Analytics and Visualization',
    issuer: 'Coursera / Macquarie University',
    date: 'Mar 2024',
    sourceVariants: ['software', 'ai_ml'],
  },
  {
    id: 'sql-hackerrank',
    name: 'SQL (Advanced) Certificate',
    issuer: 'HackerRank',
    date: 'Feb 2023',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving (Intermediate) Certificate',
    issuer: 'HackerRank',
    date: 'Feb 2023',
    sourceVariants: ['software', 'ai_ml', 'data_analyst'],
  },
  {
    id: 'pyspark',
    name: 'Apache PySpark by Example',
    issuer: 'LinkedIn',
    date: 'Apr 2025',
    sourceVariants: ['ai_ml'],
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
