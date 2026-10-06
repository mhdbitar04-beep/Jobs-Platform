import { useQuery } from '@tanstack/react-query'
import { Briefcase, CircleDot, Hourglass, Inbox, Plus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { companyApi } from '@/api/company'
import { ApplicationStatusBadge } from '@/components/jobs/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatCard } from '@/components/ui/StatCard'
import { useAuth } from '@/context/auth-context'
import { formatRelative } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'

export function CompanyDashboardPage() {
  const { user } = useAuth()
  const { data, isPending, isError, error, refetch } = useQuery({ queryKey: queryKeys.companyDashboard, queryFn: companyApi.dashboard })

  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (isPending) return <PageSpinner />

  return (
    <>
      <PageHeader
        title={user?.company?.name ?? 'Dashboard'}
        description="Your jobs and the people applying to them."
        action={
          <Link to="/company/jobs/new" className={buttonStyles('primary')}>
            <Plus className="size-4" aria-hidden />
            Post a job
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total jobs" value={data.jobs_total} icon={Briefcase} />
        <StatCard label="Open jobs" value={data.jobs_open} icon={CircleDot} />
        <StatCard label="Applications" value={data.applications_total} icon={UsersRound} />
        <StatCard label="Waiting for review" value={data.applications_pending} icon={Hourglass} />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recent applications"
          action={
            <Link to="/company/applicants" className="text-sm font-semibold text-brand-600 hover:text-brand-800">
              See all
            </Link>
          }
        />
        {data.recent_applications.length === 0 ? (
          <p className="flex flex-col items-center gap-2 px-5 py-12 text-center text-sm text-ink-500">
            <Inbox className="size-6 text-ink-400" aria-hidden />
            No one has applied yet. New applications show up here.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {data.recent_applications.map((application) => (
              <li key={application.id}>
                <Link to={`/company/jobs/${application.job.id}/applicants`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-50">
                  <Avatar name={application.applicant?.name ?? '?'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{application.applicant?.name}</p>
                    <p className="truncate text-sm text-ink-600">{application.job.title}</p>
                  </div>
                  <span className="hidden text-xs text-ink-500 sm:block">{formatRelative(application.created_at)}</span>
                  <ApplicationStatusBadge status={application.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
