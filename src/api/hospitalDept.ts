import $axios from "@/utils/http";

// ========== 数据结构 ==========

/** 科室查询参数（分页） */
export interface HospitalDeptPageQuery {
  pageNum?: number
  pageSize?: number
  hospitalDeptName?: string
  status?: number
}

/** 科室查询参数（不分页） */
export interface HospitalDeptQuery {
  hospitalDeptName?: string
  status?: number
}

/** 科室列表响应 */
export interface HospitalDeptPageVO {
  records: HospitalDeptVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 科室视图对象 */
export interface HospitalDeptVO {
  id: number
  hospitalDeptCode: string
  hospitalDeptName: string
  sort: number
  status: number
  statusName: string
  remark: string
  createTime: string
  createBy: number
}

/** 创建科室请求 */
export interface CreateHospitalDeptDTO {
  hospitalDeptName: string
  sort?: number
  remark?: string
}

/** 更新科室请求 */
export interface UpdateHospitalDeptDTO {
  hospitalDeptName?: string
  sort?: number
  status?: number
  remark?: string
}

// ========== API ==========

/**
 * 分页查询科室列表
 * GET /basic/hospital-dept/page
 */
export async function hospitalDeptPage(params: HospitalDeptPageQuery): Promise<HospitalDeptPageVO> {
  const res: any = await $axios('/basic/hospital-dept/page', { method: 'post', data: params })
  return res as HospitalDeptPageVO
}

/**
 * 查询所有科室列表（不分页）
 * GET /basic/hospital-dept/list
 */
export function hospitalDeptList(params?: HospitalDeptQuery) {
  return $axios('/basic/hospital-dept/list', { method: 'post', data: params })
}

/**
 * 根据ID查询科室详情
 * GET /basic/hospital-dept/{id}
 */
export async function hospitalDeptDetail(id: number): Promise<HospitalDeptVO> {
  const res: any = await $axios(`/basic/hospital-dept/${id}`, { method: 'get' })
  return res as HospitalDeptVO
}

/**
 * 创建科室
 * POST /basic/hospital-dept
 */
export function hospitalDeptCreate(data: CreateHospitalDeptDTO) {
  return $axios('/basic/hospital-dept', { method: 'post', data })
}

/**
 * 更新科室
 * PUT /basic/hospital-dept/{id}
 */
export function hospitalDeptUpdate(id: number, data: UpdateHospitalDeptDTO) {
  return $axios(`/basic/hospital-dept/${id}`, { method: 'put', data })
}

/**
 * 删除科室
 * DELETE /basic/hospital-dept/{id}
 */
export function hospitalDeptDelete(id: number) {
  return $axios(`/basic/hospital-dept/${id}`, { method: 'delete' })
}

/**
 * 修改科室状态
 * PUT /basic/hospital-dept/{id}/status?status=0|1
 */
export function hospitalDeptChangeStatus(id: number, status: number) {
  return $axios(`/basic/hospital-dept/${id}/status?status=${status}`, { method: 'put' })
}
