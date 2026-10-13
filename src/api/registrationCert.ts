import $axios from "@/utils/http";

// ========== 数据结构 ==========

/** 注册证分页查询参数 */
export interface CertQuery {
  pageNum?: number
  pageSize?: number
  certCode?: string
  certName?: string
  status?: number
}

/** 注册证列表响应 */
export interface CertPageVO {
  records: RegistrationCertVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 注册证视图对象 */
export interface RegistrationCertVO {
  id: number
  certCode: string
  certName: string
  validFrom?: string
  validTo?: string
  certFileUrl?: string
  status: number
  statusName: string
  remark?: string
  createTime?: string
}

/** 创建注册证请求 */
export interface CreateCertDTO {
  certCode: string
  certName: string
  validFrom?: string
  validTo?: string
  certFileUrl?: string
  remark?: string
}

/** 更新注册证请求 */
export interface UpdateCertDTO {
  certCode?: string
  certName?: string
  validFrom?: string
  validTo?: string
  certFileUrl?: string
  status?: number
  remark?: string
}

// ========== API ==========

/**
 * 分页查询注册证列表
 * POST /basic/registration-cert/list
 */
export async function certList(params: CertQuery): Promise<CertPageVO> {
  const res: any = await $axios('/basic/registration-cert/list', { method: 'post', data: params })
  return res as CertPageVO
}

/**
 * 根据ID查询注册证详情
 * GET /basic/registration-cert/{id}
 */
export async function certDetail(id: number): Promise<RegistrationCertVO> {
  const res: any = await $axios(`/basic/registration-cert/${id}`, { method: 'get' })
  return res as RegistrationCertVO
}

/**
 * 创建注册证
 * POST /basic/registration-cert
 */
export function certCreate(data: CreateCertDTO) {
  return $axios('/basic/registration-cert', { method: 'post', data })
}

/**
 * 更新注册证
 * PUT /basic/registration-cert/{id}
 */
export function certUpdate(id: number, data: UpdateCertDTO) {
  return $axios(`/basic/registration-cert/${id}`, { method: 'put', data })
}

/**
 * 删除注册证
 * DELETE /basic/registration-cert/{id}
 */
export function certDelete(id: number) {
  return $axios(`/basic/registration-cert/${id}`, { method: 'delete' })
}

/**
 * 查询有效注册证列表（不分页，validTo >= 当前日期）
 * GET /basic/registration-cert/valid-list
 */
export async function certValidList(): Promise<RegistrationCertVO[]> {
  const res: any = await $axios('/basic/registration-cert/valid-list', { method: 'get' })
  return res as RegistrationCertVO[]
}
