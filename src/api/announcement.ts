import $axios from '@/utils/http'
import type { AnnouncementCreateRequest, AnnouncementHistory, PendingAnnouncement } from '@/types/announcement'

export interface AnnouncementPageQuery {
  pageNum?: number
  pageSize?: number
  title?: string
  status?: string
  targetType?: string
}

export interface AnnouncementRecord extends AnnouncementCreateRequest {
  id: number
  status: 'DRAFT' | 'PUBLISHED' | 'REVOKED'
  targetCount: number
  acknowledgedCount: number
  revokedCount: number
  publishedAt?: string
  revokedAt?: string
  createTime?: string
  targetType?: 'ALL' | 'ROLE' | 'USER'
  targetRoleIds?: string
  targetUserIds?: string
}

export interface AnnouncementPageResult {
  records: AnnouncementRecord[]
  total: number
  current: number
  size: number
  pages: number
}

export function announcementPage(data: AnnouncementPageQuery) {
  return $axios<AnnouncementPageResult>('/notification/announcements/page', { method: 'post', data })
}

export function announcementDetail(id: number) {
  return $axios<AnnouncementRecord>(`/notification/announcements/${id}`)
}

export interface AnnouncementStatistics {
  targetCount: number
  pendingCount: number
  acknowledgedCount: number
  revokedCount: number
  acknowledgeRate: number
}

export interface AnnouncementRecipient {
  id: number
  userId: number
  realName: string
  userNameSnapshot: string
  usernameSnapshot: string
  roleSnapshot: string
  deliveryStatus: string
  acknowledgedAt?: string
  revokedAt?: string
}

export function announcementStatistics(id: number) {
  return $axios<AnnouncementStatistics>(`/notification/announcements/${id}/statistics`)
}

export function announcementRecipients(id: number, data: { pageNum?: number; pageSize?: number; deliveryStatus?: string; keyword?: string }) {
  return $axios<{ records: AnnouncementRecipient[]; total: number }>(`/notification/announcements/${id}/recipients/page`, { method: 'post', data })
}

export function announcementAuditLogs(id: number) {
  return $axios<{ records: Array<{ operationType: string; operatorId: number; targetCount: number; clientIp: string; operationTime: string }> }>(`/notification/announcements/${id}/audit-logs`)
}

export function getPendingAnnouncements() {
  return $axios.get<PendingAnnouncement[]>('/notification/announcements/pending')
}

export function acknowledgeAnnouncement(id: number) {
  return $axios.put(`/notification/announcements/${id}/acknowledge`)
}

export function announcementHistoryPage(data: { pageNum?: number; pageSize?: number; deliveryStatus?: string }) {
  return $axios<{ records: AnnouncementHistory[]; total: number }>('/notification/announcements/received/page', { method: 'post', data })
}

export function announcementHistoryDetail(id: number) {
  return $axios<AnnouncementHistory>(`/notification/announcements/received/${id}`)
}

export function createAnnouncementDraft(data: AnnouncementCreateRequest) {
  return $axios.post<number>('/notification/announcements', data)
}

export function updateAnnouncementDraft(id: number, data: AnnouncementCreateRequest) {
  return $axios.put(`/notification/announcements/${id}`, data)
}

export function previewAnnouncement(data: AnnouncementCreateRequest) {
  return $axios.post<{ title: string; contentHtml: string; contentText: string }>(
    '/notification/announcements/preview', data,
  )
}

export function estimateAnnouncementTarget(target: AnnouncementCreateRequest['target']) {
  return $axios.post<number>('/notification/announcements/estimate-target', target)
}

export function publishAnnouncement(id: number) {
  return $axios.post(`/notification/announcements/${id}/publish`)
}

export function revokeAnnouncement(id: number) {
  return $axios.post(`/notification/announcements/${id}/revoke`)
}
