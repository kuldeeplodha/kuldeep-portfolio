import { useState } from 'react'

interface TagsInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

// Simple chip-style tag entry: type a value, press Enter or "," to commit it.
// No new dependency — matches the zero-dependency precedent (ADR-005).
export function TagsInput({ label, value, onChange, placeholder }: TagsInputProps) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  return (
    <div>
      <span className="mb-1 block text-sm text-slate-400">{label}</span>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-600 bg-slate-800/50 p-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-slate-700/70 px-2 py-1 text-xs text-slate-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="text-slate-400 hover:text-red-400 focus:outline-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          placeholder={placeholder ?? 'Add and press Enter'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              commit()
            } else if (e.key === 'Backspace' && !draft && value.length > 0) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={commit}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </div>
    </div>
  )
}
