import { Inbox } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/format'
import { APP_STATUS_LABELS, APP_STATUSES } from '@/lib/options'
import type { AppStatus, Application } from '@/types'
import { ApplicantCard } from './ApplicantCard'

type StatusTab = AppStatus | 'all'

interface ApplicantListProps {
  applications: Application[]
  showJob?: boolean
}

/** Applicants with a row of status tabs; each tab shows how many applications are in it. */
export function ApplicantList({ applications, showJob }: ApplicantListProps) {
  const [activeTab, setActiveTab] = useState<StatusTab>('all')

  const tabs: { value: StatusTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: applications.length },
    ...APP_STATUSES.map((status) => ({
      value: status,
      label: APP_STATUS_LABELS[status],
      count: applications.filter((application) => application.status === status).length,
    })),
  ]
  const visible = activeTab === 'all' ? applications : applications.filter((application) => application.status === activeTab)

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No applications yet"
        description="You get a notification as soon as someone applies, and they appear in this list."
      />
    )
  }

  return (
    <div>
      <div role="group" aria-label="Filter by status" className="-mx-4 flex gap-1 overflow-x-auto border-b border-ink-200 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors',
              activeTab === tab.value ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-600 hover:text-ink-900',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs tabular-nums',
                activeTab === tab.value ? 'bg-brand-600 text-white' : 'bg-ink-200/70 text-ink-700',
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-500">No applications are {APP_STATUS_LABELS[activeTab as AppStatus].toLowerCase()} right now.</p>
      ) : (
        <div className="mt-5 grid gap-4">
          {visible.map((application) => (
            <ApplicantCard key={application.id} application={application} showJob={showJob} />
          ))}
        </div>
      )}
    </div>
  )
}
