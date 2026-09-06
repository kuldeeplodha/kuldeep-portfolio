import { useId, useState } from 'react'
import { adminInputClass } from '../AdminLayout'
import { uploadMedia, CmsApiError } from '../../../lib/admin/cms'

interface MediaUploadFieldProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  hint?: string
}

// Cloudinary signed upload: the backend signs (secret stays server-side, see
// backend/routers/media.py), the browser uploads directly to Cloudinary, and
// the returned secure_url is what gets embedded into the content.
export function MediaUploadField({ label, value, onChange, hint }: MediaUploadFieldProps) {
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm text-slate-400">
        {label}
      </label>
      {value && (
        <div className="flex items-center gap-3 rounded-[var(--radius-base)] border border-slate-700 bg-slate-800/40 p-2">
          <img src={value} alt="" className="h-16 w-16 rounded-[var(--radius-base)] object-cover" />
          <span className="truncate text-xs text-slate-400">{value}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-auto shrink-0 rounded-[var(--radius-base)] border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Remove
          </button>
        </div>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className={adminInputClass}
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          setUploading(true)
          setError(null)
          try {
            const url = await uploadMedia(file)
            onChange(url)
          } catch (err) {
            setError(err instanceof CmsApiError ? err.message : 'Upload failed.')
          } finally {
            setUploading(false)
          }
        }}
      />
      {uploading && (
        <p className="text-xs text-slate-400" role="status">
          Uploading…
        </p>
      )}
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {hint && !uploading && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
