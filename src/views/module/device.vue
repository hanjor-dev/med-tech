<template>
  <list-template
    page-class="device"
    hero-eyebrow="基础数据"
    hero-title="设备管理"
    hero-desc="管理生产加工设备，支持设备类型筛选、在线状态监控与任务分配。"
    :stats="stats"
    filter-searchable
    filter-search-placeholder="搜索设备编号或名称..."
    :filter-selects="filterSelects"
    filter-create-label="新增设备"
    @filter-search="searchText = $event"
    @filter-reset="handleReset"
    @filter-create="openDeviceDialog"
    @filter-change="onFilterChange"
  >
    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">设备列表</div>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="devices"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            stripe
          >
            <el-table-column label="设备信息" min-width="180">
              <template #default="{ row }">
                <div class="device-info-cell">
                  <div class="device-avatar" :style="{ background: getAvatarBg(row.deviceName) }">
                    {{ getAvatarText(row.deviceName) }}
                  </div>
                  <div class="device-detail">
                    <div class="device-name-text">{{ row.deviceName }}</div>
                    <div class="device-code-tag">{{ row.deviceId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="设备类型" width="130" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" :type="getDeviceTypeTagType(row.deviceType)">
                  {{ deviceTypeNameMap[row.deviceType] || row.deviceType }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="所属中心" prop="centerName" min-width="120" show-overflow-tooltip align="center">
              <template #default="{ row }">
                <span>{{ row.centerName || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="运行状态" width="100" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="getStateBadgeClass(row.state)">
                  <span class="status-dot" :class="row.state === 0 ? 'status-dot--s0' : 'status-dot--s1'" />
                  {{ row.state === 0 ? row.stateName : row.stateName }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="加工耗时" width="100" align="center">
              <template #default="{ row }">
                <span v-if="row.processingMinutes">{{ row.processingMinutes }}min</span>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>

            <!-- <el-table-column label="最后心跳" prop="lastHeartbeat" width="160" align="center">
              <template #default="{ row }">
                <span v-if="row.lastHeartbeat" class="heartbeat-text">{{ row.lastHeartbeat }}</span>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column> -->

            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
                  <span class="action-trigger">
                    <el-button text :icon="MoreFilled" />
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>编辑
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <page-box
            :currentPage="pageInfo.currentPage"
            :pageSize="pageInfo.pageSize"
            :totalCount="pageInfo.totalCount"
            @current-change="currentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- Detail Panel -->
    <div class="page-body-panel panel-flex-1 ml-10">
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedDevice }">
        <div v-if="!selectedDevice" class="detail-empty">
          <el-empty description="请从左侧选择一个设备" :image-size="80" />
        </div>

        <el-card v-if="selectedDevice" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">设备详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedDevice.deviceName }}</div>
              <el-tag size="small" effect="plain" :type="getDeviceTypeTagType(selectedDevice.deviceType)">
                {{ deviceTypeNameMap[selectedDevice.deviceType] || selectedDevice.deviceType }}
              </el-tag>
            </div>

            <div class="detail-code-tag">{{ selectedDevice.deviceId }}</div>

            <div class="detail-item">
              <p class="detail-label">运行状态</p>
              <p class="detail-value">
                <span class="status-badge" :class="getStateBadgeClass(selectedDevice.state)">
                  <span class="status-dot" :class="selectedDevice.state === 0 ? 'status-dot--s0' : 'status-dot--s1'" />
                  {{ selectedDevice.state === 0 ? '空闲' : '占用' }}
                </span>
              </p>
            </div>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">所属中心</p>
                <p class="detail-value">{{ selectedDevice.centerName || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">加工耗时</p>
                <p class="detail-value">{{ selectedDevice.processingMinutes ? `${selectedDevice.processingMinutes} 分钟` : '-' }}</p>
              </div>
            </div>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">最后心跳</p>
                <p class="detail-value mono">{{ formatDateTime(selectedDevice.lastHeartbeat) }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">创建时间</p>
                <p class="detail-value">{{ formatDateTime(selectedDevice.createTime) }}</p>
              </div>
            </div>

            <div class="detail-item" v-if="selectedDevice.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedDevice.remark }}</p>
            </div>

          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新增设备弹窗 -->
  <dialog-modal
    v-model="deviceDialogVisible"
    :title="editingDevice ? '编辑设备' : '新增设备'"
    subtitle="手动创建非打印类设备（3D打印类设备由 WebSocket 自动注册）"
    width="680px"
    :loading="dialogLoading"
    @modal-close="deviceDialogVisible = false"
    @modal-confirm="handleSave"
  >
    <div class="dialog-shell">
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="deviceId">
              <el-input v-model="form.deviceId" placeholder="请输入设备编号（全局唯一）" maxlength="32" :disabled="!!editingDevice" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="form.deviceName" placeholder="请输入设备名称" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备类型" prop="deviceType">
              <el-select v-model="form.deviceType" placeholder="请选择设备类型" style="width: 100%" :disabled="!!editingDevice">
                <el-option v-for="t in deviceTypeOptions.filter(t => t.value !== 'PRINTER_SLA')" :key="t.value" :label="t.name" :value="t.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属中心" prop="centerId">
              <el-select v-model="form.centerId" placeholder="请选择所属中心" style="width: 100%" clearable>
                <el-option v-for="c in centerOptions" :key="c.id" :label="c.centerName" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="加工耗时（分钟）">
              <el-input-number v-model="form.processingMinutes" :min="0" :max="9999" placeholder="加工耗时" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="256" show-word-limit placeholder="请输入备注（选填）" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Edit, Delete, MoreFilled, Switch, Monitor, CircleCheck, VideoPause, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  listDevice,
  deviceStatistics,
  createDevice,
  updateDevice,
  deleteDevice,
  updateDeviceState,
  listDeviceTypes,
  listAllProcessingCenter,
  type DeviceVO, type DeviceStatisticsVO,
} from '@/api/basic'

// ========== Data ==========
const loading = ref(false)
const searchText = ref('')
const filterCenterId = ref<number | null>(null)
const filterState = ref<number | undefined>()
const filterDeviceType = ref<string | undefined>()
const selectedDevice = ref<DeviceVO | null>(null)
const editingDevice = ref<DeviceVO | null>(null)
const deviceDialogVisible = ref(false)
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const tableRef = ref()

const pageInfo = reactive({ currentPage: 1, pageSize: 10, totalCount: 0 })

const devices = ref<DeviceVO[]>([])
const deviceStats = ref<DeviceStatisticsVO | null>(null)
const deviceTypeOptions = ref<{ value: string; name: string }[]>([])
const centerOptions = ref<{ id: number; centerCode: string; centerName: string }[]>([])

const form = reactive({
  deviceId: '',
  deviceName: '',
  deviceType: '',
  centerId: null as number | null,
  processingMinutes: null as number | null,
  remark: '',
})

const DEVICE_TYPE_TAG: Record<string, string> = {
  PRINTER_SLA: 'primary',
  WASH_CONTAINER: 'success',
  UV_CURING: 'warning',
  ULTRASONIC_CLEANER: 'danger',
  AIR_COMPRESSOR: 'info',
  DRYER: 'warning',
  SEALING_MACHINE: 'info',
}

const deviceTypeNameMap: Record<string, string> = {
  PRINTER_SLA: '光固化3D打印机',
  WASH_CONTAINER: '酒精容器',
  UV_CURING: 'UV固化机',
  ULTRASONIC_CLEANER: '超声清洗机',
  AIR_COMPRESSOR: '空气压缩机',
  DRYER: '烘干设备',
  SEALING_MACHINE: '封口机',
}

// ========== Computed ==========
const filterSelects = computed(() => [
  {
    modelKey: 'deviceType',
    placeholder: '设备类型',
    options: [
      { label: '全部', value: '' },
      ...deviceTypeOptions.value.map(t => ({ label: t.name, value: t.value })),
    ],
  },
  {
    modelKey: 'centerId',
    placeholder: '所属中心',
    options: [
      { label: '全部', value: '' },
      ...centerOptions.value.map(c => ({ label: c.centerName, value: c.id })),
    ],
  },
  {
    modelKey: 'state',
    placeholder: '运行状态',
    options: [
      { label: '全部', value: '' },
      { label: '空闲', value: 0 },
      { label: '占用', value: 1 },
    ],
  },
])

const stats = computed(() => [
  { label: '设备总数', value: deviceStats.value?.total ?? '—', icon: Monitor },
  { label: '空闲设备', value: deviceStats.value?.idle ?? '—', icon: VideoPause },
  { label: '占用设备', value: deviceStats.value?.occupied ?? '—', icon: Loading },
])

// ========== Rules ==========
const rules: FormRules = {
  deviceId: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
}

// ========== Methods ==========
const getAvatarBg = (name: string): string => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c71585']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const getAvatarText = (name: string): string => {
  if (!name) return '?'
  return name.length >= 2 ? name.slice(-2) : name[0]
}

const getDeviceTypeTagType = (deviceType: string): any => DEVICE_TYPE_TAG[deviceType] || 'info'

const getStateBadgeClass = (state: number): string =>
  state === 0 ? 'status-badge--idle' : 'status-badge--busy'

const formatDateTime = (val: string | number | undefined): string => {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await listDevice({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      centerId: filterCenterId.value,
      deviceType: filterDeviceType.value ?? null,
      state: filterState.value ?? null,
      deviceId: searchText.value.trim() || null,
    })
    devices.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedDevice.value && devices.value.length > 0) {
      selectedDevice.value = devices.value[0]
      tableRef.value?.setCurrentRow(devices.value[0])
    }
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try { deviceStats.value = await deviceStatistics() } catch (error) {
    deviceStats.value = null
    console.error('加载设备统计失败', error)
  }
}

const onFilterChange = (key: string, value: any) => {
  if (key === 'deviceType') filterDeviceType.value = value === '' ? undefined : value
  if (key === 'centerId') filterCenterId.value = value === '' ? null : value
  if (key === 'state') filterState.value = value === '' ? undefined : value
}

const handleReset = () => {
  searchText.value = ''
  filterDeviceType.value = undefined
  filterCenterId.value = null
  filterState.value = undefined
  pageInfo.currentPage = 1
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

const handleCurrentChange = (row: DeviceVO | null) => {
  selectedDevice.value = row
}

const getRowClassName = ({ row }: { row: DeviceVO }) =>
  selectedDevice.value?.id === row.id ? 'selected-row' : ''

const handleCommand = (cmd: any, row: DeviceVO) => {
  switch (cmd) {
    case 'edit': handleEdit(row); break
    case 'toggle': handleToggle(row); break
    case 'delete': handleDelete(row); break
  }
}

const handleEdit = (row: DeviceVO) => {
  editingDevice.value = row
  Object.assign(form, {
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    deviceType: row.deviceType,
    centerId: row.centerId,
    processingMinutes: row.processingMinutes,
    remark: row.remark || '',
  })
  deviceDialogVisible.value = true
}

const handleToggle = async (row: DeviceVO) => {
  const targetState = row.state === 0 ? 1 : 0
  const action = targetState === 1 ? '设为占用' : '设为空闲'
  try {
    await ElMessageBox.confirm(
      `确定要将「${row.deviceName}」${action}吗？`,
      `确认${action}`,
      { customClass: 'auth-confirm-dialog' }
    )
    await updateDeviceState(row.id, targetState)
    ElMessage.success('更新成功')
    loadData()
  } catch {
    // user cancel
  }
}

const handleDelete = async (row: DeviceVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备「${row.deviceName}」吗？删除后不可恢复。`,
      '删除确认',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await deleteDevice(row.id)
    ElMessage.success('删除成功')
    if (selectedDevice.value?.id === row.id) selectedDevice.value = null
    loadData()
  } catch {
    // user cancel
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  dialogLoading.value = true
  try {
    if (editingDevice.value) {
      await updateDevice({
        id: editingDevice.value.id,
        deviceName: form.deviceName,
        centerId: form.centerId,
        processingMinutes: form.processingMinutes,
        remark: form.remark,
      })
      ElMessage.success('编辑成功')
    } else {
      await createDevice({
        deviceId: form.deviceId,
        deviceName: form.deviceName,
        deviceType: form.deviceType || undefined,
        centerId: form.centerId,
        processingMinutes: form.processingMinutes,
        remark: form.remark,
      })
      ElMessage.success('新增成功')
    }
    deviceDialogVisible.value = false
    Object.assign(form, { deviceId: '', deviceName: '', deviceType: '', centerId: null, processingMinutes: null, remark: '' })
    editingDevice.value = null
    loadData()
  } catch {
    // error handled by interceptor
  } finally {
    dialogLoading.value = false
  }
}

const openDeviceDialog = () => {
  editingDevice.value = null
  Object.assign(form, { deviceId: '', deviceName: '', deviceType: '', centerId: null, processingMinutes: null, remark: '' })
  deviceDialogVisible.value = true
}

// ========== Watchers ==========
watch([searchText, filterCenterId, filterDeviceType, filterState], () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})

onMounted(async () => {
  loadData()
  loadStatistics()
  const [types, centers] = await Promise.all([listDeviceTypes(), listAllProcessingCenter()])
  deviceTypeOptions.value = types
  centerOptions.value = centers
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

.device-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .device-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .device-detail {
    min-width: 0;
  }
}

.device-name-text {
  font-size: 13px;
  font-weight: 600;
  color: #2f5bff;
}

.device-code-tag {
  display: inline-block;
  font-size: 11px;
  color: #6366f1;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: #f5f3ff;
  padding: 2px 8px;
  border-radius: 4px;
  margin: 6px 0 12px;
}

.detail-code-tag {
  display: inline-block;
  font-size: 11px;
  color: #6366f1;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: #f5f3ff;
  padding: 2px 8px;
  border-radius: 4px;
  margin: 6px 0 12px;
}

.heartbeat-text {
  font-size: 12px;
  color: #909399;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.text-muted {
  color: var(--el-text-color-placeholder);
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge--online {
  background: #e8f8ee;
  color: #67c23a;
  .status-dot--online { background: #67c23a; }
}

.status-badge--offline {
  background: #f4f4f5;
  color: #909399;
  .status-dot--offline { background: #909399; }
}

.status-badge--idle {
  background: #e8f8ee;
  color: #67c23a;
  .status-dot--s0 { background: #67c23a; }
}

.status-badge--busy {
  background: #fdf6ec;
  color: #e6a23c;
  .status-dot--s1 { background: #e6a23c; }
}

.roles-list-wrap {
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
}

.dialog-shell {
  overflow: auto;
}
</style>
