import { http } from '@/lib/http'
import type { AdminStats, Category, DataResponse, Job, JobStatus, Paginated, Role, User } from '@/types'

export interface AdminUserParams {
  search?: string
  role?: Role
  page: number
}

export interface AdminJobParams {
  search?: string
  status?: JobStatus
  page: number
}

export const adminApi = {
  stats: () => http.get<DataResponse<AdminStats>>('/admin/stats').then((res) => res.data.data),
  users: (params: AdminUserParams) => http.get<Paginated<User>>('/admin/users', { params }).then((res) => res.data),
  setUserActive: (id: number, isActive: boolean) =>
    http.patch<DataResponse<User>>(`/admin/users/${id}`, { is_active: isActive }).then((res) => res.data.data),
  deleteUser: (id: number) => http.delete<void>(`/admin/users/${id}`),
  jobs: (params: AdminJobParams) => http.get<Paginated<Job>>('/admin/jobs', { params }).then((res) => res.data),
  setJobStatus: (id: number, status: JobStatus) =>
    http.patch<DataResponse<Job>>(`/admin/jobs/${id}`, { status }).then((res) => res.data.data),
  deleteJob: (id: number) => http.delete<void>(`/admin/jobs/${id}`),
  createCategory: (name: string) =>
    http.post<DataResponse<Category>>('/admin/categories', { name }).then((res) => res.data.data),
  renameCategory: (id: number, name: string) =>
    http.put<DataResponse<Category>>(`/admin/categories/${id}`, { name }).then((res) => res.data.data),
  deleteCategory: (id: number) => http.delete<void>(`/admin/categories/${id}`),
}
