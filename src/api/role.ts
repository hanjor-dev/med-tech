import $axios from "@/utils/http";

// ========== 类型定义 ==========
export interface RoleVO {
  id: number
  roleName: string
  roleCode: string
  roleDesc?: string
  accountType: number | string
  accountTypeName: string
  dataScopeType: string
  dataScopeTypeName: string
  status: number
  statusName: string
  remark?: string
  createTime?: string
  updateTime?: string
  resourceIds?: number[]
}

export interface RoleFormData {
  roleName: string
  roleCode: string
  roleDesc?: string
}

export interface RoleListParams {
  pageNum?: number
  pageSize?: number
  roleName?: string
  roleCode?: string
  status?: number
}

export interface RoleStatusData {
  status: number
}

// ========== 接口函数 ==========
/** 4.1 分页查询角色列表 */
export function getRoleList(data: RoleListParams) {
  return $axios('/system/role/list', { method: 'post', data })
}

/** 4.2 查询角色详情 */
export function getRoleDetail(id: number) {
  return $axios<RoleVO>(`/system/role/${id}`, { method: 'get' })
}

/** 4.3 创建角色 */
export function createRole(data: Partial<RoleVO>) {
  return $axios('/system/role', { method: 'post', data })
}

/** 4.4 更新角色 */
export function updateRole(id: number, data: Partial<RoleFormData>) {
  return $axios(`/system/role/${id}`, { method: 'put', data })
}

/** 4.5 删除角色 */
export function deleteRole(id: number) {
  return $axios(`/system/role/${id}`, { method: 'delete' })
}

/** 4.6 修改角色状态 */
export function changeRoleStatus(id: number, status: number) {
  return $axios(`/system/role/${id}/status?status=${status}`, { method: 'put' })
}

/** 4.7 获取数据权限类型 */
export function getDataScopeTypes() {
  return $axios('/system/select/data-scope-types', { method: 'post' })
}

/**
 * 角色列表 不带分页
 * GET
 */
export function roleAll() {
  return $axios('/system/role/all', { method: 'get' })
}

