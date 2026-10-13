import $axios from "@/utils/http";

// ========== Dict Type APIs ==========

/** 字典类型列表（根节点） */
export function dictTypeList() {
  return $axios('/system/dict/type/list', { method: 'get' })
}

/** 获取完整字典树形结构 */
export function dictTree() {
  return $axios('/system/dict/tree', { method: 'get' })
}

/** 获取指定类型的字典树形结构 */
export function dictTreeByType(typeCode: string) {
  return $axios(`/system/dict/tree/${typeCode}`, { method: 'get' })
}

/** 获取字典下拉选项（叶子节点） */
export function dictOptions(typeCode: string) {
  return $axios('/system/dict/options', { method: 'post', data: { typeCode } })
}

/** 根据 typeCode 获取字典数据项列表 */
export function dictData(typeCode: string) {
  return $axios(`/system/dict/data/${typeCode}`, { method: 'get' })
}

/** 查询字典详情 */
export function dictDetail(id: number) {
  return $axios(`/system/dict/${id}`, { method: 'get' })
}

/** 创建字典 */
export function dictCreate(data: {
  parentId: number
  dictName: string
  dictValue?: string
  sort?: number
  status?: number
  remark?: string
}) {
  return $axios('/system/dict', { method: 'post', data })
}

/** 更新字典 */
export function dictUpdate(id: number, data: {
  dictName: string
  dictValue?: string
  sort?: number
  status?: number
  remark?: string
}) {
  return $axios(`/system/dict/${id}`, { method: 'put', data })
}

/** 删除字典 */
export function dictDelete(id: number) {
  return $axios(`/system/dict/${id}`, { method: 'delete' })
}

/** 修改字典状态（级联） */
export function dictChangeStatus(id: number, status: number) {
  return $axios(`/system/dict/${id}/status?status=${status}`, { method: 'put' })
}
