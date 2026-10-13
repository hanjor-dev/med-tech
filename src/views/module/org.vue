<template>
  <list-template
    page-class="org"
    hero-eyebrow="基础数据"
    hero-title="机构管理"
    hero-desc="管理系统的机构信息，支持按机构名称、机构类型、地区、状态等条件筛选。"
    :stats="stats"
    filter-searchable
    filter-search-placeholder="搜索机构名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建机构"
    @filter-search="searchText = $event"
    @filter-reset="handleReset"
    @filter-create="handleCreate"
    @filter-change="onFilterChange"
  >
    <!-- 新建按钮权限控制 -->
    <template #filter-create-btn>
      <el-button type="primary" class="table-btn-primary" @click="handleCreate" v-permission="'org:Add'">
        <el-icon><Plus /></el-icon>新建机构
      </el-button>
    </template>

    <!-- 机构类型 Tab 切换（filter-bottom slot） -->
    <template #filter-bottom>
      <div class="segment-tabs" role="tablist">
        <button class="segment-tabs__btn" :class="{ 'is-active': activeOrgType === '' }"
          @click="switchOrgType('')">
          全部
        </button>
        <button v-for="opt in orgTypeOptions" :key="opt.value" class="segment-tabs__btn"
          :class="{ 'is-active': activeOrgType === opt.value }" @click="switchOrgType(opt.value)">
          {{ opt.label }}
        </button>
      </div>
    </template>

    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">机构列表</div>
            <el-button link type="primary" size="small" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="paginatedOrgs"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            stripe
          >
            <el-table-column label="机构信息" min-width="220">
              <template #default="{ row }">
                <div class="org-info-cell">
                  <div class="org-avatar" :style="{ background: getAvatarBg(row.orgName) }">
                    {{ getAvatarText(row.orgName) }}
                  </div>
                  <div class="org-detail">
                    <div class="role-name">{{ row.orgName }}</div>
                    <div class="role-description">
                      <el-tag size="small" type="primary" effect="plain">{{ row.orgCode }}</el-tag>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="机构类型" prop="orgTypeName" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.orgType === '1.1' ? 'primary' : row.orgType === '1.2' ? 'warning' : row.orgType === '1.3' ? 'success' : 'primary'" effect="plain">{{ row.orgTypeName || '-' }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="所属地区" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ row.areaName || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="联系人" prop="contact" width="100">
              <template #default="{ row }">
                <span>{{ row.contact || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="联系电话" width="140">
              <template #default="{ row }">
                <span>{{ row.phone || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="60" align="center" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd: OrgCommand) => handleCommand(cmd, row)">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                      <el-dropdown-menu>
                      <el-dropdown-item v-if="userInfoStore.hasPermission('org:Edit')" command="edit">
                        <el-icon><Edit /></el-icon>编辑机构
                      </el-dropdown-item>
                      <el-dropdown-item v-if="userInfoStore.hasPermission('org:Status')" command="toggle" :divided="true">
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '停用机构' : '启用机构' }}
                      </el-dropdown-item>
                      <el-dropdown-item v-if="userInfoStore.hasPermission('org:Delete')" command="delete" divided>
                        <span style="color: #e11d48">
                          <el-icon><Delete /></el-icon>删除机构
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
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedOrg }">
        <!-- 空状态 -->
        <div v-if="!selectedOrg" class="detail-empty">
          <el-empty description="请从左侧选择一家机构" :image-size="80" />
        </div>

        <!-- 已选机构详情 -->
        <el-card v-if="selectedOrg" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">机构详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedOrg.orgName }}</div>
              <el-tag size="small" :type="selectedOrg.status === 1 ? 'success' : 'info'" effect="plain">
                {{ selectedOrg.statusName }}
              </el-tag>
            </div>

            <el-tag size="small" effect="plain" type="primary" style="margin: 6px 0 12px;">
              {{ selectedOrg.orgCode }}
            </el-tag>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">机构类型</p>
                <p class="detail-value">
                  <el-tag size="small" :type="selectedOrg.orgType === '1.1' ? 'primary' : selectedOrg.orgType === '1.2' ? 'warning' : selectedOrg.orgType === '1.3' ? 'success' : 'primary'" effect="plain">{{ selectedOrg.orgTypeName || '未分类' }}</el-tag>
                </p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">所属地区</p>
                <p class="detail-value">{{ getAreaName(selectedOrg.areaId) }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">联系人</p>
                <p class="detail-value">{{ selectedOrg.contact || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">联系电话</p>
                <p class="detail-value">{{ selectedOrg.phone || '-' }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-item">
                <p class="detail-label">电子邮箱</p>
                <p class="detail-value">{{ selectedOrg.email || '-' }}</p>
              </div>
              <div class="detail-item">
                <p class="detail-label">创建时间</p>
                <p class="detail-value">{{ formatDate(selectedOrg.createTime) }}</p>
              </div>
            </div>
           
            <div class="detail-item" v-if="selectedOrg.address">
              <p class="detail-label">详细地址</p>
              <p class="detail-value">{{ selectedOrg.address }}</p>
            </div>
            <div class="detail-item" v-if="selectedOrg.qualificationFile">
              <p class="detail-label">资质文件</p>
              <div
                class="file-download-inline"
                :title="selectedQualFileInfo?.fileName"
                @click="handleDownloadFile(selectedOrg.qualificationFile, selectedQualFileInfo)"
              >
                <el-icon size="14"><Download /></el-icon>
                <span>{{ selectedQualFileInfo?.fileName || '点击下载' }}</span>
              </div>
            </div>
            <div class="detail-item" v-if="selectedOrg.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedOrg.remark }}</p>
            </div>
            
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedOrg)" v-permission="'org:Edit'">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑机构弹窗 -->
  <float-dialog
    v-model="orgDialogVisible"
    :title="editingOrg ? '编辑机构' : '新建机构'"
    subtitle="配置机构基本信息"
    width="680px"
    @modal-close="handleClose"
    @modal-confirm="handleSave"
  >
    <div class="dialog-shell">
      <el-form :model="orgForm" label-position="top" :rules="orgRules" ref="orgFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="机构名称" prop="orgName">
              <el-input v-model="orgForm.orgName" placeholder="请输入机构名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机构类型" prop="orgType">
              <el-select v-model="orgForm.orgType" placeholder="请选择机构类型" clearable style="width: 100%" :disabled="!!editingOrg" @change="handleOrgTypeChange">
                <el-option v-for="item in orgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属地区" prop="areaId">
              <el-select v-model="orgForm.areaId" placeholder="请选择所属地区" clearable style="width: 100%">
                <el-option
                  v-for="item in flatAreaOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址">
              <el-input v-model="orgForm.address" placeholder="请输入详细地址" maxlength="256" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="orgForm.contact" placeholder="请输入联系人" maxlength="32" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="orgForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="email">
              <el-input v-model="orgForm.email" placeholder="请输入联系邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码">
              <el-input v-model="orgForm.creditCode" placeholder="请输入信用代码" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 资质信息（经销商1.2 & 医疗机构1.3 & 其他1.4 可见） -->
        <el-row :gutter="16" v-if="orgForm.orgType && orgForm.orgType !== '1.1'">
          <el-col :span="12">
            <el-form-item label="资质类型" prop="qualificationType">
              <el-select v-model="orgForm.qualificationType" placeholder="请选择资质类型" clearable style="width: 100%">
                <el-option label="医疗器械" :value="1" />
                <el-option label="非医疗器械" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资质文件" :prop="orgForm.qualificationType === 1 ? 'qualificationFile' : ''">
              <uploadFile
                :model-value="orgForm.qualificationFile"
                :limit="1"
                :show-tips="true"
                tips-text="支持zip,rar,tar,7z格式"
                accept=".zip,.rar,.tar,.7z"
                button-text="上传资质文件"
                :upload-data="{ bizType: '10.12' }"
                :initial-files="qualFileInitialFiles"
                @success="handleQualUploadSuccess"
                @remove="handleQualUploadRemove"
                @preview="handleQualUploadPreview"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 关联医院（经销商1.2 & 服务商1.4可见） -->
        <el-row :gutter="16" v-if="orgForm.orgType === '1.2' || orgForm.orgType === '1.4'">
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>关联医疗机构</span>
                <el-button
                  link
                  type="primary"
                  size="small"
                  class="select-all-hospitals"
                  @click="toggleAllHospitals"
                >
                  {{ isAllHospitalsSelected ? '取消全选' : '一键全选' }}
                </el-button>
              </template>
              <el-select
                v-model="orgForm.hospitalOrgIds"
                multiple
                placeholder="请选择关联的医疗机构"
                style="width: 100%"
                filterable
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option
                  v-for="item in hospitalOptions"
                  :key="item.id"
                  :label="item.orgName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号前缀" prop="usernamePrefix">
              <el-input v-model="orgForm.usernamePrefix" placeholder="英文字母和数字，2-16位" :disabled="!!editingOrg" maxlength="16" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 医院等级/类型（仅医疗机构1.3可见） -->
        <el-row :gutter="16" v-if="orgForm.orgType === '1.3'">
          <el-col :span="12">
            <el-form-item label="医院等级">
              <el-select v-model="orgForm.hospitalLevel" placeholder="请选择医院等级" clearable style="width: 100%">
                <el-option v-for="item in hospitalLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医院类型">
              <el-select v-model="orgForm.hospitalType" placeholder="请选择医院类型" clearable style="width: 100%">
                <el-option v-for="item in hospitalTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="orgForm.remark"
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
  </float-dialog>

  <!-- 机构详情弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    title="机构详情"
    :subtitle="viewingOrg?.orgName || ''"
    width="560px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingOrg">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">机构编码</span>
            <span class="detail-value mono">{{ viewingOrg.orgCode }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">机构名称</span>
            <span class="detail-value strong">{{ viewingOrg.orgName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">机构类型</span>
            <span class="detail-value">{{ viewingOrg.orgTypeName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">所属地区</span>
            <span class="detail-value">{{ getAreaName(viewingOrg.areaId) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系人</span>
            <span class="detail-value">{{ viewingOrg.contact || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话</span>
            <span class="detail-value mono">{{ viewingOrg.phone || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系邮箱</span>
            <span class="detail-value mono">{{ viewingOrg.email || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">统一社会信用代码</span>
            <span class="detail-value mono">{{ viewingOrg.creditCode || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="viewingOrg.qualificationFile">
        <div class="detail-section-title">资质信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">资质类型</span>
            <span class="detail-value">{{ viewingOrg.qualificationType === 1 ? '医疗器械' : '非医疗器械' }}</span>
          </div>
        </div>
        <div class="file-download-card" @click="handleDownloadFile(viewingOrg.qualificationFile, viewingQualFileInfo)">
          <el-icon class="file-icon"><Download /></el-icon>
          <div class="file-info">
            <span class="file-name">{{ viewingQualFileInfo?.fileName || '资质文件' }}</span>
            <span class="file-hint">点击下载</span>
          </div>
          <el-icon class="arrow-icon"><View /></el-icon>
        </div>
      </div>

      <div class="detail-section" v-if="viewingOrg.address">
        <div class="detail-section-title">详细地址</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingOrg.address }}
          </span>
        </div>
      </div>

      <div class="detail-section" v-if="viewingOrg.hospitalOrgNames?.length">
        <div class="detail-section-title">关联医疗机构</div>
        <div class="hospital-tags">
          <el-tag v-for="name in viewingOrg.hospitalOrgNames" :key="name" size="small" style="margin: 0 4px 4px 0">
            {{ name }}
          </el-tag>
        </div>
      </div>

      <div class="detail-section" v-if="viewingOrg.orgType === '1.3' && (viewingOrg.hospitalLevelName || viewingOrg.hospitalTypeName)">
        <div class="detail-section-title">医院信息</div>
        <div class="detail-grid-2">
          <div class="detail-item" v-if="viewingOrg.hospitalLevelName">
            <span class="detail-label">医院等级</span>
            <span class="detail-value">{{ viewingOrg.hospitalLevelName }}</span>
          </div>
          <div class="detail-item" v-if="viewingOrg.hospitalTypeName">
            <span class="detail-label">医院类型</span>
            <span class="detail-value">{{ viewingOrg.hospitalTypeName }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="viewingOrg.remark">
        <div class="detail-section-title">备注说明</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingOrg.remark }}
          </span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">时间记录</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingOrg.createTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">更新时间</span>
            <span class="detail-value mono">{{ formatDate(viewingOrg.updateTime) }}</span>
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
  CircleCheck,
  Download,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import floatDialog from '@/components/floatDialog.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import uploadFile from '@/components/uploadFile.vue'
import { orgList, orgStatistics, orgDetail, orgCreate, orgUpdate, orgDelete, orgChangeStatus, orgCheckRemove, orgCheckDisable, orgHospitalChangeCheck, orgAll, exportOrgList, type OrgVO, type OrgStatisticsVO, type CreateOrgDTO, type UpdateOrgDTO } from '@/api/org'
import { fileDetail, fileDownload } from '@/api/file'
import { getSelectOptions } from '@/api/param'
import { getDictOptions } from '@/utils/dict'
import { useUserInfo } from '@/stores/userInfo'

export type OrgCommand = 'edit' | 'view' | 'toggle' | 'delete'

const userInfoStore = useUserInfo()

// ========== Data ==========
// ── Types ──
interface OrgForm {
  orgName: string
  orgType: string
  areaId: number | undefined
  address: string
  contact: string
  phone: string
  email: string
  creditCode: string
  qualificationFile: string
  qualificationType: number | null
  hospitalOrgIds: number[]
  hospitalLevel: string
  hospitalType: string
  usernamePrefix: string
  status: number | null
  remark: string
}

// ── State ──
const loading = ref(false)
const searchText = ref('')
const filterOrgType = ref<string | undefined>()
const filterAreaId = ref<number | undefined>()
const filterStatus = ref<number | undefined>()
const selectedOrg = ref<OrgVO | null>(null)
const tableRef = ref()

const orgDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const orgFormRef = ref<FormInstance>()
const editingOrg = ref<OrgVO | null>(null)
const viewingOrg = ref<OrgVO | null>(null)
const selectedQualFileInfo = ref<{ fileName: string; fileUrl: string } | null>(null)
const viewingQualFileInfo = ref<{ fileName: string; fileUrl: string } | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

const orgForm = ref<OrgForm>({
  orgName: '',
  orgType: '',
  areaId: undefined,
  address: '',
  contact: '',
  phone: '',
  email: '',
  creditCode: '',
  qualificationFile: '',
  qualificationType: null,
  hospitalOrgIds: [],
  hospitalLevel: '',
  hospitalType: '',
  usernamePrefix: '',
  status: 1,
  remark: '',
})

// ── List Data ──
const orgs = ref<OrgVO[]>([])

// ── Dict Data ──
const orgTypeOptions = ref<{ label: string; value: string }[]>([])
const hospitalLevelOptions = ref<{ label: string; value: string }[]>([])
const hospitalTypeOptions = ref<{ label: string; value: string }[]>([])
const areaOptions = ref<any[]>([])

// ── All Orgs（用于经销商关联医院选择） ──
const allOrgs = ref<OrgVO[]>([])
const organizationStatistics = ref<OrgStatisticsVO | null>(null)

// ========== Computed ==========
const hospitalOptions = computed(() =>
  allOrgs.value.filter(item => item.orgType === '1.3')
)

const isAllHospitalsSelected = computed(() =>
  hospitalOptions.value.length > 0 &&
  hospitalOptions.value.every(item => orgForm.value.hospitalOrgIds.includes(item.id))
)

// ── Stats ──
const stats = computed(() => [
  {
    label: '机构总数',
    value: organizationStatistics.value?.total ?? '—',
    icon: OfficeBuilding,
  },
  {
    label: '经销商',
    value: organizationStatistics.value?.distributor ?? '—',
    icon: OfficeBuilding,
  },
  {
    label: '服务商',
    value: organizationStatistics.value?.serviceProvider ?? '—',
    icon: OfficeBuilding,
  },
  {
    label: '医疗机构',
    value: organizationStatistics.value?.medicalInstitution ?? '—',
    icon: CircleCheck,
  },
])

// ── Filter Selects ──
const filterSelects = computed(() => [
  {
    modelKey: 'areaId',
    placeholder: '所属地区',
    options: flatAreaOptions.value,
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

// ── Area Options ──
const flatAreaOptions = computed(() => {
  return (areaOptions.value as any[]).map((item: any) => ({
    label: item.name,
    value: item.id,
  }))
})

// ── Org Type Tab ──
const activeOrgType = ref<string>('')
const switchOrgType = (val: string) => {
  activeOrgType.value = val
  pageInfo.currentPage = 1
  loadData()
}

// ── Pagination ──
const paginatedOrgs = computed(() => orgs.value)

// ========== Watchers ==========
onMounted(async () => {
  loadData()
  loadStatistics()
    const [orgType, level, type, area, all] = await Promise.all([
      getDictOptions('1'),
      getDictOptions('3'),
      getDictOptions('4'),
      getSelectOptions('area', 0) as unknown as Promise<any[]>,
      orgAll() as unknown as Promise<OrgVO[]>,
    ])
  orgTypeOptions.value = orgType
  hospitalLevelOptions.value = level
  hospitalTypeOptions.value = type
  areaOptions.value = area
  allOrgs.value = all || []
})

watch([searchText, filterOrgType, filterAreaId, filterStatus], () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})

// 加载右侧面板资质文件信息
watch(() => selectedOrg.value?.qualificationFile, async (fileId) => {
  if (!fileId) {
    selectedQualFileInfo.value = null
    return
  }
  try {
    const info = await fileDetail(fileId)
    selectedQualFileInfo.value = { fileName: info.fileName, fileUrl: info.fileUrl }
  } catch {
    selectedQualFileInfo.value = null
  }
}, { immediate: true })

// ========== Methods ==========
// ── Utils ──
const onFilterChange = (key: string, value: any) => {
  if (key === 'orgType') filterOrgType.value = value
  if (key === 'areaId') filterAreaId.value = value
  if (key === 'status') filterStatus.value = value
}

const getAreaName = (areaId: number | string | undefined): string => {
  if (!areaId) return '-'
  const aid = typeof areaId === 'string' ? Number(areaId) : areaId
  const found = (areaOptions.value as any[]).find((item: any) => item.id === aid)
  return found?.name || '-'
}

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

const handleQualUploadSuccess = (_file: UploadFile, res: any) => {
  if (res?.data?.fileUrl) orgForm.value.qualificationFile = res.data.id
}

const handleQualUploadRemove = () => {
  orgForm.value.qualificationFile = ''
}

const handleQualUploadPreview = (file: UploadFile) => {
  if (file.url) window.open(file.url, '_blank')
}

const qualFileInitialFiles = ref<UploadFile[]>([])

watch(() => orgForm.value.qualificationFile, async (fileId) => {
  if (!fileId) {
    qualFileInitialFiles.value = []
    return
  }
  try {
    const fileInfo = await fileDetail(fileId)
    qualFileInitialFiles.value = [{
      name: fileInfo.fileName,
      url: fileInfo.fileUrl,
      size: fileInfo.fileSize,
      raw: fileInfo as any,
      status: 'success',
      uid: fileId as any,
    }]
  } catch {
    qualFileInitialFiles.value = []
  }
}, { immediate: true })

const handleOrgTypeChange = async (val: string | undefined, skipClear = false) => {
  if (!skipClear) {
    orgForm.value.hospitalLevel = ''
    orgForm.value.hospitalType = ''
    orgForm.value.hospitalOrgIds = []
  }
  if (val === '1.3') {
    if (hospitalLevelOptions.value.length === 0) {
      const [level, type] = await Promise.all([getDictOptions('3'), getDictOptions('4')])
      hospitalLevelOptions.value = level
      hospitalTypeOptions.value = type
    }
  }
}

// ── Data Fetch ──
const loadData = async () => {
  loading.value = true
  try {
    const res = await orgList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      orgName: searchText.value.trim() || undefined,
      orgType: activeOrgType.value || undefined,
      areaId: filterAreaId.value,
      status: filterStatus.value,
    })
    orgs.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedOrg.value && orgs.value.length > 0) {
      selectedOrg.value = orgs.value[0]
      tableRef.value?.setCurrentRow(orgs.value[0])
    }
  } catch {
    // error handled by http interceptor
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try { organizationStatistics.value = await orgStatistics() } catch (error) {
    organizationStatistics.value = null
    console.error('加载机构统计失败', error)
  }
}

const toggleAllHospitals = () => {
  orgForm.value.hospitalOrgIds = isAllHospitalsSelected.value
    ? []
    : hospitalOptions.value.map(item => item.id)
}

const handleReset = () => {
  searchText.value = ''
  filterOrgType.value = undefined
  filterAreaId.value = undefined
  filterStatus.value = undefined
  pageInfo.currentPage = 1
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

// ── Row Selection ──
const handleCurrentChange = (row: OrgVO | null) => {
  selectedOrg.value = row
}

const getRowClassName = ({ row }: { row: OrgVO }) => {
  return selectedOrg.value?.id === row.id ? 'selected-row' : ''
}

// ── Command ──
const handleDropdownCommand = (cmd: any) => {
  const row = selectedOrg.value
  if (!row) return
  handleCommand(cmd as OrgCommand, row)
}

const handleCommand = (command: OrgCommand, row: OrgVO) => {
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

// ── Dialog ──
const handleCreate = () => {
  editingOrg.value = null
  orgForm.value = {
    orgName: '',
    orgType: '',
    areaId: undefined,
    address: '',
    contact: '',
    phone: '',
    email: '',
    creditCode: '',
    qualificationFile: '',
    qualificationType: null,
    hospitalOrgIds: [],
    hospitalLevel: '',
    hospitalType: '',
    usernamePrefix: '',
    status: 1,
    remark: '',
  }
  orgDialogVisible.value = true
}

const handleExport = async () => {
  try {
    const { blob, fileName } = await exportOrgList()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleEdit = async (org: OrgVO) => {
  try {
    const detail = await orgDetail(org.id)
    editingOrg.value = detail
    orgForm.value = {
      orgName: detail.orgName,
      orgType: detail.orgType,
      areaId: detail.areaId ?? undefined,
      address: detail.address || '',
      contact: detail.contact || '',
      phone: detail.phone || '',
      email: detail.email || '',
      creditCode: detail.creditCode || '',
      qualificationFile: detail.qualificationFile || '',
      qualificationType: detail.qualificationType ?? null,
      hospitalOrgIds: detail.hospitalOrgIds || [],
      hospitalLevel: detail.hospitalLevel || '',
      hospitalType: detail.hospitalType || '',
      usernamePrefix: detail.usernamePrefix || '',
      status: detail.status,
      remark: detail.remark || '',
    }
    await handleOrgTypeChange(detail.orgType, true)
    orgDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleView = async (org: OrgVO) => {
  try {
    const res = await orgDetail(org.id)
    viewingOrg.value = res
    // 加载弹窗资质文件信息
    if (res.qualificationFile) {
      try {
        const info = await fileDetail(res.qualificationFile)
        viewingQualFileInfo.value = { fileName: info.fileName, fileUrl: info.fileUrl }
      } catch {
        viewingQualFileInfo.value = null
      }
    } else {
      viewingQualFileInfo.value = null
    }
    detailDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleClose = () => {
  orgDialogVisible.value = false
  editingOrg.value = null
}

const handleSave = async () => {
  if (!orgFormRef.value) return
  await orgFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingOrg.value) {
          const isDistributor = editingOrg.value.orgType === '1.2' || editingOrg.value.orgType === '1.4'
          const originalHospitalIds = editingOrg.value.hospitalOrgIds || []
          const newHospitalIds = orgForm.value.hospitalOrgIds

          // 经销商关联医院变更前预检查
          if (isDistributor) {
            const originalSet = new Set(originalHospitalIds)
            const newSet = new Set(newHospitalIds)
            const changed = originalHospitalIds.length !== newHospitalIds.length ||
              newHospitalIds.some(id => !originalSet.has(id)) ||
              originalHospitalIds.some(id => !newSet.has(id))

            if (changed) {
              const check = await orgHospitalChangeCheck(editingOrg.value.id, newHospitalIds)
              if (check.affected) {
                const hospitalList = (check.removedHospitals || []).map(h => `• ${h.orgName}`).join('<br>')
                const userList = (check.affectedUsers || []).map(u =>
                  `• ${u.realName}（失去 ${u.removedHospitalIds.length} 家医院权限）`
                ).join('<br>')

                const confirmMsg = check.message + '<div style="text-align:left;margin-top:10px;font-size:13px;color:#4b5563;line-height:1.8">'
                  + (hospitalList ? `<b>被移除的医院：</b><br>${hospitalList}<br>` : '')
                  + (userList ? `<b>受影响的业务员：</b><br>${userList}` : '')
                  + '</div>'

                await ElMessageBox.confirm(
                  confirmMsg,
                  '提示',
                  { type: 'warning', customClass: 'auth-confirm-dialog', dangerouslyUseHTMLString: true }
                )
              }
            }
          }

          const data: UpdateOrgDTO = {
            orgName: orgForm.value.orgName,
            areaId: orgForm.value.areaId ? Number(orgForm.value.areaId) : undefined,
            address: orgForm.value.address || undefined,
            contact: orgForm.value.contact || undefined,
            phone: orgForm.value.phone || undefined,
            email: orgForm.value.email || undefined,
            creditCode: orgForm.value.creditCode || undefined,
            qualificationFile: orgForm.value.qualificationFile || undefined,
            qualificationType: orgForm.value.qualificationType ?? undefined,
            hospitalOrgIds: orgForm.value.hospitalOrgIds,
            hospitalLevel: orgForm.value.hospitalLevel || undefined,
            hospitalType: orgForm.value.hospitalType || undefined,
            usernamePrefix: orgForm.value.usernamePrefix || undefined,
            status: orgForm.value.status ?? 1,
            remark: orgForm.value.remark || undefined,
          }
          await orgUpdate(editingOrg.value.id, data)
          ElMessage.success('修改成功')
          const detail = await orgDetail(editingOrg.value.id)
          selectedOrg.value = detail
        } else {
          const data: CreateOrgDTO = {
            orgName: orgForm.value.orgName,
            orgType: orgForm.value.orgType,
            areaId: orgForm.value.areaId ? Number(orgForm.value.areaId) : undefined,
            address: orgForm.value.address || undefined,
            contact: orgForm.value.contact || undefined,
            phone: orgForm.value.phone || undefined,
            email: orgForm.value.email || undefined,
            creditCode: orgForm.value.creditCode || undefined,
            qualificationFile: orgForm.value.qualificationFile || undefined,
            qualificationType: orgForm.value.qualificationType ?? undefined,
            hospitalOrgIds: orgForm.value.hospitalOrgIds,
            hospitalLevel: orgForm.value.hospitalLevel || undefined,
            hospitalType: orgForm.value.hospitalType || undefined,
            usernamePrefix: orgForm.value.usernamePrefix || undefined,
            remark: orgForm.value.remark || undefined,
          }
          await orgCreate(data)
          ElMessage.success('创建成功')
        }
        orgDialogVisible.value = false
        loadData()
        allOrgs.value = (await orgAll() as unknown as OrgVO[]) || []
      } catch {
        // error handled by http interceptor
      }
    }
  })
}

const handleDelete = async (org: OrgVO) => {
  try {
    const check = await orgCheckRemove(org.id)
    let confirmMsg = check.message || `确定要删除机构「${org.orgName}」吗？删除后不可恢复。`

    if (check.affected) {
      const userList = (check.affectedUsers || []).map(u => `• ${u.realName}`).join('<br>')
      const doctorList = (check.affectedDoctors || []).map(d => `• ${d.doctorName}`).join('<br>')

      confirmMsg += '<div style="text-align:left;margin-top:10px;font-size:13px;color:#4b5563;line-height:1.8">'
      if (userList) confirmMsg += `<b>受影响用户：</b><br>${userList}<br>`
      if (doctorList) confirmMsg += `<b>受影响医生：</b><br>${doctorList}`
      confirmMsg += '</div>'
    }

    await ElMessageBox.confirm(
      confirmMsg,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger', dangerouslyUseHTMLString: true }
    )
    await orgDelete(org.id)
    ElMessage.success('删除成功')
    if (selectedOrg.value?.id === org.id) {
      selectedOrg.value = orgs.value[0] || null
      if (orgs.value[0]) {
        tableRef.value?.setCurrentRow(orgs.value[0])
      }
    }
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleToggleStatus = async (org: OrgVO) => {
  const newStatus = org.status === 1 ? 0 : 1
  try {
    if (newStatus === 0) {
      const check = await orgCheckDisable(org.id)
      let confirmMsg = check.message || `确定要停用机构「${org.orgName}」吗？`

      if (check.affected) {
        const userList = (check.affectedUsers || []).map(u => `• ${u.realName}`).join('<br>')
        confirmMsg += '<div style="text-align:left;margin-top:10px;font-size:13px;color:#4b5563;line-height:1.8">'
        if (userList) confirmMsg += `<b>将被踢出的用户：</b><br>${userList}`
        confirmMsg += '</div>'
      }

      await ElMessageBox.confirm(
        confirmMsg,
        '提示',
        { type: 'warning', customClass: 'auth-confirm-dialog', dangerouslyUseHTMLString: true }
      )
    } else {
      await ElMessageBox.confirm(
        `确定要启用机构「${org.orgName}」吗？`,
        '提示',
        { type: 'warning', customClass: 'auth-confirm-dialog' }
      )
    }
    await orgChangeStatus(org.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

// ========== File ==========
const handleDownloadFile = async (fileId: string, fileInfo?: { fileName: string; fileUrl: string } | null) => {
  if (!fileId) return
  try {
    let info = fileInfo
    if (!info) {
      info = await fileDetail(fileId)
    }
    if (info?.fileUrl) {
      const link = document.createElement('a')
      link.href = info.fileUrl
      link.download = info.fileName || '下载文件'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      ElMessage.warning('文件下载地址不存在')
    }
  } catch {
    ElMessage.error('获取文件信息失败')
  }
}

// ========== Validation ==========
const validateQualificationFile = (_rule: any, value: string, callback: any) => {
  if (orgForm.value.qualificationType === 1 && !value) {
    callback(new Error('资质类型为"医疗器械"时，资质文件不能为空'))
  } else {
    callback()
  }
}

const validateUsernamePrefix = (_rule: any, _value: any, callback: any) => {
  if ((orgForm.value.orgType === '1.2' || orgForm.value.orgType === '1.4') && !orgForm.value.usernamePrefix) {
    callback(new Error('经销商账号前缀不能为空'))
  } else {
    callback()
  }
}

const validateEmail = (_rule: any, value: string, callback: any) => {
  if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const validatePhone = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const mobile = /^1[3-9]\d{9}$/
  const tel = /^0\d{2,3}-?\d{7,8}$/
  if (!mobile.test(value) && !tel.test(value)) {
    callback(new Error('请输入正确的手机号或座机号码'))
  } else {
    callback()
  }
}

const orgRules: FormRules = {
  orgName: [
    { required: true, message: '请输入机构名称', trigger: 'blur' },
    { max: 30, message: '机构名称最多30个字符', trigger: 'blur' },
  ],
  orgType: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
  areaId: [{ required: true, message: '请选择所属地区', trigger: 'change' }],
  // qualificationType: [{ required: true, message: '请选择资质类型', trigger: 'change' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  usernamePrefix: [{ validator: validateUsernamePrefix, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  qualificationFile: [{ validator: validateQualificationFile, trigger: 'blur' }],
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── 机构信息列 ──
.org-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .org-avatar {
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

  .org-detail {
    min-width: 0;
  }
}

// ── 表格容器滚动条 ──
.roles-list-wrap {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d0d7de;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
}

// ── File Download ──
.file-download-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    background: #f0f7ff;
  }

  .file-icon {
    font-size: 20px;
    color: #409eff;
    flex-shrink: 0;
  }

  .file-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .file-name {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  .file-hint {
    font-size: 11px;
    color: #9ca3af;
  }

  .arrow-icon {
    font-size: 14px;
    color: #9ca3af;
  }
}

.file-download-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;

  &:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
}

.dialog-shell {
  height: 450px;
  overflow: auto;

}
</style>
