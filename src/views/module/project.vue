<template>
  <list-template
    page-class="rebuild-project"
    hero-eyebrow="基础数据"
    hero-title="重建项目与部位"
    hero-desc="管理重建项目与部位信息，支持按项目分类等条件筛选。"
    :stats="stats"
    :hide-filter="false"
    :show-filter-create="false"
    :filter-selects="filterSelects"
    :filter-inputs="filterInputs"
    @filter-change="onFilterChange"
    @filter-input-change="onFilterInputChange"

  >
    <!-- Tree Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">部位与重建项目</span>
            <div class="card-actions">
              <el-button link type="primary" size="small" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
              <el-button :icon="Plus" size="small" plain @click="handleCreateProject(null)" v-permission="'project:Add'">
                新建重建项目
              </el-button>
            </div>
          </div>
        </template>
        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="bodyPartTableData"
            row-key="uid"
            highlight-current-row
            @current-change="handleCurrentChange"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            stripe
          >
            <el-table-column label="名称" width="400">
              <template #default="{ row }">
                <div class="project-tree-name-cell">
                  <i class="iconfont project-tree-icon" :class="getTreeIconClass(row)">&#xe641;</i>
                  <span class="project-tree-name-cell__label">{{ row.name }}</span>
                  <el-tag v-if="row.code" size="small" effect="plain" class="project-tree-code-tag">{{ row.code }}</el-tag>
                  <span v-if="row.children?.length" class="project-tree-name-cell__count">{{ row.children.length }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="分类" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.categoryCodeName" size="small" effect="plain" type="warning">{{ row.categoryCodeName }}</el-tag>
                <el-tag v-else size="small" effect="plain" :type="getLevelTagType(row.level)">{{ getLevelLabel(row.level) }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="备注" width="250" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="remark-text">{{ row.remark || '-' }}</span>
              </template>
            </el-table-column>

            <!-- <el-table-column label="标准价格" width="120" align="right">
              <template #default="{ row }">
                <span class="price-text" v-if="row.standardPrice != null">
                  ¥{{ Number(row.standardPrice).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
                </span>
                <span class="data-scope-text" v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="加急价格" width="120" align="right">
              <template #default="{ row }">
                <span class="price-text urgent" v-if="row.urgentPrice != null">
                  ¥{{ Number(row.urgentPrice).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
                </span>
                <span class="data-scope-text" v-else>-</span>
              </template>
            </el-table-column> -->

            <!-- <el-table-column label="排序" width="70" align="center">
              <template #default="{ row }">
                <span class="project-sort-num">{{ row.sort ?? 0 }}</span>
              </template>
            </el-table-column> -->

            <el-table-column label="状态" align="center">
              <template #default="{ row }">
                <div class="status-cell" style="justify-content: center;">
                  <el-switch :model-value="row.status === 1" @change="handleToggleStatus(row)" v-permission="'project:Status'" />
                  <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                    {{ row.statusName }}
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd) => handleTableCommand(cmd, row)">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <template v-if="row.entityType === 'bodyPart'">
                        <el-dropdown-item v-if="hasPermission('project:Add')" command="addChild">
                          <el-icon><Plus /></el-icon>新建重建项目
                        </el-dropdown-item>
                      </template>
                      <template v-else>
                        <el-dropdown-item v-if="hasPermission('project:Edit')" command="edit">
                          <el-icon><Edit /></el-icon>编辑项目
                        </el-dropdown-item>
                        <el-dropdown-item v-if="hasPermission('project:Delete')" command="delete" divided>
                          <span style="color: #e11d48"><el-icon><Delete /></el-icon>删除项目</span>
                        </el-dropdown-item>
                      </template>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- Detail Panel -->
    <div class="page-body-panel panel-flex-1 ml-10">
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedItem }">
        <div v-if="!selectedItem" class="detail-empty">
          <el-empty description="请从左侧选择一项" :image-size="80" />
        </div>

        <el-card v-if="selectedItem" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedItem.name }}</div>
              <span class="status-badge"
                :class="selectedItem.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedItem.statusName }}
              </span>
            </div>

            <el-tag size="small" effect="plain" :type="getLevelTagType(selectedItem.level)" style="margin: 6px 0 12px;">
              {{ getLevelLabel(selectedItem.level) }}
            </el-tag>

            <!-- <div class="detail-stats" v-if="selectedItem.entityType === 'rebuildProject'">
              <div class="detail-stat">
                <p class="detail-label">标准价格</p>
                <p class="detail-value" v-if="selectedItem.standardPrice != null">
                  ¥{{ Number(selectedItem.standardPrice).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
                </p>
                <p class="detail-value" v-else>-</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">加急价格</p>
                <p class="detail-value" v-if="selectedItem.urgentPrice != null">
                  ¥{{ Number(selectedItem.urgentPrice).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
                </p>
                <p class="detail-value" v-else>-</p>
              </div>
            </div> -->
            <div class="detail-stats" v-if="selectedItem.entityType === 'rebuildProject'">
              <div class="detail-stat">
                <p class="detail-label">项目分类</p>
                <p class="detail-value">{{ selectedItem.categoryName || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">关联部位</p>
                <p class="detail-value">{{ selectedItem.bodyPartName || '-' }}</p>
              </div>
            </div>
            <!-- <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">排序</p>
                <p class="detail-value">{{ selectedItem.sort ?? 0 }}</p>
              </div>
            </div> -->
            <div class="detail-item" v-if="selectedItem.entityType === 'rebuildProject' && selectedItem.estimatedHours != null">
              <p class="detail-label">预计耗时</p>
              <p class="detail-value">{{ selectedItem.estimatedHours }} 小时</p>
            </div>
            <div class="detail-item" v-if="selectedItem.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedItem.remark }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value">{{ formatDate(selectedItem.createTime) }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedItem)" v-permission="'project:Edit'">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑部位弹窗 -->
  <dialog-modal
    v-model="partDialogVisible"
    :title="editingPart ? '编辑部位' : '新建部位'"
    subtitle="配置部位基本信息"
    width="560px"
    @modal-close="partDialogVisible = false"
    @modal-confirm="handleSavePart"
  >
    <div class="dialog-shell">
      <el-form :model="partForm" label-position="top" :rules="partRules" ref="partFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="部位名称" prop="name">
              <el-input v-model="partForm.name" placeholder="请输入部位名称" maxlength="100" :disabled="!!editingPart" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="部位区域">
              <div class="scope-picker-row">
                <el-button size="small" @click="scopePickerVisible = true" :disabled="!!editingPart">
                  <el-icon><Edit /></el-icon>{{ editingPart ? editingPart.name : '选取区域' }}
                </el-button>
                <el-tag v-if="partForm.scope || scopePickerInitialCode" type="success" size="small" :closable="!editingPart" @close="partForm.scope = ''">
                  已设置
                </el-tag>
                <el-tag v-else type="info" size="small">未设置</el-tag>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="partForm.remark"
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

  <!-- 部位区域选取 -->
  <imageAreaPicker
    v-model="scopePickerVisible"
    :image-src="humanImageSrc"
    :initial-rect="partForm.scope || null"
    :initial-code="scopePickerInitialCode"
    @confirm="onScopeConfirm"
  />

  <!-- 关联部位图形选取 -->
  <imageAreaPicker
    v-model="bodyPartPickerVisible"
    :title="'选择关联部位'"
    :initial-code="bodyPartPickerInitialCode"
    @confirm="onBodyPartPickerConfirm"
  />

  <!-- 新建/编辑重建项目弹窗 -->
  <dialog-modal
    v-model="projectDialogVisible"
    :title="editingProject ? '编辑重建项目' : '新建重建项目'"
    subtitle="配置重建项目基本信息"
    width="680px"
    @modal-close="projectDialogVisible = false"
    @modal-confirm="handleSaveProject"
  >
    <div class="dialog-shell">
      <el-form :model="projectForm" label-position="top" :rules="projectRules" ref="projectFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="关联部位" prop="bodyPartId">
              <div class="body-part-picker-btn-row">
                <el-button size="default" @click="bodyPartPickerVisible = true" :disabled="!!editingProject">
                  <el-icon><Edit /></el-icon>
                  {{ projectForm.bodyPartId
                    ? (bodyPartSelectOptions.find(p => p.id === projectForm.bodyPartId)?.name ?? '已选择部位')
                    : '点击选择部位' }}
                </el-button>
                <el-tag v-if="projectForm.bodyPartId" type="success" size="small" closable @close="projectForm.bodyPartId = null">
                  已设置
                </el-tag>
                <el-tag v-else type="info" size="small">未设置</el-tag>
              </div>
              <div v-if="mirrorBodyPart && !editingProject" style="margin-top: 6px;">
                <el-checkbox v-model="mirrorChecked">
                  同时为「{{ mirrorBodyPart.name }}」创建相同项目
                </el-checkbox>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目分类">
              <el-select v-model="projectForm.categoryCode" placeholder="请选择项目分类" clearable style="width: 100%">
                <el-option v-for="item in categoryCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业方向">
              <el-select v-model="projectForm.specialty" placeholder="请选择专业方向" clearable style="width: 100%">
                <el-option v-for="item in specialtyOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="projectForm.name" placeholder="请输入重建项目名称" maxlength="25" show-word-limit />
            </el-form-item> 
          </el-col>
        </el-row>


        <!-- <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="标准价格">
              <el-input-number
                v-model="projectForm.standardPrice"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="¥0.00"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加急价格">
              <el-input-number
                v-model="projectForm.urgentPrice"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="¥0.00"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row> -->

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="预计耗时（小时）">
              <el-input-number
                v-model="projectForm.estimatedHours"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                placeholder="0.0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="积分">
              <el-input-number
                v-model="projectForm.points"
                :min="0"
                :precision="0"
                placeholder="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="项目说明模板">
              <el-input
                v-model="projectForm.description"
                type="textarea"
                :rows="3"
                maxlength="512"
                show-word-limit
                placeholder="请输入项目说明模板（选填）"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="成形需求模板">
              <el-input
                v-model="projectForm.formingRequirements"
                type="textarea"
                :rows="3"
                maxlength="512"
                show-word-limit
                placeholder="请输入成形需求模板（选填）"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="projectForm.remark"
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

      <!-- 部位图形选择器（选中的部位高亮） -->
      <!-- <div class="body-part-picker-wrap">
        <div class="body-part-picker-label">部位图示</div>
        <humanBodyPartSelect
          v-model="projectForm.bodyPartId"
          @select="onBodyPartImageSelect"
        />
      </div> -->
    </div>
  </dialog-modal>

  <!-- 详情弹窗 -->
  <dialog-modal
    v-model="detailDialogVisible"
    :title="viewingItem?.entityType === 'bodyPart' ? '部位详情' : '重建项目详情'"
    :subtitle="viewingItem?.name || ''"
    width="600px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingItem">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">{{ viewingItem.entityType === 'bodyPart' ? '部位编码' : '项目编码' }}</span>
            <span class="detail-value mono">{{ viewingItem.code || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ viewingItem.entityType === 'bodyPart' ? '部位名称' : '项目名称' }}</span>
            <span class="detail-value strong">{{ viewingItem.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">层级</span>
            <el-tag :type="getLevelTagType(viewingItem.level)" size="small">
              {{ getLevelLabel(viewingItem.level) }}
            </el-tag>
          </div>
          <div class="detail-item" v-if="viewingItem.entityType === 'rebuildProject'">
            <span class="detail-label">关联部位</span>
            <span class="detail-value">{{ viewingItem.bodyPartName || '-' }}</span>
          </div>
          <div class="detail-item" v-if="viewingItem.entityType === 'rebuildProject'">
            <span class="detail-label">项目分类</span>
            <span class="detail-value">{{ viewingItem.categoryCodeName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">排序</span>
            <span class="detail-value">{{ viewingItem.sort ?? 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="status-badge" :class="viewingItem.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
              {{ viewingItem.statusName }}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="viewingItem.entityType === 'rebuildProject'">
        <div class="detail-section-title">价格信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">标准价格</span>
            <span class="detail-value" v-if="viewingItem.standardPrice != null">
              ¥{{ Number(viewingItem.standardPrice).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
            </span>
            <span class="detail-value" v-else>-</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">加急价格</span>
            <span class="detail-value" v-if="viewingItem.urgentPrice != null">
              ¥{{ Number(viewingItem.urgentPrice).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
            </span>
            <span class="detail-value" v-else>-</span>
          </div>
          <div class="detail-item" v-if="viewingItem.estimatedHours != null">
            <span class="detail-label">预计耗时</span>
            <span class="detail-value">{{ viewingItem.estimatedHours }} 小时</span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="viewingItem.entityType === 'rebuildProject' && (viewingItem.description || viewingItem.formingRequirements)">
        <div class="detail-section-title">模板说明</div>
        <div class="detail-item" v-if="viewingItem.description">
          <span class="detail-label">项目说明模板</span>
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingItem.description }}
          </span>
        </div>
        <div class="detail-item" v-if="viewingItem.formingRequirements" style="margin-top: 12px">
          <span class="detail-label">成形需求模板</span>
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingItem.formingRequirements }}
          </span>
        </div>
      </div>

      <div class="detail-section" v-if="viewingItem.remark">
        <div class="detail-section-title">备注说明</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingItem.remark }}
          </span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">时间记录</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingItem.createTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">更新时间</span>
            <span class="detail-value mono">{{ formatDate(viewingItem.updateTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, watch, nextTick } from 'vue'
import {
  Edit,
  Delete,
  Plus,
  MoreFilled,
  OfficeBuilding,
  CircleCheck,
  Download,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import listTemplate from '@/components/listTemplate.vue'
import imageAreaPicker from '@/components/imageAreaPicker.vue'
import { stringifyPartImageLocation } from '@/utils/partImageLocation'
import { bodyPartCreate, bodyPartUpdate, bodyPartDelete, bodyPartChangeStatus, bodyPartList, type BodyPartVO } from '@/api/bodyPart'
import {
  rebuildProjectCreate,
  rebuildProjectUpdate,
  rebuildProjectDelete,
  rebuildProjectChangeStatus,
  rebuildProjectTree,
  exportRebuildProjectList,
  type RebuildProjectVO,
} from '@/api/rebuildProject'
import { getDictOptions } from '@/utils/dict'
import { useUserInfo } from '@/stores/userInfo'

const { hasPermission } = useUserInfo()

// ========== 统一树节点类型 ==========
type TreeNode = BodyPartVO | RebuildProjectVO
interface PartForm {
  name: string
  scope: string
  sort: number
  enabled: boolean
  remark: string
}
interface ProjectForm {
  bodyPartId: number | null
  parentId: number
  name: string
  standardPrice: number | null
  urgentPrice: number | null
  categoryCode: string
  specialty: string
  estimatedHours: number | null
  points: number | null
  description: string
  formingRequirements: string
  sort: number
  enabled: boolean
  remark: string
}

// ========== 状态 ==========
const loading = ref(false)
const filterCategory = ref<string | undefined>()
const filterKeyword = ref<string | undefined>()
const filterStatus = ref<number | undefined>()
const selectedItem = ref<any>(null)
const tableRef = ref()

const partDialogVisible = ref(false)
const projectDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const scopePickerVisible = ref(false)
const bodyPartPickerVisible = ref(false)
const bodyPartPickerInitialCode = ref<string | null>(null)
const scopePickerInitialCode = ref<string | null>(null)
const humanImageSrc = new URL('@/assets/image/human.png', import.meta.url).href
const partFormRef = ref<FormInstance>()
const projectFormRef = ref<FormInstance>()
const editingPart = ref<BodyPartVO | null>(null)
const editingProject = ref<RebuildProjectVO | null>(null)
const viewingItem = ref<any>(null)

// 用于新建子项时记住父节点
let pendingParentId: number | null = null
let pendingParentType: 'bodyPart' | 'project' | null = null
let lastOperatedBodyPartId: number | null = null

const partForm = ref<PartForm>({
  name: '',
  scope: '',
  sort: 0,
  enabled: true,
  remark: '',
})

const projectForm = ref<ProjectForm>({
  bodyPartId: null,
  parentId: 0,
  name: '',
  standardPrice: null,
  urgentPrice: null,
  categoryCode: '',
  specialty: '',
  estimatedHours: null,
  points: null,
  description: '',
  formingRequirements: '',
  sort: 0,
  enabled: true,
  remark: '',
})

// ========== 字典数据 ==========
const categoryCodeOptions = ref<{ label: string; value: string }[]>([])
const specialtyOptions = ref<{ label: string; value: string }[]>([])

// ========== 统计 ==========
const stats = computed(() => [
  {
    label: '部位',
    value: bodyPartTableData.value.length.toString(),
    icon: OfficeBuilding,
  },
  {
    label: '重建项目',
    value: bodyPartTableData.value.reduce((sum: number, bp: any) => sum + (bp.children?.length ?? 0), 0).toString(),
    icon: CircleCheck,
  },
])

// ========== 筛选项配置 ==========
const filterInputs = computed(() => [
  { modelKey: 'keyword', placeholder: '搜索项目名称...' },
])

const filterSelects = computed(() => [
  {
    modelKey: 'categoryCode',
    placeholder: '项目分类',
    options: categoryCodeOptions.value,
  },
  // {
  //   modelKey: 'status',
  //   placeholder: '状态',
  //   options: [
  //     { label: '正常', value: 1 },
  //     { label: '停用', value: 0 },
  //   ],
  // },
])

const onFilterChange = (key: string, value: any) => {
  if (key === 'categoryCode') filterCategory.value = value
  if (key === 'status') filterStatus.value = value
  loadData()
}

const onFilterInputChange = ({ modelKey, value }: { modelKey: string; value: string }) => {
  if (modelKey === 'keyword') {
    filterKeyword.value = value || undefined
    loadData()
  }
}

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

const getLevelLabel = (level: number): string => {
  if (level === 1) return '部位'
  if (level === 2) return '重建项目'
  if (level === 3) return '子项'
  return '未知'
}

const getLevelClass = (level: number): string => {
  if (level === 1) return 'level-part'
  if (level === 2) return 'level-project'
  if (level === 3) return 'level-sub'
  return ''
}

const getTreeIconClass = (row: any): string => {
  if (row.level === 1 || row.entityType === 'bodyPart') return 'icon-level-part'
  if (row.level === 2) return 'icon-level-project'
  return 'icon-level-sub'
}

const getLevelTagType = (level: number): string => {
  if (level === 1) return 'primary'
  if (level === 2) return 'success'
  return 'warning'
}

// ========== 部位表格数据 ==========
const bodyPartTableData = shallowRef<any[]>([])

// ========== 部位下拉选项（从部位列表中提取） ==========
const bodyPartSelectOptions = computed(() =>
  bodyPartTableData.value.map((item: any) => ({ id: item.id, name: item.name, code: item.code, imageLocation: item.scope }))
)

// ========== 镜像部位（左↔右） ==========
const mirrorChecked = ref(false)
const mirrorBodyPart = computed(() => {
  if (!projectForm.value.bodyPartId) return null
  const current = bodyPartSelectOptions.value.find(p => p.id === projectForm.value.bodyPartId)
  if (!current) return null
  let mirrorName = ''
  if (current.name.includes('左')) mirrorName = current.name.replace('左', '右')
  else if (current.name.includes('右')) mirrorName = current.name.replace('右', '左')
  else return null
  return bodyPartSelectOptions.value.find(p => p.name === mirrorName) ?? null
})

const onBodyPartImageSelect = (part: any) => {
  if (!part) return
  projectForm.value.bodyPartId = part.id
}

const onBodyPartPickerConfirm = (part: { id: number; code: string; name: string }) => {
  projectForm.value.bodyPartId = part.id
}

// ========== 给项目节点标记实体类型（递归处理子项目） ==========
const markProjectEntityType = (list: any[], bodyPartId: number | string): any[] =>
  list.map((item: any) => ({
    ...item,
    uid: `rebuildProject_${bodyPartId}_${item.id}`,
    entityType: 'rebuildProject',
    level: 2,
    children: item.children?.length ? markProjectEntityType(item.children, bodyPartId) : [],
  }))

// ========== 加载部位列表 ==========
const loadData = async () => {
  loading.value = true
  try {
    const bodyParts = await bodyPartList()
    // 调用 rebuildProjectFullTree 获取完整的部位+项目树
    const allProjects = await rebuildProjectTree({
      categoryCode: filterCategory.value || undefined,
      keyword: filterKeyword.value || undefined,
    })
    // 按 bodyPartId 分组
    const projectMap = new Map<number, RebuildProjectVO[]>()
    for (const p of allProjects) {
      const list = projectMap.get(p.bodyPartId) ?? []
      list.push(p)
      projectMap.set(p.bodyPartId, list)
    }
    // 组装完整树：部位 + 其子项目
    bodyPartTableData.value = bodyParts.map((bp) => ({
      ...bp,
      uid: `bodyPart_${bp.id}`,
      entityType: 'bodyPart',
      level: 1,
      children: markProjectEntityType(projectMap.get(bp.id) ?? [], bp.id),
    }))
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
    if (lastOperatedBodyPartId != null) {
      const targetId = lastOperatedBodyPartId
      nextTick(() => {
        const row = bodyPartTableData.value.find((bp: any) => bp.id === targetId)
        if (row) tableRef.value?.toggleRowExpansion(row, true)
      })
    }
  }
}

watch([filterCategory, filterKeyword], () => {
  loadData()
})

onMounted(async () => {
  // 字典 dictCode="13" 是项目分类，dictCode="7" 是专业方向
  const [categoryCodeData, specialtyData] = await Promise.all([getDictOptions('13'), getDictOptions('7')])
  categoryCodeOptions.value = categoryCodeData
  specialtyOptions.value = specialtyData.map(d => ({ label: d.label, value: d.value }))
  loadData()
})

// ========== 行选中 ==========
const handleTableCommand = (cmd: string, row: any) => {
  if (cmd === 'addChild') handleCreateChild(row)
  else if (cmd === 'edit') handleEdit(row)
  else if (cmd === 'delete') handleDelete(row)
}

const handleCurrentChange = (row: TreeNode | null) => {
  selectedItem.value = row
}

// ========== 部位操作 ==========
const handleCreatePart = () => {
  editingPart.value = null
  pendingParentType = null
  pendingParentId = null
  partForm.value = { name: '', scope: '', sort: 0, enabled: true, remark: '' }
  partDialogVisible.value = true
}

const handleEditPart = (part: BodyPartVO) => {
  editingPart.value = part
  pendingParentType = null
  pendingParentId = null
  scopePickerInitialCode.value = part.code ?? null
  partForm.value = {
    name: part.name,
    scope: part.scope ?? '',
    sort: part.sort ?? 0,
    enabled: part.status === 1,
    remark: part.remark ?? '',
  }
  partDialogVisible.value = true
}

// ========== 部位区域选取 ==========
const onScopeConfirm = (part: { id: number; code: string; name: string }) => {
  // 将选中部位存储为 JSON 格式，包含 id, code, name
  const scopeData = {
    id: part.id,
    code: part.code,
    name: part.name,
  };
  partForm.value.scope = JSON.stringify(scopeData);
}

// ========== 重建项目操作 ==========
const handleCreateProject = (parent: any | null) => {
  editingProject.value = null
  pendingParentType = parent ? 'project' : null
  pendingParentId = parent?.id ?? null
  const selectedBodyPartId = parent?.entityType === 'bodyPart' ? parent.id : (parent?.bodyPartId ?? null)
  bodyPartPickerInitialCode.value = selectedBodyPartId
    ? (bodyPartSelectOptions.value.find(p => p.id === selectedBodyPartId)?.code ?? null)
    : null
  projectForm.value = {
    bodyPartId: selectedBodyPartId,
    parentId: parent?.entityType === 'bodyPart' ? 0 : (parent?.id ?? 0),
    name: '',
    standardPrice: null,
    urgentPrice: null,
    categoryCode: '',
    specialty: '',
    estimatedHours: null,
    points: null,
    description: '',
    formingRequirements: '',
    sort: 0,
    enabled: true,
    remark: '',
  }
  mirrorChecked.value = false
  projectDialogVisible.value = true
}

const handleExport = async () => {
  try {
    const { blob, fileName } = await exportRebuildProjectList()
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

const handleCreateChild = (row: any) => {
  if (row.entityType === 'bodyPart') {
    // 新建重建项目，挂在该部位下
    handleCreateProject(row)
  } else {
    // 新建子项目，挂在该项目下
    handleCreateProject(row)
  }
}

const handleEditProject = (project: RebuildProjectVO) => {
  editingProject.value = project
  pendingParentType = null
  pendingParentId = null
  bodyPartPickerInitialCode.value = project.bodyPartId
    ? (bodyPartSelectOptions.value.find(p => p.id === project.bodyPartId)?.code ?? null)
    : null
  projectForm.value = {
    bodyPartId: project.bodyPartId,
    parentId: project.parentId,
    name: project.name,
    standardPrice: project.standardPrice ?? null,
    urgentPrice: project.urgentPrice ?? null,
    categoryCode: project.categoryCode ?? '',
    specialty: project.specialty ?? '',
    estimatedHours: project.estimatedHours ?? null,
    points: project.points ?? null,
    description: project.description ?? '',
    formingRequirements: project.formingRequirements ?? '',
    sort: project.sort ?? 0,
    enabled: project.status === 1,
    remark: project.remark ?? '',
  }
  projectDialogVisible.value = true
}

// ========== 统一操作 ==========
const handleEdit = (row: any) => {
  if (row.entityType === 'bodyPart') {
    handleEditPart(row as BodyPartVO)
  } else {
    handleEditProject(row as RebuildProjectVO)
  }
}

const handleView = async (row: any) => {
  viewingItem.value = row
  detailDialogVisible.value = true
}

const handleSavePart = async () => {
  if (!partFormRef.value) return
  await partFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload: any = {
          name: partForm.value.name,
          parentId: pendingParentType === 'bodyPart' && pendingParentId ? pendingParentId : 0,
          sort: partForm.value.sort || undefined,
          status: partForm.value.enabled ? 1 : 0,
          remark: partForm.value.remark || undefined,
          scope: partForm.value.scope || undefined,
        }
        if (editingPart.value) {
          await bodyPartUpdate(editingPart.value.id, {
            name: partForm.value.name,
            sort: partForm.value.sort || undefined,
            status: partForm.value.enabled ? 1 : 0,
            remark: partForm.value.remark || undefined,
            scope: partForm.value.scope || undefined,
          })
          ElMessage.success('修改成功')
        } else {
          await bodyPartCreate(payload)
          ElMessage.success('创建成功')
        }
        partDialogVisible.value = false
        loadData()
      } catch {
        // error handled by interceptor
      }
    }
  })
}

const handleSaveProject = async () => {
  if (!projectFormRef.value) return
  await projectFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!projectForm.value.bodyPartId) {
        ElMessage.warning('请选择关联部位')
        return
      }
      try {
        const payload = {
          bodyPartId: projectForm.value.bodyPartId,
          parentId: projectForm.value.parentId,
          name: projectForm.value.name,
          standardPrice: projectForm.value.standardPrice ?? undefined,
          urgentPrice: projectForm.value.urgentPrice ?? undefined,
          categoryCode: projectForm.value.categoryCode || undefined,
          specialty: projectForm.value.specialty || undefined,
          estimatedHours: projectForm.value.estimatedHours ?? undefined,
          points: projectForm.value.points ?? undefined,
          description: projectForm.value.description || undefined,
          formingRequirements: projectForm.value.formingRequirements || undefined,
          sort: projectForm.value.sort || undefined,
          status: projectForm.value.enabled ? 1 : 0,
          remark: projectForm.value.remark || undefined,
        }
        if (editingProject.value) {
          await rebuildProjectUpdate(editingProject.value.id, {
            bodyPartId: projectForm.value.bodyPartId,
            parentId: projectForm.value.parentId,
            name: projectForm.value.name,
            standardPrice: projectForm.value.standardPrice ?? undefined,
            urgentPrice: projectForm.value.urgentPrice ?? undefined,
            categoryCode: projectForm.value.categoryCode || undefined,
            specialty: projectForm.value.specialty || undefined,
            estimatedHours: projectForm.value.estimatedHours ?? undefined,
            points: projectForm.value.points ?? undefined,
            description: projectForm.value.description || undefined,
            formingRequirements: projectForm.value.formingRequirements || undefined,
            sort: projectForm.value.sort || undefined,
            status: projectForm.value.enabled ? 1 : 0,
            remark: projectForm.value.remark || undefined,
          })
          ElMessage.success('修改成功')
        } else {
          await rebuildProjectCreate(payload as any)
          if (mirrorChecked.value && mirrorBodyPart.value) {
            await rebuildProjectCreate({ ...payload, bodyPartId: mirrorBodyPart.value.id } as any)
          }
          ElMessage.success('创建成功')
        }
        lastOperatedBodyPartId = projectForm.value.bodyPartId
        mirrorChecked.value = false
        projectDialogVisible.value = false
        loadData()
      } catch {
        // error handled by interceptor
      }
    }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除「${row.name}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    if (row.entityType === 'bodyPart') {
      await bodyPartDelete(row.id)
    } else {
      await rebuildProjectDelete(row.id)
    }
    ElMessage.success('删除成功')
    if (selectedItem.value?.id === row.id) {
      selectedItem.value = null
    }
    loadData()
  } catch {
    // user cancel
  }
}

const handleToggleStatus = async (row: any) => {
  if (row.entityType === 'bodyPart' && row.status === 1 && row.children?.some((c: any) => c.status === 1)) {
    ElMessage.warning('该部位下存在启用中的重建项目，请先全部禁用后再禁用部位')
    return
  }
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}「${row.name}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    if (row.entityType === 'bodyPart') {
      await bodyPartChangeStatus(row.id, newStatus)
    } else {
      await rebuildProjectChangeStatus(row.id, newStatus)
    }
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel
  }
}

const handleReset = () => {
  filterCategory.value = undefined
  filterStatus.value = undefined
}

// ========== 校验规则 ==========
const partRules: FormRules = {
  name: [{ required: true, message: '请输入部位名称', trigger: 'blur' }],
}

const projectRules: FormRules = {
  bodyPartId: [{ required: true, message: '请选择关联部位', trigger: 'change' }],
  name: [{ required: true, message: '请输入重建项目名称', trigger: 'blur' }],
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── 树形节点名称列样式（参考 resource.vue） ──
.project-tree-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;

  .project-tree-icon {
    flex-shrink: 0;
    font-size: 18px;
    color: #2f5bff;

    &.icon-level-part {
      color: #2f5bff;
    }

    &.icon-level-project {
      color: #67c23a;
    }

    &.icon-level-sub {
      color: #909399;
    }
  }

  &__label {
    font-size: 14px;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  &__count {
    margin-left: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    font-size: 12px;
    font-weight: 600;
    color: #606266;
    background: #eef0f3;
    border-radius: 999px;
  }
}



.project-level-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.02em;

  &.level-part {
    background: #dbeafe;
    color: #1d4ed8;
  }

  &.level-project {
    background: #dcfce7;
    color: #15803d;
  }

  &.level-sub {
    background: #fef9c3;
    color: #854d0e;
  }
}

.project-categoryCode-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.02em;
  background: #f3e8ff;
  color: #7e22ce;
}

.remark-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.project-sort-num {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

// ── 价格 ──
.price-text {
  font-size: 13px;
  font-weight: 600;
  color: #f56c6c;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;

  &.urgent {
    color: #e6a23c;
  }
}

// ── 树形节点缩进与箭头控制 ──
.el-table__indent {
  padding-left: 18px !important;
}

// 隐藏无子级的下拉箭头
.el-table .el-table__row .el-table__expand-icon {
  &.is-leaf {
    display: none !important;
  }
}

// ── 弹窗 ──


// ── 部位区域选取 ──
.scope-picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

// ── 关联部位选取按钮行 ──
.body-part-picker-btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

// ── 部位图形选择器 ──
.body-part-picker-wrap {
  margin-top: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;

  .body-part-picker-label {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 8px;
    letter-spacing: 0.04em;
  }

  img,
  :deep(.image-wrap img),
  :deep(.body-image) {
    max-height: 300px;
    object-fit: contain;
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

.dialog-shell {
  max-height: 600px;
  overflow: auto;
}
</style>
