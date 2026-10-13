<template>
  <list-template page-class="legacy-order" hero-eyebrow="Business" hero-title="历史订单"
    hero-desc="查询旧医工宝历史订单归档数据" :filter-inputs="filterInputs" :filter-selects="filterSelects"
    :filter-date-ranges="filterDateRanges" :show-filter-reset="true" :show-filter-create="false"
    @filter-input-change="onFilterInputChange" @filter-input-trigger="onFilterInputTrigger"
    @filter-change="onFilterChange" @filter-reset="resetFilters">
    <template #filter-extra-actions>
      <div class="filter-actions">
        <el-button class="filter-btn" @click="resetFilters">重置</el-button>
        <el-button class="table-btn-secondary" @click="openTaskDrawer">
          <el-icon><List /></el-icon>
          迁移记录
        </el-button>
        <el-button type="primary" class="table-btn-primary" :loading="migrationStarting"
          v-permission="'legacyOrder:Migrate'" @click="handleMigration">
          <el-icon><Refresh /></el-icon>
          增量迁移
        </el-button>
      </div>
    </template>

      <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">历史订单列表</div>
          <div class="header-actions"><el-button link type="primary" size="small" @click="fetchList">刷新</el-button></div>
        </div>
      </template>
      <div class="roles-list-wrap table-scroll-container" ref="tableScrollRef"
        @mousedown="onTableScrollMouseDown" @mousemove="onTableScrollMouseMove"
        @mouseup="onTableScrollMouseUp" @mouseleave="onTableScrollMouseLeave">
        <el-table ref="legacyTableRef" :data="records" v-loading="loading" stripe height="100%" align="center" header-align="center" :header-cell-style="{ background: '#f9fafb', textAlign: 'center' }"
          @sort-change="handleSort">
          <el-table-column type="index" label="序号" width="55" align="center" fixed />
          <el-table-column prop="id" label="订单ID" width="95" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="orderCode" label="订单编号" width="150" show-overflow-tooltip>
            <template #default="{ row }"><span class="order-code-text">{{ formatDetail(row.orderCode) }}</span></template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="130" align="center">
            <template #default="{ row }"><el-tag size="small" effect="plain" type="info">{{ row.status || '—' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="businessTypeName" label="业务类型" width="110" show-overflow-tooltip align="center">
            <template #default="{ row }"><el-tag size="small" type="info" effect="plain">{{ formatDetail(row.businessTypeName) }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="needsPhysicalDeliveryName" label="打印要求" width="100" :formatter="formatCell" />
          <el-table-column prop="orgName" label="所属部门" width="130" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="operatorName" label="业务员" width="110" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="operatorPhone" label="业务员电话" width="130" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="hospitalName" label="医院" width="170" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="areaName" label="地区" width="110" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="hospitalDeptName" label="科室" width="110" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="doctorName" label="医生" width="110" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="doctorPhone" label="医生电话" width="130" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="patientName" label="患者" width="110" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="patientAge" label="患者年龄" width="90" align="center" :formatter="formatCell" />
          <el-table-column prop="patientGenderName" label="性别" width="70" align="center" :formatter="formatCell" />
          <el-table-column label="是否邮寄" width="90" align="center">
            <template #default="{ row }">{{ row.isPostal === 1 ? '是' : row.isPostal === 0 ? '否' : '—' }}</template>
          </el-table-column>
          <el-table-column prop="designerName" label="设计师" width="110" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="rebuildProjectSummary" label="重建项目" min-width="220" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="estimatedCost" label="收费" width="130" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="deliveryDate" label="交付日期" width="170" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="designStartTime" label="设计开始时间" width="170" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="designSubmitTime" label="设计提交时间" width="170" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="productionStartTime" label="生产开始时间" width="170" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="productionEndTime" label="生产结束时间" width="170" show-overflow-tooltip :formatter="formatCell" />
          <el-table-column prop="createTime" label="创建时间" width="170" sortable="custom" :formatter="formatCell" />
          <el-table-column label="操作" width="80" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="openOrderDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <page-box :current-page="pageNum" :page-size="pageSize" :total-count="total"
        @current-change="handlePageChange" @size-change="handlePageSizeChange" />
    </el-card>

    <el-dialog v-model="migrationVisible" title="增量迁移进度" width="520px" :close-on-click-modal="false">
      <el-descriptions v-if="migrationTask" :column="2" border>
        <el-descriptions-item label="状态">{{ taskStatusText }}</el-descriptions-item>
        <el-descriptions-item label="读取">{{ migrationTask.totalRead }}</el-descriptions-item>
        <el-descriptions-item label="新增">{{ migrationTask.insertedCount }}</el-descriptions-item>
        <el-descriptions-item label="更新">{{ migrationTask.updatedCount }}</el-descriptions-item>
        <el-descriptions-item label="跳过">{{ migrationTask.skippedCount }}</el-descriptions-item>
        <el-descriptions-item label="错误">{{ migrationTask.errorCount }}</el-descriptions-item>
      </el-descriptions>
      <el-alert v-if="migrationTask?.errorMessage" :title="migrationTask.errorMessage" type="error" show-icon />
      <template #footer><el-button @click="migrationVisible = false">关闭</el-button></template>
    </el-dialog>

    <el-drawer v-model="taskDrawerVisible" title="迁移记录" size="760px" destroy-on-close>
      <el-table class="legacy-task-table" :data="taskRecords" v-loading="taskLoading" stripe max-height="calc(100vh - 210px)" @row-click="openTaskDetail">
        <el-table-column prop="id" label="编号" width="55" />
        <el-table-column label="任务类型" width="85">
          <template #default="{ row }">{{ row.taskType === 'INCREMENTAL' ? '增量迁移' : (row.taskType || '—') }}</template>
        </el-table-column>
        <el-table-column label="状态" width="75">
          <template #default="{ row }"><el-tag size="small" effect="plain" :type="taskTagType(row.status)">{{ taskStatusTextOf(row.status) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="开始时间" width="170" show-overflow-tooltip>
          <template #default="{ row }">{{ formatTaskTime(row.startedAt) }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="170" show-overflow-tooltip>
          <template #default="{ row }">{{ formatTaskTime(row.finishedAt) }}</template>
        </el-table-column>
        <el-table-column label="读取/新增/更新" width="155">
          <template #default="{ row }">{{ row.totalRead || 0 }} / {{ row.insertedCount || 0 }} / {{ row.updatedCount || 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" width="60" fixed="right">
          <template #default="{ row }"><el-button link type="primary" @click.stop="openTaskDetail(row)">详情</el-button></template>
        </el-table-column>
      </el-table>
      <div class="task-pagination">
        <el-pagination v-model:current-page="taskPageNum" v-model:page-size="taskPageSize" :total="taskTotal"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="loadTasks" @current-change="loadTasks" />
      </div>
    </el-drawer>

    <el-dialog v-model="taskDetailVisible" title="迁移任务详情" width="560px">
      <el-descriptions v-if="taskDetail" :column="2" border>
        <el-descriptions-item label="任务编号">{{ taskDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ taskStatusTextOf(taskDetail.status) }}</el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ formatTaskTime(taskDetail.requestedAt) }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatTaskTime(taskDetail.startedAt) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatTaskTime(taskDetail.finishedAt) }}</el-descriptions-item>
        <el-descriptions-item label="心跳时间">{{ formatTaskTime(taskDetail.heartbeatAt) }}</el-descriptions-item>
        <el-descriptions-item label="读取数量">{{ taskDetail.totalRead || 0 }}</el-descriptions-item>
        <el-descriptions-item label="新增数量">{{ taskDetail.insertedCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="更新数量">{{ taskDetail.updatedCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="跳过数量">{{ taskDetail.skippedCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="错误数量">{{ taskDetail.errorCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="映射版本">{{ taskDetail.mappingVersion || '—' }}</el-descriptions-item>
      </el-descriptions>
      <el-alert v-if="taskDetail?.errorMessage" class="task-error" :title="taskDetail.errorMessage" type="error" show-icon />
    </el-dialog>

    <el-drawer v-model="orderDetailVisible" class="legacy-order-detail-drawer" title="历史订单详情" size="860px" destroy-on-close>
      <div v-if="orderDetail" class="legacy-detail" v-loading="detailLoading">
        <div class="legacy-detail-hero">
          <div>
            <div class="legacy-detail-title">{{ formatDetail(orderDetail.orderCode) }}</div>
            <div class="legacy-detail-subtitle">历史订单归档详情</div>
          </div>
          <el-tag effect="plain" type="info">{{ formatDetail(orderDetail.status) }}</el-tag>
        </div>

        <section class="legacy-detail-section">
          <div class="legacy-detail-section-title">订单概览</div>
          <div class="legacy-detail-grid">
            <div class="legacy-detail-item"><span>业务类型</span><strong>{{ formatDetail(orderDetail.businessTypeName) }}</strong></div>
            <div class="legacy-detail-item"><span>打印要求</span><strong>{{ formatDetail(orderDetail.needsPhysicalDeliveryName) }}</strong></div>
            <div class="legacy-detail-item"><span>所属部门</span><strong>{{ formatDetail(orderDetail.orgName) }}</strong></div>
            <div class="legacy-detail-item"><span>设计师</span><strong>{{ formatDetail(orderDetail.designerName) }}</strong></div>
            <div class="legacy-detail-item"><span>业务员</span><strong>{{ formatDetail(orderDetail.operatorName) }}</strong></div>
            <div class="legacy-detail-item"><span>业务员电话</span><strong>{{ formatDetail(orderDetail.operatorPhone) }}</strong></div>
            <div class="legacy-detail-item"><span>收费</span><strong>{{ formatDetail(orderDetail.estimatedCost) }}</strong></div>
            <div class="legacy-detail-item"><span>是否邮寄</span><strong>{{ orderDetail.isPostal === 1 ? '是' : orderDetail.isPostal === 0 ? '否' : '—' }}</strong></div>
            <div class="legacy-detail-item"><span>邮寄地址</span><strong>{{ formatDetail(orderDetail.postalAddress) }}</strong></div>
            <div class="legacy-detail-item"><span>预计交付日期</span><strong>{{ formatDetail(orderDetail.expectedDeliveryDate) }}</strong></div>
            <div class="legacy-detail-item"><span>交付日期</span><strong>{{ formatDetail(orderDetail.deliveryDate) }}</strong></div>
          </div>
        </section>

        <section class="legacy-detail-section">
          <div class="legacy-detail-section-title">就诊信息</div>
          <div class="legacy-detail-grid">
            <div class="legacy-detail-item"><span>医院</span><strong>{{ formatDetail(orderDetail.hospitalName) }}</strong></div>
            <div class="legacy-detail-item"><span>地区</span><strong>{{ formatDetail(orderDetail.areaName) }}</strong></div>
            <div class="legacy-detail-item"><span>医院科室</span><strong>{{ formatDetail(orderDetail.hospitalDeptName) }}</strong></div>
            <div class="legacy-detail-item"><span>医生</span><strong>{{ formatDetail(orderDetail.doctorName) }}</strong></div>
            <div class="legacy-detail-item"><span>医生电话</span><strong>{{ formatDetail(orderDetail.doctorPhone) }}</strong></div>
            <div class="legacy-detail-item"><span>患者</span><strong>{{ formatDetail(orderDetail.patientName) }}</strong></div>
            <div class="legacy-detail-item"><span>患者年龄</span><strong>{{ formatDetail(orderDetail.patientAge) }}</strong></div>
            <div class="legacy-detail-item"><span>性别</span><strong>{{ formatDetail(orderDetail.patientGenderName) }}</strong></div>
          </div>
        </section>

        <section class="legacy-detail-section">
          <div class="legacy-detail-section-title">项目与进度</div>
          <div class="legacy-detail-block"><span>重建项目</span><p>{{ formatDetail(orderDetail.rebuildProjectSummary) }}</p></div>
          <div class="legacy-detail-timeline">
            <div><i></i><span>创建时间</span><strong>{{ formatDetail(orderDetail.createTime) }}</strong></div>
            <div><i></i><span>设计开始</span><strong>{{ formatDetail(orderDetail.designStartTime) }}</strong></div>
            <div><i></i><span>设计完成</span><strong>{{ formatDetail(orderDetail.designSubmitTime) }}</strong></div>
            <div><i></i><span>生产开始</span><strong>{{ formatDetail(orderDetail.productionStartTime) }}</strong></div>
            <div><i></i><span>生产结束</span><strong>{{ formatDetail(orderDetail.productionEndTime) }}</strong></div>
          </div>
        </section>

        <section class="legacy-detail-section legacy-detail-collapsible">
          <el-collapse v-model="rawInfoExpanded">
            <el-collapse-item name="raw">
              <template #title><div class="legacy-detail-section-title">原始数据与归档信息</div></template>
              <div class="legacy-detail-grid legacy-detail-grid--raw">
                <div class="legacy-detail-item"><span>状态原文</span><strong>{{ formatDetail(orderDetail.statusRaw) }}</strong></div>
                <div class="legacy-detail-item"><span>业务类型原文</span><strong>{{ formatDetail(orderDetail.businessTypeRaw) }}</strong></div>
                <div class="legacy-detail-item"><span>收费原文（od_fee）</span><strong>{{ formatDetail(orderDetail.estimatedCostRaw) }}</strong></div>
                <div class="legacy-detail-item"><span>收费数值解析</span><strong>{{ orderDetail.estimatedCostNumber == null ? '—' : orderDetail.estimatedCostNumber }}</strong></div>
                <div class="legacy-detail-item"><span>映射版本</span><strong>{{ formatDetail(orderDetail.mappingVersion) }}</strong></div>
                <div class="legacy-detail-item"><span>快照时间</span><strong>{{ formatDetail(orderDetail.sourceSnapshotAt) }}</strong></div>
                <div class="legacy-detail-item"><span>归档更新时间</span><strong>{{ formatDetail(orderDetail.archiveUpdatedAt) }}</strong></div>
              </div>
              <div class="legacy-detail-block" v-if="orderDetail.dataEvaluationOpinion"><span>数据评估意见</span><p>{{ formatDetail(orderDetail.dataEvaluationOpinion) }}</p></div>
              <div class="legacy-detail-block legacy-detail-files"><span>关联文件</span><p class="legacy-detail-muted">旧系统文件为历史本地路径，当前未归档关联文件，暂不提供在线预览或下载。</p></div>
            </el-collapse-item>
          </el-collapse>
        </section>
      </div>
    </el-drawer>
  </list-template>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Refresh } from '@element-plus/icons-vue'
import listTemplate from '@/components/listTemplate.vue'
import pageBox from '@/components/pageBox.vue'
import { getLegacyMigrationTask, legacyMigrationTaskPage, legacyOrderDetail, legacyOrderFilterOptions, legacyOrderPage, startLegacyOrderMigration, type LegacyMigrationTaskVO, type LegacyOrderDetailVO, type LegacyOrderVO } from '@/api/legacyOrder'

const loading = ref(false), migrationStarting = ref(false), migrationVisible = ref(false)
const records = ref<LegacyOrderVO[]>([]), total = ref(0), pageNum = ref(1), pageSize = ref(20)
const legacyTableRef = ref<any>(), orderDetailVisible = ref(false), detailLoading = ref(false), orderDetail = ref<LegacyOrderDetailVO>()
const tableScrollRef = ref<HTMLElement>()
const migrationTask = ref<LegacyMigrationTaskVO>(), createRange = ref<string[] | null>(null)
const taskDrawerVisible = ref(false), taskLoading = ref(false), taskRecords = ref<LegacyMigrationTaskVO[]>([])
const taskTotal = ref(0), taskPageNum = ref(1), taskPageSize = ref(20), taskDetailVisible = ref(false), taskDetail = ref<LegacyMigrationTaskVO>()
const rawInfoExpanded = ref<string[]>([])
const statusOptions = ref<{ label: string; value: string }[]>([])
const businessTypeOptions = ref<{ label: string; value: string }[]>([])
const filters = reactive({ keyword: '', status: '', businessType: '', sortField: 'createTime', sortOrder: 'DESC' })
let pollTimer: number | undefined

const filterInputs = [{ modelKey: 'keyword', placeholder: '搜索订单编号、医院、患者、业务员' }]
const filterSelects = computed(() => [
  { modelKey: 'status', placeholder: '状态', options: statusOptions.value },
  { modelKey: 'businessType', placeholder: '业务类型', options: businessTypeOptions.value },
])
const filterDateRanges = [{ modelKey: 'createTime', startPlaceholder: '创建开始', endPlaceholder: '创建结束', valueFormat: 'YYYY-MM-DD HH:mm:ss' }]
const taskStatusText = computed(() => ({ PENDING: '等待执行', RUNNING: '迁移中', SUCCESS: '完成', PARTIAL_SUCCESS: '部分完成', FAILED: '失败' } as Record<string, string>)[migrationTask.value?.status || ''] || migrationTask.value?.status || '—')
const taskStatusTextOf = (status?: string) => ({ PENDING: '等待执行', RUNNING: '迁移中', SUCCESS: '完成', PARTIAL_SUCCESS: '部分完成', FAILED: '失败' } as Record<string, string>)[status || ''] || status || '—'
const taskTagType = (status?: string) => ({ RUNNING: 'warning', SUCCESS: 'success', PARTIAL_SUCCESS: 'warning', FAILED: 'danger' } as Record<string, any>)[status || ''] || 'info'

async function loadFilterOptions() {
  const data = await legacyOrderFilterOptions()
  statusOptions.value = (data.statuses || []).map(value => ({ label: value, value }))
  businessTypeOptions.value = (data.businessTypes || []).map(value => ({ label: value, value }))
}
async function fetchList() {
  loading.value = true
  try {
    const data = await legacyOrderPage({ pageNum: pageNum.value, pageSize: pageSize.value, ...filters,
      createTimeStart: createRange.value?.[0], createTimeEnd: createRange.value?.[1] })
    records.value = data.records || []; total.value = data.total || 0
    resetHorizontalScroll()
  } finally { loading.value = false }
}
function resetHorizontalScroll() {
  nextTick(() => {
    const reset = () => {
      legacyTableRef.value?.setScrollLeft?.(0)
      const scroller = getTableHorizontalScroller()
      if (scroller) scroller.scrollLeft = 0
    }
    reset()
    requestAnimationFrame(() => {
      legacyTableRef.value?.doLayout?.()
      reset()
      requestAnimationFrame(() => {
        reset()
      })
    })
  })
}
function getTableHorizontalScroller() {
  const root = legacyTableRef.value?.$el as HTMLElement | undefined
  return root?.querySelector<HTMLElement>('.el-table__body-wrapper .el-scrollbar__wrap')
    || root?.querySelector<HTMLElement>('.el-scrollbar__wrap')
}
let scrollDragging = false
let scrollStartX = 0
let scrollStartLeft = 0
function onTableScrollMouseDown(event: MouseEvent) {
  const target = event.target as HTMLElement
  const scroller = getTableHorizontalScroller()
  if (!scroller || target.closest('.el-table__header-wrapper, .el-scrollbar__bar, .el-scrollbar__thumb, button, a, .el-button')) return
  scrollDragging = true
  scrollStartX = event.clientX
  scrollStartLeft = scroller.scrollLeft
  if (tableScrollRef.value) tableScrollRef.value.style.cursor = 'grabbing'
}
function onTableScrollMouseMove(event: MouseEvent) {
  const scroller = getTableHorizontalScroller()
  if (!scrollDragging || !scroller) return
  scroller.scrollLeft = scrollStartLeft - (event.clientX - scrollStartX)
}
function onTableScrollMouseUp() {
  if (!scrollDragging) return
  scrollDragging = false
  if (tableScrollRef.value) tableScrollRef.value.style.cursor = ''
}
function onTableScrollMouseLeave() {
  if (!scrollDragging) return
  scrollDragging = false
  if (tableScrollRef.value) tableScrollRef.value.style.cursor = ''
}
async function loadTasks() {
  taskLoading.value = true
  try {
    const data = await legacyMigrationTaskPage({ pageNum: taskPageNum.value, pageSize: taskPageSize.value })
    taskRecords.value = data.records || []
    taskTotal.value = data.total || 0
  } finally { taskLoading.value = false }
}
function openTaskDrawer() { taskDrawerVisible.value = true; taskPageNum.value = 1; loadTasks() }
async function openTaskDetail(row: LegacyMigrationTaskVO) {
  taskDetail.value = await getLegacyMigrationTask(row.id)
  taskDetailVisible.value = true
}
async function openOrderDetail(row: LegacyOrderVO) {
  orderDetailVisible.value = true
  detailLoading.value = true
  orderDetail.value = row as LegacyOrderDetailVO
  try {
    orderDetail.value = await legacyOrderDetail(row.sourceOrderId || row.id)
  } catch (e: any) {
    ElMessage.error(friendlyErrorMessage(e, '历史订单详情加载失败'))
  } finally {
    detailLoading.value = false
  }
}
function formatDetail(value: unknown) {
  return value === null || value === undefined || String(value).trim() === '' ? '—' : String(value)
}
function formatTaskTime(value?: string) {
  if (!value || !String(value).trim()) return '—'
  const text = String(value).trim().replace('T', ' ')
  return text.length >= 19 ? text.slice(0, 19) : text
}
function onFilterInputChange({ modelKey, value }: { modelKey: string; value: string }) { (filters as any)[modelKey] = value || '' }
function formatCell(_row: LegacyOrderVO, _column: any, value: unknown) {
  return value === null || value === undefined || String(value).trim() === '' ? '—' : String(value)
}
function onFilterInputTrigger({ modelKey, value }: { modelKey: string; value: string }) { (filters as any)[modelKey] = value || ''; pageNum.value = 1; fetchList() }
function onFilterChange(key: string, value: any) {
  if (key === 'createTime') createRange.value = value
  else (filters as any)[key] = value || ''
  pageNum.value = 1; fetchList()
}
function handlePageChange(page: number) { pageNum.value = page; fetchList() }
function handlePageSizeChange(size: number) { pageSize.value = size; pageNum.value = 1; fetchList() }
function resetFilters() { Object.assign(filters, { keyword: '', status: '', businessType: '', sortField: 'createTime', sortOrder: 'DESC' }); createRange.value = null; pageNum.value = 1; fetchList() }
function handleSort({ prop, order }: { prop?: string; order?: string }) { filters.sortField = prop === 'createTime' ? 'createTime' : ''; filters.sortOrder = order === 'ascending' ? 'ASC' : 'DESC'; fetchList() }
async function handleMigration() {
  try { await ElMessageBox.confirm('将读取旧医工宝数据并写入历史归档表，不会修改旧系统或新版订单。是否继续？', '确认增量迁移', { type: 'warning' }) } catch { return }
  migrationStarting.value = true
  try { const id = await startLegacyOrderMigration(); migrationVisible.value = true; await pollTask(id) }
  catch (e: any) { ElMessage.error(friendlyErrorMessage(e, '启动迁移失败')) } finally { migrationStarting.value = false }
}
function friendlyErrorMessage(error: any, fallback: string) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('未配置') || message.includes('未启用')) return '旧医工宝数据库尚未配置或未启用，请联系管理员。'
  if (message.includes('订单表') || message.includes('结构') || message.includes('复制已完成')) return '旧医工宝数据结构尚未复制完整，请完成复制后再试。'
  if (message.includes('连接') || message.includes('connect') || message.includes('timeout')) return '旧医工宝数据库连接失败，请联系管理员检查配置。'
  return fallback
}
async function pollTask(id: number) {
  migrationTask.value = await getLegacyMigrationTask(id)
  if (['PENDING', 'RUNNING'].includes(migrationTask.value.status)) pollTimer = window.setTimeout(() => pollTask(id), 1500)
  else {
    if (migrationTask.value.status === 'FAILED') ElMessage.error(migrationTask.value.errorMessage || '历史订单迁移失败，请联系管理员。')
    else if (migrationTask.value.status === 'PARTIAL_SUCCESS') ElMessage.warning('历史订单迁移完成，但有部分订单未成功处理，请查看迁移记录。')
    else ElMessage.success('历史订单迁移任务已完成')
    loadFilterOptions(); fetchList(); if (taskDrawerVisible.value) loadTasks()
  }
}
onMounted(() => { loadFilterOptions(); fetchList(); resetHorizontalScroll() })
onActivated(resetHorizontalScroll)
onBeforeUnmount(() => { if (pollTimer) window.clearTimeout(pollTimer) })
</script>

<style scoped>
.table-scroll-container :deep(.el-table__header-wrapper th) { color: #374151; font-weight: 600; }
.table-scroll-container :deep(.el-table__body tr:hover > td) { background: #f5f7ff !important; }
.order-code-text { color: #2f5bff; font-size: 12.5px; font-weight: 600; letter-spacing: .2px; }
.table-scroll-container :deep(.el-table__fixed-right) { box-shadow: -6px 0 8px -8px rgba(0, 0, 0, .25); }
.task-pagination { display: flex; justify-content: flex-end; padding-top: 16px; }
.legacy-task-table { width: 100%; overflow-x: auto; }
.legacy-task-table :deep(.cell) { white-space: nowrap; word-break: keep-all; }
.legacy-task-table :deep(.el-table__body-wrapper) { overflow-y: auto; }
.task-error { margin-top: 16px; }
:global(.legacy-order-detail-drawer .el-drawer__header) { margin-bottom: 0; padding: 18px 30px; border-bottom: 1px solid #e8edf5; background: #fff; }
:global(.legacy-order-detail-drawer .el-drawer__body) { box-sizing: border-box; padding: 0 30px; background: #f7f9fc; }
.legacy-detail { width: 100%; max-width: 780px; margin: 0 auto; color: #1f2937; padding: 20px 0 34px; }
.legacy-detail-hero { display: flex; align-items: center; justify-content: space-between; min-height: 88px; padding: 20px 22px; border: 1px solid #dce6fb; border-radius: 14px; background: #eef4ff; box-shadow: 0 5px 16px rgba(53, 99, 255, .08); }
.legacy-detail-title { color: #17233c; font-size: 22px; font-weight: 700; word-break: break-all; }
.legacy-detail-subtitle { margin-top: 7px; color: #70809c; font-size: 12px; }
.legacy-detail-section { margin-top: 28px; padding: 0; }
.legacy-detail-section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; color: #1f2d48; font-size: 15px; font-weight: 700; }
.legacy-detail-section-title::before { content: ''; width: 4px; height: 18px; border-radius: 4px; background: #3563ff; box-shadow: 0 0 0 3px #dfe8ff; }
.legacy-detail-collapsible .el-collapse { border-top: 0; border-bottom: 0; }
.legacy-detail-collapsible :deep(.el-collapse-item__header) { height: 54px; padding: 0 16px; border: 1px solid #dce6f5; border-radius: 11px; background: #eef4ff; color: #1f2d48; }
.legacy-detail-collapsible :deep(.el-collapse-item__header.is-active) { border-radius: 11px 11px 0 0; }
.legacy-detail-collapsible :deep(.el-collapse-item__arrow) { color: #3563ff; font-size: 16px; font-weight: 700; }
.legacy-detail-collapsible :deep(.el-collapse-item__wrap) { border: 1px solid #dce6f5; border-top: 0; border-radius: 0 0 11px 11px; background: #fafdff; }
.legacy-detail-collapsible :deep(.el-collapse-item__content) { padding: 16px; }
.legacy-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: hidden; border: 1px solid #e1e8f2; border-radius: 11px; box-shadow: 0 2px 8px rgba(37, 55, 88, .04); }
.legacy-detail-item { min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 11px 16px; border-right: 1px solid #e8edf4; border-bottom: 1px solid #e8edf4; background: #fff; }
.legacy-detail-item:nth-child(2n) { border-right: 0; }
.legacy-detail-item:nth-last-child(-n+2) { border-bottom: 0; }
.legacy-detail-item span, .legacy-detail-block > span { color: #8290a7; font-size: 12px; white-space: nowrap; }
.legacy-detail-item strong { min-width: 0; color: #2b3b59; font-size: 13px; font-weight: 600; text-align: right; word-break: break-all; }
.legacy-detail-grid--raw .legacy-detail-item strong { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.legacy-detail-block { padding: 16px; border: 1px solid #e1e8f2; border-radius: 11px; background: #fff; box-shadow: 0 2px 8px rgba(37, 55, 88, .04); }
.legacy-detail-block + .legacy-detail-block { margin-top: 14px; }
.legacy-detail-files { margin-top: 18px; }
.legacy-detail-block p { margin: 8px 0 0; color: #3d4b63; font-size: 13px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.legacy-detail-muted { color: #9aa4b4 !important; }
.legacy-detail-timeline { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); margin-top: 14px; padding: 20px 12px 8px; border: 1px solid #dfe7f3; border-radius: 11px; background: #fff; box-shadow: 0 2px 8px rgba(37, 55, 88, .04); }
.legacy-detail-timeline > div { position: relative; min-height: 66px; padding: 14px 8px 0; border-top: 2px solid #dfe6f3; }
.legacy-detail-timeline > div i { position: absolute; top: -6px; left: 8px; width: 10px; height: 10px; border: 2px solid #fff; border-radius: 50%; background: #3563ff; box-shadow: 0 0 0 2px #d6e0ff; }
.legacy-detail-timeline span, .legacy-detail-timeline strong { display: block; }
.legacy-detail-timeline span { color: #8b96a8; font-size: 11px; }
.legacy-detail-timeline strong { margin-top: 7px; color: #34435d; font-size: 12px; font-weight: 500; word-break: break-all; }
@media (max-width: 680px) { .legacy-detail-grid { grid-template-columns: 1fr; } .legacy-detail-item, .legacy-detail-item:nth-child(2n) { border-right: 0; } .legacy-detail-item:nth-last-child(-n+2) { border-bottom: 1px solid #edf0f5; } .legacy-detail-item:last-child { border-bottom: 0; } .legacy-detail-timeline { grid-template-columns: 1fr; gap: 8px; } .legacy-detail-timeline > div { border-top: 0; border-left: 2px solid #dfe6f3; padding: 0 0 12px 18px; } .legacy-detail-timeline > div i { top: 0; left: -6px; } }
</style>
