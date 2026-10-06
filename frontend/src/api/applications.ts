import { http } from '@/lib/http'
import type { Application, DataResponse } from '@/types'

export interface ApplyInput {
  jobId: number
  coverLetter: string
  resume: File | null
}

export const applicationsApi = {
  apply: ({ jobId, coverLetter, resume }: ApplyInput) => {
    const form = new FormData()
    if (coverLetter.trim()) form.append('cover_letter', coverLetter.trim())
    if (resume) form.append('resume', resume)
    return http.post<DataResponse<Application>>(`/jobs/${jobId}/apply`, form).then((res) => res.data.data)
  },
  mine: () => http.get<DataResponse<Application[]>>('/my/applications').then((res) => res.data.data),
  withdraw: (id: number) => http.delete<void>(`/my/applications/${id}`),
  resume: (id: number) => http.get<Blob>(`/applications/${id}/resume`, { responseType: 'blob' }),
}
