import type { ValidationIssue } from '../../lib/config/validationRegistry'

interface FieldFeedbackProps {
  issue?: ValidationIssue
  fieldId?: string
  id?: string
}

export function FieldFeedback({ issue, fieldId, id }: FieldFeedbackProps) {
  if (!issue) return null

  const resolvedId = id || (fieldId ? `${fieldId}-${issue.severity}` : undefined)

  if (issue.severity === 'error') {
    return (
      <div
        id={resolvedId}
        className="mt-1.5 flex flex-col gap-0.5 text-xs text-red-400 font-medium"
        role="alert"
      >
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true">⚠️</span>
          <span>{issue.message}</span>
        </div>
        {issue.remediation && (
          <p className="pl-5 text-[11px] text-red-300/80">{issue.remediation}</p>
        )}
      </div>
    )
  }

  return (
    <div
      id={resolvedId}
      className="mt-1.5 flex flex-col gap-0.5 text-xs text-amber-300 font-medium"
      role="status"
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true">ℹ️</span>
        <span>{issue.message}</span>
      </div>
      {issue.remediation && (
        <p className="pl-5 text-[11px] text-amber-200/80">{issue.remediation}</p>
      )}
    </div>
  )
}
