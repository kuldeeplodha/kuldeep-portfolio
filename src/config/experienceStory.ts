import type { ExperienceStoryEntry } from '../types'

// Verbatim from the human-provided V2 content model (content.experience,
// agents/god/notes/v2-real-content.json) — EMR/billing/CRM at Vidai Solutions
// confirmed real by the human, per the V2-P3 dispatch. Do not paraphrase or embellish.
export const experienceStory: ExperienceStoryEntry[] = [
  {
    id: 'vidai-solutions',
    company: 'Vidai Solutions',
    role: 'Senior Software Developer (Lead)',
    period: 'Aug 2025 – Present',
    location: 'Pune, India',
    current: true,
    summary:
      'Senior backend engineer and team lead working on production systems across EMR, billing, CRM, integrations, and business-critical application workflows. Alongside hands-on engineering, I lead a team of backend developers and contribute to technical design, code reviews, optimization, debugging, and delivery.',
    selectedHighlights: [
      'Currently leading a backend development team while remaining hands-on with engineering and architecture.',
      'Building and maintaining systems across EMR, billing, and CRM domains.',
      'Working with external provider APIs including LinkedIn and Google integrations.',
      'Optimizing APIs and database operations to improve application performance.',
      'Participating in architecture, code reviews, debugging, production support, and delivery.',
    ],
    domains: [
      {
        name: 'EMR',
        description: 'Backend engineering for Electronic Medical Record workflows and healthcare-focused application functionality.',
      },
      {
        name: 'Billing',
        description: 'Backend workflows supporting billing processes, business rules, data processing, and related APIs.',
      },
      {
        name: 'CRM',
        description: 'Application and backend functionality supporting customer and business workflows.',
      },
    ],
    integrations: ['LinkedIn APIs', 'Google APIs', 'Third-party provider APIs'],
    leadership: [
      'Team planning',
      'Code reviews',
      'Technical guidance',
      'Architecture discussions',
      'Production debugging',
      'Delivery coordination',
    ],
    technology: [
      'Python',
      'Django',
      'Django REST Framework',
      'PostgreSQL',
      'SQL',
      'REST APIs',
      'Git',
      'Docker',
      'CI/CD',
    ],
  },
  {
    id: 'shelter-associates',
    company: 'Shelter Associates',
    role: 'Software Developer',
    period: '2021 – July 2025',
    location: 'Pune, India',
    current: false,
    summary:
      'Worked across backend development, data engineering, automation, analytics, and internal digital systems, building solutions that improved application performance and reduced operational effort.',
    highlights: [
      'Engineered backend features for internal web applications using Django and REST APIs.',
      'Optimized database queries and preprocessing logic to improve API performance.',
      'Designed automated data ingestion workflows to synchronize data from the AVNI platform.',
      'Built and maintained ETL workflows using Python and Apache Airflow.',
      'Designed dashboards and reporting workflows using Apache Superset and Metabase.',
    ],
    impact: [
      { value: '60%+', label: 'API response improvement' },
      { value: '75%', label: 'Reduction in manual data entry' },
      { value: '40%', label: 'Lower data delivery latency' },
    ],
    technology: [
      'Python',
      'Django',
      'Django REST Framework',
      'PostgreSQL',
      'Apache Airflow',
      'Pandas',
      'SQL',
      'Apache Superset',
      'Metabase',
      'Docker',
    ],
  },
  {
    id: 'swadhar-idwc',
    company: 'Swadhar IDWC',
    role: 'Software Developer Consultant',
    period: '2023 – July 2025',
    location: 'Pune, India',
    current: false,
    summary:
      'Worked as a technology consultant helping transition manual operational processes into digital data collection, reporting, and analytics workflows.',
    highlights: [
      'Helped transition manual data-entry processes to AVNI-based digital workflows.',
      'Created and deployed more than 30 custom survey forms and workflows.',
      'Developed SQL-based reporting workflows for faster operational reporting.',
      'Designed interactive dashboards for program KPIs and operational performance.',
      'Supported stakeholders with data-driven reporting and improved data accessibility.',
    ],
    impact: [
      { value: '30+', label: 'Digital workflows created' },
      { value: '50%+', label: 'Reporting effort reduction' },
      { value: '5+', label: 'Program teams supported' },
    ],
    technology: ['SQL', 'Python', 'AVNI', 'Apache Superset', 'Metabase', 'Data Analysis', 'Reporting Automation'],
  },
]
