import $axios, { handleBlobResponse } from "@/utils/http";

// ========== 数据结构 ==========

/** 重建项目树形节点 */
export interface RebuildProjectVO {
  id: number
  parentId: number
  bodyPartId: number
  bodyPartName?: string
  name: string
  code: string
  level: number
  standardPrice?: number
  urgentPrice?: number
  categoryCode?: string
  specialty?: string
  specialtyName?: string
  estimatedHours?: number
  points?: number
  description?: string
  projectDesc?: string
  formingRequirements?: string
  sort?: number
  status: number
  statusName: string
  remark?: string
  createTime: string
  updateTime: string
  children?: RebuildProjectVO[]
}

/** 项目下拉选项分组 */
export interface RebuildProjectOptionGroupVO {
  bodyPartId: number
  bodyPartName: string
  children: ProjectOptionItemVO[]
}

/** 项目下拉选项子项 */
export interface ProjectOptionItemVO {
  id: number
  parentId: number
  name: string
  code: string
  level: number
  children?: ProjectOptionItemVO[]
}

/** 项目详情 */
export interface RebuildProjectDetailVO {
  id: number
  bodyPartId: number
  bodyPartName?: string
  parentId: number
  parentName?: string
  name: string
  code: string
  level: number
  standardPrice?: number
  urgentPrice?: number
  categoryCode?: string
  specialty?: string
  specialtyName?: string
  estimatedHours?: number
  points?: number
  description?: string
  formingRequirements?: string
  sort?: number
  status: number
  statusName: string
  remark?: string
  createTime: string
  updateTime: string
}

/** 创建项目请求 */
export interface CreateRebuildProjectDTO {
  bodyPartId: number
  parentId: number
  name: string
  standardPrice?: number
  urgentPrice?: number
  categoryCode?: string
  specialty?: string
  estimatedHours?: number
  points?: number
  description?: string
  formingRequirements?: string
  sort?: number
  status?: number
  remark?: string
}

/** 更新项目请求 */
export interface UpdateRebuildProjectDTO {
  bodyPartId?: number
  parentId?: number
  name?: string
  standardPrice?: number
  urgentPrice?: number
  categoryCode?: string
  specialty?: string
  estimatedHours?: number
  points?: number
  description?: string
  formingRequirements?: string
  sort?: number
  status?: number
  remark?: string
}

// ========== API 函数 ==========

/**
 * 获取项目树形结构
 * POST /basic/rebuild-project/tree
 */
// export async function rebuildProjectTree(params?: {
//   categoryCode?: string
//   bodyPartId?: number
//   keyword?: string
// }): Promise<RebuildProjectVO[]> {
//   const res: any = await $axios('/basic/rebuild-project/tree', {
//     method: 'post',
//     data: params : {},
//   })
//   return res as RebuildProjectVO[]
// }
export async function rebuildProjectTree(params?: {
  categoryCode?: string
  bodyPartId?: number
  keyword?: string
}): Promise<RebuildProjectVO[]> {
  const res: any = await $axios('/basic/rebuild-project/tree', {
    method: 'post',
    data: params || {},
  })
  return res as RebuildProjectVO[]
}

/**
 * 获取完整部位-项目树形结构（部位 → 项目 → 子项目）
 * POST /basic/rebuild-project/full-tree
 */
export async function rebuildProjectFullTree(params?: {
  categoryCode?: string
  bodyPartId?: number
  keyword?: string
}): Promise<RebuildProjectVO[]> {
  const res: any = await $axios('/basic/rebuild-project/full-tree', {
    method: 'post',
    data: params || {},
  })
  return res as RebuildProjectVO[]
}

/**
 * 根据部位ID获取项目列表
 * POST /basic/rebuild-project/by-body-part
 */
export async function rebuildProjectByBodyPart(bodyPartId: number, categoryCode?: string, keyword?: string): Promise<RebuildProjectVO[]> {
  const data: Record<string, any> = { bodyPartId }
  if (categoryCode) data.categoryCode = categoryCode
  if (keyword) data.keyword = keyword
  const res: any = await $axios('/basic/rebuild-project/by-body-part', {
    method: 'post',
    data,
  })
  return res as RebuildProjectVO[]
}

/**
 * 获取项目下拉选项
 * POST /basic/rebuild-project/options
 */
export async function rebuildProjectOptions(bodyPartId?: number, categoryCode?: string): Promise<RebuildProjectOptionGroupVO[]> {
  const data: Record<string, any> = {}
  if (bodyPartId !== undefined) data.bodyPartId = bodyPartId
  if (categoryCode) data.categoryCode = categoryCode
  const res: any = await $axios('/basic/rebuild-project/options', { method: 'post', data })
  return res as RebuildProjectOptionGroupVO[]
}

/**
 * 查询项目详情
 * GET /basic/rebuild-project/{id}
 */
export async function rebuildProjectDetail(id: number): Promise<RebuildProjectDetailVO> {
  const res: any = await $axios(`/basic/rebuild-project/${id}`, { method: 'get' })
  return res as RebuildProjectDetailVO
}

/**
 * 创建重建项目
 * POST /basic/rebuild-project
 */
export function rebuildProjectCreate(data: CreateRebuildProjectDTO) {
  return $axios('/basic/rebuild-project', { method: 'post', data })
}

/**
 * 更新重建项目
 * PUT /basic/rebuild-project/{id}
 */
export function rebuildProjectUpdate(id: number, data: UpdateRebuildProjectDTO) {
  return $axios(`/basic/rebuild-project/${id}`, { method: 'put', data })
}

/**
 * 删除重建项目
 * DELETE /basic/rebuild-project/{id}
 */
export function rebuildProjectDelete(id: number) {
  return $axios(`/basic/rebuild-project/${id}`, { method: 'delete' })
}

/**
 * 修改重建项目状态
 * PUT /basic/rebuild-project/{id}/status?status=0|1
 */
export function rebuildProjectChangeStatus(id: number, status: number) {
  return $axios(`/basic/rebuild-project/${id}/status?status=${status}`, { method: 'put' })
}

/** 导出重建项目列表 */
export const exportRebuildProjectList = async () => {
  const res = await $axios('/basic/rebuild-project/export', { method: 'get', responseType: 'blob' })
  const result = handleBlobResponse(res)
  if (result.fileName.startsWith('download_')) {
    result.fileName = `重建项目导出_${new Date().toISOString().split('T')[0]}.xlsx`
  }
  return result
}
