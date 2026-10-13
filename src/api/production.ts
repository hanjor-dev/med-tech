import $axios from '@/utils/http'

export interface ProductListItem {
  productName: string
  specName: string
  materialName: string
  quantity: number
}

export interface ProductionRecordQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: number | ''
  processingCenterId?: number
  orderCreateTimeStart?: string
  orderCreateTimeEnd?: string
}

export interface ProductionProductVO {
  id: number
  productNo: string
  productName: string
  specName: string
  materialName: string
  fileName: string
  weight?: number
  status: string
  qcResult: string | null
  udiCode: string | null
  statusName: string
}

export interface ProductionRecordVO {
  id: number
  recordNo: string
  publicOrderCode?: string
  designerRemark?: string
  orderType: number
  designPackageCode: string
  productionBatchNo: string
  totalProductCount: number
  qualifiedCount: number
  unqualifiedCount: number
  hasRedoProduct: number
  status: number
  statusColor?: {
    bgColor?: string
    bdColor?: string
    color?: string
  }
  currentProcess: string | null
  currentProcessName: string | null
  qrCodeUrl: string
  createTime: string
  products: ProductionProductVO[]
  hospitalName: string
  hospitalDeptName: string
  doctorName: string
  patientName: string
  isUrgent: number
  isPostal: number
  expectedDeliveryDate: string
  orderStatus: number
  orderPhase: number
  orgName: string
}

export interface ProductionRecordPageVO {
  records: ProductionRecordVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 生产流转卡统计数据 */
export interface ProductionRecordStatisticsVO {
  total: number
  pendingPrint: number
  printing: number
  printCompleted: number
  postProcessing: number
  qcInProgress: number
  packing: number
  printFailed?: number
}

interface FileInfo {
  fileName?: string
  fileUrl: string
  downloadUrl?: string
  fileSize?: number
}

export interface ProductionRecordDetailVO extends ProductionRecordVO {
  orderId: number
  orderCode: string
  hospitalName: string
  hospitalDeptName: string
  doctorName: string
  patientName: string
  isUrgent: number
  isPostal: number
  expectedDeliveryDate: string
  designPackageId?: number
  instructionFile?: FileInfo
  drawingFile?: FileInfo
  dataPackageFile?: FileInfo
  flowCardFile?: FileInfo
}

export const getProductionRecordList = (data: ProductionRecordQuery) =>
  $axios.post<ProductionRecordPageVO>('/production/record/list', data)

/** 获取生产流转卡统计数据 */
export const getProductionRecordStatistics = () =>
  $axios.get<ProductionRecordStatisticsVO>('/production/record/statistics')

export const getProductionRecordDetail = (id: number) =>
  $axios.get<ProductionRecordDetailVO>(`/production/record/${id}`)

export const getProductionQrCode = (id: number) =>
  $axios.get<string>(`/production/record/qr-code/${id}`)

export const generateFlowCardExcel = (id: number) =>
  $axios.get<{ id: number; fileName: string; fileUrl: string; fileSize: number; bizType: string }>(`/production/record/${id}/excel`)

export const downloadDesignPackage = (designPackageId: number) =>
  $axios.post(`/production/record/${designPackageId}/download-package`)

// ── 设备配置 ──────────────────────────────────────────────────────────────

export interface DeviceConfigVO {
  id: number
  recordNo: string
  productionBatchNo: string | null
  designPackageCode: string
  status: number
  printDeviceId: number | null
  printDeviceCode: string | null
  printDeviceName: string | null
  material?: string | null
  printParams?: string | null
}

export interface PrinterGroupVO {
  centerId: number
  centerName: string
  printers: PrinterVO[]
}

export interface PrinterVO {
  id: number
  deviceNo: string
  deviceName: string
  status: number
  statusName: string
}

export const getDeviceConfig = (id: number) =>
  $axios.get<DeviceConfigVO>(`/production/record/${id}/device-config`)

export const getPrinterList = () =>
  $axios.get<PrinterGroupVO[]>('/production/record/printers')

export const checkPrinterOccupation = (id: number, deviceId: number) =>
  $axios.get<{ occupied: boolean }>(`/production/record/${id}/printer-occupation`, { params: { deviceId } })

export const assignDevice = (
  id: number,
  data: {
    deviceId: number
    productWeights?: Array<{ productId: number; weight: number | null }>
    material?: string
    printParams?: string
    confirmOccupied?: boolean
  },
) =>
  $axios.post(`/production/record/${id}/assign-device`, data)

// 生产批号由后端在提交时自动生成，前端只传原材料批号
export const submitBatchNo = (id: number, data: { materialBatchNo?: string }) =>
  $axios.post(`/production/record/${id}/submit-batch-no`, data)

export const batchUpdateUdi = (data: { recordId: number; products: Array<{ productId: number; udiCode: string }> }) =>
  $axios.post('/production/qc/batch-update-udi', data)

// ── 流程卡 ────────────────────────────────────────────────────────────────

export interface FlowCardProductItem {
  id: number
  productId: number
  productName: string
  specName: string
  quantity: number
}

export interface QcRecord {
  id: number
  qcResult: number
  failReason?: string
  handleType?: string
  operatorName: string
  qcTime: string
}

export interface ProcessStepVO {
  processType: string
  processName: string
  processSeq: number
  status: number
  configId?: number
  primaryDeviceId?: number
  primaryDeviceName?: string
  secondaryDeviceId?: number
  secondaryDeviceName?: string
  processParams?: Record<string, any>
  startTime?: string
  finishTime?: string
  operatorName?: string
  latestQcResult?: number
  qcRecords: QcRecord[]
}

export interface FlowCardVO {
  orderId: number
  packageCode: string
  productionNo: string
  packQuantity: number
  materialName: string
  printStartTime?: string
  printFinishTime?: string
  materialBatchNo?: string
  operatorName?: string
  orderStatus: number
  productList: FlowCardProductItem[]
  processes: ProcessStepVO[]
}

export const getFlowCard = (id: number) =>
  $axios.get<FlowCardVO>(`/production/order/${id}/flow-card`)

// ── 流转卡详情（真实接口） ────────────────────────────────────────────────────

export const scanRecord = (recordNo: string) =>
  $axios.get<ProductionRecordDetailVO>('/production/record/scan', { params: { recordNo } })

export const getProcessList = (recordId: number) =>
  $axios.get<ProcessStepVO[]>(`/production/process/${recordId}/list`)

// 23.13 填写工序信息（后处理工序完成时调用）
export const fillProcess = (processId: number, data: {
  deviceId: number
  processParams?: string
  hasRedo?: number
  redoRemark?: string
}) => $axios.post(`/production/process/${processId}/fill`, data)

// 23.15 打印失败处理
export const printFailure = (recordId: number, params: { failureReason: string; recreate: boolean }) =>
  $axios.post<number | null>(`/production/process/${recordId}/print-failure`, null, { params })

// 23.16 打印检验不合格处理
export const printInspectionFail = (recordId: number, params: { failureReason: string; recreate: boolean }) =>
  $axios.post<number | null>(`/production/process/${recordId}/print-inspection-fail`, null, { params })

// 23.18 开始工序
export const startProcess = (recordId: number, data: {
  processType: string
  primaryDeviceId: number
  secondaryDeviceId?: number
  processParams?: string
}) => $axios.post(`/production/process/${recordId}/start`, data)

// 23.19 完成工序
export const finishProcess = (recordId: number, processType: string) =>
  $axios.post(`/production/process/${recordId}/finish`, null, { params: { processType } })

// 强制完成打印（无请求体）
export const forceCompletePrint = (recordId: number) =>
  $axios.post(`/production/record/${recordId}/force-complete-print`)

// 23.20 获取工序步骤定义
export interface ProcessStepDef { code: string; name: string; order: number }
export const getProcessSteps = () =>
  $axios.get<ProcessStepDef[]>('/production/process-config/steps')

// 23.21 获取工序参数配置
export const getProcessParamsConfig = () =>
  $axios.get<Record<string, any>>('/production/process-config/params')

// 23.9 提交到质检
export const submitToQc = (recordId: number) =>
  $axios.post(`/production/record/${recordId}/submit-to-qc`)

// 23.23 获取待质检产品列表
export interface QcProductVO {
  id: number
  productNo: string
  productName: string
  status: string
  qcResult: string | null
  udiCode: string | null
  statusName: string
}
export const getQcProducts = (recordId: number) =>
  $axios.get<QcProductVO[]>(`/production/qc/${recordId}/products`)

// 23.24 标记产品质检合格
export const markProductPass = (productId: number) =>
  $axios.post(`/production/qc/product/${productId}/pass`)

// 23.20 标记产品质检不合格
export const markProductFail = (productId: number, reason: string) =>
  $axios.post(`/production/qc/product/${productId}/fail`, null, { params: { reason } })

// 23.25 标记产品质检不合格(redo)
export const markProductRedo = (productId: number, params: { reason: string; handleType: string }) =>
  $axios.post(`/production/qc/product/${productId}/redo`, null, { params })

// 23.26 质检完成流转到包装
export const transferToPack = (recordId: number) =>
  $axios.post(`/production/qc/${recordId}/transfer-to-pack`)

// 23.22 质检列表
export interface QcRecordVO {
  id: number
  recordNo: string
  orderType: number
  designPackageCode: string
  productionBatchNo: string
  totalProductCount: number
  qualifiedCount: number
  unqualifiedCount: number
  hasRedoProduct: number
  status: number
  createTime: string
}
export interface QcRecordPageVO {
  records: QcRecordVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 质检统计数据 */
export interface QcStatisticsVO {
  qcInProgress: number
  qcCompleted: number
}
export const getQcList = (data: { pageNum?: number; pageSize?: number; status?: number }) =>
  $axios.post<QcRecordPageVO>('/production/qc/list', data)

/** 获取质检统计数据 */
export const getQcStatistics = () =>
  $axios.get<QcStatisticsVO>('/production/qc/statistics')

// 23.28 指定redo重做工序
export const assignRedoProcess = (productId: number, processType: string) =>
  $axios.post(`/production/qc/redo/${productId}/assign`, null, { params: { processType } })

// 23.14 提交工序质检结果
export const submitProcessQc = (processId: number, data: {
  productResults: { productId: number; result: 'pass' | 'redo'; remark?: string }[]
}) => $axios.post(`/production/process/${processId}/submit-qc`, data)

// 23.6 获取流转卡二维码
export const getFlowCardQrCode = (id: number) =>
  $axios.get<string>(`/production/record/qr-code/${id}`)

// 23.26 按加工中心分组查询设备列表
export interface CenterDeviceVO {
  id: number
  deviceNo: string
  deviceName: string
  status: number
  statusName: string
}
export interface CenterDeviceGroupVO {
  centerId: number
  centerName: string
  devices: CenterDeviceVO[]
}
export const getDevicesByCenter = (params: { deviceType: string }) =>
  $axios.get<CenterDeviceGroupVO[]>('/production/process-config/devices', { params })

// 23.12 分页查询产品明细列表
export interface ProductionProductDetailVO {
  id: number
  productNo: string
  productName: string
  fileName: string
  status: string
  qcResult: string | null
  udiCode: string | null
  createTime: string
  productionRecordId: number
  recordNo: string
  productionBatchNo: string
  printDeviceCode: string | null
  recordStatus: number
  orderId: number
  orderCode: string
  orderType: number
  designPackageCode: string
  hospitalName: string
  hospitalDeptName: string
  doctorName: string
  patientName: string
  isUrgent: number
  isPostal: number
  expectedDeliveryDate: string
}

export const getProductionProductList = (data: { pageNum?: number; pageSize?: number; keyword?: string }) =>
  $axios.post<{ records: ProductionProductDetailVO[]; total: number }>('/production/product/list', data)

// 列配置
export interface ProductionColumnItem {
  field: string
  label: string
  visible: boolean
  sort: number
  width?: number | null
  fixed?: string | null
}

export interface ProductionColumnConfigVO {
  module: string
  columns: ProductionColumnItem[]
}

export async function productionColumnConfigGet(): Promise<ProductionColumnConfigVO> {
  const res: any = await $axios('/production/column-config', { method: 'get' })
  return (res?.data || res) as ProductionColumnConfigVO
}

export const productionColumnConfigSave = (data: { columns: ProductionColumnItem[] }) =>
  $axios.post('/production/column-config', data)

export async function qualityColumnConfigGet(): Promise<ProductionColumnConfigVO> {
  const res: any = await $axios('/production/qc/column-config', { method: 'get' })
  return (res?.data || res) as ProductionColumnConfigVO
}

export const qualityColumnConfigSave = (data: { columns: ProductionColumnItem[] }) =>
  $axios.post('/production/qc/column-config', data)

export const fillPackInfo = (recordId: number, data: {
  primaryDeviceId: number
  secondaryDeviceId?: number
  processParams?: string
}) => $axios.put(`/production/pack/${recordId}/fill`, data)

export const transferPackToStorage = (recordId: number) =>
  $axios.post(`/production/pack/${recordId}/transfer`)

// 导出产品台账
import { handleBlobResponse } from '@/utils/http'

export const exportProductionProductLedger = async (params: {
  recordNo?: string
  orderCode?: string
  productNo?: string
  startTime?: string
  endTime?: string
}) => {
  const res = await $axios.post('/production/record/product-ledger/export', params, { responseType: 'blob' })
  const result = handleBlobResponse(res)
  // 如果服务端未返回文件名，使用默认格式
  if (result.fileName.startsWith('download_')) {
    result.fileName = `生产产品台账_${new Date().toISOString().split('T')[0]}.xlsx`
  }
  return result
}

export const releaseDevice = (id: number) =>
  $axios.post(`/production/record/${id}/release-device`)
