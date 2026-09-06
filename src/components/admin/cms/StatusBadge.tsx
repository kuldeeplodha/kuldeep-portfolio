import type { ContentStatus } from '../../../lib/admin/cms'

const STYLES: Record<ContentStatus, string> = {
  draft: 'bg-slate-700/60 text-slate-300 border-slate-600',
  published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  archived: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[status]}`}
    >
      {status}
    </span>
  )
}
