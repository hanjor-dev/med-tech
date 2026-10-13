
// 系统设置路由配置
const systemRoutes = [
  {
    path: "/system",
    name: "system",
    component: () => import("@/layout/routerView/parent.vue"),
    redirect: "/system/dict",
    meta: {
      title: "系统设置",
      isLink: "",
      isHide: false,
      isKeepAlive: true,
      isAffix: false,
      isIframe: false,
      roles: ["admin"],
      icon: "&#xe70f;",
    },
    children: [
      {
        path: "/system/dict",
        name: "systemDict",
        component: () => import("@/views/system/dict.vue"),
        meta: {
          title: "字典管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/system/announcement",
        name: "systemAnnouncement",
        component: () => import("@/views/system/announcement.vue"),
        meta: {
          title: "公告发布",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/system/log",
        name: "systemLog",
        component: () => import("@/views/system/log.vue"),
        meta: {
          title: "日志管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/system/process",
        name: "systemProcess",
        component: () => import("@/views/system/process.vue"),
        meta: {
          title: "流程配置",
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

export default systemRoutes;
