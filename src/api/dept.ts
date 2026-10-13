import $axios from "@/utils/http";

// ========== 数据结构 ==========

/** 部门分页查询参数 */
export interface DeptQuery {
  pageNum?: number
  pageSize?: number
  deptType?: string
  deptName?: string
  status?: number
}

/** 部门列表响应 */
export interface DeptPageVO {
  records: DeptVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 部门统计数据 */
export interface DeptStatisticsVO {
  total: number
  enterprise: number
  business: number
}

/** 部门视图对象 */
export interface OrgSimpleVO {
  id: number
  orgName: string
  orgCode: string
  orgType: string
}

/** 部门视图对象 */
export interface DeptVO {
  id: number
  deptName: string
  deptCode: string
  deptType: string
  orgs: OrgSimpleVO[]
  leaderUser?: string
  status: number
  statusName: string
  remark?: string
  createTime?: string
  updateTime?: string
}

/** 创建部门请求 */
export interface CreateDeptDTO {
  deptName: string
  deptType: string
  orgIds?: number[]
  leaderUser?: string
  remark?: string
}

/** 更新部门请求 */
export interface UpdateDeptDTO {
  deptName?: string
  deptType?: string
  orgIds?: number[]
  leaderUser?: string
  remark?: string
}

// ========== API ==========

/**
 * 分页查询部门列表
 * POST /system/dept/list
 */
export async function deptList(params: DeptQuery): Promise<DeptPageVO> {
  const res: any = await $axios('/system/dept/list', { method: 'post', data: params })
  return res as DeptPageVO
}

/** 获取部门统计数据 */
export async function deptStatistics(): Promise<DeptStatisticsVO> {
  const res: any = await $axios('/system/dept/statistics', { method: 'get' })
  return res as DeptStatisticsVO
}

/**
 * 根据ID查询部门详情
 * GET /system/dept/{id}
 */
export async function deptDetail(id: number): Promise<DeptVO> {
  const res: any = await $axios(`/system/dept/${id}`, { method: 'get' })
  return res as DeptVO
}

/**
 * 创建部门
 * POST /system/dept
 */
export function deptCreate(data: CreateDeptDTO) {
  return $axios('/system/dept', { method: 'post', data })
}

/**
 * 更新部门
 * PUT /system/dept/{id}
 */
export function deptUpdate(id: number, data: UpdateDeptDTO) {
  return $axios(`/system/dept/${id}`, { method: 'put', data })
}

/**
 * 删除部门
 * DELETE /system/dept/{id}
 */
export function deptDelete(id: number) {
  return $axios(`/system/dept/${id}`, { method: 'delete' })
}

/**
 * 修改部门状态
 * PUT /system/dept/{id}/status
 */
export function deptChangeStatus(id: number, status: number) {
  return $axios(`/system/dept/${id}/status?status=${status}`, { method: 'put' })
}

/**
 * 全量查询部门列表（用于下拉选择）
 * GET /system/dept/all
 */
export async function depAll(orgId?: number): Promise<DeptVO[]> {
  const res: any = await $axios('/system/dept/all', {
    method: 'get',
    params: orgId !== undefined ? { orgId } : undefined,
  })
  return (res as DeptVO[]) || []
}
