import $axios from '@/utils/http'
import type { ProductionColumnItem, ProductionColumnConfigVO } from './production'

export interface WarehouseListQuery {
  page?: number
  size?: number
  keyword?: string
  status?: number
  warehouseInTimeStart?: string
  warehouseInTimeEnd?: string
  warehouseOutTimeStart?: string
  warehouseOutTimeEnd?: string
}

export interface WarehouseListProductVO {
  id: number
  productNo: string
  productName: string
  specName: string
  certNo: string
  materialName: string
  colorName: string
  fileName: string
  status: string
  statusName: string
  qcResult: string | null
  udiCode?: string
}

export interface WarehouseRecordVO {
  id: number
  recordNo: string
  orderId: number
  orderCode: string
  orderType: number
  designPackageId: number
  designPackageCode: string
  productId: number
  productName: string
  productCategory: string
  productCategoryName: string
  productionBatchNo: string
  material: string
  materialBatchNo: string
  printDeviceId: number
  printDeviceCode: string
  printDeviceName: string
  totalProductCount: number
  qualifiedCount: number
  unqualifiedCount: number
  status: number
  statusColor?: {
    bgColor?: string
    bdColor?: string
    color?: string
  }
  qrCodeUrl: string
  printStartTime: string
  printFinishTime: string
  postProcessingEndTime: string
  createTime: string
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
  operatorName: string
  operatorPhone: string
  areaName: string
  operatorDeptName: string
  patientAge: number
  patientGender: string
  postalAddress: string
  designerName: string
  producerId: number
  producerName: string
  products: WarehouseListProductVO[]
  earliestInTime?: string
  latestOutTime?: string
  actualCompleteTime?: string
}

export interface WarehouseProductVO {
  id: number
  productNo: string
  productName: string
  specName: string
  certNo: string
  materialName: string
  colorName: string
  fileName: string
  status: string
  qcResult: string | null
  udiCode: string | null
  warehouseInTime: string
  warehouseInRemark: string
  warehouseOutTime: string | null
  warehouseOutRemark: string | null
}

export interface WarehouseDetailVO {
  id: number
  recordNo: string
  orderId: number
  orderCode: string
  orderType: number
  designPackageId: number
  designPackageCode: string
  productId: number
  productName: string
  productCategory: string
  productCategoryName: string
  productionBatchNo: string
  material: string
  materialBatchNo: string
  printDeviceId: number
  printDeviceCode: string
  printDeviceName: string
  totalProductCount: number
  qualifiedCount: number
  unqualifiedCount: number
  status: number
  statusColor?: {
    bgColor?: string
    bdColor?: string
    color?: string
  }
  qrCodeUrl: string
  printStartTime: string
  printFinishTime: string
  postProcessingEndTime: string
  createTime: string
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
  operatorName: string
  operatorPhone: string
  areaName: string
  operatorDeptName: string
  patientAge: number
  patientGender: string
  postalAddress: string
  designerName: string
  producerId: number
  producerName: string
  products: WarehouseProductVO[]
  earliestInTime?: string
  latestOutTime?: string
  actualCompleteTime?: string
}

/** 仓储流转卡统计数据 */
export interface WarehouseStatisticsVO {
  total: number
  pendingWarehouseIn: number
  warehoused: number
  warehouseOut: number
}

export const getWarehouseList = (data: WarehouseListQuery) =>
  $axios.post<{ records: WarehouseRecordVO[]; total: number; size: number; current: number; pages: number }>(
    '/production/warehouse/list', data
  )

/** 获取仓储流转卡统计数据 */
export const getWarehouseStatistics = () =>
  $axios.get<WarehouseStatisticsVO>('/production/warehouse/statistics')

export const getWarehouseDetail = (recordId: number) =>
  $axios.get<WarehouseDetailVO>(`/production/warehouse/detail/${recordId}`)

export const warehouseIn = (productId: number, remark?: string) =>
  $axios.post(`/production/warehouse/in/products/${productId}`, { remark })

export const warehouseOut = (productId: number, remark?: string) =>
  $axios.post(`/production/warehouse/out/products/${productId}`, { remark })

// ── 仓储列配置 ──────────────────────────────────────────────────────────────

export async function warehouseColumnConfigGet(): Promise<ProductionColumnConfigVO> {
  const res: any = await $axios('/production/warehouse/column-config', { method: 'get' })
  return (res?.data || res) as ProductionColumnConfigVO
}

export const warehouseColumnConfigSave = (data: { columns: ProductionColumnItem[] }) =>
  $axios.post('/production/warehouse/column-config', data)
