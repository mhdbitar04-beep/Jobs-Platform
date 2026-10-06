import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Banknote, CalendarClock, CircleCheck, Clock, FolderOpen, MapPin, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { jobsApi } from '@/api/jobs'
import { ApplyModal } from '@/components/jobs/ApplyModal'
import { CompanyCard } from '@/components/jobs/CompanyCard'
import { JobCard } from '@/components/jobs/JobCard'
import { JobTags } from '@/components/jobs/JobTags'
import { SaveButton } from '@/components/jobs/SaveButton'
import type { LoginRedirectState } from '@/components/layout/guards'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/auth-context'
import { formatDate, formatRelative, formatSalary } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import type { Job } from '@/types'

function JobActions({ job }: { job: Job }) {
  const { user } = useAuth()
  const location = useLocation()
  const [isApplying, setIsApplying] = useState(false)

  if (!user) {
    const state: LoginRedirectState = { from: location.pathname }
    return job.status === 'open' ? (
      <Link to="/login" state={state} className={buttonStyles('primary', 'lg')}>
        Log in to apply
      </Link>
    ) : null
  }
  if (user.role !== 'seeker') return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      {job.has_applied ? (
        <span className="inline-flex h-12 items-center gap-2 rounded-md bg-brand-50 px-5 font-semibold text-brand-700">
          <CircleCheck className="size-5" aria-hidden />
          Applied
        </span>
      ) : (
        <Button size="lg" disabled={job.status !== 'open'} onClick={() => setIsApplying(true)}>
          {job.status === 'open' ? 'Apply' : 'Applications closed'}
        </Button>
      )}
      <SaveButton job={job} withLabel />
      {isApplying && <ApplyModal job={job} onClose={() => setIsApplying(false)} />}
    </div>
  )
}

function TextSection({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-[70ch] leading-relaxed whitespace-pre-line text-ink-700">{text}</p>
    </section>
  )
}

export function JobDetailPage() {
  const jobId = Number(useParams().id)
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.job(jobId),
    queryFn: () => jobsApi.get(jobId),
    enabled: Number.isInteger(jobId),
    retry: false,
  })

  if (isError || !Number.isInteger(jobId)) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={SearchX}
          title="This job is not available"
          description="It may have been removed by the company. Other roles are still open."
          action={
            <Link to="/jobs" className={buttonStyles('primary')}>
              Browse jobs
            </Link>
          }
        />
      </Container>
    )
  }
  if (isPending) return <PageSpinner label="Loading job" />

  const { data: job, related } = data
  const salary = formatSalary(job)

  return (
    <Container className="py-8 sm:py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700">
        <ArrowLeft className="size-4" aria-hidden />
        All jobs
      </Link>

      <header className="mt-5 flex flex-col gap-6 border-b border-ink-200 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex gap-4">
          <Avatar name={job.company.name} shape="square" size="lg" />
          <div>
            <p className="font-medium text-ink-600">{job.company.name}</p>
            <h1 className="mt-1 text-3xl leading-tight font-bold sm:text-4xl">{job.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <JobTags job={job} />
              {job.status === 'closed' && <Badge tone="red">Closed</Badge>}
            </div>
          </div>
        </div>
        <JobActions job={job} />
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-10">
          <TextSection title="About the role" text={job.description} />
          {job.requirements && <TextSection title="What you need" text={job.requirements} />}
          {job.skills.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Skills</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <li key={skill} className="rounded-md border border-ink-200 bg-white px-3 py-1 text-sm font-medium text-ink-800">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="sr-only">Job summary</h2>
            <dl className="space-y-4 text-sm">
              <SummaryRow icon={Banknote} label="Salary" value={salary ?? 'Not disclosed'} />
              <SummaryRow icon={MapPin} label="Location" value={job.location} />
              <SummaryRow icon={FolderOpen} label="Category" value={job.category.name} />
              <SummaryRow icon={Clock} label="Posted" value={formatRelative(job.created_at)} />
              <SummaryRow icon={CalendarClock} label="Apply by" value={job.deadline ? formatDate(job.deadline) : 'No deadline'} />
            </dl>
          </Card>
          <CompanyCard company={job.company} />
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2 id="related-heading" className="text-2xl font-bold">
            More in {job.category.name}
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {related.map((relatedJob) => (
              <JobCard key={relatedJob.id} job={relatedJob} />
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}

interface SummaryRowProps {
  icon: typeof MapPin
  label: string
  value: string
}

function SummaryRow({ icon: Icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
      <div>
        <dt className="text-ink-500">{label}</dt>
        <dd className="font-semibold text-ink-900">{value}</dd>
      </div>
    </div>
  )
}
