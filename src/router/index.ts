import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import pinia from "@/stores";
import { useUserInfo } from "@/stores/userInfo";
import { useRoutes } from "@/stores/routes";
import axios from "axios";
import type { MenuVO } from "@/api/auth";
import { ElMessage } from "element-plus";

// ── 预注册所有视图组件（解决动态 import 无法被 Vite 打包的问题） ──────────────────
const views = import.meta.glob("@/views/**/*.vue");

const componentMap: Record<string, () => Promise<unknown>> = {};
for (const [path, componentFn] of Object.entries(views)) {
  // path 形如 /src/views/business/order.vue → business/order
  const key = path.replace("/src/views/", "").replace(".vue", "");
  componentMap[key] = componentFn as () => Promise<unknown>;
}

// ── Login Route ──────────────────────────────────────────────────────────────
const LoginRoute: RouteRecordRaw = {
  path: "/login",
  name: "login",
  component: () => import("@/views/login.vue"),
  meta: {
    title: "登录",
    redirectAlreadyLogin: true,
    icon: "&#xe602;",
    sort: 15,
  },
};
//-- dashboard Route
const DashboardRoute: RouteRecordRaw = {
  path: "/dashboard",
  name: "dashboard",
  component: () => import("@/views/business/productionDashboard.vue"),
  meta: {
    title: "生产大屏",
    isLink: "",
    requiredLogin: false,
  },
};

// ── Root Layout Route ────────────────────────────────────────────────────────
const rootRoute: RouteRecordRaw = {
  path: "/",
  name: "/",
  component: () => import("@/layout/index.vue"),
  redirect: "/login",
  meta: { isKeepAlive: true,requiredLogin: true },
  children: [ ],
};

// ── MenuVO → RouteRecordRaw 转换 ────────────────────────────────────────────
/**
 * 将后端返回的菜单树转换为 Vue Router 路由记录
 * - resourceType === 1（一级菜单）：
 *   - 有 children → 生成 redirect 父路由，包含子路由
 *   - 无 children（叶子）→ 生成叶子路由，带 component
 * - resourceType === 2（二级菜单）：生成叶子路由（带 component）
 */
const convertMenuToRoute = (menu: MenuVO): RouteRecordRaw | null => {
  const { resourceType, path, redirect, children = [], visible, status, component } = menu;

  // 过滤不可见或停用的菜单
  if (visible === 0 || status === 0) return null;

  if (resourceType === 1) {
    const routeChildren: RouteRecordRaw[] = [];
    for (const child of children) {
      const childRoute = convertMenuToRoute(child);
      if (childRoute) routeChildren.push(childRoute);
    }

    // 有子菜单 → 父路由（redirect + children）
    if (routeChildren.length > 0) {
      return {
        path,
        name: path.replace(/\//g, "-").replace(/^-/, ""),
        redirect,
        meta: {
          title: menu.resourceName,
          icon: menu.icon || "&#xe62e;",
          sort: menu.sort,
          isHide: menu.visible === 0,
          requiredLogin: true,
        },
        children: routeChildren,
      } as RouteRecordRaw;
    } else {
      // 无子菜单 → 叶子路由（从 componentMap 匹配，fallback 到动态 import）
      // redirect 形如 /home/index，需要去掉前导斜杠匹配 componentMap 的 key
      const leafKey = (redirect ?? "").replace(/^\//, "");
      const loader = componentMap[leafKey];
      return {
        path,
        name: menu.resourceCode || path.replace(/\//g, "-").replace(/^-/, ""),
        component: loader ?? (() => import(/* @vite-ignore */ `/src/views/${leafKey}.vue`)),
        meta: {
          title: menu.resourceName,
          icon: menu.icon || "&#xe62e;",
          sort: menu.sort,
          isHide: menu.visible === 0,
          requiredLogin: true,
        },
      };
    }
  }

  if (resourceType === 2) {
    // 二级菜单 → 叶子路由
    if (!menu.component) return null;

    // menu.component 可能是 business/order.vue 或 business/order，统一去掉 .vue 后缀匹配
    const loader = componentMap[menu.component.replace(/\.vue$/, "")];
    return {
      path,
      name: menu.resourceCode || path.replace(/\//g, "-").replace(/^-/, ""),
      component: loader ?? (() => import(/* @vite-ignore */ `/src/views/${menu.component}`)),
      meta: {
        title: menu.resourceName,
        icon: menu.icon || "&#xe62e;",
        sort: menu.sort,
        isHide: menu.visible === 0,
      },
    };
  }

  return null;
};

/** 将菜单数组转换为完整路由树 */
const generateWholeRoutes = (menus: MenuVO[]): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = [];

  for (const menu of menus) {
    const route = convertMenuToRoute(menu);
    if (route) routes.push(route);
  }

  return routes;
};

// ── 创建 router ──────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHashHistory(),
  routes: [rootRoute, LoginRoute, DashboardRoute],
});

// ── 初始化 stores（此时 menus 可能尚未加载，暂不设置路由） ────────────────────────
const routesStore = useRoutes(pinia);
const userInfoStore = useUserInfo(pinia);

// ── 动态路由注册（从 menus 生成并注入 router） ─────────────────────────────────
/**
 * 根据 menus 数据生成路由并注册到 router
 */
const registerDynamicRoutes = (menus: MenuVO[]) => {
  const wholeRoutes = generateWholeRoutes(menus);
  routesStore.setWholeRoutes(wholeRoutes);
  rootRoute.children = [];
  for (const route of wholeRoutes) {
    rootRoute.children!.push(route);
    router.addRoute(rootRoute.name as string, route);
  }
  routesStore.setMenuRoutes(rootRoute.children as RouteRecordRaw[]);
};

// ── 未匹配路由处理（放在最后，优先级最低） ───────────────────────────────────────
// router.addRoute(rootRoute.name as string, {
//   path: ":pathMatch(.*)*",
//   redirect: "/login",
// });

// ── 路由守卫 ─────────────────────────────────────────────────────────────────
router.beforeEach(async (to, _from, next) => {
  const { userInfos, token } = userInfoStore;
  const { redirectAlreadyLogin, requiredLogin } = to.meta;
  if (!userInfos.isLogin) {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      try {
        await userInfoStore.getUserInfo();
        // getUserInfo 内部已调用 setInfos(isLogin=true)，this.menus 已更新
        // 注册动态路由后必须重跑 guard，此时 isLogin=true 直接放行
        if (userInfoStore.menus.length > 0) {
          registerDynamicRoutes(userInfoStore.menus);
        }else {
          ElMessage.info('暂无权限，请联系管理员');
          userInfoStore.clearUserInfo();
          next("/login");
        }
        if (redirectAlreadyLogin) {
          const firstRoute = routesStore.menuRoutes[0];
          return next(firstRoute?.path ?? to.fullPath);
        } else {
          next(to.fullPath); // 重跑 guard，让路由匹配生效
        }
      } catch {
        userInfoStore.clearUserInfo();
        next("/login");
      }
    } else {
      if (requiredLogin) {
        next("/login");
      } else {
        next();
      }
    }
  } else {
    if (redirectAlreadyLogin) {
      const firstRoute = routesStore.menuRoutes[0];
      next(firstRoute?.path ?? "/");
    } else {
     next();
    }
  }
});

// ── 导出供外部调用 ────────────────────────────────────────────────────────────
export { registerDynamicRoutes };
export default router;
