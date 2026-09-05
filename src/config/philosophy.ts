import type { PhilosophyItem } from '../types'

// Verbatim from the human-provided V2 content model (content.philosophy).
export const philosophy: { title: string; items: PhilosophyItem[] } = {
  title: 'How I approach engineering',
  items: [
    {
      title: 'Understand the system',
      description:
        'Before changing code, understand the problem, existing architecture, data flow, and constraints.',
    },
    {
      title: 'Design for the right complexity',
      description:
        'Good architecture is about choosing abstractions that make systems easier to understand, change, and operate.',
    },
    {
      title: 'Build with the future in mind',
      description:
        'Prefer modular, testable implementations that can evolve as requirements and system complexity grow.',
    },
    {
      title: 'Optimize what matters',
      description:
        'Performance improvements should come from understanding bottlenecks rather than premature optimization.',
    },
    {
      title: 'Measure the outcome',
      description:
        'Engineering success is reflected in reliability, performance, maintainability, developer productivity, and user impact.',
    },
  ],
}
