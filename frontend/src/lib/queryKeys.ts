import type { JobFilters } from '@/types'

export const queryKeys = {
  me: ['me'] as const,
  stats: ['stats'] as const,
  categories: ['categories'] as const,
  jobs: ['jobs'] as const,
  jobList: (filters: JobFilters) => ['jobs', 'list', filters] as const,
  job: (id: number) => ['jobs', 'detail', id] as const,
  myApplications: ['my', 'applications'] as const,
  savedJobs: ['my', 'saved-jobs'] as const,
  notifications: ['notifications'] as const,
  company: ['company'] as const,
  companyDashboard: ['company', 'dashboard'] as const,
  companyJobs: ['company', 'jobs'] as const,
  companyJob: (id: number) => ['company', 'jobs', id] as const,
  companyJobApplications: (id: number) => ['company', 'jobs', id, 'applications'] as const,
  companyApplications: ['company', 'applications'] as const,
  admin: ['admin'] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: (params: object) => ['admin', 'users', params] as const,
  adminJobs: (params: object) => ['admin', 'jobs', params] as const,
}
