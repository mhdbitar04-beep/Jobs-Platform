import { http } from '@/lib/http'
import type { AppStatus, Application, CompanyDashboard, DataResponse, Job, JobPayload } from '@/types'

export interface JobApplications {
  data: Application[]
  job: Job
}

export const companyApi = {
  dashboard: () => http.get<DataResponse<CompanyDashboard>>('/company/dashboard').then((res) => res.data.data),
  jobs: () => http.get<DataResponse<Job[]>>('/company/jobs').then((res) => res.data.data),
  job: (id: number) => http.get<DataResponse<Job>>(`/company/jobs/${id}`).then((res) => res.data.data),
  createJob: (payload: JobPayload) =>
    http.post<DataResponse<Job>>('/company/jobs', payload).then((res) => res.data.data),
  updateJob: (id: number, payload: JobPayload) =>
    http.put<DataResponse<Job>>(`/company/jobs/${id}`, payload).then((res) => res.data.data),
  deleteJob: (id: number) => http.delete<void>(`/company/jobs/${id}`),
  jobApplications: (jobId: number) =>
    http.get<JobApplications>(`/company/jobs/${jobId}/applications`).then((res) => res.data),
  applications: () => http.get<DataResponse<Application[]>>('/company/applications').then((res) => res.data.data),
  setApplicationStatus: (id: number, status: AppStatus) =>
    http.patch<DataResponse<Application>>(`/company/applications/${id}`, { status }).then((res) => res.data.data),
}
