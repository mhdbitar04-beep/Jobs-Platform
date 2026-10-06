export const controlStyles =
  'w-full rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 ' +
  'focus:border-brand-500 focus:outline-2 focus:outline-offset-0 focus:outline-brand-500/30 ' +
  'disabled:bg-ink-100 disabled:text-ink-500 aria-invalid:border-red-500'

/** The aria attributes that tie a control to its Field messages. */
export function describedBy(id: string, error?: string, hint?: string) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  }
}
