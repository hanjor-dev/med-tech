<template>
  <list-template
    page-class="registration-cert"
    hero-eyebrow="基础数据"
    hero-title="注册证管理"
    hero-desc="管理产品注册证信息，支持按注册证号、注册证名称、状态等条件筛选。"
    filter-searchable
    filter-search-placeholder="搜索注册证号或名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建注册证"
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
            <div class="card-title">注册证列表</div>
          </div>
        </template>

        <div class="roles-list-wrap list-table-wrap" style="flex: 1; min-height: 0; overflow: hidden;">
          <el-table
            ref="tableRef"
            :data="filteredCerts"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            height="100%"
          >
            <el-table-column label="注册证信息" min-width="240">
              <template #default="{ row }">
                <div class="cert-info-cell">
                  <div class="cert-avatar" :style="{ background: getAvatarBg(row.certCode) }">
                    {{ getAvatarText(row.certCode) }}
                  </div>
                  <div class="cert-detail">
                    <div class="role-name">{{ row.certName }}</div>
                    <div class="role-description">
                      <span class="role-code-tag" style="font-size: 11px">{{ row.certCode }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="有效期" min-width="220">
              <template #default="{ row }">
                <div class="validity-cell">
                  <span class="data-scope-text mono-text">{{ row.validFrom || '-' }}</span>
                  <span class="data-scope-text" style="color: #d1d5db; margin: 0 4px;">~</span>
                  <span class="data-scope-text mono-text" :class="{ 'expired-text': isExpired(row.validTo) }">
                    {{ row.validTo || '-' }}
                  </span>
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
                        <el-icon><Edit /></el-icon>编辑注册证
                      </el-dropdown-item>
                      <el-dropdown-item command="view">
                        <el-icon><View /></el-icon>查看详情
                      </el-dropdown-item>
                      <el-dropdown-item command="toggle" :divided="true">
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '停用注册证' : '启用注册证' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除注册证
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
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedCert }">
        <!-- 空状态 -->
        <div v-if="!selectedCert" class="detail-empty">
          <el-empty description="请从左侧选择一条注册证" :image-size="80" />
        </div>

        <!-- 已选注册证详情 -->
        <el-card v-if="selectedCert" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">注册证详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedCert.certName }}</div>
              <span class="status-badge"
                :class="selectedCert.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedCert.statusName }}
              </span>
            </div>

            <span class="role-code-tag" style="margin: 6px 0 12px; display: inline-block;">
              {{ selectedCert.certCode }}
            </span>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">有效期开始</p>
                <p class="detail-value mono">{{ selectedCert.validFrom || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">有效期结束</p>
                <p class="detail-value mono" :class="{ 'expired-text': isExpired(selectedCert.validTo) }">
                  {{ selectedCert.validTo || '-' }}
                </p>
              </div>
            </div>
            <div class="detail-item" v-if="selectedCert.certFileUrl">
              <p class="detail-label">注册证文件</p>
              <p class="detail-value">
                <el-link type="primary" :href="selectedCert.certFileUrl" target="_blank">
                  查看文件
                </el-link>
              </p>
            </div>
            <div class="detail-item" v-if="selectedCert.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedCert.remark }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value">{{ formatDate(selectedCert.createTime) }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedCert)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button style="flex: 1" @click="handleView(selectedCert)">
                <el-icon><View /></el-icon>查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑注册证弹窗 -->
  <dialog-modal
    v-model="certDialogVisible"
    :title="editingCert ? '编辑注册证' : '新建注册证'"
    subtitle="配置注册证基本信息"
    width="680px"
    @modal-close="certDialogVisible = false"
    @modal-confirm="handleSaveCert"
  >
    <div class="dialog-shell">
      <el-form :model="certForm" label-position="top" :rules="certRules" ref="certFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="注册证号" prop="certCode">
              <el-input v-model="certForm.certCode" placeholder="请输入注册证号" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册证名称" prop="certName">
              <el-input v-model="certForm.certName" placeholder="请输入注册证名称" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期开始">
              <el-date-picker
                v-model="certForm.validFrom"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期结束">
              <el-date-picker
                v-model="certForm.validTo"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="注册证扫描件">
              <el-input v-model="certForm.certFileUrl" placeholder="请输入注册证扫描件URL" maxlength="512" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册证状态">
              <el-select v-model="certForm.status" placeholder="选择状态" style="width: 100%">
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注说明">
              <el-input
                v-model="certForm.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息（选填）"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>

  <!-- 详情查看弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    title="注册证详情"
    :subtitle="viewingCert?.certName || ''"
    width="560px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingCert">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">注册证号</span>
            <span class="detail-value mono">{{ viewingCert.certCode }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">注册证名称</span>
            <span class="detail-value strong">{{ viewingCert.certName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">有效期开始</span>
            <span class="detail-value mono">{{ viewingCert.validFrom || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">有效期结束</span>
            <span class="detail-value mono" :class="{ 'expired-text': isExpired(viewingCert.validTo) }">
              {{ viewingCert.validTo || '-' }}
            </span>
          </div>
        </div>
      </div>
      <div class="detail-section" v-if="viewingCert.certFileUrl">
        <div class="detail-section-title">注册证文件</div>
        <div class="detail-item">
          <el-link type="primary" :href="viewingCert.certFileUrl" target="_blank">
            {{ viewingCert.certFileUrl }}
          </el-link>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">状态信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="status-badge" :class="viewingCert.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
              {{ viewingCert.statusName }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingCert.createTime) }}</span>
          </div>
        </div>
      </div>
      <div class="detail-section" v-if="viewingCert.remark">
        <div class="detail-section-title">备注说明</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingCert.remark }}
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
  MoreFilled,
  Switch,
  View,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import { certList, certDetail, certCreate, certUpdate, certDelete, type RegistrationCertVO, type CertQuery, type CreateCertDTO, type UpdateCertDTO } from '@/api/registrationCert'

export type CertCommand = 'edit' | 'view' | 'toggle' | 'delete'

// ========== 数据类型 ==========
interface CertForm {
  certCode: string
  certName: string
  validFrom: string
  validTo: string
  certFileUrl: string
  status: number | null
  remark: string
}

// ========== 状态 ==========
const loading = ref(false)
const searchText = ref('')
const filterStatus = ref<number | undefined>()
const selectedCert = ref<RegistrationCertVO | null>(null)
const tableRef = ref()

const certDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const certFormRef = ref<FormInstance>()
const editingCert = ref<RegistrationCertVO | null>(null)
const viewingCert = ref<RegistrationCertVO | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

const certForm = ref<CertForm>({
  certCode: '',
  certName: '',
  validFrom: '',
  validTo: '',
  certFileUrl: '',
  status: 1,
  remark: '',
})

// ========== 注册证列表 ==========
const certs = ref<RegistrationCertVO[]>([])

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
  if (key === 'status') filterStatus.value = value
}

// ========== 计算属性 ==========
const filteredCerts = computed(() => {
  const s = searchText.value.trim().toLowerCase()
  return certs.value.filter(c => {
    const matchSearch = !s || c.certCode.toLowerCase().includes(s) || c.certName.toLowerCase().includes(s)
    const matchStatus = filterStatus.value === undefined || c.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
})

// ========== 监听搜索和筛选变化 ==========
watch([searchText, filterStatus], () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})

// ========== 工具函数 ==========
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '--'
  return dateStr.slice(0, 10)
}

const getAvatarBg = (code: string): string => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c71585', '#f08080', '#20b2aa']
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getAvatarText = (code: string): string => {
  if (!code) return '?'
  return code.length >= 2 ? code.slice(0, 2) : code[0]
}

const isExpired = (validTo: string | undefined): boolean => {
  if (!validTo) return false
  return new Date(validTo) < new Date()
}

const isExpiringSoon = (validTo: string | undefined): boolean => {
  if (!validTo) return false
  const d = new Date(validTo)
  const now = new Date()
  const threeMonthsLater = new Date()
  threeMonthsLater.setMonth(now.getMonth() + 3)
  return d >= now && d <= threeMonthsLater
}

// ========== 方法 ==========
const loadData = async () => {
  loading.value = true
  try {
    const query: CertQuery = {
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      certCode: searchText.value.trim() || undefined,
      certName: searchText.value.trim() || undefined,
      status: filterStatus.value,
    }
    const res = await certList(query)
    certs.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedCert.value && certs.value.length > 0) {
      selectedCert.value = certs.value[0]
      tableRef.value?.setCurrentRow(certs.value[0])
    }
  } catch {
    // error handled by http interceptor
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchText.value = ''
  filterStatus.value = undefined
  pageInfo.currentPage = 1
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

const handleCurrentChange = (row: RegistrationCertVO | null) => {
  selectedCert.value = row
}

const getRowClassName = ({ row }: { row: RegistrationCertVO }) => {
  return selectedCert.value?.id === row.id ? 'selected-row' : ''
}

const handleCommand = (command: CertCommand, row: RegistrationCertVO) => {
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
  editingCert.value = null
  certForm.value = {
    certCode: '',
    certName: '',
    validFrom: '',
    validTo: '',
    certFileUrl: '',
    status: 1,
    remark: '',
  }
  certDialogVisible.value = true
}

const handleEdit = (cert: RegistrationCertVO) => {
  editingCert.value = cert
  certForm.value = {
    certCode: cert.certCode,
    certName: cert.certName,
    validFrom: cert.validFrom || '',
    validTo: cert.validTo || '',
    certFileUrl: cert.certFileUrl || '',
    status: cert.status,
    remark: cert.remark || '',
  }
  certDialogVisible.value = true
}

const handleView = async (cert: RegistrationCertVO) => {
  try {
    const res = await certDetail(cert.id)
    viewingCert.value = res
    detailDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleSaveCert = async () => {
  if (!certFormRef.value) return
  await certFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingCert.value) {
          const data: UpdateCertDTO = {
            certCode: certForm.value.certCode,
            certName: certForm.value.certName,
            validFrom: certForm.value.validFrom || undefined,
            validTo: certForm.value.validTo || undefined,
            certFileUrl: certForm.value.certFileUrl || undefined,
            status: certForm.value.status ?? 1,
            remark: certForm.value.remark || undefined,
          }
          await certUpdate(editingCert.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const data: CreateCertDTO = {
            certCode: certForm.value.certCode,
            certName: certForm.value.certName,
            validFrom: certForm.value.validFrom || undefined,
            validTo: certForm.value.validTo || undefined,
            certFileUrl: certForm.value.certFileUrl || undefined,
            remark: certForm.value.remark || undefined,
          }
          await certCreate(data)
          ElMessage.success('创建成功')
        }
        certDialogVisible.value = false
        loadData()
      } catch {
        // error handled by http interceptor
      }
    }
  })
}

const handleDelete = async (cert: RegistrationCertVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除注册证「${cert.certName}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await certDelete(cert.id)
    ElMessage.success('删除成功')
    if (selectedCert.value?.id === cert.id) {
      selectedCert.value = certs.value[0] || null
      if (certs.value[0]) {
        tableRef.value?.setCurrentRow(certs.value[0])
      }
    }
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleToggleStatus = async (cert: RegistrationCertVO) => {
  const newStatus = cert.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}注册证「${cert.certName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    const data: UpdateCertDTO = { status: newStatus }
    await certUpdate(cert.id, data)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

// ========== 校验规则 ==========
const certRules: FormRules = {
  certCode: [{ required: true, message: '请输入注册证号', trigger: 'blur' }],
  certName: [{ required: true, message: '请输入注册证名称', trigger: 'blur' }],
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── Cert 特有样式 ──
.cert-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .cert-avatar {
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

  .cert-detail {
    min-width: 0;
  }
}

.validity-cell {
  display: flex;
  align-items: center;
}

.mono-text {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
}

.expired-text {
  color: var(--el-color-danger) !important;
  text-decoration: line-through;
}

// ── 详情弹窗内部样式 ──
.cert-detail-dialog-shell {
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

.cert-dialog-shell {
  padding: 8px 0;
}
</style>
