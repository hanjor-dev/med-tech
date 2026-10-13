<template>
  <list-template
    page-class="charge"
    hero-eyebrow="基础管理"
    hero-title="收费模板管理"
    hero-desc="管理收费模板信息，支持按模板名称模糊搜索。"
    filter-searchable
    filter-search-placeholder="搜索模板名称..."
    :filter-selects="filterSelects"
    filter-create-label="新建模板"
    @filter-search="searchText = $event"
    @filter-reset="handleReset"
    @filter-create="handleCreate"
    @filter-change="onFilterChange"
  >
    <template #filter-create-btn>
      <el-button type="primary" class="table-btn-primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>新建模板
      </el-button>
    </template>

    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">收费模板列表</div>
          </div>
        </template>
        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="templates"
            highlight-current-row
            @current-change="handleCurrentChange"
            :row-class-name="getRowClassName"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            stripe
          >
            <el-table-column label="模板信息">
              <template #default="{ row }">
                <div class="template-info-cell">
                  <div class="template-avatar" :style="{ background: getAvatarBg(row.templateName) }">
                    {{ getAvatarText(row.templateName) }}
                  </div>
                  <div>
                    <div class="role-name">{{ row.templateName }}</div>
                    <div class="role-description" v-if="row.remark">{{ row.remark }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="备注" prop="remark" show-overflow-tooltip />

            <el-table-column label="创建时间" width="120">
              <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
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
                <el-dropdown trigger="click" @command="(cmd: ChargeCommand) => handleCommand(cmd, row)">
                  <el-button text :icon="MoreFilled" />
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
                        <span style="color: #e11d48"><el-icon><Delete /></el-icon>删除模板</span>
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

    <!-- 右侧详情面板 -->
    <div class="page-body-panel ml-10">
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedTemplate }">
        <div v-if="!selectedTemplate" class="detail-empty">
          <el-empty description="请从左侧选择一条记录" :image-size="80" />
        </div>
        <el-card v-if="selectedTemplate && selectedDetail" class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-title">模板详情</div>
            </div>
          </template>
          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedDetail.templateName }}</div>
              <div class="detail-badges">
                <el-tag size="small" :type="selectedDetail.status === 1 ? 'success' : 'info'" effect="plain">
                  {{ selectedDetail.statusName }}
                </el-tag>
              </div>
            </div>

            <div class="detail-stats" style="margin-top: 12px">
              <div class="detail-stat">
                <p class="detail-label">活跃项目总数</p>
                <p class="detail-value">{{ selectedDetail.totalActiveProjects }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">缺失项目</p>
                <p class="detail-value" :style="{ color: selectedDetail.missingCount > 0 ? '#d97706' : undefined }">
                  {{ selectedDetail.missingCount }}
                </p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">过时项目</p>
                <p class="detail-value" :style="{ color: selectedDetail.obsoleteCount > 0 ? '#e11d48' : undefined }">
                  {{ selectedDetail.obsoleteCount }}
                </p>
              </div>
            </div>

            <div class="detail-item" v-if="selectedDetail.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedDetail.remark }}</p>
            </div>

            <div style="margin-top: 12px">
              <p class="detail-label" style="margin-bottom: 8px">价格明细（{{ selectedDetail.items.length }} 项）</p>
              <div
                v-for="item in selectedDetail.items"
                :key="item.id"
                class="price-item"
                :class="{ 'price-item--obsolete': item.isObsolete }"
              >
                <span class="price-item-name">{{ item.projectName }}</span>
                <span class="price-item-price">¥{{ item.price.toFixed(2) }}</span>
                <span v-if="item.points != null" class="price-item-points">{{ item.points }} 积分</span>
                <el-tag v-if="item.isObsolete" size="small" type="danger" effect="plain">已过时</el-tag>
              </div>
            </div>

            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value">{{ formatDate(selectedDetail.createTime) }}</p>
            </div>

            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedTemplate)" v-permission="'chargingTemplate:Edit'">
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
    v-model="dialogVisible"
    :title="editingTemplate ? '编辑收费模板' : '新建收费模板'"
    subtitle="配置模板基本信息与价格明细"
    width="780px"
    :loading="dialogLoading"
    @modal-close="dialogVisible = false"
    @modal-confirm="handleSave"
  >
    <div class="dialog-shell">
      <el-form :model="form" label-position="top" :rules="rules" ref="formRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" placeholder="请输入模板名称" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注说明">
              <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="512" show-word-limit placeholder="请输入备注（选填）" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 价格明细 -->
        <el-form-item label="价格明细" prop="items">
          <div class="items-editor">
            <div class="items-editor-header">
              <span class="items-count">共 {{ form.items.length }} 项</span>
              <el-button type="primary" link @click="addItem">
                <el-icon><Plus /></el-icon>添加项目
              </el-button>
            </div>
            <div v-if="form.items.length === 0" class="items-empty">请至少添加一个收费项目</div>
            <div v-for="(item, idx) in form.items" :key="idx" class="item-row">
              <div class="body-part-picker-btn" @click="openItemBodyPartPicker(idx)">
                <span class="picker-btn-label">{{ item.bodyPartName || '选择部位' }}</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
              <el-select
                v-model="item.rebuildProjectId"
                placeholder="选择重建项目"
                filterable
                style="flex: 1"
                :disabled="!item.bodyPartId"
                :loading="itemProjectsLoading[idx]"
              >
                <el-option
                  v-for="p in (itemProjectOptions[idx] || [])"
                  :key="p.id"
                  :label="p.name"
                  :value="p.id"
                  :disabled="form.items.some((it, i) => i !== idx && it.rebuildProjectId === p.id)"
                />
              </el-select>
              <el-input-number
                v-model="item.price"
                :min="0.01"
                :max="9999999.99"
                :precision="2"
                placeholder="收费价格"
                style="width: 160px"
              />
              <el-button text type="danger" :icon="Delete" @click="removeItem(idx)" />
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </dialog-modal>

  <!-- 部位图形选择器 -->
  <imageAreaPicker
    v-model="itemPickerVisible"
    title="选择扫描部位"
    :append-to-body="true"
    @confirm="onItemBodyPartConfirm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Plus, Edit, Delete, Switch, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  chargingTemplateList,
  chargingTemplateDetail,
  chargingTemplateCreate,
  chargingTemplateUpdate,
  chargingTemplateDelete,
  type ChargingTemplateVO,
  type ChargingTemplateDetailVO,
  type ChargingTemplateItemDTO,
} from '@/api/chargingTemplate'
import { rebuildProjectByBodyPart, rebuildProjectTree, type RebuildProjectVO } from '@/api/rebuildProject'
import imageAreaPicker from '@/components/imageAreaPicker.vue'
import { ArrowRight } from '@element-plus/icons-vue'

export type ChargeCommand = 'edit' | 'toggle' | 'delete'

// ========== Data ==========
const loading = ref(false)
const dialogLoading = ref(false)
const searchText = ref('')
const filterStatus = ref<number | undefined>()
const templates = ref<ChargingTemplateVO[]>([])
const selectedTemplate = ref<ChargingTemplateVO | null>(null)
const selectedDetail = ref<ChargingTemplateDetailVO | null>(null)
const tableRef = ref()
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingTemplate = ref<ChargingTemplateVO | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

interface ItemForm {
  rebuildProjectId: number | undefined
  bodyPartId: number | undefined
  bodyPartName: string
  price: number | undefined
}

const form = ref<{
  templateName: string
  remark: string
  items: ItemForm[]
}>({
  templateName: '',
  remark: '',
  items: [],
})

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

// ========== Rules ==========
const rules: FormRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  items: [
    {
      validator: (_: any, __: any, callback: any) => {
        if (form.value.items.length === 0) return callback(new Error('请至少添加一个收费项目'))
        const invalid = form.value.items.some(it => !it.rebuildProjectId || !it.price)
        if (invalid) return callback(new Error('请完整填写每项的重建项目和价格'))
        callback()
      },
      trigger: 'change',
    },
  ],
}

// ========== Methods ==========
const loadData = async () => {
  loading.value = true
  try {
    const res = await chargingTemplateList({
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      templateName: searchText.value.trim() || undefined,
    })
    templates.value = res.records || []
    pageInfo.totalCount = res.total || 0
    if (!selectedTemplate.value && templates.value.length > 0) {
      selectedTemplate.value = templates.value[0]
      tableRef.value?.setCurrentRow(templates.value[0])
      loadDetail(templates.value[0].id)
    }
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const loadDetail = async (id: number) => {
  try {
    selectedDetail.value = await chargingTemplateDetail(id)
  } catch {
    // error handled by interceptor
  }
}

const handleReset = () => {
  searchText.value = ''
  filterStatus.value = undefined
  pageInfo.currentPage = 1
}

const onFilterChange = (key: string, value: any) => {
  if (key === 'status') filterStatus.value = value
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
}

const handleCurrentChange = (row: ChargingTemplateVO | null) => {
  selectedTemplate.value = row
  if (row) loadDetail(row.id)
  else selectedDetail.value = null
}

const getRowClassName = ({ row }: { row: ChargingTemplateVO }) =>
  selectedTemplate.value?.id === row.id ? 'selected-row' : ''

const handleCommand = (command: ChargeCommand, row: ChargingTemplateVO) => {
  switch (command) {
    case 'edit': handleEdit(row); break
    case 'toggle': handleToggleStatus(row); break
    case 'delete': handleDelete(row); break
  }
}

const handleCreate = async () => {
  editingTemplate.value = null
  form.value = { templateName: '', remark: '', status: 1, items: [] }
  itemProjectOptions.value = {}
  dialogVisible.value = true
}

const handleEdit = async (tpl: ChargingTemplateVO) => {
  editingTemplate.value = tpl
  try {
    const detail = await chargingTemplateDetail(tpl.id)
    const nonObsolete = detail.items.filter(it => !it.isObsolete)
    const tree = await rebuildProjectTree()
    const findProject = (id: number): RebuildProjectVO | undefined => {
      for (const node of tree) {
        if (node.id === id) return node
        const found = node.children?.find(c => c.id === id)
        if (found) return found
      }
    }
    form.value = {
      templateName: detail.templateName,
      remark: detail.remark || '',
      items: nonObsolete.map(it => {
        const proj = findProject(it.rebuildProjectId)
        return {
          rebuildProjectId: it.rebuildProjectId,
          bodyPartId: proj?.bodyPartId,
          bodyPartName: proj?.bodyPartName || '',
          price: it.price,
        }
      }),
    }
    itemProjectOptions.value = {}
    await Promise.all(
      form.value.items.map(async (it, idx) => {
        if (it.bodyPartId) {
          const projects = await rebuildProjectByBodyPart(it.bodyPartId)
          itemProjectOptions.value = { ...itemProjectOptions.value, [idx]: projects }
        }
      })
    )
  } catch {
    return
  }
  dialogVisible.value = true
}

const addItem = () => {
  form.value.items.push({ rebuildProjectId: undefined, bodyPartId: undefined, bodyPartName: '', price: undefined })
}

// ========== Body Part Picker (per item) ==========
const itemPickerIndex = ref<number>(-1)
const itemPickerVisible = ref(false)
const itemProjectOptions = ref<Record<number, RebuildProjectVO[]>>({})
const itemProjectsLoading = ref<Record<number, boolean>>({})

const openItemBodyPartPicker = (idx: number) => {
  itemPickerIndex.value = idx
  itemPickerVisible.value = true
}

const onItemBodyPartConfirm = async (part: { id: number; name: string }) => {
  const idx = itemPickerIndex.value
  itemPickerVisible.value = false
  if (idx < 0) return
  const item = form.value.items[idx]
  item.bodyPartId = part.id
  item.bodyPartName = part.name
  item.rebuildProjectId = undefined
  itemProjectsLoading.value = { ...itemProjectsLoading.value, [idx]: true }
  try {
    itemProjectOptions.value = { ...itemProjectOptions.value, [idx]: await rebuildProjectByBodyPart(part.id) }
  } finally {
    itemProjectsLoading.value = { ...itemProjectsLoading.value, [idx]: false }
  }
}

const removeItem = (idx: number) => {
  form.value.items.splice(idx, 1)
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    dialogLoading.value = true
    try {
      const payload = {
        templateName: form.value.templateName,
        remark: form.value.remark || undefined,
        items: form.value.items as ChargingTemplateItemDTO[],
      }
      if (editingTemplate.value) {
        await chargingTemplateUpdate(editingTemplate.value.id, payload)
        ElMessage.success('修改成功')
      } else {
        await chargingTemplateCreate(payload)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch {
      // error handled by interceptor
    } finally {
      dialogLoading.value = false
    }
  })
}

const handleDelete = async (tpl: ChargingTemplateVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除收费模板「${tpl.templateName}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await chargingTemplateDelete(tpl.id)
    ElMessage.success('删除成功')
    if (selectedTemplate.value?.id === tpl.id) {
      selectedTemplate.value = null
      selectedDetail.value = null
    }
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleToggleStatus = async (tpl: ChargingTemplateVO) => {
  const newStatus = tpl.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}收费模板「${tpl.templateName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    // 通过更新接口修改状态（接口文档未提供独立状态接口，使用 PUT 更新）
    const detail = await chargingTemplateDetail(tpl.id)
    await chargingTemplateUpdate(tpl.id, {
      templateName: detail.templateName,
      remark: detail.remark,
      status: newStatus,
      items: detail.items.filter(it => !it.isObsolete).map(it => ({ rebuildProjectId: it.rebuildProjectId, price: it.price })),
    })
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

const formatDate = (dateStr?: string) => (dateStr ? dateStr.slice(0, 10) : '--')

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

onMounted(() => {
  loadData()
})

watch([searchText, filterStatus], () => {
  pageInfo.currentPage = 1
  loadData()
})

watch(() => pageInfo.currentPage, () => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

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
}

.detail-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.items-editor {
  width: 100%;

  .items-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .items-count {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .items-empty {
    color: var(--el-text-color-placeholder);
    font-size: 13px;
    padding: 12px 0;
    text-align: center;
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;
  }

.item-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .body-part-picker-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 10px;
      height: 32px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      white-space: nowrap;
      min-width: 110px;
      font-size: 13px;
      color: #374151;

      &:hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }
    }
  }
}

.price-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &--obsolete {
    opacity: 0.6;
    text-decoration: line-through;
  }

  .price-item-name {
    flex: 1;
    font-size: 13px;
  }

  .price-item-price {
    font-size: 13px;
    font-weight: 600;
    color: #2f5bff;
  }

  .price-item-points {
    font-size: 12px;
    color: #d97706;
  }
}
</style>
