<template>
  <list-template
    page-class="processing-center"
    hero-eyebrow="基础数据"
    hero-title="加工中心管理"
    hero-desc="管理生产加工中心基本信息，配置设备ID范围，分配联系人和地址。"
    filter-searchable
    filter-search-placeholder="搜索中心名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建中心"
    @filter-search="searchText = $event"
    @filter-reset="handleReset"
    @filter-create="handleCreate"
    @filter-change="onFilterChange"
  >
    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">加工中心列表</div>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="centers"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            stripe
          >
            <el-table-column label="中心信息" min-width="200">
              <template #default="{ row }">
                <div class="center-info-cell">
                  <div class="center-avatar" :style="{ background: getAvatarBg(row.centerName) }">
                    {{ getAvatarText(row.centerName) }}
                  </div>
                  <div class="center-detail">
                    <div class="role-name">{{ row.centerName }}</div>
                    <div class="role-description">
                      <el-tag size="small" type="primary" effect="plain">{{ row.centerCode }}</el-tag>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="联系人" prop="contactPerson" width="120" align="center">
              <template #default="{ row }">
                <span>{{ row.contactPerson || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="联系电话" prop="contactPhone" width="140" align="center">
              <template #default="{ row }">
                <span>{{ row.contactPhone || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="地址" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ row.address || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="设备ID范围" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.deviceIdRanges" class="range-text">{{ formatDeviceRanges(row.deviceIdRanges) }}</span>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>

            <el-table-column label="连接状态" width="100" align="center">
              <template #default="{ row }">
                <span v-if="row.connectionStatus === 1 || row.connectionStatus === 0" class="status-badge" :class="row.connectionStatus === 1 ? 'status-badge--online' : 'status-badge--offline'">
                  <span class="status-dot" :class="row.connectionStatus === 1 ? 'status-dot--online' : 'status-dot--offline'" />
                  {{ row.connectionStatus === 1 ? '在线' : '离线' }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="创建时间" width="160" align="center">
              <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
            </el-table-column>

            <el-table-column label="操作" width="60" align="center" fixed="right">
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
                      <el-dropdown-item command="toggle" divided>
                        <el-icon><Switch /></el-icon>{{ row.status === 1 ? '禁用' : '启用' }}
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
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedCenter }">
        <div v-if="!selectedCenter" class="detail-empty">
          <el-empty description="请从左侧选择一个加工中心" :image-size="80" />
        </div>

        <el-card v-if="selectedCenter" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">中心详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedCenter.centerName }}</div>
              <el-tag size="small" :type="selectedCenter.status === 1 ? 'success' : 'info'" effect="plain">
                {{ selectedCenter.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>

            <el-tag size="small" effect="plain" type="primary" style="margin: 6px 0 12px;">
              {{ selectedCenter.centerCode }}
            </el-tag>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">联系人</p>
                <p class="detail-value">{{ selectedCenter.contactPerson || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">联系电话</p>
                <p class="detail-value">{{ selectedCenter.contactPhone || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">连接状态</p>
                <p class="detail-value">
                  <span v-if="selectedCenter.connectionStatus === 1 || selectedCenter.connectionStatus === 0" class="status-badge" :class="selectedCenter.connectionStatus === 1 ? 'status-badge--online' : 'status-badge--offline'">
                    <span class="status-dot" :class="selectedCenter.connectionStatus === 1 ? 'status-dot--online' : 'status-dot--offline'" />
                    {{ selectedCenter.connectionStatus === 1 ? '在线' : '离线' }}
                  </span>
                  <span v-else>-</span>
                </p>
              </div>
            </div>

            <div class="detail-item">
              <p class="detail-label">地址</p>
              <p class="detail-value">{{ selectedCenter.address || '-' }}</p>
            </div>

            <div class="detail-item" v-if="selectedCenter.deviceIdRanges">
              <p class="detail-label">设备ID范围</p>
              <p class="detail-value">
                <span v-for="(range, idx) in parseDeviceRanges(selectedCenter.deviceIdRanges)" :key="idx" class="range-tag">
                  {{ range.start }} → {{ range.end }}
                </span>
              </p>
            </div>

            <div class="detail-item" v-if="selectedCenter.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedCenter.remark }}</p>
            </div>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">创建时间</p>
                <p class="detail-value">{{ formatDateTime(selectedCenter.createTime) }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">更新时间</p>
                <p class="detail-value">{{ formatDateTime(selectedCenter.updateTime) }}</p>
              </div>
            </div>

            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedCenter)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑弹窗 -->
  <dialog-modal
    v-model="centerDialogVisible"
    :title="editingCenter ? '编辑加工中心' : '新建加工中心'"
    :subtitle="editingCenter ? '修改加工中心基本信息与设备ID范围' : '配置加工中心基本信息'"
    width="680px"
    :loading="dialogLoading"
    @modal-close="centerDialogVisible = false"
    @modal-confirm="handleSave"
  >
    <div class="dialog-shell">
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="中心编码" prop="centerCode">
              <el-input v-model="form.centerCode" placeholder="请输入中心编码（全局唯一）" :disabled="!!editingCenter" maxlength="32" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="中心名称" prop="centerName">
              <el-input v-model="form.centerName" placeholder="请输入中心名称" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" maxlength="32" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="地址">
              <el-cascader
                v-model="addressPath"
                :options="areaOptions"
                placeholder="选择省市区"
                :props="{ checkStrictly: true, emitPath: true, value: 'name', label: 'name', children: 'children' }"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="设备ID范围" prop="deviceIdRanges" class="range-form-item">
              <template #label>
                <span>设备ID范围</span>
                <el-button link type="primary" size="small" style="margin-left: 8px; font-weight: normal;" @click="handleAddRange">
                  <el-icon><Plus /></el-icon>添加范围
                </el-button>
              </template>
              <div v-if="rangeList.length === 0" class="range-empty">暂未添加范围</div>
              <div v-for="(range, idx) in rangeList" :key="idx" class="range-row">
                <el-input v-model="range.start" placeholder="起始编号" style="width: 120px;" />
                <span class="range-sep">至</span>
                <el-input v-model="range.end" placeholder="结束编号" style="width: 120px;" />
                <el-button link type="danger" @click="rangeList.splice(idx, 1)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
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
import { Edit, Delete, MoreFilled, Switch, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import { fetchAreaTree } from '@/api/hospital'
import {
  listProcessingCenter,
  createProcessingCenter,
  updateProcessingCenter,
  deleteProcessingCenter,
  type ProcessingCenterVO,
} from '@/api/basic'

// ========== Data ==========
const loading = ref(false)
const searchText = ref('')
const filterStatus = ref<number | undefined>()
const selectedCenter = ref<ProcessingCenterVO | null>(null)
const editingCenter = ref<ProcessingCenterVO | null>(null)
const centerDialogVisible = ref(false)
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const tableRef = ref()

const pageInfo = reactive({ currentPage: 1, pageSize: 10, totalCount: 0 })

interface RangeItem { start: string; end: string }
const rangeList = ref<RangeItem[]>([])

const areaOptions = ref<any[]>([])
const addressPath = ref<string[]>([])

const form = reactive({
  centerCode: '',
  centerName: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  status: 1 as 0 | 1,
  remark: '',
})

const centers = ref<ProcessingCenterVO[]>([])
// ========== Computed ==========
const filterSelects = computed(() => [
  {
    modelKey: 'status',
    placeholder: '状态',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
])

// ========== Rules ==========
const validatePhone = (_rule: any, value: string, callback: any) => {
  if (!value) return callback()
  if (!/^1[3-9]\d{9}$/.test(value) && !/^0\d{2,3}-?\d{7,8}$/.test(value)) {
    callback(new Error('请输入正确的电话号码'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  centerCode: [{ required: true, message: '请输入中心编码', trigger: 'blur' }],
  centerName: [{ required: true, message: '请输入中心名称', trigger: 'blur' }],
  contactPhone: [{ validator: validatePhone, trigger: 'blur' }],
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

const parseDeviceRanges = (raw: string): { start: string; end: string }[] => {
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

const formatDateTime = (val: string | number | undefined): string => {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const formatDeviceRanges = (raw: string): string => {
  return parseDeviceRanges(raw).map(r => `${r.start}→${r.end}`).join('，')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await listProcessingCenter({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      centerName: searchText.value.trim() || undefined,
      status: filterStatus.value ?? null,
    })
    centers.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedCenter.value && centers.value.length > 0) {
      selectedCenter.value = centers.value[0]
      tableRef.value?.setCurrentRow(centers.value[0])
    }
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const onFilterChange = (key: string, value: any) => {
  if (key === 'status') filterStatus.value = value === '' ? undefined : value
}

const handleReset = () => {
  searchText.value = ''
  filterStatus.value = undefined
  pageInfo.currentPage = 1
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

const handleCurrentChange = (row: ProcessingCenterVO | null) => {
  selectedCenter.value = row
}

const getRowClassName = ({ row }: { row: ProcessingCenterVO }) =>
  selectedCenter.value?.id === row.id ? 'selected-row' : ''

const handleCommand = (cmd: any, row: ProcessingCenterVO) => {
  switch (cmd) {
    case 'edit': handleEdit(row); break
    case 'toggle': handleToggle(row); break
    case 'delete': handleDelete(row); break
  }
}

const handleCreate = () => {
  editingCenter.value = null
  Object.assign(form, { centerCode: '', centerName: '', contactPerson: '', contactPhone: '', address: '', deviceIdRanges: '', status: 1 as 1, remark: '' })
  addressPath.value = []
  rangeList.value = []
  centerDialogVisible.value = true
}

const handleEdit = (row: ProcessingCenterVO) => {
  editingCenter.value = row
  Object.assign(form, {
    centerCode: row.centerCode,
    centerName: row.centerName,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    address: row.address,
    deviceIdRanges: row.deviceIdRanges,
    status: row.status as 0 | 1,
    remark: row.remark,
  })
  addressPath.value = row.address ? row.address.split(' ') : []
  rangeList.value = parseDeviceRanges(row.deviceIdRanges)
  centerDialogVisible.value = true
}

const handleAddRange = () => {
  rangeList.value.push({ start: '', end: '' })
}

const handleToggle = async (row: ProcessingCenterVO) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}「${row.centerName}」吗？`,
      `确认${action}`,
      { customClass: 'auth-confirm-dialog' }
    )
    await updateProcessingCenter(row.id, { status: row.status === 1 ? 0 : 1 })
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // user cancel
  }
}

const handleDelete = async (row: ProcessingCenterVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除「${row.centerName}」吗？删除后不可恢复。`,
      '删除确认',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await deleteProcessingCenter(row.id)
    ElMessage.success('删除成功')
    if (selectedCenter.value?.id === row.id) selectedCenter.value = null
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
    const payload = {
      ...form,
      address: addressPath.value.join(' '),
      deviceIdRanges: rangeList.value.length > 0 ? JSON.stringify(rangeList.value) : '',
    }
    if (editingCenter.value) {
      await updateProcessingCenter(editingCenter.value.id, payload)
      ElMessage.success('编辑成功')
    } else {
      await createProcessingCenter(payload as any)
      ElMessage.success('新建成功')
    }
    centerDialogVisible.value = false
    loadData()
  } catch {
    // error handled by interceptor
  } finally {
    dialogLoading.value = false
  }
}

// ========== Watchers ==========
watch([searchText, filterStatus], () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})

onMounted(async () => {
  loadData()
  const tree = await fetchAreaTree()
  areaOptions.value = (tree as any)?.data ?? tree
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

.center-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .center-avatar {
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

  .center-detail {
    min-width: 0;
  }
}

.range-text {
  font-size: 13px;
  color: #6366f1;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.text-muted {
  color: var(--el-text-color-placeholder);
}

.roles-list-wrap {
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
}

.range-tag {
  display: inline-block;
  font-size: 11px;
  color: #6366f1;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: #f5f3ff;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 4px;
}

.range-form-item {
  .range-empty {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
    padding: 8px 0;
  }

  .range-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .range-sep {
      color: #909399;
      font-size: 13px;
      flex-shrink: 0;
    }
  }
}

.dialog-shell {
  overflow: auto;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
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
</style>
