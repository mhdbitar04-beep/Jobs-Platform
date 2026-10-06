import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '@/api/notifications'
import { useDismiss } from '@/hooks/useDismiss'
import { cn, formatRelative } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import type { AppNotification } from '@/types'

const POLL_INTERVAL_MS = 20_000

export function NotificationBell() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setIsOpen(false), [])
  useDismiss(containerRef, isOpen, close)

  const { data } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsApi.list,
    refetchInterval: POLL_INTERVAL_MS,
  })
  const notifications = data?.data ?? []
  const unreadCount = data?.unread_count ?? 0

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
  const markRead = useMutation({ mutationFn: notificationsApi.markRead, onSettled: refresh })
  const markAllRead = useMutation({ mutationFn: notificationsApi.markAllRead, onSettled: refresh })

  const open = (notification: AppNotification) => {
    if (!notification.read_at) markRead.mutate(notification.id)
    close()
    navigate(notification.link)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="relative rounded-full p-2 text-ink-600 hover:bg-ink-100 hover:text-ink-900"
      >
        <Bell className="size-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-400 px-1 text-[0.6875rem] font-bold text-ink-900 ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-16 mt-2 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg shadow-ink-900/10 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:w-88">
          <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button
              type="button"
              disabled={unreadCount === 0 || markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 disabled:cursor-default disabled:text-ink-400"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-500">Nothing yet. Updates about applications show up here.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-ink-100 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => open(notification)}
                    className={cn('flex w-full gap-3 px-4 py-3 text-left hover:bg-ink-50', !notification.read_at && 'bg-brand-50/50')}
                  >
                    <span
                      className={cn('mt-1.5 size-2 shrink-0 rounded-full', notification.read_at ? 'bg-transparent' : 'bg-accent-400')}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink-900">
                        {notification.title}
                        {!notification.read_at && <span className="sr-only"> (unread)</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-600">{notification.message}</span>
                      <span className="mt-1 block text-xs text-ink-400">{formatRelative(notification.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
