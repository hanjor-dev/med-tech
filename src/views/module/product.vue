<template>
  <list-template
    page-class="product"
    hero-eyebrow="基础数据"
    hero-title="产品管理"
    hero-desc="管理系统产品信息，支持按产品名称、产品分类、关联注册证、状态等条件筛选。"
    filter-searchable
    filter-search-placeholder="搜索产品名称或编码..."
    :filter-selects="filterSelects"
    filter-create-label="新建产品"
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
            <span class="card-title">产品列表</span>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="productTreeData"
            row-key="uid"
            highlight-current-row
            @current-change="handleCurrentChange"
            v-loading="loading"
            :header-cell-style="{ background: '#f9fafb' }"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            @expand-change="handleExpandChange"
            stripe
          >
            <el-table-column label="名称" >
              <template #default="{ row }">
                <div v-if="row.isLoading" class="product-tree-name-cell">
                  <span class="product-tree-name-cell__label" style="color:#999">加载中...</span>
                </div>
                <div v-else-if="row.isEmpty" class="product-tree-name-cell">
                  <span class="product-tree-name-cell__label" style="color:#999">暂无数据</span>
                </div>
                <div v-else class="product-tree-name-cell">
                  <i class="iconfont product-tree-icon" :class="getTreeIconClass(row)">&#xe641;</i>
                  <span class="product-tree-name-cell__label">{{ row.name }}</span>
                  <el-tag v-if="row.code" size="small" effect="plain" class="product-tree-code-tag">{{ row.code }}</el-tag>
                  <span v-if="row.level === 1 && row.children?.filter(c => !c.isEmpty).length" class="product-tree-name-cell__count">{{ row.children.filter(c => !c.isEmpty).length }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="分类"  align="center">
              <template #default="{ row }">
                <template v-if="!row.isEmpty">
                  <el-tag v-if="row.categoryName" size="small" effect="plain" type="warning">{{ row.categoryName }}</el-tag>
                  <el-tag v-else size="small" effect="plain" :type="row.level === 1 ? 'primary' : 'success'">{{ getLevelLabel(row.level) }}</el-tag>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="状态" align="center">
              <template #default="{ row }">
                <template v-if="row.level === 1">
                  <div class="status-cell" style="justify-content: center;">
                    <span class="status-badge" :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                      {{ row.statusName }}
                    </span>
                  </div>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ row }">
                <template v-if="row.level === 1">
                  <el-dropdown trigger="click" @command="handleCommand($event, row)">
                    <el-button text :icon="MoreFilled" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="addSpec">
                          <el-icon><Plus /></el-icon>添加型号
                        </el-dropdown-item>
                        <el-dropdown-item command="edit" :divided="true">
                          <el-icon><Edit /></el-icon>编辑产品
                        </el-dropdown-item>
                        <el-dropdown-item command="toggle">
                          <el-icon><Switch /></el-icon>
                          {{ row.status === 1 ? '停用产品' : '启用产品' }}
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          <span style="color: #e11d48">
                            <el-icon><Delete /></el-icon>删除产品
                          </span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <template v-else-if="!row.isEmpty">
                  <el-dropdown trigger="click" @command="(cmd) => handleSpecCommand(cmd, row)">
                    <el-button text :icon="MoreFilled" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">
                          <el-icon><Edit /></el-icon>编辑型号
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          <span style="color: #e11d48">
                            <el-icon><Delete /></el-icon>删除型号
                          </span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
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
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedItem }">
        <!-- 空状态 -->
        <div v-if="!selectedItem" class="detail-empty">
          <el-empty description="请从左侧选择一个产品或型号" :image-size="80" />
        </div>

        <!-- 已选产品详情（level 1） -->
        <el-card v-if="selectedItem && selectedItem.level === 1" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">产品详情</div>
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

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">产品分类</p>
                <p class="detail-value">
                  <el-tag v-if="selectedItem.categoryName" size="small" effect="plain" type="warning">{{ selectedItem.categoryName }}</el-tag>
                  <el-tag v-else size="small" effect="plain" :type="selectedItem.level === 1 ? 'primary' : 'success'">{{ getLevelLabel(selectedItem.level) }}</el-tag>
                </p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">型号数量</p>
                <p class="detail-value">{{ selectedItem.children?.length || 0 }} 个</p>
              </div>
            </div>
            <!-- <el-tag size="small" effect="plain" :type="selectedItem.level === 1 ? 'primary' : 'success'" style="margin: 6px 0 12px;">
              {{ getLevelLabel(selectedItem.level) }}
            </el-tag> -->
            <div class="detail-item" v-if="selectedItem.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedItem.remark }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">创建时间</p>
              <p class="detail-value">{{ formatDate(selectedItem.createTime) }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedItem)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 已选型号详情（level 2） -->
        <el-card v-if="selectedItem && selectedItem.level === 2" class="detail-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">型号详情</div>
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

            <div class="detail-stats" style="margin-top: 12px">
              <div class="detail-stat">
                <p class="detail-label">所属产品</p>
                <p class="detail-value">{{ selectedItem.productName || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">关联注册证</p>
                <p class="detail-value">
                  <span v-if="selectedItem.certName" >
                    {{ selectedItem.certName }}
                  </span>
                  <span v-else>-</span>
                </p>
              </div>
            </div>
            <div class="detail-stats">

              <div class="detail-stat">
                <p class="detail-label">创建时间</p>
                <p class="detail-value">{{ formatDate(selectedItem.createTime) }}</p>
              </div>
            </div>
            <div class="detail-item" v-if="selectedItem.remark">
              <p class="detail-label">备注说明</p>
              <p class="detail-value">{{ selectedItem.remark }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEditSpec(selectedItem)">
                <el-icon><Edit /></el-icon>编辑型号
              </el-button>
              <el-button style="flex: 1" type="danger" plain @click="handleDeleteSpec(selectedItem)">
                <el-icon><Delete /></el-icon>删除型号
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- 新建/编辑产品弹窗 -->
  <dialog-modal
    v-model="productDialogVisible"
    :title="editingProduct ? '编辑产品' : '新建产品'"
    subtitle="配置产品基本信息"
    width="720px"
    @modal-close="productDialogVisible = false"
    @modal-confirm="handleSaveProduct"
  >
    <div class="dialog-shell">
      <el-form :model="productForm" label-position="top" :rules="productRules" ref="productFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="productForm.productName" placeholder="请输入产品名称" maxlength="25" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品分类">
              <el-select v-model="productForm.category" placeholder="选择产品分类" clearable filterable style="width: 100%">
                <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注说明">
              <el-input
                v-model="productForm.remark"
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

  <!-- 新建/编辑型号弹窗 -->
  <dialog-modal
    v-model="specDialogVisible"
    :title="editingSpec ? '编辑型号' : '新建型号'"
    :subtitle="editingSpec ? `所属产品：${editingSpec.productName}` : `所属产品：${specParentProduct?.name || ''}`"
    width="560px"
    @modal-close="specDialogVisible = false"
    @modal-confirm="handleSaveSpec"
  >
    <div class="dialog-shell">
      <el-form :model="specForm" label-position="top" :rules="specRules" ref="specFormRef" class="auth-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="型号名称" prop="specName">
              <el-input v-model="specForm.specName" placeholder="请输入型号名称" maxlength="25" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联注册证">
              <el-select
                v-model="specForm.certId"
                placeholder="选择关联注册证"
                clearable
                filterable
                :loading="certLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="cert in validCerts"
                  :key="cert.id"
                  :label="cert.certName"
                  :value="cert.id"
                >
                  <div class="cert-select-option">
                    <span class="cert-code">{{ cert.certName }}</span>
                    <span class="cert-name">{{ cert.certName }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注说明">
              <el-input
                v-model="specForm.remark"
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
    title="产品详情"
    :subtitle="viewingProduct?.productName || ''"
    width="560px"
    @modal-close="detailDialogVisible = false"
    @modal-confirm="detailDialogVisible = false"
  >
    <div class="dialog-shell" v-if="viewingProduct">
      <div class="detail-section">
        <div class="detail-section-title">基本信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">产品名称</span>
            <span class="detail-value strong">{{ viewingProduct.productName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">产品分类</span>
            <span class="detail-value">{{ viewingProduct.category || '-' }}</span>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">状态信息</div>
        <div class="detail-grid-2">
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="status-badge" :class="viewingProduct.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
              {{ viewingProduct.statusName }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value mono">{{ formatDate(viewingProduct.createTime) }}</span>
          </div>
        </div>
      </div>
      <div class="detail-section" v-if="viewingProduct.remark">
        <div class="detail-section-title">备注说明</div>
        <div class="detail-item">
          <span class="detail-value" style="color: var(--el-text-color-secondary); line-height: 1.7">
            {{ viewingProduct.remark }}
          </span>
        </div>
      </div>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, shallowRef, onMounted, watch, nextTick } from 'vue'
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
import { productPage, productDetail, productCreate, productUpdate, productDelete, type ProductVO, type ProductQuery, type CreateProductDTO, type UpdateProductDTO, type CreateProductSpecDTO, type UpdateProductSpecDTO, productSpecCreate, productSpecUpdate, productSpecDelete, productSpecList } from '@/api/product'
import { certValidList, type RegistrationCertVO } from '@/api/registrationCert'
import { getDictOptions, getDictItems, type DictOption } from '@/utils/dict'

export type ProductCommand = 'addSpec' | 'edit' | 'view' | 'toggle' | 'delete'
export type SpecCommand = 'edit' | 'delete'

// ========== 产品树形节点类型 ==========
interface ProductTreeNode {
  uid: string
  id: number
  name: string
  level: 1 | 2
  category?: string
  categoryName?: string
  status: number
  statusName: string
  remark?: string
  createTime?: string
  productId?: number
  productName?: string
  certId?: number
  certNo?: string
  certName?: string
  sort?: number
  isEmpty?: boolean
  isLoading?: boolean
  children: ProductTreeNode[]
}

// ========== 产品分类选项 ==========
const categoryOptions = ref<DictOption[]>([])
const categoryColorMap = ref<Record<string, { bg: string; color: string }>>({})

const loadCategoryOptions = async () => {
  categoryOptions.value = await getDictOptions('17')
  // 加载完整分类数据用于获取颜色
  const items = await getDictItems('17')
  const colors = [
    { bg: '#dbeafe', color: '#1d4ed8' }, // 蓝
    { bg: '#dcfce7', color: '#15803d' }, // 绿
    { bg: '#fef3c7', color: '#b45309' }, // 黄/橙
    { bg: '#fce7f3', color: '#be185d' }, // 粉
    { bg: '#e0e7ff', color: '#4338ca' }, // 靛蓝
    { bg: '#ccfbf1', color: '#0f766e' }, // 青
    { bg: '#fee2e2', color: '#b91c1c' }, // 红
    { bg: '#f3e8ff', color: '#7c3aed' }, // 紫
    { bg: '#fed7aa', color: '#c2410c' }, // 橙
    { bg: '#cffafe', color: '#0e7490' }, // 浅蓝
  ]
  items.forEach((item, idx) => {
    const color = colors[idx % colors.length]
    categoryColorMap.value[item.dictCode] = color
  })
}

const getCategoryColor = (categoryCode: string | undefined) => {
  if (!categoryCode) return { bg: '#f1f5f9', color: '#64748b' }
  return categoryColorMap.value[categoryCode] || { bg: '#f1f5f9', color: '#64748b' }
}

// ========== 数据类型 ==========
interface ProductForm {
  productName: string
  category: string
  categoryName: string
  status: number | null
  remark: string
}

// ========== 状态 ==========
const loading = ref(false)
const certLoading = ref(false)
const searchText = ref('')
let lastOperatedProductId: number | null = null
const expandedProductIds = new Set<number>()
const filterCategory = ref<string | undefined>()
const filterStatus = ref<number | undefined>()
const selectedItem = ref<ProductTreeNode | null>(null)
const tableRef = ref()

const productDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const specDialogVisible = ref(false)
const productFormRef = ref<FormInstance>()
const specFormRef = ref<FormInstance>()
const editingProduct = ref<ProductVO | null>(null)
const viewingProduct = ref<ProductVO | null>(null)
const editingSpec = ref<ProductTreeNode | null>(null)
const specParentProduct = ref<ProductTreeNode | null>(null)

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

const productForm = ref<ProductForm>({
  productName: '',
  category: '',
  categoryName: '',
  status: 1,
  remark: '',
})

watch(() => productForm.value.category, (val) => {
  const opt = categoryOptions.value.find(o => o.value === val)
  productForm.value.categoryName = opt?.label || ''
})

const specForm = ref({
  specName: '',
  certId: null as number | null,
  sort: 0,
  status: 1,
  remark: '',
})

const specRules: FormRules = {
  specName: [{ required: true, message: '请输入型号名称', trigger: 'blur' }],
}

// ========== 产品树形数据 ==========
const productTreeData = shallowRef<ProductTreeNode[]>([])

// ========== 产品列表（扁平） ==========
const products = ref<ProductVO[]>([])

// ========== 有效注册证列表 ==========
const validCerts = ref<RegistrationCertVO[]>([])

// ========== 筛选项配置 ==========
const filterSelects = computed(() => [
  {
    modelKey: 'category',
    placeholder: '产品分类',
    options: categoryOptions.value,
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
  if (key === 'category') filterCategory.value = value
  if (key === 'status') filterStatus.value = value
}

// ========== 树形辅助函数 ==========
const getLevelLabel = (level: number): string => {
  if (level === 1) return '产品'
  if (level === 2) return '型号'
  return '未知'
}

const getLevelClass = (level: number): string => {
  if (level === 1) return 'level-product'
  if (level === 2) return 'level-spec'
  return ''
}

const getTreeIconClass = (row: ProductTreeNode): string => {
  if (row.level === 1) return 'icon-level-product'
  return 'icon-level-spec'
}

// ========== 生命周期 ==========
onMounted(async () => {
  await loadValidCerts()
  loadData()
  loadCategoryOptions()
})

// ========== 监听搜索和筛选变化 ==========
watch([searchText, filterCategory, filterStatus], () => {
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

// ========== 加载有效注册证列表 ==========
const loadValidCerts = async () => {
  certLoading.value = true
  try {
    validCerts.value = await certValidList()
  } catch {
    // error handled by http interceptor
  } finally {
    certLoading.value = false
  }
}

// ========== 方法 ==========
const loadData = async () => {
  loading.value = true
  try {
    const query: ProductQuery = {
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      productName: searchText.value.trim() || undefined,
      category: filterCategory.value,
      status: filterStatus.value,
    }
    const res = await productPage(query)
    const productList = res.records || []
    products.value = productList
    pageInfo.totalCount = res.total || 0

    // 保留其他已展开产品的子项，避免重新请求
    const savedChildren = new Map<number, ProductTreeNode[]>()
    for (const row of productTreeData.value) {
      if (expandedProductIds.has(row.id) && row.id !== lastOperatedProductId && row.children.some(c => !c.isLoading)) {
        savedChildren.set(row.id, row.children)
      }
    }

    // 构建树形结构
    productTreeData.value = productList.map((p) => ({
      uid: `product_${p.id}`,
      id: p.id,
      name: p.productName,
      level: 1 as const,
      category: p.category,
      categoryName: p.categoryName || p.category,
      status: p.status,
      statusName: p.statusName,
      remark: p.remark,
      createTime: p.createTime,
      hasChildren: true,
      children: savedChildren.has(p.id)
        ? savedChildren.get(p.id)!
        : [{ uid: `ph_${p.id}`, id: -1, name: '', level: 2 as const, isEmpty: true, isLoading: true, status: 0, statusName: '', hasChildren: false, children: [] }],
    }))

    if (lastOperatedProductId != null) {
      const opId = lastOperatedProductId
      lastOperatedProductId = null
      const opRow = productTreeData.value.find(p => p.id === opId)
      if (opRow) {
        const specs: any[] = await productSpecList(opRow.id).catch(() => [])
        opRow.children = specs.length > 0
          ? specs.map((s: any) => ({
              uid: `spec_${s.id}`, id: s.id, name: s.specName, level: 2 as const,
              productId: opRow.id, productName: opRow.name, certId: s.certId, certNo: s.certNo,
              certName: validCerts.value.find(c => c.id === s.certId)?.certName,
              sort: s.sort, status: s.status, statusName: s.statusName,
              remark: s.remark, createTime: s.createTime, hasChildren: false, children: [],
            }))
          : [{ uid: `empty_${opRow.id}`, id: -1, name: '', level: 2 as const, isEmpty: true, status: 0, statusName: '', hasChildren: false, children: [] }]
        productTreeData.value = [...productTreeData.value]
        nextTick(() => tableRef.value?.toggleRowExpansion(opRow, true))
      }
    } else if (!selectedItem.value && productTreeData.value.length > 0) {
      selectedItem.value = productTreeData.value[0]
      tableRef.value?.setCurrentRow(productTreeData.value[0])
    }
  } catch {
    // error handled by http interceptor
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchText.value = ''
  filterCategory.value = undefined
  filterStatus.value = undefined
  pageInfo.currentPage = 1
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
  loadData()
}

const handleCurrentChange = (row: ProductTreeNode | null) => {
  selectedItem.value = row
}

const handleExpandChange = async (row: ProductTreeNode, expanded: boolean) => {
  if (row.level !== 1) return
  if (!expanded) { expandedProductIds.delete(row.id); return }
  expandedProductIds.add(row.id)
  try {
    const specs: any[] = await productSpecList(row.id)
    row.children = specs.length > 0
      ? specs.map((s: any) => ({
          uid: `spec_${s.id}`,
          id: s.id,
          name: s.specName,
          level: 2 as const,
          productId: row.id,
          productName: row.name,
          certId: s.certId,
          certNo: s.certNo,
          certName: validCerts.value.find(c => c.id === s.certId)?.certName,
          sort: s.sort,
          status: s.status,
          statusName: s.statusName,
          remark: s.remark,
          createTime: s.createTime,
          hasChildren: false,
          children: [],
        }))
      : [{ uid: `empty_${row.id}`, id: -1, name: '', level: 2 as const, isEmpty: true, status: 0, statusName: '', hasChildren: false, children: [] }]
    productTreeData.value = [...productTreeData.value]
  } catch {
    row.children = []
    productTreeData.value = [...productTreeData.value]
  }
}

const getRowClassName = ({ row }: { row: ProductTreeNode }) => {
  return selectedItem.value?.uid === row.uid ? 'selected-row' : ''
}

const handleCommand = (command: ProductCommand, row: ProductTreeNode) => {
  switch (command) {
    case 'addSpec':
      handleAddSpec(row)
      break
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

const handleSpecCommand = (command: SpecCommand, row: ProductTreeNode) => {
  switch (command) {
    case 'edit':
      handleEditSpec(row)
      break
    case 'delete':
      handleDeleteSpec(row)
      break
  }
}

const handleCreate = () => {
  editingProduct.value = null
  productForm.value = {
    productName: '',
    category: '',
    categoryName: '',
    status: 1,
    remark: '',
  }
  productDialogVisible.value = true
}

const handleEdit = (row: ProductTreeNode) => {
  if (row.level === 2) {
    handleEditSpec(row)
    return
  }
  const product = products.value.find(p => p.id === row.id)
  if (!product) return
  editingProduct.value = product
  const matchedOpt = categoryOptions.value.find(o => o.value === product.category)
  productForm.value = {
    productName: product.productName,
    category: product.category || '',
    categoryName: matchedOpt?.label || product.categoryName || product.category || '',
    status: product.status,
    remark: product.remark || '',
  }
  productDialogVisible.value = true
}

const handleView = async (row: ProductTreeNode) => {
  try {
    const res = await productDetail(row.id)
    viewingProduct.value = res
    detailDialogVisible.value = true
  } catch {
    // error handled by http interceptor
  }
}

const handleViewCert = (row: ProductTreeNode) => {
  if (row.certId) {
    const cert = validCerts.value.find(c => c.id === row.certId)
    if (cert) {
      ElMessage.info(`注册证号：${cert.certCode}，名称：${cert.certName}`)
    }
  }
}

const handleSaveProduct = async () => {
  if (!productFormRef.value) return
  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingProduct.value) {
          const data: UpdateProductDTO = {
            productName: productForm.value.productName,
            category: productForm.value.category || undefined,
            categoryName: productForm.value.categoryName || undefined,
            status: productForm.value.status ?? 1,
            remark: productForm.value.remark || undefined,
          }
          await productUpdate(editingProduct.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const data: CreateProductDTO = {
            productName: productForm.value.productName,
            category: productForm.value.category || undefined,
            categoryName: productForm.value.categoryName || undefined,
            remark: productForm.value.remark || undefined,
          }
          await productCreate(data)
          ElMessage.success('创建成功')
        }
        productDialogVisible.value = false
        loadData()
      } catch {
        // error handled by http interceptor
      }
    }
  })
}

const handleDelete = async (row: ProductTreeNode) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品「${row.name}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await productDelete(row.id)
    ElMessage.success('删除成功')
    if (selectedItem.value?.id === row.id) {
      selectedItem.value = null
    }
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleToggleStatus = async (row: ProductTreeNode) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '停用'}产品「${row.name}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    const data: UpdateProductDTO = { status: newStatus }
    await productUpdate(row.id, data)
    ElMessage.success(`${newStatus === 1 ? '启用' : '停用'}成功`)
    loadData()
  } catch {
    // user cancel or error
  }
}

// ========== 校验规则 ==========
const productRules: FormRules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择产品分类', trigger: 'change' }],
}

// ========== 型号操作 ==========
const handleAddSpec = (row: ProductTreeNode) => {
  editingSpec.value = null
  specParentProduct.value = row
  specForm.value = {
    specName: '',
    certId: null,
    sort: 0,
    status: 1,
    remark: '',
  }
  specDialogVisible.value = true
}

const handleEditSpec = (row: ProductTreeNode) => {
  editingSpec.value = row
  specParentProduct.value = productTreeData.value.find(p => p.id === row.productId) || null
  specForm.value = {
    specName: row.name,
    certId: row.certId || null,
    sort: row.sort ?? 0,
    status: row.status,
    remark: row.remark || '',
  }
  specDialogVisible.value = true
}

const handleDeleteSpec = async (row: ProductTreeNode) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除型号「${row.name}」吗？删除后不可恢复。`,
      '提示',
      { type: 'error', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await productSpecDelete(row.id)
    ElMessage.success('删除成功')
    if (selectedItem.value?.id === row.id) {
      selectedItem.value = null
    }
    lastOperatedProductId = row.productId ?? null
    loadData()
  } catch {
    // user cancel or error
  }
}

const handleSaveSpec = async () => {
  if (!specFormRef.value) return
  await specFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingSpec.value) {
          const data: UpdateProductSpecDTO = {
            specName: specForm.value.specName,
            certId: specForm.value.certId || undefined,
            sort: specForm.value.sort,
            status: specForm.value.status,
            remark: specForm.value.remark || undefined,
          }
          await productSpecUpdate(editingSpec.value.id, data)
          ElMessage.success('修改成功')
        } else {
          const productId = specParentProduct.value?.id
          if (!productId) return
          const data: CreateProductSpecDTO = {
            specName: specForm.value.specName,
            certId: specForm.value.certId || undefined,
            sort: specForm.value.sort,
            status: specForm.value.status,
            remark: specForm.value.remark || undefined,
          }
          await productSpecCreate(productId, data)
          ElMessage.success('创建成功')
        }
        lastOperatedProductId = editingSpec.value ? (editingSpec.value.productId ?? null) : (specParentProduct.value?.id ?? null)
        specDialogVisible.value = false
        loadData()
      } catch {
        // error handled by http interceptor
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── Product 特有样式 ──

.product-category-tag {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.cert-select-option {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .cert-code {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 12px;
  }

  .cert-name {
    font-size: 11px;
    color: #9ca3af;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── 树形节点名称列样式 ──
.product-tree-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;

  .product-tree-icon {
    flex-shrink: 0;
    font-size: 18px;

    &.icon-level-product {
      color: #2f5bff;
    }

    &.icon-level-spec {
      color: #67c23a;
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

.product-tree-code-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  letter-spacing: 0.02em;
}

.tree-level-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.02em;

  &.level-product {
    background: #dbeafe;
    color: #1d4ed8;
  }

  &.level-spec {
    background: #dcfce7;
    color: #15803d;
  }
}

</style>
