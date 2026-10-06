import { CloudOff } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

interface ErrorStateProps {
  error: unknown
  onRetry: () => void
}

/** Shown in place of a list or page whose request failed. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon={CloudOff}
      title="This could not be loaded"
      description={getErrorMessage(error)}
      action={
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  )
}
