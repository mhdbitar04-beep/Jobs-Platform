import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/format'

interface ModalProps {
  title: string
  onClose: () => void
  size?: 'sm' | 'md'
  children: ReactNode
}

/**
 * Mount it to open it, unmount it to close it.
 * Built on the native <dialog>, which gives focus trapping and Escape-to-close for free.
 */
export function Modal({ title, onClose, size = 'md', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      className={cn(
        'animate-modal-in m-auto w-[calc(100%-2rem)] rounded-xl bg-white p-0 text-ink-800 shadow-2xl shadow-ink-900/20 backdrop:bg-ink-900/45',
        size === 'sm' ? 'max-w-md' : 'max-w-xl',
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-ink-200 px-6 py-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-800" aria-label="Close">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  )
}
