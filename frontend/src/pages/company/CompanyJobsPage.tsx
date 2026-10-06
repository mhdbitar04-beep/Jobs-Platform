import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Pencil, Plus, Trash2, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { companyApi } from '@/api/company'
import { JobStatusBadge } from '@/components/jobs/StatusBadge'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { Table, Td, Th } from '@/components/ui/Table'
import { useToast } from '@/context/toast-context'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { jobToPayload } from '@/lib/jobPayload'
import { queryKeys } from '@/lib/queryKeys'
import type { Job } from '@/types'

export function CompanyJobsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [deleting, setDeleting] = useState<Job | null>(null)
  const { data: jobs, isPending, isError, error, refetch } = useQuery({ queryKey: queryKeys.companyJobs, queryFn: companyApi.jobs })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.company }),
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
    ])

  const toggleStatus = useMutation({
    mutationFn: (job: Job) => companyApi.updateJob(job.id, jobToPayload(job, { status: job.status === 'open' ? 'closed' : 'open' })),
    onSuccess: async (updated) => {
      await refresh()
      toast.success(updated.status === 'open' ? 'Job reopened.' : 'Job closed. It no longer accepts applications.')
    },
    onError: (toggleError) => toast.error(getErrorMessage(toggleError)),
  })

  const remove = useMutation({
    mutationFn: (job: Job) => companyApi.deleteJob(job.id),
    onSuccess: async () => {
      await refresh()
      toast.success('Job deleted.')
    },
    onError: (removeError) => toast.error(getErrorMessage(removeError)),
    onSettled: () => setDeleting(null),
  })

  const postJobLink = (
    <Link to="/company/jobs/new" className={buttonStyles('primary')}>
      <Plus className="size-4" aria-hidden />
      Post a job
    </Link>
  )

  return (
    <>
      <PageHeader title="My jobs" description="Everything your company has posted." action={postJobLink} />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <PageSpinner />
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs posted yet" description="Post your first job to start receiving applications." action={postJobLink} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Applicants</Th>
              <Th>Posted</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <Td>
                  <Link to={`/jobs/${job.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {job.title}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {job.category.name}, {job.location}
                  </p>
                </Td>
                <Td>
                  <JobStatusBadge status={job.status} />
                </Td>
                <Td>
                  <Link
                    to={`/company/jobs/${job.id}/applicants`}
                    className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-800"
                    aria-label={`${job.applications_count ?? 0} applicants for ${job.title}`}
                  >
                    <UsersRound className="size-4" aria-hidden />
                    {job.applications_count ?? 0}
                  </Link>
                </Td>
                <Td className="whitespace-nowrap text-ink-600">{formatDate(job.created_at)}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="sm" disabled={toggleStatus.isPending} onClick={() => toggleStatus.mutate(job)}>
                      {job.status === 'open' ? 'Close' : 'Reopen'}
                    </Button>
                    <Link to={`/company/jobs/${job.id}/edit`} className={buttonStyles('ghost', 'sm', 'px-2')} aria-label={`Edit ${job.title}`}>
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-red-700 hover:bg-red-50"
                      aria-label={`Delete ${job.title}`}
                      onClick={() => setDeleting(job)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this job?"
          message={`"${deleting.title}" and the applications it received will be removed permanently. To stop new applications but keep the history, close the job instead.`}
          confirmLabel="Delete job"
          loading={remove.isPending}
          onConfirm={() => remove.mutate(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
