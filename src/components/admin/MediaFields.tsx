import type { MediaAttachment } from '../../types'

const fieldClass =
  'w-full rounded-[var(--radius-base)] border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400'

interface ImageFieldProps {
  label: string
  value?: string
  onChange: (url: string) => void
  hint?: string
}

export function ImageField({ label, value, onChange, hint }: ImageFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-400">{label}</span>
      {hint && <p className="mb-2 text-xs text-slate-400">{hint}</p>}
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/project-screenshot.png"
        className={fieldClass}
      />
      {value && (
        <div className="mt-2 overflow-hidden rounded-[var(--radius-base)] border border-slate-600">
          <img src={value} alt="Preview" className="h-32 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
      )}
    </label>
  )
}

interface AttachmentsEditorProps {
  value?: MediaAttachment[]
  onChange: (attachments: MediaAttachment[]) => void
}

export function AttachmentsEditor({ value = [], onChange }: AttachmentsEditorProps) {
  const add = () => onChange([...value, { label: '', url: '' }])
  const update = (index: number, patch: Partial<MediaAttachment>) => {
    onChange(value.map((a, i) => (i === index ? { ...a, ...patch } : a)))
  }
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-300">Attachments</legend>
      <p className="mb-3 text-xs text-slate-400">
        Add links to PDFs, docs, or images (place files in <code className="text-cyan-400">public/</code>).
      </p>
      <div className="space-y-3">
        {value.map((att, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={att.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label"
              className={`${fieldClass} flex-1`}
            />
            <input
              type="text"
              value={att.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="/files/report.pdf"
              className={`${fieldClass} flex-[2]`}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove attachment ${att.label || i + 1}`}
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-base)] px-3 text-sm text-rose-400 hover:bg-rose-400/10 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 min-h-[44px] rounded-[var(--radius-base)] border border-dashed border-slate-600 px-4 py-2 text-xs text-slate-300 hover:border-cyan-400 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        + Add attachment
      </button>
    </fieldset>
  )
}
