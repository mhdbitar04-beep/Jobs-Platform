import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Download, Mail, MapPin, Phone } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { companyApi } from '@/api/company'
import { ApplicationStatusBadge } from '@/components/jobs/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { controlStyles } from '@/components/ui/fieldStyles'
import { useToast } from '@/context/toast-context'
import { useResumeDownload } from '@/hooks/useResumeDownload'
import { getErrorMessage } from '@/lib/errors'
import { cn, formatDate } from '@/lib/format'
import { APP_STATUS_LABELS, APP_STATUS_OPTIONS, pickOption } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'
import type { Application } from '@/types'

interface ApplicantCardProps {
  application: Application
  /** Name the job, for lists that mix applications to several jobs. */
  showJob?: boolean
}

/** One person who applied: who they are, what they sent, and the status the company gives them. */
export function ApplicantCard({ application, showJob = false }: ApplicantCardProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const statusId = useId()
  const letterId = useId()
  const [isLetterOpen, setIsLetterOpen] = useState(false)
  const download = useResumeDownload()
  const { applicant, job } = application

  const setStatus = useMutation({
    mutationFn: (status: Application['status']) => companyApi.setApplicationStatus(application.id, status),
    onSuccess: (updated) => {
      toast.success(`${applicant?.name ?? 'The applicant'} is now ${APP_STATUS_LABELS[updated.status].toLowerCase()} and has been notified.`)
      return queryClient.invalidateQueries({ queryKey: queryKeys.company })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (!applicant) return null

  return (
    <article className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <Avatar name={applicant.name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-base font-semibold">{applicant.name}</h3>
              <ApplicationStatusBadge status={application.status} />
            </div>
            {applicant.headline && <p className="mt-0.5 text-sm text-ink-600">{applicant.headline}</p>}
            {showJob && (
              <p className="mt-1 text-sm text-ink-600">
                Applied for{' '}
                <Link to={`/company/jobs/${job.id}/applicants`} className="font-semibold text-brand-600 hover:text-brand-800">
                  {job.title}
                </Link>
              </p>
            )}
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-700">
              <li>
                <a href={`mailto:${applicant.email}`} className="flex items-center gap-1.5 hover:text-brand-700">
                  <Mail className="size-4 text-ink-400" aria-hidden />
                  {applicant.email}
                </a>
              </li>
              {applicant.phone && (
                <li>
                  <a href={`tel:${applicant.phone}`} className="flex items-center gap-1.5 hover:text-brand-700">
                    <Phone className="size-4 text-ink-400" aria-hidden />
                    {applicant.phone}
                  </a>
                </li>
              )}
              {applicant.location && (
                <li className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-ink-400" aria-hidden />
                  {applicant.location}
                </li>
              )}
            </ul>
            {applicant.skills.length > 0 && (
              <ul aria-label="Skills" className="mt-3 flex flex-wrap gap-1.5">
                {applicant.skills.map((skill) => (
                  <li key={skill} className="rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 md:w-44">
          <label htmlFor={statusId} className="text-xs font-medium text-ink-600">
            Status
          </label>
          <select
            id={statusId}
            value={application.status}
            disabled={setStatus.isPending}
            onChange={(event) => {
              const status = pickOption(APP_STATUS_OPTIONS, event.target.value)
              if (status) setStatus.mutate(status)
            }}
            className={cn(controlStyles, 'h-9 pr-8 font-medium')}
          >
            {APP_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-500">Applied {formatDate(application.created_at)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        {application.has_resume && (
          <Button
            variant="secondary"
            size="sm"
            loading={download.isPending}
            onClick={() => download.mutate({ applicationId: application.id, applicantName: applicant.name })}
          >
            {!download.isPending && <Download className="size-4" aria-hidden />}
            Download resume
          </Button>
        )}
        {application.cover_letter ? (
          <Button variant="ghost" size="sm" aria-expanded={isLetterOpen} aria-controls={letterId} onClick={() => setIsLetterOpen((open) => !open)}>
            <ChevronDown className={cn('size-4 transition-transform', isLetterOpen && 'rotate-180')} aria-hidden />
            {isLetterOpen ? 'Hide cover letter' : 'Read cover letter'}
          </Button>
        ) : (
          <span className="px-1 text-sm text-ink-500">No cover letter</span>
        )}
      </div>
      {isLetterOpen && application.cover_letter && (
        <p id={letterId} className="mt-3 max-w-[75ch] rounded-lg bg-ink-50 p-4 text-sm leading-relaxed whitespace-pre-line text-ink-800">
          {application.cover_letter}
        </p>
      )}
    </article>
  )
}
