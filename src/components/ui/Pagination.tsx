interface PaginationProps {
  page: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, hasMore, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-[var(--radius-base)] border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)'
        }}
        aria-label="Previous page"
      >
        Previous
      </button>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
        Page {page} of {Math.max(totalPages, page + (hasMore ? 1 : 0))}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasMore && page >= totalPages}
        className="rounded-[var(--radius-base)] border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)'
        }}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}
