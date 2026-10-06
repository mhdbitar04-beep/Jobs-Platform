import type { Job, JobPayload, JobStatus } from '@/types'

/** The API updates a job with a full PUT, so changing one thing means sending everything back. */
export function jobToPayload(job: Job, overrides: { status?: JobStatus } = {}): JobPayload {
  return {
    title: job.title,
    category_id: job.category.id,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    type: job.type,
    work_mode: job.work_mode,
    experience_level: job.experience_level,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    skills: job.skills,
    deadline: job.deadline,
    status: overrides.status ?? job.status,
  }
}
