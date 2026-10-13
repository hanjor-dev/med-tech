export enum MessageType {
  MESSAGE = 'MESSAGE',
  POPUP = 'POPUP'
}

export enum MessageCategory {
  ORDER = 'ORDER',
  APPROVAL = 'APPROVAL',
  DESIGN = 'DESIGN',
  PRODUCTION = 'PRODUCTION',
  SYSTEM = 'SYSTEM'
}

export interface NotificationMessage {
  id: number
  messageType: MessageType
  category: MessageCategory
  title: string
  content?: string
  bizType: string
  bizId: number
  bizData?: string
  jumpUrl?: string
  isRead: number
  isConfirmed: number
  createTime: string
}

export interface MessageQueryParams {
  category?: MessageCategory
  isRead?: number
  isConfirmed?: number
  messageType?: MessageType
  pageNum?: number
  pageSize?: number
}

export interface UnreadCount {
  total: number
  byCategory: Record<string, number>
}

export interface WebSocketMessage {
  type: 'NEW_MESSAGE'
  data: NotificationMessage
}
