import $axios from '@/utils/http'

export interface DashboardQuery {
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  startDate?: string
  endDate?: string
}

export interface CardVO {
  key: string
  title: string
  value: number | string
  change?: string
  trend?: 'up' | 'down' | 'flat'
  link?: string
  unit?: string
}

export interface ChartVO {
  key: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'funnel' | 'ring' | 'heatmap'
  data: any
}

export interface TodoVO {
  id: number
  title: string
  count?: number
  link?: string
  urgent?: boolean
}

export interface SystemVO {
  healthStatus: 'healthy' | 'warning' | 'error'
  avgResponseTime: string
  onlineUsers: number
  avgOrderCycle: string
}

export interface DashboardVO {
  cards: CardVO[]
  charts: ChartVO[]
  todos: TodoVO[]
  system?: SystemVO
}

export const getDashboard = (roleCode: string, params: DashboardQuery): Promise<DashboardVO> =>
  $axios.post(`/dashboard/${roleCode}`, params).then((res: any) => res.data ?? res)
