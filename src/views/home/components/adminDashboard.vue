<template>
  <div class="admin-dashboard">
    <DashboardHeader
      title="医 工 宝 数 据 看 板"
      theme-color="#3b82f6"
      :loading="loading"
      :refresh-interval="refreshInterval"
      @refresh="handleRefresh"
      @time-range-change="handleTimeRangeChange"
    />

    <main class="dashboard-main">
      <!-- Row 1: 4 个统计卡片 -->
      <div class="stats-row">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="stat-card"
          :class="`stat-card--${card.color}`"
          @click="card.onClick?.()"
        >
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="card.icon" />
          </div>
          <div class="stat-card__body">
            <div class="stat-card__label">{{ card.label }}</div>
            <div class="stat-card__value">{{ card.value.toLocaleString() }}</div>
          </div>
          <div class="stat-card__trend" :class="{ negative: card.trend < 0 }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline v-if="card.trend >= 0" points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline v-else points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            </svg>
            <span>{{ Math.abs(card.trend) }}%</span>
          </div>
        </div>
      </div>

      <!-- Row 2: 订单趋势 + 订单流程分布 -->
      <div class="charts-row row-2">
        <!-- 订单趋势 -->
        <div class="chart-card flex-2">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              订单趋势
            </h3>
            <div class="chart-tabs">
              <button
                v-for="tab in chartTabs"
                :key="tab.value"
                class="chart-tab"
                :class="{ active: activeTab === tab.value }"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div ref="trendChartRef" class="echarts-container"></div>
          </div>
        </div>

        <!-- 订单流程分布 -->
        <div class="chart-card flex-1">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              订单流程分布
            </h3>
          </div>
          <div class="flow-body">
            <div ref="donutChartRef" class="echarts-donut"></div>
            <div class="flow-legend">
              <div v-for="item in flowItems" :key="item.label" class="flow-item">
                <span class="flow-dot" :style="{ background: item.color }"></span>
                <span class="flow-label">{{ item.label }}</span>
                <span class="flow-value">{{ item.value }}</span>
                <span class="flow-pct">{{ item.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: 业务部门订单量排行 + 活跃机构订单量 -->
      <div class="charts-row row-3">
        <!-- 业务部门订单量排行 -->
        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              业务部门订单量排行
            </h3>
            <span class="chart-subtitle">TOP 5</span>
          </div>
          <div class="rank-body">
            <div v-for="(item, idx) in deptRanking" :key="item.name" class="rank-item">
              <span class="rank-num" :class="`rank-num--${idx + 1}`">{{ idx + 1 }}</span>
              <div class="rank-info">
                <span class="rank-name">{{ item.name }}</span>
                <div class="rank-bar-bg">
                  <div class="rank-bar" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
              </div>
              <span class="rank-value">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- 活跃机构订单量 -->
        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              活跃机构订单量
            </h3>
            <span class="chart-subtitle">TOP 5</span>
          </div>
          <div class="rank-body">
            <div v-for="(item, idx) in orgRanking" :key="item.name" class="rank-item">
              <span class="rank-num" :class="`rank-num--${idx + 1}`">{{ idx + 1 }}</span>
              <div class="rank-info">
                <span class="rank-name">{{ item.name }}</span>
                <div class="rank-bar-bg">
                  <div class="rank-bar" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
              </div>
              <span class="rank-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import DashboardHeader from './dashboardHeader.vue'

// ── Stats ──
const stats = ref({
  totalOrders: 1285,
  inProgress: 318,
  completed: 902,
  canceled: 65,
})

const statCards = computed(() => [
  {
    key: 'total',
    label: '订单总数',
    value: stats.value.totalOrders,
    trend: 12.5,
    color: 'primary',
    icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    onClick: () => {},
  },
  {
    key: 'inProgress',
    label: '进行中订单',
    value: stats.value.inProgress,
    trend: 8.3,
    color: 'orange',
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    onClick: () => {},
  },
  {
    key: 'completed',
    label: '已完成订单',
    value: stats.value.completed,
    trend: 15.2,
    color: 'green',
    icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    onClick: () => {},
  },
  {
    key: 'canceled',
    label: '已取消订单',
    value: stats.value.canceled,
    trend: -3.1,
    color: 'red',
    icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    onClick: () => {},
  },
])

const flowItems = [
  { label: '待接单', value: 50, pct: 20, color: '#6366f1' },
  { label: '设计中', value: 95, pct: 15, color: '#f472b6' },
  { label: '生产中', value: 118, pct: 12, color: '#fb923c' },
  { label: '已完成', value: 902, pct: 45, color: '#34d399' },
  { label: '已取消', value: 65, pct: 8, color: '#a78bfa' },
]

const deptRanking = [
  { name: '销售一部', value: 385, pct: 100, color: '#6366f1' },
  { name: '销售二部', value: 298, pct: 77, color: '#f472b6' },
  { name: '销售三部', value: 246, pct: 64, color: '#fb923c' },
  { name: '大客户部', value: 201, pct: 52, color: '#34d399' },
  { name: '渠道合作部', value: 155, pct: 40, color: '#a78bfa' },
]

const orgRanking = [
  { name: '北京协和医院', value: 156, pct: 100, color: '#6366f1' },
  { name: '上海华山医院', value: 132, pct: 85, color: '#f472b6' },
  { name: '广州中山医院', value: 118, pct: 76, color: '#fb923c' },
  { name: '深圳北大医院', value: 95, pct: 61, color: '#34d399' },
  { name: '成都华西医院', value: 82, pct: 53, color: '#a78bfa' },
]

const loading = ref(false)
const refreshInterval = ref(300000)

const chartTabs = [
  { label: '同比', value: 'yoy' },
  { label: '环比', value: 'mom' },
  { label: '趋势', value: 'trend' },
]
const activeTab = ref('yoy')

// ── ECharts 实例 ──
let trendChart: echarts.ECharts | null = null
let donutChart: echarts.ECharts | null = null
const trendChartRef = ref<HTMLDivElement | null>(null)
const donutChartRef = ref<HTMLDivElement | null>(null)

// 订单趋势图表配置
const trendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    textStyle: { color: '#475569', fontSize: 12 },
  },
  legend: {
    data: ['今年', '去年'],
    top: 0,
    textStyle: { color: '#64748b', fontSize: 11 },
  },
  grid: {
    left: 40,
    right: 20,
    top: 40,
    bottom: 30,
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    axisLine: { lineStyle: { color: '#e2e8f0' } },
    axisLabel: { color: '#94a3b8', fontSize: 10 },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 10 },
    splitLine: { lineStyle: { color: '#f1f5f9' } },
  },
  series: [
    {
      name: '今年',
      type: 'bar',
      data: [120, 150, 180, 220, 260, 320],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#6366f1' },
          { offset: 1, color: '#8b5cf6' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '35%',
    },
    {
      name: '去年',
      type: 'bar',
      data: [80, 110, 140, 170, 190, 220],
      itemStyle: {
        color: 'rgba(148, 163, 184, 0.4)',
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '35%',
    },
  ],
}))

// 订单流程分布饼图配置
const donutOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    textStyle: { color: '#475569', fontSize: 12 },
    formatter: '{b}: {c} ({d}%)',
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      labelLine: { show: false },
      data: flowItems.map((item) => ({
        name: item.label,
        value: item.value,
        itemStyle: { color: item.color },
      })),
    },
  ],
}))

function initCharts() {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption(trendOption.value)
  }
  if (donutChartRef.value) {
    donutChart = echarts.init(donutChartRef.value)
    donutChart.setOption(donutOption.value)
  }
}

function resizeCharts() {
  trendChart?.resize()
  donutChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose()
  donutChart?.dispose()
})

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}

function handleTimeRangeChange() {
  // placeholder
}
</script>

<style scoped>
/* ── 基底 ── */
.admin-dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f4f8;
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, sans-serif;
}

/* ── 主内容 ── */
.dashboard-main {
  flex: 1;
  padding: 0px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  min-height: 0;
}

/* ── Row 1: 统计卡片 ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #dde3ec;
  transition: all 0.25s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon svg {
  width: 22px;
  height: 22px;
}

.stat-card__body {
  flex: 1;
  min-width: 0;
}

.stat-card__label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}

.stat-card__value {
  font-size: 24px;
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
  color: #3b82f6;
  flex-shrink: 0;
}

.stat-card__trend svg {
  width: 13px;
  height: 13px;
}

.stat-card__trend.negative {
  color: #ef4444;
}

/* 颜色主题 */
.stat-card--primary .stat-card__icon { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }

.stat-card--orange .stat-card__icon { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #ea580c; }

.stat-card--green .stat-card__icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }

.stat-card--red .stat-card__icon { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #dc2626; }

/* ── Row 2 & 3: 图表行 ── */
.charts-row {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}

.row-2 { flex-shrink: 0; min-height: 290px; }
.row-3 { flex-shrink: 0; }

.flex-2 { flex: 2; min-width: 0; }
.flex-1 { flex: 1; min-width: 0; }
.flex-equal { flex: 1; min-width: 0; }

/* ── 图表卡片通用 ── */
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
  color: #3b82f6;
}

.chart-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
}

.chart-tabs {
  display: flex;
  gap: 2px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 7px;
}

.chart-tab {
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-tab.active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
}

/* ── 图表体 ── */
.chart-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  min-height: 0;
}

.echarts-container {
  width: 100%;
  height: 100%;
  min-height: 140px;
}

/* ── 订单流程分布 ── */
.flow-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 18px;
}

.echarts-donut {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.flow-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.flow-label {
  font-size: 12px;
  color: #475569;
  flex: 1;
  white-space: nowrap;
}

.flow-value {
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
}

.flow-pct {
  font-size: 11px;
  color: #94a3b8;
  width: 32px;
  text-align: right;
}

/* ── 排行 ── */
.rank-body {
  flex: 1;
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-num {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}

.rank-num--1 { background: #3b82f6; color: #fff; }
.rank-num--2 { background: #0ea5e9; color: #fff; }
.rank-num--3 { background: #06b6d4; color: #fff; }
.rank-num--4 { background: #14b8a6; color: #fff; }
.rank-num--5 { background: #22d3ee; color: #fff; }

.rank-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rank-name {
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-bar-bg {
  width: 100%;
  height: 6px;
  background: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.rank-value {
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
}

/* ── Responsive ── */
@media (max-width: 1400px) {
  .flow-body { gap: 12px; }
}

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .row-2, .row-3 { flex-direction: column; }
  .flex-2, .flex-1 { flex: none; }
  .chart-card { min-height: 260px; }
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .flow-body { flex-direction: column; }
}
</style>
