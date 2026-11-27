<template>
  <section class="application-files" aria-label="加工申请单文件">
    <el-alert v-if="!canView" title="查看申请单文件需要加工申请单查看权限" type="info" :closable="false" />
    <template v-else>
      <DocumentVersionCard label="加工申请单" :version="current ? versionName(current) : '—'"
        :confirmed="current?.confirmed" :status="archived ? '已归档' : current ? undefined : '待生成'" :time="current?.generatedAt"
        file-label="文件名" :file="current?.fileName" :show-upload="editable"
        :preview-label="editable && !archived && current && !current.confirmed ? '预览并确认' : '在线预览'"
        :upload-disabled="!canOpen || !current" :uploading="working === 'upload'"
        :preview-disabled="!canOpen" :download-disabled="!canOpen" :downloading="working === 'download'"
        @upload="chooseFile" @preview="openCurrent('preview')" @download="openCurrent('download')">
        <input ref="picker" hidden type="file" accept=".xlsx" @change="upload" />
      </DocumentVersionCard>
      <el-alert v-if="issue" type="warning" :closable="false" :title="issue">
        <el-button link @click="emit('refresh')">重新加载申请</el-button>
      </el-alert>
      <DocumentVersionHistory v-model:expanded="expanded" :history-list="historyRows" :current-doc-id="current?.documentId"
        :history-loading="loading" :busy="!!working" @preview="show" @download="download">
        <template #details="{ item }">
          <span class="history-file-name" :title="item.fileName">{{ item.fileName }}</span>
          <span class="history-file-meta">{{ sourceName(item) }}</span>
          <span class="history-file-meta">{{ item.operatorName || (item.source === 'MANUAL' ? '—' : '系统') }}</span>
        </template>
      </DocumentVersionHistory>
      <el-button link :disabled="!!working || loading" @click="loadHistory">刷新版本历史</el-button>
      <xlsx-preview-dialog v-model="previewVisible" :file-url="preview?.previewUrl || null" :file-name="preview?.fileName" file-type="processing"
        :order-id="orderId" :package-id="packageId" :batch-id="batchId" :file-id="preview?.documentId"
        :archived="archived" :confirmed="preview?.confirmed" :expected-revision="preview?.revision"
        :can-edit="editable && canOpen && !!current && preview?.documentId === current.documentId && preview.revision === application.revision"
        @processing-confirmed="confirmedDocument" />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DocumentVersionCard from './DocumentVersionCard.vue'
import DocumentVersionHistory from './DocumentVersionHistory.vue'
import XlsxPreviewDialog from './xlsxPreviewDialog.vue'
import { downloadProcessingDocument, generateProcessingDocument, listProcessingDocuments, uploadProcessingRevision,
  type ProcessingDocument, type ProcessingApplication } from '@/api/design'

const props = defineProps<{ orderId: number; packageId: number; batchId?: number | null; application: ProcessingApplication; canView: boolean; editable: boolean; dirty: boolean }>()
const emit = defineEmits<{ refresh: []; documentUpdated: [doc: ProcessingDocument] }>()
const history = ref<ProcessingDocument[]>([])
const current = ref<ProcessingDocument | null>(null)
const archived = computed(() => props.application.status === 'ARCHIVED')
const expanded = ref(false)
const historyRows = computed(() => history.value.map(doc => ({ ...doc, id: doc.documentId, isConfirmed: Number(doc.confirmed === true), version: versionName(doc), time: doc.generatedAt })))
const preview = ref<ProcessingDocument | null>(null)
const previewVisible = ref(false)
const picker = ref<HTMLInputElement>()
const working = ref('')
const loading = ref(false)
const issue = ref('')
let context = 0
let historyRequest = 0
let pickerContext = -1
let pickerRevision = -1
onBeforeUnmount(() => { ++context; ++historyRequest })
function chooseFile() {
  pickerContext = context
  pickerRevision = props.application.revision
  picker.value?.click()
}
const needsSave = computed(() => props.dirty || props.application.headerNeedsConfirmation || !props.application.revision)
const canOpen = computed(() => props.canView && !working.value && !needsSave.value)
const message = (e: unknown) => e instanceof Error ? e.message : '请求失败，请刷新后重试'
const versionName = (doc: ProcessingDocument) => `V${doc.revision}`
const sourceName = (doc: ProcessingDocument) => doc.source === 'MANUAL' ? '手工修订' : '系统生成'
function show(doc: ProcessingDocument) {
  preview.value = doc
  previewVisible.value = true
}
function confirmedDocument(doc: ProcessingDocument) {
  if (current.value?.documentId !== doc.documentId) return
  current.value = preview.value = doc
  emit('documentUpdated', doc)
  void loadHistory()
}
async function loadHistory() {
  const ticket = ++historyRequest
  if (!props.canView || !props.application.revision) return
  loading.value = true
  issue.value = ''
  try {
    const rows = await listProcessingDocuments(props.orderId, props.packageId, props.batchId ?? null)
    if (ticket === historyRequest) history.value = rows
  } catch (e) { if (ticket === historyRequest) issue.value = message(e) }
  finally { if (ticket === historyRequest) loading.value = false }
}
watch(() => [props.orderId, props.packageId, props.batchId, props.canView, props.application.revision, props.application.document?.documentId] as const, (next, previous) => {
  if (previous && next.slice(0, 4).every((v, i) => v === previous[i]) &&
      current.value && next[4] === current.value.revision && next[5] === current.value.documentId) return
  ++context
  ++historyRequest
  current.value = props.application.document || null
  history.value = []
  expanded.value = false
  previewVisible.value = false
  preview.value = null
  working.value = ''
  issue.value = ''
  loading.value = false
  void loadHistory()
}, { immediate: true })

async function download(doc: ProcessingDocument) {
  const ticket = context
  working.value = 'download'
  try { await downloadProcessingDocument(props.orderId, props.packageId, doc) }
  catch (e) { if (ticket === context) issue.value = message(e) }
  finally { if (ticket === context) working.value = '' }
}
async function openCurrent(action: 'preview' | 'download') {
  if (!canOpen.value) return
  const ticket = context
  working.value = action
  issue.value = ''
  try {
    const doc = await generateProcessingDocument(props.orderId, props.packageId, props.batchId ?? null, props.application.revision)
    if (ticket !== context) return
    current.value = doc
    emit('documentUpdated', doc)
    if (action === 'preview') show(doc)
    else await downloadProcessingDocument(props.orderId, props.packageId, doc)
    if (ticket === context) await loadHistory()
  } catch (e) { if (ticket === context) issue.value = message(e) }
  finally { if (ticket === context) working.value = '' }
}
async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !current.value || !props.editable || !canOpen.value) return
  if (context !== pickerContext || props.application.revision !== pickerRevision) {
    issue.value = '申请单已变化，请重新选择修订文件'
    return
  }
  const ticket = context
  working.value = 'upload'
  issue.value = ''
  try {
    const doc = await uploadProcessingRevision(props.orderId, props.packageId, props.batchId ?? null, props.application.revision, file)
    if (ticket !== context) return
    current.value = doc
    emit('documentUpdated', doc)
    ElMessage.success('修订版已保存为当前文件')
    await loadHistory()
  } catch (e) { if (ticket === context) issue.value = message(e) }
  finally { if (ticket === context) working.value = '' }
}
</script>
<style scoped>
.application-files { display: grid; gap: 12px; padding: 18px 22px; min-width: 0; }
.application-files > .el-button { justify-self: end; }
.history-file-name { min-width: 0; max-width: 32%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.history-file-meta { font-size: 11px; color: var(--text-muted); }
</style>
