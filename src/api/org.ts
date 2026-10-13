import $axios, { handleBlobResponse } from "@/utils/http";

// ========== 数据结构 ==========

/** 机构查询参数 */
export interface OrgQuery {
  pageNum?: number
  pageSize?: number
  orgName?: string
  orgType?: string
  areaId?: number
  status?: number
}

/** 机构列表响应 */
export interface OrgPageVO {
  records: OrgVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 机构统计数据 */
export interface OrgStatisticsVO {
  total: number
  distributor: number
  serviceProvider: number
  medicalInstitution: number
}

/** 机构视图对象 */
export interface OrgVO {
  id: number
  orgName: string
  orgCode: string
  orgType: string
  orgTypeName: string
  status: number
  statusName: string
  remark?: string
  areaId?: number
  areaName?: string
  address?: string
  contact?: string
  phone?: string
  email?: string
  creditCode?: string
  qualificationFile?: string
  qualificationType?: number
  hospitalLevel?: string
  hospitalLevelName?: string
  hospitalType?: string
  hospitalTypeName?: string
  hospitalOrgIds?: number[]
  hospitalOrgNames?: string[]
  usernamePrefix?: string
  createTime?: string
  updateTime?: string
}

export interface OrgOptions {
  label: string
  value: number
}

/** 创建机构请求 */
export interface CreateOrgDTO {
  orgName: string
  orgType: string
  areaId?: number
  address?: string
  contact?: string
  phone?: string
  email?: string
  creditCode?: string
  qualificationFile?: string
  qualificationType?: number
  hospitalOrgIds?: number[]
  hospitalLevel?: string
  hospitalType?: string
  usernamePrefix?: string
  remark?: string
}

/** 更新机构请求 */
export interface UpdateOrgDTO extends Partial<CreateOrgDTO> {
  status?: number
}

/** 预检查删除机构响应 */
export interface CheckRemoveVO {
  affected: boolean
  message?: string
  affectedUsers?: { id: number; realName: string }[]
  affectedDoctors?: { id: number; doctorName: string }[]
}

/** 预检查禁用机构响应 */
export interface CheckDisableVO {
  affected: boolean
  message?: string
  affectedUsers?: { id: number; realName: string }[]
  affectedDoctors?: never[]
}

/** 预检查经销商关联医院变更响应 */
export interface HospitalChangeCheckVO {
  affected: boolean
  message?: string
  removedHospitals?: { id: number; orgName: string }[]
  affectedUsers?: { id: number; realName: string; removedHospitalIds: number[] }[]
}

// ========== API ==========

/**
 * 分页查询机构列表
 * GET /system/org/list
 */
export async function orgList(params: OrgQuery): Promise<OrgPageVO> {
  const res: any = await $axios('/system/org/list', { method: 'post', data: params })
  return res as OrgPageVO
}

/** 获取机构统计数据 */
export async function orgStatistics(): Promise<OrgStatisticsVO> {
  const res: any = await $axios('/system/org/statistics', { method: 'get' })
  return res as OrgStatisticsVO
}

/**
 * 根据ID查询机构详情
 * GET /system/org/{id}
 */
export async function orgDetail(id: number): Promise<OrgVO> {
  const res: any = await $axios(`/system/org/${id}`, { method: 'get' })
  return res as OrgVO
}

/**
 * 创建机构
 * POST /system/org
 */
export function orgCreate(data: CreateOrgDTO) {
  return $axios('/system/org', { method: 'post', data })
}

/**
 * 更新机构
 * PUT /system/org/{id}
 */
export function orgUpdate(id: number, data: UpdateOrgDTO) {
  return $axios(`/system/org/${id}`, { method: 'put', data })
}

/**
 * 删除机构
 * DELETE /system/org/{id}
 */
export function orgDelete(id: number) {
  return $axios(`/system/org/${id}`, { method: 'delete' })
}

/**
 * 修改机构状态
 * PUT /system/org/{id}/status?status=0|1
 */
export function orgChangeStatus(id: number, status: number) {
  return $axios(`/system/org/${id}/status?status=${status}`, { method: 'put' })
}

/**
 * 预检查删除机构影响
 * GET /system/org/{id}/check-remove
 */
export async function orgCheckRemove(id: number): Promise<CheckRemoveVO> {
  const res: any = await $axios(`/system/org/${id}/check-remove`, { method: 'get' })
  return res as CheckRemoveVO
}

/**
 * 预检查禁用机构影响
 * GET /system/org/{id}/check-disable
 */
export async function orgCheckDisable(id: number): Promise<CheckDisableVO> {
  const res: any = await $axios(`/system/org/${id}/check-disable`, { method: 'get' })
  return res as CheckDisableVO
}

/**
 * 预检查经销商关联医院变更影响
 * POST /system/org/{id}/hospital-change-check
 */
export async function orgHospitalChangeCheck(id: number, hospitalOrgIds: number[]): Promise<HospitalChangeCheckVO> {
  const res: any = await $axios(`/system/org/${id}/hospital-change-check`, { method: 'post', data: hospitalOrgIds })
  return res as HospitalChangeCheckVO
}

/**
 * 部门列表 不带分页
 * GET
 */
export function orgAll() {
  return $axios('/system/org/all', { method: 'get'})
}

/** 导出机构列表 */
export const exportOrgList = async () => {
  const res = await $axios('/system/org/export', { method: 'get', responseType: 'blob' })
  const result = handleBlobResponse(res)
  if (result.fileName.startsWith('download_')) {
    result.fileName = `机构导出_${new Date().toISOString().split('T')[0]}.xlsx`
  }
  return result
}
