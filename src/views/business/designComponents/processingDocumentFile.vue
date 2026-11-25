<template>
  <div class="application-file" aria-label="已归档加工申请单">
    <span>{{ file.fileName || '加工申请单.xlsx' }} <small v-if="revision">版本 {{ revision }}</small></span>
    <div>
      <el-button link type="primary" @click="preview = true">预览</el-button>
      <el-button v-if="canDownload" link type="primary" :loading="downloading" @click="download">下载</el-button>
    </div>
  </div>
  <xlsx-preview-dialog v-model="preview" :file-url="file.previewUrl" :file-name="file.fileName"
    file-type="processing" :can-edit="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import XlsxPreviewDialog from './xlsxPreviewDialog.vue'

const props = withDefaults(defineProps<{
  file: { fileName?: string; previewUrl: string; downloadUrl?: string | null }
  revision?: number
  canDownload?: boolean
}>(), { canDownload: true })
const preview = ref(false)
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

<style scoped>
.application-file { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; color: #294759; background: #f3f8fa; border-radius: 6px; }
small { color: #677887; }
</style>
