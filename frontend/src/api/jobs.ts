import { http } from '@/lib/http'
import type { Category, DataResponse, Job, JobFilters, Paginated, PublicStats } from '@/types'

export interface JobDetail {
  data: Job
  related: Job[]
}

export const jobsApi = {
  stats: () => http.get<DataResponse<PublicStats>>('/stats').then((res) => res.data.data),
  categories: () => http.get<DataResponse<Category[]>>('/categories').then((res) => res.data.data),
  list: (filters: JobFilters) => http.get<Paginated<Job>>('/jobs', { params: filters }).then((res) => res.data),
  get: (id: number) => http.get<JobDetail>(`/jobs/${id}`).then((res) => res.data),
  toggleSave: (id: number) => http.post<{ saved: boolean }>(`/jobs/${id}/save`).then((res) => res.data),
  saved: () => http.get<DataResponse<Job[]>>('/my/saved-jobs').then((res) => res.data.data),
}
