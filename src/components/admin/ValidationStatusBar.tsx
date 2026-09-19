import { useState, useCallback, useMemo } from 'react'
import type { ValidationSummary, ValidationIssue } from '../../lib/config/validationRegistry'

interface ValidationStatusBarProps {
  summary: ValidationSummary
  onNavigateToIssue: (section: string, itemId?: string, field?: string) => void
}

export function ValidationStatusBar({ summary, onNavigateToIssue }: ValidationStatusBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentErrorIdx, setCurrentErrorIdx] = useState(0)

  const sectionCountWithErrors = useMemo(() => {
    const sections = new Set(summary.errors.map((e) => e.section))
    return sections.size
  }, [summary.errors])

  const handleJumpToNextError = useCallback(() => {
    if (summary.errors.length === 0) return
    const nextIdx = currentErrorIdx % summary.errors.length
    const targetError = summary.errors[nextIdx]
    onNavigateToIssue(targetError.section, targetError.itemId, targetError.field)
    setCurrentErrorIdx((nextIdx + 1) % summary.errors.length)
  }, [summary.errors, currentErrorIdx, onNavigateToIssue])

  if (summary.errorCount > 0) {
    return (
      <div
        className="mb-6 rounded-[var(--radius-card)] border border-red-500/50 bg-red-950/40 p-4 shadow-lg shadow-black/20"
        role="alert"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" aria-hidden="true">
              🚫
            </span>
            <div>
              <p className="text-sm font-semibold text-red-200">
                Configuration Incomplete: {summary.errorCount} blocking error{summary.errorCount > 1 ? 's' : ''} found across{' '}
                {sectionCountWithErrors} section{sectionCountWithErrors > 1 ? 's' : ''}.
              </p>
              <p className="text-xs text-red-300/80">
                Fix all blocking errors before saving drafts or exporting configurations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleJumpToNextError}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[var(--radius-base)] bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <span>Jump to Next Error</span>
              <span aria-hidden="true">⏭️</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              aria-expanded={isDrawerOpen}
              className="inline-flex min-h-[36px] items-center rounded-[var(--radius-base)] border border-red-500/40 bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {isDrawerOpen ? 'Hide Error List' : `View All Errors (${summary.errorCount})`}
            </button>
          </div>
        </div>

        {isDrawerOpen && (
          <div className="mt-4 border-t border-red-500/30 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-300">
              Active Errors (Click to navigate & focus):
            </p>
            <ul className="max-h-60 space-y-2 overflow-y-auto pr-1 text-xs">
              {summary.errors.map((err) => (
                <li key={err.id}>
                  <button
                    type="button"
                    onClick={() => onNavigateToIssue(err.section, err.itemId, err.field)}
                    className="flex w-full items-start justify-between gap-2 rounded-[var(--radius-base)] border border-red-500/20 bg-red-900/20 p-2 text-left hover:border-red-500/40 hover:bg-red-900/30 focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    <div>
                      <span className="font-semibold text-red-200 uppercase tracking-wide text-[10px] bg-red-900/60 px-1.5 py-0.5 rounded mr-1.5">
                        {err.section}
                      </span>
                      {err.field && (
                        <span className="font-mono text-red-300 mr-1.5">{err.field}:</span>
                      )}
                      <span className="text-red-200">{err.message}</span>
                      {err.remediation && (
                        <p className="mt-0.5 text-[11px] text-red-300/70">{err.remediation}</p>
                      )}
                    </div>
                    <span className="text-red-400 font-semibold shrink-0">Jump →</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (summary.warningCount > 0) {
    return (
      <div
        className="mb-6 rounded-[var(--radius-card)] border border-amber-500/40 bg-amber-950/20 p-4 shadow-sm"
        role="status"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg" aria-hidden="true">
              ℹ️
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-200">
                {summary.warningCount} quality recommendation{summary.warningCount > 1 ? 's' : ''}.
              </p>
              <p className="text-xs text-amber-300/80">
                Draft is valid and safe to save and export.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            aria-expanded={isDrawerOpen}
            className="inline-flex min-h-[36px] items-center rounded-[var(--radius-base)] border border-amber-500/30 bg-amber-900/20 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-900/40 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {isDrawerOpen ? 'Hide Recommendations' : `Review Recommendations (${summary.warningCount})`}
          </button>
        </div>

        {isDrawerOpen && (
          <div className="mt-4 border-t border-amber-500/30 pt-3">
            <ul className="max-h-60 space-y-2 overflow-y-auto pr-1 text-xs">
              {summary.warnings.map((warn: ValidationIssue) => (
                <li key={warn.id}>
                  <button
                    type="button"
                    onClick={() => onNavigateToIssue(warn.section, warn.itemId, warn.field)}
                    className="flex w-full items-start justify-between gap-2 rounded-[var(--radius-base)] border border-amber-500/20 bg-amber-900/20 p-2 text-left hover:border-amber-500/40 hover:bg-amber-900/30 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <div>
                      <span className="font-semibold text-amber-200 uppercase tracking-wide text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded mr-1.5">
                        {warn.section}
                      </span>
                      {warn.field && (
                        <span className="font-mono text-amber-300 mr-1.5">{warn.field}:</span>
                      )}
                      <span className="text-amber-200">{warn.message}</span>
                      {warn.remediation && (
                        <p className="mt-0.5 text-[11px] text-amber-300/70">{warn.remediation}</p>
                      )}
                    </div>
                    <span className="text-amber-400 font-semibold shrink-0">Jump →</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="mb-6 flex items-center justify-between rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300"
      role="status"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true">✓</span>
        <span className="font-medium">All sections valid. Ready to export or save draft.</span>
      </div>
      <span className="font-mono text-[11px] text-emerald-400/80">0 errors · 0 warnings</span>
    </div>
  )
}
