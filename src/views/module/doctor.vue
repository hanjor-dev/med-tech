<template>
  <list-template
    page-class="doctor"
    hero-eyebrow="客户管理"
    hero-title="医生管理"
    hero-desc="维护医院下医生信息，支持按医院、科室、姓名等条件筛选。"
    :stats="stats"
    filter-searchable
    filter-search-placeholder="搜索医生姓名..."
    :filter-selects="filterSelects"
    filter-create-label="新建医生"
    @filter-search="searchText = $event"
    @filter-reset="handleReset"
    @filter-create="handleCreate"
    @filter-change="onFilterChange"
  >
    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">医生列表</div>
          </div>
        </template>

        <div class="roles-list-wrap list-table-wrap" style="flex: 1; min-height: 0; overflow: hidden;">
          <el-table
            ref="tableRef"
            :data="paginatedDoctors"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            height="100%"
          >
            <el-table-column label="医生信息" min-width="200">
              <template #default="{ row }">
                <div class="doctor-info-cell">
                  <div class="doctor-avatar" :style="{ background: getAvatarBg(row.doctorName) }">
                    {{ getAvatarText(row.doctorName) }}
                  </div>
                  <div class="doctor-detail">
                    <div class="role-name">{{ row.doctorName }}</div>
                    <div class="role-description">
                      <span class="role-code-tag" style="font-size: 11px">{{ row.doctorPhone || '-' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="所属医院" prop="hospitalName" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="data-scope-text">{{ row.hospitalName || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="所属科室" prop="hospitalDeptName" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="data-scope-text">{{ row.hospitalDeptName || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="关联订单" width="100" align="center">
              <template #default="{ row }">
                <span class="order-count-tag">{{ row.orderCount ?? 0 }}</span>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd: any) => handleCommand(cmd, row)">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>编辑医生
                      </el-dropdown-item>
                      <el-dropdown-item command="view">
                        <el-icon><View /></el-icon>查看详情
                      </el-dropdown-item>
                      <el-dropdown-item command="toggle" :divided="true">
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '停用医生' : '启用医生' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除医生
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <page-box
          :currentPage="pageInfo.currentPage"
          :pageSize="pageInfo.pageSize"
          :totalCount="pageInfo.totalCount"
          @current-change="currentChange"
        />
      </el-card>
    </div>

    <!-- Detail Panel -->
    <div class="page-body-panel panel-flex-1 ml-10">
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedDoctor }">
        <!-- 空状态 -->
        <div v-if="!selectedDoctor" class="detail-empty">
          <el-empty description="请从左侧选择一位医生" :image-size="80" />
        </div>

        <!-- 已选医生详情 -->
        <el-card v-if="selectedDoctor" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">医生详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedDoctor.doctorName }}</div>
              <span class="status-badge"
                :class="selectedDoctor.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedDoctor.statusName }}
              </span>
            </div>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">所属医院</p>
                <p class="detail-value">{{ selectedDoctor.hospitalName || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">所属科室</p>
                <p class="detail-value">{{ selectedDoctor.hospitalDeptName || '-' }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">联系电话</p>
                <p class="detail-value mono">{{ selectedDoctor.doctorPhone || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">关联订单</p>
                <p class="detail-value">{{ selectedDoctor.orderCount ?? 0 }} 单</p>
              </div>
            </div>
            <div class="detail-item" v-if="selectedDoctor.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedDoctor.remark }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value mono">{{ formatDate(selectedDoctor.createTime) }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedDoctor)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button style="flex: 1" @click="handleView(selectedDoctor)">
                <el-icon><View /></el-icon>查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑医生弹窗 -->
  <dialog-modal
    v-model="doctorDialogVisible"
    :title="editingDoctor ? '编辑医生' : '新建医生'"
    subtitle="配置医生基本信息"
    width="560px"
    @modal-close="handleClose"
    @modal-confirm="handleSave"
  >
    <div class="dialog-shell">
      <el-form :model="doctorForm" label-position="top" :rules="doctorRules" ref="doctorFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="医生姓名" prop="doctorName">
              <el-input v-model="doctorForm.doctorName" placeholder="请输入医生姓名" clearable maxlength="32" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="doctorForm.doctorPhone" placeholder="请输入联系电话" clearable maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属医院" prop="hospitalId">
              <el-select
                v-model="doctorForm.hospitalId"
                placeholder="请选择医院"
                clearable
                filterable
                style="width: 100%"
                @change="handleFormHospitalChange"
              >
                <el-option v-for="h in hospitalSelectOptions" :key="h.id" :label="h.name" :value="h.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属科室">
              <el-select
                v-model="doctorForm.hospitalDeptId"
                placeholder="请选择科室"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option v-for="d in formFilteredDeptOptions" :key="d.id" :label="d.name" :value="d.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="doctorForm.remark"
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

  <!-- 医生详情弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    title="医生详情"
    :subtitle="viewingDoctor?.doctorName || ''"
    width="560px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingDoctor">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">医生姓名</span>
            <span class="detail-value strong">{{ viewingDoctor.doctorName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话</span>
            <span class="detail-value mono">{{ viewingDoctor.doctorPhone || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">所属医院</span>
            <span class="detail-value">{{ viewingDoctor.hospitalName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">所属科室</span>
            <span class="detail-value">{{ viewingDoctor.hospitalDeptName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">关联订单</span>
            <span class="detail-value">{{ viewingDoctor.orderCount ?? 0 }} 单</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="status-badge" :class="viewingDoctor.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
              {{ viewingDoctor.statusName }}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="viewingDoctor.remark">
        <div class="detail-section-title">备注说明</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingDoctor.remark }}
          </span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">时间记录</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingDoctor.createTime) }}</span>
          </div>
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
  View,
  MoreFilled,
  OfficeBuilding,
  User,
  CircleCheck,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  doctorPage,
  doctorDetail,
  doctorCreate,
  doctorUpdate,
  doctorDelete,
  doctorChangeStatus,
  type DoctorVO,
  type CreateDoctorDTO,
  type UpdateDoctorDTO,
} from '@/api/doctor'
import { hospitalOptions as hospitalOptionsAPI } from '@/api/hospital'
import { hospitalDeptList as hospitalDeptListAPI } from '@/api/hospitalDept'

export type DoctorCommand = 'edit' | 'view' | 'toggle' | 'delete'

// ========== 数据类型 ==========
interface DoctorForm {
  doctorName: string
  doctorPhone: string
  hospitalId: number | null
  hospitalDeptId: number | null
  remark: string
}

// ========== 状态 ==========
const loading = ref(false)
const searchText = ref('')
const filterHospitalId = ref<number | undefined>()
const filterHospitalDeptId = ref<number | undefined>()
const filterStatus = ref<number | undefined>()
const selectedDoctor = ref<DoctorVO | null>(null)
const tableRef = ref()

const doctorDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const doctorFormRef = ref<FormInstance>()
const editingDoctor = ref<DoctorVO | null>(null)
const viewingDoctor = ref<DoctorVO | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

const doctorForm = ref<DoctorForm>({
  doctorName: '',
  doctorPhone: '',
  hospitalId: null,
  hospitalDeptId: null,
  remark: '',
})

// ========== 医院/科室下拉选项 ==========
interface HospitalSelectOption { id: number; name: string }
interface DeptSelectOption { id: number; name: string; hospitalId: number }

const hospitalSelectOptions = ref<HospitalSelectOption[]>([])
const deptSelectOptions = ref<DeptSelectOption[]>([])

const formFilteredDeptOptions = computed(() => {
  return deptSelectOptions.value
})

// ========== 医生列表数据 ==========
const doctors = ref<DoctorVO[]>([])

// ========== 统计数据（Stats） ==========
const stats = computed(() => [
  {
    label: '医生总数',
    value: doctors.value.length.toString(),
    icon: User,
  },
  {
    label: '合作医院',
    value: new Set(doctors.value.map(d => d.hospitalId)).size.toString(),
    icon: OfficeBuilding,
  },
  {
    label: '正常医生',
    value: doctors.value.filter(d => d.status === 1).length.toString(),
    icon: CircleCheck,
  },
  {
    label: '本月新增',
    value: doctors.value.filter(d => {
      const cd = new Date(d.createTime)
      const now = new Date()
      return cd.getMonth() === now.getMonth() && cd.getFullYear() === now.getFullYear()
    }).length.toString(),
    icon: Plus,
  },
])

// ========== 筛选项配置 ==========
const filterSelects = computed(() => [
  {
    modelKey: 'hospitalId',
    placeholder: '所属医院',
    options: hospitalSelectOptions.value.map(h => ({ label: h.name, value: h.id })),
  },
  {
    modelKey: 'hospitalDeptId',
    placeholder: '所属科室',
    options: deptSelectOptions.value.map(d => ({ label: d.name, value: d.id })),
  },
  {
    modelKey: 'status',
    placeholder: '状态',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
])

const onFilterChange = (key: string, value: any) => {
  if (key === 'hospitalId') filterHospitalId.value = value
  if (key === 'hospitalDeptId') filterHospitalDeptId.value = value
  if (key === 'status') filterStatus.value = value
}

// ========== 计算属性 ==========
const paginatedDoctors = computed(() => doctors.value)

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
  loadHospitalOptions()
  loadDeptOptions()
})

// ========== 监听搜索和筛选变化 ==========
watch([searchText, filterHospitalId, filterHospitalDeptId, filterStatus], () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})

// ========== 工具函数 ==========
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
    const res = await doctorPage({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      doctorName: searchText.value.trim() || undefined,
      hospitalId: filterHospitalId.value,
      hospitalDeptId: filterHospitalDeptId.value,
      status: filterStatus.value,
    })
    doctors.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedDoctor.value && doctors.value.length > 0) {
      selectedDoctor.value = doctors.value[0]
      tableRef.value?.setCurrentRow(doctors.value[0])
    }
  } catch {
    // error handled by http interceptor
  } finally {
    loading.value = false
  }
}

const loadHospitalOptions = async () => {
  try {
    const res: any = await hospitalOptionsAPI()
    hospitalSelectOptions.value = (res || []).map((h: any) => ({ id: h.id, name: h.hospitalName }))
  } catch {
    // error handled by http interceptor
  }
}

const loadDeptOptions = async () => {
  try {
    const res: any = await hospitalDeptListAPI({ status: 1 })
    deptSelectOptions.value = (res || []).map((d: any) => ({
      id: d.id,
      name: d.hospitalDeptName,
      hospitalId: d.hospitalId,
    }))
  } catch {
    // error handled by http interceptor
  }
}

const handleReset = () => {
  searchText.value = ''
  filterHospitalId.value = undefined
  filterHospitalDeptId.value = undefined
  filterStatus.value = undefined
  pageInfo.currentPage = 1
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

const handleCurrentChange = (row: DoctorVO | null) => {
  selectedDoctor.value = row
}

const getRowClassName = ({ row }: { row: DoctorVO }) => {
  return selectedDoctor.value?.id === row.id ? 'selected-row' : ''
}

const handleCommand = (command: DoctorCommand, row: DoctorVO) => {
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
  editingDoctor.value = null
  doctorForm.value = {
    doctorName: '',
    doctorPhone: '',
    hospitalId: null,
    hospitalDeptId: null,
    remark: '',
  }
  doctorDialogVisible.value = true
}

const handleEdit = (doctor: DoctorVO) => {
  editingDoctor.value = doctor
  doctorForm.value = {
    doctorName: doctor.doctorName,
    doctorPhone: doctor.doctorPhone || '',
    hospitalId: doctor.hospitalId,
    hospitalDeptId: doctor.hospitalDeptId || null,
    remark: doctor.remark || '',
  }
  doctorDialogVisible.value = true
}

const handleView = async (doctor: DoctorVO) => {
  try {
    const res = await doctorDetail(doctor.id)
    viewingDoctor.value = res
    detailDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleClose = () => {
  doctorDialogVisible.value = false
  editingDoctor.value = null
}

const handleSave = async () => {
  if (!doctorFormRef.value) return
  await doctorFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingDoctor.value) {
          const data: UpdateDoctorDTO = {
            doctorName: doctorForm.value.doctorName,
            doctorPhone: doctorForm.value.doctorPhone || undefined,
            hospitalDeptId: doctorForm.value.hospitalDeptId ?? undefined,
            remark: doctorForm.value.remark || undefined,
          }
          await doctorUpdate(editingDoctor.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const data: CreateDoctorDTO = {
            doctorName: doctorForm.value.doctorName,
            doctorPhone: doctorForm.value.doctorPhone || undefined,
            hospitalId: doctorForm.value.hospitalId!,
            hospitalDeptId: doctorForm.value.hospitalDeptId ?? undefined,
            remark: doctorForm.value.remark || undefined,
          }
          await doctorCreate(data)
          ElMessage.success('创建成功')
        }
        doctorDialogVisible.value = false
        loadData()
      } catch {
        // error handled by http interceptor
      }
    }
  })
}

const handleDelete = async (doctor: DoctorVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除医生「${doctor.doctorName}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await doctorDelete(doctor.id)
    ElMessage.success('删除成功')
    if (selectedDoctor.value?.id === doctor.id) {
      selectedDoctor.value = doctors.value[0] || null
      if (doctors.value[0]) {
        tableRef.value?.setCurrentRow(doctors.value[0])
      }
    }
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleToggleStatus = async (doctor: DoctorVO) => {
  const newStatus = doctor.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}医生「${doctor.doctorName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    await doctorChangeStatus(doctor.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleFormHospitalChange = () => {
  doctorForm.value.hospitalDeptId = null
}

// ========== 校验规则 ==========
const doctorRules: FormRules = {
  doctorName: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  hospitalId: [{ required: true, message: '请选择所属医院', trigger: 'change' }],
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── 医生信息列 ──
.doctor-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .doctor-avatar {
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

  .doctor-detail {
    min-width: 0;
  }
}

.order-count-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
}

// ── 详情弹窗内部样式 ──
.doctor-detail-dialog-shell {
  padding: 4px 0;
}

.detail-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.02em;
}

.detail-value {
  font-size: 13px;
  color: #111827;
  font-weight: 500;

  &.strong {
    font-weight: 700;
  }

  &.mono {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 12px;
    color: #6b7280;
  }
}

// ── 弹窗 ──
.doctor-dialog-shell {
  padding: 8px 0;
}
</style>
