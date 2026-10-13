import type { DraftVO, OrderVO, ModifyApplyVO, ModifyLogRecordVO, ModifyApplyDetailVO } from '@/api/order'

// 草稿组件 emit 事件
export interface DraftEmits {
  (e: 'edit', row: DraftVO): void
  (e: 'delete', row: DraftVO): void
  (e: 'count-update', count: number): void
}

// 订单列表组件 emit 事件
export interface OrderListEmits {
  (e: 'count-update', count: number): void
  (e: 'apply-modify', row: OrderVO): void
  (e: 'execute-modify', row: OrderVO): void
  (e: 'sort-change', payload: { sortField?: string; sortOrder?: string }): void
  (e: 'redirect-cancel-apply', applyId: number | string): void
}

// 数据审核组件 emit 事件
export interface DataAuditEmits {
  (e: 'view', row: OrderVO): void
  (e: 'count-update', count: number): void
}

// 修改申请组件 emit 事件
export interface ModifyApplyEmits {
  (e: 'view', row: ModifyApplyVO): void
  (e: 'count-update', count: number): void
  (e: 'execute-modify', row: ModifyApplyVO): void
}

// 修改留痕组件 emit 事件
export interface ModifyLogEmits {
  (e: 'count-update', count: number): void
}

// 修改申请状态枚举
export type ModifyApplyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

// 申请类型枚举
export type ApplyTypeCode = '14.1' | '14.2' | '14.3'

// 申请类型配置
export interface ApplyTypeConfig {
  code: ApplyTypeCode
  name: string
  description: string
  editableFields?: string[]
}

export const APPLY_TYPE_CONFIGS: ApplyTypeConfig[] = [
  { code: '14.1', name: '基础信息', description: '患者姓名/年龄/性别、医生信息、医院、邮寄信息、期望交付时间' },
  { code: '14.2', name: '影像文件', description: '影像数据文件列表、影像报告文件列表（整体替换）' },
  { code: '14.3', name: '重建项目', description: '新增/更新订单明细（部位、重建项目等）' },
]
