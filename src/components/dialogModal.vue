<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" v-bind="minimized ? { ...$attrs, width: '320px' } : $attrs" destroy-on-close :show-close="false" draggable :modal="!minimized">
    <template #header>
      <div class="dialog-header__left">
        <slot name="title">
          <div class="dialog-header__title" style="margin-bottom: 5px;">{{ dialogTitle }}</div>
        </slot>
        <span class="dialog-header__subtitle" v-if="dialogSubtitle && !minimized" style="color: #606266;">
          <span>{{ dialogSubtitle }}</span>
          <slot name="subtitle-action"></slot>
        </span>
        
      </div>
      <div class="dialog-header__actions">
        <button v-if="minimizable" class="dialog-close dialog-minimize-btn" :title="minimized ? '还原' : '最小化'" @click="minimized = !minimized">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line v-if="minimized" x1="5" y1="8" x2="19" y2="8" /><line v-if="minimized" x1="12" y1="8" x2="12" y2="18" />
            <line v-else x1="5" y1="16" x2="19" y2="16" />
          </svg>
        </button>
        <button class="dialog-close" title="关闭" @click="close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </template>
    <div v-show="!minimized"><slot></slot></div>
    <template #footer v-if="showFooter && !minimized">
      <div class="dialog-footer">
        <slot name="footer-btn">
          <el-button class="btn btn-ghost" @click="close" v-if="isShowCancelBtn">取消</el-button>
          <slot name="footer-extra"></slot>
          <el-button class="btn btn-primary" :loading="props.loading" @click="confirm" v-if="isShowConfirmBtn">确认</el-button>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { computed, ref, useAttrs, watch } from 'vue'

defineOptions({
  name: "DialogModal",
  inheritAttrs: false
})

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  isShowCancelBtn: {
    type: Boolean,
    default: true
  },
  isShowConfirmBtn: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  minimizable: {
    type: Boolean,
    default: false
  }
})

const minimized = ref(false)

const attrs = useAttrs()
const dialogTitle = computed(() => props.title || String(attrs.title ?? ''))
const dialogSubtitle = computed(() => props.subtitle || String(attrs.subtitle ?? ''))

const emit = defineEmits<{
  (e: 'modal-close'): void
  (e: 'modal-confirm'): void
}>()

const close = () => {
  emit('modal-close')
}

const confirm = () => {
  emit('modal-confirm')
}
</script>

<style scoped>
.dialog-minimize-btn {
  margin-right: 4px;
  transition: all 0.2s;
}

.dialog-minimize-btn:hover {
  background: #f0f2f5;
  transform: scale(1.1);
}
</style>
