import { useMutation } from '@tanstack/react-query'
import { applicationsApi } from '@/api/applications'
import { useToast } from '@/context/toast-context'

const EXTENSION_BY_TYPE: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

interface DownloadInput {
  applicationId: number
  /** Used to name the file when the server's own file name is not readable. */
  applicantName: string
}

function fileNameFromHeader(header: unknown): string | null {
  if (typeof header !== 'string') return null
  return /filename="?([^";]+)"?/i.exec(header)?.[1] ?? null
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

/** Resumes are private files, so they are fetched with the auth header and then saved from memory. */
export function useResumeDownload() {
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ applicationId, applicantName }: DownloadInput) => {
      const response = await applicationsApi.resume(applicationId)
      const extension = EXTENSION_BY_TYPE[response.data.type] ?? 'pdf'
      const fallbackName = `${applicantName.trim().replace(/\s+/g, '-').toLowerCase()}-resume.${extension}`
      saveBlob(response.data, fileNameFromHeader(response.headers['content-disposition']) ?? fallbackName)
    },
    onError: () => toast.error('The resume could not be downloaded. The file may no longer exist.'),
  })
}
