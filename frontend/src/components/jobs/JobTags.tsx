import { Badge } from '@/components/ui/Badge'
import { JOB_TYPE_LABELS, LEVEL_LABELS, WORK_MODE_LABELS } from '@/lib/options'
import type { Job } from '@/types'

/** The three facts people scan for first: contract type, where the work happens, and seniority. */
export function JobTags({ job }: { job: Pick<Job, 'type' | 'work_mode' | 'experience_level'> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge tone="brand">{JOB_TYPE_LABELS[job.type]}</Badge>
      <Badge tone={job.work_mode === 'remote' ? 'amber' : 'neutral'}>{WORK_MODE_LABELS[job.work_mode]}</Badge>
      <Badge>{LEVEL_LABELS[job.experience_level]}</Badge>
    </div>
  )
}
