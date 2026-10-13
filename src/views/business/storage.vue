<template>
  <list-template
    ref="listTemplateRef"
    page-class="storage-page"
    hero-eyebrow="Storage"
    hero-title="仓储管理"
    hero-desc="管理产品入库与出库，以流转卡为维度展示库存状态。"
    :stats="[]"
    :filter-inputs="filterInputs"
    :filter-selects="[]"
    :filter-date-ranges="filterDateRanges"
    :show-filter-reset="true"
    :show-filter-create="false"
    @filter-input-change="onFilterInputChange"
    @filter-date-range-change="onFilterChange"
    @filter-reset="handleFilterReset">

    <template #filter-bottom>
      <div class="segment-tabs" role="tablist">
          <button v-for="tab in statusTabs" :key="tab.value"
            class="segment-tabs__btn"
            :class="{ 'is-active': activeStatus === tab.value }"
            @click="switchStatus(tab.value)">
            <el-badge v-if="tab.value !== ''" :value="getStatusCount(tab.value) ?? 0" :hidden="getStatusCount(tab.value) === null" :max="tab.value === 6030 ? 999 : 99" type="danger">
              <span>{{ tab.label }}</span>
            </el-badge>
            <span v-else>{{ tab.label }}</span>
        </button>
      </div>
    </template>

    <div class="page-body-panel">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">流转卡列表</div>
            <span style="font-size:12px;color:#64748b">共 {{ pageTotal }} 条</span>
          </div>
        </template>

        <el-table
          ref="tableRef"
          :data="tableData"
          v-loading="loading"
          highlight-current-row
          :header-cell-style="{ background: '#f9fafb' }"
          row-key="id">

          <el-table-column type="index" label="序号" width="60" align="center" />
          <template v-for="col in visibleColumns" :key="col.field">
            <!-- 加急 -->
            <el-table-column v-if="col.field === 'isUrgent'" :label="col.label" :width="col.width || 65" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isUrgent === 1" size="small" type="danger" effect="plain">加急</el-tag>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <!-- 邮寄 -->
            <el-table-column v-else-if="col.field === 'isPostal'" :label="col.label" :width="col.width || 65" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isPostal === 1" size="small" type="info" effect="plain">邮寄</el-tag>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <!-- 期望交付 -->
            <el-table-column v-else-if="col.field === 'expectedDeliveryDate'" :label="col.label" :width="col.width || 110" align="center">
              <template #default="{ row }">
                <span>{{ row.expectedDeliveryDate?.replace('T', ' ') || '—' }}</span>
              </template>
            </el-table-column>
            <!-- 待入/已入/已出 -->
            <el-table-column v-else-if="col.field === 'warehouseCountSummary'" :label="col.label" :width="col.width || 130" align="center">
              <template #default="{ row }">
                <span style="color:#d97706;font-weight:600">{{ row.products?.filter((p: any) => p.status === 'pending_warehouse_in').length ?? 0 }}</span>
                <span style="color:#cbd5e1"> / </span>
                <span style="color:#059669;font-weight:600">{{ row.products?.filter((p: any) => p.status === 'warehoused').length ?? 0 }}</span>
                <span style="color:#cbd5e1"> / </span>
                <span style="color:#3b82f6;font-weight:600">{{ row.products?.filter((p: any) => p.status === 'warehouse_out').length ?? 0 }}</span>
              </template>
            </el-table-column>
            <!-- 状态 -->
            <el-table-column v-else-if="col.field === 'status'" :label="col.label" :width="col.width || 90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.status" size="small" :style="statusStyle(row.status, row.statusColor)" round>{{ statusLabel(row.status) }}</el-tag>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <!-- 最早入库 -->
            <el-table-column v-else-if="col.field === 'earliestInTime'" :label="col.label" :width="col.width || 160" align="center">
              <template #default="{ row }">
                <span>{{ row.earliestInTime?.replace('T', ' ') || '—' }}</span>
              </template>
            </el-table-column>
            <!-- 最晚出库 -->
            <el-table-column v-else-if="col.field === 'latestOutTime'" :label="col.label" :width="col.width || 160" align="center">
              <template #default="{ row }">
                <span>{{ row.latestOutTime?.replace('T', ' ') || '—' }}</span>
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column v-else-if="col.field === 'action'" :label="col.label" :width="col.width || 140" align="center" :fixed="col.fixed || undefined">
              <template #default="{ row }">
              <el-button
                v-if="row.pendingWarehouseInCount > 0"
                size="small" type="primary" link
                @click="openAction(row, 'in')">入库</el-button>
              <el-button
                v-if="row.warehousedCount > 0"
                size="small" type="warning" link
                @click="openAction(row, 'out')">出库</el-button>
              <el-button
                size="small" type="primary" link
                @click="openDetail(row.recordId)">详情</el-button>
            </template>
            </el-table-column>
            <!-- 通用列 -->
            <el-table-column v-else :prop="col.field" :label="col.label"
              :width="col.width || undefined" :min-width="!col.width ? 120 : undefined"
              :fixed="col.fixed || undefined" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ (row as any)[col.field] != null ? String((row as any)[col.field]) : '—' }}</span>
              </template>
            </el-table-column>
          </template>
        </el-table>

        <page-box
          :currentPage="pageInfo.currentPage"
          :pageSize="pageInfo.pageSize"
          :totalCount="pageTotal"
          @current-change="val => { pageInfo.currentPage = val; loadData() }"
        />
      </el-card>
    </div>
  </list-template>

  <storage-detail-drawer v-model="detailVisible" :record-id="detailId" @refresh="loadData" />
  <storage-detail-drawer v-model="actionVisible" :record-id="actionRecordId" :mode="actionMode" @refresh="loadData" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sortable from 'sortablejs'
import listTemplate from '@/components/listTemplate.vue'
import PageBox from '@/components/pageBox.vue'
import StorageDetailDrawer from './manufactureComponents/storageDetailDrawer.vue'
import {
  getWarehouseList,
  getWarehouseStatistics,
  warehouseColumnConfigGet,
  warehouseColumnConfigSave,
  type WarehouseRecordVO,
  type WarehouseStatisticsVO,
} from '@/api/warehouse'
import type { ProductionColumnItem } from '@/api/production'
import { ElMessage } from 'element-plus'
import { statusLabel, statusStyle } from './statusConfig'
import type { ElTable } from 'element-plus'

const DEFAULT_WAREHOUSE_COLUMNS: ProductionColumnItem[] = [
  { field: 'recordNo', label: '流转卡编号', visible: true, sort: 1, width: 160, fixed: null },
  { field: 'designPackageCode', label: '数据包编号', visible: true, sort: 2, width: 160, fixed: null },
  { field: 'status', label: '状态', visible: true, sort: 3, width: 90, fixed: null },
  { field: 'productionBatchNo', label: '生产批号', visible: true, sort: 4, width: 140, fixed: null },
  { field: 'hospitalName', label: '医院名称', visible: true, sort: 5, width: 130, fixed: null },
  { field: 'hospitalDeptName', label: '科室', visible: true, sort: 6, width: 110, fixed: null },
  { field: 'doctorName', label: '医生', visible: true, sort: 7, width: 90, fixed: null },
  { field: 'patientName', label: '患者', visible: true, sort: 8, width: 90, fixed: null },
  { field: 'isUrgent', label: '加急', visible: true, sort: 9, width: 65, fixed: null },
  { field: 'isPostal', label: '邮寄', visible: true, sort: 10, width: 65, fixed: null },
  { field: 'expectedDeliveryDate', label: '期望交付', visible: true, sort: 11, width: 110, fixed: null },
  { field: 'totalProductCount', label: '产品总数', visible: true, sort: 12, width: 80, fixed: null },
  { field: 'warehouseCountSummary', label: '待入/已入/已出', visible: true, sort: 13, width: 130, fixed: null },
  { field: 'latestOutTime', label: '最晚出库', visible: true, sort: 14, width: 160, fixed: null },
  { field: 'earliestInTime', label: '最早入库', visible: true, sort: 15, width: 160, fixed: null },
  { field: 'orderCode', label: '订单号', visible: true, sort: 16, width: 130, fixed: null },
  { field: 'action', label: '操作', visible: true, sort: 17, width: 140, fixed: 'right' },
]

const listTemplateRef = ref()
const tableRef = ref<InstanceType<typeof ElTable>>()
const loading = ref(false)
const tableData = ref<WarehouseRecordVO[]>([])
const pageTotal = ref(0)
const filterData = reactive({ keyword: '' })
const pageInfo = reactive({ currentPage: 1, pageSize: 10 })
const activeStatus = ref<number | ''>('')
const warehouseStatistics = ref<WarehouseStatisticsVO | null>(null)

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
    filter: 'th:nth-child(-n+2), th:nth-last-child(-n+1)',
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
      const cols = visibleColumns.value.slice()
      const moved = cols.splice(oldIndex - 1, 1)
      cols.splice(newIndex - 1, 0, ...moved)
      const sortMap = new Map(cols.map((c, i) => [c.field, i + 1]))
      allColumns.value = allColumns.value.map(c => ({ ...c, sort: sortMap.get(c.field) ?? c.sort }))
      warehouseColumnConfigSave({ columns: allColumns.value }).catch(() => ElMessage.error('列顺序保存失败'))
    },
  })
}

const loadColumnConfig = async () => {
  if (columnSortable) { columnSortable.destroy(); columnSortable = null }
  try {
    const res = await warehouseColumnConfigGet()
    allColumns.value = (res?.columns ?? []).map((c: ProductionColumnItem) => ({ ...c }))
  } catch {
    allColumns.value = DEFAULT_WAREHOUSE_COLUMNS.map(c => ({ ...c }))
  }
  await nextTick()
  initColumnSortable()
}

// 详情抽屉
const detailVisible = ref(false)
const detailId = ref<number | null>(null)
const openDetail = (id: number) => { detailId.value = id; detailVisible.value = true }

// 操作弹窗
const actionVisible = ref(false)
const actionMode = ref<'in' | 'out'>('in')
const actionRecordId = ref<number | null>(null)

const statusTabs: { label: string; value: number | '' }[] = [
  { label: '全部', value: '' },
  { label: '待入库', value: 6010 },
  { label: '已入库', value: 6020 },
  { label: '已出库', value: 6030 },
]

const filterInputs = computed(() => [
  { modelKey: 'keyword', placeholder: '流转卡编号 / 订单编号 / 产品编号' },
])

const filterDateRanges = computed(() => [
  {
    modelKey: 'warehouseInTime',
    startPlaceholder: '入库时间开始',
    endPlaceholder: '入库时间结束',
    valueFormat: 'YYYY-MM-DD',
  },
])

const buildQuery = () => {
  const inRange = listTemplateRef.value?.filterDateRangesData?.warehouseInTime
  return {
    page: pageInfo.currentPage,
    size: pageInfo.pageSize,
    keyword: filterData.keyword || undefined,
    status: activeStatus.value !== '' ? activeStatus.value : undefined,
    warehouseInTimeStart: inRange?.[0] ? inRange[0] + ' 00:00:00' : undefined,
    warehouseInTimeEnd: inRange?.[1] ? inRange[1] + ' 23:59:59' : undefined,
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getWarehouseList(buildQuery()) as any
    tableData.value = res.records || []
    pageTotal.value = res.total || 0
  } catch (error) {
    ElMessage.error('加载仓储列表失败')
    console.error('加载仓储列表失败', error)
  } finally {
    loading.value = false
  }
}

const statusCountKey: Record<string, keyof WarehouseStatisticsVO> = {
  '': 'total',
  '6010': 'pendingWarehouseIn',
  '6020': 'warehoused',
  '6030': 'warehouseOut',
}

const getStatusCount = (status: number | ''): number | null => {
  const key = statusCountKey[String(status)]
  const count = key ? warehouseStatistics.value?.[key] : undefined
  return count ?? null
}

const fetchStatistics = async () => {
  try {
    warehouseStatistics.value = await getWarehouseStatistics()
  } catch (error) {
    warehouseStatistics.value = null
    console.error('加载仓储统计失败', error)
  }
}

const openAction = (row: WarehouseRecordVO, mode: 'in' | 'out') => {
  actionRecordId.value = row.recordId
  actionMode.value = mode
  actionVisible.value = true
}

const switchStatus = (val: number | '') => {
  activeStatus.value = val
  pageInfo.currentPage = 1
  loadData()
}

const onFilterInputChange = ({ modelKey, value }: { modelKey: string; value: string }) => {
  ;(filterData as any)[modelKey] = value
  pageInfo.currentPage = 1
  loadData()
}

const onFilterChange = () => { pageInfo.currentPage = 1; loadData() }

const handleFilterReset = () => {
  filterData.keyword = ''
  activeStatus.value = ''
  pageInfo.currentPage = 1
  loadData()
}

const route = useRoute()
const router = useRouter()

watch(() => route.query.detailId, (queryDetailId) => {
  if (queryDetailId) {
    openDetail(Number(queryDetailId))
    router.replace({ query: {} })
  }
}, { immediate: true })

onMounted(async () => {
  await loadColumnConfig()
  loadData()
  fetchStatistics()
})

onUnmounted(() => {
  if (columnSortable) { columnSortable.destroy(); columnSortable = null }
})
</script>

<style scoped lang="scss">

/* 产品列表标题 */
.form-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.form-section-num {
  font-size: 10px; font-weight: 900; color: #fff; background: #0891b2;
  letter-spacing: 0.5px; width: 22px; height: 22px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 6px; flex-shrink: 0;
}
.form-section-line { display: block; width: 16px; height: 1px; background: #cbd5e1; }
.form-section-title { font-size: 13px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; flex: 1; }
.form-section-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 6px;
  background: #e0f2fe; border-radius: 20px;
  font-size: 10px; font-weight: 700; color: #0369a1;
}

/* 产品列表 */
.prod-list { max-height: 500px; overflow-y: auto; }
.prod-list__empty { text-align: center; padding: 48px 0; color: #cbd5e1; font-size: 13px; }

.prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }

.prod-card {
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px;
  padding: 12px 14px; transition: all .2s cubic-bezier(.16,1,.3,1);
  display: flex; flex-direction: column;
  &:hover { border-color: #0ea5e9; box-shadow: 0 4px 16px rgba(14,165,233,.1); transform: translateY(-1px); }
}
.prod-card__header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.prod-card__name {
  font-size: 13px; font-weight: 800; color: #1e293b;
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.prod-card__tags { display: flex; gap: 4px; flex-shrink: 0; }

.prod-card__rows {
  display: flex; flex-direction: column; gap: 4px;
  border-top: 1px solid #f1f5f9; padding-top: 8px; flex: 1;
}
.prod-card__row { display: flex; align-items: flex-start; gap: 6px; }
.prod-card__key {
  font-size: 9.5px; font-weight: 800; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .5px;
  white-space: nowrap; flex-shrink: 0; padding-top: 1px;
}
.prod-card__val {
  font-size: 11.5px; color: #475569; line-height: 1.5; word-break: break-all;
  &--mono { font-family: 'JetBrains Mono', 'SF Mono', monospace; }
}

.prod-card__action {
  display: flex; justify-content: flex-end;
  margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9;
}

.wh-pill {
  display: inline-block; font-size: 10.5px; font-weight: 600;
  padding: 2px 7px; border-radius: 5px; white-space: nowrap;
  &--pending { background: #f1f5f9; color: #64748b; }
  &--in { background: #dcfce7; color: #16a34a; }
  &--out { background: #dbeafe; color: #2563eb; }
  &--qc-pass { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  &--qc-fail { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
}
</style>
