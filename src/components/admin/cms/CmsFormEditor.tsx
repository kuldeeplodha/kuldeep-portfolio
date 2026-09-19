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
  
  // Handlers for root-level array (value is array)
  const handleRootArrayChange = (index: number, field: string, val: any) => {
    const arr = [...value]
    arr[index] = { ...arr[index], [field]: val }
    onChange(arr)
  }
  
  const handleRootArrayStringListChange = (index: number, field: string, stringIndex: number, val: string) => {
    const arr = [...value]
    const stringArr = [...(arr[index][field] || [])]
    stringArr[stringIndex] = val
    arr[index] = { ...arr[index], [field]: stringArr }
    onChange(arr)
  }

  const handleRootArrayStringListAdd = (index: number, field: string) => {
    const arr = [...value]
    const stringArr = [...(arr[index][field] || [])]
    stringArr.push('')
    arr[index] = { ...arr[index], [field]: stringArr }
    onChange(arr)
  }

  const handleRootArrayStringListRemove = (index: number, field: string, stringIndex: number) => {
    const arr = [...value]
    const stringArr = [...(arr[index][field] || [])]
    stringArr.splice(stringIndex, 1)
    arr[index] = { ...arr[index], [field]: stringArr }
    onChange(arr)
  }

  const handleRootArrayStringListMove = (index: number, field: string, stringIndex: number, direction: 'up' | 'down') => {
    const arr = [...value]
    const stringArr = [...(arr[index][field] || [])]
    if (direction === 'up' && stringIndex > 0) {
      const temp = stringArr[stringIndex - 1]
      stringArr[stringIndex - 1] = stringArr[stringIndex]
      stringArr[stringIndex] = temp
    } else if (direction === 'down' && stringIndex < stringArr.length - 1) {
      const temp = stringArr[stringIndex + 1]
      stringArr[stringIndex + 1] = stringArr[stringIndex]
      stringArr[stringIndex] = temp
    }
    arr[index] = { ...arr[index], [field]: stringArr }
    onChange(arr)
  }

  const handleRootArrayAdd = (defaultItem: any) => {
    const arr = [...(value || [])]
    arr.push(defaultItem)
    onChange(arr)
  }

  const handleRootArrayRemove = (index: number) => {
    const arr = [...value]
    arr.splice(index, 1)
    onChange(arr)
  }

  const handleRootArrayMove = (index: number, direction: 'up' | 'down') => {
    const arr = [...value]
    if (direction === 'up' && index > 0) {
      const temp = arr[index - 1]
      arr[index - 1] = arr[index]
      arr[index] = temp
    } else if (direction === 'down' && index < arr.length - 1) {
      const temp = arr[index + 1]
      arr[index + 1] = arr[index]
      arr[index] = temp
    }
    onChange(arr)
  }

  // Handlers for string arrays inside objects
  const handleStringArrayChange = (field: string, index: number, val: string) => {
    const arr = [...(value[field] || [])]
    arr[index] = val
    onChange({ ...value, [field]: arr })
  }
  
  const handleStringArrayAdd = (field: string) => {
    const arr = [...(value[field] || [])]
    arr.push('')
    onChange({ ...value, [field]: arr })
  }
  
  const handleStringArrayRemove = (field: string, index: number) => {
    const arr = [...(value[field] || [])]
    arr.splice(index, 1)
    onChange({ ...value, [field]: arr })
  }

  const handleStringArrayMove = (field: string, index: number, direction: 'up' | 'down') => {
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

  // Helper for simple text fields
  const renderTextInput = (label: string, val: any, changeFn: (val: string) => void, isTextArea = false) => (
    <label key={label} className="block mb-4">
      <span className="mb-1 block text-xs text-slate-400 capitalize">{label}</span>
      {isTextArea ? (
        <textarea
          value={val || ''}
          onChange={(e) => changeFn(e.target.value)}
          rows={3}
          className={adminInputClass}
        />
      ) : (
        <input
          type="text"
          value={val || ''}
          onChange={(e) => changeFn(e.target.value)}
          className={adminInputClass}
        />
      )}
    </label>
  )

  const renderStringList = (label: string, items: string[], changeFn: (idx: number, val: string) => void, addFn: () => void, removeFn: (idx: number) => void, moveFn: (idx: number, dir: 'up'|'down') => void) => (
    <div className="mb-4">
      <span className="mb-1 block text-xs text-slate-400 capitalize">{label}</span>
      <div className="space-y-2">
        {items?.map((str, idx) => (
          <div key={idx} className="flex items-center gap-2 group relative">
            <input type="text" value={str} onChange={(e) => changeFn(idx, e.target.value)} className={adminInputClass} aria-label={`Item ${idx + 1} for ${label}`} />
            <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button type="button" onClick={() => moveFn(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move up">↑</button>
              <button type="button" onClick={() => moveFn(idx, 'down')} disabled={idx === items.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move down">↓</button>
              <button type="button" onClick={() => removeFn(idx)} className="p-1 text-red-400 hover:text-red-300" aria-label="Remove item">×</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addFn} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">+ Add {label}</button>
    </div>
  )

  switch (sectionKey) {
    // FLAT OBJECTS
    case 'contact':
    case 'footer':
      return (
        <div className="space-y-2">
          {Object.keys(value).map((key) => 
            renderTextInput(key, value[key], (v) => handleChange(key, v), key === 'description')
          )}
        </div>
      )
      
    // FLAT OBJECT + NESTED OBJECT
    case 'profile':
      return (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {['name', 'navDisplayName', 'title', 'location', 'email', 'phone'].map(k => (
              renderTextInput(k, value[k], (v) => handleChange(k, v))
            ))}
          </div>
          {renderTextInput('summary', value.summary, (v) => handleChange('summary', v), true)}
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-4">
            <input type="checkbox" checked={value.showPhone} onChange={(e) => handleChange('showPhone', e.target.checked)} className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500" />
            Show Phone Publicly
          </label>
          <div className="p-4 border border-slate-700 rounded-lg">
            <h4 className="mb-3 text-sm font-semibold text-slate-300">Links</h4>
            {renderTextInput('linkedin', value.links?.linkedin, (v) => handleChange('links', { ...value.links, linkedin: v }))}
            {renderTextInput('github', value.links?.github, (v) => handleChange('links', { ...value.links, github: v }))}
          </div>
        </div>
      )
      
    // FLAT OBJECT + ARRAY OF STRINGS
    case 'ask-kuldeep':
      return (
        <div className="space-y-4">
          {renderTextInput('title', value.title, (v) => handleChange('title', v))}
          {renderTextInput('description', value.description, (v) => handleChange('description', v), true)}
          {renderTextInput('responseHeading', value.responseHeading, (v) => handleChange('responseHeading', v))}
          {renderStringList('suggestedQuestions', value.suggestedQuestions || [], (idx, val) => handleStringArrayChange('suggestedQuestions', idx, val), () => handleStringArrayAdd('suggestedQuestions'), (idx) => handleStringArrayRemove('suggestedQuestions', idx), (idx, dir) => handleStringArrayMove('suggestedQuestions', idx, dir))}
        </div>
      )

    // ARRAY OF FLAT OBJECTS
    case 'engineering-signal':
    case 'career-journey':
    case 'resumes': {
      const keys = sectionKey === 'engineering-signal' ? ['title', 'description'] : 
                   sectionKey === 'career-journey' ? ['period', 'title', 'description'] : 
                   ['variant', 'label', 'filename', 'path']
                   
      return (
        <div className="space-y-6">
          {(value || []).map((item: any, idx: number) => (
            <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 relative group">
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button type="button" onClick={() => handleRootArrayMove(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move up">↑</button>
                <button type="button" onClick={() => handleRootArrayMove(idx, 'down')} disabled={idx === value.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move down">↓</button>
                <button type="button" onClick={() => handleRootArrayRemove(idx)} className="p-1 text-red-400 hover:text-red-300" aria-label="Remove item">×</button>
              </div>
              <div className="mt-2 space-y-2">
                {keys.map(k => renderTextInput(k, item[k], (v) => handleRootArrayChange(idx, k, v), k === 'description'))}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => handleRootArrayAdd(keys.reduce((acc, k) => ({ ...acc, [k]: '' }), {}))} className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300">
            + Add Item
          </button>
        </div>
      )
    }

    // OBJECT CONTAINING ARRAY OF FLAT OBJECTS
    case 'impact-metrics':
    case 'currently-exploring':
    case 'philosophy': {
      const itemKeys = sectionKey === 'impact-metrics' ? ['metric', 'label', 'context'] : ['title', 'description']
      return (
        <div className="space-y-6">
          {renderTextInput('title', value.title, (v) => handleChange('title', v))}
          {value.description !== undefined && renderTextInput('description', value.description, (v) => handleChange('description', v), true)}
          
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-300">Items</h4>
            <div className="space-y-4">
              {(value.items || []).map((item: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 relative group">
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button type="button" onClick={() => handleMoveArrayItem('items', idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move up">↑</button>
                    <button type="button" onClick={() => handleMoveArrayItem('items', idx, 'down')} disabled={idx === (value.items?.length || 0) - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move down">↓</button>
                    <button type="button" onClick={() => handleRemoveArrayItem('items', idx)} className="p-1 text-red-400 hover:text-red-300" aria-label="Remove item">×</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {itemKeys.map(k => renderTextInput(k, item[k], (v) => handleArrayChange('items', idx, k, v), k === 'description'))}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => handleAddArrayItem('items', itemKeys.reduce((acc, k) => ({ ...acc, [k]: '' }), {}))} className="mt-4 inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300">
              + Add Item
            </button>
          </div>
        </div>
      )
    }

    // ARRAY OF OBJECTS WITH STRING ARRAYS
    case 'ai-knowledge':
    case 'education': {
      const keys = sectionKey === 'ai-knowledge' ? ['id', 'answer', 'source'] : ['id', 'degree', 'institution', 'period', 'location', 'gpa', 'research']
      const stringArrayKeys = sectionKey === 'ai-knowledge' ? ['questionPatterns', 'tags'] : ['focus']
      
      return (
        <div className="space-y-6">
          {(value || []).map((item: any, idx: number) => (
            <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 relative group">
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button type="button" onClick={() => handleRootArrayMove(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move up">↑</button>
                <button type="button" onClick={() => handleRootArrayMove(idx, 'down')} disabled={idx === value.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move down">↓</button>
                <button type="button" onClick={() => handleRootArrayRemove(idx)} className="p-1 text-red-400 hover:text-red-300" aria-label="Remove item">×</button>
              </div>
              <div className="mt-2 grid md:grid-cols-2 gap-4">
                {keys.map(k => (
                  <div key={k} className={k === 'answer' || k === 'research' ? 'md:col-span-2' : ''}>
                    {renderTextInput(k, item[k], (v) => handleRootArrayChange(idx, k, v), k === 'answer' || k === 'research')}
                  </div>
                ))}
                {stringArrayKeys.map(k => (
                  <div key={k} className="md:col-span-2 p-3 bg-slate-900/50 rounded border border-slate-700">
                    {renderStringList(k, item[k] || [], (strIdx, val) => handleRootArrayStringListChange(idx, k, strIdx, val), () => handleRootArrayStringListAdd(idx, k), (strIdx) => handleRootArrayStringListRemove(idx, k, strIdx), (strIdx, dir) => handleRootArrayStringListMove(idx, k, strIdx, dir))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => handleRootArrayAdd({ id: 'new-entry' })} className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300">
            + Add Entry
          </button>
        </div>
      )
    }

    default:
      return null
  }
}
