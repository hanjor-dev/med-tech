import $axios from '@/utils/http'

// ========== 加工中心 ==========

export interface ProcessingCenterVO {
  id: number
  centerCode: string
  centerName: string
  contactPerson: string
  contactPhone: string
  address: string
  deviceIdRanges: string
  status: number
  remark: string
  createTime: string
  updateTime: string
}

export interface ProcessingCenterListQuery {
  pageNum?: number
  pageSize?: number
  centerName?: string
  status?: number | null
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 22.1 分页查询加工中心列表
export const listProcessingCenter = (params: ProcessingCenterListQuery): Promise<PageResult<ProcessingCenterVO>> =>
  $axios.post('/basic/processing-center/list', params).then((res: any) => res ?? res)

// 22.2 根据ID查询加工中心详情
export const getProcessingCenter = (id: number): Promise<ProcessingCenterVO> =>
  $axios.get(`/basic/processing-center/${id}`).then((res: any) => res ?? res)

// 22.3 创建加工中心
export const createProcessingCenter = (data: {
  centerCode: string
  centerName: string
  contactPerson?: string
  contactPhone?: string
  address?: string
  deviceIdRanges?: string
  remark?: string
}): Promise<number> =>
  $axios.post('/basic/processing-center', data).then((res: any) => res ?? res)

// 22.4 更新加工中心
export const updateProcessingCenter = (id: number, data: Partial<{
  centerName: string
  contactPerson: string
  contactPhone: string
  address: string
  deviceIdRanges: string
  status: number
  remark: string
}>): Promise<void> =>
  $axios.put(`/basic/processing-center/${id}`, {  ...data, id: id }).then(() => {})

// 22.5 删除加工中心
export const deleteProcessingCenter = (id: number): Promise<void> =>
  $axios.delete(`/basic/processing-center/${id}`).then(() => {})

// 22.6 查询所有启用的加工中心（用于下拉选择）
export const listAllProcessingCenter = (): Promise<{ id: number; centerCode: string; centerName: string }[]> =>
  $axios.get('/basic/processing-center/all').then((res: any) => res ?? res)

// ========== 设备 ==========

export interface DeviceVO {
  id: number
  deviceId: string
  deviceName: string
  deviceType: string
  centerId: number
  centerName: string
  state: number
  connectionStatus: number
  processingMinutes: number | null
  lastHeartbeat: string
  remark: string | null
  createTime: string
  updateTime: string
}

export interface DeviceListQuery {
  pageNum?: number
  pageSize?: number
  centerId?: number | null
  deviceType?: string | null
  state?: number | null
  connectionStatus?: number | null
  deviceId?: string | null
}

export interface DeviceStatisticsVO { total: number; idle: number; occupied: number }

// 22.7 分页查询设备列表
export const listDevice = (params: DeviceListQuery): Promise<PageResult<DeviceVO>> =>
  $axios.post('/basic/device/list', params).then((res: any) => res ?? res)

export const deviceStatistics = (): Promise<DeviceStatisticsVO> =>
  $axios.get('/basic/device/statistics').then((res: any) => res ?? res)

// 22.8 根据ID查询设备详情
export const getDevice = (id: number): Promise<DeviceVO> =>
  $axios.get(`/basic/device/${id}`).then((res: any) => res ?? res)

// 22.9 手动创建设备（非打印类）
export const createDevice = (data: {
  deviceId: string
  deviceName?: string
  deviceType?: string
  centerId?: number | null
  processingMinutes?: number | null
  remark?: string
}): Promise<number> =>
  $axios.post('/basic/device', data).then((res: any) => res ?? res)

// 22.10 手动更新设备状态
export const updateDeviceState = (id: number, state: number): Promise<void> =>
  $axios.put(`/basic/device/${id}/state?state=${state}`).then(() => {})

// 22.14 编辑设备信息
export const updateDevice = (data: {
  id: number
  deviceName?: string
  centerId?: number | null
  processingMinutes?: number | null
  remark?: string
}): Promise<void> =>
  $axios.put('/basic/device', data).then(() => {})

// 22.15 删除设备
export const deleteDevice = (id: number): Promise<void> =>
  $axios.delete(`/basic/device/${id}`).then(() => {})

// （不过滤连接状态，用于任务分配）
export const listDeviceByCenter = (params: { centerId?: number | null; deviceType?: string | null }): Promise<DeviceVO[]> =>
  $axios.get('/basic/device/by-center', { params }).then((res: any) => res ?? res)

// 22.13 查询设备类型下拉列表
export const listDeviceTypes = (): Promise<{ value: string; name: string }[]> =>
  $axios.get('/basic/device/types').then((res: any) => res ?? res)
