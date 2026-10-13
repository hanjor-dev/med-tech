<template>
  <div class="page-body-panel">
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">修改申请列表</div>
        </div>
      </template>
      <!-- 表格 -->
      <div class="roles-list-wrap table-scroll-container">
        <el-table :data="list" v-loading="loading" :header-cell-style="{ background: '#f9fafb' }"
           height="100%">
          <el-table-column type="index" label="序号" align="center" fixed  min-width="55"/>
          <el-table-column prop="orderCode" label="订单编号">
            <template #default="{ row }">
              <span class="apply-code">{{ row.orderCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="applyUserName" label="申请人" align="center" />
          <el-table-column prop="applyTime" label="申请时间">
            <template #default="{ row }">
              {{ row.applyTime ? dayjs(row.applyTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="expireTime" label="过期时间">
            <template #default="{ row }">
              {{ row.expireTime ? dayjs(row.expireTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="statusDesc" label="状态" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getStatusType(row.status)" effect="light">
                {{ row.statusDesc }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="changeCount" label="变更项数" align="center">
            <template #default="{ row }">
              <span>{{ row.changeCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="changeSummary" label="变更摘要" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.changeSummary || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button text class="action-btn" @click="handleViewDetail(row)" title="查看详情">
                <el-icon><View /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <page-box :current-page="pager.currentPage" :page-size="pager.pageSize" :total-count="pager.totalCount"
        @current-change="handlePageChange" />
    </el-card>
  </div>

  <!-- 修改申请详情弹窗 -->
  <modify-apply-detail-dialog v-model="showDetailDialog" :apply-id="currentApplyId"
     @success="handleAuditSuccess" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View } from '@element-plus/icons-vue'
import pageBox from '@/components/pageBox.vue'
import modifyApplyDetailDialog from './modifyApplyDetailDialog.vue'
import { modifyApplyList, type ModifyApplyVO, type ModifyApplyQuery } from '@/api/order'
import dayjs from 'dayjs'

defineOptions({ name: 'ModifyApplyList' })
const props = defineProps<{
  queryParams: ModifyApplyQuery
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const pager = reactive({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
})

// ── 列表数据 ─────────────────────────────────────────────────────────

const loading = ref(false)
const list = ref<ModifyApplyVO[]>([])

// ── 详情 ─────────────────────────────────────────────────────────────

const showDetailDialog = ref(false)
const currentApplyId = ref<number>(0)
const currentApply = ref<ModifyApplyVO | null>(null)

const getStatusType = (status: number) => {
  switch (status) {
    case 1: return 'warning' // 待审核
    case 2: return 'success' // 通过
    case 3: return 'danger'  // 驳回
    default: return 'info'
  }
}

const handleViewDetail = (row: ModifyApplyVO) => {
  currentApplyId.value = row.applyId
  currentApply.value = row
  showDetailDialog.value = true
}

// 供外部调用：打开详情弹框
const openDetail = (params: { id: number; applyId?: number }) => {
  currentApplyId.value = params.applyId || params.id
  currentApply.value = null
  showDetailDialog.value = true
}


const handleAuditSuccess = () => {
  emit('success')
  fetchList()
}

// ── 数据加载 ─────────────────────────────────────────────────────────

const fetchList = async () => {
  loading.value = true
  try {
    const params: ModifyApplyQuery = {
      ...props.queryParams,
      pageNum: pager.currentPage,
      pageSize: pager.pageSize,
    }
    const dateRange = (props.queryParams as any).applyTime
    if (dateRange && dateRange.length === 2) {
      params.applyTimeStart = `${dateRange[0]}`
      params.applyTimeEnd = `${dateRange[1]}`
    }
    delete (params as any).applyTime
    const res = await modifyApplyList(params)
    list.value = res.records
    pager.totalCount = res.total
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pager.currentPage = page
  fetchList()
}

defineExpose({
  fetchList,
  openDetail,
})
const route = useRoute()
const router = useRouter()

watch(() => route.query.detailId, (detailId) => {
  if (detailId && list.value.length) {
    const row = list.value.find(r => r.applyId === Number(detailId))
    if (row) {
      handleViewDetail(row)
      router.replace({ query: {} })
    }
  }
}, { immediate: true })

watch(() => props.queryParams, () => {
  pager.currentPage = 1
  fetchList()
}, { deep: true })

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
@use '@/assets/style/authCommon.scss' as *;

.apply-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12.5px;
  color: #2f5bff;
}

:deep(.el-card) {
  height: 100%;

  .el-card__body {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }
}

.action-btn {
  padding: 4px;
}
</style>
