<template>
  <list-template
    page-class="hospital-dept"
    hero-eyebrow="基础数据"
    hero-title="医院科室"
    hero-desc="系统级科室字典，供订单等业务模块使用。科室编码（HDEPT-XXX）由系统自动生成，全局唯一。"
    filter-searchable
    filter-search-placeholder="搜索科室名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建科室"
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
            <div class="card-title">科室列表</div>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="paginatedDepartments"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
          >
            <!-- 科室信息列 -->
            <el-table-column label="科室信息" >
              <template #default="{ row }">
                <div class="dept-info-cell">
                  <div class="dept-avatar" :style="{ background: getAvatarBg(row.hospitalDeptName) }">
                    {{ getAvatarText(row.hospitalDeptName) }}
                  </div>
                  <div class="dept-detail">
                    <div class="role-name">{{ row.hospitalDeptName }}</div>
                    <div class="role-description">
                      <span class="role-code-tag" style="font-size: 11px">{{ row.hospitalDeptCode }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 排序 -->
            <!-- <el-table-column label="排序" width="80" align="center">
              <template #default="{ row }">
                <span class="role-code-tag">{{ row.sort ?? 0 }}</span>
              </template>
            </el-table-column> -->

            <!-- 状态 -->
            <el-table-column label="状态" >
              <template #default="{ row }">
                <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column label="创建时间">
              <template #default="{ row }">
                <span >{{ formatDate(row.createTime) }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd: DeptCommand) => handleCommand(cmd, row)">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>编辑科室
                      </el-dropdown-item>
                      <el-dropdown-item command="toggle" :divided="true">
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '停用科室' : '启用科室' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除科室
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
        <div v-if="!selectedDept" class="detail-empty">
          <el-empty description="请从左侧选择一个科室" :image-size="80" />
        </div>

        <el-card v-if="selectedDept" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">科室详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedDept.hospitalDeptName }}</div>
              <span class="status-badge"
                :class="selectedDept.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedDept.statusName }}
              </span>
            </div>

            <span class="role-code-tag" style="margin: 6px 0 12px; display: inline-block;">
              {{ selectedDept.hospitalDeptCode }}
            </span>

            <div class="detail-stats">
              <!-- <div class="detail-stat">
                <p class="detail-label">排序</p>
                <p class="detail-value">{{ selectedDept.sort ?? 0 }}</p>
              </div> -->
              <div class="detail-stat">
                <p class="detail-label">创建时间</p>
                <p class="detail-value">{{ formatDate(selectedDept.createTime) }}</p>
              </div>
            </div>
            <div class="detail-item" v-if="selectedDept.remark">
              <p class="detail-label">备注</p>
              <p class="detail-value">{{ selectedDept.remark }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedDept)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <!-- <el-button style="flex: 1" @click="handleView(selectedDept)">
                <el-icon><View /></el-icon>查看详情
              </el-button> -->
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑科室弹窗 -->
  <dialog-modal
    v-model="deptDialogVisible"
    :title="editingDept ? '编辑科室' : '新建科室'"
    subtitle="配置科室基本信息"
    width="560px"
    @modal-close="deptDialogVisible = false"
    @modal-confirm="handleSaveDept"
  >
    <div class="dialog-shell">
      <el-form :model="deptForm" label-position="top" :rules="deptRules" ref="deptFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="科室名称" prop="hospitalDeptName">
              <el-input v-model="deptForm.hospitalDeptName" placeholder="请输入科室名称" maxlength="25" show-word-limit />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="deptForm.sort"
                :min="0"
                :precision="0"
                placeholder="数字越小越靠前"
                style="width: 100%"
              />
            </el-form-item>
          </el-col> -->
          <!-- <el-col :span="12" v-if="editingDept">
            <el-form-item label="状态">
              <el-select v-model="deptForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="正常" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="24">
            <el-form-item label="备注">
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

  <!-- 科室详情弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    title="科室详情"
    :subtitle="viewingDept?.hospitalDeptName || ''"
    width="520px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingDept">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">科室编码</span>
            <span class="detail-value mono">{{ viewingDept.hospitalDeptCode }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">科室名称</span>
            <span class="detail-value strong">{{ viewingDept.hospitalDeptName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">排序</span>
            <span class="detail-value">{{ viewingDept.sort ?? 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="status-badge"
              :class="viewingDept.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
              {{ viewingDept.statusName }}
            </span>
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
      <div class="detail-section">
        <div class="detail-section-title">时间记录</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingDept.createTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  Edit,
  Delete,
  Switch,
  Plus,
  MoreFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  hospitalDeptPage,
  hospitalDeptDetail,
  hospitalDeptCreate,
  hospitalDeptUpdate,
  hospitalDeptDelete,
  hospitalDeptChangeStatus,
  type HospitalDeptVO,
  type CreateHospitalDeptDTO,
  type UpdateHospitalDeptDTO,
} from '@/api/hospitalDept'

export type DeptCommand = 'edit' | 'view' | 'toggle' | 'delete'

// ========== 数据类型（对齐接口文档 HospitalDeptVO） ==========
interface DeptForm {
  hospitalDeptName: string
  sort: number
  status: number
  remark: string
}

// ========== 状态 ==========
const loading = ref(false)
const searchText = ref('')
const filterStatus = ref<number | undefined>()
const selectedDept = ref<HospitalDeptVO | null>(null)
const tableRef = ref()

const deptDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const deptFormRef = ref<FormInstance>()
const editingDept = ref<HospitalDeptVO | null>(null)
const viewingDept = ref<HospitalDeptVO | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

// ========== 科室列表数据 ==========
const departments = ref<HospitalDeptVO[]>([])

const deptForm = ref<DeptForm>({
  hospitalDeptName: '',
  sort: 0,
  status: 1,
  remark: '',
})

// ========== 筛选配置 ==========
const filterSelects = [
  {
    modelKey: 'status',
    placeholder: '状态',
    options: [
      { label: '正常', value: 1 },
      { label: '停用', value: 0 },
    ],
  },
]

const onFilterChange = (key: string, value: any) => {
  if (key === 'status') filterStatus.value = value
}

const paginatedDepartments = computed(() => departments.value)

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
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c71585', '#20b2aa', '#f08080']
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
    const res = await hospitalDeptPage({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      hospitalDeptName: searchText.value.trim() || undefined,
      status: filterStatus.value,
    })
    departments.value = res.records
    pageInfo.totalCount = res.total
    if (!selectedDept.value && res.records.length > 0) {
      selectedDept.value = res.records[0]
      tableRef.value?.setCurrentRow(res.records[0])
    }
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchText.value = ''
  filterStatus.value = undefined
  pageInfo.currentPage = 1
  loadData()
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

const handleCurrentChange = (row: HospitalDeptVO | null) => {
  selectedDept.value = row
}

const getRowClassName = ({ row }: { row: HospitalDeptVO }) => {
  return selectedDept.value?.id === row.id ? 'selected-row' : ''
}

const handleCommand = (command: DeptCommand, row: HospitalDeptVO) => {
  switch (command) {
    case 'edit': handleEdit(row); break
    case 'view': handleView(row); break
    case 'toggle': handleToggleStatus(row); break
    case 'delete': handleDelete(row); break
  }
}

const handleCreate = () => {
  editingDept.value = null
  deptForm.value = { hospitalDeptName: '', sort: 0, status: 1, remark: '' }
  deptDialogVisible.value = true
}

const handleEdit = (dept: HospitalDeptVO) => {
  editingDept.value = dept
  deptForm.value = {
    hospitalDeptName: dept.hospitalDeptName,
    sort: dept.sort ?? 0,
    status: dept.status,
    remark: dept.remark,
  }
  deptDialogVisible.value = true
}

const handleView = async (dept: HospitalDeptVO) => {
  try {
    const detail = await hospitalDeptDetail(dept.id)
    viewingDept.value = detail
    detailDialogVisible.value = true
  } catch {
    // error handled by interceptor
  }
}

const handleSaveDept = async () => {
  if (!deptFormRef.value) return
  await deptFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingDept.value) {
          const data: UpdateHospitalDeptDTO = {}
          if (deptForm.value.hospitalDeptName !== editingDept.value.hospitalDeptName) data.hospitalDeptName = deptForm.value.hospitalDeptName
          if (deptForm.value.sort !== editingDept.value.sort) data.sort = deptForm.value.sort
          if (deptForm.value.status !== editingDept.value.status) data.status = deptForm.value.status
          if (deptForm.value.remark !== editingDept.value.remark) data.remark = deptForm.value.remark
          await hospitalDeptUpdate(editingDept.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const data: CreateHospitalDeptDTO = {
            hospitalDeptName: deptForm.value.hospitalDeptName,
            sort: deptForm.value.sort,
            remark: deptForm.value.remark,
          }
          await hospitalDeptCreate(data)
          ElMessage.success('创建成功')
        }
        deptDialogVisible.value = false
        loadData()
      } catch {
        // error handled by interceptor
      }
    }
  })
}

const handleDelete = async (dept: HospitalDeptVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除科室「${dept.hospitalDeptName}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await hospitalDeptDelete(dept.id)
    ElMessage.success('删除成功')
    if (selectedDept.value?.id === dept.id) {
      selectedDept.value = null
    }
    loadData()
  } catch {
    // user cancel
  }
}

const handleToggleStatus = async (dept: HospitalDeptVO) => {
  const newStatus = dept.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}科室「${dept.hospitalDeptName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    await hospitalDeptChangeStatus(dept.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel
  }
}

// ========== 校验规则 ==========
const deptRules: FormRules = {
  hospitalDeptName: [{ required: true, message: '请输入科室名称', trigger: 'blur' }],
}

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
})

// ========== 监听器 ==========
watch(searchText, () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(filterStatus, () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── Dept 特有样式 ──
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

</style>
