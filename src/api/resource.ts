import $axios from "@/utils/http";

// ========== 类型定义 ==========
/** 资源类型：1=一级菜单 2=二级菜单 3=按钮 */
export type ResourceType = 1 | 2 | 3

export interface ResourceItem {
  id: number
  parentId: number
  resourceName: string
  resourceCode: string
  resourceType: ResourceType
  resourceTypeName: string
  icon?: string
  path?: string
  component?: string
  sort?: number
  visible?: number
  visibleName?: string
  status?: number
  statusName?: string
  createTime?: string
  updateTime?: string
  checked?: boolean
  children?: ResourceItem[]
}

export interface ResourceListParams {
  pageNum?: number
  pageSize?: number
  resourceName?: string
  resourceCode?: string
  resourceType?: ResourceType
  parentId?: number
  status?: number
  queryScope?: number
}

export interface ResourceFormData {
  parentId: number
  resourceName: string
  resourceCode: string
  resourceType: ResourceType
  icon?: string
  path?: string
  component?: string
  sort?: number
  visible?: number
  status?: number
}

// ========== 接口函数 ==========
/** 5.1 获取资源树（管理后台） */
export function getResourceTree() {
  return $axios<ResourceItem[]>('/system/resource/tree', { method: 'get' })
}

/** 5.2 分页查询资源列表 */
export function getResourceList(data: ResourceListParams) {
  return $axios('/system/resource/list', { method: 'post', data })
}

/** 5.3 查询资源详情 */
export function getResourceDetail(id: number) {
  return $axios<ResourceItem>(`/system/resource/${id}`, { method: 'get' })
}

/** 5.4 新增资源 */
export function addResource(data: ResourceFormData) {
  return $axios('/system/resource', { method: 'post', data })
}

/** 5.5 更新资源 */
export function updateResource(id: number, data: Partial<ResourceFormData>) {
  return $axios(`/system/resource/${id}`, { method: 'put', data })
}

/** 5.6 删除资源 */
export function deleteResource(id: number) {
  return $axios(`/system/resource/${id}`, { method: 'delete' })
}

/** 5.7 获取角色已分配的资源ID列表 */
export function getRoleResourceIds(roleId: number) {
  return $axios<number[]>(`/system/resource/role/${roleId}`, { method: 'get' })
}

/** 5.8 分配角色资源 */
export function assignRoleResources(roleId: number, resourceIds: number[]) {
  return $axios(`/system/resource/role/${roleId}`, { method: 'put', data: resourceIds })
}

/** 5.9 获取带分配状态的资源树（角色分配场景） */
export function getResourceTreeForRole(roleId: number) {
  return $axios<ResourceItem[]>(`/system/resource/tree/role/${roleId}`, { method: 'get' })
}

/** 5.10 获取全部资源树（新建角色时使用，checked=false） */
export function getAllResourceTree() {
  return $axios<ResourceItem[]>('/system/resource/tree/all', { method: 'get' })
}

export function switchResourceStatus(id: number, status: number) {
  return $axios(`/system/resource/${id}/status`, { method: 'put', data: { status } })
}

