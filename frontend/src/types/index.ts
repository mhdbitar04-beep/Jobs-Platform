export type Role = 'seeker' | 'company' | 'admin'
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship'
export type WorkMode = 'onsite' | 'remote' | 'hybrid'
export type Level = 'junior' | 'mid' | 'senior' | 'lead'
export type JobStatus = 'open' | 'closed'
export type AppStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'
export type JobSort = 'latest' | 'salary'

export interface Company {
  id: number
  name: string
  website: string | null
  location: string | null
  industry: string | null
  size: string | null
  description: string | null
  open_jobs_count?: number
}

export interface User {
  id: number
  name: string
  email: string
  role: Role
  is_active: boolean
  phone: string | null
  location: string | null
  headline: string | null
  bio: string | null
  skills: string[]
  has_resume: boolean
  company: Company | null
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  jobs_count: number
}

export interface Job {
  id: number
  title: string
  description: string
  requirements: string | null
  location: string
  type: JobType
  work_mode: WorkMode
  experience_level: Level
  salary_min: number | null
  salary_max: number | null
  currency: string
  skills: string[]
  status: JobStatus
  deadline: string | null
  created_at: string
  category: Pick<Category, 'id' | 'name' | 'slug'>
  company: Company
  applications_count?: number
  has_applied: boolean
  is_saved: boolean
}

export interface Applicant {
  id: number
  name: string
  email: string
  phone: string | null
  location: string | null
  headline: string | null
  bio: string | null
  skills: string[]
}

export interface Application {
  id: number
  status: AppStatus
  cover_letter: string | null
  has_resume: boolean
  created_at: string
  job: Job
  applicant?: Applicant
}

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  link: string
  read_at: string | null
  created_at: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface DataResponse<T> {
  data: T
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PublicStats {
  jobs: number
  companies: number
  seekers: number
  applications: number
}

export interface CompanyDashboard {
  jobs_total: number
  jobs_open: number
  applications_total: number
  applications_pending: number
  recent_applications: Application[]
}

export interface AdminStats {
  users: number
  seekers: number
  companies: number
  jobs: number
  open_jobs: number
  applications: number
  jobs_by_category: { name: string; count: number }[]
  applications_by_status: Record<AppStatus, number>
  recent_users: User[]
  recent_jobs: Job[]
}

export interface JobFilters {
  search?: string
  category?: string
  type?: JobType
  work_mode?: WorkMode
  experience_level?: Level
  location?: string
  sort?: JobSort
  page?: number
  per_page?: number
}

export interface JobPayload {
  title: string
  category_id: number
  description: string
  requirements: string | null
  location: string
  type: JobType
  work_mode: WorkMode
  experience_level: Level
  salary_min: number | null
  salary_max: number | null
  skills: string[]
  deadline: string | null
  status: JobStatus
}

export interface CompanyPayload {
  name: string
  website: string | null
  location: string | null
  industry: string | null
  size: string | null
  description: string | null
}

export interface ProfilePayload {
  name: string
  phone: string | null
  location: string | null
  headline: string | null
  bio: string | null
  skills: string[]
  company?: CompanyPayload
}
