import $axios from '@/utils/http';

/** ========== 登录 ========== */
export interface LoginReq {
  username: string;
  password: string;
}
export interface UserVO {
  id?: number | string;
  username?: string;
  realName?: string;
  phone?: string;
  email?: string;
  sex?: number;
  sexName?: string;
  avatar?: string;
  accountType?: number;
  accountTypeName?: string;
  orgId?: number | string;
  orgName?: string;
  deptId?: number | string;
  deptName?: string;
  roleId?: number | string;
  roleName?: string;
  roleCode?: string;
  dataScopeType?: string;
  status?: number;
  statusName?: string;
  remark?: string;
  employeeNo?: string;
  specialty?: string;
  specialtyName?: string;
  qualification?: string;
  settlementType?: number;
  settlementTypeName?: string;
  createTime?: string;
  
}
export interface MenuVO {
  id: number | string;
  parentId: number | string;
  resourceName: string;
  resourceCode: string;
  resourceType: number;          // 1=一级菜单, 2=二级菜单
  resourceTypeName: string;
  path: string;
  component?: string;            // 二级菜单有，如 "business/order/index.vue"
  redirect?: string;
  icon?: string;
  sort: number;
  visible: number;                // 1=显示, 0=隐藏
  status: number;
  visibleName?: string;
  statusName?: string;
  createTime?: string;
  updateTime?: string;
  children?: MenuVO[];
  [key: string]: any;
}
export interface LoginRes {
  token: string;
  user: UserVO;
  menus: MenuVO[];
  permissions: string[];
}

/** ========== 登出 ========== */
export const logoutApi = (): Promise<any> =>
  $axios.post('/system/auth/logout').then(res => res.data);

/** ========== 获取当前用户信息 ========== */
export interface UserInfoRes {
  user: UserVO;
  menus: MenuVO[];
  permissions: string[];
}
export const getUserInfoApi = (): Promise<UserInfoRes> =>
  $axios.get<UserInfoRes>('/system/auth/info').then(res => res.data as UserInfoRes);

/** ========== 登录历史 ========== */
export interface LoginLogVO {
  id: number
  userId: number
  username: string
  loginType: string
  ip: string
  location: string
  userAgent: string
  loginTime: string
  loginStatus: number
  loginStatusName: string
  failReason: string | null
}
export const getLoginHistoryApi = (limit = 30): Promise<LoginLogVO[]> =>
  $axios.get('/system/auth/login-history', { params: { limit } })

/** ========== 修改密码 ========== */
export interface ChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}
export const changePasswordApi = (data: ChangePasswordReq): Promise<any> =>
  $axios.put('/system/auth/password', data).then(res => res.data);
