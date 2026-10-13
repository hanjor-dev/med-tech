import $axios from '@/utils/http'
import type { NotificationMessage, MessageQueryParams, UnreadCount } from '@/types/notification'

/** 分页响应 */
interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** 查询消息列表 */
export function getNotificationList(params: MessageQueryParams) {
  return $axios.post<PageResult<NotificationMessage>>('/notification/messages', params)
}

/** 获取未读数量 */
export function getUnreadCount() {
  return $axios.get<UnreadCount>('/notification/messages/unread-count')
}

/** 标记单条已读 */
export function markMessageRead(id: number) {
  return $axios.put(`/notification/messages/${id}/read`)
}

/** 批量标记已读 */
export function batchMarkRead(data: { ids?: number[]; category?: string; markAll?: boolean }) {
  return $axios.put('/notification/messages/batch-read', data)
}

/** 确认弹窗消息 */
export function confirmMessage(id: number) {
  return $axios.put(`/notification/messages/${id}/confirm`)
}

/** 删除消息 */
export function deleteMessage(id: number) {
  return $axios.delete(`/notification/messages/${id}`)
}
