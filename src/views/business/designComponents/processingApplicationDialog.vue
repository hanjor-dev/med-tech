<template>
  <dialog-modal :model-value="modelValue" title="加工申请单" width="1120px" :subtitle="order.orderCode ? '订单号：' + order.orderCode : ''" :close-on-press-escape="false"
    @modal-close="close">
    <PrintInfoWorkspace class="processing-form" v-loading="loading" :packages="sidebarPackages" :selected-id="packageId" :batch-id="batchId"
      :disabled="busy" :loading="loading" :status="sidebarStatus" @select="pkg => switchPackage(pkg.id)" @refresh="refreshPackages">
      <div class="dpid2-info-panel__header">
        <span class="dpid2-info-panel__num">02</span><span class="dpid2-info-panel__title">生产产品信息</span>
        <span v-if="dirty">有未保存的修改</span>
        <span v-if="application?.revision">版本 {{ application.revision }}</span>
        <span v-if="editable" class="dpid2-info-panel__badge">必填</span>
      </div>
      <el-alert v-if="error" class="processing-error" :title="error" type="error" :closable="false" show-icon>
        <el-button link type="primary" @click="reload" :disabled="busy">重新加载</el-button>
      </el-alert>
      <el-empty v-if="!loading && !error && !packages.length" :description="allowEdit ? '请先上传打印数据包' : '没有可查看的打印数据包'" />
      <template v-if="application && draft">
        <el-alert v-if="!application.revision && application.items.length" type="info" :closable="false" title="请核对预填明细并保存申请单" />
        <DocumentTabs v-model="tab" label="加工申请单" :tabs="applicationTabs" />
        <ProcessingApplicationFiles v-if="tab === 'files' && packageId" :key="packageId"
          :order-id="order.id" :package-id="packageId" :batch-id="batchForPackage()" :application="application"
          :can-view="canView" :editable="!!editable" :dirty="dirty" @refresh="reload" @document-updated="updateDocument" />
        <template v-else>
        <el-alert v-if="application.headerNeedsConfirmation" type="warning" :closable="false" show-icon
          :title="editable ? '主单表头已变化，请核对下方信息并保存后再预览或下载。' : '主单表头已变化，需由设计师核对并保存后再预览或下载。'" />
        <fieldset :disabled="!editable || busy" class="dpid2-edit-fieldset">
          <PrintOrderSummary :order-code="order.orderCode" :order-info="{
            orderCode: order.orderCode || application.header.orderCode,
            orgName: application.header.orgName, operatorName: application.header.operatorName,
            patientName: application.header.productName, hospitalName: application.header.hospitalName,
            expectedDeliveryDate: application.deliveryTime, isPostal: application.isPostal, postalAddress: application.postalAddress,
          }" />
          <div class="dpid2-info-scroll">
            <PrintProductList :rows="cards" :row-key="card => card.key" :category-name="card => categories(card).get(card.productCategory || '')"
              :editable="!!editable && !busy" remove-label="移除产品" @remove="index => cards.splice(index, 1)" @add="addRow">
              <template #default="{ row: card }">
                <div class="dpid2-field-row">
                  <div class="dpid2-field">
                    <label class="dpid2-field__label"><span>产品分类</span><span class="dpid2-field__req">*</span></label>
                    <el-select placeholder="请选择产品分类" size="small" v-model="card.productCategory" :disabled="!editable || busy" @change="changeCategory(card)">
                      <el-option v-for="[value,label] in categories(card)" :key="value" :value="value" :label="label" />
                    </el-select>
                  </div>
                  <div class="dpid2-field">
                    <label class="dpid2-field__label"><span>产品名称</span><span class="dpid2-field__req">*</span></label>
                    <el-select placeholder="请选择产品名称" size="small" v-model="card.productId" :disabled="!editable || busy || !card.productCategory" @change="card.specId = null; card.specName = null; card.productName = null">
                      <el-option v-for="p in products.filter(p => p.category === card.productCategory)" :key="p.id" :value="p.id" :label="p.productName" />
                      <el-option v-if="card.productId && !products.some(p => p.id === card.productId)" :value="card.productId" :label="card.productName || String(card.productId)" />
                    </el-select>
                  </div>
                  <div class="dpid2-field">
                    <label class="dpid2-field__label"><span>型号规格</span><span class="dpid2-field__req">*</span></label>
                    <el-select placeholder="请选择型号规格" size="small" v-model="card.specId" :disabled="!editable || busy || !card.productId">
                      <el-option v-for="s in specs(card)" :key="s.id" :value="s.id" :label="s.specName" />
                      <el-option v-if="card.specId && !specs(card).some(s => s.id === card.specId)" :value="card.specId" :label="card.specName || String(card.specId)" />
                    </el-select>
                  </div>
                </div>
                <div class="dpid2-field-row">
                  <div class="dpid2-field">
                    <label class="dpid2-field__label"><span>材质</span><span class="dpid2-field__req">*</span></label>
                    <el-select placeholder="请选择材质" size="small" v-model="card.materialCode" @change="resetColor(card)" :disabled="!editable || busy">
                      <el-option v-for="m in materialChoices(card)" :key="m.code" :value="m.code" :label="m.name" />
                    </el-select>
                  </div>
                  <div class="dpid2-field">
                    <label class="dpid2-field__label"><span>颜色</span><span class="dpid2-field__req">*</span></label>
                    <el-select placeholder="请选择颜色" size="small" v-model="card.colorCode" :disabled="!editable || busy">
                      <el-option v-for="c in colors(card)" :key="c.code" :value="c.code" :label="c.name" />
                      <el-option v-if="card.colorCode && !colors(card).some(c => c.code === card.colorCode)" :value="card.colorCode" :label="card.colorName || card.colorCode" />
                    </el-select>
                  </div>
                  <div v-if="card.rows.length === 1" class="dpid2-field">
                    <label class="dpid2-field__label"><span>数量</span><span class="dpid2-field__req">*</span></label>
                    <el-input-number size="small" v-model="card.rows[0].quantity" :min="1" :max="99" :precision="0" controls-position="right" :disabled="!editable || busy" />
                  </div>
                </div>
                <div class="dpid2-field">
                  <label class="dpid2-field__label"><span>打印模型</span><span class="dpid2-field__req">*</span></label>
                  <el-select placeholder="请选择打印模型" size="small" multiple :model-value="card.rows.flatMap(r => r.packageFileId == null ? [] : [r.packageFileId])"
                    :disabled="!editable || busy" @change="setModels(card, $event)">
                    <el-option v-for="file in models" :key="file.id" :value="file.id" :label="fileLabel(file)" />
                  </el-select>
                </div>
                <template v-if="card.rows.length > 1">
                  <div v-for="row in card.rows" :key="row.packageFileId ?? 'pending'" class="dpid2-field">
                    <label class="dpid2-field__label">{{ modelName(row.packageFileId) }} 数量<span class="dpid2-field__req">*</span></label>
                    <el-input-number size="small" v-model="row.quantity" :aria-label="modelName(row.packageFileId) + ' 数量'" :min="1" :max="99" :precision="0" controls-position="right" :disabled="!editable || busy" />
                  </div>
                </template>
              </template>
              <template #details>
                <div class="dpid2-pkg-meta">
                  <div class="dpid2-field">
                    <label class="dpid2-field__label"><span>加工要求</span></label>
                    <el-input size="small" v-model="draft.processingRequirements" type="textarea" :rows="2" :disabled="!editable || busy" />
                  </div>
                </div>
              </template>
            </PrintProductList>
          </div>
        </fieldset>
        </template>
      </template>
    </PrintInfoWorkspace>
    <template #footer-btn>
      <el-button class="btn btn-ghost" @click="close" :disabled="busy">关闭</el-button>
      <el-button type="primary" class="btn btn-primary" v-if="editable && tab === 'form'" @click="save" :loading="saving" :disabled="busy">
        {{ application?.headerNeedsConfirmation ? '确认表头并保存' : '保存申请单' }}
      </el-button>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, EditPen } from '@element-plus/icons-vue'
import DocumentTabs from './DocumentTabs.vue'
import PrintOrderSummary from './PrintOrderSummary.vue'
import PrintInfoWorkspace from './PrintInfoWorkspace.vue'
import PrintProductList from './PrintProductList.vue'
import DialogModal from '@/components/dialogModal.vue'
import ProcessingApplicationFiles from './ProcessingApplicationFiles.vue'
import {
  designPackageList, getProcessingApplication, saveProcessingApplication,
  type PackageListItem,
  type ProcessingApplication, type ProcessingDocument, type ProcessingForm, type ProcessingItem,
} from '@/api/design'
import { initialProductionPackage, packageEditable, packagesForProduction, type ProductionOrder } from '../productionBranch'

const props = defineProps<{
  modelValue: boolean; order: ProductionOrder; batchId: number | null; allowEdit: boolean; canView: boolean; initialPackageId?: number | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'saved'): void }>()
const packages = ref<PackageListItem[]>([])
const packageId = ref<number | null>(null)
const application = ref<ProcessingApplication | null>(null)
const draft = ref<ProcessingForm | null>(null)
const applicationTabs = [
  { value: 'form', label: '填写加工申请单', icon: EditPen },
  { value: 'files', label: '加工申请单文件', icon: Document },
] as const
const tab = ref<'form' | 'files'>('form')
type ProductCard = Omit<ProcessingItem, 'packageFileId' | 'quantity' | 'remark' | 'id'> & { key: number; rows: ProcessingItem[] }
const cards = ref<ProductCard[]>([])
let nextCard = 0
const statuses = ref<Record<number, string>>({})
const documentStatus = (doc: ProcessingDocument) => doc.confirmed ? '已确认' : '待确认'
const packageStatus = (pkg: Pick<PackageListItem, 'id' | 'processingStatus' | 'processingRevision' | 'processingApplication'>) => statuses.value[pkg.id] || (pkg.processingStatus === 'ARCHIVED' ? '已归档' : pkg.processingApplication ? documentStatus(pkg.processingApplication) : pkg.processingRevision ? '已保存' : '待填写')
function sidebarStatus(pkg: Parameters<typeof packageStatus>[0]) {
  const status = packageStatus(pkg)
  return status === '待填写' ? '' : status
}
const products = computed(() => application.value?.products || [])
const materials = computed(() => (application.value?.materials || []).filter(m => ['树脂','光敏树脂','PLA'].includes(m.name.trim().toUpperCase())))
const defaultMaterial = computed(() => materials.value.find(m => ['树脂','光敏树脂'].includes(m.name.trim()))?.code ?? materials.value[0]?.code ?? null)
function materialChoices(card: ProductCard) {
  const options = [...materials.value]
  const legacy = application.value?.materialOptions?.find(m => m.code === card.materialCode)
  if (legacy && !options.some(m => m.code === legacy.code)) options.push(legacy)
  else if (card.materialCode && !options.some(m => m.code === card.materialCode))
    options.push({ code: card.materialCode, name: card.materialName || card.materialCode })
  return options
}
const specs = (card: ProductCard) => products.value.find(p => p.id === card.productId)?.specs || []
function colors(card: ProductCard) {
  const pla = materials.value.find(m => m.code === card.materialCode)?.name.trim().toUpperCase() === 'PLA'
  const options = application.value?.colorGroups?.filter(g => !g.categoryCode || g.categoryCode === card.productCategory).flatMap(g => g.colors) || []
  return options.filter(c => ['白', '白色'].includes(c.name.trim()) || (!pla && ['透明', '透明色'].includes(c.name.trim())))
}
function resetColor(card: ProductCard) {
  if (!colors(card).some(c => c.code === card.colorCode)) card.colorCode = colors(card).find(c => ['白','白色'].includes(c.name.trim()))?.code ?? colors(card).find(c => c.isDefault)?.code ?? null
}
function categories(card: ProductCard) {
  const options = new Map(products.value.map(p => [p.category, p.categoryName]))
  if (card.productCategory && !options.has(card.productCategory)) options.set(card.productCategory, card.productCategoryName || card.productCategory)
  return options
}
function changeCategory(card: ProductCard) {
  card.productId = card.specId = null
  card.productName = card.specName = card.productCategoryName = card.colorName = null
  if (!materials.value.some(m => m.code === card.materialCode)) card.materialCode = defaultMaterial.value
  resetColor(card)
}
function flattenCards() {
  return cards.value.flatMap(({ rows, groupKey, productCategory, productId, specId, materialCode, colorCode }) =>
    rows.map(({ id, packageFileId, quantity }) => ({ id, packageFileId, quantity, groupKey, productCategory, productId, specId, materialCode, colorCode })))
}
const snapshot = () => JSON.stringify([draft.value, cards.value])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const baseline = ref('')
let request = 0

const dirty = computed(() => !!draft.value && snapshot() !== baseline.value)
const validationMessage = computed(() => {
  if (!cards.value.length) return '请填写加工明细'
  for (const [index, card] of cards.value.entries()) {
    const prefix = `第 ${index + 1} 个产品：`
    const legacy = !card.productCategory && !card.productId && !card.specId && !card.colorCode
      && application.value?.materialOptions?.some(option => option.code === card.materialCode)
    if (!legacy && (!card.productCategory || !card.productId || !card.specId || !card.materialCode || !card.colorCode))
      return prefix + '请选择产品分类、产品、规格、材质和颜色'
    if (!card.rows.length) return prefix + '请选择本包的打印模型'
    for (const row of card.rows) {
      if (row.packageFileId == null || !models.value.some(model => model.id === row.packageFileId))
        return prefix + '请选择本包的打印模型'
      if (!Number.isInteger(row.quantity) || !row.quantity || row.quantity < 1 || row.quantity > 99)
        return prefix + '数量须为 1 至 99 的整数'
    }
  }
  if (total.value > 99) return '合计超过 99 件，请拆分数据包'
  return ''
})
const busy = computed(() => loading.value || saving.value)
const selectedPackage = computed(() => packages.value.find(pkg => pkg.id === packageId.value))
const editable = computed(() => props.allowEdit && selectedPackage.value && packageEditable(selectedPackage.value, props.batchId, 'editable')
  && application.value?.editable && application.value.status !== 'ARCHIVED')
const models = computed(() => application.value?.files.filter(file => file.productionModel) || [])
const sidebarPackages = computed(() => packages.value.map(pkg => ({
  ...pkg, files: pkg.files?.length || pkg.id !== packageId.value ? pkg.files : application.value?.files,
})))
const total = computed(() => flattenCards().reduce((sum, row) => sum + (row.packageFileId != null ? row.quantity || 0 : 0), 0) || 0)
const fileLabel = (file: ProcessingApplication['files'][number]) =>
  models.value.some(other => other.id !== file.id && other.fileName === file.fileName)
    ? `${file.fileName} (#${file.id})` : file.fileName
function modelName(id: number | null) {
  const file = models.value.find(f => f.id === id)
  return file ? fileLabel(file) : id == null ? '待选模型' : '模型 #' + id
}
const emptyModel = (): ProcessingItem => ({ packageFileId: null, quantity: 1, materialCode: null })
function newGroupKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0,8), hex.slice(8,12), hex.slice(12,16), hex.slice(16,20), hex.slice(20)].join('-')
}
function addRow() {
  const card = { key: ++nextCard, groupKey: newGroupKey(), materialCode: defaultMaterial.value, rows: [emptyModel()] }
  resetColor(card)
  cards.value.push(card)
}
function setModels(card: ProductCard, ids: number[]) {
  if (ids.length > 1 && !card.groupKey) card.groupKey = newGroupKey()
  const pending = card.rows.find(r => r.packageFileId == null)
  card.rows = ids.length ? ids.map((id, index) => card.rows.find(r => r.packageFileId === id)
    || { ...(index === 0 && pending ? pending : emptyModel()), packageFileId: id }) : [emptyModel()]
}
const message = (failure: unknown) => failure instanceof Error ? failure.message : String(failure || '请求失败，请重试')

function apply(data: ProcessingApplication) {
  application.value = data
  draft.value = { processingRequirements: data.processingRequirements, items: [] }
  cards.value = []
  for (const item of data.items) {
    const { id, packageFileId, quantity, remark, ...product } = item
    let card = product.groupKey ? cards.value.find(c => c.groupKey === product.groupKey) : undefined
    if (!card) {
      card = { ...product, key: ++nextCard, rows: [] }
      cards.value.push(card)
    }
    card.rows.push({ id, packageFileId, quantity, remark, materialCode: product.materialCode })
  }
  if (!data.items.length && editable.value) addRow()
  statuses.value[data.packageId] = data.status === 'ARCHIVED' ? '已归档'
    : data.document ? documentStatus(data.document) : data.revision && !validationMessage.value ? '已保存' : '待填写'
  baseline.value = snapshot()
}

function updateDocument(document: ProcessingDocument) {
  if (!application.value || document.revision < application.value.revision) return
  const previous = application.value.document
  if (previous?.documentId !== document.documentId || previous.confirmed !== document.confirmed) emit('saved')
  statuses.value[application.value.packageId] = application.value.status === 'ARCHIVED' ? '已归档' : documentStatus(document)
  application.value.document = document
  application.value.revision = document.revision
}

const batchForPackage = () => selectedPackage.value?.batchId ?? null

async function loadPackage(id: number) {
  if (!packages.value.some(pkg => pkg.id === id)) return
  const ticket = ++request
  packageId.value = id
  application.value = null
  draft.value = null
  error.value = ''
  loading.value = true
  try {
    const data = await getProcessingApplication(props.order.id, id, batchForPackage())
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
  draft.value = null
  try {
    const list = await designPackageList(props.order.id)
    if (ticket !== request) return
    const matching = packagesForProduction(props.order, list, 2)
    packages.value = props.canView ? matching : matching.filter(pkg => props.allowEdit && packageEditable(pkg, props.batchId, 'editable'))
    const first = initialProductionPackage(packages.value, props.batchId, props.initialPackageId, pkg =>
      packageEditable(pkg, props.batchId, 'editable') && !pkg.processingRevision && !pkg.processingApplication && !pkg.printInfoCompleted)
    if (props.initialPackageId != null && !first) {
      error.value = '本次上传的数据包不在当前批次，请重新加载或手动选择数据包。'
    }
    if (first) await loadPackage(first.id)
  } catch (failure) {
    if (ticket === request) error.value = message(failure)
  } finally {
    if (ticket === request) loading.value = false
  }
}

async function save() {
  if (busy.value || !editable.value || !draft.value || !application.value || !packageId.value) return false
  if (validationMessage.value) {
    ElMessage.warning(validationMessage.value)
    return false
  }
  if (application.value.document && !dirty.value && !application.value.headerNeedsConfirmation) {
    ElMessage.info('当前申请单已保存')
    if (props.canView) tab.value = 'files'
    return true
  }
  const ticket = request
  saving.value = true
  error.value = ''
  try {
    const payload = { ...draft.value, items: flattenCards(), expectedRevision: application.value.revision, confirmedHeader: application.value.header }
    const data = await saveProcessingApplication(props.order.id, packageId.value, batchForPackage(), payload)
    if (ticket !== request) return false
    apply(data)
    if (props.canView) tab.value = 'files'
    emit('saved')
    ElMessage.success('加工申请单已保存')
    return true
  } catch (failure) {
    if (ticket === request) await handleFailure(failure, ticket)
    return false
  } finally {
    if (ticket === request) saving.value = false
  }
}

async function handleFailure(failure: unknown, ticket: number) {
  error.value = message(failure)
  if (!error.value.includes('主单表头已变化') || !application.value || !packageId.value) return
  application.value.headerNeedsConfirmation = true
  try {
    const current = await getProcessingApplication(props.order.id, packageId.value, batchForPackage())
    if (ticket !== request) return
    // 只更新待核对的表头。保留输入和原版本，避免覆盖其他人已保存的明细。
    application.value.header = current.header
    application.value.editable = current.editable
  } catch (refreshFailure) {
    if (ticket === request) error.value = message(refreshFailure)
  }
}

async function allowLeave() {
  if (busy.value) return false
  if (!dirty.value) return true
  try {
    const needsConfirmation = application.value?.headerNeedsConfirmation
    await ElMessageBox.confirm('当前数据包有未保存的修改。', '保存申请单',
      { confirmButtonText: needsConfirmation ? '返回核对表头' : validationMessage.value ? '继续填写' : '保存后继续', cancelButtonText: '放弃修改', distinguishCancelAndClose: true, closeOnClickModal: false })
    if (needsConfirmation || validationMessage.value) {
      tab.value = 'form'
      return false
    }
    return await save()
  } catch (action) {
    return action === 'cancel'
  }
}

async function switchPackage(id: number) {
  if (id !== packageId.value && await allowLeave()) {
    tab.value = 'form'
    await loadPackage(id)
  }
}
async function close() {
  if (await allowLeave()) emit('update:modelValue', false)
}
async function refreshPackages() {
  if (await allowLeave()) await loadPackages()
}
async function reload() {
  if (dirty.value) {
    try { await ElMessageBox.confirm('重新加载会用服务器版本替换当前输入。', '重新加载', { confirmButtonText: '重新加载', cancelButtonText: '保留输入' }) }
    catch { return }
  }
  if (packageId.value) await loadPackage(packageId.value)
  else await loadPackages()
}

watch(() => [props.modelValue, props.order.id, props.batchId, props.initialPackageId], () => {
  ++request
  saving.value = false
  tab.value = 'form'
  statuses.value = {}
  if (props.modelValue) loadPackages()
}, { immediate: true })
</script>

<style scoped>
.processing-form :deep(.dlr-main > *) {
  flex-shrink: 0;
}

.processing-error :deep(.el-alert__title) {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
