<template>
  <div class="announcement-entry">
    <el-tooltip content="系统公告" placement="bottom">
      <button class="announcement-entry__button" type="button" aria-label="系统公告" @click="drawerVisible = true">
        <el-badge :value="pendingTotal" :hidden="pendingTotal === 0" :max="99">
          <el-icon :size="20"><Notification /></el-icon>
        </el-badge>
      </button>
    </el-tooltip>

    <el-drawer v-model="drawerVisible" class="announcement-history-drawer" title="系统公告" direction="rtl" size="450px" @open="loadHistory">
      <template #header>
        <div class="announcement-drawer-header">
          <div class="announcement-drawer-title">系统公告</div>
        </div>
      </template>

      <div class="announcement-drawer-body">
        <el-scrollbar v-loading="loading" class="announcement-history-scroll">
          <div v-if="!loading && records.length === 0" class="announcement-history-empty">
            <el-icon :size="42"><Notification /></el-icon>
            <div>暂无历史公告</div>
            <span>系统发布公告后会显示在这里</span>
          </div>
          <button v-for="record in records" :key="record.id" type="button" :class="['announcement-history-item', { pending: record.deliveryStatus === 'PENDING' }]" @click="openDetail(record)">
            <span class="announcement-history-item__line" />
            <span class="announcement-history-item__main">
              <span class="announcement-history-item__topline">
                <strong>{{ record.title }}</strong>
              </span>
              <span class="announcement-history-item__summary">{{ record.contentText || '系统公告内容' }}</span>
              <span class="announcement-history-item__time">{{ formatDateTime(record.publishedAt) }}</span>
            </span>
            <el-icon class="announcement-history-item__arrow"><ArrowRight /></el-icon>
          </button>
        </el-scrollbar>

        <el-pagination v-if="total > 0" v-model:current-page="pageNum" background layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="loadHistory" />
      </div>
    </el-drawer>

    <AnnouncementDisplayDialog
      :visible="detailVisible"
      :announcement="detail"
      @update:visible="detailVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, Notification } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AnnouncementDisplayDialog from '@/components/announcementDisplayDialog.vue'
import { announcementHistoryDetail, announcementHistoryPage } from '@/api/announcement'
import type { AnnouncementHistory } from '@/types/announcement'

const drawerVisible = ref(false)
const detailVisible = ref(false)
const loading = ref(false)
const records = ref<AnnouncementHistory[]>([])
const detail = ref<AnnouncementHistory | null>(null)
const pendingTotal = ref(0)
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10

const formatDateTime = (value?: string) => value ? value.replace('T', ' ').slice(0, 16) : '—'
const formatFileSize = (size?: number) => {
  if (!size || size < 0) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}

async function loadPendingCount() {
  try {
    const result: any = await announcementHistoryPage({ pageNum: 1, pageSize: 1, deliveryStatus: 'PENDING' })
    pendingTotal.value = result.total || 0
  } catch { /* 公告入口不可影响普通页面使用 */ }
}

async function loadHistory() {
  loading.value = true
  try {
    const result: any = await announcementHistoryPage({ pageNum: pageNum.value, pageSize })
    records.value = result.records || []
    total.value = result.total || 0
    pendingTotal.value = Math.max(pendingTotal.value, records.value.filter(item => item.deliveryStatus === 'PENDING').length)
    await loadPendingCount()
  } catch { ElMessage.error('公告列表加载失败') } finally { loading.value = false }
}

async function openDetail(record: AnnouncementHistory) {
  try { detail.value = await announcementHistoryDetail(record.id); detailVisible.value = true } catch { ElMessage.error('公告内容加载失败') }
}
function handleAnnouncementEvent() { void loadPendingCount(); if (drawerVisible.value) void loadHistory() }
onMounted(() => {
  void loadPendingCount()
  window.addEventListener('announcement-websocket', handleAnnouncementEvent)
})
onBeforeUnmount(() => window.removeEventListener('announcement-websocket', handleAnnouncementEvent))
</script>

<style scoped>
.announcement-entry { display: inline-flex; align-items: center; margin-right: 14px; }
.announcement-entry__button { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; border: 0; border-radius: 8px; color: #475569; background: transparent; cursor: pointer; transition: background .2s, color .2s; }
.announcement-entry__button:hover { color: #2563eb; background: #eff6ff; }
.announcement-drawer-header { display: flex; width: 100%; align-items: center; justify-content: space-between; }
.announcement-drawer-title { color: #172033; font-size: 18px; font-weight: 700; }
.announcement-drawer-body { display: flex; height: 100%; flex-direction: column; min-height: 0; }
.announcement-history-scroll { flex: 1; min-height: 0; }
.announcement-history-empty { display: flex; min-height: 340px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #94a3b8; }
.announcement-history-empty span { font-size: 12px; }
.announcement-history-item { display: flex; width: calc(100% - 4px); min-height: 92px; align-items: center; gap: 10px; margin: 0 2px 10px; padding: 14px 12px; border: 1px solid #e5eaf2; border-radius: 10px; color: inherit; background: #fff; text-align: left; cursor: pointer; transition: border-color .2s, background .2s, transform .2s; }
.announcement-history-item:hover { border-color: #93c5fd; background: #f8fbff; transform: translateX(2px); }
.announcement-history-item.pending { border-color: #bfdbfe; background: #eff6ff; }
.announcement-history-item__line { width: 3px; min-height: 52px; border-radius: 3px; background: #cbd5e1; }
.pending .announcement-history-item__line { background: #2563eb; }
.announcement-history-item__main { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 6px; }
.announcement-history-item__topline { display: flex; min-width: 0; align-items: center; }
.announcement-history-item__topline strong { min-width: 0; flex: 1; overflow: hidden; color: #172033; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.announcement-history-item__summary { overflow: hidden; color: #64748b; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.announcement-history-item__time { color: #94a3b8; font-size: 11px; }
.announcement-history-item__arrow { color: #94a3b8; }
</style>
