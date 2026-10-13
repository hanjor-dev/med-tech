import $axios, { handleBlobResponse } from "@/utils/http";

export interface UserVO {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  sex: string
  sexName: string
  avatar: string | null
  accountType: string
  accountTypeName: string
  dataScopeType: string
  hospitalIds: number[]
  orgId: number
  orgName: string
  deptId: number
  deptName: string
  roleId: number
  roleName: string
  roleCode: string
  employeeNo: string
  specialtyList: string[]
  specialtyNameList: string
  specialtyName: string
  qualification: string
  settlementType: number
  settlementTypeName: string
  status: number
  statusName: string
  remark: string
  createTime: string
  hospitalNames: string
  centerId?: number
  centerName?: string
}

export interface UserForm {
  username: string
  password?: string
  realName: string
  phone: string
  email?: string
  sex?: string
  avatar?: string
  accountType: string
  dataScopeType: string
  orgId?: number
  deptId?: number
  roleId?: number
  employeeNo?: string
  specialtyList?: string[]
  qualification?: string
  settlementType?: number
  hospitalIds?: number[]
  hospitalNames?: string[]
  remark?: string
  assetNumber?: string
  chargingTemplateId?: number
  centerId?: number
  managedOrgIds?: number[]
}

export interface UserQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  orgId?: number
  deptId?: number
  accountType?: string
  status?: number
  roleId?: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** 用户统计数据 */
export interface UserStatisticsVO {
  total: number
  enterprise: number
  business: number
}

/** 分页查询用户列表 */
export function userList(data: UserQuery) {
  return $axios<PageResult<UserVO>>('/system/user/list', { method: 'post', data })
}

/** 获取用户统计数据 */
export function userStatistics() {
  return $axios<UserStatisticsVO>('/system/user/statistics', { method: 'get' })
}

/** 查询用户详情 */
export function userDetail(id: number) {
  return $axios<UserVO>(`/system/user/${id}`, { method: 'get' })
}

/** 创建用户 */
export function userCreate(data: UserForm) {
  return $axios('/system/user', { method: 'post', data })
}

/** 更新用户 */
export function userUpdate(id: number, data: Partial<UserForm>) {
  return $axios(`/system/user/${id}`, { method: 'put', data })
}

/** 删除用户 */
export function userDelete(id: number) {
  return $axios(`/system/user/${id}`, { method: 'delete' })
}

/** 修改用户状态 */
export function userChangeStatus(id: number, status: number) {
  return $axios(`/system/user/${id}/status?status=${status}`, { method: 'put' })
}

/** 重置用户密码 */
export function userResetPassword(id: number) {
  return $axios(`/system/user/${id}/reset-password`, { method: 'put' })
}

/** 查询用户关联的医院列表 */
export function userHospitals(userId: number) {
  return $axios(`/system/user/${userId}/hospitals`, { method: 'get' })
}

export function userHospitalsByOrgId(id: number, orgId: number){
  return $axios(`/system/hospital-group-template/${id}?orgId=${orgId}`, { method: 'get' })
}

/** 分配用户医院范围 */
export function userAssignHospitals(userId: number, hospitalIds: number[]) {
  return $axios(`/system/user/${userId}/hospitals`, { method: 'put', data: { hospitalIds } })
}

export function userTemplateHospitals(){
  return $axios(`/system/user/{userId}/hospitals/template/{templateId}`, { method: 'get'})
}

/** 预览自动生成的账号 */
export function usernamePreview(orgId: number) {
  return $axios<string>(`/system/user/username/preview?orgId=${orgId}`, { method: 'get' })
}

/** 导出用户列表 */
export const exportUserList = async () => {
  const res = await $axios('/system/user/export', { method: 'get', responseType: 'blob' })
  const result = handleBlobResponse(res)
  if (result.fileName.startsWith('download_')) {
    result.fileName = `账户导出_${new Date().toISOString().split('T')[0]}.xlsx`
  }
  return result
}
