<template>
	<list-template ref="listTemplateRef" page-class="log" hero-eyebrow="系统管理" hero-title="操作日志"
		hero-desc="完整记录系统所有接口调用，含模块、操作类型、操作用户、IP 定位、响应状态与执行耗时。" :filter-inputs="filterInputs"
		:filter-selects="filterSelects" :filter-date-ranges="filterDateRanges" :show-filter-create="false"
		@filter-input-change="handleInputChange" @filter-change="handleFilterChange" @filter-reset="handleReset">

		<!-- 主内容区：通栏日志表格 -->
		<div class="page-body-panel">
			<el-card class="list-card" shadow="never" v-loading="loading">
				<template #header>
					<div class="card-header">
						<span class="card-title">日志列表</span>
						<div class="header-actions">
							<el-button link type="primary" size="small"  @click="handleExport">
								<el-icon>
									<Download />
								</el-icon>
								导出 Excel
							</el-button>
						</div>
					</div>
				</template>

				<!-- 日志表格 -->
				<div v-if="tableData.length > 0" class="roles-list-wrap">
					<el-table :data="tableData" :header-cell-style="{ background: '#f9fafb' }" @row-click="toggleExpand"
						row-key="id" :expand-row-keys="expandedRows">
						<!-- 展开详情 -->
						<el-table-column type="expand" width="50">
							<template #default="{ row }">
								<div class="expand-detail-panel">
									<div class="expand-detail-grid">
										<div class="expand-detail-item expand-detail-item--full">
											<div class="expand-detail-label">请求参数</div>
											<div class="expand-detail-val expand-detail-val--code">
												{{ row.requestParams || '—' }}
											</div>
										</div>
										<template v-if="row.status !== 1">
											<div class="expand-detail-item expand-detail-item--full">
												<div class="expand-detail-label">错误信息</div>
												<div class="expand-detail-val expand-detail-val--error">
													{{ row.errorMessage || '—' }}
												</div>
											</div>
										</template>
									</div>
								</div>
							</template>
						</el-table-column>

						<!-- 模块 / 操作 -->
						<el-table-column label="模块 / 操作" min-width="7%">
							<template #default="{ row }">
								<div>
									<div class="role-name">
										{{ row.module }}
									</div>
									<div class="log-biz-row">
										<span class="biz-type-badge" :class="`biz-type-badge--${row.businessType}`">
											{{ row.businessTypeName }}
										</span>
										<span class="role-description">{{ row.description }}</span>
									</div>
								</div>
							</template>
						</el-table-column>

						<!-- 操作用户 -->
						<el-table-column label="操作用户" min-width="5%">
							<template #default="{ row }">
								<div>
									<div class="role-name">{{ row.username }}</div>
									<div class="role-description">{{ row.realName }}</div>
								</div>
							</template>
						</el-table-column>

						<!-- IP / 位置 -->
						<el-table-column label="IP / 位置" min-width="4%">
							<template #default="{ row }">
								<div>
									<code class="role-name">{{ row.ip }}</code>
									<div class="role-description">{{ row.location }}</div>
								</div>
							</template>
						</el-table-column>

						<!-- 状态 -->
						<el-table-column label="状态" min-width="8%" align="center">
							<template #default="{ row }">
								<div class="status-cell">
									<span class="status-badge"
										:class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
										{{ row.statusName }}
									</span>
								</div>
							</template>
						</el-table-column>

						<!-- 耗时 -->
						<el-table-column label="耗时" min-width="6%">
							<template #default="{ row }">
								<span>
									{{ row.duration }}<span class="duration-unit">ms</span>
								</span>
							</template>
						</el-table-column>

						<!-- 操作时间 -->
						<el-table-column label="操作时间" min-width="7%">
							<template #default="{ row }">
								<span>{{ dayjs(row.operationTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
							</template>
						</el-table-column>

						<template #empty>
							<el-empty description="暂无日志数据" :image-size="80" />
						</template>
					</el-table>
					<!-- Pagination -->
					<page-box :current-page="pagination.current" :page-size="pagination.size" :total-count="pagination.total"
						@current-change="pagination.current = $event" @size-change="pagination.size = $event" />
				</div>

				<!-- 无数据空状态 -->
				<div v-else class="data-empty">
					<el-empty description="暂无日志数据，请尝试调整筛选条件" :image-size="80" />
				</div>
			</el-card>
		</div>
	</list-template>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, View } from '@element-plus/icons-vue'
import listTemplate from '@/components/listTemplate.vue'
import { getOperationLogPage, exportOperationLog, type OperationLogVO } from '@/api/log'
import pageBox from '@/components/pageBox.vue'
import dayjs from 'dayjs'

// ========== Refs ==========
interface Pagination {
	total: number
	size: number
	current: number
	pages: number
}

const listTemplateRef = ref<InstanceType<typeof listTemplate>>()
const tableData = ref<OperationLogVO[]>([])
const loading = ref(false)
const expandedRows = ref<number[]>([])

// 分页
const pagination = reactive<Pagination>({ total: 0, size: 10, current: 1, pages: 0 })

// 筛选配置
const filterInputs = [
	{ modelKey: 'module', placeholder: '搜索模块名称' },
]

const filterSelects = [
	{
		modelKey: 'businessType', placeholder: '全部类型', options: [
			{ label: '新增', value: 1 },
			{ label: '修改', value: 2 },
			{ label: '删除', value: 3 },
			{ label: '查询', value: 4 },
			{ label: '导出', value: 5 },
			{ label: '其他', value: 6 },
		]
	},
	{
		modelKey: 'status', placeholder: '全部状态', options: [
			{ label: '成功', value: 1 },
			{ label: '失败', value: 0 },
		]
	},
]

const filterDateRanges = [
	{ modelKey: 'timeRange', startPlaceholder: '开始', endPlaceholder: '结束', width: '220px' },
]

// 本地筛选值（与 listTemplate 内部状态同步，供 doFetch 读取）
const filterModule = ref('')
const filterBusinessType = ref<number | ''>('')
const filterStatus = ref<0 | 1 | ''>('')
const filterTimeRange = ref<string[] | null>(null)

const stats = ref<any[]>([])

// ========== Methods ==========
const handleInputChange = ({ modelKey, value }: { modelKey: string; value: string }) => {
	if (modelKey === 'module') filterModule.value = value
	pagination.current = 1
	doFetch()
}

const handleFilterChange = (key: string, val: any) => {
	if (key === 'businessType') filterBusinessType.value = val as number | ''
	if (key === 'status') filterStatus.value = val as 0 | 1 | ''
	if (key === 'timeRange') filterTimeRange.value = val as string[] | null
	pagination.current = 1
	doFetch()
}

const handleReset = () => {
	filterModule.value = ''
	filterBusinessType.value = ''
	filterStatus.value = ''
	filterTimeRange.value = null
	pagination.current = 1
	doFetch()
}

// 分页监听
watch(() => pagination.current, () => doFetch())
watch(() => pagination.size, () => {
	pagination.current = 1
	doFetch()
})

const handleExport = async () => {
	try {
		const param = {
			module: filterModule.value || undefined,
			businessType: (filterBusinessType.value as any) || undefined,
			status: filterStatus.value || undefined,
			startTime: filterTimeRange.value?.[0],
			endTime: filterTimeRange.value?.[1],
		}
		const { blob, fileName } = await exportOperationLog({ ...param })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
	} catch {
		ElMessage.error('导出失败')
	}
}

const toggleExpand = (row: OperationLogVO) => {
	const idx = expandedRows.value.indexOf(row.id)
	if (idx > -1) {
		expandedRows.value.splice(idx, 1)
	} else {
		expandedRows.value = [row.id]
	}
}

// ========== 辅助样式方法 ==========
const getMethodClass = (method: string): string => {
	const map: Record<string, string> = {
		GET: 'method-tag--get', POST: 'method-tag--post',
		PUT: 'method-tag--put', DELETE: 'method-tag--delete',
		PATCH: 'method-tag--patch',
	}
	return map[method.toUpperCase()] || ''
}

const getDurationClass = (duration: number): string => {
	if (duration >= 3000) return 'duration-val--danger'
	if (duration >= 1000) return 'duration-val--slow'
	return ''
}

const getDurationBarClass = (duration: number): string => {
	if (duration >= 3000) return 'duration-bar--danger'
	if (duration >= 1000) return 'duration-bar--slow'
	return ''
}

// const getDurationBarWidth = (duration: number): string => {
// 	const max = 5000
// 	const pct = Math.min((duration / max) * 100, 100)
// 	return `${pct.toFixed(0)}%`
// }

// ========== 数据获取 ==========
const doFetch = async () => {
	loading.value = true
	try {
		const params: any = {
			pageNum: pagination.current,
			pageSize: pagination.size,
		}
		if (filterModule.value) params.module = filterModule.value
		if (filterBusinessType.value !== '') params.businessType = filterBusinessType.value
		if (filterStatus.value !== '') params.status = filterStatus.value
		if (filterTimeRange.value) {
			params.startTime = filterTimeRange.value[0]
			params.endTime = filterTimeRange.value[1]
		}

		const res: any = await getOperationLogPage(params)
		const { records, total, current } = res
		tableData.value = records
		pagination.total = total
		pagination.current = current
		expandedRows.value = []
	} catch {
		ElMessage.error('加载日志数据失败')
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	doFetch()
})
</script>

<style lang="scss" scoped>
// ========== Hero 右侧按钮 ==========
:deep(.table-btn-primary) {
	padding: 7px 16px;
	border-radius: 6px;
	font-size: 13px;
	font-weight: 600;
	background: #2f5bff;
	color: #fff;
	border: 1px solid #2f5bff;
	cursor: pointer;
	transition: all 0.15s;
	display: inline-flex;
	align-items: center;
	gap: 5px;

	&:hover {
		background: #1d35d6;
		box-shadow: 0 4px 14px rgba(47, 91, 255, 0.3);
	}
}

// ========== 日志表格特有样式 ==========
.log-biz-row {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 4px;
}

.biz-type-badge {
	display: inline-flex;
	align-items: center;
	padding: 1px 7px;
	border-radius: 99px;
	font-size: 10.5px;
	font-weight: 700;
	flex-shrink: 0;

	&--1,
	&--15 {
		background: rgba(22, 163, 74, 0.08);
		color: #16a34a;
	}

	// 新增
	&--2 {
		background: rgba(47, 91, 255, 0.08);
		color: #2f5bff;
	}

	// 修改
	&--3 {
		background: rgba(225, 29, 72, 0.08);
		color: #e11d48;
	}

	// 删除
	&--4 {
		background: rgba(124, 58, 237, 0.08);
		color: #7c3aed;
	}

	// 查询
	&--5,
	&--13 {
		background: rgba(217, 119, 6, 0.08);
		color: #d97706;
	}

	// 导出
	&--6 {
		background: rgba(100, 116, 139, 0.08);
		color: #64748b;
	}

	// 其他
}

.log-op-row {
	display: flex;
	align-items: center;
	gap: 6px;
}

.method-tag {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 1px 6px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 800;
	font-family: 'Courier New', monospace;
	min-width: 36px;
	text-align: center;

	&--get {
		background: rgba(22, 163, 74, 0.1);
		color: #16a34a;
	}

	&--post {
		background: rgba(47, 91, 255, 0.1);
		color: #2f5bff;
	}

	&--put {
		background: rgba(217, 119, 6, 0.1);
		color: #d97706;
	}

	&--delete {
		background: rgba(225, 29, 72, 0.1);
		color: #e11d48;
	}

	&--patch {
		background: rgba(124, 58, 237, 0.1);
		color: #7c3aed;
	}
}

.url-tag {
	font-size: 11.5px;
	color: #9ca3af;
	max-width: 180px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}


// ========== 状态 / 耗时 ==========
.status-cell {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.error-tip {
	font-size: 11px;
	color: #e11d48;
	max-width: 120px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.duration-val {
	font-family: 'Manrope', sans-serif;
	font-size: 14px;
	font-weight: 700;
	color: #374151;

	.duration-unit {
		font-size: 10px;
		font-weight: 500;
		color: #9ca3af;
		margin-left: 1px;
	}

	&--slow {
		color: #d97706;
	}

	&--danger {
		color: #e11d48;
	}
}

.duration-bar-wrap {
	width: 52px;
	height: 3px;
	background: #e5e7eb;
	border-radius: 99px;
	margin-top: 5px;
	overflow: hidden;
}

.duration-bar {
	height: 100%;
	border-radius: 99px;
	background: #2f5bff;
	transition: width 0.3s ease;

	&--slow {
		background: #d97706;
	}

	&--danger {
		background: #e11d48;
	}
}

// ========== 时间 ==========
.time-clock {
	font-family: 'Courier New', monospace;
	font-size: 11px !important;
	color: #9ca3af !important;
}

// ========== 展开详情面板 ==========
.expand-detail-panel {
	background: #fafbff;
	padding: 14px 20px;
	border-top: 1px solid #e8edf5;
}

.expand-detail-grid {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 12px;
}

.expand-detail-item {
	display: flex;
	flex-direction: column;
	gap: 4px;

	&--full {
		grid-column: 1 / -1;
	}
}

.expand-detail-label {
	font-size: 10px;
	font-weight: 700;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.8px;
}

.expand-detail-val {
	font-family: 'Courier New', monospace;
	font-size: 11.5px;
	color: #374151;
	background: #fff;
	border: 1px solid #e8edf5;
	border-radius: 5px;
	padding: 5px 10px;
	word-break: break-all;
	max-height: 52px;
	overflow-y: auto;
	line-height: 1.5;

	&--get {
		color: #16a34a;
		font-weight: 700;
	}

	&--post {
		color: #2f5bff;
		font-weight: 700;
	}

	&--put {
		color: #d97706;
		font-weight: 700;
	}

	&--delete {
		color: #e11d48;
		font-weight: 700;
	}

	&--error {
		color: #e11d48;
		font-weight: 500;
		background: rgba(225, 29, 72, 0.05);
		border-color: rgba(225, 29, 72, 0.2);
	}
}

// ========== Table Footer Bar ==========
.table-footer-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 14px;
	background: #f9fafb;
	border-top: 1px solid #e8edf5;
	flex-shrink: 0;

	.el-pagination {
		--el-pagination-hover-color: #2f5bff;
	}
}

.table-info-left {
	font-size: 12px;
	color: #9ca3af;

	strong {
		color: #374151;
		font-weight: 700;
	}
}
</style>
