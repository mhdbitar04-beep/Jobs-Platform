import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { cn } from '@/lib/format'

export type ToastTone = 'success' | 'error'

export interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastViewportProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="animate-toast-in pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-ink-200 bg-white p-3.5 shadow-lg shadow-ink-900/10 sm:w-88"
        >
          {toast.tone === 'success' ? (
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
          ) : (
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
          )}
          <p className={cn('flex-1 text-sm', toast.tone === 'error' ? 'text-red-900' : 'text-ink-800')}>
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="rounded p-0.5 text-ink-400 hover:text-ink-700"
            aria-label="Dismiss"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  )
}
