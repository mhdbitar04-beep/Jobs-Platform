import { useQuery } from '@tanstack/react-query'
import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import { jobsApi } from '@/api/jobs'
import { JobCard, JobCardSkeleton } from '@/components/jobs/JobCard'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { queryKeys } from '@/lib/queryKeys'

export function SavedJobsPage() {
  const { data: jobs, isPending, isError, error, refetch } = useQuery({ queryKey: queryKeys.savedJobs, queryFn: jobsApi.saved })

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader title="Saved jobs" description="Roles you bookmarked to come back to." />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs"
          description="Use the bookmark on any job to keep it here."
          action={
            <Link to="/jobs" className={buttonStyles('primary')}>
              Find jobs
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </Container>
  )
}
