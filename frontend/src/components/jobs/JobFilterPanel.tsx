import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import { jobsApi } from '@/api/jobs'
import { Button } from '@/components/ui/Button'
import { SearchField } from '@/components/ui/SearchField'
import { Select } from '@/components/ui/Select'
import type { JobFilterKey } from '@/hooks/useJobFilters'
import { JOB_TYPE_OPTIONS, LEVEL_OPTIONS, WORK_MODE_OPTIONS } from '@/lib/options'
import { queryKeys } from '@/lib/queryKeys'
import type { JobFilters } from '@/types'

interface JobFilterPanelProps {
  filters: JobFilters
  activeCount: number
  onChange: (key: JobFilterKey, value: string) => void
  onClear: () => void
}

export function JobFilterPanel({ filters, activeCount, onChange, onClear }: JobFilterPanelProps) {
  const { data: categories = [] } = useQuery({ queryKey: queryKeys.categories, queryFn: jobsApi.categories })
  const categoryOptions = categories.map((category) => ({ value: category.slug, label: category.name }))

  return (
    <form
      aria-label="Filter jobs"
      onSubmit={(event) => event.preventDefault()}
      className="grid grid-cols-2 gap-4 rounded-xl border border-ink-200 bg-white p-5 lg:grid-cols-1"
    >
      <SearchField
        label="Keyword"
        placeholder="Title, skill or company"
        value={filters.search ?? ''}
        onCommit={(value) => onChange('search', value)}
        className="col-span-2 lg:col-span-1"
      />
      <SearchField
        label="Location"
        placeholder="City or country"
        icon={MapPin}
        value={filters.location ?? ''}
        onCommit={(value) => onChange('location', value)}
        className="col-span-2 lg:col-span-1"
      />
      <Select
        label="Category"
        placeholder="All categories"
        options={categoryOptions}
        value={filters.category ?? ''}
        onChange={(event) => onChange('category', event.target.value)}
      />
      <Select
        label="Job type"
        placeholder="Any type"
        options={JOB_TYPE_OPTIONS}
        value={filters.type ?? ''}
        onChange={(event) => onChange('type', event.target.value)}
      />
      <Select
        label="Work mode"
        placeholder="Anywhere"
        options={WORK_MODE_OPTIONS}
        value={filters.work_mode ?? ''}
        onChange={(event) => onChange('work_mode', event.target.value)}
      />
      <Select
        label="Experience level"
        placeholder="Any level"
        options={LEVEL_OPTIONS}
        value={filters.experience_level ?? ''}
        onChange={(event) => onChange('experience_level', event.target.value)}
      />
      <Button variant="secondary" disabled={activeCount === 0} onClick={onClear} className="col-span-2 lg:col-span-1">
        Clear filters{activeCount > 0 && ` (${activeCount})`}
      </Button>
    </form>
  )
}
