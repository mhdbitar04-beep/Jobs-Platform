import { http } from '@/lib/http'
import type { DataResponse, ProfilePayload, User } from '@/types'

export interface PasswordInput {
  current_password: string
  password: string
  password_confirmation: string
}

export const profileApi = {
  update: (payload: ProfilePayload) => http.put<DataResponse<User>>('/profile', payload).then((res) => res.data.data),
  uploadResume: (file: File) => {
    const form = new FormData()
    form.append('resume', file)
    return http.post<DataResponse<User>>('/profile/resume', form).then((res) => res.data.data)
  },
  changePassword: (input: PasswordInput) => http.put<void>('/profile/password', input),
}
