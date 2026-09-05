import { useState } from 'react'
import { getAIProvider } from '../../lib/ai/provider'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

const SUGGESTED = [
  'What backend technologies does Kuldeep use?',
  'Tell me about his NLP work.',
  'What was his research thesis?',
  'Which projects demonstrate machine learning?',
]

export function AskKuldeepSection() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAsk = async (q: string) => {
    setQuery(q)
    setLoading(true)
    try {
      const result = await getAIProvider().search(q)
      setAnswer(result)
    } catch (err) {
      setAnswer(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionShell id="ask" narrow>
      <SectionHeader
        slug="ask"
        title="Ask Kuldeep"
        description="Answers are grounded in portfolio data only — no external LLM or API keys required."
      />

      <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk(query)
          }}
          className="mb-4 flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="ask-kuldeep-input" className="sr-only">
            Question for portfolio assistant
          </label>
          <input
            id="ask-kuldeep-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about experience, skills, projects..."
            className="flex-1 rounded-lg border px-4 py-3 text-sm focus:outline-none focus-visible:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 rounded-lg px-6 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg)',
            }}
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </form>

        <div className="mb-6 flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="min-h-11 rounded-full border px-3 py-2 text-xs transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {answer && (
          <div
            className="rounded-xl border p-6 text-sm leading-relaxed"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
            role="status"
            aria-live="polite"
          >
            {answer}
          </div>
        )}
    </SectionShell>
  )
}
