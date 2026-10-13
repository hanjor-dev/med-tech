import $axios from "@/utils/http";
import { Session } from "@/utils/storage";

// ========== 类型定义 ==========

/** 业务类型 */
export type BusinessType = 1 | 2 | 3 | 4 | 5 | 6

/** 操作日志查询参数 */
export interface OperationLogQueryDTO {
	pageNum?: number
	pageSize?: number
	module?: string
	businessType?: BusinessType
	operation?: string
	username?: string
	ip?: string
	status?: 0 | 1
	startTime?: string
	endTime?: string
}

/** 操作日志视图对象 */
export interface OperationLogVO {
	id: number
	userId: number
	username: string
	realName: string
	module: string
	businessType: BusinessType
	businessTypeName: string
	operation: string
	description: string
	requestMethod: string
	requestUrl: string
	requestParams: string
	ip: string
	location: string
	status: 0 | 1
	statusName: string
	errorMessage: string | null
	duration: number
	operationTime: string
}

// ========== 接口函数 ==========

/** 18.1 分页查询操作日志 */
export function getOperationLogPage(data: OperationLogQueryDTO) {
	return $axios('/basic/operation-log/page', { method: 'post', data })
}

/** 18.2 导出操作日志（流式返回 Excel） */
export async function exportOperationLog(data?: Omit<OperationLogQueryDTO, 'pageNum' | 'pageSize'>): Promise<{ blob: Blob; fileName: string }> {
  const token = Session.get('token') || ''
  const res = await fetch('/yi/basic/operation-log/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      satoken: token,
    },
    body: data ? JSON.stringify(data) : '{}',
  })
  if (!res.ok) throw new Error(`导出失败: ${res.status}`)
  const blob = await res.clone().blob()
  const cd = res.headers.get('Content-Disposition') || ''
  let fileName = '操作日志导出.xlsx'
  const m = cd.match(/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|([^;\n]*))/i)
  if (m) {
    const raw = m[2] || m[3] || ''
    try { fileName = decodeURIComponent(raw) } catch { fileName = raw }
  }
  return { blob, fileName }
}
