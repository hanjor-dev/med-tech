<template>
  <list-template
    page-class="dept"
    hero-eyebrow="系统管理"
    hero-title="部门管理"
    hero-desc="管理系统部门信息，支持按部门类型、部门名称、状态等条件筛选。"
    :stats="stats"
    filter-searchable
    filter-search-placeholder="搜索部门名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建部门"
    @filter-search="searchText = $event"
    @filter-reset="handleReset"
    @filter-create="handleCreate"
    @filter-change="onFilterChange"
  >
    <!-- 部门类型 Tab 切换 -->
    <template #filter-create-btn>
      <el-button type="primary" class="table-btn-primary" @click="handleCreate" v-permission="'department:Add'">
        <el-icon><Plus /></el-icon>新建部门
      </el-button>
    </template>

    <template #filter-bottom>
      <div class="segment-tabs" role="tablist">
        <button class="segment-tabs__btn" :class="{ 'is-active': activeDeptType === '' }"
          @click="switchDeptType('')">
          全部
        </button>
        <button
          v-for="opt in deptTypeOptions"
          :key="opt.value"
          class="segment-tabs__btn"
          :class="{ 'is-active': activeDeptType === opt.value }"
          @click="switchDeptType(opt.value)">
          {{ opt.label }}
        </button>
      </div>
    </template>

    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">部门列表</div>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="paginatedDepts"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            stripe
          >
            <el-table-column label="部门信息">
              <template #default="{ row }">
                <div class="dept-info-cell">
                  <div class="dept-avatar" :style="{ background: getAvatarBg(row.deptName) }">
                    {{ getAvatarText(row.deptName) }}
                  </div>
                  <div class="dept-detail">
                    <div class="role-name">{{ row.deptName }}</div>
                    <div class="role-description">
                      <span class="role-code-tag" style="font-size: 11px">{{ row.deptCode }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="部门类型" align="center" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="row.deptType === '6.1' ? 'primary' : row.deptType === '6.2' ? 'warning' : 'success'" effect="plain">{{ getDeptTypeName(row.deptType) }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="关联机构">
              <template #default="{ row }">
                <template v-if="row.orgs && row.orgs.length > 0">
                  <div class="org-tags-wrap">
                    <el-tooltip
                      v-for="(item, idx) in row.orgs.slice(0, 2)"
                      :key="idx"
                      :content="item.orgName"
                      placement="top"
                    >
                      <el-tag
                        size="small"
                        :type="['primary', 'success', 'warning', 'danger'][idx % 4]"
                        style="margin-right: 4px"
                        class="org-tag-ellipsis"
                      >{{ item.orgName }}</el-tag>
                    </el-tooltip>
                    <el-tag v-if="row.orgs.length > 2" size="small" type="info">
                      +{{ row.orgs.length - 2 }}
                    </el-tag>
                  </div>
                </template>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="部门负责人" width="120">
              <template #default="{ row }">
                <span>{{ row.leaderUser || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="状态" align="center" width="100">
              <template #default="{ row }">
                <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="handleDropdownCommand">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="userInfoStore.hasPermission('department:Edit')" command="edit">
                        <el-icon><Edit /></el-icon>编辑部门
                      </el-dropdown-item>
                      <el-dropdown-item v-if="userInfoStore.hasPermission('department:Status')" command="toggle" :divided="true">
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '停用部门' : '启用部门' }}
                      </el-dropdown-item>
                      <el-dropdown-item v-if="userInfoStore.hasPermission('department:Delete')" command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除部门
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
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedDept }">
        <!-- 空状态 -->
        <div v-if="!selectedDept" class="detail-empty">
          <el-empty description="请从左侧选择一个部门" :image-size="80" />
        </div>

        <!-- 已选部门详情 -->
        <el-card v-if="selectedDept" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">部门详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedDept.deptName }}</div>
              <div class="detail-badges">
                <el-tag size="small" :type="selectedDept.deptType === '6.1' ? 'primary' : selectedDept.deptType === '6.2' ? 'warning' : 'success'" effect="plain">{{ getDeptTypeName(selectedDept.deptType) }}</el-tag>
                <el-tag size="small" :type="selectedDept.status === 1 ? 'success' : 'info'" effect="plain">{{ selectedDept.statusName }}</el-tag>
              </div>
            </div>

            <span class="role-code-tag" style="margin: 6px 0 12px; display: inline-block;">
              {{ selectedDept.deptCode }}
            </span>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">关联机构</p>
                <p class="detail-value">
                  <template v-if="selectedDept.orgs && selectedDept.orgs.length > 0">
                    {{ selectedDept.orgs.map(o => o.orgName).join('、') }}
                  </template>
                  <template v-else>-</template>
                </p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">部门负责人</p>
                <p class="detail-value">{{ selectedDept.leaderUser || '-' }}</p>
              </div>
            </div>
            <div class="detail-item" v-if="selectedDept.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedDept.remark }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value">{{ formatDate(selectedDept.createTime) }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedDept)" v-permission="'department:Edit'">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑部门弹窗 -->
  <dialog-modal
    v-model="deptDialogVisible"
    :title="editingDept ? '编辑部门' : '新建部门'"
    subtitle="配置部门基本信息"
    width="680px"
    @modal-close="handleClose"
    @modal-confirm="handleSave"
  >
    <div class="dialog-shell">
      <el-form :model="deptForm" label-position="top" :rules="deptRules" ref="deptFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="deptForm.deptName" placeholder="请输入部门名称" maxlength="25" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门类型" prop="deptType">
              <el-select v-model="deptForm.deptType" placeholder="请选择部门类型" clearable style="width: 100%" @change="onDeptTypeChange">
                <el-option v-for="opt in deptTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="关联机构">
              <!-- 内部部门：多选，默认生产企业与其他机构互斥 -->
              <el-select
                v-if="deptForm.deptType === '6.1'"
                v-model="deptForm.orgIds"
                multiple
                placeholder="请选择关联机构"
                clearable
                filterable
                style="width: 100%"
                :loading="orgLoading || manufacturerOrgLoading"
                @change="handleInternalOrgChange"
              >
                <el-option
                  v-for="org in internalAllOrgOptions"
                  :key="org.id"
                  :label="org.orgName"
                  :value="org.id"
                >
                  <span>{{ org.orgName }}</span>
                  <span v-if="org.id === manufacturerOrg?.id" style="color: #909399; font-size: 12px; margin-left: 6px">（默认企业）</span>
                </el-option>
              </el-select>
              <!-- 外部部门：可选择经销商 -->
              <el-select
                v-else-if="deptForm.deptType === '6.2'"
                v-model="deptForm.orgIds"
                multiple
                placeholder="请选择经销商"
                clearable
                filterable
                style="width: 100%"
                :loading="orgLoading"
              >
                <el-option
                  v-for="org in filteredOrgOptions"
                  :key="org.id"
                  :label="org.orgName"
                  :value="org.id"
                  :disabled="org.isBound && !currentBoundOrgIds.has(org.id)"
                >
                  <span>{{ org.orgName }}</span>
                  <span v-if="org.isBound && !currentBoundOrgIds.has(org.id)" style="color: #909399; font-size: 12px; margin-left: 6px">（已被其他部门绑定）</span>
                </el-option>
              </el-select>
              <!-- 未选择类型 -->
              <span v-else class="data-scope-text">请先选择部门类型</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门负责人">
              <el-input
                v-model="deptForm.leaderUser"
                placeholder="请输入部门负责人姓名"
                clearable
                maxlength="32"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注说明">
              <el-input
                v-model="deptForm.remark"
                type="textarea"
                :rows="3"
                maxlength="512"
                show-word-limit
                placeholder="请输入备注（选填）"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>

  <!-- 部门详情弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    title="部门详情"
    :subtitle="viewingDept?.deptName || ''"
    width="560px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingDept">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">部门编码</span>
            <span class="detail-value mono">{{ viewingDept.deptCode }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">部门名称</span>
            <span class="detail-value strong">{{ viewingDept.deptName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">部门类型</span>
            <span>{{ getDeptTypeName(viewingDept.deptType) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">部门负责人</span>
            <span class="detail-value">{{ viewingDept.leaderUser || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">关联机构</div>
        <div v-if="viewingDept.orgs && viewingDept.orgs.length > 0" class="detail-org-list">
          <el-tag v-for="(org, idx) in viewingDept.orgs" :key="idx" style="margin: 0 4px 4px 0">{{ org.orgName }}</el-tag>
        </div>
        <span v-else class="detail-value">-</span>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">状态信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="status-badge" :class="viewingDept.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
              {{ viewingDept.statusName }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingDept.createTime) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="viewingDept.remark">
        <div class="detail-section-title">备注说明</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingDept.remark }}
          </span>
        </div>
      </div>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  Plus,
  Edit,
  Delete,
  Switch,
  MoreFilled,
  OfficeBuilding,
  CircleCheck,
  Lock,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import { deptList, deptStatistics, deptDetail, deptCreate, deptUpdate, deptDelete, deptChangeStatus, type DeptVO, type DeptStatisticsVO, type DeptQuery, type CreateDeptDTO, type UpdateDeptDTO } from '@/api/dept'
import { orgAll, orgDetail } from '@/api/org'
import { getConfigDetail,getConfigDetailByKey } from '@/api/param'
import { getDictOptions } from '@/utils/dict'
import { useUserInfo } from '@/stores/userInfo'

export type DeptCommand = 'edit' | 'view' | 'toggle' | 'delete'

// ========== 数据类型 ==========
interface DeptForm {
  deptName: string
  deptType: string | null
  orgIds: number[]
  leaderUser: string
  remark: string
  status?: number
}

// ========== 状态 ==========
const userInfoStore = useUserInfo()
const loading = ref(false)
const orgLoading = ref(false)
const searchText = ref('')
const filterDeptType = ref<string | undefined>()
const activeDeptType = ref<number | string>('')
const filterStatus = ref<number | undefined>()
const selectedDept = ref<DeptVO | null>(null)
const tableRef = ref()

const deptDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const deptFormRef = ref<FormInstance>()
const editingDept = ref<DeptVO | null>(null)
const viewingDept = ref<DeptVO | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

const deptForm = ref<DeptForm>({
  deptName: '',
  deptType: null,
  orgIds: [],
  leaderUser: '',
  remark: '',
})

// ========== 机构下拉选项 ==========
interface OrgOption {
  id: number
  orgName: string
  orgType: string
  isBound?: boolean
}
const orgOptions = ref<OrgOption[]>([])

// ========== 部门类型字典选项 ==========
const deptTypeOptions = ref<{ label: string; value: string | number }[]>([])

const getDeptTypeName = (typeCode: string | number | undefined) => {
  if (!typeCode) return '-'
  return deptTypeOptions.value.find(o => o.value === typeCode)?.label ?? String(typeCode)
}

// ========== 机构下拉筛选（按部门类型、排除已绑定） ==========

// 编辑时已选中的机构ID（这些机构即使是已绑定状态也要保留可选中）
const currentBoundOrgIds = computed(() => {
  if (!editingDept.value) return new Set<number>()
  return new Set((editingDept.value.orgs || []).map(o => o.id))
})

const internalAllOrgOptions = computed(() => {
  const opts = orgOptions.value.filter(o => o.orgType === '1.4')
  if (manufacturerOrg.value && !opts.find(o => o.id === manufacturerOrg.value!.id)) {
    return [manufacturerOrg.value, ...opts]
  }
  return opts
})

const filteredOrgOptions = computed(() =>
  orgOptions.value.filter(org => org.orgType === '1.2')
)

const prevInternalOrgIds = ref<number[]>([])

const handleInternalOrgChange = async (newIds: number[]) => {
  const manufacturerId = manufacturerOrg.value?.id
  if (manufacturerId && newIds.includes(manufacturerId) && newIds.length > 1) {
    const justAdded = newIds.find(id => !prevInternalOrgIds.value.includes(id))
    const isManufacturerJustAdded = justAdded === manufacturerId
    const msg = isManufacturerJustAdded
      ? '选择默认企业将取消其他机构的选择，是否继续？'
      : '选择其他机构将取消默认企业的选择，是否继续？'
    try {
      await ElMessageBox.confirm(msg, '提示', { type: 'warning' })
      deptForm.value.orgIds = isManufacturerJustAdded
        ? [manufacturerId]
        : newIds.filter(id => id !== manufacturerId)
    } catch {
      deptForm.value.orgIds = [...prevInternalOrgIds.value]
      return
    }
  }
  prevInternalOrgIds.value = [...deptForm.value.orgIds]
}

// ========== 内部部门专用：默认生产企业 ==========
const manufacturerOrg = ref<OrgOption | null>(null)
const manufacturerOrgLoading = ref(false)

const loadManufacturerOrg = async () => {
  if (manufacturerOrg.value) return
  manufacturerOrgLoading.value = true
  try {
    const config = await getConfigDetailByKey('manufacturer.org.id') as any
    const orgId = config?.configValue ? Number(config.configValue) : null
    if (orgId) {
      const org = await orgDetail(orgId) as any
      if (org?.id) {
        manufacturerOrg.value = {
          id: org.id,
          orgName: org.orgName,
          orgType: org.orgType,
        }
      }
    }
  } catch {
    // ignore
  } finally {
    manufacturerOrgLoading.value = false
  }
}

const departmentStatistics = ref<DeptStatisticsVO | null>(null)

// ========== 统计数据（Stats） ==========
const stats = computed(() => [
  {
    label: '部门总数',
    value: departmentStatistics.value?.total ?? '—',
    icon: OfficeBuilding,
  },
  {
    label: '企业部门',
    value: departmentStatistics.value?.enterprise ?? '—',
    icon: CircleCheck,
  },
  {
    label: '业务部门',
    value: departmentStatistics.value?.business ?? '—',
    icon: OfficeBuilding,
  },
])

// ========== 筛选项配置 ==========
const filterSelects = [
  {
    modelKey: 'status',
    placeholder: '状态',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
]

const onFilterChange = (key: string, value: any) => {
  if (key === 'deptType') filterDeptType.value = value
  if (key === 'status') filterStatus.value = value
}

const switchDeptType = (val: number | string) => {
  activeDeptType.value = val
  pageInfo.currentPage = 1
  loadData()
}

// ========== 部门列表数据 ==========
const depts = ref<DeptVO[]>([])

// ========== 计算属性 ==========
const paginatedDepts = computed(() => depts.value)

// ========== 生命周期 ==========
onMounted(async () => {
  loadData()
  loadStatistics()
  loadOrgOptions()
  const [deptType, manufacturerOrgData] = await Promise.all([
    getDictOptions('6'),
    loadManufacturerOrg(),
  ])
  deptTypeOptions.value = deptType
})

// ========== 监听搜索和筛选变化 ==========
watch([searchText, filterDeptType, filterStatus], () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})

watch(manufacturerOrg, (val) => {
  if (val && deptForm.value.deptType === '6.1' && !deptForm.value.orgIds.length) {
    deptForm.value.orgIds = [val.id]
  }
})

const onDeptTypeChange = (val: string | null) => {
  deptForm.value.orgIds = val === '6.1' && manufacturerOrg.value ? [manufacturerOrg.value.id] : []
  prevInternalOrgIds.value = [...deptForm.value.orgIds]
}

// ========== 工具函数 ==========
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '--'
  return dateStr.slice(0, 10)
}

const getAvatarBg = (name: string): string => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c71585', '#f08080', '#20b2aa']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getAvatarText = (name: string): string => {
  if (!name) return '?'
  return name.length >= 2 ? name.slice(0, 2) : name[0]
}

// ========== 方法 ==========
const loadData = async () => {
  loading.value = true
  try {
    const query: DeptQuery = {
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      deptType: (activeDeptType.value === '' ? filterDeptType.value : activeDeptType.value) as string | undefined,
      deptName: searchText.value.trim() || undefined,
      status: filterStatus.value,
    }
    const res = await deptList(query)
    depts.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedDept.value && depts.value.length > 0) {
      selectedDept.value = depts.value[0]
      tableRef.value?.setCurrentRow(depts.value[0])
    }
  } catch {
    // error handled by http interceptor
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try { departmentStatistics.value = await deptStatistics() } catch (error) {
    departmentStatistics.value = null
    console.error('加载部门统计失败', error)
  }
}

const loadOrgOptions = async () => {
  orgLoading.value = true
  try {
    const res: any = await orgAll()
    orgOptions.value = (res || []).map((item: any) => ({
      id: item.id,
      orgName: item.orgName,
      orgType: item.orgType,
      isBound: item.isBound,
    }))
  } catch {
    // error handled by http interceptor
  } finally {
    orgLoading.value = false
  }
}

const handleReset = () => {
  searchText.value = ''
  filterDeptType.value = undefined
  activeDeptType.value = ''
  filterStatus.value = undefined
  pageInfo.currentPage = 1
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

const handleCurrentChange = (row: DeptVO | null) => {
  selectedDept.value = row
}

const getRowClassName = ({ row }: { row: DeptVO }) => {
  return selectedDept.value?.id === row.id ? 'selected-row' : ''
}

const handleDropdownCommand = (cmd: any) => {
  const row = selectedDept.value
  if (!row) return
  handleCommand(cmd as DeptCommand, row)
}

const handleCommand = (command: DeptCommand, row: DeptVO) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'view':
      handleView(row)
      break
    case 'toggle':
      handleToggleStatus(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleCreate = () => {
  editingDept.value = null
  deptForm.value = {
    deptName: '',
    deptType: null,
    orgIds: [],
    leaderUser: '',
    status: 1,
    remark: '',
  }
  prevInternalOrgIds.value = []
  manufacturerOrg.value = null
  loadManufacturerOrg()
  deptDialogVisible.value = true
}

const handleEdit = (dept: DeptVO) => {
  editingDept.value = dept
  deptForm.value = {
    deptName: dept.deptName,
    deptType: dept.deptType ?? null,
    orgIds: dept.orgs?.map(o => o.id) ?? [],
    leaderUser: dept.leaderUser || '',
    remark: dept.remark || '',
  }
  prevInternalOrgIds.value = [...deptForm.value.orgIds]
  if (dept.deptType === '6.1') {
    loadManufacturerOrg()
  }
  deptDialogVisible.value = true
}

const handleView = async (dept: DeptVO) => {
  try {
    const res = await deptDetail(dept.id)
    viewingDept.value = res
    detailDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleClose = () => {
  deptDialogVisible.value = false
  editingDept.value = null
}

const handleSave = async () => {
  if (!deptFormRef.value) return
  await deptFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const orgIds = deptForm.value.orgIds

        if (editingDept.value) {
          const data: UpdateDeptDTO = {
            deptName: deptForm.value.deptName,
            deptType: deptForm.value.deptType ?? undefined,
            orgIds: orgIds.length > 0 ? orgIds : undefined,
            leaderUser: deptForm.value.leaderUser || undefined,
            remark: deptForm.value.remark || undefined,
          }
          await deptUpdate(editingDept.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const data: CreateDeptDTO = {
            deptName: deptForm.value.deptName,
            deptType: deptForm.value.deptType!,
            orgIds: orgIds.length > 0 ? orgIds : undefined,
            leaderUser: deptForm.value.leaderUser || undefined,
            remark: deptForm.value.remark || undefined,
          }
          await deptCreate(data)
          ElMessage.success('创建成功')
        }
        deptDialogVisible.value = false
        loadData()
      } catch {
        // error handled by http interceptor
      }
    }
  })
}

const handleDelete = async (dept: DeptVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除部门「${dept.deptName}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await deptDelete(dept.id)
    ElMessage.success('删除成功')
    if (selectedDept.value?.id === dept.id) {
      selectedDept.value = depts.value[0] || null
      if (depts.value[0]) {
        tableRef.value?.setCurrentRow(depts.value[0])
      }
    }
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleToggleStatus = async (dept: DeptVO) => {
  const newStatus = dept.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}部门「${dept.deptName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    await deptChangeStatus(dept.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

// ========== 校验规则 ==========
const deptRules: FormRules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  deptType: [{ required: true, message: '请选择部门类型', trigger: 'change' }],
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── 部门信息列 ──
.dept-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .dept-avatar {
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

  .dept-detail {
    min-width: 0;
  }
}

// ── 机构标签列表 ──
.org-tags-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.org-tag-ellipsis {
  max-width: 170px;
  overflow: hidden;

  :deep(.el-tag__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.detail-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-org-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// ── 内部部门生产企业标签 ──
.manufacturer-org-tag {
  display: flex;
  align-items: center;
}

.dialog-shell {
  max-height: 600px;
  overflow: auto;
}
</style>
