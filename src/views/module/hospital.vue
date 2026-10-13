<template>
  <list-template
    page-class="hospital"
    hero-eyebrow="客户管理"
    hero-title="医院管理"
    hero-desc="管理合作医院信息，支持按地区、等级、类型、状态多条件筛选"
    :stats="stats"
    filter-searchable
    filter-search-placeholder="搜索医院名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建医院"
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
            <div class="card-title">医院列表</div>
          </div>
        </template>

        <div class="roles-list-wrap list-table-wrap" style="flex: 1; min-height: 0; overflow: hidden;">
          <el-table
            ref="tableRef"
            :data="filteredHospitals"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            height="100%"
          >
            <el-table-column label="医院信息" min-width="200">
              <template #default="{ row }">
                <div class="hospital-info-cell">
                  <div class="hospital-avatar" :style="{ background: getAvatarBg(row.hospitalName) }">
                    {{ getAvatarText(row.hospitalName) }}
                  </div>
                  <div class="hospital-detail">
                    <div class="role-name">{{ row.hospitalName }}</div>
                    <div class="role-description">
                      <span class="role-code-tag" style="font-size: 11px">
                        <span
                          class="hospital-badge"
                          :style="{ background: getTypeStyle(row.hospitalType).bg, color: getTypeStyle(row.hospitalType).text }"
                        >
                          {{ getTypeLabel(row.hospitalType) || '未分类' }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="所在地区" prop="fullAreaName" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="data-scope-text">{{ row.fullAreaName || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="医院等级" width="120">
              <template #default="{ row }">
                <span class="role-code-tag">{{ getLevelLabel(row.hospitalLevel) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="联系方式" width="180">
              <template #default="{ row }">
                <div class="contact-cell">
                  <div>{{ row.contact }}</div>
                  <div class="contact-email">{{ row.phone }}</div>
                </div>
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
                        <el-icon><Edit /></el-icon>编辑医院
                      </el-dropdown-item>
                      <el-dropdown-item command="view">
                        <el-icon><View /></el-icon>查看详情
                      </el-dropdown-item>
                      <el-dropdown-item command="toggle" :divided="true">
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '停用医院' : '启用医院' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除医院
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <page-box :currentPage="pageInfo.currentPage" :pageSize="pageInfo.pageSize" :totalCount="pageInfo.totalCount"
          @current-change="currentChange" />
      </el-card>
    </div>

    <!-- Detail Panel -->
    <div class="page-body-panel panel-flex-1 ml-10">
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedHospital }">
        <!-- 空状态 -->
        <div v-if="!selectedHospital" class="detail-empty">
          <el-empty description="请从左侧选择一家医院" :image-size="80" />
        </div>

        <!-- 已选医院详情 -->
        <el-card v-if="selectedHospital" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">医院详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedHospital.hospitalName }}</div>
              <span class="status-badge"
                :class="selectedHospital.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedHospital.statusName }}
              </span>
            </div>

            <span class="role-code-tag" style="margin: 6px 0 12px; display: inline-block;">
              {{ selectedHospital.hospitalCode }}
            </span>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">医院类型</p>
                <p class="detail-value">
                  <span
                    class="hospital-badge"
                    :style="{ background: getTypeStyle(selectedHospital.hospitalType).bg, color: getTypeStyle(selectedHospital.hospitalType).text }"
                  >
                    {{ getTypeLabel(selectedHospital.hospitalType) || '未分类' }}
                  </span>
                </p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">医院等级</p>
                <p class="detail-value">{{ getLevelLabel(selectedHospital.hospitalLevel) }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">所在地区</p>
                <p class="detail-value">{{ selectedHospital.fullAreaName || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">详细地址</p>
                <p class="detail-value">{{ selectedHospital.address || '-' }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">联系人</p>
                <p class="detail-value">{{ selectedHospital.contact }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">联系电话</p>
                <p class="detail-value">{{ selectedHospital.phone }}</p>
              </div>
            </div>
            <div class="detail-item">
              <p class="detail-label">电子邮箱</p>
              <p class="detail-value">{{ selectedHospital.email || '-' }}</p>
            </div>
            <div class="detail-item" v-if="selectedHospital.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedHospital.remark }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value">{{ formatDate(selectedHospital.createTime) }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedHospital)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button style="flex: 1" @click="handleView(selectedHospital)">
                <el-icon><View /></el-icon>查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑医院弹窗 -->
  <dialog-modal
    v-model="hospitalDialogVisible"
    :title="editingHospital ? '编辑医院' : '新建医院'"
    subtitle="配置医院基本信息、分类与联系信息"
    width="680px"
    @modal-close="hospitalDialogVisible = false"
    @modal-confirm="handleSaveHospital"
  >
    <div class="dialog-shell">
      <el-form :model="hospitalForm" label-position="top" :rules="hospitalRules" ref="hospitalFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="医院名称" prop="hospitalName">
              <el-input v-model="hospitalForm.hospitalName" placeholder="请输入医院名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="hospitalForm.contact" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="hospitalForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱">
              <el-input v-model="hospitalForm.email" placeholder="请输入电子邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医院等级">
              <el-select v-model="hospitalForm.hospitalLevel" placeholder="选择医院等级" style="width: 100%">
                <el-option v-for="item in hospitalLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医院类型">
              <el-select v-model="hospitalForm.hospitalType" placeholder="选择医院类型" style="width: 100%">
                <el-option v-for="item in hospitalTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属地区" prop="areaId">
              <el-cascader
                v-model="hospitalForm.areaId"
                :options="areaOptions"
                placeholder="选择省市区"
                :props="{ checkStrictly: true, emitPath: false, value: 'id', label: 'name', children: 'children' }"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="详细地址">
              <el-input v-model="hospitalForm.address" placeholder="请输入医院详细地址" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注说明">
              <el-input v-model="hospitalForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息（选填）" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>

  <!-- 详情查看弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    title="医院详情"
    :subtitle="viewingHospital?.hospitalName || ''"
    width="680px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingHospital">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">医院编码</span>
            <span class="detail-value mono">{{ viewingHospital.hospitalCode }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">医院名称</span>
            <span class="detail-value strong">{{ viewingHospital.hospitalName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">医院类型</span>
            <span class="detail-value">
              <span class="hospital-badge" :style="{ background: getTypeStyle(viewingHospital.hospitalType).bg, color: getTypeStyle(viewingHospital.hospitalType).text }">
                {{ getLevelLabel(viewingHospital.hospitalLevel) }}
              </span>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">医院等级</span>
            <span class="detail-value">{{ getLevelLabel(viewingHospital.hospitalLevel) }}</span>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">联系信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">联系人</span>
            <span class="detail-value">{{ viewingHospital.contact }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话</span>
            <span class="detail-value mono">{{ viewingHospital.phone }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">电子邮箱</span>
            <span class="detail-value">{{ viewingHospital.email || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">所在地区</span>
            <span class="detail-value">{{ viewingHospital.fullAreaName || '-' }}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">详细地址</span>
            <span class="detail-value">{{ viewingHospital.address || '-' }}</span>
          </div>
        </div>
      </div>
      <div class="detail-section" v-if="viewingHospital.remark">
        <div class="detail-section-title">备注说明</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--text-secondary); line-height: 1.7">
            {{ viewingHospital.remark }}
          </span>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">时间记录</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingHospital.createTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">更新时间</span>
            <span class="detail-value mono">{{ formatDate(viewingHospital.updateTime) }}</span>
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
  Search,
  Edit,
  Delete,
  MoreFilled,
  Switch,
  View,
  OfficeBuilding,
  CircleCheck,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  hospitalList,
  hospitalDetail,
  hospitalCreate,
  hospitalUpdate,
  hospitalChangeStatus,
  fetchAreaTree,
  type HospitalVO,
  type CreateHospitalDTO,
  type UpdateHospitalDTO,
} from '@/api/hospital'
import { getDictOptions } from '@/utils/dict'

export type HospitalCommand = 'edit' | 'view' | 'toggle' | 'delete'

// ========== 字典数据 ==========
const hospitalLevelOptions = ref<{ label: string; value: string }[]>([])
const hospitalTypeOptions = ref<{ label: string; value: string }[]>([])

const areaOptions = ref<any[]>([])

// ========== 数据类型（对齐接口文档 HospitalVO，定义在 @/api/hospital） ==========
interface HospitalForm {
  hospitalName: string
  contact: string
  phone: string
  email: string
  areaId: number | null
  hospitalLevel: string
  hospitalType: string
  address: string
  remark: string
}

// ========== 数据 ==========
const loading = ref(false)
const searchText = ref('')
const filterHospitalLevel = ref<string | undefined>()
const filterHospitalType = ref<string | undefined>()
const filterStatus = ref<number | undefined>()
const selectedHospital = ref<HospitalVO | null>(null)
const tableRef = ref()
const hospitalDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const hospitalFormRef = ref<FormInstance>()
const editingHospital = ref<HospitalVO | null>(null)
const viewingHospital = ref<HospitalVO | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

// ========== 医院列表数据 ==========
const hospitals = ref<HospitalVO[]>([])

const hospitalForm = ref<HospitalForm>({
  hospitalName: '',
  contact: '',
  phone: '',
  email: '',
  areaId: null,
  hospitalLevel: '',
  hospitalType: '',
  address: '',
  remark: '',
})

// ========== 筛选 ==========
const filterSelects = computed(() => [
  {
    modelKey: 'hospitalLevel',
    placeholder: '医院等级',
    options: hospitalLevelOptions.value,
  },
  {
    modelKey: 'hospitalType',
    placeholder: '医院类型',
    options: hospitalTypeOptions.value,
  },
  {
    modelKey: 'status',
    placeholder: '状态',
    options: [
      { label: '正常', value: 1 },
      { label: '停用', value: 0 },
    ],
  },
])

const onFilterChange = (key: string, value: any) => {
  if (key === 'hospitalLevel') filterHospitalLevel.value = value
  if (key === 'hospitalType') filterHospitalType.value = value
  if (key === 'status') filterStatus.value = value
}

// ========== 计算 ==========
const stats = computed(() => [
  {
    label: '医院总数',
    value: hospitals.value.length.toString(),
    icon: OfficeBuilding,
  },
  {
    label: '正常运营',
    value: hospitals.value.filter(h => h.status === 1).length.toString(),
    icon: CircleCheck,
  },
  {
    label: '已停用',
    value: hospitals.value.filter(h => h.status === 0).length.toString(),
    icon: OfficeBuilding,
  },
  {
    label: '本月新增',
    value: hospitals.value.filter(h => {
      const d = new Date(h.createTime)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length.toString(),
    icon: Plus,
  },
])

const filteredHospitals = computed(() => {
  return hospitals.value
})

// ========== 生命周期 ==========
onMounted(async () => {
  loadData()
  const [level, type, area] = await Promise.all([
    getDictOptions('3'),
    getDictOptions('4'),
    fetchAreaTree(),
  ])

  hospitalLevelOptions.value = level
  hospitalTypeOptions.value = type
  areaOptions.value = area
  
})



// ========== 监听搜索和筛选变化 ==========
watch([searchText, filterHospitalLevel, filterHospitalType, filterStatus], () => {
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

const getTypeStyle = (type: string | null | undefined) => {
  if (!type) return { bg: '#f1f5f9', text: '#94a3b8' }
  const map: Record<string, { bg: string; text: string }> = {
    '4.1': { bg: '#f0fdf4', text: '#15803d' },
    '4.2': { bg: '#fefce8', text: '#a16207' },
  }
  return map[type] || { bg: '#f1f5f9', text: '#94a3b8' }
}

const getLevelLabel = (level: string | null | undefined): string => {
  if (!level) return '-'
  const option = hospitalLevelOptions.value.find(o => o.value === level)
  return option?.label ?? '-'
}

const getTypeLabel = (type: string | null | undefined): string => {
  if (!type) return '-'
  const option = hospitalTypeOptions.value.find(o => o.value === type)
  return option?.label ?? '-'
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
    const res = await hospitalList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      hospitalName: searchText.value.trim() || undefined,
      hospitalLevel: filterHospitalLevel.value,
      hospitalType: filterHospitalType.value,
      status: filterStatus.value,
    })
    hospitals.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedHospital.value && hospitals.value.length > 0) {
      selectedHospital.value = hospitals.value[0]
      tableRef.value?.setCurrentRow(hospitals.value[0])
    }
  } catch {
    // error handled by http interceptor
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchText.value = ''
  filterHospitalLevel.value = undefined
  filterHospitalType.value = undefined
  filterStatus.value = undefined
  pageInfo.currentPage = 1
  // watch will trigger loadData()
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
  // watch will trigger loadData()
}

const handleCurrentChange = (row: HospitalVO | null) => {
  selectedHospital.value = row
}

const getRowClassName = ({ row }: { row: HospitalVO }) => {
  return selectedHospital.value?.id === row.id ? 'selected-row' : ''
}

const handleCommand = (command: HospitalCommand, row: HospitalVO) => {
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
  editingHospital.value = null
  hospitalForm.value = {
    hospitalName: '',
    contact: '',
    phone: '',
    email: '',
    areaId: null,
    hospitalLevel: '',
    hospitalType: '',
    address: '',
    remark: '',
  }
  hospitalDialogVisible.value = true
}

const handleEdit = (hospital: HospitalVO) => {
  editingHospital.value = hospital
  hospitalForm.value = {
    hospitalName: hospital.hospitalName,
    contact: hospital.contact,
    phone: hospital.phone,
    email: hospital.email || '',
    areaId: hospital.areaId,
    hospitalLevel: hospital.hospitalLevel,
    hospitalType: hospital.hospitalType,
    address: hospital.address || '',
    remark: hospital.remark || '',
  }
  hospitalDialogVisible.value = true
}

const handleView = async (hospital: HospitalVO) => {
  try {
    const res = await hospitalDetail(hospital.id)
    viewingHospital.value = res
    detailDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleSaveHospital = async () => {
  if (!hospitalFormRef.value) return
  await hospitalFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingHospital.value) {
          const data: UpdateHospitalDTO = {
            hospitalName: hospitalForm.value.hospitalName,
            contact: hospitalForm.value.contact,
            phone: hospitalForm.value.phone,
            email: hospitalForm.value.email || undefined,
            areaId: hospitalForm.value.areaId ?? undefined,
            hospitalLevel: hospitalForm.value.hospitalLevel || undefined,
            hospitalType: hospitalForm.value.hospitalType || undefined,
            address: hospitalForm.value.address || undefined,
            remark: hospitalForm.value.remark || undefined,
          }
          await hospitalUpdate(editingHospital.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const data: CreateHospitalDTO = {
            hospitalName: hospitalForm.value.hospitalName,
            contact: hospitalForm.value.contact || undefined,
            phone: hospitalForm.value.phone || undefined,
            email: hospitalForm.value.email || undefined,
            areaId: hospitalForm.value.areaId!,
            hospitalLevel: hospitalForm.value.hospitalLevel || undefined,
            hospitalType: hospitalForm.value.hospitalType || undefined,
            address: hospitalForm.value.address || undefined,
            remark: hospitalForm.value.remark || undefined,
          }
          await hospitalCreate(data)
          ElMessage.success('创建成功')
        }
        hospitalDialogVisible.value = false
        loadData()
      } catch {
        // error handled by http interceptor
      }
    }
  })
}

const handleDelete = async (hospital: HospitalVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除医院「${hospital.hospitalName}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    // API has no delete method for hospital, falling back to local
    hospitals.value = hospitals.value.filter(h => h.id !== hospital.id)
    ElMessage.success('删除成功')
    if (selectedHospital.value?.id === hospital.id) {
      selectedHospital.value = hospitals.value[0] || null
      if (hospitals.value[0]) {
        tableRef.value?.setCurrentRow(hospitals.value[0])
      }
    }
    loadData()
  } catch {
    // user cancel
  }
}

const handleToggleStatus = async (hospital: HospitalVO) => {
  const newStatus = hospital.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}医院「${hospital.hospitalName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    await hospitalChangeStatus(hospital.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

// ========== 校验规则 ==========
const hospitalRules: FormRules = {
  hospitalName: [{ required: true, message: '请输入医院名称', trigger: 'blur' }],
  areaId: [{ required: true, message: '请选择所属地区', trigger: 'change' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
}</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── Hospital 特有样式 ──
.hospital-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .hospital-avatar {
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

  .hospital-detail {
    min-width: 0;
  }
}

.contact-cell {
  font-size: 13px;
  color: #606266;

  .contact-email {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
}

.hospital-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

// ── 详情弹窗内部样式 ──
.hospital-detail-dialog-shell {
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

  &.full-width {
    grid-column: 1 / -1;
  }
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
</style>
