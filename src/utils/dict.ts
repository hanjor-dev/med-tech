import { dictData as fetchDictData } from '@/api/dict'

// ============================================================
// 数据结构
// ============================================================
export interface DictItem {
  id: number
  parentId: number
  dictCode: string
  dictName: string
  dictValue?: string
  level: number
  sort: number
  status: number
  createTime: string
  updateTime: string
  children?: DictItem[]
}

export interface DictOption {
  label: string
  value: string
  id: number
}

/**
 * 获取字典选项列表
 * @param typeCode 字典类型编码
 * @returns Promise<DictOption[]>
 */
export async function getDictOptions(typeCode: string): Promise<DictOption[]> {
  try {
    const res: any = await fetchDictData(typeCode)
    const items: DictItem[] = res?.data || res || []
    return items
      .filter((item: DictItem) => item.status === 1)
      .sort((a: DictItem, b: DictItem) => a.sort - b.sort)
      .map((item: DictItem) => ({
        label: item.dictName,
        value: item.dictCode,
        id: item.id
      }))
  } catch {
    return []
  }
}

/**
 * 获取字典项列表
 * @param typeCode 字典类型编码
 */
export async function getDictItems(typeCode: string): Promise<DictItem[]> {
  try {
    const res: any = await fetchDictData(typeCode)
    return res?.data || res || []
  } catch {
    return []
  }
}

/**
 * 根据字典项编码获取显示名称
 */
export async function getDictLabel(typeCode: string, dictCode: string | undefined): Promise<string> {
  if (!dictCode) return '-'
  try {
    const res: any = await fetchDictData(typeCode)
    const items: DictItem[] = res?.data || res || []
    const item = items.find((c: DictItem) => c.dictCode === dictCode)
    return item?.dictName ?? '-'
  } catch {
    return '-'
  }
}

// ============================================================
// 常用字典快捷方法
// ============================================================

/** 机构类型 dictCode="1" */
export const getOrgTypeOptions = () => getDictOptions('1')

/** 医院等级 dictCode="3" */
export const getHospitalLevelOptions = () => getDictOptions('3')

/** 医院类型 dictCode="4" */
export const getHospitalTypeOptions = () => getDictOptions('4')

/** 代理产品线 dictCode="5" */
export const getAgentProductLineOptions = () => getDictOptions('5')

/** 重建项目分类 dictCode="6" */
export const getRebuildCategoryOptions = () => getDictOptions('6')

/** 部门类型 dictCode="6" */
export const getDeptTypeOptions = () => getDictOptions('6')