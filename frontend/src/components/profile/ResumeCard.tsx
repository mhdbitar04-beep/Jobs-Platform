import { useMutation } from '@tanstack/react-query'
import { FileCheck2, FileWarning } from 'lucide-react'
import { useState } from 'react'
import { profileApi } from '@/api/profile'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { FileInput } from '@/components/ui/FileInput'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/context/toast-context'
import { getErrorMessage } from '@/lib/errors'
import { RESUME_ACCEPT, validateResume } from '@/lib/resume'
import type { User } from '@/types'

export function ResumeCard({ user }: { user: User }) {
  const { setUser } = useAuth()
  const toast = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useMutation({
    mutationFn: profileApi.uploadResume,
    onSuccess: (updated) => {
      setUser(updated)
      setFile(null)
      toast.success('Resume uploaded.')
    },
    onError: (uploadError) => setError(getErrorMessage(uploadError)),
  })

  const handleFile = (chosen: File | null) => {
    setFile(chosen)
    setError(chosen ? validateResume(chosen) : null)
  }

  return (
    <Card>
      <CardHeader title="Resume" description="Sent with an application whenever you do not attach a different file." />
      <div className="space-y-4 p-5">
        <p className="flex items-center gap-2 text-sm font-medium">
          {user.has_resume ? (
            <>
              <FileCheck2 className="size-5 text-brand-500" aria-hidden />
              A resume is on file. Uploading a new one replaces it.
            </>
          ) : (
            <>
              <FileWarning className="size-5 text-accent-500" aria-hidden />
              No resume yet. Add one so you can apply in two clicks.
            </>
          )}
        </p>
        <FileInput
          key={user.has_resume && !file ? 'uploaded' : 'choosing'}
          label="Resume file"
          accept={RESUME_ACCEPT}
          file={file}
          onChange={handleFile}
          error={error ?? undefined}
          hint="PDF, DOC or DOCX, up to 5 MB."
        />
        <div className="flex justify-end">
          <Button disabled={!file || error !== null} loading={upload.isPending} onClick={() => file && upload.mutate(file)}>
            Upload resume
          </Button>
        </div>
      </div>
    </Card>
  )
}
