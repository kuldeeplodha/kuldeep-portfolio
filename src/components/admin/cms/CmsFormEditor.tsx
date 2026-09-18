import { adminInputClass } from '../AdminLayout'

export interface CmsFormEditorProps {
  sectionKey: string
  value: any
  onChange: (newValue: any) => void
}

export function CmsFormEditor({ sectionKey, value, onChange }: CmsFormEditorProps) {
  if (!value) return <p className="text-sm text-slate-400">Loading or empty data...</p>

  const handleChange = (field: string, val: any) => {
    onChange({ ...value, [field]: val })
  }

  const handleArrayChange = (field: string, index: number, itemField: string, itemVal: any) => {
    const arr = [...(value[field] || [])]
    arr[index] = { ...arr[index], [itemField]: itemVal }
    onChange({ ...value, [field]: arr })
  }

  const handleAddArrayItem = (field: string, defaultItem: any) => {
    const arr = [...(value[field] || [])]
    arr.push(defaultItem)
    onChange({ ...value, [field]: arr })
  }

  const handleRemoveArrayItem = (field: string, index: number) => {
    const arr = [...(value[field] || [])]
    arr.splice(index, 1)
    onChange({ ...value, [field]: arr })
  }

  const handleMoveArrayItem = (field: string, index: number, direction: 'up' | 'down') => {
    const arr = [...(value[field] || [])]
    if (direction === 'up' && index > 0) {
      const temp = arr[index - 1]
      arr[index - 1] = arr[index]
      arr[index] = temp
    } else if (direction === 'down' && index < arr.length - 1) {
      const temp = arr[index + 1]
      arr[index + 1] = arr[index]
      arr[index] = temp
    }
    onChange({ ...value, [field]: arr })
  }

  switch (sectionKey) {
    case 'contact':
    case 'footer':
      return (
        <div className="space-y-4">
          {Object.keys(value).map((key) => (
             <label key={key} className="block">
                <span className="mb-1 block text-sm font-medium text-slate-400 capitalize">{key}</span>
                {typeof value[key] === 'string' && value[key].length > 60 ? (
                  <textarea
                    value={value[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    rows={3}
                    className={adminInputClass}
                  />
                ) : (
                  <input
                    type="text"
                    value={value[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className={adminInputClass}
                  />
                )}
             </label>
          ))}
        </div>
      )
    case 'impact-metrics':
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-400">Title</span>
              <input
                type="text"
                value={value.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className={adminInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-400">Description</span>
              <textarea
                value={value.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className={adminInputClass}
              />
            </label>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-300">Metrics (Items)</h4>
            <div className="space-y-4">
              {(value.items || []).map((item: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 relative group">
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleMoveArrayItem('items', idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      aria-label="Move item up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveArrayItem('items', idx, 'down')}
                      disabled={idx === (value.items?.length || 0) - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      aria-label="Move item down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem('items', idx)}
                      className="p-1 text-red-400 hover:text-red-300"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mt-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">Metric (e.g. 60%+)</span>
                      <input
                        type="text"
                        value={item.metric || ''}
                        onChange={(e) => handleArrayChange('items', idx, 'metric', e.target.value)}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">Label</span>
                      <input
                        type="text"
                        value={item.label || ''}
                        onChange={(e) => handleArrayChange('items', idx, 'label', e.target.value)}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs text-slate-400">Context</span>
                      <input
                        type="text"
                        value={item.context || ''}
                        onChange={(e) => handleArrayChange('items', idx, 'context', e.target.value)}
                        className={adminInputClass}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddArrayItem('items', { metric: '', label: '', context: '' })}
              className="mt-4 inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-sm"
            >
              + Add Metric
            </button>
          </div>
        </div>
      )
    default:
      return (
        <div className="p-4 border border-slate-700 bg-slate-800/40 rounded-lg">
          <p className="text-sm text-slate-300">
            A form editor for <strong>{sectionKey}</strong> has not been implemented yet. Please use the Raw JSON tab.
          </p>
        </div>
      )
  }
}
