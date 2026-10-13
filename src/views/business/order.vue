<template>
  <list-template ref="listTemplateRef" page-class="order" hero-eyebrow="Business" hero-title="订单管理"
    hero-desc="支持订单创建、审核、修改全流程管理，覆盖草稿至完结各阶段" :stats="stats" :filter-inputs="filterInputs" :filter-selects="filterSelects"
    :filter-date-ranges="filterDateRanges" :show-filter-reset="false" :show-filter-create="false"
    :hideFilter="activeTab === 'draft'" @filter-input-change="onFilterInputChange"
    @filter-input-trigger="onFilterInputTrigger" @filter-change="onFilterChange">
    <!-- Tab 栏 -->
    <template #filter-bottom>
      <div class="segment-tabs" role="tablist">
        <button class="segment-tabs__btn" :class="{ 'is-active': activeTab === 'draft' }" @click="switchTab('draft')" v-permission="'order:TabDraft'">
          我的草稿
        </button>
        <button class="segment-tabs__btn" :class="{ 'is-active': activeTab === 'order' }" @click="switchTab('order')" v-permission="'order:TabOrderList'">
          订单列表
        </button>
        <button class="segment-tabs__btn" :class="{ 'is-active': activeTab === 'classic' }" @click="switchTab('classic')" v-permission="'order:TabCase'">
          经典案例
        </button>
        <button class="segment-tabs__btn" :class="{ 'is-active': activeTab === 'myCancel' }" @click="switchTab('myCancel')" v-permission="'order:TabMyCancel'">
          我的取消
        </button>
        <button class="segment-tabs__btn" :class="{ 'is-active': activeTab === 'modifyApply' }" @click="switchTab('modifyApply')" v-permission="'order:ModifyApply'">
          修改申请列表
        </button>
        <button class="segment-tabs__btn" :class="{ 'is-active': activeTab === 'cancelApply' }" @click="switchTab('cancelApply')" v-permission="'order:CancelApply'">
          取消申请列表
        </button>
      </div>
    </template>
    <!-- 筛选栏右侧操作 -->
    <template #filter-extra-actions v-if="activeTab !== 'draft'">
      <div class="filter-actions">
        <el-button class="filter-btn" @click="handleFilterReset">重置</el-button>
        <!-- <el-button plain @click="orderListRef?.openAdvancedFilter()" v-if="activeTab === 'order'">
          <el-icon>
            <Filter />
          </el-icon>
          高级筛选
          <span class="adv-filter-badge" v-if="false">已筛选</span>
        </el-button> -->
        <el-button type="primary" class="table-btn-primary" @click="handleCreate" v-if="activeTab === 'order'" v-permission="'order:Add'">
          <el-icon>
            <Plus />
          </el-icon>
          新建订单
        </el-button>
      </div>
    </template>

    <!-- 草稿列表 -->
    <order-draft-list v-if="activeTab === 'draft'" ref="draftListRef" @edit="handleEditDraft"
      @delete="handleDeleteDraft" />
      
    <!-- 订单列表 -->
    <order-list v-else-if="activeTab === 'order'" ref="orderListRef" :query-params="orderQuery"
      @sort-change="onSortChange" @redirect-cancel-apply="onRedirectCancelApply" />

    <!-- 经典案例 -->
    <classic-case-list v-else-if="activeTab === 'classic'" ref="classicCaseListRef" :query-params="classicCaseQuery" />

    <!-- 修改申请列表 -->
    <modify-apply-list v-else-if="activeTab === 'modifyApply'" ref="modifyApplyListRef" :query-params="modifyApplyQuery" />

    <!-- 取消申请列表 -->
    <cancel-apply-list v-else-if="activeTab === 'cancelApply'" ref="cancelApplyListRef" :query-params="cancelApplyQuery" mode="list"/>

    <!-- 我的取消申请 -->
    <cancel-apply-list v-else-if="activeTab === 'myCancel'" ref="cancelApplyListRef" :query-params="cancelApplyQuery" mode="myApplies"/>

  </list-template>

</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  EditPen, List, Plus, Clock, Brush
} from '@element-plus/icons-vue'
import listTemplate from '@/components/listTemplate.vue'
import orderDraftList from './orderComponents/draft.vue'
import orderList from './orderComponents/orderList.vue'
import classicCaseList from './orderComponents/classicCase.vue'
import modifyApplyList from './orderComponents/modifyApplyList.vue'
import cancelApplyList from './orderComponents/cancelApplyList.vue'
import { getDictOptions } from '@/utils/dict'
import type { DraftVO } from '@/api/order'
import { getOrderStatus, orderStatistics } from '@/api/order'

// ── 子组件 Ref ─────────────────────────────────────────────────────────

const draftListRef = ref<InstanceType<typeof orderDraftList>>()
const orderListRef = ref<InstanceType<typeof orderList>>()
const classicCaseListRef = ref<InstanceType<typeof classicCaseList>>()
const modifyApplyListRef = ref<InstanceType<typeof modifyApplyList>>()
const cancelApplyListRef = ref<InstanceType<typeof cancelApplyList>>()

// ── Tab 管理 ─────────────────────────────────────────────────────────

type TabType = 'draft' | 'order' | 'classic' | 'myCancel' | 'modifyApply' | 'cancelApply'
const activeTab = ref<TabType>('order')
const listTemplateRef = ref()

const draftCount = ref(0)
const orderCount = ref(0)
const pendingCount = ref(0)
const designingCount = ref(0)

const switchTab = (tab: TabType) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  if (tab === 'order') {
    orderListRef.value?.fetchList()
  }
  if(tab === 'classic') {
    classicCaseListRef.value?.fetchList()
  }
  if(tab === 'modifyApply') {
    modifyApplyListRef.value?.fetchList()
  }
  if(tab === 'cancelApply' || tab === 'myCancel') {
    cancelApplyListRef.value?.fetchList()
  }
}

// 取消申请审核通知跳转：切换到取消申请列表 Tab 并打开详情
const onRedirectCancelApply = (applyId: number | string) => {
  switchTab('cancelApply')
  nextTick(() => {
    cancelApplyListRef.value?.openDetail({ id: Number(applyId) } as any)
  })
}

// ── 统计数据 ─────────────────────────────────────────────────────────

const stats = computed(() => [
  { label: '总订单', value: orderCount.value > 0 ? orderCount.value.toLocaleString() : '—', icon: List },
  { label: '待审核', value: pendingCount.value > 0 ? pendingCount.value.toLocaleString() : '—', icon: Clock },
  { label: '设计中', value: designingCount.value > 0 ? designingCount.value.toLocaleString() : '—', icon: Brush },
])

// ── 筛选条件（按 Tab 返回不同配置） ─────────────────────────────────

const filterInputs = computed(() => {
  if (activeTab.value === 'order') {
    return [{ modelKey: 'orderCode', placeholder: '搜索订单编号、提单机构、业务员、医院、医生、患者模糊搜索' }]
  }
  if(activeTab.value === 'classic') {
    return [{ modelKey: 'keyword', placeholder: '搜索订单编号、提单机构、业务员、医院、医生、患者模糊搜索' }]
  }
  if(activeTab.value === 'modifyApply') {
    return [{ modelKey: 'orderCode', placeholder: '搜索订单编号模糊搜索' }]
  }
  if(activeTab.value === 'cancelApply' || activeTab.value === 'myCancel') {
    return [{ modelKey: 'orderCode', placeholder: '搜索订单编号模糊搜索' }]
  }
  return []
})

const filterSelects = computed(() => {
  if (activeTab.value === 'order') {
    return [
      { modelKey: 'businessType', placeholder: '业务类型', options: businessTypeOptions.value },
      { modelKey: 'status', placeholder: '当前状态', options: orderStatusOptions.value },
      { modelKey: 'needsPhysicalDelivery', placeholder: '是否实体交付', options: needsPhysicalDeliveryOptions.value },
    ]
  }
  if(activeTab.value === 'modifyApply') {
    return [
      { modelKey: 'status', placeholder: '全部状态', options: statusOptions.value },
    ]
  }
  return []
})

const filterDateRanges = computed(() => {
  if (activeTab.value === 'order') {
    return [{ modelKey: 'createTime', startPlaceholder: '创建开始', endPlaceholder: '创建结束', valueFormat: 'YYYY-MM-DD HH:mm:ss' }]
  }
  if(activeTab.value === 'classic') {
    return [{ modelKey: 'classicCaseTime', startPlaceholder: '标记开始', endPlaceholder: '标记结束', valueFormat: 'YYYY-MM-DD HH:mm:ss' }]
  }
  if(activeTab.value === 'modifyApply') {
    return [{ modelKey: 'applyTime', startPlaceholder: '申请开始', endPlaceholder: '申请结束', valueFormat: 'YYYY-MM-DD HH:mm:ss' }]
  }
  if(activeTab.value === 'cancelApply' || activeTab.value === 'myCancel') {
    return [{ modelKey: 'applyTime', startPlaceholder: '申请开始', endPlaceholder: '申请结束', valueFormat: 'YYYY-MM-DD HH:mm:ss' }]
  }
  return []
})

const businessTypeOptions = ref<{ label: string; value: string }[]>([])
const statusOptions = ref<{ label: string; value: string }[]>([
  { label: '待审核', value: '1' },
  { label: '已通过', value: '2' },
  { label: '已驳回', value: '3' },
  { label: '已过期', value: '4' },
])

const needsPhysicalDeliveryOptions = ref<{ label: string; value: number }[]>([
  { label: '是（需要实体交付）', value: 1 },
  { label: '否（仅设计服务）', value: 0 },
  { label: '否（异地打印）', value: 2 },
])

const orderStatusOptions = ref<{ label: string; value: string; show?: boolean }[]>([])

// 获取订单状态列表
const fetchOrderStatusOptions = async () => {
  try {
    const res = await getOrderStatus()
    orderStatusOptions.value = res.filter((item) => item.show)
  } catch (error) {
    console.error('获取订单状态列表失败', error)
  }
}

const cancelApplyStatusOptions = ref<{ label: string; value: number }[]>([
  { label: '待审核', value: 1 },
  { label: '已通过', value: 2 },
  { label: '已驳回', value: 3 },
])

// ── 基础筛选 ─────────────────────────────────────────────────────────

const onFilterInputChange = ({ modelKey, value }: { modelKey: string; value: string }) => {
  if (activeTab.value === 'order') {
    ; (orderQuery as any)[modelKey] = value || undefined
  }
  if(activeTab.value === 'classic') {
    ; (classicCaseQuery as any)[modelKey] = value || undefined
  }
  if(activeTab.value === 'cancelApply' || activeTab.value === 'myCancel') {
    ; (cancelApplyQuery as any)[modelKey] = value || undefined
  }
}

const onFilterInputTrigger = ({ modelKey, value }: { modelKey: string; value: string }) => {
  if (activeTab.value === 'order') {
    ; (orderQuery as any)[modelKey] = value || undefined
    orderListRef.value?.fetchList()
  }
  if(activeTab.value === 'classic') {
    ; (classicCaseQuery as any)[modelKey] = value || undefined
    classicCaseListRef.value?.fetchList()
  }
  if(activeTab.value === 'modifyApply') {
    ; (modifyApplyQuery as any)[modelKey] = value || undefined
    modifyApplyListRef.value?.fetchList()
  }
  if(activeTab.value === 'cancelApply' || activeTab.value === 'myCancel') {
    ; (cancelApplyQuery as any)[modelKey] = value || undefined
    cancelApplyListRef.value?.fetchList()
  }
}

const onFilterChange = (key: string, value: any) => {
  if (activeTab.value === 'order') {
    ; (orderQuery as any)[key] = value === '' || value === null || value === undefined ? undefined : value
    orderListRef.value?.fetchList()
  }
  if(activeTab.value === 'classic') {
    ; (classicCaseQuery as any)[key] = value === '' || value === null || value === undefined ? undefined : value
    classicCaseListRef.value?.fetchList()
  }
  if(activeTab.value === 'modifyApply') {
    ; (modifyApplyQuery as any)[key] = value === '' || value === null || value === undefined ? undefined : value
    modifyApplyListRef.value?.fetchList()
  }
  if(activeTab.value === 'cancelApply' || activeTab.value === 'myCancel') {
    ; (cancelApplyQuery as any)[key] = value === '' || value === null || value === undefined ? undefined : value
    cancelApplyListRef.value?.fetchList()
  }
}

const clearFilterState = () => {
  if (listTemplateRef.value) {
    const { filterInputsData, filterSelectsData, filterDateRangesData } = listTemplateRef.value
    Object.keys(filterInputsData).forEach(k => { filterInputsData[k] = '' })
    Object.keys(filterSelectsData).forEach(k => { filterSelectsData[k] = undefined })
    Object.keys(filterDateRangesData).forEach(k => { filterDateRangesData[k] = null })
  }
}

const resetQuery = (query: Record<string, any>, defaults: Record<string, any>) => {
  Object.keys(query).forEach(key => { delete query[key] })
  Object.assign(query, defaults)
}

const handleFilterReset = () => {
  clearFilterState()
  if (activeTab.value === 'order') {
    resetQuery(orderQuery, getDefaultOrderQuery())
    orderListRef.value?.fetchList()
  }
  if(activeTab.value === 'classic') {
    resetQuery(classicCaseQuery, getDefaultClassicCaseQuery())
    classicCaseListRef.value?.fetchList()
  }
  if(activeTab.value === 'cancelApply' || activeTab.value === 'myCancel') {
    resetQuery(cancelApplyQuery, getDefaultCancelApplyQuery())
    cancelApplyListRef.value?.fetchList()
  }
}

const onSortChange = ({ sortField, sortOrder }: { sortField?: string; sortOrder?: string }) => {
  ; (orderQuery as any).sortField = sortField
    ; (orderQuery as any).sortOrder = sortOrder
  orderListRef.value?.fetchList()
}

// ── 草稿事件 ─────────────────────────────────────────────────────────

const handleEditDraft = (row: DraftVO) => {
  ElMessage.info(`编辑草稿 ${row.orderCode}（${row.id}）`)
}

const handleDeleteDraft = async (row: DraftVO) => {
  draftListRef.value?.fetchList()
}

// ── 订单列表 query ────────────────────────────────────────────────────

const getDefaultOrderQuery = () => ({
  pageNum: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'DESC',
} as any)


const orderQuery = reactive(getDefaultOrderQuery())

//--经典案例 query ────────────────────────────────────────────────────

const getDefaultClassicCaseQuery = () => ({
  pageNum: 1,
  pageSize: 10,
} as any)

const classicCaseQuery = reactive(getDefaultClassicCaseQuery())

//--修改申请列表 query ──────────────────────────────────────────────

const getDefaultModifyApplyQuery = () => ({
  pageNum: 1,
  pageSize: 10,
} as any)

const modifyApplyQuery = reactive(getDefaultModifyApplyQuery())

//--取消申请列表 query ──────────────────────────────────────────────

const getDefaultCancelApplyQuery = () => ({
  pageNum: 1,
  pageSize: 10,
} as any)

const cancelApplyQuery = reactive(getDefaultCancelApplyQuery())

// ── 新建订单（委托给 orderList 子组件） ───────────────────────────────

const handleCreate = () => {
  orderListRef.value?.handleCreate()
}

// ── 初始化 ─────────────────────────────────────────────────────────

const loadFilterOptions = async () => {
  try {
    const bizRes: any = await getDictOptions('11')
    if (bizRes) {
      businessTypeOptions.value = bizRes.map((d: any) => ({ label: d.label, value: d.value }))
    }
    await fetchOrderStatusOptions()
  } catch { /* ignore */ }
}

onMounted(async () => {
  await fetchStatistics()
  loadFilterOptions()
})

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await orderStatistics()
    orderCount.value = res.total
    pendingCount.value = res.pendingAudit
    designingCount.value = res.designing
  } catch { /* ignore */ }
}

// 监听路由 query 参数处理通知跳转
const route = useRoute()
const router = useRouter()

watch(() => route.query, (query) => {
  // 修改申请通知跳转
  if (query.tab === 'modifyApply') {
    switchTab('modifyApply')
    nextTick(() => {
      const detailId = query.detailId
      if (detailId) {
        ;(modifyApplyListRef.value as any)?.openDetail({ id: Number(detailId) })
        router.replace({ query: {} })
      }
    })
    return
  }
  // 取消申请审核通知跳转
  if (query.detailId && query.jumpUrl === '/order/cancel-apply/audit') {
    switchTab('cancelApply')
    nextTick(() => {
      cancelApplyListRef.value?.openDetail({ id: Number(query.detailId) } as any)
      router.replace({ query: {} })
    })
    return
  }
  // 订单列表通知跳转
  if (query.detailId) {
    switchTab('order')
    nextTick(() => {
      orderListRef.value?.openDetail({ id: Number(query.detailId) } as any)
      router.replace({ query: {} })
    })
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;
</style>
