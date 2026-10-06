import { http } from '@/lib/http'
import type { AuthResponse, DataResponse, Role, User } from '@/types'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: Exclude<Role, 'admin'>
  company_name?: string
}

export const authApi = {
  login: (input: LoginInput) => http.post<AuthResponse>('/auth/login', input).then((res) => res.data),
  register: (input: RegisterInput) => http.post<AuthResponse>('/auth/register', input).then((res) => res.data),
  logout: () => http.post<void>('/auth/logout'),
  me: () => http.get<DataResponse<User>>('/auth/me').then((res) => res.data.data),
}
