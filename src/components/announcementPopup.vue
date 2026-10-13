<template>
  <AnnouncementDisplayDialog
    :visible="dialogVisible"
    :announcement="current"
    show-acknowledge
    @acknowledge="handleAcknowledge"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AnnouncementDisplayDialog from '@/components/announcementDisplayDialog.vue'
import { useAnnouncementStore } from '@/stores/announcement'

const store = useAnnouncementStore()
const { current, visible } = storeToRefs(store)
const dialogVisible = computed(() => visible.value)

async function handleAcknowledge() {
  try {
    await store.acknowledgeCurrent()
  } catch (error) {
    console.error('确认系统公告失败', error)
  }
}
</script>
