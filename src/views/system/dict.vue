<template>
  <list-template page-class="dict" hero-eyebrow="系统管理" hero-title="字典管理" hero-desc="管理系统数据字典，维护字典类型与字典数据值，支持动态扩展系统配置项"
    :hide-filter="true">
    <!-- 主内容区 -->
    <div class="page-body-panel">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">字典类型</span>
              <el-button type="primary" size="small" @click="handleCreate('type')">
              <el-icon>
                <Plus />
              </el-icon>
              新增
            </el-button>
          </div>
        </template>
        <div class="type-search">
          <el-input v-model="typeSearchKeyword" placeholder="搜索字典类型..." clearable :prefix-icon="Search" />
        </div>
        <div class="type-list">
          <div v-for="item in filteredTypeList" :key="item.id" class="type-item" style="display: grid;" 
            :class="{ 'is-active': selectedId === item.id }" @click="handleSelectType(item.id, item.dictName, item.dictCode)">
            <div class="type-item__top">
              <div class="type-item__left">
                <div class="type-item__name">{{ item.dictName }}</div>
              </div>
              <div class="type-item__right">
                <el-switch :model-value="item.status === 1" size="small"
                  @click.stop @change="handleToggleStatus(item)" />
              </div>
            </div>
            <div class="type-item__footer">
              <div class="type-item__meta">
                <!-- <el-tag size="small" type="info">{{ item.dictCode }}</el-tag> -->
                <span v-if="item.remark" class="type-card__remark">备注：{{ item.remark }}</span>
                <span v-if="item.createTime" class="type-card__time">{{ dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </div>
              <div class="type-item__actions" @click.stop>
                <el-button text size="small" class="action-btn" @click="handleEdit(item)"><span class="iconfont icon-bianji"></span></el-button>
                <el-button text size="small" class="action-btn action-btn--danger" @click="handleDeleteType(item)"><span class="iconfont icon-shanchu"></span></el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="filteredTypeList.length === 0" :description="typeSearchKeyword ? '未找到匹配的类型' : '暂无字典类型'"
            :image-size="60" />
        </div>
      </el-card>
    </div>
    <div class="page-body-panel panel-flex-4 ml-10">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-header__left">
              <span class="card-title">{{ selectedId ? selectedDictName : '字典数据' }}</span>
              <span v-if="selectedId" class="card-header__sub">字典数据</span>
            </div>
            <el-button v-if="selectedId" type="primary" size="small" @click="handleCreate('data')">
              <el-icon>
                <Plus />
              </el-icon>
              新增数据
            </el-button>
          </div>
        </template>

        <!-- 有选中类型：显示数据表格 -->
        <div v-if="selectedId" class="list-table-wrap">
          <el-table :data="selectedTypeChildren" :header-cell-style="{ background: '#f9fafb' }" v-loading="dataLoading">
            <el-table-column label="数据标签" prop="dictName">
              <template #default="{ row }">
                <i class="iconfont">&#xe63d;</i>&nbsp;{{ row.dictName }}
              </template>
            </el-table-column>
            <el-table-column label="数据值" prop="dictValue">
              <template #default="{ row }">
                <el-tag  effect="plain">{{ row.dictValue ?? '—' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template #default="{ row }">
                <span class="status-badge"
                  :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" prop="createTime" >
              <template #default="{ row }">
                <span>{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button text class="action-btn" @click="handleEdit(row)"><span class="iconfont icon-bianji"></span></el-button>
                  <el-button text  class="action-btn" @click="handleToggleStatus(row)"><span class="iconfont icon-qiyong"></span></el-button>
                  <el-button text class="action-btn action-btn--danger" @click="handleDeleteData(row)"><span class="iconfont icon-shanchu"></span></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 未选中类型：空状态 -->
        <div v-else class="data-empty">
          <el-empty description="请从左侧选择一个字典类型" :image-size="80" />
        </div>
      </el-card>
    </div>
  </list-template>

  <!-- 字典弹框（新建/编辑类型 + 数据共用） -->
  <dialog-modal v-model="dictDialogVisible"
    :title="editingDict ? '编辑字典' : '新建字典'"
    :subtitle="dialogMode === 'data' && selectedId ? `所属类型：${selectedDictName}` : ''"
    width="600px" @modal-close="dictDialogVisible = false" @modal-confirm="handleSave">
    <div class="dialog-shell">
      <el-form :model="dictForm" label-position="top" :rules="dictRules" ref="dictFormRef">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="dialogMode === 'type' ? '类型名称' : '数据标签'" prop="dictName">
              <el-input v-model="dictForm.dictName"
                :placeholder="dialogMode === 'type' ? '请输入字典类型名称' : '请输入数据标签'"
                clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="dialogMode === 'type' ? '类型编码' : '数据值'" prop="dictValue">
              <el-input v-model="dictForm.dictValue"
                :placeholder="dialogMode === 'type' ? '请输入字典类型编码' : '请输入数据值'"
                clearable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注说明" prop="remark">
              <el-input v-model="dictForm.remark" type="textarea" :rows="3" placeholder="请输入备注说明" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  dictTree,
  dictCreate,
  dictUpdate,
  dictDelete,
  dictChangeStatus,
  dictTypeList,
  dictOptions,
} from '@/api/dict'
import dayjs from 'dayjs'
// ── Interfaces ──────────────────────────────────────────────────────────────
export interface DictItem {
  id: number
  parentId: number | null
  dictCode: string
  dictName: string
  dictValue: string | null
  level: number
  sort: number
  status: number
  remark?: string
  createTime?: string
  updateTime?: string
  children?: DictItem[]
}

// ── Data ─────────────────────────────────────────────────────────────────────
const typeList = ref<DictItem[]>([])
let selectedId = ref<number>(0)
let selectedDictName = ref<string>('')
let selectedCode = ref<string>('')
const selectedTypeChildren = ref<DictItem[]>([])
const dataLoading = ref(false)
const typeSearchKeyword = ref('')

const dictDialogVisible = ref(false)
const dialogMode = ref<'type' | 'data'>('type')
const dictFormRef = ref<FormInstance>()
const editingDict = ref<DictItem | null>(null)

const dictForm = ref({
  dictName: '',
  dictValue: '',
  sort: 1,
  status: 1,
  remark: '',
})

// ── Form Rules ───────────────────────────────────────────────────────────────
const dictRules = computed<FormRules>(() => ({
  dictName: [{ required: true, message: dialogMode.value === 'type' ? '请输入字典类型名称' : '请输入数据标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: dialogMode.value === 'type' ? '请输入字典类型编码' : '请输入数据值', trigger: 'blur' }],
  sort: [{ required: dialogMode.value === 'data', message: '请输入排序', trigger: 'blur' }],
}))

// ── Computed ─────────────────────────────────────────────────────────────────

const filteredTypeList = computed(() => {
  const kw = typeSearchKeyword.value.trim().toLowerCase()
  if (!kw) return typeList.value
  return typeList.value.filter(t => t.dictName.toLowerCase().includes(kw))
})

// ── Methods ──────────────────────────────────────────────────────────────────
const handleSelectType = (id: number, name: string, code: string) => {
  selectedId.value = id
  selectedDictName.value = name
  selectedCode.value = code
  handleDictDetail(code)
}

const handleCreate = (mode: 'type' | 'data') => {
  editingDict.value = null
  dialogMode.value = mode
  dictForm.value = { dictName: '', dictValue: '', sort: 1, status: 1, remark: '' }
  dictDialogVisible.value = true
}

const handleEdit = (item: DictItem) => {
  editingDict.value = item
  dialogMode.value = item.parentId === 0 || item.parentId === null ? 'type' : 'data'
  dictForm.value = {
    dictName: item.dictName,
    dictValue: item.parentId === 0 || item.parentId === null ? (item.dictCode || '') : (item.dictValue || ''),
    sort: item.sort,
    remark: item.remark || '',
    status: item.status,
  }
  dictDialogVisible.value = true
}

const handleSave = async () => {
  if (!dictFormRef.value) return
  await dictFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (editingDict.value) {
        await dictUpdate(editingDict.value.id, dictForm.value)
        ElMessage.success('修改成功')
        const idx = typeList.value.findIndex(t => t.id === editingDict.value!.id)
        if (idx > -1) {
          typeList.value[idx] = { ...typeList.value[idx], ...dictForm.value }
          if (selectedId.value === editingDict.value.id) {
            const { id, dictName, dictCode } = typeList.value[idx]
            selectedId.value = id
            selectedDictName.value = dictName
            selectedCode.value = dictCode
          }
        }
        await fetchTypeList()
      } else {
        const parentId = dialogMode.value === 'data' ? selectedId.value : 0
        await dictCreate({ parentId, ...dictForm.value })
        ElMessage.success('创建成功')
        await fetchTypeList()
      }
      dictDialogVisible.value = false
    } catch {
      // error handled by http interceptors
    }
  })
}

const handleDeleteType = async (item: DictItem) => {
  if (item.children && item.children.length > 0) {
    ElMessage.warning('该类型下存在字典项，请先删除子节点')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除此字典类型吗？', '提示', {
      type: 'warning',
      customClass: 'auth-confirm-dialog',
    })
    await dictDelete(item.id)
    ElMessage.success('删除成功')
    typeList.value = typeList.value.filter(t => t.id !== item.id)
    if (selectedId.value === item.id) {
      selectedId.value = 0
    }
  } catch {
    // user cancelled
  }
}

const handleDeleteData = async (item: DictItem) => {
  try {
    await ElMessageBox.confirm('确定要删除此字典吗？', '提示', {
      type: 'warning',
      customClass: 'auth-confirm-dialog auth-confirm-dialog--danger',
    })
    await dictDelete(item.id)
    ElMessage.success('删除成功')
    await fetchTypeList()
  } catch {
    // user cancelled
  }
}

const handleToggleStatus = async (item: DictItem) => {
  const newStatus = item.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确定要${newStatus === 1 ? '启用' : '禁用'}吗？`, '提示', {
      customClass: 'auth-confirm-dialog',
    })
    await dictChangeStatus(item.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
    await fetchTypeList()
  } catch {
    // user cancelled
  }
}

const handleDictDetail = async (code: string) => {
  dataLoading.value = true
  try {
    const res = await dictOptions(code) as any
    selectedTypeChildren.value = res || []
  } catch {
    selectedTypeChildren.value = []
  } finally {
    dataLoading.value = false
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
const fetchTypeList = async () => {
  try {
    const res = await dictTypeList() as any
    typeList.value = res || []
    autoSelectFirst()
  } catch {
   typeList.value = []
  }
}

const autoSelectFirst = () => {
  const { dictCode, dictName, id } = typeList.value[0]
  handleDictDetail(dictCode)
  selectedId.value = id
  selectedDictName.value = dictName
  selectedCode.value = dictCode
}
onMounted(() => {
  fetchTypeList()
})
</script>

<style lang="scss" scoped>
// ── 通用 ─────────────────────────────────────────────────────────────────────
.card-header {
  &__left {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__sub {
    font-size: 13px;
    color: #9ca3af;
  }
}

// ── 字典卡片 ────────────────────────────────────────────────────────────────

.type-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;

  &:hover {
    border-color: #2f5bff;
    box-shadow: 0 2px 8px rgba(47, 91, 255, 0.1);
  }

  &.is-active {
    border-color: #2f5bff;
    background: #eff6ff;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    overflow: hidden;
  }

  &__right {
    flex-shrink: 0;
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2f5bff;
    font-size: 16px;
    flex-shrink: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
    flex: 1;
    overflow: hidden;
  }

  &__actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  &__time {
    font-size: 12px;
    color: #9ca3af;
  }

  &__remark {
    font-size: 12px;
    color: #9ca3af;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
