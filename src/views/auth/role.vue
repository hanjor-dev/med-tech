<template>
  <list-template page-class="role" hero-eyebrow="系统管理" hero-title="角色权限管理" hero-desc="管理系统角色，配置角色功能权限与数据访问范围"
    filter-searchable filter-search-placeholder="搜索角色名称、编码…" :filter-selects="filterSelects"
    filter-create-label="新建角色" @filter-search="searchText = $event" @filter-reset="handleReset"
    @filter-create="handleCreate" @filter-change="onFilterChange">
    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">角色列表</span>
          </div>
        </template>
        <div class="roles-list-wrap">
          <el-table ref="tableRef" :data="filteredRoles" highlight-current-row @current-change="handleCurrentChange"
            :row-class-name="getRowClassName" v-loading="loading" :header-cell-style="{ background: '#f9fafb' }">
            <el-table-column label="角色名称" min-width="180">
              <template #default="{ row }">
                <div>
                  <div class="role-name">{{ row.roleName }}</div>
                  <div class="role-description">{{ row.roleDesc }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="账户类型">
              <template #default="{ row }">
                <el-tag :type="row.accountType === '6.1' ? 'primary' : 'warning'" size="small" effect="plain">{{
                  row.accountTypeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数据权限">
              <template #default="{ row }">
                <span>{{ row.dataScopeTypeName }}</span>
              </template>
            </el-table-column>

            <el-table-column label="状态" align="center">
              <template #default="{ row }">
                <span class="status-badge"
                  :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="180">
              <template #default="{ row }">
                <span>{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" fixed="right" align="center">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd: RoleCommand) => handleCommand(cmd, row)">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon>
                          <Edit />
                        </el-icon>编辑角色
                      </el-dropdown-item>
                      <el-dropdown-item command="permissions">
                        <el-icon>
                          <Lock />
                        </el-icon>资源权限
                      </el-dropdown-item>
                      <el-dropdown-item command="toggle" divided>
                        <el-icon>
                          <Switch />
                        </el-icon>{{ row.status === 1 ? '禁用角色' : '启用角色' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <span style="color: #f56c6c">
                          <el-icon>
                            <Delete />
                          </el-icon>删除角色
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination -->
          <page-box :current-page="currentPage" :page-size="pageSize" :total-count="totalCount"
            @current-change="handlePageChange" @size-change="pageSize = $event" />
        </div>
      </el-card>
    </div>
    <div class="page-body-panel ml-10">
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedRole }">
        <!-- 空状态 -->
        <div v-if="!selectedRole" class="detail-empty">
          <el-empty description="请从左侧选择一个角色" :image-size="80" />
        </div>
        <!-- 已选角色详情 -->
        <el-card v-if="selectedRole" class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">角色详情</span>
            </div>
          </template>
          <div class="role-detail">
            <div class="detail-header">
              <span class="detail-role-name">{{ selectedRole.roleName }}</span>
              <span class="status-badge"
                :class="selectedRole.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedRole.statusName }}
              </span>
            </div>
            <span class="role-code-tag" style="margin: 6px 0 12px; display: inline-block;">{{ selectedRole.roleCode
              }}</span>
            <div class="detail-item">
              <p class="detail-label">角色描述</p>
              <p class="detail-value">{{ selectedRole.roleDesc || '-' }}</p>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">账户类型</p>
                <p class="detail-value">{{ selectedRole.accountTypeName }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">数据权限</p>
                <p class="detail-value">{{ selectedRole.dataScopeTypeName }}</p>
              </div>
            </div>
            <div class="detail-item">
              <p class="detail-label">菜单权限</p>
              <div class="detail-perm-flat" v-if="detailPermTree.length > 0">
                <div v-for="l1 in detailPermTree" :key="l1.id" class="perm-l1-item">
                  <el-tag size="small" :style="{
                    background: 'rgba(47,91,255,0.08)',
                    color: '#2f5bff',
                    border: 'none',
                    fontWeight: '500',
                    marginRight: '6px',
                    marginBottom: '6px',
                    borderRadius: '6px'
                  }">
                    {{ l1.resourceName }}
                  </el-tag>
                  <div v-if="l1.children?.length" class="perm-l1-children">
                    <div v-for="l2 in l1.children" :key="l2.id" class="perm-l1-item">
                      <el-tag size="small" :style="{
                        background: 'rgba(34,197,94,0.08)',
                        color: '#16a34a',
                        border: 'none',
                        fontWeight: '500',
                        marginRight: '6px',
                        marginBottom: '6px',
                        borderRadius: '6px'
                      }">{{ l2.resourceName }}</el-tag>
                      <div v-if="l2.children?.length" class="perm-l2-btns">
                        <el-tag v-for="btn in l2.children" :key="btn.id" size="small" class="perm-btn-tag">{{
                          btn.resourceName }}</el-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span v-else class="detail-value detail-value--empty">暂无权限</span>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">创建时间</p>
                <p class="detail-value">{{ dayjs(selectedRole.createTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">更新时间</p>
                <p class="detail-value">{{ dayjs(selectedRole.updateTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
              </div>
            </div>
            <div class="detail-item">
              <p class="detail-label">备注</p>
              <p class="detail-value">{{ selectedRole.remark || '-' }}</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </list-template>

  <!-- Role Form Dialog -->
  <dialog-modal v-model="roleDialogVisible" :title="editingRole ? '编辑角色' : '新建角色'" subtitle="用于配置角色基本信息与数据权限范围"
    width="600px" :loading="roleDialogLoading" @modal-close="roleDialogVisible = false" @modal-confirm="handleSaveRole">
    <div class="dialog-shell">
      <el-form :model="roleForm" label-position="top" :rules="roleRules" ref="roleFormRef">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色编码" prop="roleCode">
              <el-input v-model="roleForm.roleCode" placeholder="请输入角色编码" maxlength="32" :disabled="!!editingRole" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账户类型" prop="accountType">
              <el-select v-model="roleForm.accountType" placeholder="选择账户分类" style="width: 100%">
                <el-option v-for="item in accountTypeOptions" :key="item.value" :label="item.label"
                  :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据权限" prop="dataScopeType">
              <el-select v-model="roleForm.dataScopeType" placeholder="选择数据权限" style="width: 100%">
                <el-option v-for="item in dataScopeTypeOptions" :key="item.value" :label="item.label"
                  :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="角色描述">
              <el-input v-model="roleForm.roleDesc" type="textarea" :rows="3" placeholder="请输入角色描述" maxlength="256"
                show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="roleForm.remark" type="textarea" :rows="3" placeholder="请输入角色备注" maxlength="256"
                show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </dialog-modal>

  <!-- Permission Config Dialog -->
  <dialog-modal v-model="permissionDialogVisible" subtitle="勾选该角色可访问的菜单和功能按钮" width="820px"
    @modal-close="permissionDialogVisible = false">
    <template #title>
      <div class="perm-dialog-title">
        配置权限
        <span class="perm-role-tag">{{ selectedRole?.roleName || '' }}</span>
      </div>
    </template>

    <div class="permission-body">
      <!-- LEFT: Tree Panel -->
      <div class="perm-tree-panel">
        <div class="perm-tree-toolbar">
          <el-input v-model="permSearchKeyword" size="default" placeholder="搜索菜单或按钮..." :prefix-icon="Search" clearable
            style="flex:1" />
          <el-button size="default" @click="togglePermTreeExpand">
            {{ permTreeAllExpanded ? '折叠' : '展开' }}
          </el-button>
        </div>

        <el-tree ref="permissionTreeRef" :data="filteredPermTree"
          :props="{ label: 'resourceName', children: 'children' }" node-key="id" show-checkbox
          :default-expand-all="permTreeAllExpanded" check-strictly @check="onPermCheckChange"
          style="height: 500px;overflow-y: auto;">
          <template #default="{ data }">
            <span class="perm-node-row">
              <el-tag size="small" :style="{
                background: data.resourceType === 1 ? 'rgba(47,91,255,0.08)' : data.resourceType === 2 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                color: data.resourceType === 1 ? '#2f5bff' : data.resourceType === 2 ? '#16a34a' : '#b45309',
                border: 'none',
                fontWeight: '600',
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '5px',
                flexShrink: '0'
              }">
                {{ data.resourceType === 1 ? '菜单' : data.resourceType === 2 ? '子菜单' : '按钮' }}
              </el-tag>
              <span class="perm-node-label">{{ data.resourceName }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- RIGHT: Permission Tags Panel -->
      <div class="perm-tags-panel">
        <div class="perm-tags-section">

          <!-- 菜单权限树（与角色详情布局一致） -->
          <div v-if="dialogPermTree.length > 0" class="detail-perm-flat">
            <div v-for="l1 in dialogPermTree" :key="l1.id" class="perm-l1-item">
              <el-tag size="small" :style="{
                background: 'rgba(47,91,255,0.08)',
                color: '#2f5bff',
                border: 'none',
                fontWeight: '500',
                marginRight: '6px',
                marginBottom: '6px',
                borderRadius: '6px'
              }">{{ l1.resourceName }}</el-tag>
              <div v-if="l1.children?.length" class="perm-l1-children">
                <div v-for="l2 in l1.children" :key="l2.id" class="perm-l1-item">
                  <el-tag :style="{
                    background: 'rgba(34,197,94,0.08)',
                    color: '#16a34a',
                    border: 'none',
                    fontWeight: '500',
                    marginRight: '6px',
                    marginBottom: '6px',
                    borderRadius: '6px'
                  }">{{ l2.resourceName }}</el-tag>
                  <div v-if="l2.children?.length" class="perm-l2-btns">
                    <el-tag v-for="btn in l2.children" :key="btn.id" size="small" class="perm-btn-tag">{{
                      btn.resourceName
                    }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="dialogPermTree.length === 0" class="perm-empty">
            暂未选择任何权限
          </div>

        </div>
      </div>

    </div>
    <template #footer-btn>
      <div class="perm-dialog-footer">
        <span class="perm-footer-stat">
          已选择 <strong style="color:#2f5bff">{{ checkedPermCount }}</strong> 项权限
        </span>
        <div style="display:flex;gap:10px">
          <el-button class="btn btn-ghost" @click="permissionDialogVisible = false">取消</el-button>
          <el-button class="btn btn-primary" @click="handleSavePermissions">保存配置</el-button>
        </div>
      </div>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type ElTree } from 'element-plus'
import {
  Search,
  Edit,
  Delete,
  Lock,
  MoreFilled,
  Switch,
} from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import pageBox from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import { getRoleList, getRoleDetail, createRole, updateRole, deleteRole, changeRoleStatus, getDataScopeTypes, type RoleVO, type RoleFormData } from '@/api/role'
import { getAllResourceTree, getRoleResourceIds, assignRoleResources } from '@/api/resource'
import { dictOptions } from '@/api/dict'
import dayjs from 'dayjs'

// ========== Interface ==========
export interface Role {
  id: number
  roleName?: string
  roleCode?: string
  roleDesc?: string
  accountType?: number | string
  accountTypeName?: string
  dataScopeType?: string
  dataScopeTypeName?: string
  status?: number
  statusName?: string
  remark?: string
  createTime?: string
  updateTime?: string
  resourceIds?: number[]
}

export type RoleCommand = 'edit' | 'permissions' | 'toggle' | 'delete'

export interface PermissionCategory {
  name: string
  total: number
  granted: number
}

// 资源树节点
export interface ResourceNode {
  id: number
  parentId?: number
  resourceName: string
  resourceCode: string
  resourceType: number
  resourceTypeName: string
  checked: boolean
  children?: ResourceNode[]
}

// ========== Data ==========
const loading = ref(false)
const searchText = ref('')
const filterAccountType = ref('')
const filterStatus = ref('')
const activeTab = ref('all')
const selectedRole = ref<Role | null>(null)
const tableRef = ref()

// 详情区：已加载的完整资源树（用于渲染权限标签名）
const detailResourceTree = ref<ResourceNode[]>([])

// 详情区：构建已选权限的树形结构（菜单+嵌套按钮）
const detailPermTree = computed(() => {
  if (!selectedRole.value?.resourceIds?.length || !detailResourceTree.value.length) return []
  const ids = new Set(selectedRole.value.resourceIds)

  // 递归：只保留已被选中的节点，并裁剪未选中的子树
  const filterTree = (nodes: ResourceNode[]): ResourceNode[] => {
    return nodes
      .filter(node => ids.has(node.id))
      .map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined,
      }))
  }

  return filterTree(detailResourceTree.value)
})

watch(selectedRole, async (role) => {
  if (!role?.resourceIds?.length) {
    detailResourceTree.value = []
    return
  }
  try {
    const res: any = await getAllResourceTree()
    detailResourceTree.value = res || []
  } catch {
    detailResourceTree.value = []
  }
}, { immediate: true })

// 筛选下拉选项（与 listTemplate filter-selects 对应）
const filterSelects = computed(() => [
  {
    modelKey: 'accountType',
    placeholder: '全部账户类型',
    options: [
      { label: '全部账户类型', value: '' },
      ...accountTypeOptions.value.map(item => ({ label: item.label, value: String(item.value) })),
    ]
  },
  {
    modelKey: 'status',
    placeholder: '全部状态',
    options: [
      { label: '全部状态', value: '' },
      { label: '正常', value: '1' },
      { label: '停用', value: '0' },
    ]
  }
])

// 处理 listTemplate 筛选项变化
const onFilterChange = (key: string, value: any) => {
  if (key === 'accountType') filterAccountType.value = value
  if (key === 'status') filterStatus.value = value
}

// 角色列表数据
const roles = ref<Role[]>([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchRoleList()
}
// 标签页切换联动筛选状态
watch(activeTab, (val) => {
  if (val === 'all') {
    filterStatus.value = ''
  } else {
    filterStatus.value = val
  }
})

// ========== 弹框状态 ==========
const roleDialogVisible = ref(false)
const roleDialogLoading = ref(false)
const permissionDialogVisible = ref(false)
const editingRole = ref<Role | null>(null)
const roleFormRef = ref<FormInstance>()
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()
const allResourceTree = ref<ResourceNode[]>([])
const currentRoleResourceIds = ref<number[]>([])

// 权限弹框相关状态
const permSearchKeyword = ref('')
const permTreeAllExpanded = ref(false)
const selectedPermMenuTags = ref<ResourceNode[]>([])
const selectedPermSubMenuTags = ref<ResourceNode[]>([])
const selectedPermBtnTags = ref<ResourceNode[]>([])

// 权限树搜索过滤
const filteredPermTree = computed(() => {
  if (!permSearchKeyword.value.trim()) return allResourceTree.value
  const kw = permSearchKeyword.value.trim().toLowerCase()
  const filterNode = (nodes: ResourceNode[]): ResourceNode[] => {
    return nodes.reduce<ResourceNode[]>((acc, node) => {
      const children = node.children ? filterNode(node.children) : undefined
      const match = node.resourceName.toLowerCase().includes(kw) ||
        (node.resourceCode || '').toLowerCase().includes(kw)
      if (match || (children && children.length > 0)) {
        acc.push({ ...node, children: children?.length ? children : node.children })
      }
      return acc
    }, [])
  }

  return filterNode(allResourceTree.value)
})

// 已选权限数量
const checkedPermCount = computed(() => {
  return selectedPermMenuTags.value.length + selectedPermSubMenuTags.value.length + selectedPermBtnTags.value.length
})

// 从当前选中节点提取菜单/子菜单/按钮分类
const extractPermTags = (nodes: ResourceNode[]) => {
  // getCheckedNodes(false) 只返回当前完全勾选的节点（不包含半选父节点）
  // 直接按 resourceType 分类，无需再依赖 node.checked
  const menus: ResourceNode[] = []
  const subMenus: ResourceNode[] = []
  const btns: ResourceNode[] = []
  for (const node of nodes) {
    if (node.resourceType === 1) menus.push(node)
    else if (node.resourceType === 2) subMenus.push(node)
    else btns.push(node)
  }
  return { menus, subMenus, btns }
}

// 弹框右侧：根据三个扁平数组重建树形结构（与角色详情菜单权限布局一致）
const dialogPermTree = computed(() => {
  const tree: ResourceNode[] = []

  // 建立 id → 节点映射
  const nodeMap = flattenResourceTreeToMap(allResourceTree.value)

  for (const l1 of selectedPermMenuTags.value) {
    const l1Node: ResourceNode = { ...l1, children: [] }
    for (const l2 of selectedPermSubMenuTags.value) {
      if (l2.parentId === l1.id) {
        const l2Node: ResourceNode = { ...l2, children: [] }
        for (const btn of selectedPermBtnTags.value) {
          if (btn.parentId === l2.id) {
            l2Node.children!.push({ ...btn })
          }
        }
        l1Node.children!.push(l2Node)
      }
    }
    tree.push(l1Node)
  }

  // 补充：二级菜单下没有对应一级菜单，但有按钮的情况
  for (const l2 of selectedPermSubMenuTags.value) {
    const hasParent = selectedPermMenuTags.value.some(m => m.id === l2.parentId)
    if (!hasParent) {
      const l2Node: ResourceNode = { ...l2, children: [] }
      for (const btn of selectedPermBtnTags.value) {
        if (btn.parentId === l2.id) {
          l2Node.children!.push({ ...btn })
        }
      }
      tree.push(l2Node)
    }
  }

  return tree
})

// 递归扁平化资源树（节点 id → 节点原始引用）
const flattenResourceTreeToMap = (nodes: ResourceNode[]): Map<number, ResourceNode> => {
  const map = new Map<number, ResourceNode>()
  const walk = (list: ResourceNode[]) => {
    for (const node of list) {
      map.set(node.id, node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return map
}

// 递归扁平化资源树（用于详情区 id→name 映射）
const flattenResourceTree = (nodes: ResourceNode[]): ResourceNode[] => {
  const result: ResourceNode[] = []
  const walk = (list: ResourceNode[]) => {
    for (const node of list) {
      result.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

// 权限类型名称映射（与资源权限弹框标签颜色对应）
const getPermTypeName = (type: number, parentName?: string): string => {
  if (type === 1) return '一级菜单'
  if (type === 2) return '二级菜单'
  if (type === 3) return parentName ? `按钮（${parentName}）` : '按钮'
  return `类型${type}`
}

// 递归给节点注入 checked 状态（根据当前已勾选 IDs）
const injectChecked = (nodes: ResourceNode[], checkedIds: number[]): ResourceNode[] => {
  return nodes.map(node => ({
    ...node,
    checked: checkedIds.includes(node.id),
    children: node.children ? injectChecked(node.children, checkedIds) : undefined
  }))
}

// 监听权限树勾选变化
const onPermCheckChange = () => {
  if (!permissionTreeRef.value) return
  const checkedNodes = permissionTreeRef.value.getCheckedNodes(false) as ResourceNode[]
  const { menus, subMenus, btns } = extractPermTags(checkedNodes)
  selectedPermMenuTags.value = menus
  selectedPermSubMenuTags.value = subMenus
  selectedPermBtnTags.value = btns
}

// 切换展开/折叠（使用 Element Plus 内部 TreeStore.setExpand）
const togglePermTreeExpand = () => {
  if (!permissionTreeRef.value) return
  const nodes = permissionTreeRef.value.store._getAllNodes()
  if (permTreeAllExpanded.value) {
    nodes.forEach(node => node.collapse())
    permTreeAllExpanded.value = false
  } else {
    nodes.forEach(node => node.expand())
    permTreeAllExpanded.value = true
  }
}

// 角色表单
const roleForm = ref<Partial<Role>>({
  roleName: '',
  roleCode: '',
  roleDesc: '',
  accountType: '6.1',
  dataScopeType: '',
  resourceIds: []
})

// 表单验证规则
const roleRules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  accountType: [{ required: true, message: '请选择账户分类', trigger: 'change' }]
}

// 账户分类选项
const accountTypeOptions = ref<{ label: string; value: number }[]>([])

const fetchAccountTypeOptions = async () => {
  try {
    const res: any = await dictOptions('6')
    if (Array.isArray(res)) {
      accountTypeOptions.value = res.map((item: any) => ({
        label: item.dictName,
        value: item.dictCode,
      }))
    }
  } catch {
    accountTypeOptions.value = []
  }
}

// 数据权限选项
const dataScopeTypeOptions = ref<{ label: string; value: string }[]>([])

const fetchDataScopeTypeOptions = async () => {
  try {
    const res: any = await getDataScopeTypes()
    if (Array.isArray(res)) {
      dataScopeTypeOptions.value = res.map((item: any) => ({
        label: item.dataScopeTypeName || item.label || item.name || item,
        value: String(item.dataScopeType || item.value || item.id || item),
      }))
    }
  } catch {
    dataScopeTypeOptions.value = []
  }
}

const filteredRoles = computed(() => {
  let result = roles.value
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      role =>
        role.roleName?.toLowerCase().includes(search) ||
        role.roleCode?.toLowerCase().includes(search)
    )
  }
  if (filterStatus.value) {
    result = result.filter(role => String(role.status) === filterStatus.value)
  }
  if (filterAccountType.value) {
    result = result.filter(role => String(role.accountType) === filterAccountType.value)
  }
  return result
})

// ========== API ==========
const fetchRoleList = async (): Promise<void> => {
  try {
    loading.value = true
    const payload = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      roleName: searchText.value || undefined,
      accountType: filterAccountType.value ? Number(filterAccountType.value) : undefined,
      status: filterStatus.value ? Number(filterStatus.value) : undefined,
    }
    const res: any = await getRoleList(payload)
    const { records, current, total } = res
    roles.value = records
    currentPage.value = current
    totalCount.value = total
    if (!selectedRole.value && records.length > 0) {
      selectedRole.value = records[0]
      nextTick(() => tableRef.value?.setCurrentRow(records[0]))
    }
  } catch {
    roles.value = []
    selectedRole.value = null
  } finally {
    loading.value = false
  }
}

const fetchRoleDetail = async (id: number) => {
  try {
    loading.value = true
    const res = await getRoleDetail(id) as any
    selectedRole.value = res || null
  } catch {
    selectedRole.value = null
  } finally {
    loading.value = false
  }
}

// ========== Methods ==========
const handleCurrentChange = async (row: Role | null) => {
  if (row && row.id) {
    fetchRoleDetail(row.id) as any
    console.log(selectedRole.value, '333')
  } else {
    selectedRole.value = null
  }
}

// 新建角色
const handleCreate = () => {
  editingRole.value = null
  roleForm.value = {
    roleName: '',
    roleCode: '',
    roleDesc: '',
    accountType: '6.1',
    dataScopeType: '',
    resourceIds: []
  }
  roleDialogVisible.value = true
}

// 编辑角色
const handleEdit = async (id: number) => {
  const res = await getRoleDetail(id) as any
  roleForm.value = {
    roleName: res?.roleName ?? '',
    roleCode: res?.roleCode ?? '',
    roleDesc: res?.roleDesc,
    remark: res?.remark,
    accountType: res?.accountType ?? undefined,
    dataScopeType: res?.dataScopeType ?? '',
    resourceIds: res?.resourceIds ?? [],
  }
  editingRole.value = res
  roleDialogVisible.value = true
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色「${row.roleName}」吗？删除后不可恢复。`,
      '删除确认',
      { type: 'error', confirmButtonText: '删除', cancelButtonText: '取消', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
    )
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
    if (selectedRole.value?.id === row.id) {
      selectedRole.value = null
    }
  } catch {
    // 用户取消
  }
}

// 切换角色状态
const handleToggleStatus = async (row: Role) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}角色「${row.roleName}」吗？`,
      `${actionText}确认`,
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消', customClass: 'auth-confirm-dialog' }
    )
    // 真实接口
    await changeRoleStatus(row.id, newStatus)
    ElMessage.success('操作成功')
    fetchRoleList()
  } catch {
    // 用户取消
  }
}

// 重置筛选
const handleReset = () => {
  searchText.value = ''
  filterAccountType.value = ''
  filterStatus.value = ''
  activeTab.value = 'all'
}

// 保存角色（新建/编辑）
const handleSaveRole = async () => {
  if (!roleFormRef.value) return
  await roleFormRef.value.validate(async (valid) => {
    if (!valid) return
    roleDialogLoading.value = true
    try {
      if (editingRole.value) {
        await updateRole(editingRole.value.id, roleForm.value)
        ElMessage.success('修改成功')
      } else {
        await createRole(roleForm.value)
        ElMessage.success('创建成功')
      }
      roleDialogVisible.value = false
      fetchRoleList()
    } catch {
      // ElMessage.error('操作失败')
    } finally {
      roleDialogLoading.value = false
    }
  })
}

// 配置权限
const handleConfigPermissions = async (row: Role) => {
  if (!row?.id) return
  permSearchKeyword.value = ''
  permTreeAllExpanded.value = false
  selectedPermMenuTags.value = []
  selectedPermSubMenuTags.value = []
  selectedPermBtnTags.value = []
  try {
    // 先请求角色详情，获取最新的 resourceIds
    const detailRes: any = await getRoleDetail(row.id)
    currentRoleResourceIds.value = detailRes?.resourceIds || []
    // 获取全部资源树
    const treeRes: any = await getAllResourceTree()
    allResourceTree.value = treeRes || []
    permissionDialogVisible.value = true
    // 等弹框 DOM 渲染完成后回显选中状态
    // menuMap 和 tree 遍历都用 filteredPermTree，因为 el-tree 实际渲染的是 filteredPermTree
    const menuMap = flattenResourceTreeToMap(filteredPermTree.value)
    const backendIds = new Set<number>(detailRes?.resourceIds || [])
    const keysToSet: number[] = []

    // 遍历 filteredPermTree 中的每个节点来决定是否勾选
    const walkForKeys = (nodes: ResourceNode[]) => {
      for (const node of nodes) {
        if (!backendIds.has(node.id)) {
          // 此节点不在 backendIds 中，不勾选；递归检查子节点
          if (node.children?.length) walkForKeys(node.children)
          continue
        }
        // 此节点在 backendIds 中
        if (node.resourceType !== 1) {
          // 叶子节点：直接勾选
          keysToSet.push(node.id)
        } else {
          // 父菜单：如果有任意子节点在 backendIds 中则勾选（check-strictly 下独立显示）
          const childIds = (node.children || []).map(c => c.id)
          const anyChildInBackend = childIds.some(cid => backendIds.has(cid))
          if (anyChildInBackend) {
            keysToSet.push(node.id)
          }
          // 若无子节点在 backendIds 中，则该父菜单本身不在 backendIds（走到这里时 backendIds.has(node.id) 为 true，
          // 说明后端直接返回了这个父菜单 ID，也应该勾选）
          else {
            keysToSet.push(node.id)
          }
        }
        if (node.children?.length) walkForKeys(node.children)
      }
    }
    walkForKeys(filteredPermTree.value)

    nextTick(() => {
      if (permissionTreeRef.value) {
        permissionTreeRef.value.setCheckedKeys(keysToSet)
        onPermCheckChange()
      }
    })
  } catch {

  }
}

// 在资源树中查找指定节点的一级父节点（type===1 的父菜单）
const findParentNode = (
  nodes: ResourceNode[],
  targetId: number,
  parent: ResourceNode | null = null
): ResourceNode | null => {
  for (const node of nodes) {
    if (node.id === targetId) return parent
    if (node.children?.length) {
      const found = findParentNode(node.children, targetId, node)
      if (found !== null) return found
    }
  }
  return null
}

// 保存权限配置
const handleSavePermissions = async () => {
  if (!selectedRole.value) return

  // 直接勾选的节点 ID（不含半选父节点）
  const checkedIds = permissionTreeRef.value?.getCheckedKeys(false) as number[]
  // 半选父节点 ID（子节点被勾选但父节点本身未被勾选）
  const halfCheckedIds = permissionTreeRef.value?.getHalfCheckedKeys() as number[]

  // 补充父级菜单 ID
  // 规则：如果勾选了子菜单/按钮，需要补上其对应的一级父菜单（type===1）
  //      半选节点说明其子节点被勾选了，需要把该半选父菜单也提交
  // menuMap 和 findParentNode 都用 filteredPermTree，与 el-tree 渲染数据保持一致
  const menuMap = flattenResourceTreeToMap(filteredPermTree.value)
  const menuIdsToAdd: number[] = []
  const allIds = new Set<number>(checkedIds)

  // 遍历半选节点：子节点被勾选了，把该父菜单也提交
  for (const id of halfCheckedIds) {
    const node = menuMap.get(id)
    if (node && !allIds.has(id)) {
      menuIdsToAdd.push(id)
      allIds.add(id)
    }
  }

  // 遍历直接勾选的子菜单/按钮，补上其一级父菜单
  for (const id of checkedIds) {
    const node = menuMap.get(id)
    if (node && node.resourceType !== 1) {
      const parent = findParentNode(filteredPermTree.value, id)
      if (parent && parent.resourceType === 1 && !allIds.has(parent.id)) {
        menuIdsToAdd.push(parent.id)
      }
    }
  }

  // 最终提交的 ID = 直接勾选 + 需要补上的父级菜单
  const finalIds = [...checkedIds, ...menuIdsToAdd]

  try {
    await assignRoleResources(selectedRole.value.id, finalIds)
    ElMessage.success('权限保存成功')
    permissionDialogVisible.value = false
    fetchRoleList()
  } catch {
    ElMessage.error('权限保存失败')
  }
}


const getRowClassName = ({ row }: { row: Role }) => {
  return selectedRole.value?.id === row.id ? 'selected-row' : ''
}

const handleCommand = (command: RoleCommand, row: Role) => {
  switch (command) {
    case 'edit':
      handleEdit(row.id)
      break
    case 'toggle':
      handleToggleStatus(row)
      break
    case 'permissions':
      handleConfigPermissions(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}


onMounted(() => {
  fetchAccountTypeOptions()
  fetchDataScopeTypeOptions()
  fetchRoleList()
})
</script>

<style lang="scss">
// ── Dialog Styles ──
.perm-dialog-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.perm-role-tag {
  font-size: 12px;
  font-weight: 600;
  background: #2f5bff;
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.permission-body {
  display: flex;
  height: 480px;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--el-border-color);
  background: #fafbff;
  margin: 10px 15px;
}

.perm-tree-panel {
  width: 340px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.perm-tree-toolbar {
  padding: 12px 14px;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.6);

  :deep(.el-input__wrapper) {
    background: #fff;
    border-radius: 8px;
  }
}

:deep(.el-tree) {
  background: transparent;
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  font-size: 13px;

  .el-tree-node__content {
    height: 32px;
    border-radius: 8px;
    margin-bottom: 2px;
    transition: background 0.12s;

    &:hover {
      background: rgba(47, 91, 255, 0.05);
    }
  }

  .el-tree-node.is-checked>.el-tree-node__content {
    background: rgba(47, 91, 255, 0.1);
  }

  .el-tree-node__expand-icon {
    font-size: 12px;
    color: #b0bfd6;
  }

  .el-tree-node__expand-icon.is-leaf {
    color: transparent;
  }
}

.perm-node-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.perm-node-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.perm-tags-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fbfcff;
}

.perm-tags-section {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d9e6;
    border-radius: 999px;
  }
}

.perm-section-label {
  font-size: 11px;
  font-weight: 600;
  color: #b0bfd6;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.perm-tags-row {
  display: flex;
  flex-wrap: wrap;
}

// ── 详情区权限扁平布局 ──
.detail-perm-flat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.perm-l1-item {
  display: flex;
  gap: 5px;
}


.perm-l1-children {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.perm-l2-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.perm-btn-tag {
  background: rgba(245, 158, 11, 0.08) !important;
  color: #b45309 !important;
  border: none !important;
  font-size: 12px !important;
  border-radius: 4px !important;
}

.perm-btn-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.perm-empty {
  padding: 20px;
  text-align: center;
  color: #b0bfd6;
  font-size: 13px;
  border: 1.5px dashed var(--el-border-color);
  border-radius: 10px;
}

.perm-dialog-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.perm-footer-stat {
  font-size: 13px;
  color: var(--el-text-color-secondary);

  strong {
    color: #2f5bff;
    font-weight: 700;
  }
}
</style>
