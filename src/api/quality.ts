/**
 * 质检管理 API 模块
 */

import $axios from "@/utils/http";

// ============================================================
// 数据结构
// ============================================================

/** 质检批次查询参数 */
export interface QCBatchQuery {
  pageNum?: number
  pageSize?: number
  patientName?: string    // 患者/客户名称（模糊）
  productType?: string    // 产品类型：MEDICAL_DEVICE / NON_MEDICAL
  startDate?: string      // 流转到质检开始日期
  endDate?: string        // 流转到质检结束日期
}

/** 质检批次列表项 */
export interface QCBatchVO {
  id: number
  recordCode: string      // 流转卡编号
  orderCode: string       // 订单号
  patientName: string     // 患者/客户名称
  productName: string     // 产品名称
  productType: string     // 产品类型：MEDICAL_DEVICE / NON_MEDICAL
  productTypeName: string
  productTotal: number    // 产品总数
  pendingCount: number    // 待检数
  qualifiedCount: number  // 合格数
  separatedCount: number  // 已分离数
  qcStartTime: string    // 流转到质检时间
}

/** 质检批次分页响应 */
export interface QCBatchPageVO {
  records: QCBatchVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 质检产品查询参数 */
export interface QCProductQuery {
  recordId: number        // 流转卡ID
}

/** 质检产品列表项 */
export interface QCProductVO {
  id: number
  productCode: string     // 产品编号 P202605110001
  productName: string     // 产品名称
  qcStatus: string       // 质检状态：pending / qualified / separated
  qcStatusName: string
  udiCode?: string       // UDI码（合格后）
  qcResult?: string      // 质检结果：qualified / unqualified
  qcResultName?: string
  qcTime?: string        // 质检时间
  qcUserName?: string    // 质检员
  separatedReason?: string // 不合格原因
  separatedMethod?: string // 返工方案：to_print / to_post
  separatedMethodName?: string
  gtin?: string          // GTIN（从产品注册信息读取）
  recordId?: number      // 流转卡ID
}

/** 质检历史记录项 */
export interface QCHistoryVO {
  id: number
  productCode: string
  recordCode: string      // 流转卡编号
  qcTime: string
  qcUserName: string
  qcResult: string        // qualified / unqualified
  qcResultName: string
  separatedReason?: string
  separatedMethod?: string
  separatedMethodName?: string
  qcCount: number         // 第N次质检
}

/** 质检汇总 */
export interface QCSummaryVO {
  productTotal: number
  pendingCount: number
  qualifiedCount: number
  separatedCount: number
}

/** 订单基本信息 */
export interface QCOrderInfoVO {
  orderCode: string
  recordCode: string
  patientName: string
  productName: string
  material?: string
  productType: string
  productTypeName: string
}

// ============================================================
// API 方法
// ============================================================

/** 分页查询质检批次列表 */
export const qcBatchPage = (params: QCBatchQuery) => {
  return $axios.postForm('/api/production/qc/batch/page', params)
}

/** 获取质检批次汇总 */
export const qcBatchSummary = () => {
  return $axios.get('/api/production/qc/batch/summary')
}

/** 获取质检批次产品列表 */
export const qcProductList = (params: QCProductQuery) => {
  return $axios.postForm('/api/production/qc/product/list', params)
}

/** 获取质检批次汇总（产品级统计） */
export const qcSummary = (recordId: number) => {
  return $axios.get(`/api/production/qc/summary/${recordId}`)
}

/** 获取订单基本信息 */
export const qcOrderInfo = (recordId: number) => {
  return $axios.get(`/api/production/qc/orderInfo/${recordId}`)
}

/** 标记质检结果 */
export const qcMarkResult = (data: {
  productId: number
  recordId: number
  result: 'qualified' | 'unqualified'
  reason?: string
}) => {
  return $axios.post('/api/production/qc/mark', data)
}

/** 流转到入库 */
export const qcTransferToWarehouse = (recordId: number) => {
  return $axios.post(`/api/production/qc/transfer/${recordId}`)
}

/** 查询质检历史记录 */
export const qcHistory = (productCode: string) => {
  return $axios.get('/api/production/qc/history', { params: { productCode } })
}

/** 批量打印UDI */
export const qcBatchPrintUDI = (recordId: number) => {
  return $axios.get(`/api/production/qc/batchPrintUDI/${recordId}`, { responseType: 'blob' })
}

/** 单个打印UDI */
export const qcSinglePrintUDI = (productId: number) => {
  return $axios.get(`/api/production/qc/singlePrintUDI/${productId}`, { responseType: 'blob' })
}

/** 返工方案：返工到打印 */
export const qcReworkToPrint = (data: { productId: number; recordId: number; reason: string }) => {
  return $axios.post('/api/production/qc/rework/toPrint', data)
}

/** 返工方案：返工到后处理 */
export const qcReworkToPost = (data: {
  productId: number
  recordId: number
  reason: string
  postStep: string  // WASH / CURING / ULTRASONIC / DRY
}) => {
  return $axios.post('/api/production/qc/rework/toPost', data)
}

// ============================================================
// Mock 数据
// ============================================================

export const MOCK_QC_BATCH_LIST: QCBatchVO[] = [
  {
    id: 1,
    recordCode: 'RC20260514001',
    orderCode: 'ORD20260514001',
    patientName: '张伟',
    productName: '下颌骨复位导板',
    productType: 'MEDICAL_DEVICE',
    productTypeName: '医疗器械',
    productTotal: 3,
    pendingCount: 2,
    qualifiedCount: 0,
    separatedCount: 1,
    qcStartTime: '2026-05-14 10:30:00',
  },
  {
    id: 2,
    recordCode: 'RC20260513002',
    orderCode: 'ORD20260513002',
    patientName: '李娜',
    productName: '口腔修复模型',
    productType: 'NON_MEDICAL',
    productTypeName: '非医疗器械',
    productTotal: 5,
    pendingCount: 0,
    qualifiedCount: 3,
    separatedCount: 2,
    qcStartTime: '2026-05-13 14:20:00',
  },
  {
    id: 3,
    recordCode: 'RC20260512003',
    orderCode: 'ORD20260512003',
    patientName: '王建国',
    productName: '脊柱矫形支具',
    productType: 'MEDICAL_DEVICE',
    productTypeName: '医疗器械',
    productTotal: 2,
    pendingCount: 1,
    qualifiedCount: 1,
    separatedCount: 0,
    qcStartTime: '2026-05-12 09:15:00',
  },
]

export const MOCK_QC_PRODUCT_LIST: QCProductVO[] = [
  {
    id: 101,
    productCode: 'P202605140001',
    productName: '下颌骨复位导板-1',
    qcStatus: 'pending',
    qcStatusName: '待检',
    gtin: '06901234567890',
  },
  {
    id: 102,
    productCode: 'P202605140002',
    productName: '下颌骨复位导板-2',
    qcStatus: 'pending',
    qcStatusName: '待检',
    gtin: '06901234567890',
  },
  {
    id: 103,
    productCode: 'P202605140003',
    productName: '下颌骨复位导板-3',
    qcStatus: 'separated',
    qcStatusName: '已分离',
    qcResult: 'unqualified',
    qcResultName: '不合格',
    qcTime: '2026-05-14 11:10:00',
    qcUserName: '质检员-小王',
    separatedReason: '表面粗糙度不达标',
    separatedMethod: 'to_print',
    separatedMethodName: '返工到打印',
    gtin: '06901234567890',
  },
]

export const MOCK_QC_ORDER_INFO: QCOrderInfoVO = {
  orderCode: 'ORD20260514001',
  recordCode: 'RC20260514001',
  patientName: '张伟',
  productName: '下颌骨复位导板',
  material: '光敏树脂',
  productType: 'MEDICAL_DEVICE',
  productTypeName: '医疗器械',
}

export const MOCK_QC_HISTORY: QCHistoryVO[] = [
  {
    id: 1,
    productCode: 'P202605140002',
    recordCode: 'RC20260514001',
    qcTime: '2026-05-14 11:10:00',
    qcUserName: '质检员-小王',
    qcResult: 'unqualified',
    qcResultName: '不合格',
    separatedReason: '表面粗糙度不达标',
    separatedMethod: 'to_print',
    separatedMethodName: '返工到打印',
    qcCount: 1,
  },
]

// ============================================================
// 常量
// ============================================================

/** 产品类型 */
export const PRODUCT_TYPE_MAP: Record<string, string> = {
  MEDICAL_DEVICE: '医疗器械',
  NON_MEDICAL: '非医疗器械',
}

/** 质检状态 */
export const QC_STATUS_MAP: Record<string, string> = {
  pending: '待检',
  qualified: '合格',
  separated: '已分离',
}

/** 质检状态颜色 */
export const QC_STATUS_TAG_TYPE: Record<string, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
  pending: 'info',
  qualified: 'success',
  separated: 'warning',
}

/** 返工后处理工序 */
export const POST_STEP_MAP: Record<string, string> = {
  WASH: '酒精初洗',
  CURING: 'UV固化',
  ULTRASONIC: '超声清洗',
  DRY: '干燥',
}

/** 后处理工序选项 */
export const POST_STEP_OPTIONS = [
  { label: '酒精初洗', value: 'WASH' },
  { label: 'UV固化', value: 'CURING' },
  { label: '超声清洗', value: 'ULTRASONIC' },
  { label: '干燥', value: 'DRY' },
]
