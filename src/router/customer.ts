// 系统设置路由配置
const customerRoutes = [
  {
    path: "/customer",
    name: "customer",
    component: () => import("@/layout/routerView/parent.vue"),
    redirect: "/customer/hospital",
    meta: {
      title: "客户管理",
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
        path: "/customer/hospital",
        name: "customerHospital",
        component: () => import("@/views/customer/hospital.vue"),
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
        path: "/customer/department",
        name: "customerDepartment",
        component: () => import("@/views/customer/branch.vueue"),
        meta: {
          title: "科室管理",
          isLink: "",
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          roles: ["admin"],
        },
      },
      {
        path: "/customer/doctor",
        name: "customerDoctor",
        component: () => import("@/views/customer/doctor.vue"),
        meta: {
          title: "医生管理",
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

export default customerRoutes;
