import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { applicationsApi } from '@/api/applications'
import { Button } from '@/components/ui/Button'
import { FileInput } from '@/components/ui/FileInput'
import { FormAlert } from '@/components/ui/FormAlert'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/context/toast-context'
import { queryKeys } from '@/lib/queryKeys'
import { RESUME_ACCEPT, validateResume } from '@/lib/resume'
import type { Job } from '@/types'
import { readApplyErrors, type ApplyErrors } from './applyErrors'

const COVER_LETTER_MAX = 3000

interface ApplyModalProps {
  job: Job
  onClose: () => void
}

export function ApplyModal({ job, onClose }: ApplyModalProps) {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [coverLetter, setCoverLetter] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [errors, setErrors] = useState<ApplyErrors>({})
  const hasProfileResume = user?.has_resume ?? false

  const apply = useMutation({
    mutationFn: applicationsApi.apply,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myApplications }),
        queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs }),
      ])
      toast.success(`Application sent to ${job.company.name}.`)
      onClose()
    },
    onError: (error) => setErrors(readApplyErrors(error)),
  })

  const handleResume = (file: File | null) => {
    setResume(file)
    setErrors((current) => ({ ...current, resume: file ? (validateResume(file) ?? undefined) : undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (resume && validateResume(resume)) return
    if (!resume && !hasProfileResume) {
      setErrors({ resume: 'Attach a resume. You have not added one to your profile yet.' })
      return
    }
    setErrors({})
    apply.mutate({ jobId: job.id, coverLetter, resume })
  }

  return (
    <Modal title={`Apply for ${job.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <p className="text-sm text-ink-600">
          Your name, contact details, headline and skills are sent to {job.company.name} with this application.
        </p>
        <FormAlert message={errors.form ?? null} />
        <Textarea
          label="Cover letter"
          optional
          rows={7}
          maxLength={COVER_LETTER_MAX}
          placeholder="Why this role, and what you would bring to it."
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
          error={errors.cover_letter}
          hint={`${coverLetter.length} / ${COVER_LETTER_MAX} characters`}
        />
        <FileInput
          label="Resume"
          optional={hasProfileResume}
          accept={RESUME_ACCEPT}
          file={resume}
          onChange={handleResume}
          error={errors.resume}
          hint={
            hasProfileResume
              ? 'PDF, DOC or DOCX, up to 5 MB. If you do not choose a file, the resume from your profile is sent.'
              : 'PDF, DOC or DOCX, up to 5 MB. Add a resume to your profile to skip this step next time.'
          }
        />
        <div className="flex justify-end gap-3 border-t border-ink-200 pt-5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={apply.isPending}>
            Send application
          </Button>
        </div>
      </form>
    </Modal>
  )
}
