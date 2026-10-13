// 系统设置路由配置
const authRoutes = [
  {
    path: "/basicData",
    name: "basicData",
    component: () => import("@/layout/routerView/parent.vue"),
    redirect: "/basicData/org",
    meta: {
      title: "基础数据",
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
        path: "/basicData/org",
        name: "basicDataOrg",
        component: () => import("@/views/module/org.vue"),
        meta: {
          title: "机构管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/basicData/department",
        name: "basicDataDepartment",
        component: () => import("@/views/basicData/department.vue"),
        meta: {
          title: "医院管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/basicData/project",
        name: "basicDataProject",
        component: () => import("@/views/module/project.vue"),
        meta: {
          title: "项目管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/basicData/product",
        name: "basicDataProduct",
        component: () => import("@/views/module/product.vue"),
        meta: {
          title: "产品管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        }
      },
      {
        path: "/basicData/registrationCertificate",
        name: "basicDataRegistrationCertificate",
        component: () => import("@/views/basicData/registrationCertificate.vue"),
        meta: {
          title: "注册证管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/basicData/material",
        name: "basicDataMaterial",
        component: () => import("@/views/basicData/material.vue"),
        meta: {
          title: "物料管理",
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
