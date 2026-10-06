import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/format'
import type { Option } from '@/lib/options'
import { Field } from './Field'
import { controlStyles, describedBy } from './fieldStyles'

interface SelectProps extends ComponentProps<'select'> {
  label: string
  options: Option[]
  /** Text of an empty first option, e.g. "Any type". */
  placeholder?: string
  error?: string
  hint?: string
  wrapperClassName?: string
}

export function Select({ label, options, placeholder, error, hint, wrapperClassName, className, id, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <Field id={selectId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <select id={selectId} className={cn(controlStyles, 'h-10 pr-8', className)} {...describedBy(selectId, error, hint)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
