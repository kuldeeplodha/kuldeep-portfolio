import { useEffect, useRef, useCallback } from 'react'
import type { ValidationSummary, ValidationIssue } from '../../lib/config/validationRegistry'

interface DiagnosticImportModalProps {
  summary: ValidationSummary
  isOpen: boolean
  onClose: () => void
  onConfirmImport?: () => void
  fileName?: string
}

export function DiagnosticImportModal({
  summary,
  isOpen,
  onClose,
  onConfirmImport,
  fileName = 'imported-config.json',
}: DiagnosticImportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const hasErrors = summary.errorCount > 0
  const issues: ValidationIssue[] = hasErrors ? summary.errors : summary.warnings

  // Trap focus & escape listener
  useEffect(() => {
    if (!isOpen) return

    previousActiveElement.current = document.activeElement as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Focus first focusable element
    requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousActiveElement.current?.focus()
    }
  }, [isOpen, onClose])

  const handleDownloadLog = useCallback(() => {
    const timestamp = new Date().toISOString()
    const lines = [
      `=== Portfolio Configuration Validation Log ===`,
      `Generated at: ${timestamp}`,
      `Target file: ${fileName}`,
      `Status: ${hasErrors ? 'REJECTED (Errors Found)' : 'ACCEPTED WITH WARNINGS'}`,
      `Total Errors: ${summary.errorCount}`,
      `Total Warnings: ${summary.warningCount}`,
      ``,
      `--- Issues Breakdown ---`,
    ]

    issues.forEach((issue, idx) => {
      lines.push(
        `#${idx + 1} [${issue.severity.toUpperCase()}] [${issue.section}]${
          issue.itemId ? ` [Item: ${issue.itemId}]` : ''
        }${issue.field ? ` [Field: ${issue.field}]` : ''}`,
      )
      lines.push(`   Problem: ${issue.message}`)
      if (issue.remediation) {
        lines.push(`   Remediation: ${issue.remediation}`)
      }
      lines.push(``)
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `validation-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [summary, issues, hasErrors, fileName])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostic-modal-title"
      ref={modalRef}
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {hasErrors ? '🚫' : '⚠️'}
            </span>
            <div>
              <h2 id="diagnostic-modal-title" className="text-base font-bold text-white">
                {hasErrors
                  ? `Import Failed: ${summary.errorCount} Error${summary.errorCount > 1 ? 's' : ''} Detected`
                  : `Import Review: ${summary.warningCount} Quality Recommendation${summary.warningCount > 1 ? 's' : ''}`}
              </h2>
              <p className="text-xs text-slate-400">File: {fileName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Status Notice Banner */}
        <div
          className={`px-5 py-3 text-xs font-medium border-b ${
            hasErrors
              ? 'bg-red-950/40 border-red-900/50 text-red-200'
              : 'bg-amber-950/40 border-amber-900/50 text-amber-200'
          }`}
        >
          {hasErrors ? (
            <p>
              <strong>Fail-closed protection:</strong> Your current workspace has <em>not</em> been
              modified. Resolve the blocking schema errors below and try again.
            </p>
          ) : (
            <p>
              The uploaded file is valid and safe to import. You can proceed with the import or cancel
              to review recommendations offline.
            </p>
          )}
        </div>

        {/* Table of Issues */}
        <div className="flex-1 overflow-y-auto p-5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="pb-2 font-semibold">Section</th>
                <th className="pb-2 font-semibold">Item / ID</th>
                <th className="pb-2 font-semibold">Field</th>
                <th className="pb-2 font-semibold">Problem</th>
                <th className="pb-2 font-semibold">Required Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 font-semibold text-cyan-300 uppercase tracking-wide text-[11px]">
                    {issue.section}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                    {issue.itemId || '—'}
                  </td>
                  <td className="py-2.5 font-mono text-amber-300/90 text-[11px]">
                    {issue.field || '—'}
                  </td>
                  <td className="py-2.5 pr-2 font-medium text-slate-200">
                    {issue.message}
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {issue.remediation || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 p-4 bg-slate-900/60">
          <button
            type="button"
            onClick={handleDownloadLog}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <span>📥 Download Error Log (.txt)</span>
          </button>

          <div className="flex items-center gap-2">
            {hasErrors ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Close & Return to Editor
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  Cancel
                </button>
                {onConfirmImport && (
                  <button
                    type="button"
                    onClick={onConfirmImport}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    Proceed with Import
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
