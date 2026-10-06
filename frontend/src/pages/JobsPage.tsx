import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { jobsApi } from '@/api/jobs'
import { JobCard, JobCardSkeleton } from '@/components/jobs/JobCard'
import { JobFilterPanel } from '@/components/jobs/JobFilterPanel'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { useJobFilters } from '@/hooks/useJobFilters'
import { cn, formatNumber } from '@/lib/format'
import { SORT_OPTIONS } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'

export function JobsPage() {
  const { filters, setFilter, setPage, clear, activeCount } = useJobFilters()
  const { data, isPending, isPlaceholderData, isError, error, refetch } = useQuery({
    queryKey: queryKeys.jobList(filters),
    queryFn: () => jobsApi.list(filters),
    placeholderData: keepPreviousData,
  })
  const total = data?.meta.total

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Find jobs</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <JobFilterPanel filters={filters} activeCount={activeCount} onChange={setFilter} onClear={clear} />
        </aside>

        <section aria-label="Results" className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <p className="text-sm text-ink-600" aria-live="polite">
              {total === undefined ? 'Searching…' : `${formatNumber(total)} ${total === 1 ? 'job' : 'jobs'} found`}
            </p>
            <Select
              label="Sort by"
              options={SORT_OPTIONS}
              value={filters.sort ?? 'latest'}
              onChange={(event) => setFilter('sort', event.target.value === 'latest' ? '' : event.target.value)}
              wrapperClassName="w-44"
            />
          </div>

          {isError ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : isPending ? (
            <div className="grid gap-4">
              {Array.from({ length: 5 }, (_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : data.data.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No jobs match these filters"
              description="Try a broader keyword, or remove a filter to see more roles."
              action={
                <Button variant="secondary" onClick={clear}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className={cn('grid gap-4 transition-opacity', isPlaceholderData && 'opacity-50')}>
                {data.data.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination meta={data.meta} onPageChange={setPage} />
              </div>
            </>
          )}
        </section>
      </div>
    </Container>
  )
}
