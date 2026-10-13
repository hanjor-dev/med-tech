import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';

/**
 * 路由列表状态管理
 * @methods setWholeRoutes 设置完整路由列表（包含 Layout 父路由）
 * @methods setMenuRoutes 设置菜单路由列表（Layout 的 children）
 * @methods setPermissions 设置用户权限码列表
 */
interface RoutesState {
  /** 完整路由树（含 Layout 父路由） */
  wholeRoutes: RouteRecordRaw[];
  /** 菜单路由列表（Layout 的 children，用于侧边栏渲染） */
  menuRoutes: RouteRecordRaw[];
  /** 用户权限码列表，如 ['auth:role:create', 'auth:account:delete'] */
  permissions: string[];
}

export const useRoutes = defineStore('routes', {
  state: (): RoutesState => ({
    wholeRoutes: [],
    menuRoutes: [],
    permissions: [],
  }),

  actions: {
    setWholeRoutes(routes: RouteRecordRaw[]) {
      this.wholeRoutes = routes;
    },

    setMenuRoutes(routes: RouteRecordRaw[]) {
      this.menuRoutes = routes;
    },

    setPermissions(permissions: string[]) {
      this.permissions = permissions;
    },

    /** 判断用户是否拥有指定权限码 */
    hasPermission(code: string): boolean {
      if (this.permissions.length === 0) return true; // 无权限配置时默认放行
      return this.permissions.includes(code);
    },

    /** 清理路由状态（退出登录时调用） */
    clearRoutes() {
      this.wholeRoutes = [];
      this.menuRoutes = [];
      this.permissions = [];
    },
  },
});
