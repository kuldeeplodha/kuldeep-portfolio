export interface EntityToolbarProps {
  sectionTitle: string
  itemName: string
  currentIndex: number
  totalCount: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  onAdd: () => void
}

export function EntityToolbar({
  sectionTitle,
  itemName,
  currentIndex,
  totalCount,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onAdd,
}: EntityToolbarProps) {
  const isFirst = currentIndex <= 0
  const isLast = currentIndex >= totalCount - 1
  const labelName = itemName || sectionTitle

  return (
    <div className="space-y-3 border-b border-slate-800 pb-4 pt-1">
      {/* Top Header Row: Counter & Add Button */}
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md bg-slate-800 px-2.5 py-1 font-mono text-xs font-medium text-slate-300">
          {totalCount > 0 ? `${currentIndex + 1} of ${totalCount}` : '0 items'}
        </span>

        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add new ${sectionTitle}`}
          className="flex shrink-0 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <span aria-hidden className="mr-1.5 font-bold">+</span>
          <span>Add {sectionTitle}</span>
        </button>
      </div>

      {/* Action Row: Reordering & Item Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
          <button
            type="button"
            disabled={isFirst || totalCount <= 1}
            onClick={onMoveUp}
            aria-label={`Move ${labelName} up`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <span aria-hidden className="mr-1">↑</span>
            <span>Up</span>
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <button
            type="button"
            disabled={isLast || totalCount <= 1}
            onClick={onMoveDown}
            aria-label={`Move ${labelName} down`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <span aria-hidden className="mr-1">↓</span>
            <span>Down</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onDuplicate}
          aria-label={`Duplicate ${labelName}`}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <span aria-hidden className="mr-1.5">⎘</span>
          <span>Duplicate</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${labelName}`}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-rose-800/60 bg-rose-950/40 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <span aria-hidden className="mr-1.5">🗑</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  )
}
