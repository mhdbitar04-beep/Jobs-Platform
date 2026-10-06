import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SearchX, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, type AdminJobParams } from '@/api/admin'
import { JobStatusBadge } from '@/components/jobs/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchField } from '@/components/ui/SearchField'
import { Select } from '@/components/ui/Select'
import { PageSpinner } from '@/components/ui/Spinner'
import { Table, Td, Th } from '@/components/ui/Table'
import { useToast } from '@/context/toast-context'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { JOB_STATUS_OPTIONS, pickOption } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'
import type { Job } from '@/types'

export function AdminJobsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { params, page, setFilter, setPage } = useUrlFilters()
  const [deleting, setDeleting] = useState<Job | null>(null)

  const query: AdminJobParams = {
    search: params.get('search') || undefined,
    status: pickOption(JOB_STATUS_OPTIONS, params.get('status')),
    page,
  }
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.adminJobs(query),
    queryFn: () => adminApi.jobs(query),
    placeholderData: keepPreviousData,
  })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin }),
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
    ])

  const toggleStatus = useMutation({
    mutationFn: (job: Job) => adminApi.setJobStatus(job.id, job.status === 'open' ? 'closed' : 'open'),
    onSuccess: async (updated) => {
      await refresh()
      toast.success(updated.status === 'open' ? 'Job reopened.' : 'Job closed.')
    },
    onError: (toggleError) => toast.error(getErrorMessage(toggleError)),
  })

  const remove = useMutation({
    mutationFn: (job: Job) => adminApi.deleteJob(job.id),
    onSuccess: async () => {
      await refresh()
      toast.success('Job deleted.')
    },
    onError: (removeError) => toast.error(getErrorMessage(removeError)),
    onSettled: () => setDeleting(null),
  })

  return (
    <>
      <PageHeader title="Jobs" description="Every job on the platform, open or closed." />

      <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_12rem]">
        <SearchField label="Search" placeholder="Title, skill or company" value={query.search ?? ''} onCommit={(value) => setFilter('search', value)} />
        <Select
          label="Status"
          placeholder="All statuses"
          options={JOB_STATUS_OPTIONS}
          value={query.status ?? ''}
          onChange={(event) => setFilter('status', event.target.value)}
        />
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <PageSpinner />
      ) : data.data.length === 0 ? (
        <EmptyState icon={SearchX} title="No jobs found" description="Try a different search or status." />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Job</Th>
                <Th>Company</Th>
                <Th>Status</Th>
                <Th>Applications</Th>
                <Th>Posted</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((job) => (
                <tr key={job.id}>
                  <Td>
                    <Link to={`/jobs/${job.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                      {job.title}
                    </Link>
                    <p className="text-xs text-ink-500">{job.category.name}</p>
                  </Td>
                  <Td>{job.company.name}</Td>
                  <Td>
                    <JobStatusBadge status={job.status} />
                  </Td>
                  <Td className="tabular-nums">{job.applications_count ?? 0}</Td>
                  <Td className="whitespace-nowrap text-ink-600">{formatDate(job.created_at)}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="secondary" size="sm" disabled={toggleStatus.isPending} onClick={() => toggleStatus.mutate(job)}>
                        {job.status === 'open' ? 'Close' : 'Reopen'}
                      </Button>
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
          <div className="mt-6">
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        </>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this job?"
          message={`"${deleting.title}" at ${deleting.company.name} and its applications will be removed permanently.`}
          confirmLabel="Delete job"
          loading={remove.isPending}
          onConfirm={() => remove.mutate(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
