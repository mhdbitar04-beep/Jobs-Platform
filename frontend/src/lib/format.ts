import type { Job } from '@/types'

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const numberFormatter = new Intl.NumberFormat('en-US')
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const RELATIVE_STEPS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'year', seconds: 31_536_000 },
  { unit: 'month', seconds: 2_592_000 },
  { unit: 'week', seconds: 604_800 },
  { unit: 'day', seconds: 86_400 },
  { unit: 'hour', seconds: 3_600 },
  { unit: 'minute', seconds: 60 },
]

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value))
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** "3 hours ago", "yesterday", "2 weeks ago". */
export function formatRelative(value: string): string {
  const elapsed = (new Date(value).getTime() - Date.now()) / 1000
  const step = RELATIVE_STEPS.find(({ seconds }) => Math.abs(elapsed) >= seconds)
  if (!step) return 'just now'
  return relativeFormatter.format(Math.round(elapsed / step.seconds), step.unit)
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${formatNumber(amount)} ${currency}`
  }
}

export function formatSalary({ salary_min, salary_max, currency }: Pick<Job, 'salary_min' | 'salary_max' | 'currency'>): string | null {
  if (salary_min !== null && salary_max !== null) {
    return `${formatMoney(salary_min, currency)} – ${formatMoney(salary_max, currency)}`
  }
  if (salary_min !== null) return `From ${formatMoney(salary_min, currency)}`
  if (salary_max !== null) return `Up to ${formatMoney(salary_max, currency)}`
  return null
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? [words[0][0], words[words.length - 1][0]] : [name.trim().slice(0, 2)]
  return letters.join('').toUpperCase()
}

/** Empty or whitespace-only form text becomes null, which is how the API stores "not set". */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
