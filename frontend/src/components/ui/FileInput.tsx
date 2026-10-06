import { Paperclip, X } from 'lucide-react'
import { useId, useRef } from 'react'
import { Field } from './Field'

interface FileInputProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  accept: string
  hint?: string
  error?: string
  optional?: boolean
}

export function FileInput({ label, file, onChange, accept, hint, error, optional }: FileInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const clear = () => {
    if (inputRef.current) inputRef.current.value = ''
    onChange(null)
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="block w-full cursor-pointer rounded-md border border-ink-300 bg-white text-sm text-ink-600 file:mr-3 file:cursor-pointer file:border-0 file:border-r file:border-ink-300 file:bg-ink-50 file:px-3 file:py-2.5 file:text-sm file:font-semibold file:text-ink-800 hover:file:bg-ink-100"
        />
        {file && (
          <button type="button" onClick={clear} className="rounded-md p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800" aria-label="Remove file">
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      {file && (
        <p className="flex items-center gap-1.5 text-xs text-ink-600">
          <Paperclip className="size-3.5" aria-hidden />
          {file.name} ({Math.max(1, Math.round(file.size / 1024))} KB)
        </p>
      )}
    </Field>
  )
}
