<template>
  <div class="page-body-panel">
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">经典案例</div>
        </div>
      </template>
      <!-- 表格 -->
      <div class="roles-list-wrap table-scroll-container">
        <el-table :data="list" v-loading="loading" :header-cell-style="{ background: '#f9fafb' }"
           height="100%">
          <el-table-column type="index" label="序号" width="55" align="center" fixed />
          <el-table-column prop="orderCode" label="订单编号" min-width="140">
            <template #default="{ row }">
              <span class="cc-code">{{ row.orderCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="patientName" label="患者信息" min-width="170" align="center">
            <template #default="{ row }">
              {{ row.patientName }}
              <span style="margin-left:4px;color:#909399">{{ row.patientGenderName }}/{{ row.patientAge }}岁</span>
            </template>
          </el-table-column>
          <el-table-column prop="hospitalName" label="医院" min-width="160" show-overflow-tooltip />
          <el-table-column prop="orgName" label="提单机构" min-width="160" show-overflow-tooltip />
          <el-table-column prop="operatorName" label="业务员" min-width="100" align="center" />
          <el-table-column prop="orderTypeName" label="订单类型" width="110" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.orderType === 1 ? 'primary' : 'warning'" effect="plain">
                {{ row.orderTypeName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="businessTypeName" label="业务类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">{{ row.businessTypeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="rebuildProjectList" label="重建项目" width="160" align="center">
            <template #default="{ row }">
              <div class="project-tags">
                <template v-if="row.rebuildProjectList && row.rebuildProjectList.length > 0">
                  <el-tag v-for="p in row.rebuildProjectList.slice(0, 2)" :key="p.projectName" size="small"
                    type="primary" effect="plain">
                    {{ p.projectName }}
                  </el-tag>
                  <span v-if="row.rebuildProjectList.length > 2" style="font-size: 11px;">
                    +{{ row.rebuildProjectList.length - 2 }}
                  </span>
                </template>
                <span v-else>—</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="statusName" label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" effect="plain"
                :style="{
                  backgroundColor: row.statusColor?.bgColor || '#f3f4f6',
                  borderColor: row.statusColor?.bdColor || '#e5e7eb',
                  color: row.statusColor?.color || '#6b7280',
                }">{{ row.statusName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="classicCaseTime" label="标记时间" min-width="160">
            <template #default="{ row }">
              {{ row.classicCaseTime ? dayjs(row.classicCaseTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="classicCaseByName" label="标记人" width="100" align="center" />
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-dropdown trigger="click">
                <el-button text :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click.stop="handleView(row)">
                      <span class="icon-tag" v-permission="'order:View'">
                        <el-icon><View /></el-icon>查看详情
                      </span>
                    </el-dropdown-item>
                    <el-dropdown-item @click.stop="handleDicomView(row)" divided>
                      <span class="icon-tag" v-permission="'order:DicomView'">
                        <el-icon><Monitor /></el-icon>可视化预览
                      </span>
                    </el-dropdown-item>
                    <el-dropdown-item @click.stop="handleEncodeView(row)">
                      <span class="icon-tag" v-permission="'order:EncodeView'">
                        <el-icon><Link /></el-icon>生成二维码
                      </span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <page-box :current-page="pager.currentPage" :page-size="pager.pageSize" :total-count="pager.totalCount"
        @current-change="handlePageChange" />
    </el-card>
  </div>

  <!-- 经典案例详情弹窗 -->
  <order-detail-dialog v-model="showDetailDialog" :order="detailOrder"
    :is-classic-case="true" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { MoreFilled, View, Monitor, Link } from '@element-plus/icons-vue'
import pageBox from '@/components/pageBox.vue'
import orderDetailDialog from './orderDetailDialog.vue'
import { classicCaseDetail, classicCaseList, ClassicCaseListQuery, type ClassicCaseVO } from '@/api/order'
import $axios from '@/utils/http'
import dayjs from 'dayjs'

defineOptions({ name: 'ClassicCaseList' })
const props = defineProps<{
  queryParams: ClassicCaseListQuery
}>()

const pager = reactive({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
})

// ── 列表数据 ─────────────────────────────────────────────────────────

const loading = ref(false)
const list = ref<ClassicCaseVO[]>([])

// ── 详情 ─────────────────────────────────────────────────────────────

const showDetailDialog = ref(false)
const detailOrder = ref<any>(null)
const detailOrderId = ref<number>(0)

const handleView = async (row: ClassicCaseVO) => {
  const res = await classicCaseDetail(row.id)
  detailOrder.value = res
  showDetailDialog.value = true
}

const handleDicomView = async (row: ClassicCaseVO) => {
  try {
    const res = await $axios.get('/imaging/v1/config', { params: { orderId: row.id } })
    const encoded = btoa(JSON.stringify(res))
    const url = `http://view.yigongbao.com.cn:8080/#/viewer?kv=${encoded}`
    window.open(url, '_blank')
  } catch {
  }
}

const handleEncodeView = async (row: ClassicCaseVO) => {
  try {
    const res = await $axios.get('/imaging/v1/config', { params: { orderId: row.id } })
    const encoded = btoa(JSON.stringify(res))
    const url = `http://view.yigongbao.com.cn:8080/#/aiView?kv=${encoded}`
    window.open(url, '_blank')
  } catch {
  }
}

// ── 数据加载 ─────────────────────────────────────────────────────────

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      ...props.queryParams,
      pageNum: pager.currentPage,
      pageSize: pager.pageSize,
    }
    const dateRange = (props.queryParams as any).classicCaseTime
    if (dateRange && dateRange.length === 2) {
      params.startTime = `${dateRange[0]}`
      params.endTime = `${dateRange[1]}`
    }
    delete (params as any).classicCaseTime
    const res = await classicCaseList(params)
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
})
onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
@use '@/assets/style/authCommon.scss' as *;

.cc-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #f0f2f5;
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

.cc-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12.5px;
  color: #2f5bff;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  justify-content: center;


}
</style>
