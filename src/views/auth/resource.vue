<template>
  <list-template page-class="resource" hero-eyebrow="系统管理" hero-title="资源权限管理" hero-desc="管理系统菜单结构和功能权限，维护系统功能入口"
    filter-searchable filter-search-placeholder="搜索名称..." :filter-selects="filterSelects" @filter-search="onFilterInputTrigger"
     @filter-reset="handleReset" @filter-change="onFilterChange"
    :showFilterCreate="false">

    <template #filter-bottom>
      <!-- 视图切换（分段按钮） -->
      <div class="segment-tabs" role="tablist">
        <button type="button" class="segment-tabs__btn"
          :class="{ 'is-active': activeTab === 'menu' }" @click="handleToggleTab('menu')">
          菜单列表
        </button>
        <button type="button" class="segment-tabs__btn"
          :class="{ 'is-active': activeTab === 'function' }" @click="handleToggleTab('function')">
          功能列表
        </button>
      </div>
    </template>

    <!-- 菜单权限 -->
    <div v-show="activeTab === 'menu'" class="page-body-panel">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">菜单列表</span>
            <el-button type="primary" :icon="Plus" size="small" @click="handleCreate">添加菜单</el-button>
          </div>
        </template>
        <div class="roles-list-wrap">
          <el-table :data="tableMenus" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" row-key="id"
            :header-cell-style="{ background: '#f9fafb' }" height="100%" v-loading="loading">
            <el-table-column label="菜单名称" min-width="100">
              <template #default="{ row }">
                <div class="resource-menu-name-cell">
                  <i class="iconfont" style="color: #2f5bff"
                    :class="row.parentId ? 'icon-erjicaidan' : 'icon-shuxingtu'"></i>
                  <span class="resource-menu-name-cell__label">{{ row.name }}</span>
                  <el-tag v-if="row.code" size="small" effect="plain">{{ row.code }}</el-tag>
                  <span v-if="row.children?.length" class="resource-menu-name-cell__count">{{ row.children.length }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="排序" prop="sort" min-width="80" align="center" />
            <el-table-column label="菜单路径" prop="path" min-width="100" show-overflow-tooltip />
            <el-table-column label="状态" min-width="100" align="center">
              <template #default="{ row }">
                <div class="status-cell">
                  <el-switch :model-value="row.enabled" @change="handleToggleMenuStatus(row.id)" />
                  <span class="status-badge" :class="row.enabled ? 'status-badge--active' : 'status-badge--inactive'">
                    {{ row.enabled ? '启用' : '禁用' }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button v-if="!row.parentId" text :icon="Plus" title="添加子菜单" @click="handleCreateMenu(row)" />
                  <el-button text @click="handleEditMenu(row.id)"><span class="iconfont icon-bianji"></span></el-button>
                  <el-button text class="action-btn action-btn--danger" @click="handleDeleteMenu(row.id)"><span class="iconfont icon-shanchu"></span></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
    <!-- 功能权限 -->
    <div v-show="activeTab === 'function'" class="page-body-panel">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">功能列表</span>
            <el-button type="primary" :icon="Plus" size="small" @click="handleCreate">添加功能</el-button>
          </div>
        </template>
        <div class="roles-list-wrap">
          <el-table :data="groupedFilteredFunctions" :span-method="functionPermissionSpanMethod"
            :row-class-name="functionPermissionRowClassName" :header-cell-style="{ background: '#f9fafb' }"
            height="100%" v-loading="loading">
            <el-table-column label="功能名称">
              <template #default="{ row }">
                <span v-if="row.isGroup" class="function-group-title">{{ row.groupName }} ({{ row.groupCount }})</span>
                <span v-else>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="功能编码">
              <template #default="{ row }">
                <el-tag v-if="!row.isGroup" size="small" effect="plain">{{ row.code }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="所属模块" prop="module" />
            <el-table-column label="功能描述" prop="remark" show-overflow-tooltip />
            <el-table-column label="创建时间" prop="createTime">
              <template #default="{ row }">
                <span>{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template #default="{ row }">
                <div v-if="!row.isGroup" class="status-cell">
                  <el-switch :model-value="row.enabled" @change="handleToggleFunctionStatus(row.id)" />
                  <span class="status-badge" :class="row.enabled ? 'status-badge--active' : 'status-badge--inactive'">
                    {{ row.enabled ? '启用' : '禁用' }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <div v-if="!row.isGroup" class="table-actions">
                  <el-button text @click="handleEditFunction(row)"><span class="iconfont icon-bianji"></span></el-button>
                  <el-button text class="action-btn action-btn--danger" @click="handleDeleteFunction(row.id)"><span class="iconfont icon-shanchu"></span></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
            <!-- Pagination -->
            <page-box :current-page="funcPage.currentPage" :page-size="funcPage.pageSize" :total-count="funcPage.totalCount"
            @current-change="handlePageChange"/>
        </div>
      </el-card>
    </div>
  </list-template>
  <!-- Menu Dialog -->
  <dialog-modal v-model="menuDialogVisible" :title="menuForm.id ? '编辑菜单' : '新增菜单'" subtitle="用于配置导航入口、路由路径与菜单显示状态"
    width="600px" @modal-close="menuDialogVisible = false" @modal-confirm="handleSave">
    <div class="dialog-shell">
      <el-form :model="menuForm" label-position="top" :rules="menuRules" ref="menuFormRef">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源编码" prop="code">
              <el-input v-model="menuForm.code" placeholder="请输入资源编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由路径" prop="path">
              <el-input v-model="menuForm.path" placeholder="/example" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentId">
              <el-input v-if="menuForm.parentId !== '0'" :model-value="menuForm.parentMenuName" disabled
                placeholder="当前上级菜单" />
              <el-select v-model="menuForm.parentId" placeholder="选择上级菜单" style="width: 100%" v-else>
                <el-option label="根菜单（一级菜单）" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件路径">
              <el-input v-model="menuForm.component" placeholder="@/views/..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <el-input v-model="menuForm.icon" placeholder="LayoutDashboard" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重定向路径">
              <el-input v-model="menuForm.redirect" placeholder="/example/index" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示状态">
              <el-switch v-model="menuForm.visible" active-text="显示" inactive-text="隐藏" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="menuForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>
  <!-- Function Dialog -->
  <dialog-modal v-model="functionDialogVisible" :title="editingFunction ? '编辑功能权限' : '新增功能权限'"
    subtitle="用于配置模块功能编码、描述与权限状态" width="600px" @modal-close="functionDialogVisible = false"
    @modal-confirm="handleSave">
    <div class="dialog-shell">
      <el-form :model="functionForm" label-position="top" :rules="functionRules" ref="functionFormRef">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="功能名称" prop="name">
              <el-input v-model="functionForm.name" placeholder="请输入功能名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="功能编码" prop="code">
              <el-input v-model="functionForm.code" placeholder="module:action" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属菜单" prop="parentId">
              <el-select v-model="functionForm.parentId" placeholder="选择所属菜单" style="width: 100%">
                <el-option v-for="menu in leafMenus" :key="menu.id" :label="menu.resourceName" :value="menu.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示状态">
              <el-switch v-model="functionForm.visible" active-text="显示" inactive-text="隐藏" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="功能描述">
              <el-input v-model="functionForm.remark" placeholder="请输入功能描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  getResourceTree,
  addResource,
  updateResource,
  deleteResource,
  getResourceDetail,
  getResourceList,
  type ResourceItem,
  ResourceType,
  switchResourceStatus
} from '@/api/resource'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import dayjs from 'dayjs'

// 本地别名：与视图模板字段名一致
export interface Menu {
  id: string
  name: string
  code: string
  path: string
  component: string
  redirect: string
  visible: number
  icon: string
  parentId: string | null
  sort: number
  enabled: boolean
  remark: string
  resourceType?: number
  children?: Menu[]
}

export interface FunctionPermission {
  id: string
  name: string
  code: string
  module: string
  remark: string
  enabled: boolean
  createTime: string
}
interface FunctionPermissionTableRow extends Partial<FunctionPermission> {
  isGroup?: boolean
  groupName?: string
  groupCount?: number
}

export interface ResourceForm {
  id?: string;
  resourceType?: number;
  name?: string
  code?: string
  path?: string
  component?: string
  redirect?: string
  visible: boolean
  icon?: string
  parentId?: string | number
  parentMenuName?: string
  sort?: number
  enabled?: boolean
  remark?: string
}

export interface FunctionForm {
  name: string
  code: string
  parentId: number
  sort: number
  visible: boolean
  enabled: boolean
  remark: string
  description: string
}
// ========== 分页状态 ==========
// 功能权限分页
const funcPage = reactive<PageProps>({ totalCount: 0, currentPage: 1, pageSize: 10 })
const handlePageChange = (page: number) => {
  funcPage.currentPage = page
  loadFunctionList()
}
// ========== Data ==========
// 完整资源树缓存（进入页面时请求一次，所有视图共享）
const allResources = ref<ResourceItem[]>([])

/** 没有下级菜单的一级菜单 + 所有二级菜单 */
const leafMenus = computed(() => {
  const level1NoChildren = allResources.value.filter(menu => !menu.children?.length)
  const level2 = allResources.value.flatMap(menu => menu.children ?? [])
  return [...level1NoChildren, ...level2]
})
const activeTab = ref<'menu' | 'function'>('menu')
const menuName = ref('')
const loading = ref(false)

const expandedMenus = ref<string[]>(['1', '2', '3', '4'])
const menuDialogVisible = ref(false)
const functionDialogVisible = ref(false)
const menuFormRef = ref<FormInstance>()
const functionFormRef = ref<FormInstance>()

const editingMenu = ref<Menu | null>(null)
const editingFunction = ref<FunctionPermission | null>(null)

const menuForm = ref<ResourceForm>({
  visible: true,
  parentId: '0',
  sort: 1,
  enabled: true,
})

const functionForm = ref<FunctionForm>({
  name: '',
  code: '',
  parentId: 0,
  sort: 1,
  visible: true,
  enabled: true,
  remark: '',
  description: '',
})

const filterSelects = [
  {
    modelKey: 'status',
    placeholder: '全部状态',
    options: [
      { label: '全部状态', value: '' },
      { label: '启用', value: '1' },
      { label: '停用', value: '0' },
    ]
  }
]

const filterValues = ref<Record<string, string>>({})

// 递归过滤：只保留 resourceType 为 1（一级菜单）和 2（二级菜单）的节点
const filterMenuTree = (list: ResourceItem[]): ResourceItem[] =>
  list
    .filter(r => r.resourceType === 1 || r.resourceType === 2)
    .map(r => ({ ...r, children: r.children ? filterMenuTree(r.children) : [] }))

// 菜单数据（从 allResources 缓存计算得出：resourceType 1/2 的树形结构）
const menus = computed<Menu[]>(() =>
  filterMenuTree(allResources.value).map(r => mapResourceToMenu(r))
)

/** 将后端 ResourceItem 映射为本地的 Menu */
const mapResourceToMenu = (r: ResourceItem): Menu => ({
  id: String(r.id),
  name: r.resourceName,
  code: r.resourceCode || '',
  path: r.path || '',
  component: r.component || '',
  redirect: '',
  visible: r.visible ?? 1,
  icon: r.icon || '',
  parentId: r.parentId ? String(r.parentId) : null,
  sort: r.sort ?? 1,
  enabled: r.status !== 0,
  remark: '',
  resourceType: r.resourceType,
  children: r.children?.map(mapResourceToMenu),
})

// 功能权限数据（二级菜单分组 + 三级按钮）
interface FunctionItem {
  id: string
  name: string
  code: string
  module: string
  parentName: string
  parentId: string
  remark: string
  enabled: boolean
  createTime: string
}

/** 从 allResources 展开所有按钮节点 */
// 功能列表数据（通过 API 获取 resourceType=3）
const functionList = ref<FunctionItem[]>([])

// 表单验证规则
const menuRules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }],
  path: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
}

const functionRules: FormRules = {
  name: [{ required: true, message: '请输入功能名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入功能编码', trigger: 'blur' }],
  module: [{ required: true, message: '请选择所属菜单', trigger: 'change' }]
}

const tableMenus = computed(() => {
  const keyword = menuName.value.trim().toLowerCase()
  let list = menus.value

  if (keyword) {
    const filterByName = (items: Menu[]): Menu[] =>
      items
        .filter(m => m.name.toLowerCase().includes(keyword))
        .map(m => ({
          ...m,
          children: m.children ? filterByName(m.children) : undefined,
        }))
    list = filterByName(list)
  }

  const status = filterValues.value.status
  if (status === '1' || status === '0') {
    const wantEnabled = status === '1'
    const filterByStatus = (items: Menu[]): Menu[] =>
      items
        .filter(m => m.enabled === wantEnabled)
        .map(m => ({
          ...m,
          children: m.children ? filterByStatus(m.children) : undefined,
        }))
    list = filterByStatus(list)
  }

  return list
})

const filteredFunctions = computed(() => {
  const keyword = menuName.value.trim().toLowerCase()
  let list = functionList.value

  if (keyword) {
    list = list.filter(
      func =>
        func.name.toLowerCase().includes(keyword) ||
        func.module.toLowerCase().includes(keyword)
    )
  }

  const status = filterValues.value.status
  if (status === '1' || status === '0') {
    const wantEnabled = status === '1'
    list = list.filter(func => func.enabled === wantEnabled)
  }

  return list
})
const groupedFilteredFunctions = computed<FunctionPermissionTableRow[]>(() => {
  const moduleMap = new Map<string, FunctionItem[]>()
  filteredFunctions.value.forEach((item) => {
    const list = moduleMap.get(item.module) || []
    list.push(item)
    moduleMap.set(item.module, list)
  })

  const rows: FunctionPermissionTableRow[] = []
  moduleMap.forEach((items, moduleName) => {
    rows.push({
      isGroup: true,
      groupName: moduleName,
      groupCount: items.length
    })
    rows.push(...items)
  })
  return rows
})

// ========== Methods ==========
/** 进入页面时：调一次 /system/resource/tree 获取完整资源树 */
const loadAllResources = async () => {
  loading.value = true
  try {
    const res = await getResourceTree() as unknown as ResourceItem[]
    allResources.value = res || []
    expandedMenus.value = allResources.value.map(r => String(r.id))
  } catch (error) {
    console.error('加载资源树失败', error)
  } finally {
    loading.value = false
  }
}

const loadFunctionList = async () => {
  loading.value = true
  try {
    const payload: any = {
      pageNum: funcPage.currentPage,
      pageSize: funcPage.pageSize,
      resourceType: 3 as ResourceType
    }
    // 带上筛选条件
    const keyword = menuName.value.trim()
    if (keyword) {
      payload.resourceName = keyword
    }
    const status = filterValues.value.status
    if (status === '1' || status === '0') {
      payload.status = Number(status)
    }
    const funcRes = await getResourceList(payload) as any
    const funcData = funcRes.records
    funcPage.totalCount = funcRes.total
    funcPage.currentPage = funcRes.current
    // 建立 id → resourceName 的查找表（包含一级和二级菜单）
    const nameMap: Record<string, string> = {}
    for (const menu of allResources.value) {
      nameMap[String(menu.id)] = menu.resourceName
      if (menu.children) {
        for (const child of menu.children) {
          nameMap[String(child.id)] = child.resourceName
        }
      }
    }
    functionList.value = funcData.map((item: any) => ({
      id: String(item.id),
      name: item.resourceName,
      code: item.resourceCode || '',
      module: nameMap[item.parentId] ?? '',
      parentName: nameMap[item.parentId] ?? '',
      parentId: String(item.parentId ?? ''),
      remark: item.remark ?? '',
      enabled: item.status !== 0,
      createTime: item.createTime || '',
    }))

  } catch (error) {
    console.error('加载功能列表失败', error)
  } finally {
    loading.value = false
  }

}

onMounted(() => {
  loadAllResources()
})

// 上级菜单切换 → 同步 parentMenuName
watch(() => menuForm.value.parentId, (newId) => {
  if (newId === '0') {
    menuForm.value.parentMenuName = ''
  } else {
    const found = allResources.value.find(r => r.id === Number(newId))
    menuForm.value.parentMenuName = found?.resourceName ?? ''
  }
})

const handleToggleTab = (tab: 'menu' | 'function') => {
  activeTab.value = tab
  if (tab === 'function') {
    loadFunctionList()
  } else {
    loadAllResources()
  }
}

const handleCreateMenu = (parent?: Menu) => {
  editingMenu.value = null
  menuForm.value = {
    name: '',
    code: '',
    path: '',
    component: '',
    redirect: '',
    visible: true,
    icon: '',
    parentId: parent ? parent.id : '0',
    parentMenuName: parent?.name ?? '',
    sort: 1,
    enabled: true,
    remark: ''
  }
  menuDialogVisible.value = true
}

const handleReset = () => {
  menuName.value = ''
  filterValues.value = {}
}

const handleCreate = () => {
  if (activeTab.value === 'menu') {
    handleCreateMenu()
  } else {
    handleCreateFunction()
  }
}

const onFilterChange = (key: string, value: string) => {
  filterValues.value[key] = value
}

const onFilterInputTrigger = (value: string) => {
  menuName.value = value || ''
  if (activeTab.value === 'function') {
    funcPage.currentPage = 1
    loadFunctionList()
  }
}

const handleEditMenu = async (id: String) => {
  menuDialogVisible.value = true
  try {
    const detail = await getResourceDetail(Number(id)) as any
    menuForm.value = {
      ...detail,
      name: detail.resourceName ?? '',
      code: detail.resourceCode ?? '',
      path: detail.path ?? '',
      component: detail.component ?? '',
      redirect: detail.redirect ?? '',
      visible: detail.visible === 1,
      icon: detail.icon ?? '',
      parentId: detail.parentId ? String(detail.parentId) : '0',
      parentMenuName: detail.resourceName ?? '',
      sort: detail.sort ?? 1,
      enabled: detail.status !== 0,
      remark: detail.remark ?? ''
    }
  } catch (e) {
    ElMessage.error('加载详情失败')
    menuDialogVisible.value = false
  }
}

const handleDeleteMenu = async (menuId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除此菜单吗？', '提示', {
      type: 'error',
      customClass: 'auth-confirm-dialog auth-confirm-dialog--danger'
    })
    await deleteResource(Number(menuId))
    ElMessage.success('删除成功')
    loadAllResources()
  } catch {
    // 用户取消
  }
}

const handleSave = async () => {
  if (menuDialogVisible.value) {
    if (!menuFormRef.value) return
    await menuFormRef.value.validate(async (valid) => {
      if (!valid) return
      try {
        const payload: any = {
          resourceName: menuForm.value.name,
          resourceCode: menuForm.value.code,
          resourceType: menuForm.value.resourceType,
          path: menuForm.value.path,
          component: menuForm.value.component,
          redirect: menuForm.value.redirect,
          visible: menuForm.value.visible ? 1 : 0,
          icon: menuForm.value.icon,
          sort: menuForm.value.sort,
          enabled: menuForm.value.enabled ? 1 : 0,
          remark: menuForm.value.remark,
          parentId: menuForm.value.parentId !== '0' ? Number(menuForm.value.parentId) : 0,
        }
        if (menuForm.value.id) {
          await updateResource(Number(menuForm.value.id), payload)
          ElMessage.success('修改成功')
          loadFunctionList()
        } else {
          const isLevel1 = menuForm.value.parentId === '0'
          await addResource({ ...payload, resourceType: isLevel1 ? 1 : 2 })
          ElMessage.success('创建成功')
          loadAllResources()
        }
        menuDialogVisible.value = false
        
      } catch {
        // error handled by interceptor
      } finally {
        loading.value = false
      }
    })
  } else if (functionDialogVisible.value) {
    if (!functionFormRef.value) return
    await functionFormRef.value.validate(async (valid) => {
      if (!valid) return
      try {
        const payload: any = {
          resourceName: functionForm.value.name,
          resourceCode: functionForm.value.code,
          resourceType: 3,
          parentId: functionForm.value.parentId,
          status: functionForm.value.enabled ? 1 : 0,
          sort: functionForm.value.sort,
          visible: functionForm.value.visible ? 1 : 0,
          remark: functionForm.value.remark,
        }
        if (editingFunction.value) {
          await updateResource(Number((editingFunction.value as any).id), payload)
          ElMessage.success('修改成功')
        } else {
          await addResource(payload)
          ElMessage.success('创建成功')
        }
        functionDialogVisible.value = false
        loadAllResources()
        loadFunctionList()
      } catch {
        // error handled by interceptor
      }
    })
  }
}

const handleCreateFunction = () => {
  editingFunction.value = null
  functionForm.value = {
    name: '',
    code: '',
    parentId: 0,
    sort: 1,
    visible: true,
    enabled: true,
    description: '',
    remark: '',
  }
  functionDialogVisible.value = true
}

const handleEditFunction = async (func: FunctionItem) => {
  editingFunction.value = func as any
  functionDialogVisible.value = true
  try {
    const detail = await getResourceDetail(Number(func.id)) as any
    functionForm.value = {
      name: detail.resourceName ?? '',
      code: detail.resourceCode ?? '',
      parentId: detail.parentId ?? 0,
      sort: detail.sort ?? 1,
      visible: detail.visible === 1,
      enabled: detail.status !== 0,
      description: detail.remark ?? '',
      remark: detail.remark ?? '',
    }
  } catch {
    ElMessage.error('加载详情失败')
    functionDialogVisible.value = false
  }
}

const handleDeleteFunction = async (funcId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除此功能吗？', '提示', {
      type: 'error',
      customClass: 'auth-confirm-dialog auth-confirm-dialog--danger'
    })
    await deleteResource(Number(funcId))
    ElMessage.success('删除成功')
    loadAllResources()
  } catch {
    // 用户取消
  }
}
const handleToggleMenuStatus = async (menuId: string) => {
  const flat = flattenMenus(menus.value)
  const item = flat.find(m => m.id === menuId)
  if (!item) return
  try {
    await switchResourceStatus(Number(menuId), item.enabled ? 1 : 0)
    ElMessage.success('状态更新成功')
    loadAllResources()
  } catch {
    item.enabled = !item.enabled
  }
}

const handleToggleFunctionStatus = async (funcId: string) => {
  const item = functionList.value.find(f => f.id === funcId)
  try {
    await switchResourceStatus(Number(funcId), item?.enabled ? 1 : 0 )
    ElMessage.success('状态更新成功')
    loadFunctionList()
  } catch {
    if (item) {
      item.enabled = !item.enabled
    }
    // revert handled by flat list refresh
  }
}

const functionPermissionRowClassName = ({ row }: { row: FunctionPermissionTableRow }) => {
  return row.isGroup ? 'function-group-row' : ''
}
const functionPermissionSpanMethod = ({ row, columnIndex }: { row: FunctionPermissionTableRow, columnIndex: number }) => {
  if (row.isGroup) {
    if (columnIndex === 0) return [1, 7]
    return [0, 0]
  }
  return [1, 1]
}

/** 拍平菜单树（用于状态切换等场景） */
const flattenMenus = (list: Menu[]): Menu[] => {
  const result: Menu[] = []
  for (const m of list) {
    result.push(m)
    if (m.children) result.push(...flattenMenus(m.children))
  }
  return result
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── Resource 特有样式 ──

.resource-menu-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;

  &__icon {
    flex-shrink: 0;
    font-size: 18px;

    &--parent {
      color: #2f5bff;
    }

    &--leaf {
      color: #909399;
      font-size: 16px;
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

:deep(.function-group-row) {
  .el-table__cell {
    background: #f5f7fa !important;
    font-weight: 600;
  }
}

.function-group-title {
  font-size: 14px;
  font-weight: 600;
}
</style>
