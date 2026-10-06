import { useQuery } from '@tanstack/react-query'
import { Briefcase, Building2, CircleDot, Send, UserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/admin'
import { BarList } from '@/components/admin/BarList'
import { JobStatusBadge } from '@/components/jobs/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatCard } from '@/components/ui/StatCard'
import { formatRelative } from '@/lib/format'
import { APP_STATUS_LABELS, APP_STATUSES, ROLE_LABELS } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'
import type { AppStatus } from '@/types'

const STATUS_BAR_COLORS: Record<AppStatus, string> = {
  pending: 'bg-accent-400',
  reviewed: 'bg-sky-500',
  shortlisted: 'bg-violet-500',
  rejected: 'bg-red-500',
  accepted: 'bg-emerald-500',
}

const seeAllStyles = 'text-sm font-semibold text-brand-600 hover:text-brand-800'

export function AdminDashboardPage() {
  const { data, isPending, isError, error, refetch } = useQuery({ queryKey: queryKeys.adminStats, queryFn: adminApi.stats })

  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (isPending) return <PageSpinner />

  return (
    <>
      <PageHeader title="Admin dashboard" description="The whole platform at a glance." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard label="Users" value={data.users} icon={Users} />
        <StatCard label="Job seekers" value={data.seekers} icon={UserRound} />
        <StatCard label="Companies" value={data.companies} icon={Building2} />
        <StatCard label="Jobs" value={data.jobs} icon={Briefcase} />
        <StatCard label="Open jobs" value={data.open_jobs} icon={CircleDot} />
        <StatCard label="Applications" value={data.applications} icon={Send} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Jobs by category" />
          <BarList
            items={data.jobs_by_category.map(({ name, count }) => ({ label: name, value: count, color: 'bg-brand-500' }))}
            emptyText="No categories yet."
          />
        </Card>
        <Card>
          <CardHeader title="Applications by status" />
          <BarList
            items={APP_STATUSES.map((status) => ({
              label: APP_STATUS_LABELS[status],
              value: data.applications_by_status[status],
              color: STATUS_BAR_COLORS[status],
            }))}
            emptyText="No applications yet."
          />
        </Card>

        <Card>
          <CardHeader title="Newest users" action={<Link to="/admin/users" className={seeAllStyles}>See all</Link>} />
          <ul className="divide-y divide-ink-100">
            {data.recent_users.map((user) => (
              <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="truncate text-xs text-ink-500">{user.email}</p>
                </div>
                <Badge>{ROLE_LABELS[user.role]}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Newest jobs" action={<Link to="/admin/jobs" className={seeAllStyles}>See all</Link>} />
          <ul className="divide-y divide-ink-100">
            {data.recent_jobs.map((job) => (
              <li key={job.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={job.company.name} shape="square" size="sm" />
                <div className="min-w-0 flex-1">
                  <Link to={`/jobs/${job.id}`} className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
                    {job.title}
                  </Link>
                  <p className="truncate text-xs text-ink-500">
                    {job.company.name}, {formatRelative(job.created_at)}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
