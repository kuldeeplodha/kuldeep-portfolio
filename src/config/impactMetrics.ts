import type { ImpactMetricItem } from '../types'

// Verbatim from the human-provided V2 content model (top-level content.impact).
// Already exactly 5 items — matches uiContentRules.limits.impactMetrics.
export const impactMetrics: { title: string; description: string; items: ImpactMetricItem[] } = {
  title: 'Engineering with measurable outcomes.',
  description:
    'A few examples of how software, automation, and data engineering translated into practical improvements.',
  items: [
    { metric: '60%+', label: 'API response improvement', context: 'Database and backend optimization' },
    { metric: '75%', label: 'Less manual data entry', context: 'Workflow and data synchronization automation' },
    { metric: '40%', label: 'Lower data delivery latency', context: 'ETL and data pipeline improvements' },
    { metric: '30+', label: 'Digital workflows', context: 'Field-data and survey workflows' },
    { metric: '60%', label: 'Report generation time reduction', context: 'SQL and reporting automation' },
  ],
}
