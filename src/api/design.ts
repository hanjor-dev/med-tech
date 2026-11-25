import $axios from '@/utils/http'
import type { ImageFileVO } from './order'
import { Session } from '@/utils/storage'

// ============================================================
// 类型定义
// ============================================================

/** 设计工单列表查询参数 */
export interface DesignWorkorderQuery {
  pageNum?: number
  pageSize?: number
  orderCode?: string
  patientName?: string
  status?: number
  isUrgent?: number
  hospitalId?: number
  businessType?: string
  createTimeStart?: string
  createTimeEnd?: string
  sortField?: string
  sortOrder?: 'ASC' | 'DESC'
}

/** 设计工单列表项 VO */
export interface DesignWorkorderVO {
  id: number
  orderCode: string
  status: number
  statusName: string
  businessType: string
  businessTypeName: string
  orderType: number
  orderTypeName: string
  needsPhysicalDelivery: number
  needsPhysicalDeliveryName: string
  patientName: string
  hospitalId: number
  hospitalName: string
  hospitalDeptName: string
  doctorName: string
  areaName: string
  rebuildProjectSummary: string
  rebuildProjectList: Array<{
    projectName: string
    bodyPartName: string
    categoryCode: string
    categoryName: string
    count: number
    projectDesc: string
    formingRequirement: string
    otherRequirement: string
  }>
  designerId: number
  designerName: string
  packageCount: number
  designStartTime: string
  expectedDeliveryDate: string
  createTime: string
  orgName: string
  operatorName: string
  operatorPhone: string
  rejectReason: string | null
  hasPrintInfo: number
  version: number
}

/** 设计工单分页响应 */
export interface DesignWorkorderPageVO {
  records: DesignWorkorderVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 设计工单统计数据 */
export interface DesignWorkorderStatisticsVO {
  total: number
  pendingDesign: number
  designing: number
}

/** 列配置项 */
export interface DesignColumnItem {
  field: string
  label: string
  visible: boolean
  sort: number
  width?: number | null
  fixed?: string | null
  sortField?: string
}

/** 列配置响应 */
export interface DesignColumnConfigVO {
  module: string
  columns: DesignColumnItem[]
}

/** 保存列配置请求 */
export interface DesignColumnConfigSaveDTO {
  columns: DesignColumnItem[]
}

/** 工单详情 - 重建项目项 */
export interface DesignRebuildProjectItem {
  projectName: string
  bodyPartName: string
  categoryCode: string
  categoryName: string
  count: number
  projectDesc: string
  formingRequirement: string
  otherRequirement: string
}

/** 工单详情 - 提交校验 */
export interface DesignSubmitCheckVO {
  hasPackage: boolean
  hasPrintInfo: boolean
  hasInstruction: boolean
  hasDrawing: boolean
  hasModel: boolean
  hasReport: boolean
  hasRevisedDocs: boolean
  hasDrawingConfirmed: boolean
  hasInstructionConfirmed: boolean
  canSubmit: boolean
  blockReason: string | null
}

/** 包内文件项 */
export interface PackageFileItem {
  id: number
  packageId: number
  fileName: string
  fileExt: string
  filePath: string
  fileSize: number
  sortOrder: number
  hasPrintInfo: boolean
  fileUrl: string
  downloadUrl?: string
}

/** 最新指令单版本 */
export interface PackageInstructionVO {
  id: number
  version: string
  versionSeq: number
  templateFileId: string
  templateFileUrl: string
  templateDownloadUrl?: string
  revisedFileId: string
  revisedFileUrl: string
  revisedDownloadUrl?: string
  generateTime: string
  revisedUploadTime: string | null
  isConfirmed: number
  confirmTime: string | null
}

/** 最新图纸版本 */
export interface PackageDrawingVO {
  id: number
  version: string
  versionSeq: number
  templateFileId: string
  templateFileUrl: string
  templateDownloadUrl?: string
  revisedFileId: string
  revisedFileUrl: string
  revisedDownloadUrl?: string
  generateTime: string
  revisedUploadTime: string | null
  isConfirmed: number
  confirmTime: string | null
  productCategory: string
  sourceType: string
}

/** 数据包列表项 */
export interface PackageListItem {
  id: number
  orderId: number
  orderCode: string
  packageCode: string
  packageSeq: number
  fileId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileCount: number
  uploadTime: string
  files: PackageFileItem[]
  latestInstruction: PackageInstructionVO | null
  latestDrawings: PackageDrawingVO[]
  batchId?: number | null
  batchNo?: string | null
  batchStatus?: string | null
  isCurrentBatch?: boolean
  editable?: boolean
  canDelete?: boolean
  canEditPrintInfo?: boolean
  canEditDocuments?: boolean
  printInfoCompleted?: boolean
  printInfoCount?: number
}

/** 可视化模型列表项 */
export interface ModelListItem {
  id: number
  orderId: number
  fileId: string
  modelId: string
  fileName: string
  fileUrl: string
  downloadUrl?: string
  fileSize: number
  fileExt: string
  createTime: string
}

/** 设计报告 */
export interface DesignReportVO {
  id: string
  bizType: string
  bizId: number
  fileName: string
  filePath: string
  fileUrl: string
  downloadUrl?: string
  fileSize: number
  fileSizeText: string
  fileType: string
  fileExt: string
  platform: string
  thUrl: string
  thSize: number
  fileHash: string
  createTime: string
}

/** 工单详情 VO */
export interface DesignWorkorderDetailVO {
  id: number
  orderCode: string
  publicOrderCode?: string
  status: number
  statusName: string
  phase: number
  phaseName: string
  designMode: number | null
  rejectReason: string | null
  orderType: number
  orderTypeName: string
  needsPhysicalDelivery: number
  needsPhysicalDeliveryName: string
  businessType: string
  businessTypeName: string
  orgId: number
  orgName: string
  operatorId: number
  operatorName: string
  operatorPhone: string
  hospitalId: number
  hospitalName: string
  hospitalDeptName: string
  areaName: string
  fullAreaName: string
  doctorName: string
  doctorPhone: string
  patientName: string
  patientAge: number
  patientGender: string
  patientGenderName: string
  isUrgent: number
  isPostal: number
  postalAddress: string | null
  expectedDeliveryDate: string
  designerId: number
  designerName: string
  designStartTime: string
  designSubmitTime: string | null
  rebuildProjectList: DesignRebuildProjectItem[]
  submitCheck: DesignSubmitCheckVO
  imageDataFiles: ImageFileVO[]
  imageReportFiles: ImageFileVO[]
  packageList: PackageListItem[]
  modelList: ModelListItem[]
  reports: DesignReportVO[]
  version: number
  designerRemark: string | null
}

// ============================================================
// API 接口
// ============================================================

/** 分页查询设计工单列表 */
export const designWorkorderPage = (params: DesignWorkorderQuery) =>
  $axios.post('/design/workorder/list', params)

/** 获取设计工单统计数据 */
export async function designWorkorderStatistics(): Promise<DesignWorkorderStatisticsVO> {
  const res: any = await $axios('/design/workorder/statistics', { method: 'get' })
  return res as DesignWorkorderStatisticsVO
}

/** 获取设计工单详情 */
export async function designWorkorderDetail(orderId: number): Promise<DesignWorkorderDetailVO> {
  const res: any = await $axios(`/design/workorder/${orderId}`)
  return (res?.data || res) as DesignWorkorderDetailVO
}

/**
 * 保存设计师备注
 * POST /design/workorder/{orderId}/designer-remark
 */
export async function designWorkorderSaveDesignerRemark(orderId: number, designerRemark: string): Promise<void> {
  await $axios(`/design/workorder/${orderId}/designer-remark`, {
    method: 'post',
    data: { designerRemark },
  })
}

export async function designWorkorderStart(orderId: number, version: number): Promise<void> {
  await $axios(`/design/workorder/${orderId}/start-design`, { method: 'post', data: { version } })
}

/**
 * 完成设计
 * POST /design/workorder/{orderId}/complete-design
 */
export async function designWorkorderCompleteDesign(orderId: number, version: number): Promise<void> {
  await $axios(`/design/workorder/${orderId}/complete-design`, { method: 'post', data: { version } })
}

/** 获取当前用户列配置 */
export async function designColumnConfigGet(): Promise<DesignColumnConfigVO> {
  const res: any = await $axios('/design/column-config', { method: 'get' })
  return (res?.data || res) as DesignColumnConfigVO
}

/** 保存用户列配置 */
export const designColumnConfigSave = (data: DesignColumnConfigSaveDTO) =>
  $axios.post('/design/column-config', data)

/**
 * 设计工单审核通过（可选填写审批意见）
 * POST /design/workorder/{id}/audit-pass
 */
export async function designWorkorderAuditPass(id: number, version: number, comment?: string): Promise<void> {
  await $axios(`/design/review/${id}/pass`, { method: 'post', data: { version, comment } })
}

/**
 * 设计工单审核驳回（必填驳回原因）
 * POST /design/workorder/{id}/audit-reject
 */
export async function designWorkorderAuditReject(id: number, version: number, rejectReason: string): Promise<void> {
  await $axios(`/design/review/${id}/reject`, { method: 'post', data: { version, rejectReason } })
}

// ============================================================
// 打印信息相关
// ============================================================

/** 获取打印信息选项（下拉数据源）GET /api/design/workorder/{orderId}/print-info/options */
export async function designPrintInfoOptions(orderId: number, packageId: number): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/print-info/options`)
}

export async function designPrintInfoOptionsWithBatch(orderId: number, packageId: number, batchId: number): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/print-info/options?batchId=${batchId}`)
}

/** 获取数据包列表 GET /api/design/packages?orderId= */
export async function designPackageList(orderId: number): Promise<PackageListItem[]> {
  // $axios interceptor unwraps res.data on code===200, so res is already the array
  const res: any = await $axios(`/design/packages?orderId=${orderId}`)
  return Array.isArray(res) ? res : (res?.records ?? res?.list ?? [])
}

export async function designPackageListForBatch(orderId: number, batchId: number): Promise<PackageListItem[]> {
  const res: any = await $axios(`/design/packages?orderId=${orderId}&batchId=${batchId}`)
  return Array.isArray(res) ? res : (res?.records ?? res?.list ?? [])
}

export async function designAppendBatchCreate(orderId: number): Promise<{ batchId: number; batchNo: string }> {
  return $axios(`/design/package-batch?orderId=${orderId}`, { method: 'post' })
}

export async function designAppendBatchList(orderId: number): Promise<Array<{ batchId: number; status: string; createTime?: string }>> {
  const res: any = await $axios(`/design/package-batch?orderId=${orderId}`)
  return Array.isArray(res) ? res : (res?.records ?? res?.list ?? [])
}

/** 获取包内文件列表 GET /api/design/workorder/{orderId}/package/{packageId}/files */
export async function designPackageFiles(orderId: number, packageId: number): Promise<any> {
  return $axios(`/design/package/${packageId}/files?orderId=${orderId}`)
}

/** 保存打印信息 POST /api/design/workorder/{orderId}/package/{packageId}/print-info */
export async function designPrintInfoSave(orderId: number, packageId: number, data: any): Promise<void> {
  await $axios(`/design/workorder/${orderId}/package/${packageId}/print-info`, {
    method: 'post',
    data,
  })
}

export async function designPrintInfoSaveWithBatch(orderId: number, packageId: number, batchId: number, data: any): Promise<void> {
  await $axios(`/design/workorder/${orderId}/package/${packageId}/print-info?batchId=${batchId}`, {
    method: 'post',
    data,
  })
}

/** 查询打印信息列表 GET /api/design/workorder/{orderId}/package/{packageId}/print-info */
export async function designPrintInfoList(orderId: number, packageId: number): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/print-info`)
}

export async function designPrintInfoListWithBatch(orderId: number, packageId: number, batchId: number): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/print-info?batchId=${batchId}`)
}

/** 查询工单下所有打印信息 GET /api/design/workorder/{orderId}/print-info */
export async function designWorkorderPrintInfoList(orderId: number): Promise<any> {
  return $axios(`/design/workorder/${orderId}/print-info`)
}

// ============================================================
// 指令单 / 图纸相关
// ============================================================

/**
 * 获取指令单预览地址（按需自动生成）
 * GET /api/design/workorder/{orderId}/package/{packageId}/instruction/preview-url
 */
export async function designInstructionPreviewUrl(orderId: number, packageId: number, batchId?: number | null): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/instruction/preview-url${batchId ? `?batchId=${batchId}` : ''}`)
}

/**
 * 获取图纸预览地址（按需自动生成）
 * GET /api/design/workorder/{orderId}/package/{packageId}/drawing/preview-url?productCategory={category}
 */
export async function designDrawingPreviewUrl(orderId: number, packageId: number, productCategory: string, batchId?: number | null): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/drawing/preview-url?productCategory=${productCategory}${batchId ? `&batchId=${batchId}` : ''}`)
}

/**
 * 下载指令单（流式返回）
 * GET /design/workorder/{orderId}/package/{packageId}/instruction/download
 */
export async function designInstructionDownload(orderId: number, packageId: number): Promise<{ blob: Blob; fileName: string }> {
  const token = Session.get('token') || ''
  const res = await fetch(`/yi/design/workorder/${orderId}/package/${packageId}/instruction/download`, {
    headers: { satoken: token },
  })
  if (!res.ok) throw new Error(`下载失败: ${res.status}`)
  const blob = await res.clone().blob()
  const cd = res.headers.get('Content-Disposition') || ''
  let fileName = '指令单'
  const m = cd.match(/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|([^;\n]*))/i)
  if (m) {
    const raw = m[2] || m[3] || ''
    try { fileName = decodeURIComponent(raw) } catch { fileName = raw }
  }
  return { blob, fileName }
}

/**
 * 下载图纸（流式返回）
 * GET /design/workorder/{orderId}/package/{packageId}/drawing/download?productCategory={category}
 */
export async function designDrawingDownload(orderId: number, packageId: number, productCategory: string): Promise<{ blob: Blob; fileName: string }> {
  const token = Session.get('token') || ''
  const res = await fetch(`/yi/design/workorder/${orderId}/package/${packageId}/drawing/download?productCategory=${productCategory}`, {
    headers: { satoken: token },
  })
  if (!res.ok) throw new Error(`下载失败: ${res.status}`)
  const blob = await res.clone().blob()
  const cd = res.headers.get('Content-Disposition') || ''
  let fileName = '图纸'
  const m = cd.match(/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|([^;\n]*))/i)
  if (m) {
    const raw = m[2] || m[3] || ''
    try { fileName = decodeURIComponent(raw) } catch { fileName = raw }
  }
  return { blob, fileName }
}

/**
 * 获取指令单版本历史列表
 * GET /api/design/workorder/{orderId}/package/{packageId}/instruction/versions
 */
export async function designInstructionVersions(orderId: number, packageId: number, batchId?: number | null): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/instruction/versions${batchId ? `?batchId=${batchId}` : ''}`)
}

/**
 * 获取图纸版本历史列表
 * GET /api/design/workorder/{orderId}/package/{packageId}/drawing/versions?productCategory={category}
 */
export async function designDrawingVersions(orderId: number, packageId: number, productCategory: string, batchId?: number | null): Promise<any> {
  return $axios(`/design/workorder/${orderId}/package/${packageId}/drawing/versions?productCategory=${productCategory}${batchId ? `&batchId=${batchId}` : ''}`)
}

/**
 * 查询可视化模型列表
 * GET /api/design/models?orderId={orderId}
 */
interface DesignModelListResult {
  data: ModelListItem[]
  remark?: string | null
}

export async function designModelList(orderId: number): Promise<DesignModelListResult> {
  return $axios<DesignModelListResult, DesignModelListResult>('/design/models', {
    params: { orderId },
    keepResponseEnvelope: true,
  })
}

export async function updateVisualModelRemark(orderId: number, remark: string): Promise<void> {
  await $axios.put('/design/models/remark', { orderId, remark })
}

/**
 * 关联可视化模型（上传后调用，将 fileIds 与 orderId 绑定）
 * POST /api/design/models/link
 */
export async function designModelLink(orderId: number, fileIds: string[], remark?: string): Promise<ModelListItem[]> {
  return $axios<ModelListItem[], ModelListItem[]>('/design/models/link', {
    method: 'post',
    data: { orderId, fileIds, remark },
  })
}

/**
 * 关联设计报告（上传后调用，将 fileIds 与 orderId 绑定）
 * POST /api/design/report/link
 */
export async function designReportLink(orderId: number, fileIds: string[]): Promise<DesignReportVO[]> {
  const res: any = await $axios('/design/report/link', {
    method: 'post',
    data: { orderId, fileIds },
  })
  return Array.isArray(res) ? res : []
}

/**
 * 查询设计报告
 * GET /api/design/report?orderId={orderId}
 */
export async function designReportGet(orderId: number): Promise<DesignReportVO[]> {
  // $axios interceptor unwraps res.data on code===200, so res is already the report list
  const res: any = await $axios(`/design/report?orderId=${orderId}`)
  return Array.isArray(res) ? res : []
}

/**
 * 删除数据包
 * DELETE /design/package/{packageId}?orderId={orderId}
 */
export async function designPackageDelete(packageId: number, orderId: number): Promise<void> {
  await $axios(`/design/package/${packageId}?orderId=${orderId}`, { method: 'delete' })
}

export async function designPackageDeleteForBatch(packageId: number, orderId: number, batchId: number): Promise<void> {
  await $axios(`/design/package/${packageId}?orderId=${orderId}&batchId=${batchId}`, { method: 'delete' })
}

/**
 * 删除可视化模型
 * DELETE /design/model/{modelId}?orderId={orderId}
 */
export async function designModelDelete(id: string, orderId: number): Promise<void> {
  await $axios(`/design/model/${id}?orderId=${orderId}`, { method: 'delete' })
}

/**
 * 删除设计报告
 * DELETE /design/report/{fileId}?orderId={orderId}
 */
export async function designReportDelete(id: string, orderId: number): Promise<void> {
  await $axios(`/design/report/${id}?orderId=${orderId}`, { method: 'delete' })
}

/**
 * 确认图纸
 * POST /api/design/workorder/{orderId}/package/{packageId}/drawing/confirm/{drawId}?productCategory={category}
 */
export async function designDrawingConfirm(orderId: number, packageId: number, drawId: number, productCategory: string, batchId?: number | null): Promise<void> {
  await $axios(`/design/workorder/${orderId}/package/${packageId}/drawing/confirm/${drawId}?productCategory=${productCategory}${batchId ? `&batchId=${batchId}` : ''}`, {
    method: 'post',
  })
}

/**
 * 确认指令单
 * POST /api/design/workorder/{orderId}/package/{packageId}/instruction/confirm/{instrId}
 */
export async function designInstructionConfirm(orderId: number, packageId: number, instrId: number, batchId?: number | null): Promise<void> {
  await $axios(`/design/workorder/${orderId}/package/${packageId}/instruction/confirm/${instrId}${batchId ? `?batchId=${batchId}` : ''}`, {
    method: 'post',
  })
}

/**
 * 提交设计审核
 * POST /api/design/workorder/{orderId}/submit-design
 */
export async function designWorkorderSubmitDesign(orderId: number, version: number): Promise<void> {
  await $axios(`/design/workorder/${orderId}/submit-design`, {
    method: 'post',
    data: { version },
  })
}

/**
 * 下载文件（通过 fileId）
 * GET /api/basic/file/download/{fileId}
 */
export function designFileDownload(fileId: string): string {
  return `/basic/file/download/${fileId}`
}

/**
 * 上传工单二维码图片
 * POST /api/design/workorder/{orderId}/qr-image
 * Content-Type: multipart/form-data
 */
export async function designWorkorderUploadQrImage(orderId: number, file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  await $axios(`/design/workorder/${orderId}/qr-image`, {
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 订单图纸二维码图片 */
export interface DesignQrImageVO {
  fileId: string
  fileName?: string
  fileUrl?: string
  downloadUrl?: string
  fileSize?: number
  fileHash?: string
  uploadTime?: string
}

/**
 * 查询工单当前二维码图片
 * GET /api/design/workorder/{orderId}/qr-image
 */
export async function designWorkorderGetQrImage(orderId: number): Promise<DesignQrImageVO | null> {
  const res: any = await $axios(`/design/workorder/${orderId}/qr-image`, { method: 'get' })
  return (res?.data || res || null) as DesignQrImageVO | null
}

/**
 * 删除单条打印信息
 * DELETE /api/design/workorder/{orderId}/package/{packageId}/print-info/{printInfoId}
 */
export async function designPrintInfoDelete(orderId: number, packageId: number, printInfoId: number): Promise<void> {
  await $axios(`/design/workorder/${orderId}/package/${packageId}/print-info/${printInfoId}`, {
    method: 'delete',
  })
}

export async function designPrintInfoDeleteWithBatch(orderId: number, packageId: number, batchId: number, printInfoId: number): Promise<void> {
  await $axios(`/design/workorder/${orderId}/package/${packageId}/print-info/${printInfoId}?batchId=${batchId}`, {
    method: 'delete',
  })
}

/**
 * 查询可分配的设计师列表
 * POST /api/order/designers/available
 */
export const availableDesigners = (orderId: number) =>
  $axios.post('/order/designers/available', { orderId })

/**
 * 分配设计师
 * POST /api/order/{orderId}/assign-designer
 */
export const assignDesigner = (orderId: number, designerId: number) =>
  $axios.post(`/order/${orderId}/assign-designer`, { designerId })

/**
 * 查询设计师分配历史
 * GET /api/design/workorder/{orderId}/assignment-history
 */
export const assignmentHistory = (orderId: number) =>
  $axios.get<AssignmentHistoryItem[]>(`/design/workorder/${orderId}/assignment-history`)

export interface AssignmentHistoryItem {
  id: number
  orderId: number
  orderCode: string
  oldDesignerId: number
  oldDesignerName: string
  newDesignerId: number
  newDesignerName: string
  assignType: string
  assignTime: string
  operatorId: number
  operatorName: string
  remark: string | null
}

/**
 * 工单导出（流式返回 Excel）
 * POST /design/workorder/workload/export
 */
export async function designWorkorderExport(params: { createTimeStart?: string; createTimeEnd?: string }): Promise<{ blob: Blob; fileName: string }> {
  const token = Session.get('token') || ''
  const res = await fetch('/yi/design/workorder/workload/export', {
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
  let fileName = '工单导出.xlsx'
  const m = cd.match(/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|([^;\n]*))/i)
  if (m) {
    const raw = m[2] || m[3] || ''
    try { fileName = decodeURIComponent(raw) } catch { fileName = raw }
  }
  return { blob, fileName }
}
