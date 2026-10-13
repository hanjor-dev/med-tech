import $axios from "@/utils/http";

// ========== 类型定义 ==========
/** 配置类型 */
export type ConfigType = 'string' | 'number' | 'boolean' | 'json'
/** 配置分组 */
export type ConfigGroup = 'system' | 'security' | 'upload' | 'other'

export interface ConfigVO {
  id: number
  configKey: string
  configName: string
  configValue: string
  configType: ConfigType
  configGroup: ConfigGroup
  configDesc?: string
  isSystem: 0 | 1
  isPublic: 0 | 1
  sort: number
  status: 0 | 1
  createTime?: string
  updateTime?: string
}

export interface ConfigListParams {
  pageNum?: number
  pageSize?: number
  configKey?: string
  configName?: string
  configGroup?: ConfigGroup
  configType?: ConfigType
  status?: 0 | 1
}

/** 分页响应结构 */
export interface ConfigPageVO {
  records: ConfigVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface CreateConfigDTO {
  configKey: string
  configName: string
  configValue?: string
  configType?: ConfigType
  configGroup: ConfigGroup
  configDesc?: string
  isSystem?: 0 | 1
  isPublic?: 0 | 1
  sort?: number
  status?: 0 | 1
}

export interface UpdateConfigDTO {
  configName?: string
  configValue?: string
  configType?: ConfigType
  configGroup?: ConfigGroup
  configDesc?: string
  isPublic?: 0 | 1
  sort?: number
  status?: 0 | 1
}

// ========== 接口函数 ==========
/** 9.1 分页查询配置列表 */
export function getConfigList(data: ConfigListParams): Promise<ConfigPageVO> {
	return $axios('/system/config/list', { method: 'post', data })
}

/** 9.2 查询配置详情 */
export function getConfigDetail(id: number) {
  return $axios<ConfigVO>(`/system/config/${id}`, { method: 'get' })
}

export function getConfigDetailByKey(key: string) {
  return $axios<ConfigVO>(`/system/config/key?key=${key}`, { method: 'get' })
}

/** 9.3 创建配置 */
export function createConfig(data: CreateConfigDTO) {
  return $axios('/system/config', { method: 'post', data })
}

/** 9.4 更新配置 */
export function updateConfig(id: number, data: UpdateConfigDTO) {
  return $axios(`/system/config/${id}`, { method: 'put', data })
}

/** 9.5 删除配置 */
export function deleteConfig(id: number) {
  return $axios(`/system/config/${id}`, { method: 'delete' })
}

/** 9.6 获取所有公开配置（无需登录） */
export function getPublicConfigList() {
  return $axios<ConfigVO[]>('/system/config/public', { method: 'get' })
}

/** 9.7 获取下拉选项（如配置分组） GET /system/select/options?type=&parentId= */
export function getSelectOptions(type: string, parentId?: number) {
  return $axios('/system/select/options', {
    method: 'post',
    data: { type, parentId: parentId ?? 0 },
  })
}
