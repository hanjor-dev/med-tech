<template>
  <dialog-modal v-model="visible" title="在线预览" width="1000px" :show-footer="false" @modal-close="visible = false">
    <div class="xlsx-preview">
      <div class="xlsx-preview__loading" v-if="loading">
        <div class="xlsx-preview__spinner"></div>
        <span>正在加载文件…</span>
      </div>
      <div class="xlsx-preview__error" v-else-if="loadError">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span class="xlsx-preview__error-title">文件加载失败</span>
        <span class="xlsx-preview__error-msg">{{ loadError }}</span>
      </div>
      <template v-else-if="fileBlob">
        <div class="xlsx-preview__toolbar">
          <div class="xlsx-preview__toolbar-info">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <span>{{ fileName || '文件预览' }}</span>
          </div>
        </div>
        <vue-office-excel :src="fileBlob" :key="fileBlobUrl" class="xlsx-preview__viewer" />
      </template>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
import dialogModal from '@/components/dialogModal.vue'
import { Session } from '@/utils/storage'

const props = defineProps<{
  modelValue: boolean
  fileUrl: string | null
  fileName?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const loading = ref(false)
const loadError = ref('')
const fileBlob = ref<Blob | null>(null)
const fileBlobUrl = ref('')

const loadFile = async () => {
  if (!props.fileUrl) return
  loading.value = true
  loadError.value = ''
  fileBlob.value = null
  if (fileBlobUrl.value) { URL.revokeObjectURL(fileBlobUrl.value); fileBlobUrl.value = '' }
  try {
    const token = Session.get('token') || ''
    const url = props.fileUrl.startsWith('http')
      ? props.fileUrl
      : props.fileUrl.startsWith('/static/') || props.fileUrl.startsWith('/public/')
        ? props.fileUrl
        : `/yi${props.fileUrl}?satoken=${encodeURIComponent(token)}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    fileBlobUrl.value = URL.createObjectURL(blob)
    fileBlob.value = blob
  } catch (err: any) {
    loadError.value = err?.message || '无法加载文件'
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    loadFile()
  } else {
    fileBlob.value = null
    if (fileBlobUrl.value) { URL.revokeObjectURL(fileBlobUrl.value); fileBlobUrl.value = '' }
    loadError.value = ''
  }
})
</script>

<style lang="scss" scoped>
.xlsx-preview {
  padding: 20px;
}
.xlsx-preview__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 280px;
  color: #7a9ab8;
  font-size: 13px;
}
.xlsx-preview__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #dbeeff;
  border-top-color: #1e6fd9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.xlsx-preview__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 260px;
  text-align: center;
  &-title { font-size: 14px; font-weight: 600; color: #dc2626; }
  &-msg { font-size: 12px; color: #7a9ab8; }
}
.xlsx-preview__toolbar {
  display: flex;
  align-items: center;
  padding: 0 0 10px;
  border-bottom: 1.5px solid #d0dfe9;
  margin-bottom: 10px;
  &-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #4a6a8a;
  }
}
.xlsx-preview__viewer {
  width: 100%;
  height: 480px;
  overflow: auto;
  :deep(.vue-office-excel) { height: 100%; }
}
</style>
