<template>
  <dialog-modal v-model="visible" title="在线预览" :width="width" :show-footer="!isConfirmed && canEdit"
    @modal-close="visible = false">
    <div class="xlsx-preview">
      <!-- 加载状态 -->
      <div class="xlsx-preview__loading" v-if="loading">
        <div class="xlsx-preview__spinner"></div>
        <span>正在加载文件…</span>
      </div>
      <!-- 加载失败 -->
      <div class="xlsx-preview__error" v-else-if="loadError">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span class="xlsx-preview__error-title">文件加载失败</span>
        <span class="xlsx-preview__error-msg">{{ loadError }}</span>
      </div>
      <!-- 内容 -->
      <template v-else-if="fileBlob">
        <!-- 工具栏 -->
        <div class="xlsx-preview__toolbar">
          <div class="xlsx-preview__toolbar-info">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>{{ fileName || '电子表格' }}</span>
            <!-- 状态 tag -->
            <span v-if="fileType !== 'processing' || archived || confirmed != null" class="xlsx-preview__status-tag"
              :class="isConfirmed ? 'xlsx-preview__status-tag--confirmed' : 'xlsx-preview__status-tag--pending'">
              {{ archived ? '已归档' : isConfirmed ? '已确认' : '待确认' }}
            </span>
          </div>
        </div>
        <!-- 预览区 -->
        <vue-office-excel :src="fileBlob" :key="fileBlobUrl" class="xlsx-preview__viewer"
          @sheet-switch="onSheetSwitch" />
      </template>
    </div>
    <template #footer-btn>
      <button class="btn btn-primary" :disabled="loading || !!loadError || !fileBlob || confirming || isConfirmed || !canEdit" @click="handleConfirm">
        {{ confirming ? '确认中…' : isConfirmed ? '已确认' : (fileType === 'processing' ? '确认加工申请单' : fileType === 'drawing' ? '确认图纸' : '确认指令单') }}
      </button>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
import dialogModal from '@/components/dialogModal.vue'
import { Session } from '@/utils/storage'
import { ElMessage } from 'element-plus'
import { confirmProcessingDocument, type ProcessingDocument, designDrawingConfirm, designInstructionConfirm } from '@/api/design'

// ============================================================
// Props / Emits
// ============================================================

const props = defineProps<{
  modelValue: boolean
  /** 文件下载地址 */
  fileUrl: string | null
  /** 文件名（工具栏展示） */
  fileName?: string
  /** 文件类型：drawing=图纸，instruction=指令单 */
  fileType?: 'drawing' | 'instruction' | 'processing'
  /** 工单ID */
  orderId?: number | null
  /** 数据包ID */
  packageId?: number | null
  /** 版本ID（用于确认接口） */
  archived?: boolean
  expectedRevision?: number
  expectedFileId?: string
  fileId?: number
  /** 是否已确认 */
  confirmed?: boolean
  /** 产品类别（确认图纸时需要） */
  productCategory?: string
  batchId?: number | null
  /** 当前数据包是否允许确认/修订文档 */
  canEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm-success'): void
  (e: 'processing-confirmed', document: ProcessingDocument): void
}>()

// ============================================================
// 弹框控制
// ============================================================

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const width = '1000px'

// ============================================================
// 状态
// ============================================================

const loading = ref(false)
const loadError = ref('')
const fileBlob = ref<Blob | null>(null)
const fileBlobUrl = ref('')
const confirming = ref(false)
const isConfirmed = ref(props.confirmed ?? false)
const canEdit = computed(() => props.canEdit !== false)

let previewRequest = 0
const onSheetSwitch = () => { }

function resetPreview() {
  ++previewRequest
  loading.value = confirming.value = false
  loadError.value = ''
  fileBlob.value = null
  if (fileBlobUrl.value) URL.revokeObjectURL(fileBlobUrl.value)
  fileBlobUrl.value = ''
}

const loadFile = async (ticket: number) => {
  if (!props.fileUrl) return
  loading.value = true
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
    if (ticket !== previewRequest) return
    fileBlobUrl.value = URL.createObjectURL(blob)
    fileBlob.value = blob
  } catch (err: any) {
    if (ticket === previewRequest) loadError.value = err?.message || '无法加载文件'
  } finally {
    if (ticket === previewRequest) loading.value = false
  }
}

const handleConfirm = async () => {
  if (confirming.value || !fileBlob.value || !visible.value || !canEdit.value || !props.orderId || !props.packageId || !props.fileId) return
  if (props.fileType !== 'processing' && !props.expectedFileId) {
    ElMessage.warning('请关闭并重新打开文档预览，获取最新文件版本')
    return
  }
  const ticket = previewRequest
  confirming.value = true
  try {
    if (props.fileType === 'processing') {
      if (!props.expectedRevision) return
      const document = await confirmProcessingDocument(props.orderId, props.packageId, props.fileId, props.expectedRevision, props.batchId)
      if (ticket !== previewRequest || props.fileId !== document.documentId) return
      emit('processing-confirmed', document)
    } else if (props.fileType === 'drawing') {
      await designDrawingConfirm(props.orderId!, props.packageId!, props.fileId!, props.productCategory!, props.expectedFileId!, props.batchId)
    } else {
      await designInstructionConfirm(props.orderId, props.packageId, props.fileId, props.expectedFileId!, props.batchId)
    }
    if (ticket !== previewRequest) return
    isConfirmed.value = true
    visible.value = false
    ElMessage.success('确认成功')
    emit('confirm-success')
  } catch (error) {
    if (ticket === previewRequest) ElMessage.error(error instanceof Error ? error.message : '文件确认失败，请重新打开文档预览')
  } finally {
    if (ticket === previewRequest) confirming.value = false
  }
}

// ============================================================
// 监听
// ============================================================

watch(() => [props.modelValue, props.fileUrl, props.fileId, props.expectedRevision, props.expectedFileId,
  props.orderId, props.packageId, props.batchId] as const, () => {
  resetPreview()
  if (props.modelValue) {
    isConfirmed.value = props.confirmed ?? false
    void loadFile(previewRequest)
  }
}, { immediate: true })
onBeforeUnmount(resetPreview)

watch(() => props.confirmed, (val) => {
  isConfirmed.value = val ?? false
})

defineExpose({ handleConfirm })
</script>

<style lang="scss" scoped>
.xlsx-preview {
  --blue: #1e6fd9;
  --blue-light: #dbeeff;
  --blue-pale: #f0f8ff;
  --green: #16a34a;
  --green-light: #dcfce7;
  --text-faint: #7a9ab8;
  padding: 20px;
}

// ─── Loading ─────────────────────────────────────────────────────────────
.xlsx-preview__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 280px;
  color: var(--text-faint);
  font-size: 13px;
}

.xlsx-preview__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--blue-light);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ─── Error ──────────────────────────────────────────────────────────────
.xlsx-preview__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 260px;
  padding: 32px;
  text-align: center;

  &-title {
    font-size: 14px;
    font-weight: 600;
    color: #dc2626;
  }

  &-msg {
    font-size: 12px;
    color: var(--text-faint);
  }
}

// ─── Toolbar ─────────────────────────────────────────────────────────────
.xlsx-preview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 10px;
  border-bottom: 1.5px solid #d0dfe9;
  margin-bottom: 10px;

  &-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #4a6a8a;

    svg {
      color: var(--text-faint);
      flex-shrink: 0;
    }
  }

  &-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// ─── Status Tag ─────────────────────────────────────────────────────────
.xlsx-preview__status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;

  &--confirmed {
    background: #dcfce7;
    color: #16a34a;
  }

  &--pending {
    background: #fef3c7;
    color: #d97706;
  }
}

// ─── Confirm Button ──────────────────────────────────────────────────────
.xlsx-preview__confirm-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: 1.5px solid var(--blue);
  border-radius: 7px;
  background: var(--blue);
  color: #ffffff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1557b0;
    border-color: #1557b0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.xlsx-preview__confirm-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

// ─── Confirmed Tag ──────────────────────────────────────────────────────
.xlsx-preview__confirmed-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 9999px;
  background: var(--green-light);
  color: var(--green);
  font-size: 12px;
  font-weight: 600;
}

// ─── Viewer ──────────────────────────────────────────────────────────────
.xlsx-preview__viewer {
  width: 100%;
  height: 480px;
  overflow: auto;

  :deep(.vue-office-excel) {
    height: 100%;
  }
}
</style>
