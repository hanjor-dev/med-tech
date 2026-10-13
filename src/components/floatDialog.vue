<template>
  <!-- 正常/展开状态 -->
  <el-dialog
    v-if="!minimized"
    v-bind="dialogAttrs"
    :model-value="modelValue"
    :show-close="false"
    draggable
    destroy-on-close
    :close-on-click-modal="false"
    :append-to-body="true"
    @update:model-value="val => !val && handleClose()"
  >
    <template #header>
      <div class="fd-header">
        <div class="fd-header__info">
          <slot name="title">
            <div class="fd-header__title">{{ title }}</div>
          </slot>
          <span v-if="subtitle" class="fd-header__subtitle">{{ subtitle }}</span>
        </div>
        <div class="fd-header__actions">
          <button v-if="minimizable" class="fd-btn" title="最小化" @click="handleMinimize">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="16" x2="19" y2="16" />
            </svg>
          </button>
          <button class="fd-btn" title="关闭" @click="handleClose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <slot />

    <template v-if="showFooter" #footer>
      <div class="fd-footer">
        <slot name="footer">
          <el-button v-if="showCancel" @click="handleClose">取消</el-button>
          <slot name="footer-extra" />
          <el-button v-if="showConfirm" type="primary" :loading="loading" @click="handleConfirm">确认</el-button>
        </slot>
      </div>
    </template>
  </el-dialog>

  <!-- 最小化浮动条（teleport 到 body，脱离 stacking context） -->
  <teleport to="body">
    <transition name="fd-slide">
      <div
        v-if="modelValue && minimized"
        class="fd-minimized-bar"
        :style="{ right: barRight }"
      >
        <div class="fd-minimized-bar__title" @click="handleRestore">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <span>{{ title }}</span>
        </div>
        <div class="fd-minimized-bar__actions">
          <button class="fd-btn fd-btn--light" title="还原" @click="handleRestore">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
          <button class="fd-btn fd-btn--light" title="关闭" @click="handleClose">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue'

defineOptions({ name: 'FloatDialog', inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  subtitle?: string
  minimizable?: boolean
  loading?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  barOffset?: number  // 有多个最小化窗口时的偏移序号（0 起始）
}>(), {
  minimizable: true,
  loading: false,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  barOffset: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'modal-close'): void
  (e: 'modal-confirm'): void
  (e: 'minimize'): void
  (e: 'restore'): void
}>()

const attrs = useAttrs()
const minimized = ref(false)

const dialogAttrs = computed(() => {
  const { title, subtitle, minimizable, loading, showFooter, showCancel, showConfirm, barOffset, ...rest } = attrs as any
  return rest
})

const barRight = computed(() => `${16 + props.barOffset * 256}px`)

const handleMinimize = () => {
  minimized.value = true
  emit('minimize')
}

const handleRestore = () => {
  minimized.value = false
  emit('restore')
}

const handleClose = () => {
  minimized.value = false
  emit('update:modelValue', false)
  emit('modal-close')
}

const handleConfirm = () => {
  emit('modal-confirm')
}

defineExpose({ minimized, minimize: handleMinimize, restore: handleRestore })
</script>

<style scoped>
/* ── Header ── */
.fd-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}
.fd-header__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fd-header__title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}
.fd-header__subtitle {
  font-size: 12px;
  color: #9ca3af;
}
.fd-header__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

/* ── Footer ── */
.fd-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ── Buttons ── */
.fd-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.15s, color 0.15s;
}
.fd-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
.fd-btn--light {
  color: #d1d5db;
}
.fd-btn--light:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

/* ── 最小化浮动条 ── */
.fd-minimized-bar {
  position: fixed;
  bottom: 0;
  z-index: 3000;
  width: 240px;
  height: 40px;
  background: #1f2937;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  padding: 0 6px 0 12px;
  gap: 6px;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.18);
  user-select: none;
}

.fd-minimized-bar__title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #f9fafb;
  cursor: pointer;
  min-width: 0;
}
.fd-minimized-bar__title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fd-minimized-bar__title:hover span {
  color: #60a5fa;
}

.fd-minimized-bar__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

/* ── 动画 ── */
.fd-slide-enter-active,
.fd-slide-leave-active {
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s;
}
.fd-slide-enter-from,
.fd-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
