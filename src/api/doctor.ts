import $axios from '@/utils/http'

// ============================================================
// 数据结构
// ============================================================

/** 医生分页查询请求 */
export interface DoctorPageQuery {
  pageNum?: number
  pageSize?: number
  doctorName?: string
  hospitalId?: number
  hospitalDeptId?: number
  status?: number
}

/** 医生列表查询请求（不分页） */
export interface DoctorListQuery {
  doctorName: string
  hospitalId?: number
  status?: number
}

/** 医生联想查询请求 */
export interface DoctorSuggestQuery {
  creatorId: number
  hospitalId: number
  keyword?: string
}

/** 医生视图对象 */
export interface DoctorVO {
  id: number
  doctorName: string
  doctorPhone: string
  hospitalId: number
  hospitalName: string
  hospitalDeptId: number
  hospitalDeptName: string
  creatorId: number
  orderCount: number
  status: number
  statusName: string
  remark: string
  createTime: string
  createBy: number
}

/** 医生分页响应 */
export interface DoctorPageVO {
  records: DoctorVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 创建医生请求 */
export interface CreateDoctorDTO {
  doctorName: string
  doctorPhone?: string
  hospitalId: number
  hospitalDeptId?: number
  remark?: string
}

/** 更新医生请求 */
export interface UpdateDoctorDTO {
  doctorName?: string
  doctorPhone?: string
  hospitalDeptId?: number
  status?: number
  remark?: string
}

/** 快速添加医生请求 */
export interface QuickAddDoctorDTO {
  doctorName: string
  doctorPhone?: string
  hospitalId: number
  hospitalDeptId?: number
}

// ============================================================
// API 方法
// ============================================================

/**
 * 分页查询医生列表
 * POST /basic/doctor/page
 */
export async function doctorPage(params: DoctorPageQuery): Promise<DoctorPageVO> {
  const res: any = await $axios('/basic/doctor/page', { method: 'post', data: params })
  return res as DoctorPageVO
}

/**
 * 查询所有医生列表（不分页）
 * POST /basic/doctor/list
 */
export function doctorList(params?: DoctorListQuery) {
  return $axios('/system/doctor/list', { method: 'post', data: params || {} })
}

/**
 * 根据ID查询医生详情
 * GET /basic/doctor/{id}
 */
export async function doctorDetail(id: number): Promise<DoctorVO> {
  const res: any = await $axios(`/basic/doctor/${id}`, { method: 'get' })
  return res as DoctorVO
}

/**
 * 创建医生
 * POST /basic/doctor
 */
export function doctorCreate(data: CreateDoctorDTO) {
  return $axios('/basic/doctor', { method: 'post', data })
}

/**
 * 更新医生
 * PUT /basic/doctor/{id}
 */
export function doctorUpdate(id: number, data: UpdateDoctorDTO) {
  return $axios(`/basic/doctor/${id}`, { method: 'put', data })
}

/**
 * 删除医生
 * DELETE /basic/doctor/{id}
 */
export function doctorDelete(id: number) {
  return $axios(`/basic/doctor/${id}`, { method: 'delete' })
}

/**
 * 修改医生状态
 * PUT /basic/doctor/{id}/status?status=0|1
 */
export function doctorChangeStatus(id: number, status: number) {
  return $axios(`/basic/doctor/${id}/status?status=${status}`, { method: 'put' })
}

/**
 * 医生联想（订单创建时调用）
 * POST /basic/doctor/suggest
 */
export function doctorSuggest(params: DoctorSuggestQuery) {
  return $axios('/basic/doctor/suggest', { method: 'post', data: params })
}

/**
 * 快速添加医生（订单创建时调用，不校验姓名重复）
 * POST /basic/doctor/quick-add
 */
export function doctorQuickAdd(data: QuickAddDoctorDTO) {
  return $axios('/basic/doctor/quick-add', { method: 'post', data })
}
