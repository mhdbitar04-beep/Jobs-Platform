import { z } from 'zod'
import { emptyToNull } from '@/lib/format'
import type { Job, JobPayload } from '@/types'

export const MAX_JOB_SKILLS = 12
const MAX_SALARY = 1_000_000

/** Salaries stay strings in the form (an empty box means "not set") and become numbers in the payload. */
const salaryField = z
  .string()
  .trim()
  .regex(/^\d*$/, 'Use whole numbers only.')
  .refine((value) => Number(value) <= MAX_SALARY, 'The maximum is 1,000,000.')

export const jobFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Enter a job title.').max(150),
    category_id: z.string().min(1, 'Choose a category.'),
    description: z.string().trim().min(30, 'Write at least 30 characters.').max(8000),
    requirements: z.string().max(5000),
    location: z.string().trim().min(1, 'Enter a location.').max(150),
    type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
    work_mode: z.enum(['onsite', 'remote', 'hybrid']),
    experience_level: z.enum(['junior', 'mid', 'senior', 'lead']),
    salary_min: salaryField,
    salary_max: salaryField,
    skills: z.array(z.string()).max(MAX_JOB_SKILLS),
    deadline: z.string(),
    status: z.enum(['open', 'closed']),
  })
  .refine((values) => !values.salary_min || !values.salary_max || Number(values.salary_max) >= Number(values.salary_min), {
    path: ['salary_max'],
    message: 'The maximum cannot be lower than the minimum.',
  })

export type JobFormValues = z.infer<typeof jobFormSchema>

export const JOB_FORM_FIELDS = [
  'title',
  'category_id',
  'description',
  'requirements',
  'location',
  'type',
  'work_mode',
  'experience_level',
  'salary_min',
  'salary_max',
  'skills',
  'deadline',
  'status',
] as const

export const EMPTY_JOB_VALUES: JobFormValues = {
  title: '',
  category_id: '',
  description: '',
  requirements: '',
  location: '',
  type: 'full_time',
  work_mode: 'onsite',
  experience_level: 'junior',
  salary_min: '',
  salary_max: '',
  skills: [],
  deadline: '',
  status: 'open',
}

export function toJobFormValues(job: Job): JobFormValues {
  return {
    title: job.title,
    category_id: String(job.category.id),
    description: job.description,
    requirements: job.requirements ?? '',
    location: job.location,
    type: job.type,
    work_mode: job.work_mode,
    experience_level: job.experience_level,
    salary_min: job.salary_min?.toString() ?? '',
    salary_max: job.salary_max?.toString() ?? '',
    skills: job.skills,
    deadline: job.deadline ?? '',
    status: job.status,
  }
}

export function toJobPayload(values: JobFormValues): JobPayload {
  return {
    ...values,
    category_id: Number(values.category_id),
    requirements: emptyToNull(values.requirements),
    salary_min: values.salary_min === '' ? null : Number(values.salary_min),
    salary_max: values.salary_max === '' ? null : Number(values.salary_max),
    deadline: emptyToNull(values.deadline),
  }
}
