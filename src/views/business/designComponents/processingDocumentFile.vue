<template>
  <div aria-label="加工申请单文件">
    <slot :download="download" :downloading="downloading" :openPreview="openPreview">
      <PackageDocumentCard label="加工申请单" :confirmed="file.confirmed">
        <div class="dwd-pkg-ver__item">
          <span :title="file.fileName">{{ revision != null ? `版本 V${revision}` : file.fileName }}</span>
          <el-button v-if="canPreview" link size="small" aria-label="预览" title="预览" @click="openPreview">
            <el-icon><View /></el-icon>
          </el-button>
          <el-button v-if="canDownload" link size="small" aria-label="下载" title="下载" :loading="downloading" @click="download">
            <PackageDownloadIcon />
          </el-button>
        </div>
      </PackageDocumentCard>
    </slot>
  </div>
  <xlsx-preview-dialog v-if="canPreview && preview" v-model="preview" :file-url="file.previewUrl" :file-name="file.fileName"
    file-type="processing" :archived="archived" :can-edit="!!editable" :confirmed="file.confirmed"
    :order-id="orderId" :package-id="packageId" :batch-id="batchId" :file-id="file.documentId" :expected-revision="revision"
    @processing-confirmed="emit('confirmed')" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import PackageDocumentCard from './PackageDocumentCard.vue'
import PackageDownloadIcon from './PackageDownloadIcon.vue'
import XlsxPreviewDialog from './xlsxPreviewDialog.vue'

const props = withDefaults(defineProps<{
  orderId?: number; packageId?: number; batchId?: number | null; editable?: boolean; archived?: boolean
  file: { confirmed?: boolean; documentId?: number; fileName?: string; previewUrl: string; downloadUrl?: string | null }
  revision?: number
  canPreview?: boolean
  canDownload?: boolean
}>(), { canDownload: true })
const emit = defineEmits<{ confirmed: [] }>()
const preview = ref(false)
function openPreview() { preview.value = true }
const downloading = ref(false)
async function download() {
  if (downloading.value) return
  const file = props.file
  downloading.value = true
  let objectUrl: string | null = null
  try {
    let url = file.downloadUrl
    if (!url || url === file.previewUrl) {
      const response = await fetch(file.previewUrl)
      if (!response.ok) throw new Error('下载加工申请单失败')
      objectUrl = URL.createObjectURL(await response.blob())
      url = objectUrl
    }
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName || '加工申请单.xlsx'
    link.click()
  } catch {
    ElMessage.error('下载加工申请单失败，请刷新详情后重试')
  } finally {
    if (objectUrl) {
      const url = objectUrl
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    downloading.value = false
  }
}
</script>
