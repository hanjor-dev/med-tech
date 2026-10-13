<template>
  <div class="notification-bell">
    <el-badge :value="unreadCount" :hidden="!hasUnread" :max="99">
      <el-icon :size="20" @click="drawer = true" style="cursor: pointer;">
        <Bell />
      </el-icon>
    </el-badge>

    <el-drawer v-model="drawer" title="消息通知" direction="rtl" size="450px">
      <notificationList @close="drawer = false" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import notificationList from './notificationList.vue'

const notificationStore = useNotificationStore()
const { unreadCount, hasUnread } = storeToRefs(notificationStore)

const drawer = ref(false)
</script>

<style scoped>
.notification-bell {
  display: inline-flex;
  align-items: center;
}
</style>
