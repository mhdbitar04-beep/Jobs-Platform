import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { APP_STATUS_LABELS, JOB_STATUS_LABELS } from '@/lib/options'
import type { AppStatus, JobStatus } from '@/types'

const APP_STATUS_TONES: Record<AppStatus, BadgeTone> = {
  pending: 'amber',
  reviewed: 'blue',
  shortlisted: 'violet',
  rejected: 'red',
  accepted: 'green',
}

export function ApplicationStatusBadge({ status }: { status: AppStatus }) {
  return <Badge tone={APP_STATUS_TONES[status]}>{APP_STATUS_LABELS[status]}</Badge>
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge tone={status === 'open' ? 'green' : 'neutral'}>{JOB_STATUS_LABELS[status]}</Badge>
}
