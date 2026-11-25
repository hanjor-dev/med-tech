<template>
  <list-template ref="listTemplateRef" page-class="production" hero-eyebrow="Production" hero-title="生产管理"
    hero-desc="管理生产工单全流程，跟踪打印、后处理、入库进度。"
    :filter-inputs="filterInputs" :filter-selects="filterSelects"
    :filter-date-ranges="filterDateRanges" :show-filter-reset="true" :show-filter-create="false"
    @filter-input-change="onFilterInputChange" @filter-change="onFilterChange"
    @filter-reset="handleFilterReset">

    <template #filter-bottom>
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
        <div class="segment-tabs" role="tablist">
          <button v-for="tab in statusTabs" :key="tab.value" class="segment-tabs__btn"
            :class="{ 'is-active': activeStatus === tab.value }"
            @click="switchStatus(tab.value)">
            <el-badge v-if="tab.value !== ''" :value="getStatusCount(tab.value) ?? 0" :hidden="getStatusCount(tab.value) === null" type="danger">
              <span>{{ tab.label }}</span>
            </el-badge>
            <span v-else>{{ tab.label }}</span>
          </button>
        </div>
        <div class="view-tabs">
          <button class="view-tabs__btn" :class="{ 'is-active': activeView === 'record' }" @click="activeView = 'record'">生产管理</button>
          <button class="view-tabs__btn" :class="{ 'is-active': activeView === 'product' }" @click="switchView('product')">产品明细</button>
        </div>
      </div>
    </template>

    <template #filter-extra-actions>
      <el-button @click="handleFilterReset">重置</el-button>
    </template>

    <div class="page-body-panel">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">{{ activeView === 'record' ? '生产列表' : '产品明细' }}</div>
            <div v-if="activeView === 'record'" style="display:flex;gap:12px;align-items:center">
              <el-input v-model="scanInput" placeholder="输入流转卡编号回车打开流转卡"
                style="width:260px" clearable @keyup.enter="handleScanFlowCard" />
              <el-button type="primary" size="small"
                @click="exportDialogVisible = true" v-permission="'manufacture:Export'">
                <el-icon><Download /></el-icon>
                导出生产产品台账
              </el-button>
            </div>
          </div>
        </template>

        <div v-if="activeView === 'product'" class="list-table-wrap">
          <el-table :data="productTableData" v-loading="productLoading" height="100%"
            :header-cell-style="{ background: '#f9fafb' }">
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column label="加急" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isUrgent === 1" size="small" type="danger" effect="light">加急</el-tag>
                <span v-else style="color:#94a3b8">—</span>
              </template>
            </el-table-column>
            <el-table-column label="产品编号" min-width="160">
              <template #default="{ row }">{{ row.productNo || '—' }}</template>
            </el-table-column>
            <el-table-column label="产品名称" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.productName || '—' }}</template>
            </el-table-column>
            <el-table-column label="文件名" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ row.fileName ? row.fileName.replace(/\.[^/.]+$/, '') : '—' }}</template>
            </el-table-column>
            <el-table-column label="流转卡编号" min-width="180">
              <template #default="{ row }">{{ row.recordNo || '—' }}</template>
            </el-table-column>
            <el-table-column label="数据包编号" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.designPackageCode || '—' }}</template>
            </el-table-column>
            <el-table-column label="生产批号" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ row.productionBatchNo || '—' }}</template>
            </el-table-column>
            <el-table-column label="打印设备" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.printDeviceCode || '—' }}</template>
            </el-table-column>
            <el-table-column label="订单类型" width="100" align="center">
              <template #default="{ row }">
                <span>{{ row.orderType === 1 ? '医疗器械' : row.orderType === 2 ? '非医疗器械' : '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="医院名称" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ row.hospitalName || '—' }}</template>
            </el-table-column>
            <el-table-column label="科室名称" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ row.hospitalDeptName || '—' }}</template>
            </el-table-column>
            <el-table-column label="医生姓名" width="90" align="center">
              <template #default="{ row }">{{ row.doctorName || '—' }}</template>
            </el-table-column>
            <el-table-column label="患者姓名" width="90" align="center">
              <template #default="{ row }">{{ row.patientName || '—' }}</template>
            </el-table-column>
            <el-table-column label="期望交付" width="120" align="center">
              <template #default="{ row }">{{ formatDateTime(row.expectedDeliveryDate) || '—' }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" align="center">
              <template #default="{ row }">{{ formatDateTime(row.createTime) || '—' }}</template>
            </el-table-column>
            <el-table-column label="UDI" min-width="160" align="center">
              <template #default="{ row }">
                <div style="display:flex;align-items:center;gap:8px;justify-content:center">
                  <span>{{ row.udiCode || '—' }}</span>
                  <el-button
                    v-if="row.orderType === 1 && row.recordStatus >= 3020 && row.recordStatus !== 9010"
                    size="small"
                    :icon="Edit"
                    circle
                    @click="startEditProductUdi(row)" />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <page-box v-if="activeView === 'product'"
          :currentPage="productPageInfo.currentPage" :pageSize="productPageInfo.pageSize"
          :totalCount="productPageInfo.totalCount"
          @current-change="(v) => { productPageInfo.currentPage = v; fetchProductList() }"
          @size-change="(v) => { productPageInfo.pageSize = v; productPageInfo.currentPage = 1; fetchProductList() }" />

        <div v-if="activeView === 'record'" class="list-table-wrap">
          <el-table ref="tableRef" :data="tableData" v-loading="loading" height="100%"
            :header-cell-style="{ background: '#f9fafb' }">
            <el-table-column type="index" label="序号" width="60" align="center" fixed />
            <template v-for="col in visibleColumns" :key="col.field">
              <el-table-column v-if="col.field === 'isUrgent'" :label="col.label" :width="col.width || 80" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.isUrgent === 1" size="small" type="danger" effect="light">加急</el-tag>
                  <span v-else style="color:#94a3b8">—</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'currentProcessName'" :label="col.label" :width="col.width || 110" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.currentProcessName" size="small" :style="processTagStyle(row.currentProcessName)">
                    {{ row.currentProcessName }}
                  </el-tag>
                  <span v-else style="color:#94a3b8">—</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'statusName'" :label="col.label" :width="col.width || 110" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :style="statusStyle(row.status, row.statusColor)" round>{{ statusLabel(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'orderTypeName'" :label="col.label" :width="col.width || 100" align="center">
                <template #default="{ row }">
                  <span>{{ row.orderType === 1 ? '医疗器械' : row.orderType === 2 ? '非医疗器械' : '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'isPostal'" :label="col.label" :width="col.width || 60" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.isPostal === 1" size="small" type="primary" effect="light">是</el-tag>
                  <span v-else>否</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'printStartTime'" :label="col.label" :width="col.width || 160" align="center">
                <template #default="{ row }">
                  <span>{{ formatDateTime(row.printStartTime) || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'postProcessingEndTime'" :label="col.label" :width="col.width || 160" align="center">
                <template #default="{ row }">
                  <span>{{ formatDateTime(row.postProcessingEndTime) || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'expectedDeliveryDate'" :label="col.label" :width="col.width || 160" align="center">
                <template #default="{ row }">
                  <span>{{ formatDateTime(row.expectedDeliveryDate) || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'createTime'" :label="col.label" :width="col.width || 160" align="center">
                <template #default="{ row }">
                  <span>{{ formatDateTime(row.createTime) || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'action'" :label="col.label" :width="col.width || 80" align="center" fixed="right">
                <template #default="{ row }">
                  <el-dropdown trigger="click" @command="handleCommand($event, row)">
                    <el-button text :icon="MoreFilled" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-if="userInfoStore.hasPermission('manufacture:View')" command="preview">
                          <el-icon><View /></el-icon>详情
                        </el-dropdown-item>
                        <el-dropdown-item v-if="row.status === 3010 && userInfoStore.hasPermission('manufacture:Device')" command="config">
                          <el-icon><Setting /></el-icon>设备配置
                        </el-dropdown-item>
                        <el-dropdown-item v-if="row.status >= 3020 && row.status !== 9010 && userInfoStore.hasPermission('manufacture:Flow')" command="flowcard">
                          <el-icon><Setting /></el-icon>流程卡
                        </el-dropdown-item>
                        <el-dropdown-item v-if="row.status >= 3020 && row.status !== 9010 && userInfoStore.hasPermission('manufacture:QR')" command="qrcode">
                          <el-icon><Grid /></el-icon>流转二维码
                        </el-dropdown-item>
                        <el-dropdown-item v-if="row.status >= 3010 && row.status !== 9010 && userInfoStore.hasPermission('manufacture:ProCard')" command="excel">
                          <el-icon><Download /></el-icon>生成流转卡
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
              <el-table-column v-else :prop="col.field" :label="col.label"
                :width="col.width || undefined" :min-width="!col.width ? 120 : undefined"
                :fixed="col.fixed || undefined" show-overflow-tooltip>
                <template #default="{ row }">
                  <span>{{ (row as any)[col.field] != null ? String((row as any)[col.field]) : '—' }}</span>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>
        <page-box v-if="activeView === 'record'"
          :currentPage="pageInfo.currentPage" :pageSize="pageInfo.pageSize"
          :totalCount="pageInfo.totalCount" @current-change="(v) => { pageInfo.currentPage = v; fetchList() }"
          @size-change="(v) => { pageInfo.pageSize = v; pageInfo.currentPage = 1; fetchList() }" />
      </el-card>
    </div>
  </list-template>

  <production-detail-drawer v-model="detailDrawerVisible" :id="detailId" @close="fetchList" />
  <device-config-dialog v-model="deviceConfigVisible" :id="deviceConfigId" @success="handleDeviceConfigSuccess" />
  <production-flow-card-dialog :key="flowCardId ?? 'flow-card'" v-model="flowCardVisible" :id="flowCardId" @success="handleDeviceConfigSuccess" />
  <product-export-dialog v-model="exportDialogVisible" />

  <el-dialog v-model="qrCodeVisible" title="流转二维码" width="400px" align-center :close-on-click-modal="false">
    <div class="qr-sheet" ref="qrSheetRef">
      <div class="qr-sheet__header" v-if="qrCodeRow">
        <span v-if="qrCodeRow.isUrgent === 1" class="qr-urgent-badge">加急</span>
        <span class="qr-sheet__no">{{ qrCodeRow.recordNo || '—' }}</span>
        <span class="qr-sheet__sub">流转卡编号</span>
      </div>
      <div class="qr-sheet__code">
        <img v-if="qrCodeSrc" :src="qrCodeSrc" class="qr-img" />
        <el-skeleton v-else :rows="5" animated class="qr-skeleton" />
      </div>
      <div class="qr-sheet__info" v-if="qrCodeRow">
        <div class="qr-info-row">
          <span class="qr-info-label">机构</span>
          <span class="qr-info-value">{{ qrCodeRow.orgName || '—' }}</span>
        </div>
        <div class="qr-info-row">
          <span class="qr-info-label">医生</span>
          <span class="qr-info-value">{{ qrCodeRow.doctorName || '—' }}</span>
        </div>
        <div class="qr-info-row">
          <span class="qr-info-label">产品总数</span>
          <span class="qr-info-value qr-info-value--bold">{{ qrCodeRow.totalProductCount ?? '—' }}</span>
        </div>
        <div class="qr-info-row" v-if="qrCodeRow.patientName">
          <span class="qr-info-label">患者</span>
          <span class="qr-info-value">{{ qrCodeRow.patientName }}</span>
        </div>
        <div class="qr-info-row" v-if="qrCodeRow.fileName">
          <span class="qr-info-label">文件名</span>
          <span class="qr-info-value">{{ qrCodeRow.fileName.replace(/\.[^/.]+$/, '') }}</span>
        </div>
        <div class="qr-info-row" v-if="qrCodeRow.expectedDeliveryDate">
          <span class="qr-info-label">期望交付</span>
          <span class="qr-info-value">{{ formatDateTime(qrCodeRow.expectedDeliveryDate) }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="qrCodeVisible = false">关闭</el-button>
      <el-button type="primary" @click="printQrCode">打印</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="udiDialogVisible" title="修改UDI" width="500px" :close-on-click-modal="false">
    <div v-if="editingProduct" style="display:flex;flex-direction:column;padding:8px">
      <div class="udi-info-row">
        <span class="udi-info-label">产品名称</span>
        <span class="udi-info-value">{{ editingProduct.productName || '—' }}</span>
      </div>
      <div class="udi-info-row">
        <span class="udi-info-label">文件名</span>
        <span class="udi-info-value">{{ editingProduct.fileName || '—' }}</span>
      </div>
      <div class="udi-info-row">
        <span class="udi-info-label">流转卡编号</span>
        <span class="udi-info-value">{{ editingProduct.recordNo || '—' }}</span>
      </div>
      <el-form label-width="80px" style="margin-top:8px">
        <el-form-item label="UDI编码">
          <el-input v-model="editingProductUdiCode" placeholder="请输入UDI编码" clearable />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="cancelEditProductUdi">取消</el-button>
      <el-button type="primary" :loading="savingProductUdi" @click="saveProductUdi">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MoreFilled, View, Setting, Grid, Download, Edit } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import listTemplate from '@/components/listTemplate.vue'
import PageBox from '@/components/pageBox.vue'
import ProductionDetailDrawer from './manufactureComponents/productionDetailDrawer.vue'
import DeviceConfigDialog from './manufactureComponents/deviceConfigDialog.vue'
import ProductionFlowCardDialog from './manufactureComponents/productionFlowCardDialog.vue'
import ProductExportDialog from './manufactureComponents/productExportDialog.vue'
import { scanRecord, getProductionRecordDetail, getProductionRecordList, getProductionRecordStatistics, getProductionProductList, generateFlowCardExcel, productionColumnConfigGet, productionColumnConfigSave, batchUpdateUdi, type ProductionRecordVO, type ProductionRecordStatisticsVO, type ProductionProductDetailVO, type ProductionColumnItem } from '@/api/production'
import { statusLabel, statusStyle } from './statusConfig'
import { useUserInfo } from '@/stores/userInfo'
import { formatDateTime } from '@/utils/format'
import type { ElTable } from 'element-plus'

const userInfoStore = useUserInfo()
const loading = ref(false)
const tableData = ref<ProductionRecordVO[]>([])
const tableRef = ref<InstanceType<typeof ElTable>>()
const pageInfo = reactive({ currentPage: 1, pageSize: 20, totalCount: 0 })
const activeStatus = ref<number | ''>('')
const productionStatistics = ref<ProductionRecordStatisticsVO | null>(null)
const activeView = ref<'record' | 'product'>('record')

// 列配置
const allColumns = ref<ProductionColumnItem[]>([])
const visibleColumns = computed(() =>
  [...allColumns.value].filter(c => c.visible).sort((a, b) => {
    if (a.field === 'action') return 1
    if (b.field === 'action') return -1
    return a.sort - b.sort
  })
)
let columnSortable: any = null

const getTableHeaderRow = () => {
  const el = tableRef.value?.$el as HTMLElement
  return el?.querySelector('.el-table__header-wrapper thead tr') as HTMLElement | null
}

const initColumnSortable = () => {
  const headerRow = getTableHeaderRow()
  if (!headerRow || columnSortable) return
  columnSortable = Sortable.create(headerRow, {
    filter: 'th:nth-child(-n+1), th:nth-last-child(-n+1)',
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
      const cols = visibleColumns.value.slice()
      const moved = cols.splice(oldIndex - 1, 1)
      cols.splice(newIndex - 1, 0, ...moved)
      const sortMap = new Map(cols.map((c, i) => [c.field, i + 1]))
      allColumns.value = allColumns.value.map(c => ({ ...c, sort: sortMap.get(c.field) ?? c.sort }))
      productionColumnConfigSave({ columns: allColumns.value }).catch(() => ElMessage.error('列顺序保存失败'))
    },
  })
}

const loadColumnConfig = async () => {
  if (columnSortable) { columnSortable.destroy(); columnSortable = null }
  try {
    const res = await productionColumnConfigGet()
    allColumns.value = (res?.columns ?? []).map((c: ProductionColumnItem) => ({ ...c }))
  } catch {
    allColumns.value = []
  }
  await nextTick()
  initColumnSortable()
}

const productLoading = ref(false)
const productTableData = ref<ProductionProductDetailVO[]>([])
const productPageInfo = reactive({ currentPage: 1, pageSize: 20, totalCount: 0 })

const udiDialogVisible = ref(false)
const editingProduct = ref<ProductionProductDetailVO | null>(null)
const editingProductUdiCode = ref('')
const savingProductUdi = ref(false)


const PROCESS_TAG: Record<string, { bg: string; color: string }> = {
  '打印':  { bg: '#dbeafe', color: '#1d4ed8' },
  '后处理': { bg: '#ffedd5', color: '#c2410c' },
  '质检':  { bg: '#fef9c3', color: '#a16207' },
  '包装':  { bg: '#dcfce7', color: '#15803d' },
  '入库':  { bg: '#f3e8ff', color: '#7e22ce' },
}
const processTagStyle = (name: string) => {
  const key = Object.keys(PROCESS_TAG).find(k => name.includes(k))
  const c = key ? PROCESS_TAG[key] : { bg: '#f1f5f9', color: '#64748b' }
  return { background: c.bg, color: c.color, border: 'none' }
}

const statusTabs = [
  { label: '全部', value: '' as const },
  { label: '待打印', value: 3010 },
  { label: '打印中', value: 3020 },
  { label: '打印完成', value: 3030 },
  { label: '后处理中', value: 4010 },
  { label: '过程检', value: 5010 },
  { label: '包装中', value: 5050 },
]

const listQuery = reactive({
  keyword: '',
  status: '' as number | '',
  orderCreateTimeStart: '', orderCreateTimeEnd: '',
})

const filterInputs = computed(() => [
  { modelKey: 'keyword', placeholder: '搜索订单号、数据包编号、患者姓名...' },
])
const filterSelects = computed(() => [] as any[])
const filterDateRanges = computed(() => [
  { modelKey: 'orderCreateTime', startPlaceholder: '订单创建开始', endPlaceholder: '订单创建结束', valueFormat: 'YYYY-MM-DD HH:mm:ss' },
])

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getProductionRecordList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      keyword: listQuery.keyword || undefined,
      status: listQuery.status !== '' ? listQuery.status : undefined,
      orderCreateTimeStart: listQuery.orderCreateTimeStart || undefined,
      orderCreateTimeEnd: listQuery.orderCreateTimeEnd || undefined,
    })
    const data = (res as any).data ?? res
    tableData.value = data.records ?? []
    pageInfo.totalCount = data.total ?? 0
  } catch (error) {
    ElMessage.error('加载生产列表失败')
    console.error('加载生产列表失败', error)
  } finally {
    loading.value = false
  }
}

const statusCountKey: Record<string, keyof ProductionRecordStatisticsVO> = {
  '': 'total',
  '3010': 'pendingPrint',
  '3020': 'printing',
  '3030': 'printCompleted',
  '4010': 'postProcessing',
  '5010': 'qcInProgress',
  '5050': 'packing',
}

const getStatusCount = (status: number | ''): number | null => {
  const key = statusCountKey[String(status)]
  const count = key ? productionStatistics.value?.[key] : undefined
  return count ?? null
}

const fetchStatistics = async () => {
  try {
    productionStatistics.value = await getProductionRecordStatistics()
  } catch (error) {
    productionStatistics.value = null
    console.error('加载生产统计失败', error)
  }
}

const switchStatus = (status: number | '') => {
  activeStatus.value = status
  listQuery.status = status
  pageInfo.currentPage = 1
  fetchList()
}

const onFilterInputChange = ({ modelKey, value }: { modelKey: string; value: string }) => {
  ;(listQuery as any)[modelKey] = value || ''
  pageInfo.currentPage = 1
  fetchList()
}

const onFilterChange = (key: string, value: any) => {
  if (key === 'orderCreateTime') {
    listQuery.orderCreateTimeStart = value?.[0] || ''
    listQuery.orderCreateTimeEnd = value?.[1] || ''
  } else {
    ;(listQuery as any)[key] = value
  }
  pageInfo.currentPage = 1
  fetchList()
}

const handleFilterReset = () => {
  Object.assign(listQuery, { keyword: '', status: '', orderCreateTimeStart: '', orderCreateTimeEnd: '' })
  activeStatus.value = ''
  pageInfo.currentPage = 1
  fetchList()
}

const detailDrawerVisible = ref(false)
const detailId = ref<number | null>(null)
const deviceConfigVisible = ref(false)
const deviceConfigId = ref<number | null>(null)
const flowCardVisible = ref(false)
const flowCardId = ref<number | null>(null)
const qrCodeVisible = ref(false)
const qrCodeSrc = ref('')
const qrCodeRow = ref<ProductionRecordVO | null>(null)
const exportDialogVisible = ref(false)

const scanInput = ref('')
let scanRequest = 0
const openScannedCard = async (code: string) => {
  const request = ++scanRequest
  if (!code) return
  try {
    const id = /^\d+$/.test(code) ? Number(code) : (await scanRecord(code)).id
    if (request === scanRequest && id) {
      flowCardId.value = id
      flowCardVisible.value = true
    }
  } catch { /* 请求错误由拦截器显示 */ }
}
const handleScanFlowCard = () => {
  openScannedCard(scanInput.value.trim())
  scanInput.value = ''
}

const handleCommand = (cmd: string, row: ProductionRecordVO) => {
  if (cmd === 'preview') {
    detailId.value = row.id
    detailDrawerVisible.value = true
  } else if (cmd === 'config') {
    deviceConfigId.value = row.id
    deviceConfigVisible.value = true
  } else if (cmd === 'flowcard') {
    flowCardId.value = row.id
    flowCardVisible.value = true
  } else if (cmd === 'qrcode') {
    qrCodeSrc.value = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${row.id}`
    qrCodeRow.value = row
    qrCodeVisible.value = true
  } else if (cmd === 'excel') {
    handleGenerateExcel(row)
  }
}

const printQrCode = () => {
  const win = window.open('', '_blank')
  if (!win) return
  const r = qrCodeRow.value
  const rows = r ? [
    ['流转卡编号', r.recordNo || '—'],
    ['机构名称', r.orgName || '—'],
    ['医生姓名', r.doctorName || '—'],
    ['患者姓名', r.patientName || '—'],
    ['产品总数', String(r.totalProductCount ?? '—')],
    ['是否加急', r.isUrgent === 1 ? '<span style="color:#dc2626;font-weight:700">加急</span>' : '否'],
  ].map(([k, v]) => `<tr><td style="padding:5px 8px;color:#666;font-size:12px;border-bottom:1px solid #eee;white-space:nowrap">${k}</td><td style="padding:5px 8px;font-size:12px;font-weight:600;border-bottom:1px solid #eee">${v}</td></tr>`).join('') : ''
  win.document.write(`<!DOCTYPE html><html><head><style>body{margin:0;font-family:sans-serif}@media print{@page{margin:10mm}}</style></head><body><div style="display:inline-flex;flex-direction:column;align-items:center;padding:16px;border:1px solid #e2e8f0;border-radius:8px">${r?.isUrgent===1?'<div style="background:#dc2626;color:#fff;font-size:13px;font-weight:700;padding:3px 14px;border-radius:4px;margin-bottom:8px;letter-spacing:2px">加急</div>':''}<div style="font-size:16px;font-weight:700;margin-bottom:4px">${r?.recordNo||''}</div><div style="font-size:11px;color:#94a3b8;margin-bottom:12px">流转卡编号</div><img src="${qrCodeSrc.value}" style="width:240px;height:240px" onload="window.print();window.close()" /><table style="margin-top:12px;border-collapse:collapse;min-width:240px">${rows}</table></div></body></html>`)
  win.document.close()
}

const handleDeviceConfigSuccess = () => {
  fetchList()
}

const excelLoadingId = ref<number | null>(null)
const handleGenerateExcel = async (row: ProductionRecordVO) => {
  excelLoadingId.value = row.id
  try {
    const res = await generateFlowCardExcel(row.id)
    const data = (res as any).data ?? res
    const blob = await fetch(data.fileUrl).then(r => r.blob())
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = data.fileName
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    excelLoadingId.value = null
  }
}

const fetchProductList = async () => {
  productLoading.value = true
  try {
    const res = await getProductionProductList({
      pageNum: productPageInfo.currentPage,
      pageSize: productPageInfo.pageSize,
      keyword: listQuery.keyword || undefined,
    })
    const data = (res as any).data ?? res
    productTableData.value = data.records ?? []
    productPageInfo.totalCount = data.total ?? 0
  } finally {
    productLoading.value = false
  }
}

const switchView = (view: 'record' | 'product') => {
  activeView.value = view
  if (view === 'product') {
    productPageInfo.currentPage = 1
    fetchProductList()
  }
}

const startEditProductUdi = (row: ProductionProductDetailVO) => {
  editingProduct.value = row
  editingProductUdiCode.value = row.udiCode || ''
  udiDialogVisible.value = true
}

const cancelEditProductUdi = () => {
  udiDialogVisible.value = false
  editingProduct.value = null
  editingProductUdiCode.value = ''
}

const saveProductUdi = async () => {
  if (!editingProduct.value?.productionRecordId) {
    ElMessage.warning('缺少流转卡ID')
    return
  }

  savingProductUdi.value = true
  try {
    await batchUpdateUdi({
      recordId: editingProduct.value.productionRecordId,
      products: [{ productId: editingProduct.value.id, udiCode: editingProductUdiCode.value }]
    })

    editingProduct.value.udiCode = editingProductUdiCode.value
    ElMessage.success('UDI更新成功')
    cancelEditProductUdi()
  } catch {
    ElMessage.error('UDI更新失败')
  } finally {
    savingProductUdi.value = false
  }
}

let scanBuffer = ''
let scanTimer: ReturnType<typeof setTimeout> | null = null
const handleGlobalKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
  if (e.key === 'Enter') {
    openScannedCard(scanBuffer.trim())
    scanBuffer = ''
    return
  }
  if (e.key.length === 1) {
    scanBuffer += e.key
    if (scanTimer) clearTimeout(scanTimer)
    scanTimer = setTimeout(() => { scanBuffer = '' }, 200)
  }
}

const route = useRoute()
const router = useRouter()
watch(() => route.query.detailId, async (queryDetailId) => {
  if (queryDetailId) {
    const id = Number(queryDetailId)
    const action = (route.query.action as string) || 'preview'

    // 等待 DOM 更新，确保子组件已挂载
    await nextTick()

    if (action === 'flowcard') {
      flowCardId.value = id
      flowCardVisible.value = true
    } else if (action === 'config') {
      deviceConfigId.value = id
      deviceConfigVisible.value = true
    } else if (action === 'excel' || action === 'qrcode') {
      const record = await getProductionRecordDetail(id) as unknown as ProductionRecordVO
      handleCommand(action, record)
    } else {
      detailId.value = id
      detailDrawerVisible.value = true
    }

    // 再次等待，确保状态更新完成
    await nextTick()
    router.replace({ query: {} })
  }
}, { immediate: true })

onMounted(async () => {
  await loadColumnConfig()
  fetchList()
  fetchStatistics()
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

.production {
  --primary: #0d9488;
  --primary-pale: #f0fdfa;
  --secondary: #1e3a5f;
  --border: #e2e8f0;
  --text-muted: #64748b;
}

.tab-count {
  display: inline-block;
  min-width: 18px;
  padding: 0 4px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
  background: #e2e8f0;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  margin-left: 4px;
}

.segment-tabs__btn.is-active .tab-count {
  background: var(--primary, #0d9488);
  color: #fff;
}

.code-text {
  font-family: "DM Mono", monospace;
  font-size: 12px;
  font-weight: 600;
  &.primary { color: #0d9488; }
  &.purple { color: #7c3aed; }
}

.text-muted { color: #94a3b8; }

.view-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(59,130,246,.2);
  box-shadow: 0 2px 8px rgba(59,130,246,.12), inset 0 1px 0 rgba(255,255,255,.8);

  &__btn {
    appearance: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #3b82f6;
    padding: 6px 16px;
    border-radius: 999px;
    background: transparent;
    transition: color .18s, background .18s, box-shadow .18s;
    white-space: nowrap;

    &:hover { color: #1d4ed8; background: rgba(255,255,255,.5); }

    &.is-active {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: #fff;
      box-shadow: 0 2px 8px rgba(59,130,246,.35);
    }
  }
}

.product-line {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  line-height: 1.5;
  span:first-child { font-weight: 600; color: #0f172a; }
  span:last-child { color: #94a3b8; font-size: 11px; }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title { font-size: 14px; font-weight: 700; color: #0f172a; }

.list-table-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
  padding-bottom: 55px;

  .el-table {
    --el-table-row-hover-bg-color: #e0e7ff;
    --el-table-current-row-bg-color: #f3f4f6;

    .el-table__body-wrapper {
      overflow-y: auto;
    }
  }
}

.qr-sheet {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 4px;
  margin: 10px;
  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-bottom: 16px;
  }
  &__no {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: .5px;
  }
  &__sub {
    font-size: 11px;
    color: #94a3b8;
  }
  &__code {
    width: 240px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 8px;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,.06);
  }
  &__info {
    margin-top: 16px;
    width: 100%;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
  }
}

.qr-img { width: 224px; height: 224px; display: block; }
.qr-skeleton { width: 200px; }

.qr-urgent-badge {
  background: #dc2626;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 12px;
  border-radius: 4px;
  letter-spacing: 2px;
}

.qr-info-row {
  display: flex;
  align-items: center;
  padding: 7px 4px;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
  &:last-child { border-bottom: none; }
}
.qr-info-label {
  font-size: 12px;
  color: #94a3b8;
  min-width: 56px;
  flex-shrink: 0;
}
.qr-info-value {
  font-size: 13px;
  color: #0f172a;
  font-weight: 500;
  &--bold { font-weight: 700; font-size: 15px; color: #0d9488; }
}

.udi-info-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  gap: 12px;
}
.udi-info-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  min-width: 80px;
  flex-shrink: 0;
}
.udi-info-value {
  font-size: 13px;
  color: #0f172a;
  font-weight: 500;
  flex: 1;
  word-break: break-all;
}
</style>
