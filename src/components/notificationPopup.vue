<template>
  <Teleport to="body">
    <Transition name="slide-in">
      <div v-if="currentPopup" class="notification-card" :style="cardStyle">
        <div class="card-header" @mousedown="onDragStart">
          <el-icon class="card-bell"><Bell /></el-icon>
          <span class="card-title-notice">{{ currentPopup.title }}</span>
          <span class="card-tag" :style="{ background: categoryInfo.tagBg, color: categoryInfo.tagColor }">{{ categoryLabel }}</span>
        </div>

        <div v-if="fields.length" class="card-fields">
          <div v-for="f in fields" :key="f.key" class="field-row">
            <span class="field-label">{{ f.label }}</span>
            <span class="field-value" :title="f.value">{{ f.value }}</span>
          </div>
        </div>

        <p v-if="currentPopup.content && !parsedBizData" class="card-remark">{{ currentPopup.content }}</p>

        <p v-if="remark" class="card-remark">{{ remark }}</p>

        <div class="card-footer">
          <span v-if="queueLen > 0" class="card-queue">还有 {{ queueLen }} 条待处理</span>
          <div class="card-actions">
            <el-button v-if="currentPopup.jumpUrl && currentPopup.bizId" size="small" text @click="handleViewDetail">查看订单</el-button>
            <el-button size="small" type="primary" @click="handleConfirm">确认</el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const store = useNotificationStore()
const { currentPopup, popupQueue } = storeToRefs(store)

const CATEGORY_MAP: Record<string, { label: string; tagBg: string; tagColor: string }> = {
  ORDER:      { label: '订单', tagBg: '#e8f1fd', tagColor: '#1d6fa4' },
  APPROVAL:   { label: '审核', tagBg: '#fef3e8', tagColor: '#b35c00' },
  DESIGN:     { label: '设计', tagBg: '#eeecfb', tagColor: '#5046e4' },
  PRODUCTION: { label: '生产', tagBg: '#edf7ed', tagColor: '#1e7e34' },
  QC:         { label: '质检', tagBg: '#fdecea', tagColor: '#c62828' },
  WAREHOUSE:  { label: '仓储', tagBg: '#f0f0f0', tagColor: '#555555' },
}

const categoryInfo = computed(() => CATEGORY_MAP[currentPopup.value?.category ?? ''] ?? { label: '通知', tagBg: '#e8f1fd', tagColor: '#1d6fa4' })
const categoryLabel = computed(() => categoryInfo.value.label)
const queueLen = computed(() => popupQueue.value.length)

interface BizField { key: string; label: string; value: string }
const parsedBizData = computed<{ fields: BizField[]; remark?: string } | null>(() => {
  if (!currentPopup.value?.content) return null
  try { return JSON.parse(currentPopup.value.content) } catch { return null }
})
const fields = computed<BizField[]>(() => parsedBizData.value?.fields ?? [])
const remark = computed(() => parsedBizData.value?.remark || '')

function handleViewDetail() {
  if (currentPopup.value?.jumpUrl && currentPopup.value?.bizId) {
    const isCancelApply = currentPopup.value.jumpUrl === '/order/cancel-apply/audit'
    const isModifyApply = currentPopup.value.jumpUrl === '/modifyApply'
    const targetPath = isCancelApply || isModifyApply ? '/order' : currentPopup.value.jumpUrl
    const targetQuery: Record<string, string> = { detailId: String(currentPopup.value.bizId) }
    if (isCancelApply) {
      targetQuery.jumpUrl = currentPopup.value.jumpUrl
    }

    if (route.path === targetPath) {
      router.replace({ path: targetPath, query: {} }).then(() => {
        router.push({ path: targetPath, query: targetQuery })
      })
    } else {
      router.push({ path: targetPath, query: targetQuery })
    }
  }
  store.confirmCurrentPopup()
}

function handleConfirm() {
  store.confirmCurrentPopup()
}

const cardTop = ref<number | null>(null)
const cardStyle = computed(() =>
  cardTop.value !== null
    ? { top: cardTop.value + 'px', bottom: 'auto' }
    : {}
)

let dragStartY = 0
let dragStartTop = 0

function onDragStart(e: MouseEvent) {
  const card = (e.currentTarget as HTMLElement).parentElement!
  dragStartY = e.clientY
  dragStartTop = cardTop.value ?? (window.innerHeight - card.offsetHeight - 28)
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  e.preventDefault()
}

function onDragMove(e: MouseEvent) {
  const newTop = dragStartTop + (e.clientY - dragStartY)
  cardTop.value = Math.max(0, Math.min(newTop, window.innerHeight - 80))
}

function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
})
</script>

<style scoped>
.notification-card {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 360px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.05),
    0 12px 28px rgba(0, 0, 0, 0.1),
    0 32px 56px rgba(0, 0, 0, 0.06);
  z-index: 9999;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow:
      0 0 0 0.5px rgba(0, 0, 0, 0.04),
      0 4px 8px rgba(0, 0, 0, 0.05),
      0 12px 28px rgba(0, 0, 0, 0.1),
      0 32px 56px rgba(0, 0, 0, 0.06),
      inset 0 0 0 0 rgba(220, 50, 50, 0);
    border-color: rgba(0, 0, 0, 0.06);
  }
  50% {
    box-shadow:
      0 0 0 1.5px rgba(220, 50, 50, 0.25),
      0 4px 12px rgba(220, 50, 50, 0.15),
      0 12px 32px rgba(220, 50, 50, 0.2),
      0 0 48px rgba(220, 50, 50, 0.12),
      inset 0 0 20px rgba(220, 50, 50, 0.07);
    border-color: rgba(220, 50, 50, 0.35);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 18px 12px;
  cursor: grab;
  user-select: none;
}

.card-header:active {
  cursor: grabbing;
}

.card-bell {
  color: #007aff;
  flex-shrink: 0;
  font-size: 16px;
}

.card-title-notice {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1c1c1e;
  letter-spacing: -0.2px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.card-tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 20px;
  letter-spacing: 0.1px;
}

.card-fields {
  margin: 0 18px 4px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 8px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.field-label {
  font-size: 11px;
  color: rgba(60, 60, 67, 0.5);
  letter-spacing: 0.1px;
}

.field-value {
  font-size: 13px;
  color: #1c1c1e;
  font-weight: 500;
  letter-spacing: -0.1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-remark {
  margin: 8px 18px 4px;
  font-size: 12px;
  color: #52c41a;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 14px;
  margin-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.card-queue {
  font-size: 12px;
  color: rgba(60, 60, 67, 0.4);
}

.card-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.slide-in-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-in-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
  transform: translateX(110%) scale(0.95);
}
</style>
