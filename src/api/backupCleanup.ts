import $axios from '@/utils/http'

export interface CleanupEvaluation {
  taskId: string
  status: string
  keys: string[]
  estimatedBytes: number
  protectedCount?: number
  skippedCount?: number
  protectionReasons?: string[]
}
export interface CleanupTask {
  id: string
  olderThanDays: number
  status: string
  keys: string[]
  objectCount?: number
  estimatedBytes?: number
  protectedCount?: number
  skippedCount?: number
  protectedReasons?: Array<{ key?: string; reason?: string } | string>
  skippedReasons?: Array<{ key?: string; reason?: string } | string>
  failedObjects?: Array<{ key?: string; reason?: string; code?: string }>
  auditId?: string
  createdAt?: string
  updatedAt?: string
}

/** COS 清理管理接口；仅供管理员/公司管理员菜单调用。 */
export function evaluateCleanup(data: { olderThanDays: number }) {
  return $axios<CleanupEvaluation>('/api/backup/cleanup/v1/dry-runs', { method: 'post', data })
}
export function listCleanupTasks() { return $axios<CleanupTask[]>('/api/backup/cleanup/v1/tasks') }
export function getCleanupTask(id: string) { return $axios<CleanupTask>(`/api/backup/cleanup/v1/tasks/${id}`) }
export function pauseCleanup(id: string) { return $axios<CleanupTask>(`/api/backup/cleanup/v1/tasks/${id}/pause`, { method: 'post' }) }
export function resumeCleanup(id: string) { return $axios<CleanupTask>(`/api/backup/cleanup/v1/tasks/${id}/resume`, { method: 'post' }) }
