import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/format'
import { Field } from './Field'
import { controlStyles, describedBy } from './fieldStyles'

interface TextareaProps extends ComponentProps<'textarea'> {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  wrapperClassName?: string
}

export function Textarea({ label, error, hint, optional, wrapperClassName, className, id, rows = 4, ...props }: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  return (
    <Field id={textareaId} label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(controlStyles, 'py-2 leading-relaxed', className)}
        {...describedBy(textareaId, error, hint)}
        {...props}
      />
    </Field>
  )
}
