import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark } from 'lucide-react'
import { jobsApi } from '@/api/jobs'
import { useToast } from '@/context/toast-context'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import type { Job } from '@/types'

interface SaveButtonProps {
  job: Pick<Job, 'id' | 'title' | 'is_saved'>
  /** Show the words next to the icon. */
  withLabel?: boolean
}

/** Bookmark toggle for job seekers. */
export function SaveButton({ job, withLabel = false }: SaveButtonProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const toggle = useMutation({
    mutationFn: () => jobsApi.toggleSave(job.id),
    onSuccess: ({ saved }) => {
      toast.success(saved ? 'Saved to your list.' : 'Removed from your saved jobs.')
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
        queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs }),
      ])
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const label = job.is_saved ? 'Saved' : 'Save'

  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      aria-pressed={job.is_saved}
      aria-label={withLabel ? undefined : `${job.is_saved ? 'Remove from saved jobs' : 'Save job'}: ${job.title}`}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition-colors disabled:opacity-60',
        withLabel ? 'h-12 px-5' : 'size-9',
        job.is_saved
          ? 'border-accent-300 bg-accent-100 text-accent-700'
          : 'border-ink-300 bg-white text-ink-600 hover:border-ink-400 hover:text-ink-900',
      )}
    >
      <Bookmark className={cn('size-4', job.is_saved && 'fill-accent-400')} aria-hidden />
      {withLabel && label}
    </button>
  )
}
