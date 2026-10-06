import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/format'
import { Field } from './Field'
import { controlStyles, describedBy } from './fieldStyles'

interface InputProps extends ComponentProps<'input'> {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  wrapperClassName?: string
}

export function Input({ label, error, hint, optional, wrapperClassName, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field id={inputId} label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      <input id={inputId} className={cn(controlStyles, 'h-10', className)} {...describedBy(inputId, error, hint)} {...props} />
    </Field>
  )
}
