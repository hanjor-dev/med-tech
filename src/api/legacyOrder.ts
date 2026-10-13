import $axios from '@/utils/http'

export interface LegacyOrderPageQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  businessType?: string
  printRequirement?: string
  deptName?: string
  hospitalName?: string
  areaName?: string
  hospitalDeptName?: string
  doctorName?: string
  patientName?: string
  createTimeStart?: string
  createTimeEnd?: string
  sortField?: string
  sortOrder?: string
}

export interface LegacyOrderVO {
  id: number
  sourceOrderId: number
  orderCode?: string
  status?: string
  businessTypeName?: string
  needsPhysicalDeliveryName?: string
  orgName?: string
  operatorName?: string
  operatorPhone?: string
  hospitalName?: string
  areaName?: string
  hospitalDeptName?: string
  doctorName?: string
  doctorPhone?: string
  patientName?: string
  patientAge?: string
  patientGenderName?: string
  isPostal?: number
  postalAddress?: string
  designerName?: string
  expectedDeliveryDate?: string
  deliveryDate?: string
  estimatedCost?: string
  estimatedCostNumber?: number
  dataEvaluationOpinion?: string
  rebuildProjectSummary?: string
  designStartTime?: string
  designSubmitTime?: string
  productionStartTime?: string
  productionEndTime?: string
  createTime?: string
}

export interface LegacyOrderDetailVO extends LegacyOrderVO {
  sourceSystem?: string
  statusRaw?: string
  businessTypeRaw?: string
  printRaw?: string
  expectedDeliveryRaw?: string
  deliveryRaw?: string
  estimatedCostRaw?: string
  estimatedCostNumber?: number
  patientAgeRaw?: string
  patientGenderRaw?: string
  designStartRaw?: string
  designSubmitRaw?: string
  productionStartRaw?: string
  productionEndRaw?: string
  createTimeRaw?: string
  postalSource?: string
  rebuildProjectJson?: string | Record<string, unknown>
  sourceRowHash?: string
  sourceSnapshotAt?: string
  mappingVersion?: string
  archiveCreatedAt?: string
  archiveUpdatedAt?: string
}

export interface LegacyOrderPageVO {
  records: LegacyOrderVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface LegacyMigrationTaskVO {
  id: number
  status: string
  totalRead: number
  insertedCount: number
  updatedCount: number
  skippedCount: number
  errorCount: number
  errorMessage?: string
  startedAt?: string
  finishedAt?: string
  requestedAt?: string
  heartbeatAt?: string
  sourceSnapshotAt?: string
  taskType?: string
  requestedBy?: number
  mappingVersion?: string
}

export interface LegacyMigrationTaskPageQuery {
  pageNum: number
  pageSize: number
  status?: string
}

export interface LegacyMigrationTaskPageVO {
  records: LegacyMigrationTaskVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface LegacyOrderFilterOptionsVO {
  statuses: string[]
  businessTypes: string[]
}

export async function legacyOrderPage(params: LegacyOrderPageQuery): Promise<LegacyOrderPageVO> {
  return await $axios('/legacy-order/page', { method: 'post', data: params }) as LegacyOrderPageVO
}

export async function legacyOrderDetail(sourceOrderId: number): Promise<LegacyOrderDetailVO> {
  return await $axios(`/legacy-order/detail/${sourceOrderId}`, { method: 'get' }) as LegacyOrderDetailVO
}

export async function legacyOrderFilterOptions(): Promise<LegacyOrderFilterOptionsVO> {
  return await $axios('/legacy-order/filter-options', { method: 'get' }) as LegacyOrderFilterOptionsVO
}

export async function startLegacyOrderMigration(): Promise<number> {
  return await $axios('/legacy-order/migration/incremental', { method: 'post' }) as number
}

export async function getLegacyMigrationTask(taskId: number): Promise<LegacyMigrationTaskVO> {
  return await $axios(`/legacy-order/migration/tasks/${taskId}`, { method: 'get' }) as LegacyMigrationTaskVO
}

export async function legacyMigrationTaskPage(params: LegacyMigrationTaskPageQuery): Promise<LegacyMigrationTaskPageVO> {
  return await $axios('/legacy-order/migration/tasks/page', { method: 'post', data: params }) as LegacyMigrationTaskPageVO
}
