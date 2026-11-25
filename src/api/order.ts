import $axios from '@/utils/http'
import { Session } from '@/utils/storage'
import type { DesignReportVO, ModelListItem, PackageListItem } from './design'

// ============================================================
// 草稿相关
// ============================================================

/** 草稿分页查询请求 */
export interface DraftPageQuery {
  pageNum?: number
  pageSize?: number
  hospitalId?: number
  status?: number
}

/** 草稿列表项 */
export interface DraftVO {
  id: number
  orderCode?: string
  orderType: number
  orderTypeName: string
  needsPhysicalDelivery: number
  businessType: string
  orgName: string
  hospitalId: number
  hospitalName: string
  hospitalDeptId: number
  hospitalDeptName: string
  patientName: string
  status: number
  statusName: string
  itemCount: number
  expiresAt: string
  createTime: string
}

/** 草稿分页响应 */
export interface DraftPageVO {
  records: DraftVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 草稿明细项 */
export interface DraftItemVO {
  id: number
  bodyPartId: number
  bodyPartName: string
  projectId: number
  projectName: string
  projectEstimatedHours: number
  projectDesc: string
  formingRequirement: string
  otherRequirement: string
  categoryCode: string
  categoryName: string
  sortOrder: number
}

/** 草稿详情响应 */
export interface DraftDetailVO {
  id: number
  operatorId: number
  operatorName: string
  operatorPhone: string
  orderType: number
  orderTypeName: string
  needsPhysicalDelivery: number
  needsPhysicalDeliveryName: string
  businessType: string
  businessTypeName: string
  orgId: number
  orgName: string
  hospitalId: number
  hospitalName: string
  hospitalDeptId: number
  hospitalDeptName: string
  doctorId: number
  doctorName: string
  doctorPhone: string
  patientName: string
  patientAge: number
  patientGender: string
  patientGenderName: string
  isUrgent: number
  isPostal: number
  postalAddress: string
  expectedDeliveryDate: string
  status: number
  statusName: string
  expiresAt: string
  itemCount: number
  items: DraftItemVO[]
  imageDataFiles: ImageFileVO[]
  imageReportFiles: ImageFileVO[]
  approvalFiles?: ImageFileVO[]
  createTime: string
  updateTime: string
}

/** 创建/更新草稿请求 */
export interface DraftDTO {
  id?: number
  orderType: number
  needsPhysicalDelivery: number
  businessType: string
  orgId: number
  orgName?: string
  operatorName?: string
  operatorPhone?: string
  hospitalId: number
  hospitalName?: string
  hospitalDeptId?: number
  hospitalDeptName?: string
  doctorId?: number
  doctorName?: string
  doctorPhone?: string
  patientName: string
  patientAge?: number
  patientGender?: string
  isUrgent?: number
  isPostal?: number
  postalAddress?: string
  expectedDeliveryDate?: string
  items?: DraftItemDTO[]
  imageDataFileIds?: string[]
  imageReportFileIds?: string[]
  approvalFileIds?: string[]
}

/** 草稿重建项目 */
export interface DraftItemDTO {
  bodyPartId?: number
  bodyPartName?: string
  projectId?: number
  projectName?: string
  projectEstimatedHours?: number
  projectDesc?: string
  formingRequirement?: string
  otherRequirement?: string
  sortOrder?: number
}

// ============================================================
// 订单相关
// ============================================================

/** 订单分页查询请求 */
export interface OrderPageQuery {
  pageNum?: number
  pageSize?: number
  ids?: number[]
  orderCode?: string
  hospitalId?: number
  areaId?: number
  doctorName?: string
  patientName?: string
  businessType?: string
  createTimeStart?: string
  createTimeEnd?: string
  bodyPartIds?: number[]
  projectIds?: number[]
  operatorId?: number
  status?: number
  sortField?: string
  sortOrder?: string
}

/** 重建项目摘要 */
export interface RebuildProjectVO {
  projectName: string
  bodyPartName: string
  categoryCode: string
  categoryName: string
}

/** 订单列表项 */
export interface OrderVO {
  id: number
  orderCode: string
  orderType: number
  orderTypeName: string
  needsPhysicalDelivery: number
  businessType: string
  businessTypeName: string
  orgId: number
  orgName: string
  operatorId: number
  operatorName: string
  hospitalId: number
  hospitalName: string
  areaId: number
  areaName: string
  fullAreaName: string
  hospitalDeptId: number
  hospitalDeptName: string
  doctorId: number
  doctorName: string
  doctorPhone?: string
  patientName: string
  patientAge: number
  patientGender: string
  patientGenderName: string
  isUrgent: number
  isPostal: number
  postalAddress?: string
  designerId: number
  designerName: string
  phase: number
  status: number
  statusName?: string
  estimatedCost: number
  expectedDeliveryDate: string
  createTime: string
  rebuildProjectList: RebuildProjectVO[]
  items?: OrderItemVO[]
  /** 角标状态：null=无申请，PENDING=待审核，APPROVED=已同意待执行 */
  pendingModifyApplyStatus?: string | null
  /** 有申请时的申请ID */
  pendingModifyApplyId?: number | null
  /** 是否可以申请修改：true=可以，false=不可以 */
  canApply?: boolean
  version: number
  imageDataFiles?: ImageFileVO[]
  imageReportFiles?: ImageFileVO[]
  approvalFiles?: ImageFileVO[]
}

/** 订单分页响应 */
export interface OrderPageVO {
  records: OrderVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 影像文件 */
export interface ImageFileVO {
  fileId: string
  fileName: string
  fileUrl: string
  downloadUrl?: string
  thUrl: string
  fileSize: number
  fileSizeText: string
  fileExt: string
  fileCategory?: string
  fileCategoryName?: string
}

/** 订单明细项 */
export interface OrderItemVO {
  id: number
  bodyPartId: number
  bodyPartName: string
  projectId: number
  projectName: string
  categoryCode: string
  categoryName: string
  projectEstimatedHours: number
  projectDesc: string
  formingRequirement: string
  otherRequirement: string
  sortOrder: number
}

/** 订单详情响应 */
export interface OrderDetailVO extends OrderVO {
  currentHandlerId: number
  currentHandlerName: string
  producerId: number
  producerName: string
  auditRemark: string
  designReviewRemark: string
  dataEvaluationOpinion: string
  designStartTime: string
  designSubmitTime: string
  actualCompleteTime: string
  updateTime: string
  itemCount: number
  availableActions: string[]
  items: OrderItemVO[]
  imageDataFiles: ImageFileVO[]
  imageReportFiles: ImageFileVO[]
  approvalFiles?: ImageFileVO[]
  modelList?: ModelListItem[]
  reports?: DesignReportVO[]
  /** 订单详情中加工申请单摘要仅返回归档版本。 */
  packageList?: PackageListItem[]
}

/** 直接创建订单请求 */
export interface CreateOrderDTO {
  orderType: number
  needsPhysicalDelivery: number
  businessType: string
  orgId: number
  orgName?: string
  operatorName?: string
  operatorPhone?: string
  hospitalId: number
  hospitalName?: string
  hospitalDeptId?: number
  hospitalDeptName?: string
  doctorId?: number
  doctorName?: string
  doctorPhone?: string
  patientName: string
  patientAge?: number
  patientGender?: string
  isUrgent?: number
  isPostal?: number
  postalAddress?: string
  expectedDeliveryDate?: string
  items: CreateOrderItemDTO[]
  imageDataFileIds?: string[]
  imageReportFileIds?: string[]
  approvalFileIds?: string[]
}

/** 创建订单明细 */
export interface CreateOrderItemDTO {
  bodyPartId: number
  projectId: number
  projectEstimatedHours?: number
  projectDesc?: string
  formingRequirement?: string
  otherRequirement?: string
  sortOrder?: number
}

// ============================================================
// 修改申请相关
// ============================================================

/** 修改申请列表项 */
export interface ModifyApplyVO {
  applyId: number
  orderId: number
  orderCode: string
  applyUserName: string
  applyTime: string
  expireTime: string
  status: number
  statusDesc: string
  changeCount: number
  changeSummary: string
}

/** 修改申请分页响应 */
export interface ModifyApplyPageVO {
  records: ModifyApplyVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 修改申请分页请求 */
export interface ModifyApplyQuery {
  pageNum?: number
  pageSize?: number
  applyTimeStart?: string
  applyTimeEnd?: string
  orderCode?: string
  status?: number
}

/**
 * 查询修改申请列表
 * POST /order/modify/apply/list
 */
export async function modifyApplyList(params: ModifyApplyQuery): Promise<ModifyApplyPageVO> {
  const res: any = await $axios.post('/order/modify/apply/list', params)
  return res as ModifyApplyPageVO
}

// ============================================================
// 导出相关
// ============================================================

/** 可导出字段项 */
export interface ExportFieldItem {
  field: string
  label: string
  checked?: boolean
}

/**
 * 获取可导出字段列表
 * GET /order/export/fields
 */
export async function orderExportFields(): Promise<ExportFieldItem[]> {
  const res: any = await $axios('/order/export/fields', { method: 'get' })
  return (Array.isArray(res) ? res : res?.data ?? []) as ExportFieldItem[]
}

/** 自定义导出请求参数 */
export interface OrderCustomExportDTO {
  createTimeStart?: string
  createTimeEnd?: string
  exportFields: string[]
  fieldLabels?: Record<string, string>
}

/**
 * 自定义导出订单（流式返回 Excel）
 * POST /order/export/custom
 */
export async function orderCustomExport(params: OrderCustomExportDTO): Promise<{ blob: Blob; fileName: string }> {
  const token = Session.get('token') || ''
  const res = await fetch('/yi/order/export/custom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      satoken: token,
    },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`导出失败: ${res.status}`)

  const cd = res.headers.get('Content-Disposition') || ''
  let fileName = '订单导出.xlsx'
  const m = cd.match(/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|([^;\n]*))/i)
  if (m) fileName = decodeURIComponent(m[2] || m[3] || fileName)

  const contentType = res.headers.get('Content-Type') || ''
  if (!/spreadsheet|octet-stream|excel/i.test(contentType)) {
    const text = await res.text()
    let errorMsg = '导出失败'
    try {
      const json = JSON.parse(text)
      errorMsg = json.message || json.msg || errorMsg
    } catch {
      // not json, keep default message
    }
    throw new Error(errorMsg)
  }

  const blob = await res.blob()
  return { blob, fileName }
}

// ============================================================
// 列配置相关
// ============================================================

/** 列定义 */
export interface ColumnDef {
  field: string
  label: string
  visible: boolean
  width?: number
  sort?: number
}

/** 列配置响应 */
export interface ColumnConfigVO {
  columns: ColumnDef[]
}

/** 列配置保存请求 */
export interface ColumnConfigSaveDTO {
  columns: Array<{ key: string; label?: string; field?: string; visible: boolean; width?: number; sort?: number }>
}

// ============================================================
// API 方法
// ============================================================

/**
 * 分页查询草稿列表
 * POST /order/draft/list
 */
export async function draftPageQuery(params: DraftPageQuery): Promise<DraftPageVO> {
  const res: any = await $axios('/order/draft/list', { method: 'post', data: params })
  return res as DraftPageVO
}

/**
 * 查询草稿详情
 * GET /order/draft/{id}
 */
export async function draftDetail(id: number): Promise<DraftDetailVO> {
  const res: any = await $axios(`/order/draft/${id}`, { method: 'get' })
  return res as DraftDetailVO
}

/**
 * 创建或更新草稿
 * POST /order/draft
 */
export async function draftSave(data: DraftDTO): Promise<number> {
  const res: any = await $axios('/order/draft', { method: 'post', data })
  return res as number
}

/**
 * 删除草稿
 * DELETE /order/draft/{id}
 */
export async function draftDelete(id: number): Promise<void> {
  await $axios(`/order/draft/${id}`, { method: 'delete' })
}

/**
 * 提交草稿转正式订单
 * POST /order/draft/{id}/submit
 */
export async function draftSubmit(id: number): Promise<number> {
  const res: any = await $axios(`/order/draft/${id}/submit`, { method: 'post' })
  return res as number
}

/**
 * 分页查询订单列表
 * POST /order/page
 */
export async function orderPageQuery(params: OrderPageQuery): Promise<OrderPageVO> {
  const res: any = await $axios('/order/page', { method: 'post', data: params })
  return res as OrderPageVO
}

/**
 * 查询订单详情
 * GET /order/{id}
 */
export async function orderDetail(id: number | string, localErrorHandling = false): Promise<OrderDetailVO> {
  const res: any = await $axios(`/order/${encodeURIComponent(id)}`, { method: 'get', localErrorHandling })
  return res as OrderDetailVO
}

/**
 * 检查订单是否可以申请修改
 * GET /order/modify/{orderId}/can-apply
 */
export async function checkOrderCanModify(orderId: number): Promise<boolean> {
  const res: any = await $axios(`/order/modify/${orderId}/can-apply`, { method: 'get' })
  return res as boolean
}

/**
 * 直接创建订单（直提）
 * POST /order
 */
export async function orderCreate(data: CreateOrderDTO): Promise<number> {
  const res: any = await $axios('/order', { method: 'post', data })
  return res as number
}

/**
 * 更新订单（修改模式直接提交）
 * PUT /order/{id}
 */
export async function orderUpdate(id: number, data: Record<string, any>): Promise<void> {
  await $axios(`/order/${id}`, { method: 'put', data })
}

/**
 * 提交订单
 * POST /order/{id}/submit
 */
export async function orderSubmit(id: number): Promise<void> {
  await $axios(`/order/${id}/submit`, { method: 'post' })
}

/**
 * 撤回订单
 * POST /order/{id}/withdraw
 */
export async function orderWithdraw(id: number): Promise<void> {
  await $axios(`/order/${id}/withdraw`, { method: 'post' })
}

/**
 * 审核通过
 * POST /order/{id}/audit-pass
 */
export async function orderAuditPass(id: number, version: number, remark?: string): Promise<void> {
  await $axios(`/order/${id}/audit-pass`, { method: 'post', data: { version, remark } })
}

/**
 * 审核驳回
 * POST /order/{id}/audit-reject
 */
export async function orderAuditReject(id: number, version: number, remark: string): Promise<void> {
  await $axios(`/order/${id}/audit-reject`, { method: 'post', data: { version, remark } })
}

/**
 * 手动完成订单
 * POST /order/main/{orderId}/manual-complete
 */
export async function orderManualComplete(orderId: number, version: number): Promise<void> {
  await $axios(`/order/${orderId}/manual-complete`, { method: 'post', data: { version } })
}

/**
 * 查询可执行动作
 * GET /order/{id}/actions
 */
export async function orderActions(id: number): Promise<string[]> {
  const res: any = await $axios(`/order/${id}/actions`, { method: 'get' })
  return res as string[]
}

/**
 * 删除订单
 * DELETE /order/{id}
 */
export async function orderDelete(id: number): Promise<void> {
  await $axios(`/order/${id}`, { method: 'delete' })
}

/**
 * 提交取消订单的申请
 * POST /order/{id}/cancel
 */
export async function orderCancel(orderId: number, version: number,reason: string): Promise<void> {
  await $axios(`/order/cancel-apply`, { method: 'post', data: { orderId, version,reason } })
}

// ============================================================
// 取消申请相关
// ============================================================

/** 取消申请查询参数 */
export interface CancelApplyQuery {
  pageNum?: number
  pageSize?: number
  orderId?: number
  orderCode?: string
  hospitalId?: number
  areaId?: number
  doctorName?: string
  patientName?: string
  businessType?: string
  createTimeStart?: string
  createTimeEnd?: string
  bodyPartIds?: number[]
  projectIds?: number[]
  operatorId?: number
  status?: number
  phase?: number
  sortField?: string
  sortOrder?: string
}

/** 取消申请列表项 */
export interface CancelApplyVO {
  id: number
  orderId: number
  orderCode: string
  applyByName: string
  createTime: string
  applyReason: string
  auditStatus: number
  auditReason: string
}

/** 取消申请分页响应 */
export interface CancelApplyPageVO {
  records: CancelApplyVO[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 查询取消申请列表
 * POST /order/cancel-apply/pending/list
 */
export async function cancelApplyList(params: CancelApplyQuery): Promise<CancelApplyPageVO> {
  const res: any = await $axios('/order/cancel-apply/pending/list', { method: 'post', data: params })
  return res as CancelApplyPageVO
}

/**
 * 查询取消申请详情
 * GET /order/cancel-apply/{applyId}
 */
export async function cancelApplyDetail(applyId: number): Promise<CancelApplyVO> {
  const res: any = await $axios(`/order/cancel-apply/${applyId}`, { method: 'get' })
  return res as CancelApplyVO
}

/**
 * 审核取消申请
 * POST /order/cancel-apply/{applyId}/audit
 */
export async function cancelApplyAudit(applyId: number, approved: boolean, reason?: string): Promise<void> {
  await $axios(`/order/cancel-apply/${applyId}/audit`, {
    method: 'post',
    data: { approved, reason }
  })
}

/** 取消申请历史记录 */
export interface CancelApplyHistoryItem {
  id: number
  orderId: number
  orderCode: string
  applyByName: string
  createTime: string
  applyReason: string
  auditStatus: number
  auditTime: string
  auditByName: string
  rejectReason: string
}

/**
 * 查询取消申请历史记录
 * GET /order/cancel-apply/order/{orderId}/history
 */
export async function cancelApplyHistory(orderId: number): Promise<CancelApplyHistoryItem[]> {
  const res: any = await $axios(`/order/cancel-apply/order/${orderId}/history`, { method: 'get' })
  return res as CancelApplyHistoryItem[]
}

/** 我的取消申请记录 */
export interface MyCancelApplyVO {
  id: number
  orderId: number
  orderCode: string
  applyBy: number
  applyByName: string
  applyReason: string
  auditStatus: number
  auditBy: number
  auditByName: string
  auditReason: string
  auditTime: string
  createTime: string
}

/** 我的取消申请分页响应 */
export interface MyCancelApplyPageVO {
  records: MyCancelApplyVO[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 查询我的取消申请列表
 * POST /order/cancel-apply/my-applies
 */
export async function myCancelApplyList(params: { pageNum?: number; pageSize?: number }): Promise<MyCancelApplyPageVO> {
  const res: any = await $axios('/order/cancel-apply/my-applies', { method: 'post', data: params })
  return res as MyCancelApplyPageVO
}

/**
 * 重新提交订单
 * POST /order/{id}/resubmit
 */
export async function orderResubmit(id: number, version: number): Promise<void> {
  await $axios(`/order/${id}/resubmit`, { method: 'post', data: { version } })
}

/**
 * 获取当前用户列配置
 * GET /order/column-config
 */
export async function columnConfigGet(): Promise<ColumnConfigVO> {
  const res: any = await $axios('/order/column-config', { method: 'get' })
  return (res?.data || res) as ColumnConfigVO
}

/**
 * 保存用户列配置
 * PUT /order/column-config
 */
export async function columnConfigSave(data: ColumnConfigSaveDTO): Promise<void> {
  await $axios('/order/column-config', { method: 'put', data })
}

/**
 * 重置用户列配置
 * DELETE /order/column-config
 */
export async function columnConfigReset(): Promise<void> {
  await $axios('/order/column-config', { method: 'delete' })
}

/**
 * 导出订单列表（流式返回 Excel）
 * POST /order/export
 */
export async function orderExport(params: OrderPageQuery): Promise<{ blob: Blob; fileName: string }> {
  const token = Session.get('token') || ''
  const res = await fetch('/yi/order/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      satoken: token,
    },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`导出失败: ${res.status}`)
  const blob = await res.clone().blob()
  const cd = res.headers.get('Content-Disposition') || ''
  let fileName = '订单导出.xlsx'
  const m = cd.match(/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|([^;\n]*))/i)
  if (m) {
    const raw = m[2] || m[3] || ''
    try { fileName = decodeURIComponent(raw) } catch { fileName = raw }
  }
  return { blob, fileName }
}

/**
 * 查询待审核修改申请列表
 * POST /order/modify/pending
 */
export async function modifyApplyPending(params: ModifyApplyQuery): Promise<ModifyApplyPageVO> {
  const res: any = await $axios('/order/modify/apply/pending', { method: 'post', data: params })
  return res as ModifyApplyPageVO
}

/** 查询可申请类型响应 */
export interface ApplicableTypesVO {
  allowedTypes: string[]
  allowedTypeNames: string[]
  reason?: string
  pendingApplyId?: number
}

/**
 * 查询订单可申请的修改类型
 * GET /order/modify/{orderId}/applicable-types
 */
export async function getApplicableTypes(orderId: number): Promise<ApplicableTypesVO> {
  const res: any = await $axios(`/order/modify/${orderId}/applicable-types`, { method: 'get' })
  return res as ApplicableTypesVO
}

/** 修改申请详情响应 */
export interface ModifyApplyDetailVO extends ModifyApplyVO {
  diff: ModifyApplyDiff
}

/** 变更内容 */
export interface ModifyApplyDiff {
  infoFields: ModifyApplyInfoField[]
  items: ModifyApplyItemsDiff
  imageData: ModifyApplyImageDiff
  imageReport: ModifyApplyImageDiff
}

/** 基础信息字段变更 */
export interface ModifyApplyInfoField {
  fieldName: string
  fieldLabel: string
  oldValue: string
  newValue: string
  oldDisplay: string
  newDisplay: string
}

/** 重建项目变更 */
export interface ModifyApplyItemsDiff {
  added: ModifyApplyItem[]
  deleted: ModifyApplyItem[]
  modified: ModifyApplyItem[]
  changed: boolean
}

/** 重建项目条目 */
export interface ModifyApplyItem {
  projectName: string
  bodyPartName: string
  categoryName: string
}

/** 图片变更 */
export interface ModifyApplyImageDiff {
  added: string[]
  deleted: string[]
  changed: boolean
}

/**
 * 查询申请详情
 * GET /order/modify/apply/{applyId}
 */
export async function modifyApplyDetail(applyId: number): Promise<ModifyApplyDetailVO> {
  const res: any = await $axios(`/order/modify/apply/${applyId}`, { method: 'get' })
  return res as ModifyApplyDetailVO
}

/**
 * 审核修改申请
 * PUT /order/modify/apply/{applyId}/audit
 */
export async function modifyApplyAudit(applyId: number, flag: 1 | 2, remark?: string): Promise<void> {
  await $axios(`/order/modify/apply/${applyId}/audit`, {
    method: 'put',
    data: {result: flag, remark}
  })
}

/**
 * 撤回修改申请
 * PUT /order/modify/apply/{applyId}/withdraw
 */
export async function backModifyApplyAudit(applyId: number): Promise<void> {
  await $axios(`/order/modify/apply/${applyId}`, { method: 'delete' })
}

/**
 * 执行订单修改
 * PUT /order/modify/execute/{applyId}
 */
export async function modifyExecute(applyId: number, data: Record<string, any>): Promise<void> {
  await $axios(`/order/modify/execute/${applyId}`, { method: 'put', data })
}

export async function getOrderPhase(): Promise<void> {
  await $axios('/flow/select/phases', { method: 'get' })
}

export async function getOrderStatus(phase?: number): Promise<Array<{ label: string; value: string; show?: boolean }>> {
  const res: any = await $axios('/flow/select/statuses', { method: 'get', params: phase !== undefined ? { phase } : {} })
  const list: any[] = Array.isArray(res) ? res : (res?.list ?? res?.data ?? [])
  return list.map((item: any) => ({
    label: item.name,
    value: item.value,
    show: item.show,
  }))
}

/**
 * 查询我发起的申请列表
 * POST /order/modify/apply/my
 */
export async function modifyApplyMy(params: ModifyApplyQuery): Promise<ModifyApplyPageVO> {
  const res: any = await $axios('/order/modify/apply/my', { method: 'post', data: params })
  return res as ModifyApplyPageVO
}

// ============================================================
// 19.23 修改留痕记录
// ============================================================

/** 订单修改留痕记录 */
export interface ModifyLogRecordVO {
  id: number
  orderId: number
  orderCode: string
  applyId: number
  fieldName: string
  fieldLabel: string
  oldValue: string
  newValue: string
  modifierId: number
  modifierName: string
  createTime: string
}

/** 修改留痕分页查询参数 */
export interface ModifyLogQuery {
  pageNum: number
  pageSize: number
  orderId?: number
  applyId?: number
}

/** 修改留痕分页响应 */
export interface ModifyLogPageVO {
  records: ModifyLogRecordVO[]
  total: number
  size: number
  current: number
}

/**
 * 查询订单的修改留痕记录
 * POST /order/modify/{orderId}/logs
 */
export async function orderModifyLogs(params: ModifyLogQuery, orderId: number): Promise<ModifyLogPageVO> {
  const res: any = await $axios(`/order/modify/${orderId}/logs`, { method: 'post', data: params })
  return res as ModifyLogPageVO
}

/** 发起修改申请请求 */
export interface OrderModifyApplyDTO {
  applyTypes: string
  applyReason?: string
}

/** 发起修改申请响应 */
export interface OrderModifyApplyVO {
  id: number
  orderId: number
  orderCode: string
  applyTypeCodes: string
  applyTypeNames: string
  applyReason: string
  status: string
  statusText: string
  applicantId: number
  applicantName: string
  createTime: string
}

/**
 * 发起订单修改申请
 * POST /order/modify/{orderId}/apply
 */
export async function orderModifyApply(orderId: number, dto: OrderModifyFullDTO): Promise<OrderModifyApplyVO> {
  const res: any = await $axios(`/order/modify/${orderId}/apply`, { method: 'post', data: dto })
  return res as OrderModifyApplyVO
}

/** 直接修改订单（无需审核）—— 差量字段格式 */
export interface OrderModifyDirectDTO {
  /** 基本信息变更列表 */
  infoFields?: Array<{ field: string; value: any }>
  /** 重建项目变更列表 */
  items?: Array<{
    /** 订单明细ID */
    orderItemId: number
    /** 变更字段列表 */
    fields: Array<{ field: string; value: any }>
  }>
  imageDataFileIds?: string[]
  imageReportFileIds?: string[]
}

/**
 * 全部字段修改订单
 * PUT /order/modify/{orderId}/full
 */
export interface OrderModifyFullDTO {
  orderType?: number
  needsPhysicalDelivery?: number
  businessType?: string
  hospitalId?: number
  hospitalDeptId?: number
  doctorId?: number
  doctorName?: string
  doctorPhone?: string
  patientName?: string
  patientAge?: number
  patientGender?: string
  isUrgent?: number
  isPostal?: number
  postalAddress?: string
  expectedDeliveryDate?: string
  items?: Array<{
    id?: number
    bodyPartId?: number
    bodyPartName?: string
    projectId?: number
    projectName?: string
    projectDesc?: string
    formingRequirement?: string
    otherRequirement?: string
  }>
  imageDataFileIds?: string[]
  imageReportFileIds?: string[]
  approvalFileIds?: string[]
  // 以下字段从 props.orderData 获取
  orgId?: number
  orderCode?: string
  operatorId?: number
  designerId?: number
  phase?: number
  status?: number
  estimatedCost?: number
  version?: number
}

export async function orderModifyFull(orderId: number, data: OrderModifyFullDTO): Promise<void> {
  await $axios(`/order/modify/${orderId}/full`, { method: 'put', data })
}
export async function orderModifyFullV2(orderId: number, data: OrderModifyFullDTO): Promise<any> {
  const res: any = await $axios(`/order/modify/${orderId}/full-v2`, { method: 'put', data })
  return res
}

// ── 经典案例 ──────────────────────────────────────────────────────────

/** 经典案例列表请求 */
export interface ClassicCaseListQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  startTime?: string
  endTime?: string
}

/** 经典案例列表响应 */
export interface ClassicCaseListVO {
  records: ClassicCaseVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 经典案例列表项 */
export interface ClassicCaseVO {
  id: number
  orderId: number
  orderCode: string
  patientName: string
  patientGender: string
  patientGenderName: string
  patientAge: number
  hospitalName: string
  orgName: string
  operatorName: string
  orderType: number
  orderTypeName: string
  businessType: string
  businessTypeName: string
  phase: number
  status: number
  statusName: string
  classicCaseTime: string
  classicCaseBy: number
  classicCaseByName: string
  classicCaseRemark?: string
  createTime: string
}

/**
 * 查询经典案例列表
 * POST /order/classic-case/list
 */
export async function classicCaseList(params: ClassicCaseListQuery): Promise<ClassicCaseListVO> {
  const res: any = await $axios('/order/classic-case/list', { method: 'post', data: params })
  return res as ClassicCaseListVO
}

/**
 * 标记为经典案例
 * POST /order/classic-case/mark
 */
export async function classicCaseMark(orderId: number, remark?: string): Promise<void> {
  const data: any = { orderId }
  if (remark) data.remark = remark
  await $axios('/order/classic-case/mark', { method: 'post', data })
}

/**
 * 经典案例详情
 * GET /order/classic-case/{orderId}
 */
export async function classicCaseDetail(orderId: number): Promise<ClassicCaseVO> {
  const res: any = await $axios(`/order/classic-case/${orderId}`, { method: 'get' })
  return res as ClassicCaseVO
}

/** 订单统计数据 */
export interface OrderStatisticsVO {
  total: number
  pendingAudit: number
  designing: number
}

/**
 * 获取订单统计数据
 * GET /order/statistics
 */
export async function orderStatistics(): Promise<OrderStatisticsVO> {
  const res: any = await $axios('/order/statistics', { method: 'get' })
  return res as OrderStatisticsVO
}


