import { X } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'
import { Field } from './Field'

interface TagInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  max: number
  placeholder?: string
  error?: string
}

/** Type a tag and press Enter or comma to add it; Backspace on an empty box removes the last one. */
export function TagInput({ label, value, onChange, max, placeholder, error }: TagInputProps) {
  const id = useId()
  const [draft, setDraft] = useState('')
  const isFull = value.length >= max

  const addDraft = () => {
    const tag = draft.trim().replace(/,+$/, '')
    const isDuplicate = value.some((existing) => existing.toLowerCase() === tag.toLowerCase())
    if (tag && !isDuplicate && !isFull) onChange([...value, tag])
    setDraft('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addDraft()
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <Field id={id} label={label} error={error} hint={`Press Enter or comma to add. Up to ${max}.`}>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-ink-300 bg-white px-2 py-1.5 focus-within:border-brand-500 focus-within:outline-2 focus-within:outline-brand-500/30">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded bg-brand-50 py-0.5 pr-1 pl-2 text-sm font-medium text-brand-800">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((existing) => existing !== tag))}
              className="rounded p-0.5 text-brand-600 hover:bg-brand-100"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          maxLength={40}
          disabled={isFull}
          placeholder={value.length === 0 ? placeholder : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addDraft}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          className="min-w-28 flex-1 bg-transparent px-1 py-0.5 text-sm text-ink-900 outline-none placeholder:text-ink-400"
        />
      </div>
    </Field>
  )
}
