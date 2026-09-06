import { useState } from 'react'
import { portfolioConfig } from '../../config'
import { getAIProvider } from '../../lib/ai/provider'
import { NO_RESULT_MESSAGE } from '../../lib/ai/knowledgeSearch'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

// V2.1 P3 (spec §44/45): the dispatch's own copy for the empty state — a
// distinct, on-brand message rather than surfacing knowledgeSearch.ts's raw
// NO_RESULT_MESSAGE (which is written for the underlying data layer, not
// this UI). The matching engine/its trigger condition are untouched; only
// what's displayed for that condition changes.
const NO_MATCH_DISPLAY_MESSAGE =
  'No matching engineering note found. Try asking about: Backend, Architecture, APIs, Performance, Systems'
const ERROR_DISPLAY_MESSAGE =
  'Something went wrong finding an answer. Try one of the suggested questions below.'

/**
 * V2.1 P3 (spec §43-45) — "Ask Kuldeep" reframed as a personal engineering
 * knowledge interface, not a chat-bubble clone. Same matching engine
 * (knowledgeSearch.ts / aiKnowledge.ts, untouched); only the presentation
 * changes: a labeled prompt input, "Suggested:" prompt chips, and answers
 * rendered as an "engineering note" — a heading, contextual metadata (the
 * question that was asked), and the real answer split on its own existing
 * paragraph structure (generateAnswer's primary + "Additionally: ..."
 * supplemental) with a subtle separator between them, rather than a chat
 * bubble.
 */
export function AskKuldeepSection() {
  const { askKuldeepContent } = portfolioConfig
  const [query, setQuery] = useState('')
  const [askedQuestion, setAskedQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [errored, setErrored] = useState(false)

  const handleAsk = async (q: string) => {
    setQuery(q)
    setAskedQuestion(q)
    setLoading(true)
    setErrored(false)
    try {
      const result = await getAIProvider().search(q)
      setAnswer(result)
    } catch {
      setErrored(true)
      setAnswer('')
    } finally {
      setLoading(false)
    }
  }

  // The real answer is either a single paragraph or "<primary>\n\nAdditionally: <supplemental>"
  // (see knowledgeSearch.ts's generateAnswer) — split on that real structure
  // to render as separate note sections with a divider, instead of one
  // undifferentiated block.
  const answerParagraphs = answer.split('\n\n').filter(Boolean)
  const isNoMatch = answer === NO_RESULT_MESSAGE

  return (
    <SectionShell id="ask" narrow>
      <SectionHeader slug="ask" title={askKuldeepContent.title} description={askKuldeepContent.description} />

      <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk(query)
          }}
          className="mb-2 flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="ask-kuldeep-input" className="sr-only">
            Question for portfolio assistant
          </label>
          <input
            id="ask-kuldeep-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="How would you design a scalable API?"
            className="flex-1 rounded-[var(--radius-base)] border px-4 py-3 text-sm focus:outline-none focus-visible:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 rounded-[var(--radius-base)] px-6 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg)',
            }}
          >
            {loading ? 'Asking…' : 'Ask →'}
          </button>
        </form>

        <p
          className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Suggested
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          {askKuldeepContent.suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="min-h-11 rounded-[var(--radius-pill)] border px-3 py-2 text-xs transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {loading && (
          <div
            data-testid="ask-loading"
            className="animate-pulse rounded-[var(--radius-card)] border p-6"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            role="status"
            aria-label="Looking that up"
          >
            {/* Skeleton preserves the note's layout (heading line + two text
                lines) so the section doesn't jump when the real answer
                replaces it. */}
            <div
              className="mb-3 h-3 w-24 rounded-full"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <div
              className="mb-2 h-3 w-full rounded-full"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <div
              className="h-3 w-2/3 rounded-full"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
          </div>
        )}

        {!loading && errored && (
          <div
            className="rounded-[var(--radius-card)] border border-dashed p-6"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
            }}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm leading-relaxed">{ERROR_DISPLAY_MESSAGE}</p>
          </div>
        )}

        {!loading && !errored && answer && isNoMatch && (
          <div
            className="rounded-[var(--radius-card)] border border-dashed p-6"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
            }}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm leading-relaxed">{NO_MATCH_DISPLAY_MESSAGE}</p>
          </div>
        )}

        {!loading && !errored && answer && !isNoMatch && (
          <div
            className="rounded-[var(--radius-card)] border p-6 sm:p-8"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
            role="status"
            aria-live="polite"
          >
            <h3
              className="font-mono text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: 'var(--color-accent)' }}
            >
              {askKuldeepContent.responseHeading}
            </h3>
            {/* Contextual metadata (spec §45) — the real question just
                asked, not invented telemetry. */}
            {askedQuestion && (
              <p className="mt-1 text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                Re: {askedQuestion}
              </p>
            )}
            <hr className="my-4 border-t" style={{ borderColor: 'var(--color-border)' }} />
            <div className="space-y-4">
              {answerParagraphs.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
    </SectionShell>
  )
}
