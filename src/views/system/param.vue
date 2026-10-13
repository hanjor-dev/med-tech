<template>
	<list-template ref="listTemplateRef" page-class="param" hero-eyebrow="系统管理" hero-title="系统参数配置"
		hero-desc="集中管理运行时可动态调整的配置参数，支持分组、类型筛选与敏感值保护。修改立即生效，无需重启服务。" filter-searchable filter-search-placeholder="搜索配置键或名称…"
		:show-filter-create="false" :filter-selects="filterSelects"  @filter-search="handleSearch"
		@filter-change="handleFilterChange">
		<div class="page-body-panel">
			<el-card class="list-card" shadow="never">
				<template #header>
					<div class="card-header">
						<span class="card-title">配置分组</span>
					</div>
				</template>
				<div class="type-list" style="padding:0;">
					<div v-for="group in configGroupOptions" :key="group.value" class="type-item"
						:class="{ 'is-active': activeGroup === group.value }" @click="handleSelectGroup(group.value)">
						<div class="type-item__icon">
							<el-icon>
								<component :is="getGroupIcon(group.value)" />
							</el-icon>
						</div>
						<div class="type-item__info">
							<div class="type-item__name">{{ group.label }}</div>
						</div>
					</div>
				</div>
			</el-card>
		</div>
		<div class="page-body-panel panel-flex-5 ml-10">
			<el-card class="list-card" shadow="never">
				<template #header>
					<div class="card-header">
						<span class="card-title">配置列表</span>
					</div>
				</template>
				<!-- 有选中类型：显示数据表格 -->
				<div v-if="activeGroup" class="roles-list-wrap">
					<el-table :data="tableData" :header-cell-style="{ background: '#f9fafb' }" v-loading="loading">
						<el-table-column label="配置项" min-width="17%">
							<template #default="{ row }">
								<div>
									<div class="role-name">
										{{ row.configName }}
										<span v-if="row.isSystem === 1" class="system-badge">
											<el-icon>
												<Lock />
											</el-icon>
											内置
										</span>
									</div>
									<div class="role-description">{{ row.configDesc || '—' }}</div>
								</div>
							</template>
						</el-table-column>

						<el-table-column label="配置键" min-width="20%">
							<template #default="{ row }">
								<code class="role-code-tag">{{ row.configKey }}</code>
							</template>
						</el-table-column>

						<el-table-column label="配置值" min-width="15%">
							<template #default="{ row }">
								<!-- JSON 类型 -->
								<div v-if="row.configType === 'json'" class="config-value-preview" style="position:relative;">
									<span class="json-trigger" :ref="el => { if (el) row._jsonTriggerEl = el }" @click.stop="toggleJsonView(row, $event)">
										<span class="json-icon">
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none">
												<path d="M2 3.5C2 2.67 2.67 2 3.5 2h2C6.33 2 7 2.67 7 3.5v1C7 5.33 6.33 6 5.5 6h-2C2.67 6 2 5.33 2 4.5v-1z" fill="currentColor" opacity=".6"/>
												<path d="M9 9.5C9 8.67 9.67 8 10.5 8h2c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5h-2c-.83 0-1.5-.67-1.5-1.5v-1z" fill="currentColor" opacity=".6"/>
												<path d="M4 7h8M4 9h8M4 11h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
											</svg>
										</span>
										{{ row._jsonExpanded ? '收起' : '查看 JSON' }}
									</span>
									<teleport to="body">
										<transition name="json-panel-enter">
											<div v-if="row._jsonExpanded" class="json-panel"
												:style="getJsonPanelStyle(row)">
												<div class="json-panel__header">
													<span class="json-panel__label">JSON</span>
													<div class="json-panel__actions">
														<button class="json-action-btn" @click.stop="copyJson(row)" title="复制">
															<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
																<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
																<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
															</svg>
														</button>
														<button class="json-action-btn json-action-btn--close" @click.stop="toggleJsonView(row)" title="关闭">
															<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
																<line x1="18" y1="6" x2="6" y2="18"></line>
																<line x1="6" y1="6" x2="18" y2="18"></line>
															</svg>
														</button>
													</div>
												</div>
												<div class="json-panel__body" v-html="formatJsonHighlighted(row.configValue)"></div>
											</div>
										</transition>
									</teleport>
								</div>
								<!-- 其他类型 -->
								<div v-else class="config-value-preview">
									<span :class="{ 'is-masked': !row._valueVisible }">
										{{ row._valueVisible ? row.configValue : maskValue(row.configValue) }}
									</span>
									<span v-if="isSensitive(row)" class="value-toggle" @click.stop="toggleValueVisible(row)">
										{{ row._valueVisible ? '隐藏' : '显示' }}
									</span>
								</div>
							</template>
						</el-table-column>

						<el-table-column label="类型" width="110" align="center">
							<template #default="{ row }">
								<span class="type-badge" :class="`type-badge--${row.configType}`">
									{{ configTypeNameMap[row.configType] }}
								</span>
							</template>
						</el-table-column>

						<el-table-column label="属性" width="110" align="center">
							<template #default="{ row }">
								<span class="public-badge">
									<el-icon>
										<component :is="row.isPublic === 1 ? Hide : View" />
									</el-icon>
									{{ row.isPublic === 0 ? '私密' : '公开' }}
								</span>
							</template>
						</el-table-column>

						<el-table-column label="状态" width="100" align="center">
							<template #default="{ row }">
								<span class="status-badge"
									:class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
									{{ row.status === 1 ? '正常' : '禁用' }}
								</span>
							</template>
						</el-table-column>

						<el-table-column label="操作" width="100" fixed="right">
							<template #default="{ row }">
								<div class="table-actions">
									<el-tooltip content="编辑" placement="top" :show-after="400">
										<el-button text class="action-btn" @click="handleEdit(row)"><span class="iconfont icon-bianji"></span></el-button>
									</el-tooltip>
									<el-tooltip content="删除" placement="top" :show-after="400">
										<el-button text class="action-btn action-btn--danger"
											:class="{ 'is-disabled': row.isSystem === 1 }" :disabled="row.isSystem === 1"
											@click="handleDelete(row)"><span class="iconfont icon-shanchu"></span></el-button>
									</el-tooltip>
								</div>
							</template>
						</el-table-column>

						<template #empty>
							<el-empty description="暂无配置数据" :image-size="80" />
						</template>
					</el-table>
					<page-box :currentPage="pagination.current" :pageSize="pagination.size" :totalCount="pagination.total"
          @current-change="handlePageChange" @size-change="handleSizeChange" />
				</div>

				<!-- 未选中类型：空状态 -->
				<div v-else class="dict-data-empty">
					<el-empty description="请从左侧选择一个字典类型" :image-size="80" />
				</div>
			</el-card>
		</div>
	</list-template>

	<!-- Config Dialog: Create / Edit -->
	<dialog-modal v-model="dialogVisible" :title="editingConfig ? '编辑配置' : '新建配置'"
		:subtitle="editingConfig ? '修改配置值将立即生效' : '新增自定义配置参数'" width="650px" @modal-close="dialogVisible = false"
		@modal-confirm="handleSave">
		<div class="dialog-shell">
			<el-form ref="formRef" :model="form" :rules="rules" label-position="top">
				<el-row :gutter="16">
					<el-col :span="12">
						<el-form-item label="配置键" prop="configKey">
							<el-input v-model="form.configKey" placeholder="如：session.timeout" clearable />
							<div class="form-hint">{{ editingConfig ? '系统内置标识，无法修改' : '全局唯一标识，支持英文"."分层级' }}</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="配置分组" prop="configGroup">
							<el-select v-model="form.configGroup" placeholder="请选择" style="width: 100%">
								<el-option v-for="opt in configGroupOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="配置类型" prop="configType">
							<el-select v-model="form.configType" placeholder="请选择" style="width: 100%">
								<el-option label="字符串" value="string" />
								<el-option label="数值" value="number" />
								<el-option label="布尔" value="boolean" />
								<el-option label="JSON" value="json" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="配置名称" prop="configName">
							<el-input v-model="form.configName" placeholder="如：会话超时时间" clearable />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="配置值" prop="configValue">
							<el-input v-if="form.configType !== 'boolean'" v-model="form.configValue" :placeholder="valuePlaceholder"
								clearable />
							<div v-if="form.configType === 'boolean'">
								<el-switch v-model="form.configValue" active-value="true" inactive-value="false" />
							</div>
							<div v-if="valueHint" class="form-hint">({{ valueHint }})</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item>
							<template #label>
								<span>是否公开
									<span class="form-hint">(公开配置无需登录即可查询)</span>	
								</span>
							</template>
							<el-switch v-model="form.isPublic" :active-value="1" :inactive-value="0" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item>
							<template #label>
								<span>系统内置
									<span class="form-hint">(系统内置配置不可删除)</span>	
								</span>
							</template>
							<el-switch v-model="form.isSystem" :active-value="1" :inactive-value="0"/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="配置说明">
							<el-input v-model="form.configDesc" type="textarea" :rows="3" placeholder="请输入配置说明或备注信息（可选）…"
								maxlength="256" show-word-limit />
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</div>
	</dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
	Plus, Lock, View, Hide, Refresh, Download,
	Setting, FolderOpened, Grid, Key,
} from '@element-plus/icons-vue'
import listTemplate, { type FilterSelect } from '@/components/listTemplate.vue'
import dialogModal from '@/components/dialogModal.vue'
import {
	getConfigList, createConfig, updateConfig, deleteConfig, getSelectOptions,
	type ConfigVO,
} from '@/api/param'
import PageBox from '@/components/pageBox.vue'

// ── Types ─────────────────────────────────────────────────────────────────────
type ConfigType = 'string' | 'number' | 'boolean' | 'json'
type ConfigGroup = 'system' | 'security' | 'upload' | 'other'

interface ConfigRow extends ConfigVO {
	_valueVisible?: boolean
	_jsonExpanded?: boolean
	_jsonTriggerEl?: HTMLElement | null
}

interface Pagination {
	total: number
	size: number
	current: number
	pages: number
}

interface GroupDef {
	label: string
	value: ConfigGroup
	icon: any
}

// ── Refs ─────────────────────────────────────────────────────────────────────
const listTemplateRef = ref<InstanceType<typeof listTemplate>>()
const tableData = ref<ConfigRow[]>([])
const allData = ref<ConfigRow[]>([])
const loading = ref(false)

// Group sidebar
const activeGroup = ref<string>('system')

// Local filter state (mirrors listTemplate's filterSelects)
const filterSearchText = ref('')
const filterConfigType = ref('')
const filterStatus = ref<number | ''>('')

// Pagination
const pagination = reactive<Pagination>({ total: 0, size: 10, current: 1, pages: 1 })

// Dialog
const dialogVisible = ref(false)
const editingConfig = ref<ConfigRow | null>(null)
const formRef = ref<FormInstance>()
const configGroupOptions = ref<{ label: string; value: string }[]>([])

const loadConfigGroupOptions = async () => {
  const res: any = await getSelectOptions('config_group', 0)
  const list = res?.data ?? res ?? []
  configGroupOptions.value = list.map((item: any) => ({
    label: item.name || item.label,
    value: String(item.code ?? item.value),
  }))
}

const form = ref({
	configKey: '',
	configName: '',
	configValue: '',
	configType: 'string' as ConfigType,
	configGroup: 'system' as ConfigGroup,
	configDesc: '',
	isSystem: 0 as 0 | 1,
	isPublic: 1 as 0 | 1,
	sort: 0,
	status: 1 as 0 | 1,
})

const rules: FormRules = {
	configKey: [
		{ required: true, message: '请输入配置键', trigger: 'blur' },
		{ pattern: /^[a-zA-Z][a-zA-Z0-9._-]{0,63}$/, message: '配置键格式不正确（英文开头，最多64字符）', trigger: 'blur' },
	],
	configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
	configGroup: [{ required: true, message: '请选择配置分组', trigger: 'change' }],
	configType: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
}

// ── Constants ────────────────────────────────────────────────────────────────
const configTypeNameMap: Record<string, string> = {
	string: '字符串', number: '数值', boolean: '布尔', json: 'JSON',
}

// filterSelects: used by listTemplate for rendering default filter bar
// (we hide default filter bar via slot, but pass it so the search input is wired up)
const filterSelects: FilterSelect[] = [
	{
		modelKey: 'configType', placeholder: '全部类型', options: [
			{ label: '字符串', value: 'string' },
			{ label: '数值', value: 'number' },
			{ label: '布尔', value: 'boolean' },
			{ label: 'JSON', value: 'json' },
		]
	},
	{
		modelKey: 'status', placeholder: '全部状态', options: [
			{ label: '正常', value: 1 },
			{ label: '禁用', value: 0 },
		]
	},
]

// ── Computed ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, any> = {
  system: Setting,
  security: Key,
  upload: Grid,
  other: FolderOpened,
}

const getGroupIcon = (value: string) => iconMap[value] || Setting

const valuePlaceholder = computed(() => ({
	string: '请输入配置值…',
	number: '请输入数字，如：7200',
	json: '{ "key": "value" }',
} as Record<string, string>)[form.value.configType] ?? '请输入配置值…')

const valueHint = computed(() => ({
	number: '数值类型，请输入整数或小数',
	boolean: '布尔类型，通过开关选择 true / false',
	json: 'JSON 类型，请确保输入合法的 JSON 字符串',
} as Record<string, string>)[form.value.configType] ?? '')

// ── Methods ──────────────────────────────────────────────────────────────────

const handleSelectGroup = (group: string) => {
	activeGroup.value = group
	pagination.current = 1
	doFetch()
}

const handleSearch = (kw: string) => {
	filterSearchText.value = kw
	pagination.current = 1
	doFetch()
}

const handleFilterChange = (_key: string, _val: any) => {
	if (_key === 'configType') filterConfigType.value = _val
	if (_key === 'status') filterStatus.value = _val
	pagination.current = 1
	doFetch()
}

const handleReset = () => {
	filterSearchText.value = ''
	filterConfigType.value = ''
	filterStatus.value = ''
	activeGroup.value = 'system'
	pagination.current = 1
	listTemplateRef.value?.handleFilterReset()
	doFetch()
}

const handlePageChange = (page: number) => {
	pagination.current = page
	doFetch()
}

const handleSizeChange = (size: number) => {
	pagination.size = size
	pagination.current = 1
	doFetch()
}

const maskValue = (value: string): string =>
	!value ? '—' : '••••••••'

const isSensitive = (row: ConfigRow): boolean =>
	!!row.configValue && row.configValue.length > 0

const toggleValueVisible = (row: ConfigRow) => {
	row._valueVisible = !row._valueVisible
}

const toggleJsonView = (row: ConfigRow, event?: Event) => {
	row._jsonExpanded = !row._jsonExpanded
}

const getJsonPanelStyle = (row: ConfigRow): Record<string, string> => {
	const el = row._jsonTriggerEl as HTMLElement | undefined
	if (!el) return { display: 'none' }

	const rect = el.getBoundingClientRect()
	const PANEL_W = 440
	const PANEL_H = 320
	const GAP = 8

	// 优先：面板在触发器右侧（垂直居中）
	let left = rect.right + GAP
	let top = rect.top + rect.height / 2 - PANEL_H / 2

	// 超出右边界 → 翻到左侧
	if (left + PANEL_W > window.innerWidth - 12) {
		left = rect.left - PANEL_W - GAP
	}

	// 上下越界修正
	if (top < 12) top = 12
	if (top + PANEL_H > window.innerHeight - 12) top = window.innerHeight - PANEL_H - 12

	return {
		position: 'fixed',
		left: `${left}px`,
		top: `${top}px`,
		width: `${PANEL_W}px`,
		zIndex: '9999',
	}
}

const formatJsonHighlighted = (value: string): string => {
	try {
		const obj = JSON.parse(value)
		const formatted = JSON.stringify(obj, null, 2)
		return syntaxHighlight(formatted)
	} catch {
		return `<span class="json-err">${escapeHtml(value)}</span>`
	}
}

const escapeHtml = (str: string) =>
	str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const syntaxHighlight = (json: string): string => {
	return json
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(
			/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
			(match) => {
				let cls = 'json-num'
				if (/^"/.test(match)) {
					cls = /:$/.test(match) ? 'json-key' : 'json-str'
				} else if (/true|false/.test(match)) {
					cls = 'json-bool'
				} else if (/null/.test(match)) {
					cls = 'json-null'
				}
				return `<span class="${cls}">${match}</span>`
			}
		)
		.replace(/[{}\[\]]/g, (m) => `<span class="json-punc">${m}</span>`)
		.replace(/(\n)/g, '<br>')
		.replace(/( {2,})/g, (m) => `<span class="json-indent">${m}</span>`)
}

const copyJson = async (row: ConfigRow) => {
  let text: string
  try {
    const obj = JSON.parse(row.configValue)
    text = JSON.stringify(obj, null, 2)
  } catch {
    text = row.configValue
  }
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  ElMessage.success('已复制到剪贴板')
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
const buildParams = () => ({
	pageNum: pagination.current,
	pageSize: pagination.size,
	configKey: filterSearchText.value || undefined,
	configName: filterSearchText.value || undefined,
	configGroup: (activeGroup.value as ConfigGroup) || undefined,
	configType: (filterConfigType.value as ConfigType) || undefined,
	status: (filterStatus.value !== '' ? filterStatus.value : undefined) as 0 | 1 | undefined,
})

const doFetch = async () => {
	loading.value = true
	try {
		const res = await getConfigList(buildParams())
		if (res?.records) {
			allData.value = (res.records as ConfigVO[]).map((d: ConfigVO) => ({
				...d,
				_valueVisible: false,
				_jsonExpanded: false,
			}))
			console.log(allData.value, 'allData.value')
			tableData.value = allData.value
			pagination.total = res.total
			pagination.pages = res.pages
		}
	} finally {
		loading.value = false
	}
}

// ── Dialog ────────────────────────────────────────────────────────────────────
const handleCreate = () => {
	editingConfig.value = null
	form.value = {
		configKey: '', configName: '', configValue: '',
		configType: 'string',
		configGroup: (activeGroup.value as ConfigGroup) || 'system',
		configDesc: '', isSystem: 0, isPublic: 1, sort: 0, status: 1,
	}
	dialogVisible.value = true
}

const handleEdit = (row: ConfigRow) => {
	editingConfig.value = row
	form.value = {
		configKey: row.configKey, configName: row.configName,
		configValue: row.configValue,
		configType: row.configType as ConfigType,
		configGroup: row.configGroup as ConfigGroup,
		configDesc: row.configDesc || '',
		isSystem: row.isSystem, isPublic: row.isPublic,
		sort: row.sort, status: row.status,
	}
	dialogVisible.value = true
}

const handleSave = async () => {
	if (!formRef.value) return
	await formRef.value.validate(async (valid) => {
		if (!valid) return
		try {
			if (editingConfig.value) {
				const payload = {
					configName: form.value.configName,
					configValue: form.value.configValue,
					configType: form.value.configType,
					configGroup: form.value.configGroup,
					configDesc: form.value.configDesc,
					isPublic: form.value.isPublic,
					sort: form.value.sort,
					status: form.value.status,
				}
				await updateConfig(editingConfig.value.id, payload)
				ElMessage.success('修改成功')
				dialogVisible.value = false
				doFetch()
			} else {
				const payload = {
					configKey: form.value.configKey,
					configName: form.value.configName,
					configValue: form.value.configValue || undefined,
					configType: form.value.configType,
					configGroup: form.value.configGroup,
					configDesc: form.value.configDesc || undefined,
					isPublic: form.value.isPublic,
					sort: form.value.sort,
					status: form.value.status,
				}
				await createConfig(payload)
				ElMessage.success('创建成功')
				dialogVisible.value = false
				doFetch()
			}
		} catch {
			// handled by interceptor
		}
	})
}

const handleDelete = async (row: ConfigRow) => {
	if (row.isSystem === 1) return
	try {
		await ElMessageBox.confirm(
			`确定要删除配置「${row.configName}」吗？删除后不可恢复。`,
			'删除确认',
			{ type: 'error', confirmButtonText: '删除', cancelButtonText: '取消', customClass: 'auth-confirm-dialog auth-confirm-dialog--danger' }
		)
		await deleteConfig(row.id)
		ElMessage.success('删除成功')
		doFetch()
	} catch {
		// user cancelled
	}
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([doFetch(), loadConfigGroupOptions()])
})
</script>

<style lang="scss" scoped>

.config-value-preview {
	display: flex;
	align-items: center;
	gap: 5px;

	.is-masked {
		filter: blur(3px);
		user-select: none;
		letter-spacing: 2px;
	}
}

.value-toggle {
	font-family: inherit;
	font-style: italic;
	font-size: 11px;
	color: #2f5bff;
	cursor: pointer;
	transition: color 0.15s;
	white-space: nowrap;

	&:hover {
		color: #1d35d6;
	}
}

.json-trigger {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	font-size: 12px;
	color: #8b5cf6;
	cursor: pointer;
	transition: color 0.15s;
	padding: 2px 6px;
	border-radius: 4px;

	&:hover {
		color: #7c3aed;
		background: rgba(139, 92, 246, 0.08);
	}
}

.json-icon {
	display: flex;
	align-items: center;
	color: #8b5cf6;
}

.json-panel {
	position: fixed;
	max-height: 360px;
	background: #0d0d12;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow:
		0 0 0 1px rgba(139, 92, 246, 0.15),
		0 8px 24px rgba(0, 0, 0, 0.5),
		0 24px 48px rgba(0, 0, 0, 0.3);
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.json-panel__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	background: rgba(139, 92, 246, 0.06);
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	flex-shrink: 0;
}

.json-panel__label {
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: #8b5cf6;
	font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
}

.json-panel__actions {
	display: flex;
	align-items: center;
	gap: 4px;
}

.json-action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border: none;
	border-radius: 5px;
	background: transparent;
	color: #6b7280;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #d1d5db;
	}

	&--close:hover {
		background: rgba(239, 68, 68, 0.15);
		color: #f87171;
	}
}

.json-panel__body {
	padding: 12px 14px;
	overflow-y: auto;
	max-height: 300px;
	font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
	font-size: 11.5px;
	line-height: 1.75;
	color: #9ca3af;
	scrollbar-width: thin;
	scrollbar-color: rgba(139, 92, 246, 0.3) transparent;

	&::-webkit-scrollbar { width: 4px; }
	&::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }
}

:deep(.json-key)    { color: #c084fc; font-weight: 600; }
:deep(.json-str)    { color: #6ee7b7; }
:deep(.json-num)    { color: #fbbf24; }
:deep(.json-bool)   { color: #38bdf8; font-weight: 600; }
:deep(.json-null)   { color: #f87171; font-style: italic; }
:deep(.json-punc)   { color: #6b7280; }
:deep(.json-indent) { display: inline-block; }
:deep(.json-err)    { color: #f87171; }

/* 入场动画 */
.json-panel-enter-enter-active {
	animation: json-pop-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.json-panel-enter-leave-active {
	animation: json-pop-out 0.15s cubic-bezier(0.4, 0, 1, 1) both;
}
@keyframes json-pop-in {
	from { opacity: 0; transform: scale(0.88); }
	to   { opacity: 1; transform: scale(1); }
}
@keyframes json-pop-out {
	from { opacity: 1; transform: scale(1); }
	to   { opacity: 0; transform: scale(0.88); }
}
</style>
