import type { CurrentlyExploringItem } from '../types'

// Verbatim from the human-provided V2 content model (content.currentlyExploring).
export const currentlyExploring: { title: string; items: CurrentlyExploringItem[] } = {
  title: 'Currently Exploring',
  items: [
    {
      title: 'Generative AI',
      description: 'Building practical applications around LLMs, AI agents, and intelligent workflows.',
    },
    {
      title: 'AI Engineering',
      description: 'Exploring how strong software engineering practices can be applied to production AI systems.',
    },
    {
      title: 'NLP & Explainability',
      description:
        'Continuing to explore multilingual NLP, low-resource language challenges, and interpretable machine learning.',
    },
    {
      title: 'Developer Productivity',
      description: 'Experimenting with AI-assisted development workflows and multi-agent engineering systems.',
    },
  ],
}
