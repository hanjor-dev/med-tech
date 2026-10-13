<template>
  <dialog-modal v-model="visible" title="填写打印信息" :subtitle="subtitle" :width="width" :show-footer="true"
    :loading="loading" @modal-close="handleClose">
    <div class="dlr-root" v-if="!loading">
      <!-- 主内容区：左侧数据包列表 + 右侧打印信息 -->
      <!-- 左侧：数据包列表 -->
      <aside class="dlr-slidebar">
        <div class="dlr-slidebar__header">
          <span class="dlr-slidebar__num">01</span>
          <span class="dlr-slidebar__title">数据包</span>
          <span class="dlr-slidebar__count">{{ packages.length }}</span>
          <button class="dlr-slidebar__refresh" @click="loadPackages" :loading="packagesLoading" title="刷新">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        <div class="dlr-slidebar__list">
          <div v-if="packages.length === 0 && !packagesLoading" class="dlr-slidebar__empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>暂无数据包</span>
            <span class="dlr-slidebar__empty-sub">请先上传打印文件包</span>
          </div>

          <div v-for="pkg in packages" :key="pkg.id" class="pkg-item"
            :class="{ 'pkg-item--active': selectedPkgId === pkg.id }" @click="selectPackage(pkg)">
            <div class="pkg-item__header">
              <svg class="pkg-item__icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span class="pkg-item__name">{{ pkg.packageCode || `数据包 #${pkg.packageSeq}` }}</span>
              <span v-if="props.batchId && pkg.batchId === props.batchId" class="pkg-item__append-badge">追加</span>
              <span class="pkg-item__badge">×{{ pkg.fileCount }}</span>
            </div>
            <div class="pkg-item__files">
              <span v-for="f in (pkg.files || []).slice(0, 3)" :key="f.id" class="pkg-item__tag">
                {{ stripExt(f.fileName) }}
              </span>
              <span v-if="(pkg.files || []).length > 3" class="pkg-item__more">
                +{{ (pkg.files || []).length - 3 }}
              </span>
            </div>
            <div class="pkg-item__status" v-if="(pkg.printInfoCount ?? 0) > 0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              已填 {{ pkg.printInfoCount }} 条
            </div>
          </div>
        </div>
      </aside>
      <!-- 右侧：包内文件 + 打印信息表单 -->
      <main class="dlr-main" :class="{ 'dpid2-info-panel--empty': !selectedPkg }">
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
        <!-- 打印信息内容 -->
        <template v-else>
          <fieldset :disabled="!canEditCurrent" class="dpid2-edit-fieldset">
          <!-- 订单上下文横条 -->
          <div class="dpid2-orderbar">
            <div class="dpid2-orderbar__row">
              <div class="dpid2-orderbar__item">
                <span class="dpid2-orderbar__label">订单编号</span>
                <span class="dpid2-orderbar__value">{{ orderInfo?.orderCode || orderCode || '—' }}</span>
              </div>
              <div class="dpid2-orderbar__item">
                <span class="dpid2-orderbar__label">客户</span>
                <span class="dpid2-orderbar__value">{{ orderInfo?.orgName || '—' }}</span>
              </div>
              <div class="dpid2-orderbar__item">
                <span class="dpid2-orderbar__label">联系人</span>
                <span class="dpid2-orderbar__value">{{ orderInfo?.operatorName || '—' }}</span>
              </div>
              <div class="dpid2-orderbar__item">
                <span class="dpid2-orderbar__label">患者姓名</span>
                <span class="dpid2-orderbar__value">{{ orderInfo?.patientName || '—' }}</span>
              </div>
            </div>
            <div class="dpid2-orderbar__separator"></div>
            <div class="dpid2-orderbar__row">
              <div class="dpid2-orderbar__item">
                <span class="dpid2-orderbar__label">医院</span>
                <span class="dpid2-orderbar__value">{{ orderInfo?.hospitalName || '—' }}</span>
              </div>
              <div class="dpid2-orderbar__item">
                <span class="dpid2-orderbar__label">预交货</span>
                <span class="dpid2-orderbar__value">{{ orderInfo?.expectedDeliveryDate || '—' }}</span>
              </div>
              <div class="dpid2-orderbar__item">
                <span class="dpid2-orderbar__label">是否邮寄</span>
                <span class="dpid2-orderbar__tag"
                  :class="orderInfo?.isPostal === 1 ? 'dpid2-orderbar__tag--yes' : 'dpid2-orderbar__tag--no'">
                  <svg v-if="orderInfo?.isPostal === 1" width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ orderInfo?.isPostal === 1 ? '是' : '否' }}
                </span>
              </div>
              <div class="dpid2-orderbar__item dpid2-orderbar__item--wide"
                v-if="orderInfo?.isPostal === 1 && orderInfo?.postalAddress">
                <span class="dpid2-orderbar__label">邮寄地址</span>
                <span class="dpid2-orderbar__value dpid2-orderbar__value--postal">{{ orderInfo.postalAddress }}</span>
              </div>
            </div>
          </div>

          <!-- 可滚动内容区 -->
          <div class="dpid2-info-scroll">
            <div class="dpid2-product-rows">
              <div v-for="(row, idx) in productRows" :key="row._uid" class="dpid2-card"
                :style="{ animationDelay: `${idx * 0.07}s` }">
                <!-- 卡片头部 -->
                <div class="dpid2-card__header">
                  <div class="dpid2-card__num">
                    <span class="dpid2-card__num-text">{{ idx + 1 }}</span>
                  </div>
                  <span class="dpid2-card__title">产品 {{ idx + 1 }}</span>
                  <span class="dpid2-card__category-badge" v-if="getCategoryName(row.categoryId)">{{
                    getCategoryName(row.categoryId) }}</span>
                  <div class="dpid2-card__actions">
                    <button class="dpid2-card__delete" @click="removeRow(idx)" :disabled="!canEditCurrent || productRows.length < 1"
                      title="删除">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- 卡片主体 -->
                <div class="dpid2-card__body">
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
                </div>
              </div>

              <!-- 添加产品按钮 -->
              <button class="dpid2-add-btn" @click="addRow" :disabled="!selectedPkg || !canEditCurrent">
                <span class="dpid2-add-btn__icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                添加产品
              </button>

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
            </div>
          </div>
          </fieldset>
        </template>
      </main>
    </div>
    <!-- 加载中 -->
    <div class="dpid2-loading" v-else>
      <el-icon class="dpid2-loading__icon" :size="28">
        <Loading />
      </el-icon>
      <span>加载打印信息选项…</span>
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
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import { designPrintInfoOptions, designPrintInfoOptionsWithBatch, designWorkorderDetail, designPackageList, designPackageFiles, designPrintInfoSave, designPrintInfoSaveWithBatch, designPrintInfoList, designPrintInfoListWithBatch, designPrintInfoDelete, designPrintInfoDeleteWithBatch } from '@/api/design'
import { getDictOptions } from '@/utils/dict'

// ============================================================
// 类型定义
// ============================================================

/** 数据包列表项 */
interface PackageItem {
  id: number
  packageCode: string
  packageSeq: number
  fileCount: number
  files?: PackageFileItem[]
  printInfoCount?: number
  batchId?: number | null
  canEditPrintInfo?: boolean
  printInfoCompleted?: boolean
}

/** 包内文件项 */
interface PackageFileItem {
  id: number
  packageId: number
  fileName: string
  fileExt: string
  sortOrder: number
}

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
  orderId: number | null
  orderCode?: string
  batchId?: number | null
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

const subtitle = computed(() => props.orderCode ? `订单号：${props.orderCode}` : '')
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
const canEditCurrent = computed(() => {
  if (!selectedPkg.value) return false
  // 追加模式下，历史数据包只能查看，只有当前追加批次允许填写或修改打印信息。
  if (props.batchId && selectedPkg.value.batchId !== props.batchId) return false
  return selectedPkg.value.canEditPrintInfo !== false
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
const packagePrintInfoMap = ref<Record<number, any[]>>({})

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
      designWorkorderDetail(props.orderId!),
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
    // 追加模式仍展示订单下全部数据包；后端能力字段负责将历史包置为只读。
    const res: any = await designPackageList(props.orderId!)
    packages.value = res?.data || res || []
    if (packages.value.length > 0 && !selectedPkgId.value) {
      // 默认选中第一条当前可编辑且尚未填写打印信息的数据包。
      const pkg = packages.value.find(p => isPackageEditable(p) && !isPrintInfoCompleted(p))
        || packages.value[0]
      selectPackage(pkg)
    }
  } catch {
    packages.value = []
    ElMessage.error('加载数据包列表失败')
  } finally {
    packagesLoading.value = false
  }
}

const isPackageEditable = (pkg: PackageItem) => {
  if (props.batchId && pkg.batchId !== props.batchId) return false
  return pkg.canEditPrintInfo !== false
}

const isPrintInfoCompleted = (pkg: PackageItem) => pkg.printInfoCompleted === true

const findNextUnfilledPackage = (currentPackageId: number) => packages.value.find(pkg =>
  pkg.id !== currentPackageId && isPackageEditable(pkg) && !isPrintInfoCompleted(pkg),
)

const loadPackageFiles = async () => {
  if (!selectedPkgId.value) return

  // 已有缓存则直接回显，无需再请求
  const cached:any = packagePrintInfoMap.value[selectedPkgId.value]
  if (cached) {
    pkgFiles.value = cached._files || []
    printInfoOptions.value = cached._options || null
    applyPrintInfoToRows(cached)
    return
  }

  try {
    pkgFilesLoading.value = true
    const useBatchApi = Boolean(props.batchId && selectedPkg.value?.batchId === props.batchId)
    const [filesRes, optionsRes, printInfoRes] = await Promise.all([
      designPackageFiles(props.orderId!, selectedPkgId.value),
      useBatchApi ? designPrintInfoOptionsWithBatch(props.orderId!, selectedPkgId.value, props.batchId!) : designPrintInfoOptions(props.orderId!, selectedPkgId.value),
      useBatchApi ? designPrintInfoListWithBatch(props.orderId!, selectedPkgId.value, props.batchId!) : designPrintInfoList(props.orderId!, selectedPkgId.value),
    ])
    const filesData = filesRes?.data ?? filesRes
    const optionsData = optionsRes?.data ?? optionsRes
    const printData = printInfoRes?.data ?? printInfoRes
    packagePrintInfoMap.value[selectedPkgId.value] = { ...printData, _files: filesData, _options: optionsData }
    pkgFiles.value = filesData || []
    printInfoOptions.value = optionsData
    applyPrintInfoToRows(printData)
  } catch {
  } finally {
    pkgFilesLoading.value = false
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
  selectedPkgId.value = pkg.id
  await loadPackageFiles()
}

const addRow = () => {
  productRows.value.push(makeRow())
}

const removeRow = async (idx: number) => {
  const row = productRows.value[idx]
  if (!selectedPkgId.value || !props.orderId) return
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
  if (row.id > 0) {
    try {
      if (props.batchId && selectedPkg.value?.batchId === props.batchId) {
        await designPrintInfoDeleteWithBatch(props.orderId, selectedPkgId.value, props.batchId, row.id)
      } else {
        await designPrintInfoDelete(props.orderId, selectedPkgId.value, row.id)
      }
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
      return
    }
  }
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
      await designPrintInfoSaveWithBatch(props.orderId!, selectedPkgId.value, props.batchId, payload)
    } else {
      await designPrintInfoSave(props.orderId!, selectedPkgId.value, payload)
    }

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

const handleClose = () => {
  emit('update:modelValue', false)
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
    packagePrintInfoMap.value = {}
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
@use '@/assets/style/dialogLeftRight.scss' as *;

.dpid2-pkg-item--active .dpid2-pkg-item__badge {
  background: $blue-light;
  color: $blue-dark;
}


// ─── Info Panel ────────────────────────────────────────────────────────────────
.dpid2-info-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dpidFadeIn 0.35s ease both;
}

.dpid2-info-panel--empty {
  align-items: center;
  justify-content: center;
}

.dpid2-info-panel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 14px;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
}

.dpid2-info-panel__num {
  font-family: 'DM Mono', 'Fira Code', monospace;
  font-size: 10px;
  font-weight: 600;
  color: $blue;
  background: $blue-light;
  padding: 2px 6px;
  border-radius: $radius-xs;
  letter-spacing: 0.5px;
}

.dpid2-info-panel__title {
  font-size: 11px;
  font-weight: 700;
  color: $text-mid;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  flex: 1;
}

.dpid2-info-panel__badge {
  font-size: 10px;
  font-weight: 600;
  color: $amber;
  background: $amber-light;
  padding: 1px 7px;
  border-radius: $radius-full;
}

.dpid2-info-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 24px;
  color: $text-faint;
  font-size: 13px;
  text-align: center;
}

.dpid2-info-empty__sub {
  font-size: 11px;
  color: $text-xfaint;
}

// ─── Order Bar ─────────────────────────────────────────────────────────────────
.dpid2-orderbar {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: $surface-raised;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
  overflow-x: hidden;
}

.dpid2-orderbar__row {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  gap: 30px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.dpid2-orderbar__separator {
  height: 1px;
  background: $border;
  margin: 0 20px;
}

.dpid2-orderbar__item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 20px 0 0;
  min-width: 80px;
  flex-shrink: 0;

  &:first-child {
    padding-left: 0;
  }

  &--wide {
    min-width: 200px;
    max-width: 260px;
  }
}

.dpid2-orderbar__divider {
  display: none;
}

.dpid2-orderbar__label {
  font-size: 10px;
  color: $text-faint;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.dpid2-orderbar__value {
  font-size: 12px;
  font-weight: 600;
  color: $text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;

  &--postal {
    font-size: 11px;
    font-weight: 400;
    color: $text-muted;
    max-width: 240px;
  }
}

.dpid2-orderbar__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: $radius-full;

  &--yes {
    background: $teal-light;
    color: $teal;
  }

  &--no {
    background: $border;
    color: $text-muted;
  }
}

// ─── Scroll Area ───────────────────────────────────────────────────────────────
.dpid2-info-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
  scrollbar-width: thin;
  scrollbar-color: $border-mid transparent;
}

// ─── Product Rows ─────────────────────────────────────────────────────────────
.dpid2-product-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Product Card
.dpid2-card {
  border: 1.5px solid $border;
  border-radius: $radius-lg;
  overflow: hidden;
  background: $surface;
  box-shadow: $shadow-xs;
  animation: dpidCardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #bfdbfe;
    box-shadow: $shadow-sm;
  }
}

@keyframes dpidCardIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dpid2-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(135deg, $blue-pale 0%, #e8f4ff 100%);
  border-bottom: 1px solid $border;
}

.dpid2-card__num {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, $blue, $blue-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(30, 111, 217, 0.3);
}

.dpid2-card__num-text {
  font-family: 'DM Mono', 'Fira Code', monospace;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.dpid2-card__title {
  font-size: 12px;
  font-weight: 700;
  color: $text-mid;
  letter-spacing: 0.3px;
  flex: 1;
}

.dpid2-card__category-badge {
  font-size: 10px;
  font-weight: 600;
  color: $blue-mid;
  background: $blue-light;
  padding: 2px 8px;
  border-radius: $radius-full;
}

.dpid2-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dpid2-card__delete {
  width: 28px;
  height: 28px;
  border-radius: $radius;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $text-faint;
  transition: all 0.15s;

  &:hover {
    background: $danger-light;
    color: $danger;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;

    &:hover {
      background: transparent;
      color: $text-faint;
    }
  }
}

.dpid2-card__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// Field layout
.dpid2-field-row {
  display: flex;
  gap: 12px;

  >* {
    flex: 1;
    min-width: 0;
  }
}

.dpid2-field {
  display: flex;
  flex-direction: column;
  gap: 5px;

  &--full {
    width: 100%;
    flex: unset;
  }
}

.dpid2-field__label {
  font-size: 11px;
  color: $text-muted;
  font-weight: 500;
  letter-spacing: 0.2px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 3px;
}

.dpid2-field__req {
  color: $danger;
  font-size: 12px;
}

:deep(.dpid2-field--readonly .el-input__wrapper) {
  background: $surface-raised;
  cursor: default;
}

// Add button
.dpid2-add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 2px dashed $border-mid;
  border-radius: $radius-lg;
  background: transparent;
  cursor: pointer;
  color: $text-muted;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
  margin-top: 4px;

  &:hover:not(:disabled) {
    border-color: $blue-mid;
    color: $blue;
    background: $blue-pale;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dpid2-add-btn__icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: $blue-light;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $blue;
  flex-shrink: 0;
  transition: background 0.2s;

  .dpid2-add-btn:hover:not(:disabled) & {
    background: $blue;
    color: white;
  }
}

// ─── Package Meta ──────────────────────────────────────────────────────────────
.dpid2-pkg-meta {
  margin-top: 12px;
  padding: 14px 16px;
  border: 1.5px dashed $border-mid;
  border-radius: $radius-lg;
  background: $surface-raised;
  animation: dpidFadeIn 0.35s ease both;
}

.dpid2-pkg-meta__row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.dpid2-pkg-meta__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;

  &--remark {
    flex: 2;
  }
}

.dpid2-pkg-meta__label {
  font-size: 11px;
  color: $text-muted;
  font-weight: 500;
  letter-spacing: 0.2px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 3px;
}

.dpid2-pkg-meta__req {
  color: $danger;
  font-size: 12px;
}

// ─── Loading ───────────────────────────────────────────────────────────────────
.dpid2-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px;
  color: $text-faint;
  font-size: 13px;
}

.dpid2-loading__icon {
  animation: dpidSpin 1s linear infinite;
  color: $blue;
}

// ─── Footer ────────────────────────────────────────────────────────────────────
.dpid2-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// ─── Animations ────────────────────────────────────────────────────────────────
@keyframes dpidFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes dpidSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

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
