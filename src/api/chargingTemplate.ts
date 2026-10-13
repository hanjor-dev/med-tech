import $axios from "@/utils/http";

export interface ChargingTemplateQuery {
  pageNum?: number
  pageSize?: number
  templateName?: string
}

export interface ChargingTemplatePageVO {
  records: ChargingTemplateVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface ChargingTemplateVO {
  id: number
  templateName: string
  remark?: string
  status: number
  statusName: string
  createTime?: string
  updateTime?: string
}

export interface ChargingTemplateItemVO {
  id: number
  rebuildProjectId: number
  projectName: string
  price: number
  points?: number
  isObsolete: boolean
  bodyPartId?: number
  bodyPartName?: string
}

export interface ChargingTemplateDetailVO extends ChargingTemplateVO {
  totalActiveProjects: number
  missingCount: number
  obsoleteCount: number
  items: ChargingTemplateItemVO[]
}

export interface ChargingTemplateItemDTO {
  rebuildProjectId: number
  price: number
  bodyPartId?: number
}

export interface CreateChargingTemplateDTO {
  templateName: string
  remark?: string
  status?: number
  items: ChargingTemplateItemDTO[]
}

export interface UpdateChargingTemplateDTO {
  templateName: string
  remark?: string
  status?: number
  items: ChargingTemplateItemDTO[]
}

export async function chargingTemplateList(params?: ChargingTemplateQuery): Promise<ChargingTemplatePageVO> {
  const res: any = await $axios('/basic/charging-template/list', { method: 'get', params })
  return res as ChargingTemplatePageVO
}

export async function chargingTemplateDetail(id: number): Promise<ChargingTemplateDetailVO> {
  const res: any = await $axios(`/basic/charging-template/${id}`, { method: 'get' })
  return res as ChargingTemplateDetailVO
}

export function chargingTemplateCreate(data: CreateChargingTemplateDTO) {
  return $axios('/basic/charging-template', { method: 'post', data })
}

export function chargingTemplateUpdate(id: number, data: UpdateChargingTemplateDTO) {
  return $axios(`/basic/charging-template/${id}`, { method: 'put', data })
}

export function chargingTemplateDelete(id: number) {
  return $axios(`/basic/charging-template/${id}`, { method: 'delete' })
}

export async function chargingTemplateAll(): Promise<ChargingTemplateVO[]> {
  const res: any = await $axios.get('/basic/charging-template/all')
  return (res ?? []) as ChargingTemplateVO[]
}
