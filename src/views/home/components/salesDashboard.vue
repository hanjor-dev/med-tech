<template>
  <div class="sales-dashboard">
    <!-- Header -->
    <DashboardHeader
      title="医 工 宝 数 据 看 板"
      :subtitle="''"
      theme-color="#2f5bff"
      :refresh-interval="refreshInterval"
      :loading="loading"
      @refresh="handleRefresh"
      @time-range-change="handleTimeRangeChange"
    />

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Stats Section -->
      <section class="stats-section">
        <div class="stats-row">
          <div
            v-for="card in statCards"
            :key="card.key"
            class="stat-card"
            :class="`stat-card--${card.color}`"
          >
            <div class="stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="card.icon" />
            </div>
            <div class="stat-card__body">
              <div class="stat-card__label">{{ card.label }}</div>
              <div class="stat-card__value">{{ card.value }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts-section">
        <!-- Order Trend Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              订单趋势与完成对比
            </h3>
          </div>
          <div class="chart-body">
            <div ref="trendChartRef" class="echarts-container"></div>
          </div>
        </div>

        <!-- Order Progress List -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="20" x2="12" y2="10"/>
                <line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </svg>
              进行中订单
            </h3>
          </div>
          <div class="order-list-header">
            <span class="col-hospital">医院</span>
            <span class="col-patient">患者</span>
            <span class="col-delivery">交付</span>
            <span class="col-progress">进度</span>
          </div>
          <div class="order-list-body" ref="orderListBody">
            <div
              v-for="order in orders"
              :key="order.id"
              class="order-row"
              @mouseenter="isPaused = true"
              @mouseleave="isPaused = false"
            >
              <div class="col-hospital">
                <div class="order-hospital-name">{{ order.hospital }}</div>
                <div class="order-code">{{ order.code }}</div>
              </div>
              <span class="order-patient col-patient">{{ order.patient }}</span>
              <span class="delivery-tag col-delivery" :class="order.isPhysical ? 'delivery-tag--physical' : 'delivery-tag--virtual'">
                {{ order.isPhysical ? '实物' : '无实物' }}
              </span>
              <div class="progress-info col-progress">
                <div class="progress-bar-row">
                  <div class="progress-bar">
                    <div class="progress-bar-fill" :class="`progress-bar-fill--${order.stage}`" :style="{ width: order.progress + '%' }"></div>
                  </div>
                  <span class="progress-percent">{{ order.progress }}%</span>
                </div>
                <div class="progress-steps">
                  <span
                    v-for="(step, index) in order.totalSteps"
                    :key="index"
                    class="step-dot"
                    :class="{
                      'step-dot--done': index < order.currentStep,
                      'step-dot--active': index === order.currentStep
                    }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useUserInfo } from '@/stores/userInfo'
import DashboardHeader from './dashboardHeader.vue'

const userStore = useUserInfo()

// Stats
const stats = ref({
  myOrders: 286,
  pendingOrders: 18,
  designingOrders: 24,
  designCompleted: 15,
  producingOrders: 42,
  warehousedOrders: 168,
  cancelledOrders: 19
})

// Stat card config matching AdminDashboard style
const statCards = [
  { key: 'myOrders', label: '我的订单', value: 286, trend: 12.5, color: 'primary', icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/>' },
  { key: 'pendingOrders', label: '待处理订单', value: 18, trend: -5.2, color: 'orange', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
  { key: 'designingOrders', label: '设计中订单', value: 24, trend: 8.1, color: 'purple', icon: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>' },
  { key: 'designCompleted', label: '设计完成', value: 15, trend: 15.3, color: 'cyan', icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
  { key: 'producingOrders', label: '生产中订单', value: 42, trend: 6.8, color: 'blue', icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><circle cx="12" cy="14" r="2"/>' },
  { key: 'warehousedOrders', label: '已入库订单', value: 168, trend: 22.1, color: 'green', icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>' },
  { key: 'cancelledOrders', label: '已取消', value: 19, trend: -3.5, color: 'gray', icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' },
]

// Chart
const trendChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null

const trendOption = {
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    textStyle: { color: '#475569', fontSize: 12 },
  },
  legend: {
    data: ['订单趋势', '设计完成', '已出库'],
    top: 0,
    right: 0,
    itemWidth: 12,
    itemHeight: 8,
    textStyle: { color: '#64748b', fontSize: 11 },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: '30px',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#e2e8f0' } },
    axisLabel: { color: '#64748b', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#64748b', fontSize: 11 },
    splitLine: { lineStyle: { color: '#f1f5f9' } },
  },
  series: [
    {
      name: '订单趋势',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#a855f7', width: 3 },
      itemStyle: { color: '#a855f7' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(168, 85, 247, 0.2)' },
            { offset: 1, color: 'rgba(168, 85, 247, 0)' },
          ],
        },
      },
      data: [30, 45, 38, 60, 55, 72, 85],
    },
    {
      name: '设计完成',
      type: 'bar',
      barWidth: 12,
      itemStyle: { color: '#2f5bff', borderRadius: [4, 4, 0, 0] },
      data: [20, 35, 28, 48, 42, 55, 65],
    },
    {
      name: '已出库',
      type: 'bar',
      barWidth: 12,
      itemStyle: { color: '#d1fae5', borderRadius: [4, 4, 0, 0] },
      data: [15, 25, 20, 35, 30, 40, 50],
    },
  ],
}

function initChart() {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption(trendOption)
  }
}

function resizeChart() {
  trendChart?.resize()
}

// Orders
const orders = ref([
  { id: 1, hospital: '北京协和医院', code: 'ORD-2026-0892', patient: '张某某', isPhysical: true, progress: 65, stage: 'post', currentStep: 3, totalSteps: 6 },
  { id: 2, hospital: '上海华山医院', code: 'ORD-2026-0893', patient: '李某某', isPhysical: false, progress: 25, stage: 'print', currentStep: 1, totalSteps: 3 },
  { id: 3, hospital: '广州中山医院', code: 'ORD-2026-0894', patient: '王某某', isPhysical: true, progress: 78, stage: 'qc', currentStep: 4, totalSteps: 6 },
  { id: 4, hospital: '深圳北大医院', code: 'ORD-2026-0895', patient: '赵某某', isPhysical: true, progress: 45, stage: 'print', currentStep: 2, totalSteps: 6 },
  { id: 5, hospital: '成都华西医院', code: 'ORD-2026-0896', patient: '陈某某', isPhysical: false, progress: 10, stage: 'print', currentStep: 0, totalSteps: 3 },
  { id: 6, hospital: '武汉同济医院', code: 'ORD-2026-0897', patient: '刘某某', isPhysical: true, progress: 58, stage: 'post', currentStep: 3, totalSteps: 6 },
  { id: 7, hospital: '杭州邵逸夫医院', code: 'ORD-2026-0898', patient: '孙某某', isPhysical: true, progress: 92, stage: 'pack', currentStep: 5, totalSteps: 6 },
  { id: 8, hospital: '南京鼓楼医院', code: 'ORD-2026-0899', patient: '周某某', isPhysical: false, progress: 50, stage: 'print', currentStep: 1, totalSteps: 3 }
])

// Auto-scroll
const orderListBody = ref<HTMLElement | null>(null)
const isPaused = ref(false)
let scrollPos = 0
const scrollSpeed = 0.3
let scrollTimer: ReturnType<typeof setInterval>
let clockTimer: ReturnType<typeof setInterval> | undefined

// Loading and refresh
const loading = ref(false)
const refreshInterval = ref(300000)

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}

function handleTimeRangeChange() {
  // placeholder
}

function autoScroll() {
  if (!isPaused.value && orderListBody.value) {
    scrollPos += scrollSpeed
    const maxScroll = orderListBody.value.scrollHeight - orderListBody.value.clientHeight
    if (scrollPos >= maxScroll) scrollPos = 0
    orderListBody.value.scrollTop = scrollPos
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
  scrollTimer = setInterval(autoScroll, 50)
  loading.value = false
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  trendChart?.dispose()
  clearInterval(scrollTimer)
  clockTimer && clearInterval(clockTimer)
})
</script>

<style scoped>
.sales-dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.dashboard-main {
  flex: 1;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* Stats Section */
.stats-section {
  flex-shrink: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #dde3ec;
  transition: all 0.25s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.stat-card__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon svg {
  width: 20px;
  height: 20px;
}

.stat-card__body {
  flex: 1;
  min-width: 0;
}

.stat-card__label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}

.stat-card__value {
  font-size: 22px;
  font-weight: 800;
  font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
  color: #1e293b;
  line-height: 1.2;
  margin-top: 2px;
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  color: #2f5bff;
  flex-shrink: 0;
}

.stat-card__trend svg {
  width: 12px;
  height: 12px;
}

.stat-card__trend.negative {
  color: #ef4444;
}

/* Card Color Variants */
.stat-card--primary .stat-card__icon { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }
.stat-card--orange .stat-card__icon { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #ea580c; }
.stat-card--purple .stat-card__icon { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); color: #7c3aed; }
.stat-card--cyan .stat-card__icon { background: linear-gradient(135deg, #cffafe, #a5f3fc); color: #0891b2; }
.stat-card--blue .stat-card__icon { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }
.stat-card--green .stat-card__icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }
.stat-card--gray .stat-card__icon { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); color: #64748b; }

/* Charts Section */
.charts-section {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 0;
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #dde3ec;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-title svg {
  width: 18px;
  height: 18px;
  color: #2f5bff;
}

.chart-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.echarts-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

/* Order List */
.order-list-header {
  display: flex;
  padding: 10px 16px;
  background: #f8fafc;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  flex-shrink: 0;
  gap: 10px;
}

.col-hospital {
  flex: 2;
  min-width: 0;
}

.order-hospital-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-code {
  font-size: 10px;
  color: #94a3b8;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-patient,
.order-patient {
  flex: 0.6;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
}

.col-delivery,
.delivery-tag {
  flex:1;
  text-align: center;
  flex-shrink: 0;
  display: inline-flex;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 5px;
  justify-content: center;
}

.col-progress,
.progress-info {
  flex: 2;
  min-width: 0;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-list-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px;
  min-height: 0;
}

.order-list-body::-webkit-scrollbar {
  width: 4px;
}

.order-list-body::-webkit-scrollbar-track {
  background: transparent;
}

.order-list-body::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.order-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}

.order-row:last-child {
  border-bottom: none;
}

.order-row:hover {
  background: #f8fafc;
}

.progress-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-percent {
  font-size: 12px;
  font-weight: 700;
  color: #2f5bff;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
}

.progress-bar-fill--print {
  background: linear-gradient(90deg, #06b6d4, #0891b2);
}

.progress-bar-fill--post {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-bar-fill--qc {
  background: linear-gradient(90deg, #a855f7, #7c3aed);
}

.progress-bar-fill--pack {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-steps {
  display: flex;
  gap: 3px;
}

.step-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e2e8f0;
}

.step-dot--done {
  background: #2f5bff;
}

.step-dot--active {
  background: #2f5bff;
  box-shadow: 0 0 0 2px #dadff6;
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }

}

.stat-card:nth-child(1) { animation-delay: 0.05s; }
.stat-card:nth-child(2) { animation-delay: 0.1s; }
.stat-card:nth-child(3) { animation-delay: 0.15s; }
.stat-card:nth-child(4) { animation-delay: 0.2s; }
.stat-card:nth-child(5) { animation-delay: 0.25s; }
.stat-card:nth-child(6) { animation-delay: 0.3s; }
.stat-card:nth-child(7) { animation-delay: 0.35s; }

/* Responsive */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(4, 1fr);
  }
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
