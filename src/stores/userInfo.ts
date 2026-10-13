import { Session } from "@/utils/storage";
import { defineStore } from "pinia";
import type { UserVO, MenuVO } from "@/api/auth";
import $axios from "@/utils/http";
import axios from "axios";

interface UserInfoState {
  userInfos: { isLogin: boolean } & UserVO;
  token: string;
  menus: MenuVO[];
  permissions: string[];
}

export const useUserInfo = defineStore("userInfo", {
  state: (): UserInfoState => ({
    userInfos: { isLogin: false },
    token: Session.get("token") || "",
    menus: [],
    permissions: [],
  }),

  getters: {
    /** 当前用户名（展示用） */
    displayName(): string {
      return this.userInfos.realName || this.userInfos.username || "";
    },
    /** 是否有头像 */
    hasAvatar(): boolean {
      return !!this.userInfos.avatar;
    },
    /** 是否为超级管理员 */
    isSuperAdmin(): boolean {
      return this.userInfos.roleCode === "super_admin";
    },
    /** 当前登录用户ID */
    userId(): string | number {
      return this.userInfos.id || "";
    },
  },
  actions: {
    /** 设置用户信息 */
    setInfos(data: UserVO, menus: MenuVO[], permissions: string[]) {
      this.userInfos = { isLogin: true, ...data};
      this.menus = menus;
      this.permissions = permissions;
      Session.set("userInfo", this.userInfos);
      Session.set("userMenus", menus);
      Session.set("userPermissions", permissions);
    },
    /** 登录 */
    async login(data: { principal: string; credential: string; loginType: string; captchaToken?: string }) {
      const res = await $axios.post("/system/auth/login", data) as any;
      this.token = res.token || "";
      Session.set("token", this.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
    },
    async getUserInfo() {
      const res = await $axios.get("/system/auth/info") as any;
      const { user, menus, permissions } = res;
      this.setInfos(user, menus, permissions)
    },
    async logout() {
      await $axios.post("/system/auth/logout");
      this.clearUserInfo();
    },

    /** 从缓存中恢复用户信息 */
    async restoreFromSession() {
      const userInfo = Session.get("userInfo");
      const menus = Session.get("userMenus");
      const permissions = Session.get("userPermissions");
      if (userInfo) {
        this.userInfos = { ...userInfo, isLogin: true };
      }
      if (menus) {
        this.menus = menus;
      }
      if (permissions) {
        this.permissions = permissions;
      }
    },

    /** 判断是否有指定权限 */
    hasPermission(code: string): boolean {
      if (this.permissions.includes("*")) return true;
      return this.permissions.includes(code);
    },

    /** 退出登录清理 */
    clearUserInfo() {
      this.userInfos = { isLogin: false };
      this.token = "";
      this.menus = [];
      this.permissions = [];
      Session.remove("token");
      Session.remove("userInfo");
      Session.remove("userMenus");
      Session.remove("userPermissions");
    },
  },
});
