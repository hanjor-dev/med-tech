<template>
  <list-template
    page-class="hospital-template"
    hero-eyebrow="客户管理"
    hero-title="医院组合模板"
    hero-desc="批量管理医院组合模板，通过模板快速获取一组医院的完整信息，支持按模板名称、状态等条件筛选。"
    filter-searchable
    filter-search-placeholder="搜索模板名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建模板"
    @filter-search="handleSearch"
    @filter-reset="handleReset"
    @filter-create="handleCreate"
    @filter-change="onFilterChange"
  >
    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">模板列表</div>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="paginatedTemplates"
            highlight-current-row
            @current-change="handleCurrentChange"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
          >
            <!-- 模板信息列 -->
            <el-table-column label="模板信息" min-width="220">
              <template #default="{ row }">
                <div class="template-info-cell">
                  <div class="template-avatar" :style="{ background: getAvatarBg(row.templateName) }">
                    {{ getAvatarText(row.templateName) }}
                  </div>
                  <div class="template-detail">
                    <div class="role-name">{{ row.templateName }}</div>
                    <div class="role-description">
                      <span class="role-code-tag" style="font-size: 11px">{{ row.templateCode }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 模板描述 -->
            <el-table-column label="模板描述" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="data-scope-text">{{ row.templateDesc || '-' }}</span>
              </template>
            </el-table-column>

            <!-- 关联医院数 -->
            <el-table-column label="关联医院" width="110">
              <template #default="{ row }">
                <span class="hospital-count-tag">
                  <el-icon><OfficeBuilding /></el-icon>
                  {{ row.hospitalCount }}家
                </span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column label="创建时间" width="120">
              <template #default="{ row }">
                <span class="data-scope-text">{{ formatDate(row.createTime) }}</span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd) => emitDropdownCommand(cmd, row)">
                  <span class="action-trigger">
                    <el-button text :icon="MoreFilled" />
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>编辑模板
                      </el-dropdown-item>
                      <el-dropdown-item command="toggle" :divided="true">
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '停用模板' : '启用模板' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除模板
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
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedTemplate }">
        <!-- 空状态 -->
        <div v-if="!selectedTemplate" class="detail-empty">
          <el-empty description="请从左侧选择一个模板" :image-size="80" />
        </div>

        <!-- 已选模板详情 -->
        <el-card v-if="selectedTemplate" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">模板详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedTemplate.templateName }}</div>
              <span class="status-badge"
                :class="selectedTemplate.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedTemplate.statusName }}
              </span>
            </div>

            <span class="role-code-tag" style="margin: 6px 0 12px; display: inline-block;">
              {{ selectedTemplate.templateCode }}
            </span>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">关联医院</p>
                <p class="detail-value">{{ selectedTemplate.hospitalCount }} 家</p>
                <div class="hospital-name-list" v-if="selectedTemplate.details?.length">
                  <span
                    v-for="d in selectedTemplate.details"
                    :key="d.hospitalId"
                    class="hospital-name-tag"
                  >{{ d.hospitalName }}</span>
                </div>
              </div>
              <div class="detail-stat">
                <p class="detail-label">模板描述</p>
                <p class="detail-value">{{ selectedTemplate.templateDesc || '-' }}</p>
              </div>
            </div>
            <div class="detail-item" v-if="selectedTemplate.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedTemplate.remark }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value">{{ formatDate(selectedTemplate.createTime) }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedTemplate)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑模板弹窗 -->
  <dialog-modal
    v-model="templateDialogVisible"
    :title="editingTemplate ? '编辑模板' : '新建模板'"
    subtitle="配置模板基本信息与关联医院"
    width="720px"
    @modal-close="handleDialogClose"
    @modal-confirm="handleSaveTemplate"
  >
    <div class="dialog-shell">
      <el-form :model="templateForm" label-position="top" :rules="templateRules" ref="templateFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="templateForm.templateName" placeholder="请输入模板名称" maxlength="30" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="模板描述">
              <el-input v-model="templateForm.templateDesc" type="textarea" :rows="2" maxlength="256" show-word-limit placeholder="请输入模板描述（选填）" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="关联医院" prop="hospitalIds">
              <div class="hospital-select-wrap" style="width:100%">
                <el-select
                  v-model="templateForm.hospitalIds"
                  multiple
                  filterable
                  remote
                  reserve-keyword
                  placeholder="输入医院名称搜索"
                  :remote-method="searchHospitals"
                  :loading="hospitalLoading"
                  style="width: 100%"
                >
                  <template #tag>
                    <el-tag
                      v-for="tag in templateForm.hospitalIds"
                      :key="tag"
                      closable
                      :type="assignedHospitalIds.has(tag) ? 'primary' : 'info'"
                      class="hospital-select-tag"
                      @close="onTagClose(tag)"
                    >
                      {{ getHospitalNameById(tag) }}
                      <span v-if="assignedHospitalIds.has(tag)" class="tag-assigned-dot" />
                    </el-tag>
                  </template>
                  <el-option
                    v-for="item in hospitalOptionsList"
                    :key="item.id"
                    :label="item.orgName"
                    :value="item.id"
                  >
                    <div class="hospital-option" :class="{ 'hospital-option--assigned': item.assigned }">
                      <span class="hospital-option-name">{{ item.orgName }}</span>
                      <span class="hospital-option-meta">
                        <span class="hospital-option-area">{{ item.orgTypeName }}</span>
                        <span v-if="item.assigned" class="hospital-option-assigned-tag">已分配</span>
                      </span>
                    </div>
                  </el-option>
                </el-select>
                <div class="hospital-select-count" v-if="templateForm.hospitalIds.length > 0">
                  已选择 <span class="count-num">{{ templateForm.hospitalIds.length }}</span> 家医院
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="templateForm.remark" type="textarea" :rows="2" maxlength="512" show-word-limit placeholder="请输入备注（选填）" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>

  <!-- 模板详情弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    title="模板详情"
    :subtitle="viewingTemplate?.templateName || ''"
    width="720px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="template-detail-shell" v-if="viewingTemplate">
      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">模板编码</span>
            <span class="detail-value mono">{{ viewingTemplate.templateCode }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">模板状态</span>
            <span class="status-badge" :class="viewingTemplate.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
              {{ viewingTemplate.statusName }}
            </span>
          </div>
          <div class="detail-item" v-if="viewingTemplate.templateDesc">
            <span class="detail-label">模板描述</span>
            <span class="detail-value">{{ viewingTemplate.templateDesc }}</span>
          </div>
          <div class="detail-item" v-if="viewingTemplate.remark">
            <span class="detail-label">备注</span>
            <span class="detail-value">{{ viewingTemplate.remark }}</span>
          </div>
        </div>
      </div>

      <!-- 关联医院 -->
      <div class="detail-section">
        <div class="detail-section-title">
          关联医院
          <span class="detail-section-count">{{ viewingTemplate.hospitalCount }} 家</span>
        </div>
        <el-table
          :data="viewingTemplate.details || []"
          style="width: 100%"
          size="small"
          border
          v-loading="detailLoading"
        >
          <el-table-column label="医院名称" min-width="160">
            <template #default="{ row }">
              <div class="detail-hospital-cell">
                <div class="detail-hospital-avatar" :style="{ background: getAvatarBg(row.hospitalName) }">
                  {{ getAvatarText(row.hospitalName) }}
                </div>
                <div>
                  <div class="detail-hospital-name">{{ row.hospitalName }}</div>
                  <div class="detail-hospital-code">{{ row.hospitalCode }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="地区" prop="fullAreaName" min-width="180" show-overflow-tooltip />
          <el-table-column label="等级" prop="hospitalLevelName" width="100" />
          <el-table-column label="分配状态" width="90" align="center">
            <template #default="{ row }">
              <span class="assigned-badge" :class="row.assigned ? 'assigned-badge--yes' : 'assigned-badge--no'">
                {{ row.assigned ? '已分配' : '未分配' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="联系人" prop="contact" width="100" />
          <el-table-column label="联系电话" width="130">
            <template #default="{ row }">
              <span class="mono-text">{{ row.phone }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 时间记录 -->
      <div class="detail-section">
        <div class="detail-section-title">时间记录</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingTemplate.createTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">更新时间</span>
            <span class="detail-value mono">{{ formatDate(viewingTemplate.updateTime) }}</span>
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
  View,
  Plus,
  OfficeBuilding,
  MoreFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  hospitalTemplateList,
  hospitalTemplateDetail,
  hospitalTemplateCreate,
  hospitalTemplateUpdate,
  hospitalTemplateDelete,
  hospitalTemplateChangeStatus,
  type HospitalGroupTemplateVO,
  type HospitalGroupTemplateDetailVO,
  type HospitalOptionVO,
  type CreateHospitalTemplateDTO,
  type UpdateHospitalTemplateDTO,
} from '@/api/hospital'
import { orgAll } from '@/api/org'

// ========== 数据类型 ==========
interface TemplateForm {
  templateName: string
  templateDesc: string
  hospitalIds: number[]
  remark: string
  status: number
}

// ========== 状态 ==========
const loading = ref(false)
const detailLoading = ref(false)
const hospitalLoading = ref(false)
const hospitalCacheLoaded = ref(false)
let allHospitalCache: HospitalOptionVO[] = []
const searchText = ref('')
const filterStatus = ref<number | undefined>()
const selectedTemplate = ref<HospitalGroupTemplateVO | null>(null)
const tableRef = ref()

const templateDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const templateFormRef = ref<FormInstance>()
const editingTemplate = ref<HospitalGroupTemplateVO | null>(null)
const viewingTemplate = ref<HospitalGroupTemplateVO | null>(null)
const isClosingDialog = ref(false)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

// ========== 模板列表数据 ==========
const templates = ref<HospitalGroupTemplateVO[]>([])

// ========== 医院下拉选项 ==========
const hospitalOptionsList = ref<HospitalOptionVO[]>([])

// ========== 已分配医院ID集合（用于快速查找） ==========
const assignedHospitalIds = computed(() => {
  return new Set(
    allHospitalCache.filter(h => h.assigned).map(h => h.id)
  )
})

// ========== 模板表单 ==========
const templateForm = ref<TemplateForm>({
  templateName: '',
  templateDesc: '',
  hospitalIds: [],
  remark: '',
  status: 1,
})

// ========== 筛选项配置 ==========
const filterSelects = computed(() => [
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
  if (key === 'status') filterStatus.value = value
  pageInfo.currentPage = 1
  loadData()
}

// ========== 计算属性 ==========
const paginatedTemplates = computed(() => {
  return templates.value
})

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
  return name.length >= 2 ? name.slice(-2) : name[0]
}

// ========== 方法 ==========
const loadData = async () => {
  loading.value = true
  try {
    const res = await hospitalTemplateList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      templateName: searchText.value.trim() || undefined,
      status: filterStatus.value,
    })
    templates.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedTemplate.value && templates.value.length > 0) {
      selectedTemplate.value = templates.value[0]
      tableRef.value?.setCurrentRow(templates.value[0])
    }
  } catch {
    // error handled by http interceptor
  } finally {
    loading.value = false
  }
}

const loadHospitalOptions = async (query?: string) => {
  if (hospitalCacheLoaded.value) {
    // 已缓存，直接过滤
    if (query) {
      hospitalOptionsList.value = allHospitalCache.filter((h: HospitalOptionVO) => h.orgName.includes(query))
    } else {
      hospitalOptionsList.value = allHospitalCache
    }
    return
  }
  hospitalLoading.value = true
  try {
    const res: any = await orgAll()
    const list: HospitalOptionVO[] = (Array.isArray(res) ? res : []).filter(
      (item: HospitalOptionVO) => item.orgType === '1.3'
    )
    allHospitalCache = list
    hospitalOptionsList.value = list
    hospitalCacheLoaded.value = true
    if (query) {
      hospitalOptionsList.value = list.filter((h: HospitalOptionVO) => h.orgName.includes(query))
    }
  } catch {
    // error handled by http interceptor
  } finally {
    hospitalLoading.value = false
  }
}

const searchHospitals = async (query: string) => {
  // 有缓存则本地过滤，无缓存则请求
  if (hospitalCacheLoaded.value) {
    if (query) {
      hospitalOptionsList.value = allHospitalCache.filter((h: HospitalOptionVO) => h.orgName.includes(query))
    } else {
      hospitalOptionsList.value = allHospitalCache
    }
  } else {
    await loadHospitalOptions(query)
  }
}

const getHospitalNameById = (id: number): string => {
  const h = allHospitalCache.find(h => h.id === id)
  return h ? h.orgName : String(id)
}

const onTagClose = (id: number) => {
  // 防止在关闭弹窗时触发标签关闭事件
  if (isClosingDialog.value) return

  if (assignedHospitalIds.value.has(id)) {
    const h = allHospitalCache.find(h => h.id === id)
    ElMessageBox.confirm(
      `取消「${h?.orgName || id}」的分配将解除关联，确定要继续吗？`,
      '取消已分配医院',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留',
        type: 'warning',
        customClass: 'auth-confirm-dialog',
      }
    ).then(() => {
      const idx = templateForm.value.hospitalIds.indexOf(id)
      if (idx > -1) templateForm.value.hospitalIds.splice(idx, 1)
    }).catch(() => {})
  } else {
    const idx = templateForm.value.hospitalIds.indexOf(id)
    if (idx > -1) templateForm.value.hospitalIds.splice(idx, 1)
  }
}

const handleReset = () => {
  searchText.value = ''
  filterStatus.value = undefined
  pageInfo.currentPage = 1
  loadData()
}

const handleSearch = (val: string) => {
  searchText.value = val
  pageInfo.currentPage = 1
  loadData()
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
  loadData()
}

const handleCurrentChange = async (row: HospitalGroupTemplateVO | null) => {
  if (!row) {
    selectedTemplate.value = null
    return
  }
  selectedTemplate.value = row
  try {
    const res = await hospitalTemplateDetail(row.id)
    selectedTemplate.value = res
  } catch {
    // error handled by http interceptor
  }
}

const handleCommand = (cmd: string, row: HospitalGroupTemplateVO) => {
  switch (cmd) {
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

const emitDropdownCommand = (cmd: any, row: HospitalGroupTemplateVO) => {
  handleCommand(cmd, row)
}

const handleDialogClose = () => {
  isClosingDialog.value = true
  templateDialogVisible.value = false
  // 延迟重置标志，确保所有标签关闭事件已处理
  setTimeout(() => {
    isClosingDialog.value = false
  }, 100)
}

const handleCreate = async () => {
  editingTemplate.value = null
  templateForm.value = {
    templateName: '',
    templateDesc: '',
    hospitalIds: [],
    remark: '',
    status: 1,
  }
  hospitalOptionsList.value = []
  await loadHospitalOptions()
  isClosingDialog.value = false
  templateDialogVisible.value = true
}

const handleEdit = async (tpl: HospitalGroupTemplateVO) => {
  editingTemplate.value = tpl
  try {
    const res = await hospitalTemplateDetail(tpl.id)
    const detail = res as HospitalGroupTemplateVO
    const selectedIds = detail.details?.map(d => d.hospitalId) || []
    templateForm.value = {
      templateName: detail.templateName,
      templateDesc: detail.templateDesc || '',
      hospitalIds: selectedIds,
      remark: detail.remark || '',
      status: detail.status,
    }
    // 先请求全量医院数据，再标记已选项的 assigned 状态
    await loadHospitalOptions()
    hospitalOptionsList.value = hospitalOptionsList.value.map(h => ({
      ...h,
      assigned: selectedIds.includes(h.id),
    }))
    // 同步 allHospitalCache 的 assigned 状态，保证 assignedHospitalIds computed 正确
    allHospitalCache = allHospitalCache.map(h => ({
      ...h,
      assigned: selectedIds.includes(h.id),
    }))
    isClosingDialog.value = false
    templateDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleView = async (tpl: HospitalGroupTemplateVO) => {
  viewingTemplate.value = tpl
  detailDialogVisible.value = true
  detailLoading.value = true
  try {
    const res = await hospitalTemplateDetail(tpl.id)
    viewingTemplate.value = res
  } catch {
    // error handled by http interceptor
  } finally {
    detailLoading.value = false
  }
}

const handleSaveTemplate = async () => {
  if (!templateFormRef.value) return
  await templateFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingTemplate.value) {
          const data: UpdateHospitalTemplateDTO = {
            templateName: templateForm.value.templateName,
            templateDesc: templateForm.value.templateDesc || undefined,
            hospitalIds: templateForm.value.hospitalIds,
            status: templateForm.value.status,
            remark: templateForm.value.remark || undefined,
          }
          await hospitalTemplateUpdate(editingTemplate.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const data: CreateHospitalTemplateDTO = {
            templateName: templateForm.value.templateName,
            templateDesc: templateForm.value.templateDesc || undefined,
            hospitalIds: templateForm.value.hospitalIds,
            remark: templateForm.value.remark || undefined,
          }
          await hospitalTemplateCreate(data)
          ElMessage.success('创建成功')
        }
        isClosingDialog.value = true
        templateDialogVisible.value = false
        setTimeout(() => {
          isClosingDialog.value = false
        }, 100)
        loadData()
      } catch {
        // error handled by http interceptor
      }
    }
  })
}

const handleDelete = async (tpl: HospitalGroupTemplateVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板「${tpl.templateName}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await hospitalTemplateDelete(tpl.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleToggleStatus = async (tpl: HospitalGroupTemplateVO) => {
  const newStatus = tpl.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}模板「${tpl.templateName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    await hospitalTemplateChangeStatus(tpl.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

// ========== 校验规则 ==========
const templateRules: FormRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  hospitalIds: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (!templateForm.value.hospitalIds || templateForm.value.hospitalIds.length === 0) {
          callback(new Error('请至少选择一家医院'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// ========== 生命周期 ==========
watch(
  () => templateForm.value.hospitalIds,
  (newIds, oldIds) => {
    if (!oldIds || !newIds) return
    // 找出被取消的医院ID（之前选中，现在未选中）
    const removed = oldIds.filter((id: number) => !newIds.includes(id))
    if (removed.length === 0) return
    // 检查是否有已分配医院被取消
    const removedAssigned = removed.filter((id: number) => assignedHospitalIds.value.has(id))
    if (removedAssigned.length === 0) return
    // 恢复勾选（等用户确认后再移除）
    templateForm.value.hospitalIds = oldIds
    // 弹出确认框
    const assignedNames = hospitalOptionsList.value
      .filter(h => removedAssigned.includes(h.id))
      .map(h => h.orgName)
      .join('、')
    ElMessageBox.confirm(
      `取消「${assignedNames}」的分配将解除关联，确定要继续吗？`,
      '取消已分配医院',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留',
        type: 'warning',
        customClass: 'auth-confirm-dialog',
      }
    ).then(() => {
      // 用户确认后，移除已分配医院
      templateForm.value.hospitalIds = newIds
    }).catch(() => {
      // 用户取消，什么都不做
    })
  }
)

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── 模板信息列 ──
.template-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .template-avatar {
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

  .template-detail {
    min-width: 0;
  }
}

.hospital-count-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  background: #f0f9eb;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.hospital-name-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.hospital-name-tag {
  font-size: 11px;
  color: #2f5bff;
  background: rgba(47, 91, 255, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 400;
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 0;
}

.mono-text {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
}

// ── 弹窗内部 ──
.template-dialog-shell {
  padding: 8px 0;
}

.hospital-select-wrap {
  .hospital-select-count {
    margin-top: 6px;
    font-size: 12px;
    color: #67c23a;
    .count-num {
      font-weight: 700;
    }
  }
}

.hospital-select-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-assigned-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1d4ed8;
  flex-shrink: 0;
}

.hospital-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  .hospital-option-name {
    font-size: 13px;
  }
  .hospital-option-area {
    font-size: 11px;
    color: #909399;
  }
  .hospital-option-meta {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.hospital-option--assigned {
  .hospital-option-name {
    font-weight: 600;
    color: #1d4ed8;
  }
}

.hospital-option-assigned-tag {
  font-size: 10px;
  font-weight: 600;
  color: #1d4ed8;
  background: rgba(29, 78, 216, 0.1);
  border: 1px solid rgba(29, 78, 216, 0.25);
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

// ── 详情弹窗 ──
.template-detail-shell {
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
  display: flex;
  align-items: center;
  gap: 8px;

  .detail-section-count {
    font-size: 11px;
    font-weight: 600;
    background: #f0f9eb;
    color: #67c23a;
    padding: 1px 6px;
    border-radius: 10px;
    text-transform: none;
    letter-spacing: 0;
  }
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

// ── 详情医院表格 ──
.detail-hospital-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-hospital-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-hospital-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.detail-hospital-code {
  font-size: 11px;
  color: #9ca3af;
}

.assigned-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.assigned-badge--yes {
  background: #ecfdf5;
  color: #059669;
}
.assigned-badge--no {
  background: #f3f4f6;
  color: #6b7280;
}
</style>
