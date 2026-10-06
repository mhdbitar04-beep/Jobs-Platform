import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { companyApi } from '@/api/company'
import { ApplicantList } from '@/components/applications/ApplicantList'
import { JobStatusBadge } from '@/components/jobs/StatusBadge'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageSpinner } from '@/components/ui/Spinner'
import { queryKeys } from '@/lib/queryKeys'

export function JobApplicantsPage() {
  const jobId = Number(useParams().id)
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.companyJobApplications(jobId),
    queryFn: () => companyApi.jobApplications(jobId),
    retry: false,
  })

  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (isPending) return <PageSpinner />

  const { job, data: applications } = data

  return (
    <>
      <Link to="/company/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700">
        <ArrowLeft className="size-4" aria-hidden />
        My jobs
      </Link>
      <header className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-500">Applicants for</p>
          <h1 className="mt-0.5 flex flex-wrap items-center gap-3 text-2xl font-bold sm:text-3xl">
            {job.title}
            <JobStatusBadge status={job.status} />
          </h1>
          <p className="mt-1 text-ink-500">
            {job.location}, {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/jobs/${job.id}`} className={buttonStyles('secondary')}>
            View job
          </Link>
          <Link to={`/company/jobs/${job.id}/edit`} className={buttonStyles('secondary')}>
            Edit job
          </Link>
        </div>
      </header>
      <ApplicantList applications={applications} />
    </>
  )
}
