import { Banknote, CircleCheck, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/auth-context'
import { formatRelative, formatSalary } from '@/lib/format'
import type { Job } from '@/types'
import { JobTags } from './JobTags'
import { SaveButton } from './SaveButton'

export function JobCard({ job }: { job: Job }) {
  const { user } = useAuth()
  const salary = formatSalary(job)

  return (
    <article className="group relative flex gap-4 rounded-xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-300">
      <Avatar name={job.company.name} shape="square" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base leading-snug font-semibold">
              <Link to={`/jobs/${job.id}`} className="after:absolute after:inset-0 after:rounded-xl group-hover:text-brand-700">
                {job.title}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-sm text-ink-600">{job.company.name}</p>
          </div>
          {user?.role === 'seeker' && (
            <div className="relative z-10">
              <SaveButton job={job} />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-ink-400" aria-hidden />
            {job.location}
          </span>
          {salary && (
            <span className="flex items-center gap-1.5 font-medium text-ink-800">
              <Banknote className="size-4 text-ink-400" aria-hidden />
              {salary}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <JobTags job={job} />
          <span className="flex items-center gap-3 text-xs text-ink-500">
            {job.has_applied && (
              <span className="flex items-center gap-1 font-semibold text-brand-600">
                <CircleCheck className="size-3.5" aria-hidden />
                Applied
              </span>
            )}
            <time dateTime={job.created_at}>{formatRelative(job.created_at)}</time>
          </span>
        </div>
      </div>
    </article>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-ink-200 bg-white p-5">
      <Skeleton className="size-11 rounded-lg" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
