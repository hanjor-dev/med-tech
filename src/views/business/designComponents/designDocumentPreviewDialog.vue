<template>
  <dialog-modal v-model="visible" :title="dialogTitle" :subtitle="subtitle" :width="width" :show-footer="false"
    @modal-close="visible = false">
    <div class="dlr-root" v-if="!pkgLoading">
      <!-- 左右主布局 -->
      <!-- 左侧：数据包列表 -->
      <aside class="dlr-slidebar">
        <div class="dlr-slidebar__header">
          <span class="dlr-slidebar__num">01</span>
          <span class="dlr-slidebar__title">数据包</span>
          <span class="dlr-slidebar__count">{{ packageList.length }}</span>
          <button class="dlr-slidebar__refresh" @click="loadPackages" :loading="pkgLoading" title="刷新">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
        <div class="dlr-slidebar__list">
          <div v-if="packageList.length === 0 && !pkgLoading" class="dlr-slidebar__empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>暂无数据包</span>
            <span class="dlr-slidebar__empty-sub">请先上传打印文件包</span>
          </div>

          <div v-for="pkg in packageList" :key="pkg.id" class="pkg-item"
            :class="{ 'pkg-item--active': selectedPackage?.id === pkg.id }" @click="selectPackage(pkg)">
            <div class="pkg-item__header">
              <svg class="pkg-item__icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span class="pkg-item__name">{{ pkg.packageCode || `数据包 #${pkg.packageSeq}` }}</span>
              <span v-if="isCurrentAppendPackage(pkg)" class="pkg-item__append-badge">追加</span>
              <span class="pkg-item__badge">×{{ pkg.fileCount }}</span>
            </div>
            <!-- 数据包确认状态 -->
            <!-- <div class="pkg-item__status-wrap">
              <span
                class="pkg-item__status-tag"
                :class="pkgLatestConfirmedStatus(pkg) === 'confirmed' ? 'pkg-item__status-tag--confirmed' : 'pkg-item__status-tag--pending'"
              >
                {{ pkgLatestConfirmedStatus(pkg) === 'confirmed' ? '已确认' : '待确认' }}
              </span>
            </div> -->
            <div class="pkg-item__files">
              <span v-for="f in (pkg.files || []).slice(0, 3)" :key="f.id" class="pkg-item__tag">
                {{ f.fileName }}
              </span>
              <span v-if="(pkg.files || []).length > 3" class="pkg-item__more">
                +{{ (pkg.files || []).length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <!-- 右侧：指令单 / 图纸内容 -->
      <main class="dlr-main">
        <!-- 加载中（切换包时） -->
        <div class="ddpd-loading" v-if="tabLoading">
          <el-icon class="ddpd-loading__icon" :size="24">
            <Loading />
          </el-icon>
          <span>加载文档信息…</span>
        </div>
        <!-- 未选中数据包时的空状态 -->
        <div class="ddpd-empty-panel" v-if="!selectedPackage">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.3">
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span class="ddpd-empty-panel__title">请从左侧选择一个数据包</span>
          <span class="ddpd-empty-panel__sub">查看该包对应的指令单和图纸</span>
        </div>
         <!-- 空状态（该包无文档） -->
         <div class="ddpd-empty" v-else-if="!currentData && activeTab === 'instruction' && !pkgLatestInstr">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.3">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <span class="ddpd-empty__title">该数据包暂无指令单文件</span>
          <span class="ddpd-empty__sub">请先填写打印信息后自动生成</span>
        </div>
      
        <!-- 文档内容 -->
        <template v-else>
          <!-- 标签切换：指令单 / 图纸 -->
          <DocumentTabs :model-value="activeTab" label="生产文档"
            :tabs="[
              { value: 'instruction', label: '指令单', icon: Document,
                badge: activeTab === 'instruction' ? (currentData ? currentData.version : pkgLatestInstr?.version) : undefined,
                amber: !currentData },
              { value: 'drawing', label: '图纸', icon: Picture, badge: drawData?.version, amber: true },
            ]" @update:model-value="switchTab" />

          <!-- 图纸分类切换（仅在图纸tab显示） -->
          <div class="draw-category-switch" v-if="activeTab === 'drawing'">
            <button v-for="cat in drawCategoryOptions" :key="cat.value" class="draw-category-btn"
              :class="{ 'draw-category-btn--active': currentDrawCategory === cat.value }"
              @click="switchDrawCategory(cat.value)">
              {{ cat.label }}
            </button>
          </div>

          <!-- 图表纸内容区 -->
          <template v-if="activeTab === 'instruction' || drawData">
            <!-- 指令单加载中 -->
            <div v-if="activeTab === 'instruction' && instrLoading" class="ddpd-loading">
              <el-icon class="ddpd-loading__icon" :size="24">
                <Loading />
              </el-icon>
              <span>加载指令单…</span>
            </div>
            <!-- 指令单内容 -->
            <template v-else-if="activeTab === 'instruction'">
              <!-- 当前版本信息卡 -->
              <DocumentVersionCard label="指令单" :version="pkgLatestInstr?.version"
                :confirmed="pkgLatestInstr?.isConfirmed" :refreshing="instrRefreshing"
                :time="formatTime(pkgLatestInstr?.generateTime)" :file="pkgLatestInstr?.fileId"
                show-upload :uploading="uploadingFile" :upload-disabled="uploadingFile || !canEditDocuments"
                :upload-hint="pkgLatestInstr ? '' : '先生成指令单后再上传修订版'" :uploaded-name="lastUploadedInstrFileName"
                :preview-disabled="!previewUrl" :downloading="downloading" :download-disabled="downloading"
                @upload="triggerInstrUpload" @preview="handlePreview" @download="handleDownload">
                <input ref="uploadInstrInputRef" type="file" accept=".xlsx" hidden @change="handleInstrUploadFileChange" />
              </DocumentVersionCard>
            </template>

            <!-- 图纸加载中 -->
            <div v-if="activeTab === 'drawing' && drawLoading" class="ddpd-loading">
              <el-icon class="ddpd-loading__icon" :size="24">
                <Loading />
              </el-icon>
              <span>加载图纸…</span>
            </div>

            <!-- 图纸空状态（当前分类无数据且非加载中） -->
            <div v-else-if="activeTab === 'drawing' && !drawData" class="ddpd-drawing-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>暂无{{ getCurrentCategoryLabel() }}图纸</span>
            </div>

            <!-- 图纸内容 -->
            <div v-else-if="activeTab === 'drawing' && drawData" class="ddpd-drawing-content">
              <DocumentVersionCard label="图纸" drawing :version="drawData?.version"
                :confirmed="drawData?.isConfirmed" :refreshing="drawRefreshing"
                :time="formatTime(drawData?.generateTime)" :file="drawData?.fileId"
                show-upload :uploading="uploadingDrawFile" :upload-disabled="uploadingDrawFile || !canEditDocuments"
                :upload-hint="drawData ? '' : '先生成图纸后再上传修订版'" :uploaded-name="lastUploadedDrawFileName"
                :preview-disabled="!previewUrl" :downloading="downloading" :download-disabled="downloading"
                @upload="triggerDrawUpload" @preview="handlePreview" @download="handleDownload">
                <input ref="uploadDrawInputRef" type="file" accept=".xlsx" hidden @change="handleDrawUploadFileChange" />
              </DocumentVersionCard>
            </div>

            <!-- 指令单 / 图纸 共用版本历史 -->
            <DocumentVersionHistory v-model:expanded="historyExpanded"
              v-if="activeTab === 'instruction' ? (pkgLatestInstr || instrLoading || instrHistory.length) : (drawData || drawLoading || drawHistory.length)"
              :history-list="historyList" :current-doc-id="currentDocId" :history-loading="historyLoading"
              @preview="handleHistoryPreview" @download="handleHistoryDownload" />
          </template>
        </template>
      </main>
    </div>
    <!-- 全局加载 -->
    <div class="ddpd-loading-global" v-else>
      <el-icon class="ddpd-loading-global__icon" :size="28">
        <Loading />
      </el-icon>
      <span>加载文档信息…</span>
    </div>
  </dialog-modal>

  <!-- xlsx 内嵌预览弹窗 -->
  <xlsx-preview-dialog v-model="showXlsxPreview" :file-url="xlsxPreviewUrl" :file-name="xlsxPreviewFileName"
    :file-type="xlsxPreviewFileType" :order-id="props.order.id" :package-id="xlsxPreviewPackageId"
    :expected-file-id="xlsxPreviewStorageId" :file-id="xlsxPreviewFileId" :product-category="xlsxPreviewProductCategory" :confirmed="xlsxPreviewConfirmed"
    :batch-id="isCurrentAppendPackage(selectedPackage) ? props.batchId : null"
    :can-edit="canEditDocuments && xlsxPreviewFileId === currentData?.id"
    @confirm-success="onXlsxConfirmSuccess" />
</template>

<script setup lang="ts">
import DocumentVersionCard from './DocumentVersionCard.vue'
import DocumentVersionHistory from './DocumentVersionHistory.vue'
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Loading, Picture } from '@element-plus/icons-vue'
import DocumentTabs from './DocumentTabs.vue'
import dialogModal from '@/components/dialogModal.vue'
import xlsxPreviewDialog from './xlsxPreviewDialog.vue'
import {
  designPackageList,
  designInstructionPreviewUrl,
  designDrawingPreviewUrl,
  designInstructionVersions,
  designDrawingVersions,
  designInstructionDownload,
  designDrawingDownload,
  type PackageListItem,
} from '@/api/design'
import { initialProductionPackage, isLocalPhysical, packageEditable, packagesForProduction, type ProductionOrder } from '../productionBranch'
import { Session } from '@/utils/storage'
import dayjs from 'dayjs'
import { getDictOptions } from '@/utils/dict'

// ============================================================
// 类型定义
// ============================================================

interface DocVersionItem {
  templateFileId: string | null
  id: number
  version: string
  versionSeq: number
  fileId: string | null
  templateFileUrl: string | null
  templateDownloadUrl?: string | null
  revisedFileId: string | null
  revisedFileUrl: string | null
  generateTime: string | null
  revisedUploadTime: string | null
  isConfirmed: number
  confirmTime: string | null
}

// ============================================================
// Props / Emits
// ============================================================

const props = defineProps<{
  modelValue: boolean
  order: ProductionOrder
  batchId?: number | null
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'refresh'): void
}>()

// ============================================================
// 弹框控制
// ============================================================

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const dialogTitle = '图纸和指令单'
const subtitle = computed(() => props.order.orderCode ? `订单号：${props.order.orderCode}` : '')
const width = '960px'

// ============================================================
// 状态
// ============================================================

const loading = ref(false)
const pkgLoading = ref(false)
const instrLoading = ref(false)
const drawLoading = ref(false)
const instrRefreshing = ref(false)
const drawRefreshing = ref(false)
const tabLoading = ref(false)
const activeTab = ref<'instruction' | 'drawing'>('instruction')
const historyExpanded = ref(false)
const historyLoading = ref(false)
const generating = ref(false)
const downloading = ref(false)
const uploadingFile = ref(false)
const uploadingDrawFile = ref(false)
const uploadInstrInputRef = ref<HTMLInputElement | null>(null)
const uploadDrawInputRef = ref<HTMLInputElement | null>(null)
const lastUploadedInstrFileName = ref('')
const lastUploadedDrawFileName = ref('')

// 数据包列表
const packageList = ref<PackageListItem[]>([])

// 选中的数据包
const selectedPackage = ref<PackageListItem | null>(null)

// 当前包最新的指令单
const pkgLatestInstr = ref<DocVersionItem | null>(null)

// 图纸分类相关
const drawCategoryOptions = ref<{ label: string; value: string }[]>([])
const currentDrawCategory = ref<string>('17.1')

// 获取当前分类的显示名称
const getCurrentCategoryLabel = () => {
  const found = drawCategoryOptions.value.find(c => c.value === currentDrawCategory.value)
  return found?.label || ''
}

// 图纸数据（不区分模型/导板，统一赋值给同一个对象）
const drawData = ref<DocVersionItem | null>(null)

// 图纸版本历史
const drawHistory = ref<DocVersionItem[]>([])

// 指令单版本历史
const instrHistory = ref<DocVersionItem[]>([])

// xlsx 预览弹窗
const showXlsxPreview = ref(false)
const xlsxPreviewUrl = ref<string | null>(null)
const xlsxPreviewFileName = ref('')
const xlsxPreviewFileType = ref<'drawing' | 'instruction'>('instruction')
const xlsxPreviewStorageId = ref<string>()
const xlsxPreviewFileId = ref<number | undefined>(undefined)
const xlsxPreviewConfirmed = ref(false)
const xlsxPreviewProductCategory = ref<string | undefined>(undefined)
const xlsxPreviewPackageId = computed(() => selectedPackage.value?.id ?? undefined)

// ============================================================
// 计算属性
// ============================================================

// 当前图纸数据（根据 activeTab 决定用哪个）
const currentData = computed(() =>
  activeTab.value === 'instruction' ? pkgLatestInstr.value : drawData.value
)

const isCurrentAppendPackage = (pkg: PackageListItem | null | undefined) =>
  Boolean(props.batchId && pkg?.batchId && Number(pkg.batchId) === Number(props.batchId))

const canEditDocuments = computed(() => {
  if (!selectedPackage.value || props.readOnly) return false
  if (isLocalPhysical(props.order) || props.batchId != null) return packageEditable(selectedPackage.value, props.batchId ?? null, 'canEditDocuments')
  return selectedPackage.value.canEditDocuments !== false
})

const formatTime = (value?: string | null) => value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''
const historyList = computed(() => (activeTab.value === 'instruction' ? instrHistory.value : drawHistory.value)
  .map(item => ({ ...item, time: formatTime(item.generateTime || item.revisedUploadTime) })))

// 当前文档 ID（用于历史列表中高亮"当前"版本）
const currentDocId = computed(() =>
  activeTab.value === 'instruction' ? pkgLatestInstr.value?.id : drawData.value?.id
)

/**
 * 获取指定数据包的确认状态
 * 优先取 latestInstruction/latestDrawings（来自数据包列表接口）
 * 若为空则回退到右侧版本历史中的最新记录
 */
const pkgLatestConfirmedStatus = (pkg: PackageListItem): 'confirmed' | 'pending' => {
  const hasLatestInstr = pkg.latestInstruction != null
  const hasLatestDraws = pkg.latestDrawings?.length
  if (hasLatestInstr || hasLatestDraws) {
    const instrConfirmed = hasLatestInstr && pkg.latestInstruction!.isConfirmed === 1
    const drawAllConfirmed = !!hasLatestDraws && pkg.latestDrawings.every(d => d.isConfirmed === 1)
    return instrConfirmed && drawAllConfirmed ? 'confirmed' : 'pending'
  }
  if (isLocalPhysical(props.order)) return 'pending'
  const latestInstrConfirmed = instrHistory.value[0]?.isConfirmed === 1
  const latestDrawConfirmed = drawHistory.value[0]?.isConfirmed === 1
  return latestInstrConfirmed && latestDrawConfirmed ? 'confirmed' : 'pending'
}

const selectDefaultPackage = () => {
  if (isLocalPhysical(props.order)) return initialProductionPackage(packageList.value, props.batchId ?? null, null,
    pkg => pkgLatestConfirmedStatus(pkg) === 'pending')
  const pendingPackages = packageList.value.filter(pkg => pkgLatestConfirmedStatus(pkg) === 'pending')
  // 优先处理原设计数据包；原数据包均已确认时，再处理追加数据包。
  return pendingPackages.find(pkg => !pkg.batchId) || pendingPackages[0] || packageList.value[0]
}

const previewUrl = computed(() => {
  if (activeTab.value === 'instruction') {
    const d = pkgLatestInstr.value
    if (!d) return null
    return d.revisedFileUrl || d.templateFileUrl || null
  } else {
    const d = drawData.value
    if (!d) return null
    return d.revisedFileUrl || d.templateFileUrl || null
  }
})

const downloadFileId = computed(() => {
  if (activeTab.value === 'instruction') {
    const d = pkgLatestInstr.value
    if (!d) return null
    return d.revisedFileId || d.fileId || null
  } else {
    const d = drawData.value
    if (!d) return null
    return d.revisedFileId || d.fileId || null
  }
})

// ============================================================
// 数据加载
// ============================================================

const loadPackages = async () => {
  await loadPackageList()
  if (packageList.value.length > 0 && !selectedPackage.value) {
    await selectPackage(selectDefaultPackage()!)
  }
}

const loadPackageList = async () => {
  if (!props.order.id) return
  pkgLoading.value = true
  try {
    const res = await designPackageList(props.order.id)
    packageList.value = packagesForProduction(props.order, res, 1)
    if (selectedPackage.value) selectedPackage.value = packageList.value.find(pkg => pkg.id === selectedPackage.value?.id) ?? null
  } catch {
    packageList.value = []
    selectedPackage.value = null
  } finally {
    pkgLoading.value = false
  }
}

let documentRequest = 0

const loadCurrentDocuments = async (refreshing = false) => {
  const pkg = selectedPackage.value
  if (!pkg) return
  const ticket = ++documentRequest
  const orderId = props.order.id
  const batchId = isCurrentAppendPackage(pkg) ? props.batchId : null
  const category = currentDrawCategory.value
  const instruction = activeTab.value === 'instruction'
  const latest = instruction ? pkgLatestInstr : drawData
  const history = instruction ? instrHistory : drawHistory
  instrLoading.value = instruction && !refreshing
  drawLoading.value = !instruction && !refreshing
  instrRefreshing.value = instruction && refreshing
  drawRefreshing.value = !instruction && refreshing
  historyLoading.value = true
  if (!refreshing) {
    latest.value = null
    history.value = []
  }
  if (isLocalPhysical(props.order) && pkg.productionType == null) {
    latest.value = null
    history.value = []
    instrLoading.value = drawLoading.value = false
    instrRefreshing.value = drawRefreshing.value = false
    historyLoading.value = false
    return
  }
  try {
    const [version, versions] = await Promise.all([
      (instruction ? designInstructionPreviewUrl(orderId, pkg.id, batchId)
        : designDrawingPreviewUrl(orderId, pkg.id, category, batchId)).catch(() => null),
      (instruction ? designInstructionVersions(orderId, pkg.id, batchId)
        : designDrawingVersions(orderId, pkg.id, category, batchId)).catch(() => []),
    ])
    if (ticket !== documentRequest || selectedPackage.value?.id !== pkg.id) return
    latest.value = version?.data ?? version ?? null
    history.value = versions?.data ?? versions ?? []
  } finally {
    if (ticket === documentRequest) {
      instrLoading.value = false
      drawLoading.value = false
      instrRefreshing.value = false
      drawRefreshing.value = false
      historyLoading.value = false
    }
  }
}

const switchDrawCategory = async (category: string) => {
  if (currentDrawCategory.value === category) return
  currentDrawCategory.value = category
  historyExpanded.value = false
  await loadCurrentDocuments()
}

const getFirstAvailableDrawingCategory = (pkg: PackageListItem) => {
  const packageCategories = new Set(
    (pkg.latestDrawings || [])
      .map(drawing => drawing.productCategory)
      .filter(Boolean),
  )
  return drawCategoryOptions.value.find(option => packageCategories.has(option.value))?.value
    || (pkg.latestDrawings || [])[0]?.productCategory
    || drawCategoryOptions.value[0]?.value
    || ''
}

// ============================================================
// 包选择
// ============================================================

const selectPackage = async (pkg: PackageListItem) => {
  selectedPackage.value = pkg
  activeTab.value = 'instruction'
  historyExpanded.value = false
  drawData.value = null
  drawHistory.value = []
  lastUploadedInstrFileName.value = ''
  lastUploadedDrawFileName.value = ''
  await loadCurrentDocuments()
}

const switchTab = async (tab: 'instruction' | 'drawing') => {
  if (activeTab.value === tab || !selectedPackage.value) return
  activeTab.value = tab
  if (tab === 'drawing') currentDrawCategory.value = getFirstAvailableDrawingCategory(selectedPackage.value)
  historyExpanded.value = false
  await loadCurrentDocuments()
}

const handlePreview = () => {
  const url = previewUrl.value
  if (!url) {
    ElMessage.warning('预览地址不可用')
    return
  }
  // .xlsx 文件走内嵌预览
  if (url.endsWith('.xlsx') || url.includes('.xlsx')) {
    xlsxPreviewUrl.value = url
    xlsxPreviewFileType.value = activeTab.value === 'drawing' ? 'drawing' : 'instruction'
    xlsxPreviewFileName.value = `${activeTab.value === 'drawing' ? '图纸' : '指令单'} ${currentData.value?.version || ''}`
    xlsxPreviewStorageId.value = currentData.value?.fileId ?? undefined
    xlsxPreviewFileId.value = currentData.value?.id
    xlsxPreviewConfirmed.value = currentData.value?.isConfirmed === 1
    xlsxPreviewProductCategory.value = activeTab.value === 'drawing' ? currentDrawCategory.value : undefined
    showXlsxPreview.value = true
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const handleDownload = () => {
  if (!selectedPackage.value || !props.order.id) {
    ElMessage.warning('数据包或订单信息不可用')
    return
  }
  const instr = pkgLatestInstr.value
  const drawing = drawData.value
  const data = activeTab.value === 'instruction' ? instr : drawing
  if (!data) {
    ElMessage.warning('文件信息不可用')
    return
  }
  const downloadUrl = data.templateDownloadUrl || ''
  const fileUrl = data.templateFileUrl || ''
  const fileName = activeTab.value === 'instruction'
    ? `指令单模板_v${data.version}.${getExt(fileUrl)}`
    : `图纸模板_v${data.version}.${getExt(fileUrl)}`
  handleDownloadFile(downloadUrl, fileUrl, fileName)
}

const getExt = (url: string): string => url.split('.').pop() || ''

const handleDownloadFile = (downloadUrl: string, fileUrl: string, fileName: string) => {
  const token = Session.get('token') || ''
  const url = downloadUrl || fileUrl
  const a = document.createElement('a')
  a.href = url || ''
  a.download = fileName || ''
  if (token) a.setAttribute('Authorization', token)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const handleHistoryPreview = (item: DocVersionItem) => {
  const url = item.revisedFileUrl || item.templateFileUrl || null
  if (!url) {
    ElMessage.warning('预览地址不可用')
    return
  }
  if (url.endsWith('.xlsx') || url.includes('.xlsx')) {
    xlsxPreviewUrl.value = url
    xlsxPreviewFileType.value = activeTab.value === 'drawing' ? 'drawing' : 'instruction'
    xlsxPreviewFileName.value = `版本 ${item.version}`
    xlsxPreviewStorageId.value = item.revisedFileId || item.templateFileId || undefined
    xlsxPreviewFileId.value = item.id
    xlsxPreviewConfirmed.value = item.isConfirmed === 1
    xlsxPreviewProductCategory.value = activeTab.value === 'drawing' ? currentDrawCategory.value : undefined
    showXlsxPreview.value = true
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const handleHistoryDownload = (item: DocVersionItem) => {
  const downloadUrl = item.templateDownloadUrl || ''
  const fileUrl = item.templateFileUrl || ''
  if (!fileUrl) {
    ElMessage.warning('文件地址不可用')
    return
  }
  const fileName = activeTab.value === 'instruction'
    ? `指令单模板_v${item.version}.${getExt(fileUrl)}`
    : `图纸模板_v${item.version}.${getExt(fileUrl)}`
  handleDownloadFile(downloadUrl, fileUrl, fileName)
}

const onXlsxConfirmSuccess = async () => {
  emit('refresh')
  await loadPackageList()
  await loadCurrentDocuments(true)
}

// ─── 上传修订版：指令单 ──────────────────────────────────────

const triggerInstrUpload = () => {
  if (!canEditDocuments.value) return
  if (!pkgLatestInstr.value) {
    ElMessage.warning('先生成指令单后再上传修订版')
    return
  }
  uploadInstrInputRef.value?.click()
}

const handleInstrUploadFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !canEditDocuments.value || !selectedPackage.value || !pkgLatestInstr.value) return
  const packageId = selectedPackage.value.id
  const formData = new FormData()
  uploadingFile.value = true
  lastUploadedInstrFileName.value = ''
  try {
    const token = Session.get('token') || ''
    formData.append('expectedFileId', pkgLatestInstr.value.fileId || '')
    formData.append('file', file)
    const res = await fetch(
      `/yi/design/workorder/${props.order.id}/package/${selectedPackage.value.id}/instruction/upload-revised/${pkgLatestInstr.value.id}${isCurrentAppendPackage(selectedPackage.value) ? `?batchId=${props.batchId}` : ''}`,
      {
        method: 'POST',
        headers: { 'satoken': token },
        body: formData,
      }
    )
    const data = await res.json()

    if (data?.code === 200 || data?.code === 0) {
      emit('refresh')
      ElMessage.success(`上传成功：${file.name}`)
      await loadPackageList()
      if (selectedPackage.value?.id === packageId && activeTab.value === 'instruction') {
        lastUploadedInstrFileName.value = file.name
        await loadCurrentDocuments(true)
      }

    } else {
      ElMessage.error(data?.msg || '上传失败')
    }
  } catch (err) {
    console.error('upload error', err)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploadingFile.value = false
    if (uploadInstrInputRef.value) {
      uploadInstrInputRef.value.value = ''
    }
  }
}

// ─── 上传修订版：图纸 ──────────────────────────────────────

const triggerDrawUpload = () => {
  if (!canEditDocuments.value) return
  if (!drawData.value) {
    ElMessage.warning('先生成图纸后再上传修订版')
    return
  }
  uploadDrawInputRef.value?.click()
}

const handleDrawUploadFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !canEditDocuments.value || !selectedPackage.value || !drawData.value) return
  const packageId = selectedPackage.value.id
  const category = currentDrawCategory.value

  uploadingDrawFile.value = true
  lastUploadedDrawFileName.value = ''
  try {
    const token = Session.get('token') || ''
    const formData = new FormData()
    formData.append('expectedFileId', drawData.value.fileId || '')
    formData.append('file', file)
    formData.append('productCategory', currentDrawCategory.value)
    const res = await fetch(
      `/yi/design/workorder/${props.order.id}/package/${selectedPackage.value.id}/drawing/upload-revised/${drawData.value.id}?productCategory=${currentDrawCategory.value}${isCurrentAppendPackage(selectedPackage.value) ? `&batchId=${props.batchId}` : ''}`,
      {
        method: 'POST',
        headers: { 'satoken': token },
        body: formData,
      }
    )
    const data = await res.json()

    if (data?.code === 200 || data?.code === 0) {
      emit('refresh')
      ElMessage.success(`上传成功：${file.name}`)
      await loadPackageList()
      if (selectedPackage.value?.id === packageId && activeTab.value === 'drawing' && currentDrawCategory.value === category) {
        lastUploadedDrawFileName.value = file.name
        await loadCurrentDocuments(true)
      }

    } else {
      ElMessage.error(data?.msg || '上传失败')
    }
  } catch (err) {
    console.error('upload error', err)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploadingDrawFile.value = false
    if (uploadDrawInputRef.value) {
      uploadDrawInputRef.value.value = ''
    }
  }
}

// ============================================================
// 监听弹框打开
// ============================================================

watch(() => props.modelValue, async (val) => {
  if (val) {
    packageList.value = []
    selectedPackage.value = null
    pkgLatestInstr.value = null
    drawData.value = null
    instrHistory.value = []
    drawHistory.value = []
    activeTab.value = 'instruction'
    historyExpanded.value = false
    lastUploadedInstrFileName.value = ''
    lastUploadedDrawFileName.value = ''
    // 加载数据包列表
    await loadPackageList()
    // 加载图纸分类选项
    const categoryRes = await getDictOptions('17')
    drawCategoryOptions.value = categoryRes
    if (categoryRes.length > 0) {
      currentDrawCategory.value = categoryRes[0].value
    }
    // 默认选中第一个未确认包，原设计包优先；全部确认后回退到第一个包。
    if (packageList.value.length > 0) {
      await selectPackage(selectDefaultPackage()!)
    }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/assets/style/dialogLeftRight.scss' as *;

@keyframes ddpdFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ─── Loading / Empty ────────────────────────────────────────────────────
.ddpd-loading,
.ddpd-loading-global {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 280px;
  color: var(--text-faint);
  font-size: 13px;

  &__icon {
    animation: spin 0.8s linear infinite;
    color: var(--blue);
  }
}

.ddpd-empty,
.ddpd-empty-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 260px;
  text-align: center;
  flex: 1;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
  }

  &__sub {
    font-size: 12px;
    color: var(--text-faint);
  }

  &__generate {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 20px;
    border: 1.5px solid var(--blue-mid);
    border-radius: 8px;
    background: var(--blue-pale);
    color: var(--blue);
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--blue);
      color: white;
      box-shadow: 0 4px 14px rgba(30, 111, 217, 0.25);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// ─── Drawing Empty ─────────────────────────────────────────────────────
.ddpd-drawing-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 200px;
  text-align: center;
  color: var(--text-muted);
  flex: 1;

  svg {
    color: #b0c8e0;
  }

  span {
    font-size: 13px;
    color: var(--text-muted);
  }
}

// ─── Drawing Category Switch ─────────────────────────────────────────────────
.draw-category-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--surface-raised);
  border-radius: 8px;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.draw-category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s ease;

  &:hover {
    background: var(--surface);
    color: var(--text-mid);
  }

  &--active {
    background: var(--surface);
    color: var(--blue);
    box-shadow: 0 1px 4px rgba(30, 111, 217, 0.1);
  }

  &__count {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    color: inherit;
    background: rgba(0, 0, 0, 0.06);
    padding: 1px 5px;
    border-radius: 4px;
  }
}

// ─── Global Loading ─────────────────────────────────────────────────────
.ddpd-loading-global {
  min-height: 360px;
  font-size: 13px;

  &__icon {
    animation: spin 0.8s linear infinite;
    color: var(--blue);
  }
}
</style>
