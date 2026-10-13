import $axios from "@/utils/http";

// ========== 数据结构 ==========

/** 部位树形节点 */
export interface BodyPartVO {
  id: number
  parentId: number
  name: string
  code: string
  level: number
  designerCode?: string
  sort?: number
  status: number
  statusName: string
  remark?: string
  scope?: string
  createTime: string
  updateTime: string
  children?: BodyPartVO[]
}

/** 部位下拉选项节点（扁平列表，无 children） */
export interface BodyPartOptionVO {
  id: number
  name: string
  code: string
  sort?: number
  status: number
  statusName: string
  remark?: string | null
  createTime: string
  updateTime: string
}

/** 部位详情 */
export interface BodyPartDetailVO {
  id: number
  parentId: number
  parentName?: string
  name: string
  code: string
  level: number
  designerCode?: string
  sort?: number
  status: number
  statusName: string
  remark?: string
  scope?: string
  createTime: string
  updateTime: string
}

/** 创建部位请求 */
export interface CreateBodyPartDTO {
  parentId: number
  name: string
  designerCode?: string
  sort?: number
  status?: number
  remark?: string
  scope?: string
}

/** 更新部位请求 */
export interface UpdateBodyPartDTO {
  name?: string
  designerCode?: string
  sort?: number
  status?: number
  remark?: string
  scope?: string
}

// ========== API 函数 ==========

/**
 * 获取部位树形结构
 * POST /basic/body-part/tree
 */
export async function bodyPartTree(): Promise<BodyPartVO[]> {
  const res: any = await $axios('/basic/body-part/tree', { method: 'post', data: {} })
  return res as BodyPartVO[]
}

/**
 * 获取部位列表（平级）
 * POST /basic/body-part/list
 */
export async function bodyPartList(): Promise<BodyPartVO[]> {
  const res: any = await $axios('/basic/body-part/list', { method: 'post', data: {} })
  return res as BodyPartVO[]
}

/**
 * 获取部位下拉选项
 * POST /basic/body-part/options
 */
export async function bodyPartOptions(): Promise<BodyPartOptionVO[]> {
  const res: any = await $axios('/basic/body-part/list', { method: 'post', data: {} })
  return (res?.data || res || []) as BodyPartOptionVO[]
}

/**
 * 查询部位详情
 * GET /basic/body-part/{id}
 */
export async function bodyPartDetail(id: number): Promise<BodyPartDetailVO> {
  const res: any = await $axios(`/basic/body-part/${id}`, { method: 'get' })
  return res as BodyPartDetailVO
}

/**
 * 创建部位
 * POST /basic/body-part
 */
export function bodyPartCreate(data: CreateBodyPartDTO) {
  return $axios('/basic/body-part', { method: 'post', data })
}

/**
 * 更新部位
 * PUT /basic/body-part/{id}
 */
export function bodyPartUpdate(id: number, data: UpdateBodyPartDTO) {
  return $axios(`/basic/body-part/${id}`, { method: 'put', data })
}

/**
 * 删除部位
 * DELETE /basic/body-part/{id}
 */
export function bodyPartDelete(id: number) {
  return $axios(`/basic/body-part/${id}`, { method: 'delete' })
}

/**
 * 修改部位状态
 * PUT /basic/body-part/{id}/status?status=0|1
 */
export function bodyPartChangeStatus(id: number, status: number) {
  return $axios(`/basic/body-part/${id}/status?status=${status}`, { method: 'put' })
}
