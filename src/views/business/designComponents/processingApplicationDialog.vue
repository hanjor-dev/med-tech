<template>
  <dialog-modal :model-value="modelValue" title="加工申请单" width="1080px" :close-on-press-escape="false"
    @modal-close="close">
    <el-form label-position="top" v-loading="loading" class="processing-form">
      <el-form-item label="打印数据包">
        <el-select :model-value="packageId" @change="switchPackage" :disabled="busy" placeholder="请选择数据包">
          <el-option v-for="pkg in packages" :key="pkg.id" :value="pkg.id" :label="pkg.packageCode + (pkg.batchId ? '（追加）' : '')" />
        </el-select>
      </el-form-item>
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon>
        <el-button link type="primary" @click="reload" :disabled="busy">重新加载</el-button>
      </el-alert>
      <el-empty v-if="!loading && !error && !packages.length" :description="allowEdit ? '请先上传打印数据包' : '没有可查看的打印数据包'" />
      <template v-if="application && draft">
        <div class="form-heading">
          <strong>{{ application.packageCode }}</strong>
          <el-tag size="small">{{ application.status === 'ARCHIVED' ? '已归档' : application.revision ? '草稿' : '待填写' }}</el-tag>
          <span v-if="application.revision">版本 {{ application.revision }}</span>
          <span v-else-if="application.items.length">请核对预填明细并保存草稿</span>
          <span v-if="dirty">有未保存的修改</span>
        </div>
        <el-descriptions :column="3" size="small" border>
          <el-descriptions-item v-for="(label, key) in headerLabels" :key="key" :label="label">
            {{ application.header[key] || '—' }}
          </el-descriptions-item>
        </el-descriptions>
        <fieldset :disabled="!editable || busy" class="draft-fields">
          <div class="delivery">
            <el-form-item label="交付时间"><el-date-picker v-model="draft.deliveryTime" type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss" :disabled="!editable || busy" /></el-form-item>
            <el-form-item label="邮寄地址"><el-input v-model="draft.postalAddress" :disabled="!editable || busy" /></el-form-item>
          </div>
          <el-table :data="draft.items" border>
            <el-table-column type="index" label="序号" width="56" />
            <el-table-column label="包内模型文件" min-width="190"><template #default="{ row }">
              <el-select v-model="row.packageFileId" filterable clearable :disabled="!editable || busy">
                <el-option v-for="file in models" :key="file.id" :value="file.id" :label="fileLabel(file)" />
              </el-select>
            </template></el-table-column>
            <el-table-column label="材质" min-width="135"><template #default="{ row }">
              <el-select v-model="row.materialCode" clearable :disabled="!editable || busy">
                <el-option v-for="material in application.materialOptions" :key="material.code" :label="material.name" :value="material.code" />
              </el-select>
            </template></el-table-column>
            <el-table-column label="数量" width="120"><template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" :max="99" :precision="0" controls-position="right" :disabled="!editable || busy" style="width:100%" />
            </template></el-table-column>
            <el-table-column label="备注" min-width="140"><template #default="{ row }">
              <el-input v-model="row.remark" maxlength="500" :disabled="!editable || busy" />
            </template></el-table-column>
            <el-table-column v-if="editable" width="65"><template #default="{ $index }">
              <el-button link type="danger" :disabled="busy" @click="draft.items.splice($index, 1)">删除</el-button>
            </template></el-table-column>
          </el-table>
          <div class="row-actions">
            <el-button v-if="editable" size="small" @click="addRow" :disabled="busy">添加明细</el-button>
            <span :class="{ invalid: total > 99 }">共 {{ total }} 件{{ total > 99 ? '，超过 99 件请拆包' : '' }}</span>
          </div>
          <el-form-item label="加工要求"><el-input v-model="draft.processingRequirements" type="textarea" :rows="2" :disabled="!editable || busy" /></el-form-item>
        </fieldset>
      </template>
    </el-form>
    <template #footer-btn>
      <el-button @click="close" :disabled="busy">关闭</el-button>
      <el-button v-if="editable" @click="save" :disabled="busy || (!dirty && application?.revision !== 0)">保存草稿</el-button>
      <template v-if="application && canView && (application.revision || dirty || (editable && draft?.items.length))">
        <el-button @click="openDocument('download')" :disabled="busy">下载</el-button>
        <el-button type="primary" @click="openDocument('preview')" :disabled="busy">预览</el-button>
      </template>
    </template>
  </dialog-modal>
  <xlsx-preview-dialog v-model="previewVisible" :file-url="document?.previewUrl || null" :file-name="document?.fileName"
    file-type="processing" :can-edit="false" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DialogModal from '@/components/dialogModal.vue'
import XlsxPreviewDialog from './xlsxPreviewDialog.vue'
import {
  designPackageList, designPackageListForBatch, getProcessingApplication, saveProcessingApplication,
  generateProcessingDocument, downloadProcessingDocument, type PackageListItem,
  type ProcessingApplication, type ProcessingDraft, type ProcessingDocument,
} from '@/api/design'

const props = defineProps<{
  modelValue: boolean; orderId: number; batchId: number | null; allowEdit: boolean; canView: boolean; initialPackageId?: number | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'saved'): void }>()
const packages = ref<PackageListItem[]>([])
const packageId = ref<number | null>(null)
const application = ref<ProcessingApplication | null>(null)
const draft = ref<ProcessingDraft | null>(null)
const document = ref<ProcessingDocument | null>(null)
const previewVisible = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const baseline = ref('')
let request = 0

const headerLabels = {
  orderCode: '工单号', orderDate: '工单日期', orgName: '机构', areaName: '地区', hospitalName: '单位',
  operatorName: '提单员', operatorPhone: '电话', productName: '产品名称', preparerName: '制表人', preparedDate: '制表日期',
}
const dirty = computed(() => !!draft.value && JSON.stringify(draft.value) !== baseline.value)
const busy = computed(() => loading.value || saving.value)
const editable = computed(() => props.allowEdit && application.value?.editable && application.value.status !== 'ARCHIVED')
const models = computed(() => application.value?.files.filter(file => file.productionModel) || [])
const total = computed(() => draft.value?.items.reduce((sum, row) => sum + (row.quantity || 0), 0) || 0)
const fileLabel = (file: ProcessingApplication['files'][number]) =>
  models.value.some(other => other.id !== file.id && other.fileName === file.fileName)
    ? `${file.fileName} (#${file.id})` : file.fileName
function addRow() {
  if (!draft.value) return
  const unassigned = models.value.find(file => !draft.value!.items.some(item => item.packageFileId === file.id))
  draft.value.items.push({ packageFileId: unassigned?.id ?? null, materialCode: null, quantity: 1, remark: '' })
}
const message = (failure: unknown) => failure instanceof Error ? failure.message : String(failure || '请求失败，请重试')

function apply(data: ProcessingApplication) {
  application.value = data
  const { deliveryTime, postalAddress, processingRequirements } = data
  draft.value = { deliveryTime, postalAddress, processingRequirements, items: data.items.map(({ id, packageFileId, materialCode, quantity, remark }) =>
    ({ id, packageFileId, materialCode, quantity, remark })) }
  baseline.value = JSON.stringify(draft.value)
  document.value = data.document ?? null
}

const batchForPackage = () => packages.value.find(pkg => pkg.id === packageId.value)?.batchId ?? null

async function loadPackage(id: number) {
  const ticket = ++request
  packageId.value = id
  application.value = null
  draft.value = null
  document.value = null
  error.value = ''
  loading.value = true
  try {
    const data = await getProcessingApplication(props.orderId, id, batchForPackage())
    if (request === ticket) apply(data)
  } catch (failure) {
    if (request === ticket) error.value = message(failure)
  } finally {
    if (request === ticket) loading.value = false
  }
}

async function loadPackages() {
  const ticket = ++request
  loading.value = true
  error.value = ''
  packages.value = []
  packageId.value = null
  application.value = null
  document.value = null
  draft.value = null
  try {
    const list = props.batchId ? await designPackageListForBatch(props.orderId, props.batchId) : await designPackageList(props.orderId)
    if (ticket !== request) return
    packages.value = list
    const first = list.find(pkg => pkg.id === props.initialPackageId)
      ?? list.find(pkg => !pkg.processingApplication && !pkg.printInfoCompleted)
      ?? list[0]
    if (first) await loadPackage(first.id)
  } catch (failure) {
    if (ticket === request) error.value = message(failure)
  } finally {
    if (ticket === request) loading.value = false
  }
}

async function save() {
  if (!editable.value || !draft.value || !application.value || !packageId.value) return false
  const ticket = request
  saving.value = true
  error.value = ''
  try {
    const payload = { ...draft.value, expectedRevision: application.value.revision }
    const data = await saveProcessingApplication(props.orderId, packageId.value, batchForPackage(), payload)
    if (ticket !== request) return false
    apply(data)
    emit('saved')
    ElMessage.success('加工申请草稿已保存')
    return true
  } catch (failure) {
    if (ticket === request) error.value = message(failure)
    return false
  } finally {
    if (ticket === request) saving.value = false
  }
}

async function allowLeave() {
  if (busy.value) return false
  if (!dirty.value) return true
  try {
    await ElMessageBox.confirm('当前数据包有未保存的修改。', '保存草稿',
      { confirmButtonText: '保存后继续', cancelButtonText: '放弃修改', distinguishCancelAndClose: true, closeOnClickModal: false })
    return await save()
  } catch (action) {
    return action === 'cancel'
  }
}

async function switchPackage(id: number) {
  if (id !== packageId.value && await allowLeave()) await loadPackage(id)
}
async function close() {
  if (await allowLeave()) emit('update:modelValue', false)
}
async function reload() {
  if (dirty.value) {
    try { await ElMessageBox.confirm('重新加载会用服务器版本替换当前输入。', '重新加载', { confirmButtonText: '重新加载', cancelButtonText: '保留输入' }) }
    catch { return }
  }
  if (packageId.value) await loadPackage(packageId.value)
  else await loadPackages()
}

async function openDocument(action: 'preview' | 'download') {
  if (busy.value || !packageId.value || !application.value) return
  if ((dirty.value || (editable.value && !application.value.revision)) && !await save()) return
  const ticket = request
  saving.value = true
  error.value = ''
  try {
    const doc = await generateProcessingDocument(props.orderId, packageId.value, batchForPackage(), application.value.revision)
    if (ticket !== request) return
    document.value = doc
    if (action === 'download') await downloadProcessingDocument(props.orderId, packageId.value, doc)
    else previewVisible.value = true
  } catch (failure) {
    if (ticket === request) error.value = message(failure)
  } finally {
    if (ticket === request) saving.value = false
  }
}

watch(() => [props.modelValue, props.orderId, props.batchId], () => {
  ++request
  saving.value = false
  previewVisible.value = false
  if (props.modelValue) loadPackages()
}, { immediate: true })
</script>

<style scoped>
.processing-form { max-height: 65vh; overflow: auto; padding: 2px 8px; }
.form-heading, .row-actions { display: flex; align-items: center; gap: 12px; margin: 14px 0; }
.form-heading span, .row-actions span { color: #526479; font-size: 13px; }
.draft-fields { border: 0; margin: 16px 0 0; padding: 0; min-width: 0; }
.delivery { display: grid; grid-template-columns: minmax(220px, 1fr) 2fr; gap: 16px; }
.row-actions .invalid { color: #b42318; }
</style>
