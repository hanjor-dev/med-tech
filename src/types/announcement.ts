export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'REVOKED'
export type AnnouncementRecipientStatus = 'PENDING' | 'ACKNOWLEDGED' | 'REVOKED'

export interface AnnouncementAttachment {
  id?: number
  fileId?: string
  fileName: string
  fileUrl: string
  fileType?: string
  fileSize?: number
  sort?: number
}

export interface AnnouncementTarget {
  targetType: 'ALL' | 'ROLE' | 'USER'
  roleIds?: number[]
  userIds?: number[]
}

export interface AnnouncementCreateRequest {
  title: string
  contentHtml: string
  target: AnnouncementTarget
  attachments?: AnnouncementAttachment[]
}

export interface PendingAnnouncement {
  id: number
  title: string
  contentHtml: string
  forceConfirm: number
  publishedAt: string
  attachments?: AnnouncementAttachment[]
}

export interface AnnouncementHistory {
  id: number
  title: string
  contentHtml: string
  contentText?: string
  forceConfirm: number
  status: AnnouncementStatus
  deliveryStatus: AnnouncementRecipientStatus
  publishedAt: string
  acknowledgedAt?: string
  revokedAt?: string
  attachments?: AnnouncementAttachment[]
}

export interface AnnouncementSocketEvent {
  type: 'ANNOUNCEMENT_PUBLISHED' | 'ANNOUNCEMENT_REVOKED'
  data: {
    announcementId: number
    publishedAt?: string
  }
}
