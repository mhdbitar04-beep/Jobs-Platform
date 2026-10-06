import { http } from '@/lib/http'
import type { AppNotification } from '@/types'

export interface NotificationFeed {
  data: AppNotification[]
  unread_count: number
}

export const notificationsApi = {
  list: () => http.get<NotificationFeed>('/notifications').then((res) => res.data),
  markRead: (id: string) => http.post<void>(`/notifications/${id}/read`),
  markAllRead: () => http.post<void>('/notifications/read-all'),
}
