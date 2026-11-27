<template>
  <dialog-modal v-model="visible" :title="dialogReadOnly ? '查看打印信息' : '填写打印信息'" :subtitle="subtitle" :width="width" :show-footer="true"
    :loading="loading" :before-close="handleClose" @modal-close="handleClose">
    <PrintInfoWorkspace v-if="!loading" :packages="packages" :selected-id="selectedPkgId" :batch-id="batchId"
      :disabled="saving" :loading="packagesLoading" :status="pkg => pkg.printInfoCount ? '已填 ' + pkg.printInfoCount + ' 条' : ''"
      @select="selectPackage" @refresh="refreshPackages">
        <div class="dpid2-info-panel__header">
          <span class="dpid2-info-panel__num">02</span>
          <span class="dpid2-info-panel__title">生产产品信息</span>
          <span class="dpid2-info-panel__badge">必填</span>
        </div>
        <!-- 未选数据包提示 -->
        <div class="dpid2-info-empty" v-if="!selectedPkg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M9 9h6M9 12h6M9 15h4" />
          </svg>
          <span>请在左侧选择一个数据包</span>
          <span class="dpid2-info-empty__sub">选择后可在下方填写对应的打印信息</span>
        </div>
        <el-alert v-else-if="packageError" type="error" :closable="false" :title="packageError">
          <el-button @click="loadPackageFiles">重试</el-button>
        </el-alert>
        <el-skeleton v-else-if="pkgFilesLoading" animated :rows="5" />
        <!-- 打印信息内容 -->
        <template v-else>
          <fieldset :disabled="!canEditCurrent" class="dpid2-edit-fieldset">
          <!-- 订单上下文横条 -->
          <PrintOrderSummary :order-info="orderInfo" :order-code="order.orderCode" />

          <!-- 可滚动内容区 -->
          <div class="dpid2-info-scroll">
            <PrintProductList :rows="productRows" :row-key="row => row._uid" :category-name="row => getCategoryName(row.categoryId)"
              :editable="!!selectedPkg && canEditCurrent" show-disabled-add @remove="removeRow" @add="addRow">
              <template #default="{ row, index: idx }">
                <!-- Row: 分类 / 产品 / 规格 -->
                <div class="dpid2-field-row">
                  <div class="dpid2-field">
                    <label class="dpid2-field__label">产品分类<span class="dpid2-field__req">*</span></label>
                    <el-select v-model="row.categoryId" placeholder="请选择分类" size="small" clearable
                      :disabled="!canEditCurrent">
                      <el-option v-for="p in categoryOptions" :key="p.id" :label="p.name" :value="p.id" />
                    </el-select>
                  </div>
                  <div class="dpid2-field">
                    <label class="dpid2-field__label">产品名称<span class="dpid2-field__req">*</span></label>
                    <el-select v-model="row.productId" placeholder="请选择产品" size="small" clearable
                      :disabled="!canEditCurrent || !row.categoryId">
                      <el-option v-for="p in getProducts(row.categoryId)" :key="p.id" :label="p.productName"
                        :value="p.id" />
                    </el-select>
                  </div>
                  <div class="dpid2-field">
                    <label class="dpid2-field__label">型号规格<span class="dpid2-field__req">*</span></label>
                    <el-select v-model="row.specId" placeholder="先选产品" size="small" clearable
                      :disabled="!canEditCurrent || !row.productId">
                      <el-option v-for="s in getSpecs(row.productId)" :key="s.id" :label="`${s.specName}${s.remark ? `(${s.remark})` : ''}`" :value="s.id" />
                    </el-select>
                  </div>
                </div>

                <!-- Row: 材质 / 颜色 / 数量 -->
                <div class="dpid2-field-row">
                  <div class="dpid2-field">
                    <label class="dpid2-field__label">材质<span class="dpid2-field__req">*</span></label>
                    <el-select v-model="row.materialId" placeholder="请选择材质" size="small" clearable
                      :disabled="!canEditCurrent || !row.specId">
                      <el-option v-for="m in materialOptions" :key="m.code" :label="m.name" :value="m.code" />
                    </el-select>
                  </div>
                  <div class="dpid2-field">
                    <label class="dpid2-field__label">颜色<span class="dpid2-field__req">*</span></label>
                    <el-select v-model="row.colorId" placeholder="请选择颜色" size="small" clearable
                      :disabled="!canEditCurrent || !row.categoryId">
                      <el-option v-for="c in colorOptions" :key="c.code" :label="c.name"
                        :value="c.code" />
                    </el-select>
                  </div>
                  <div class="dpid2-field">
                    <label class="dpid2-field__label">数量<span class="dpid2-field__req">*</span></label>
                    <el-input-number v-model="row.quantity" :min="1" :max="999" size="small"
                      controls-position="right" :disabled="!canEditCurrent" />
                  </div>
                </div>

                <!-- Row: 预交日期 / 注册证号 -->
                <div class="dpid2-field-row">
                  <div class="dpid2-field">
                    <label class="dpid2-field__label">注册证号</label>
                    <el-input :model-value="getCertNo(row.specId)" placeholder="自动带出" size="small" readonly
                      class="dpid2-field--readonly" />
                  </div>
                </div>

                <!-- Row: 打印模型（多选） -->
                <div class="dpid2-field dpid2-field--full">
                  <label class="dpid2-field__label">打印模型<span class="dpid2-field__req">*</span></label>
                  <el-select v-model="row.packageFileIds" placeholder="请选择打印模型" size="small" multiple clearable
                    :disabled="!canEditCurrent || pkgFiles.length === 0">
                    <el-option v-for="f in pkgFiles" :key="f.id" :label="stripExt(f.fileName)" :value="f.id"
                      :disabled="isFileSelectedByOther(f.id, idx)" />
                  </el-select>
                </div>
              </template>
              <template #details>
              <!-- 包级别字段：产品标识 & 包装数量 -->
              <div class="dpid2-pkg-meta">
                <div class="dpid2-pkg-meta__row">
                  <div class="dpid2-pkg-meta__field">
                    <label class="dpid2-pkg-meta__label">产品标识<span class="dpid2-pkg-meta__req">*</span></label>
                    <el-input v-model="packageProductMark" placeholder="用于追溯，同一数据包下所有产品共享" size="small" clearable
                      :disabled="!canEditCurrent" />
                  </div>
                  <div class="dpid2-pkg-meta__field">
                    <label class="dpid2-pkg-meta__label">包装数量</label>
                    <el-input-number v-model="packQuantity" :min="1" :max="999" size="small"
                      controls-position="right" :disabled="!canEditCurrent" />
                  </div>
                  <div class="dpid2-pkg-meta__field dpid2-pkg-meta__field--remark">
                    <label class="dpid2-pkg-meta__label">备注</label>
                    <el-input v-model="globalRemark" placeholder="选填，全局备注说明" size="small" clearable
                      :disabled="!canEditCurrent" />
                  </div>
                </div>
              </div>
              </template>
            </PrintProductList>
          </div>
          </fieldset>
        </template>
    </PrintInfoWorkspace>
    <!-- 加载中 -->
    <div v-else class="print-info-workspace">
      <div class="dpid2-loading">
      <el-icon class="dpid2-loading__icon" :size="28">
        <Loading />
      </el-icon>
      <span>加载打印信息选项…</span>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer-btn>
      <el-button @click="handleClose" class="btn btn-ghost">取消</el-button>
      <el-button type="primary" class="btn btn-primary" size="default" @click="handleSave"
        :loading="saving" :disabled="!canEditCurrent">
        保存打印信息
      </el-button>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import PrintOrderSummary from './PrintOrderSummary.vue'
import PrintInfoWorkspace from './PrintInfoWorkspace.vue'
import PrintProductList from './PrintProductList.vue'
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import { designPrintInfoOptions, designPrintInfoOptionsWithBatch, designWorkorderDetail, designPackageList, designPackageFiles, designPrintInfoSave, designPrintInfoSaveWithBatch, designPrintInfoList, designPrintInfoListWithBatch, designPrintInfoDelete, designPrintInfoDeleteWithBatch, type PackageListItem as PackageItem, type PackageFileItem } from '@/api/design'
import { initialProductionPackage, isLocalPhysical, packageEditable, packagesForProduction, type ProductionOrder } from '../productionBranch'
import { getDictOptions } from '@/utils/dict'

// ============================================================
// 类型定义
// ============================================================

/** 打印信息选项响应 */
interface PrintInfoOptionsVO {
  designMode: any
  products: {
    id: number
    productName: string
    category: string
    categoryName: string
    specs: { id: number; specName: string; certId: number; certNo: string; remark?: string }[]
  }[]
  materials: { code: string; name: string; isDefault: boolean }[]
  colorGroups: { categoryCode: string; colors: { code: string; name: string }[] }[]
  printModels: { id: number; modelName: string; materialCode: string }[]
}

/** 产品行 */
interface ProductRow {
  id: number;
  _uid: string
  _packageFileId?: number
  /** 已保存的打印信息 ID，删除时需要 */
  _printInfoId?: number
  packageFileIds?: number[]
  categoryId?: string
  productId?: number
  specId?: number
  materialId?: string
  colorId?: string
  quantity: number
  deliveryDate?: string
  remark?: string
  printModelIds?: number[]
}

// ============================================================
// Props / Emits
// ============================================================
const props = defineProps<{
  modelValue: boolean
  order: ProductionOrder
  batchId?: number | null
  initialPackageId?: number | null
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
}>()

// ============================================================
// 弹框控制
// ============================================================
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const subtitle = computed(() => props.order.orderCode ? `订单号：${props.order.orderCode}` : '')
const width = '1120px'

// ============================================================
// 状态
// ============================================================
const loading = ref(false)
const saving = ref(false)

// 订单基本信息
const orderInfo = ref<{
  orderCode: string
  orgName: string
  operatorName: string
  patientName: string
  hospitalName: string
  expectedDeliveryDate: string
  isPostal: number
  postalAddress: string | null
} | null>(null)

// 数据包列表
const packages = ref<PackageItem[]>([])
const packagesLoading = ref(false)
const selectedPkgId = ref<number | null>(null)
const selectedPkg = computed(() => packages.value.find(p => p.id === selectedPkgId.value) || null)
const dialogReadOnly = computed(() => props.readOnly || (isLocalPhysical(props.order) && packages.value.length > 0
  && !packages.value.some(isPackageEditable)))
const canEditCurrent = computed(() => {
  if (!selectedPkg.value || !detailEditable.value || saving.value) return false
  return isPackageEditable(selectedPkg.value)
})

// 包内文件
const pkgFiles = ref<PackageFileItem[]>([])
const pkgFilesLoading = ref(false)

// 包级别：产品标识 & 包装数量 & 全局备注
const packageProductMark = ref('')
const packQuantity = ref<number>(1)
const globalRemark = ref('')

// 打印信息选项
const printInfoOptions = ref<PrintInfoOptionsVO | null>(null)

// 已填打印信息（按 packageId 索引）
const detailEditable = ref(false)
const packageError = ref('')
const formBaseline = ref('')
let detailRequest = 0
const formValue = () => JSON.stringify([productRows.value, packageProductMark.value, packQuantity.value, globalRemark.value])

// 分类选项（字典 17）
const categoryOptions = ref<{ id: string; name: string }[]>([])

// 产品列表（当前行）
const productRows = ref<ProductRow[]>([])

// 分类名称映射
const getCategoryName = (categoryId?: string) => {
  if (!categoryId) return ''
  return categoryOptions.value.find(c => c.id === categoryId)?.name || ''
}

const getProducts = (categoryId?: string) => {
  if (!printInfoOptions.value || !categoryId) return []
  return printInfoOptions.value.products.filter(p => p.category === categoryId)
}

const materialOptions = computed(() => printInfoOptions.value?.materials || [])

const colorOptions = computed(() => {
  if (!printInfoOptions.value) return []
  return printInfoOptions.value.colorGroups
    .flatMap((g: any) => g.colors)
    .map((c: any) => ({ ...c, code: String(c.code) }))
})

const getDefaultMaterialCode = () => {
  const defaultMaterial = materialOptions.value.find((m: any) => m.isDefault === true)
  return defaultMaterial?.code
}

// ============================================================
// 辅助方法
// ============================================================
let _uidCounter = 0
const mkuid = () => `row_${++_uidCounter}_${Date.now()}`

const stripExt = (filename: string) => filename.replace(/\.[^.]+$/, '')

const makeRow = (partial: Partial<ProductRow> = {}): ProductRow => {
  const defaultMaterial = materialOptions.value.find((m: any) => m.isDefault === true)
  const defaultColor = colorOptions.value.find((c: any) => c.isDefault === true)
  return {
    _uid: mkuid(),
    id: -1,
    packageFileIds: [],
    categoryId: undefined,
    productId: undefined,
    specId: undefined,
    materialId: defaultMaterial?.code || '树脂',
    colorId: defaultColor ? String(defaultColor.code) : undefined,
    quantity: 1,
    deliveryDate: undefined,
    remark: undefined,
    printModelIds: [],
    ...partial,
  }
}

const getSpecs = (productId?: number) => {
  if (!printInfoOptions.value || !productId) return []
  const product = printInfoOptions.value.products.find(p => p.id === productId)
  return product?.specs || []
}

const getColors = (categoryId?: string) => {
  if (!printInfoOptions.value || !categoryId) return []
  return printInfoOptions.value.colorGroups
    .filter(g => g.categoryCode === categoryId)
    .flatMap(g => g.colors)
    .map(c => ({ ...c, code: String(c.code) }))
}

const getCertNo = (specId?: number) => {
  if (!printInfoOptions.value || !specId) return ''
  for (const product of printInfoOptions.value.products) {
    const spec = product.specs.find(s => s.id === specId)
    if (spec) return spec.certNo || ''
  }
  return ''
}

// 判断文件是否已被其他行选中
const isFileSelectedByOther = (fileId: number, currentRowIdx: number) => {
  return productRows.value.some((row, idx) => {
    if (idx === currentRowIdx) return false
    return row.packageFileIds?.includes(fileId) ?? false
  })
}

// ============================================================
// 数据加载
// ============================================================
const loadOptions = async () => {
  try {
    loading.value = true
    const [detailRes, categoryRes] = await Promise.all([
      designWorkorderDetail(props.order.id),
      getDictOptions('17'),
    ])
    const categories = categoryRes as { label: string; value: string }[]
    categoryOptions.value = categories.map(c => ({ id: c.value, name: c.label }))
    if (detailRes) {
      orderInfo.value = {
        orderCode: detailRes.orderCode || '',
        orgName: detailRes.orgName || '',
        operatorName: detailRes.operatorName || '',
        patientName: detailRes.patientName || '',
        hospitalName: detailRes.hospitalName || '',
        expectedDeliveryDate: detailRes.expectedDeliveryDate || '',
        isPostal: detailRes.isPostal ?? 0,
        postalAddress: detailRes.postalAddress || null,
      }
    }
  } catch {
    ElMessage.error('加载打印信息选项失败')
  } finally {
    loading.value = false
  }
}

const loadPackages = async () => {
  try {
    packagesLoading.value = true
    const list = await designPackageList(props.order.id)
    packages.value = packagesForProduction(props.order, list, 1)
    if (!selectedPkg.value) {
      selectedPkgId.value = null
      const pending = (p: PackageItem) => isPackageEditable(p) && !isPrintInfoCompleted(p)
      const pkg = !isLocalPhysical(props.order) && props.initialPackageId == null
        ? packages.value.find(pending) ?? packages.value[0]
        : initialProductionPackage(packages.value, props.batchId ?? null, props.initialPackageId, pending)
      if (pkg) await selectPackage(pkg)
      else if (props.initialPackageId != null) ElMessage.warning('本次上传的数据包不在当前批次，请刷新或手动选择数据包。')
    }
  } catch {
    packages.value = []
    ElMessage.error('加载数据包列表失败')
  } finally {
    packagesLoading.value = false
  }
}

const isPackageEditable = (pkg: PackageItem) => {
  if (props.readOnly) return false
  if (isLocalPhysical(props.order) || props.batchId != null) return packageEditable(pkg, props.batchId ?? null, 'canEditPrintInfo')
  return pkg.canEditPrintInfo !== false
}

const isPrintInfoCompleted = (pkg: PackageItem) => pkg.printInfoCompleted === true

const findNextUnfilledPackage = (currentPackageId: number) => packages.value.find(pkg =>
  pkg.id !== currentPackageId && isPackageEditable(pkg) && !isPrintInfoCompleted(pkg),
)

const loadPackageFiles = async () => {
  if (!selectedPkgId.value) return

  const id = selectedPkgId.value
  const ticket = ++detailRequest
  detailEditable.value = false
  formBaseline.value = ''
  packageError.value = ''
  pkgFiles.value = []
  printInfoOptions.value = null
  productRows.value = []
  packageProductMark.value = ''
  packQuantity.value = 1
  globalRemark.value = ''

  try {
    pkgFilesLoading.value = true
    const useBatchApi = Boolean(props.batchId && selectedPkg.value?.batchId === props.batchId)
    const [filesRes, optionsRes, printInfoRes] = await Promise.all([
      designPackageFiles(props.order.id, selectedPkgId.value),
      useBatchApi ? designPrintInfoOptionsWithBatch(props.order.id, selectedPkgId.value, props.batchId!) : designPrintInfoOptions(props.order.id, selectedPkgId.value),
      useBatchApi ? designPrintInfoListWithBatch(props.order.id, selectedPkgId.value, props.batchId!) : designPrintInfoList(props.order.id, selectedPkgId.value),
    ])
    const filesData = filesRes?.data ?? filesRes
    const optionsData = optionsRes?.data ?? optionsRes
    const printData = printInfoRes?.data ?? printInfoRes
    if (ticket !== detailRequest || id !== selectedPkgId.value) return
    pkgFiles.value = filesData || []
    printInfoOptions.value = optionsData
    applyPrintInfoToRows(printData)
    detailEditable.value = [printData, optionsData].every(value => value?.canSave !== false && value?.editable !== false)
    formBaseline.value = formValue()
  } catch (failure) {
    if (ticket === detailRequest && id === selectedPkgId.value) {
      packageError.value = failure instanceof Error ? failure.message : '打印信息加载失败，请重试'
    }
  } finally {
    if (ticket === detailRequest) pkgFilesLoading.value = false
  }
}

/** 将已填打印信息回显到 productRows */
const applyPrintInfoToRows = (printData: any) => {
  const infos: any[] = printData?.items || []
  if (infos.length === 0) {
    productRows.value = [makeRow({ materialId: getDefaultMaterialCode() })]
    packageProductMark.value = ''
    packQuantity.value = 1
    globalRemark.value = ''
    return
  }
  productRows.value = infos.map((info: any) => {
    const row: Partial<ProductRow> = {
      _uid: mkuid(),
      id: info.id,
      quantity: info.quantity || 1,
      deliveryDate: info.deliveryDate || undefined,
      remark: info.remark || '',
    }
    // 分类/产品/规格/材质/颜色用 code 或 id 回填
    if (info.category) row.categoryId = String(info.category)
    if (info.productId) row.productId = info.productId
    if (info.specId) row.specId = info.specId
    if (info.materialId) row.materialId = String(info.materialId)
    if (info.colorId) row.colorId = String(info.colorId)
    if (info.printInfoId) row._printInfoId = info.printInfoId
    // 打印模型
    if (info.files && Array.isArray(info.files)) {
      row.packageFileIds = info.files.map((file: any) => file.packageFileId)
    }
    // 如果没有 materialId，设置默认值
    if (!row.materialId) {
      row.materialId = getDefaultMaterialCode()
    }
    return makeRow(row)
  })
  // 包级别字段回填
  packageProductMark.value = printData?.productMark || ''
  packQuantity.value = printData?.packQuantity || 1
  globalRemark.value = printData?.remark || ''
}

// ============================================================
// 交互方法
// ============================================================
const selectPackage = async (pkg: PackageItem) => {
  if (selectedPkgId.value === pkg.id || !await allowDiscard()) return
  selectedPkgId.value = pkg.id
  await loadPackageFiles()
}

const addRow = () => {
  productRows.value.push(makeRow())
}

const removeRow = async (idx: number) => {
  const row = productRows.value[idx]
  const packageId = selectedPkgId.value
  if (!packageId || !canEditCurrent.value) return
  try {
    await ElMessageBox.confirm('确定要删除该打印信息吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
    })
  } catch {
    return
  }
  if (!canEditCurrent.value || selectedPkgId.value !== packageId) return
  if (row.id > 0) {
    try {
      if (props.batchId && selectedPkg.value?.batchId === props.batchId) {
        await designPrintInfoDeleteWithBatch(props.order.id, selectedPkgId.value, props.batchId, row.id)
      } else {
        await designPrintInfoDelete(props.order.id, selectedPkgId.value, row.id)
      }
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
      return
    }
  }
  if (selectedPkgId.value !== packageId) return
  productRows.value.splice(idx, 1)
  if (productRows.value.length === 0) {
    productRows.value.push(makeRow({ materialId: getDefaultMaterialCode() }))
  }
}

const handleSave = async () => {
  if (!selectedPkgId.value) {
    ElMessage.warning('请先选择数据包')
    return
  }
  if (!canEditCurrent.value) return
  if (!packageProductMark.value || !packageProductMark.value.trim()) {
    ElMessage.warning('请填写产品标识')
    return
  }
  for (let i = 0; i < productRows.value.length; i++) {
    const row = productRows.value[i]
    if (!row.productId) { ElMessage.warning(`第 ${i + 1} 行：请选择产品名称`); return }
    if (!row.specId) { ElMessage.warning(`第 ${i + 1} 行：请选择型号规格`); return }
    if (!row.materialId) { ElMessage.warning(`第 ${i + 1} 行：请选择材质`); return }
    if (!row.colorId) { ElMessage.warning(`第 ${i + 1} 行：请选择颜色`); return }
    if (!row.quantity || row.quantity < 1) { ElMessage.warning(`第 ${i + 1} 行：请填写数量`); return }
    if (!row.packageFileIds || row.packageFileIds.length === 0) { ElMessage.warning(`第 ${i + 1} 行：请选择打印模型`); return }
  }

  try {
    saving.value = true
    const items = productRows.value.map(row => {
      const product = printInfoOptions.value?.products.find(p => p.id === row.productId)
      const spec = product?.specs.find(s => s.id === row.specId)
      const material = materialOptions.value.find(m => m.code === row.materialId)
      const color = colorOptions.value.find(c => c.code === row.colorId)
      return {
        packageFileIds: row.packageFileIds || [],
        categoryId: row.categoryId,
        categoryName: product?.categoryName || '',
        productId: row.productId,
        specId: row.specId,
        materialId: row.materialId,
        materialName: material?.name || '',
        colorId: row.colorId,
        colorName: color?.name || '',
        quantity: row.quantity,
        deliveryDate: row.deliveryDate || '',
        remark: row.remark || '',
      }
    })

    const payload = {
      items,
      productMark: packageProductMark.value,
      packQuantity: packQuantity.value,
      remark: globalRemark.value,
    }
    if (props.batchId && selectedPkg.value?.batchId === props.batchId) {
      await designPrintInfoSaveWithBatch(props.order.id, selectedPkgId.value, props.batchId, payload)
    } else {
      await designPrintInfoSave(props.order.id, selectedPkgId.value, payload)
    }

    formBaseline.value = ''
    ElMessage.success('打印信息保存成功')
    emit('success')

    // 保存成功后立即更新当前包状态，避免再次选择到刚刚完成的数据包。
    const currentPackage = packages.value.find(pkg => pkg.id === selectedPkgId.value)
    if (currentPackage) {
      currentPackage.printInfoCompleted = true
      currentPackage.printInfoCount = items.length
    }

    // 统一按“保存并进入下一条未填写数据包”的流程处理普通和追加模式。
    const nextPackage = findNextUnfilledPackage(selectedPkgId.value)
    if (nextPackage) {
      await selectPackage(nextPackage)
      return
    }

    emit('update:modelValue', false)
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function allowDiscard() {
  if (!formBaseline.value || formBaseline.value === formValue()) return true
  try {
    await ElMessageBox.confirm('打印信息有未保存的修改，是否放弃？', '未保存的打印信息', {
      confirmButtonText: '放弃修改', cancelButtonText: '继续填写', closeOnClickModal: false,
    })
    return true
  } catch { return false }
}
async function refreshPackages() {
  if (saving.value || !await allowDiscard()) return
  ++detailRequest
  selectedPkgId.value = null
  formBaseline.value = ''
  await loadPackages()
}
const handleClose = async () => {
  if (!saving.value && await allowDiscard()) emit('update:modelValue', false)
}

// ============================================================
// 监听弹窗打开
// ============================================================
watch(visible, async (val) => {
  if (val) {
    selectedPkgId.value = null
    packages.value = []
    pkgFiles.value = []
    productRows.value = []
    printInfoOptions.value = null
    orderInfo.value = null
    formBaseline.value = ''
    packageProductMark.value = ''
    packQuantity.value = 1
    globalRemark.value = ''

    await Promise.all([loadOptions(), loadPackages()])
    if (productRows.value.length === 0) {
      productRows.value = [makeRow()]
    }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
// 打印模型选项：已被其他产品选中的显示为灰色
:deep(.el-select-dropdown__item.is-disabled) {
  color: #a8abb2 !important;
  cursor: not-allowed;
  background-color: #f5f7fa;

  &::after {
    content: '(已被其他产品使用)';
    margin-left: 6px;
    font-size: 10px;
    color: #909399;
  }
}
</style>
