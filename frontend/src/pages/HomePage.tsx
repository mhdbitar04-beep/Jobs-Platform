import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MapPin, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobsApi } from '@/api/jobs'
import { JobCard, JobCardSkeleton } from '@/components/jobs/JobCard'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/auth-context'
import { formatNumber } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import type { PublicStats } from '@/types'

const LATEST_FILTERS = { per_page: 6 }

const COUNTERS: { key: keyof PublicStats; label: string }[] = [
  { key: 'jobs', label: 'open jobs' },
  { key: 'companies', label: 'companies hiring' },
  { key: 'seekers', label: 'job seekers' },
  { key: 'applications', label: 'applications sent' },
]

const heroInputStyles =
  'h-12 w-full rounded-md bg-ink-50 pr-3 pl-10 text-ink-900 placeholder:text-ink-500 focus:bg-white focus:outline-2 focus:outline-brand-500'

function HeroSearch() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('search', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate({ pathname: '/jobs', search: params.toString() })
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="grid gap-2 rounded-xl bg-white p-2 shadow-xl shadow-brand-900/30 sm:grid-cols-[1.4fr_1fr_auto]"
    >
      <div className="relative">
        <label htmlFor="hero-keyword" className="sr-only">
          Job title, skill or company
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-500" aria-hidden />
        <input
          id="hero-keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Job title, skill or company"
          className={heroInputStyles}
        />
      </div>
      <div className="relative">
        <label htmlFor="hero-location" className="sr-only">
          Location
        </label>
        <MapPin className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-500" aria-hidden />
        <input
          id="hero-location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City or country"
          className={heroInputStyles}
        />
      </div>
      <Button type="submit" variant="accent" size="lg">
        Search jobs
      </Button>
    </form>
  )
}

function Hero() {
  const { data: stats } = useQuery({ queryKey: queryKeys.stats, queryFn: jobsApi.stats })

  return (
    <section className="bg-brand-800 text-white">
      <Container className="pt-14 pb-12 sm:pt-20 sm:pb-16">
        <h1 className="max-w-3xl text-4xl leading-[1.05] font-extrabold text-white sm:text-6xl">
          The next place you work is hiring today.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-brand-100">
          Search open roles, apply with one resume, and see exactly where each application stands.
        </p>
        <div className="mt-8 max-w-4xl">
          <HeroSearch />
        </div>
        <dl className="mt-12 grid max-w-4xl grid-cols-2 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
          {COUNTERS.map(({ key, label }) => (
            <div key={key} className="flex flex-col-reverse">
              <dt className="text-sm text-brand-200">{label}</dt>
              <dd className="font-display text-3xl font-bold tabular-nums">
                {stats ? formatNumber(stats[key]) : <Skeleton className="my-1 h-7 w-16 bg-white/15" />}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

function CategoryGrid() {
  const { data: categories, isPending } = useQuery({ queryKey: queryKeys.categories, queryFn: jobsApi.categories })

  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="text-2xl font-bold sm:text-3xl">
        Browse by category
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-200 bg-ink-200 md:grid-cols-4">
        {isPending &&
          Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="bg-white p-5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-2 h-4 w-16" />
            </li>
          ))}
        {categories?.map((category) => (
          <li key={category.id} className="bg-white">
            <Link to={`/jobs?category=${category.slug}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-brand-50">
              <span className="font-semibold text-ink-900 group-hover:text-brand-700">{category.name}</span>
              <span className="mt-1 text-sm text-ink-500">
                {category.jobs_count} open {category.jobs_count === 1 ? 'job' : 'jobs'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function LatestJobs() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.jobList(LATEST_FILTERS),
    queryFn: () => jobsApi.list(LATEST_FILTERS),
  })

  return (
    <section aria-labelledby="latest-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="latest-heading" className="text-2xl font-bold sm:text-3xl">
          Just posted
        </h2>
        <Link to="/jobs" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800">
          See all jobs
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {isPending && Array.from({ length: 6 }, (_, index) => <JobCardSkeleton key={index} />)}
        {data?.data.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
      {data?.data.length === 0 && <p className="mt-6 text-ink-500">No jobs are open right now. New ones appear here first.</p>}
    </section>
  )
}

function CompanyCallToAction() {
  const { user } = useAuth()
  const isCompany = user?.role === 'company'

  return (
    <section aria-labelledby="companies-heading" className="grid gap-8 rounded-2xl bg-accent-100 p-8 sm:p-12 md:grid-cols-[1.3fr_1fr] md:items-center">
      <div>
        <h2 id="companies-heading" className="text-2xl font-bold sm:text-3xl">
          Hiring? Post a job in a few minutes.
        </h2>
        <p className="mt-3 max-w-lg text-ink-700">
          Create a company account, publish your role, and review every applicant in one list: their details, cover letter and
          resume, with a status you control.
        </p>
        <Link to={isCompany ? '/company/jobs/new' : '/register?role=company'} className={buttonStyles('primary', 'lg', 'mt-6')}>
          {isCompany ? 'Post a job' : 'Create a company account'}
        </Link>
      </div>
      <ol className="space-y-3 text-sm text-ink-800">
        {['Describe the role and the skills it needs.', 'Get a notification each time someone applies.', 'Shortlist, reject or accept, and the applicant is told.'].map(
          (step, index) => (
            <li key={step} className="flex items-start gap-3 rounded-lg bg-white/70 p-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ),
        )}
      </ol>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Hero />
      <Container className="space-y-16 pt-14 sm:space-y-20 sm:pt-20">
        <CategoryGrid />
        <LatestJobs />
        <CompanyCallToAction />
      </Container>
    </>
  )
}
