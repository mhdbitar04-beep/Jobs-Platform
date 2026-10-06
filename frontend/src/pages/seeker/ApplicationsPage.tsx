import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { applicationsApi } from '@/api/applications'
import { ApplicationStatusBadge } from '@/components/jobs/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { Table, Td, Th } from '@/components/ui/Table'
import { useToast } from '@/context/toast-context'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import type { Application } from '@/types'

export function ApplicationsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [withdrawing, setWithdrawing] = useState<Application | null>(null)
  const { data: applications, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.myApplications,
    queryFn: applicationsApi.mine,
  })

  const withdraw = useMutation({
    mutationFn: (application: Application) => applicationsApi.withdraw(application.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myApplications }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
      ])
      toast.success('Application withdrawn.')
    },
    onError: (withdrawError) => toast.error(getErrorMessage(withdrawError)),
    onSettled: () => setWithdrawing(null),
  })

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader title="My applications" description="Every job you applied for, and where each one stands." />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <PageSpinner />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Send}
          title="You have not applied for anything yet"
          description="When you apply for a job it appears here with its status."
          action={
            <Link to="/jobs" className={buttonStyles('primary')}>
              Find jobs
            </Link>
          }
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Job</Th>
              <Th>Company</Th>
              <Th>Applied</Th>
              <Th>Status</Th>
              <Th>
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <Td>
                  <Link to={`/jobs/${application.job.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {application.job.title}
                  </Link>
                  <p className="text-xs text-ink-500">{application.job.location}</p>
                </Td>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <Avatar name={application.job.company.name} shape="square" size="sm" />
                    {application.job.company.name}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-ink-600">{formatDate(application.created_at)}</Td>
                <Td>
                  <ApplicationStatusBadge status={application.status} />
                </Td>
                <Td className="text-right">
                  {application.status === 'pending' && (
                    <Button variant="secondary" size="sm" onClick={() => setWithdrawing(application)}>
                      Withdraw
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {withdrawing && (
        <ConfirmDialog
          title="Withdraw this application?"
          message={`${withdrawing.job.company.name} will no longer see your application for ${withdrawing.job.title}. You can apply again while the job is open.`}
          confirmLabel="Withdraw"
          loading={withdraw.isPending}
          onConfirm={() => withdraw.mutate(withdrawing)}
          onCancel={() => setWithdrawing(null)}
        />
      )}
    </Container>
  )
}
