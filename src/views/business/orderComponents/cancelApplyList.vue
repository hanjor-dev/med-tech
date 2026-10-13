<template>
  <div class="page-body-panel">
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">{{ mode === 'myApplies' ? '我的取消申请' : '取消申请列表' }}</div>
        </div>
      </template>
      <!-- 表格 -->
      <div class="roles-list-wrap table-scroll-container">
        <el-table :data="list" v-loading="loading" :header-cell-style="{ background: '#f9fafb' }" height="100%">
          <el-table-column type="index" label="序号" align="center" fixed min-width="55" />
          <el-table-column prop="orderCode" label="订单编号">
            <template #default="{ row }">
              <span class="apply-code">{{ row.orderCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="applyByName" label="申请人" align="center" />
          <el-table-column prop="createTime" label="申请时间">
            <template #default="{ row }">
              {{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="applyReason" label="申请原因" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.applyReason || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="auditStatus" label="审核状态" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getStatusType(row.auditStatus)" effect="light">
                {{ getStatusText(row.auditStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right">
            <template #default="{ row }">
              <el-button text class="action-btn" @click="handleViewDetail(row)" title="查看详情">
                <el-icon>
                  <View />
                </el-icon>
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

  <!-- 取消申请详情弹窗 -->
  <cancel-apply-detail-dialog v-model="showDetailDialog" :apply-id="currentApplyId" :mode="mode"
    :audit-status="currentAuditStatus" @success="handleAuditSuccess" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View } from '@element-plus/icons-vue'
import pageBox from '@/components/pageBox.vue'
import cancelApplyDetailDialog from './cancelApplyDetailDialog.vue'
import { cancelApplyList, myCancelApplyList, type CancelApplyVO, type CancelApplyQuery } from '@/api/order'
import dayjs from 'dayjs'

defineOptions({ name: 'CancelApplyList' })
const props = defineProps<{
  queryParams: CancelApplyQuery
  mode?: 'list' | 'myApplies'
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
const list = ref<CancelApplyVO[]>([])

// ── 详情 ─────────────────────────────────────────────────────────────

const showDetailDialog = ref(false)
const currentApplyId = ref<number>(0)
const currentAuditStatus = ref<number>(0)

// ── 历史记录 ────────────────────────────────────────────────────────

const getStatusType = (status: number) => {
  switch (status) {
    case 1: return 'warning' // 待审核
    case 2: return 'success' // 已通过
    case 3: return 'danger'  // 已驳回
    default: return 'info'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 1: return '待审核'
    case 2: return '已通过'
    case 3: return '已驳回'
    default: return '未知'
  }
}

const handleViewDetail = (row: CancelApplyVO) => {
  currentApplyId.value = row.id
  currentAuditStatus.value = row.auditStatus
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
    const params: CancelApplyQuery = {
      ...props.queryParams,
      pageNum: pager.currentPage,
      pageSize: pager.pageSize,
    }
    const dateRange = (props.queryParams as any).applyTime
    if (dateRange && dateRange.length === 2) {
      params.createTimeStart = `${dateRange[0]}`
      params.createTimeEnd = `${dateRange[1]}`
    }
    delete (params as any).applyTime
    const func = props.mode === 'myApplies' ? myCancelApplyList : cancelApplyList
    const res = await func(params)
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
  openDetail: handleViewDetail,
})
const route = useRoute()
const router = useRouter()

watch(() => route.query.detailId, (detailId) => {
  if (detailId && list.value.length) {
    const row = list.value.find(r => r.id === Number(detailId))
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
</style>
