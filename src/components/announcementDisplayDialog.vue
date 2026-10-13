<template>
  <el-dialog
    :model-value="visible"
    class="announcement-preview-dialog"
    title="系统公告"
    width="700px"
    top="7vh"
    destroy-on-close
    :close-on-click-modal="!showAcknowledge"
    :close-on-press-escape="!showAcknowledge"
    :show-close="!showAcknowledge"
    append-to-body
    @update:model-value="emit('update:visible', $event)"
  >
    <el-scrollbar v-if="announcement" class="preview-dialog-scrollbar">
      <div class="preview-paper">
        <h2 class="preview-title">{{ announcement.title }}</h2>
        <el-divider />
        <div class="preview-content" v-html="safeContent" />
        <div v-if="announcement.attachments?.length" class="preview-attachments">
          <div class="preview-block-title">相关附件</div>
          <div v-for="attachment in announcement.attachments" :key="attachment.id || attachment.fileUrl" class="preview-attachment-row">
            <el-link :href="attachment.fileUrl" target="_blank" rel="noopener noreferrer" type="primary">
              <el-icon><Paperclip /></el-icon>
              {{ attachment.fileName || '未命名附件' }}
            </el-link>
            <span>{{ formatFileSize(attachment.fileSize) }}</span>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <template #footer>
      <el-button type="primary" size="large" :loading="acknowledging" @click="showAcknowledge ? emit('acknowledge') : emit('update:visible', false)">
        {{ showAcknowledge ? '我已知晓' : '关闭' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Paperclip } from '@element-plus/icons-vue'
import type { AnnouncementHistory, PendingAnnouncement } from '@/types/announcement'
import { sanitizeAnnouncementHtml } from '@/utils/announcementHtml'

type AnnouncementDisplay = Pick<PendingAnnouncement | AnnouncementHistory, 'title' | 'contentHtml' | 'attachments'>

const props = withDefaults(defineProps<{
  visible: boolean
  announcement?: AnnouncementDisplay | null
  showAcknowledge?: boolean
  acknowledging?: boolean
}>(), {
  announcement: null,
  showAcknowledge: false,
  acknowledging: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  acknowledge: []
}>()

const safeContent = computed(() => sanitizeAnnouncementHtml(props.announcement?.contentHtml || ''))

function formatFileSize(size?: number) {
  if (!size || size < 0) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}
</script>

<style scoped>
.announcement-preview-dialog :deep(.el-dialog) { overflow: hidden; }
.announcement-preview-dialog :deep(.el-dialog__header) { margin-right: 0; padding: 20px 24px 16px; border-bottom: 1px solid var(--el-border-color-lighter); }
.announcement-preview-dialog :deep(.el-dialog__body) { padding: 0; }
.announcement-preview-dialog :deep(.el-dialog__footer) { display: flex; justify-content: flex-end; padding: 14px 24px 18px; border-top: 1px solid var(--el-border-color-lighter); }
.preview-dialog-scrollbar { height: min(650px, calc(100vh - 250px)); padding: 22px 24px 24px; box-sizing: border-box; }
.preview-paper { max-width: 620px; margin: 0 auto; padding: 22px 26px 26px; border: 1px solid var(--el-border-color-lighter); border-radius: var(--el-border-radius-base); background: var(--el-bg-color); }
.preview-title { margin: 22px 0 8px; color: var(--el-text-color-primary); font-size: 24px; font-weight: 600; line-height: 1.45; text-align: center; word-break: break-word; }
.preview-content { min-height: 220px; box-sizing: border-box; color: var(--el-text-color-regular); font-size: 14px; line-height: 1.9; word-break: break-word; }
.preview-content :deep(p), .preview-content :deep(div) { margin: 0 0 12px; }
.preview-content :deep(img) { display: block; max-width: 100%; height: auto; margin: 12px auto; }
.preview-content :deep(ul), .preview-content :deep(ol) { padding-left: 24px; }
.preview-content :deep(a) { color: var(--el-color-primary); }
.preview-attachments { margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--el-border-color-lighter); }
.preview-block-title { margin-bottom: 10px; color: var(--el-text-color-primary); font-size: 14px; font-weight: 600; }
.preview-attachment-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 36px; padding: 0 10px; border-radius: var(--el-border-radius-base); background: var(--el-fill-color-light); color: var(--el-text-color-regular); font-size: 13px; }
.preview-attachment-row + .preview-attachment-row { margin-top: 6px; }
.preview-attachment-row .el-link { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-attachment-row > span { flex: 0 0 auto; color: var(--el-text-color-secondary); font-size: 12px; }
@media (max-width: 768px) {
  .announcement-preview-dialog :deep(.el-dialog) { width: calc(100vw - 24px) !important; margin: 12px auto; }
  .preview-dialog-scrollbar { height: calc(100vh - 210px); padding: 14px 12px 20px; }
  .preview-paper { padding: 18px 16px 20px; }
  .preview-title { font-size: 21px; }
}
</style>
