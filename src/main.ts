import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router';
import pinia from '@/stores/index';
import { useUserInfo } from '@/stores/userInfo';
import ElementPlus from 'element-plus';
import locale from 'element-plus/es/locale/lang/zh-cn'
import axios from 'axios';
import { nextTick } from 'vue';

import '@/assets/icons/iconfont.css'
import 'element-plus/dist/index.css'
import '@/assets/style/index.scss'

const app = createApp(App);

// pinia 必须最先初始化，才能使用 store
app.use(pinia);

// 刷新页面时：从 Session 恢复用户信息并注册动态路由
// 必须在 app.use(router) 之前执行，否则 guard 看不到 isLogin=true
const userInfoStore = useUserInfo(pinia);
if (userInfoStore.token && userInfoStore.menus.length > 0) {
  userInfoStore.restoreFromSession();
  axios.defaults.headers.common.Authorization = `Bearer ${userInfoStore.token}`;
}

app.directive('permission', {
  mounted(el: any, binding){
    nextTick(() => {
      const hasPermission = userInfoStore.permissions.some((item: any) => {
        return binding.value === item
      })
      if (!hasPermission) {
        el.style && (el.style.display = 'none')
      }
    })
  }
})

app.use(router).use(ElementPlus, { locale }).mount('#app')
