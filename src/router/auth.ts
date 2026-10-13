
// 系统设置路由配置
const authRoutes = [
  {
    path: "/auth",
    name: "auth",
    component: () => import("@/layout/routerView/parent.vue"),
    redirect: "/auth/role",
    meta: {
      title: "权限管理",
      isLink: "",
      isHide: false,
      isKeepAlive: true,
      isAffix: false,
      isIframe: false,
      roles: ["admin"],
      icon: "&#xe609;",
    },
    children: [
      {
        path: "/auth/role",
        name: "authRole",
        component: () => import("@/views/auth/role.vue"),
        meta: {
          title: "角色管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/auth/account",
        name: "authAccount",
        component: () => import("@/views/auth/account.vue"),
        meta: {
          title: "账户管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/auth/resource",
        name: "authResource",
        component: () => import("@/views/auth/resource.vue"),
        meta: {
          title: "资源管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
    ],
  },
];

export default authRoutes;
