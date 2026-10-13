import $axios from "@/utils/http";

// ========== 数据结构 ==========

/** 医院查询参数 */
export interface HospitalQuery {
  pageNum?: number
  pageSize?: number
  hospitalName?: string
  areaId?: number
  hospitalLevel?: string
  hospitalType?: string
  status?: number
}

/** 医院列表响应 */
export interface HospitalPageVO {
  records: HospitalVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 医院视图对象 */
export interface HospitalVO {
  id: number
  hospitalName: string
  hospitalCode: string
  areaId: number
  areaName: string
  fullAreaName: string
  hospitalLevel: string
  hospitalLevelName: string
  hospitalType: string
  hospitalTypeName: string
  contact: string
  phone: string
  email: string
  address: string
  creditCode: string
  businessLicense: string
  status: number
  statusName: string
  remark: string
  createTime: string
  updateTime: string
}

/** 医院下拉选项（orgType=1.3 的机构，或当前用户可操作的医院） */
export interface HospitalOptionVO {
  id: number
  orgName?: string
  hospitalName?: string
  orgCode?: string
  orgType?: string
  orgTypeName?: string
}

/** 创建医院请求 */
export interface CreateHospitalDTO {
  hospitalName: string
  areaId: number
  contact?: string
  phone?: string
  email?: string
  hospitalLevel?: string
  hospitalType?: string
  address?: string
  creditCode?: string
  businessLicense?: string
  remark?: string
}

/** 更新医院请求 */
export interface UpdateHospitalDTO extends Partial<CreateHospitalDTO> {
  status?: number
}

/** 医院组合模板查询参数 */
export interface HospitalTemplateQuery {
  pageNum?: number
  pageSize?: number
  templateName?: string
  status?: number
}

/** 医院组合模板列表响应 */
export interface HospitalTemplatePageVO {
  records: HospitalGroupTemplateVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 医院组合模板明细 */
export interface HospitalGroupTemplateDetailVO {
  id: number
  templateId: number
  hospitalId: number
  hospitalName: string
  hospitalCode: string
  fullAreaName: string
  hospitalLevelName: string
  contact: string
  phone: string
  assigned: boolean
  createTime: string
}

/** 医院组合模板视图对象 */
export interface HospitalGroupTemplateVO {
  id: number
  templateName: string
  templateCode: string
  templateDesc: string
  status: number
  statusName: string
  remark: string
  hospitalCount: number
  createTime: string
  updateTime: string
  details?: HospitalGroupTemplateDetailVO[]
}

/** 模板下拉选项 */
export interface HospitalTemplateSimpleVO {
  id: number
  templateName: string
  templateCode: string
  hospitalCount: number
}

/** 创建医院组合模板请求 */
export interface CreateHospitalTemplateDTO {
  templateName: string
  templateDesc?: string
  hospitalIds: number[]
  remark?: string
}

/** 更新医院组合模板请求 */
export interface UpdateHospitalTemplateDTO extends Partial<CreateHospitalTemplateDTO> {
  status?: number
}

// ========== 医院 API ==========

/**
 * 分页查询医院列表
 * GET /basic/hospital/list
 */
export async function hospitalList(params: HospitalQuery): Promise<HospitalPageVO> {
  const res: any = await $axios('/basic/hospital/list', { method: 'post', data: params })
  return res as HospitalPageVO
}

/**
 * 根据ID查询医院详情
 * GET /basic/hospital/{id}
 */
export async function hospitalDetail(id: number): Promise<HospitalVO> {
  const res: any = await $axios(`/basic/hospital/${id}`, { method: 'get' })
  return res as HospitalVO
}

/**
 * 获取医院下拉选项
 * GET /basic/hospital/options
 */
export function hospitalOptions(status?: number) {
  return $axios('/basic/hospital/options', {
    method: 'get',
    params: status !== undefined ? { status } : undefined,
  })
}

/**
 * 创建医院
 * POST /basic/hospital
 */
export function hospitalCreate(data: CreateHospitalDTO) {
  return $axios('/basic/hospital', { method: 'post', data })
}

/**
 * 更新医院
 * PUT /basic/hospital/{id}
 */
export function hospitalUpdate(id: number, data: UpdateHospitalDTO) {
  return $axios(`/basic/hospital/${id}`, { method: 'put', data })
}

/**
 * 修改医院状态
 * PUT /basic/hospital/{id}/status?status=0|1
 */
export function hospitalChangeStatus(id: number, status: number) {
  return $axios(`/basic/hospital/${id}/status?status=${status}`, { method: 'put' })
}

// ========== 医院组合模板 API ==========

/**
 * 分页查询医院组合模板列表
 * GET /basic/hospital-group-template/list
 */
export async function hospitalTemplateList(params: HospitalTemplateQuery): Promise<HospitalTemplatePageVO> {
  const res: any = await $axios('/system/hospital-group-template/list', { method: 'post', data: params })
  return res as HospitalTemplatePageVO
}

/**
 * 根据ID查询医院组合模板详情
 * GET /basic/hospital-group-template/{id}
 */
export async function hospitalTemplateDetail(id: number): Promise<HospitalGroupTemplateVO> {
  const res: any = await $axios(`/system/hospital-group-template/${id}`, { method: 'get' })
  return res as HospitalGroupTemplateVO
}

/**
 * 获取医院组合模板下拉选项
 * GET /basic/hospital-group-template/options
 */
export function hospitalTemplateOptions(status?: number) {
  return $axios('/system/hospital-group-template/options', {
    method: 'get',
    params: status !== undefined ? { status } : undefined,
  })
}

/**
 * 创建医院组合模板
 * POST /basic/hospital-group-template
 */
export function hospitalTemplateCreate(data: CreateHospitalTemplateDTO) {
  return $axios('/system/hospital-group-template', { method: 'post', data })
}

/**
 * 更新医院组合模板
 * PUT /basic/hospital-group-template/{id}
 */
export function hospitalTemplateUpdate(id: number, data: UpdateHospitalTemplateDTO) {
  return $axios(`/system/hospital-group-template/${id}`, { method: 'put', data })
}

/**
 * 删除医院组合模板
 * DELETE /basic/hospital-group-template/{id}
 */
export function hospitalTemplateDelete(id: number) {
  return $axios(`/system/hospital-group-template/${id}`, { method: 'delete' })
}

/**
 * 修改医院组合模板状态
 * PUT /basic/hospital-group-template/{id}/status?status=0|1
 */
export function hospitalTemplateChangeStatus(id: number, status: number) {
  return $axios(`/system/hospital-group-template/${id}/status?status=${status}`, { method: 'put' })
}

// ========== 获取地区树 ==========
export function fetchAreaTree() {
  return $axios(`/system/select/tree`, { method: 'post', data: { type: 'area', parentId: 0 }})
}

// ========== 获取当前用户可操作的医院列表 ==========
export function myHospitals() {
  return $axios(`/system/hospital-scope/my-hospitals`, { method: 'get' })
}