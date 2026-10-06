import type { AppStatus, JobSort, JobStatus, JobType, Level, Role, WorkMode } from '@/types'

export interface Option<T extends string = string> {
  value: T
  label: string
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
}

export const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead',
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: 'Open',
  closed: 'Closed',
}

export const APP_STATUS_LABELS: Record<AppStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  accepted: 'Accepted',
}

export const ROLE_LABELS: Record<Role, string> = {
  seeker: 'Job seeker',
  company: 'Company',
  admin: 'Admin',
}

export const SORT_LABELS: Record<JobSort, string> = {
  latest: 'Newest first',
  salary: 'Highest salary',
}

export const APP_STATUSES = Object.keys(APP_STATUS_LABELS) as AppStatus[]

function toOptions<T extends string>(labels: Record<T, string>): Option<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }))
}

export const JOB_TYPE_OPTIONS = toOptions(JOB_TYPE_LABELS)
export const WORK_MODE_OPTIONS = toOptions(WORK_MODE_LABELS)
export const LEVEL_OPTIONS = toOptions(LEVEL_LABELS)
export const JOB_STATUS_OPTIONS = toOptions(JOB_STATUS_LABELS)
export const APP_STATUS_OPTIONS = toOptions(APP_STATUS_LABELS)
export const SORT_OPTIONS = toOptions(SORT_LABELS)
export const ROLE_OPTIONS = toOptions(ROLE_LABELS)

export const COMPANY_SIZE_OPTIONS: Option[] = ['1-10', '11-50', '51-200', '201-500', '500+'].map((size) => ({
  value: size,
  label: `${size} people`,
}))

/** Narrows an untrusted string (a URL parameter, for example) to one of the allowed option values. */
export function pickOption<T extends string>(options: Option<T>[], value: string | null): T | undefined {
  return options.find((option) => option.value === value)?.value
}
