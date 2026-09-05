import type { CareerJourneyStep } from '../types'

// Verbatim from the human-provided V2 content model — do not invent steps or dates.
export const careerJourney: CareerJourneyStep[] = [
  {
    period: '2021',
    title: 'Starting with Software',
    description:
      'Began my professional software engineering journey, building backend applications, APIs, databases, and digital workflows.',
  },
  {
    period: '2021 – Jul 2025',
    title: 'Software + Data',
    description:
      'Expanded into data engineering, ETL automation, analytics, dashboards, reporting, and operational systems while continuing backend development.',
  },
  {
    period: '2023 – 2024',
    title: 'Machine Learning',
    description:
      'Pursued advanced education in Machine Learning & Artificial Intelligence, developing practical experience across ML, deep learning, NLP, and MLOps.',
  },
  {
    period: '2024',
    title: 'AI Research',
    description:
      'Completed an MS in Machine Learning & Artificial Intelligence with research focused on explainability in low-resource and multilingual NLP.',
  },
  {
    period: 'Aug 2025 – Present',
    title: 'Engineering Leadership',
    description:
      'Joined Vidai Solutions as a Senior Software Developer (Lead), taking responsibility for backend engineering, architecture, integrations, optimization, and team leadership.',
  },
]
