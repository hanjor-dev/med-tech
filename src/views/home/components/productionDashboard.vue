<template>
  <div class="production-dashboard">
    <DashboardHeader
      title="生产管理看板"
      theme-color="#059669"
      :loading="loading"
      :refresh-interval="refreshInterval"
      @refresh="handleRefresh"
    />

    <main class="dashboard-main">
      <!-- Row 1: 统计卡片 -->
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
          <div class="stat-card__meta">
            <span class="stat-badge" :class="`stat-badge--${card.badgeColor}`">{{ card.badge }}</span>
          </div>
        </div>
      </div>

      <!-- Row 2: 生产进度 + 设备状态 -->
      <div class="charts-row row-2">
        <div class="chart-card flex-2">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
              生产进度监控
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
            <div class="production-stages">
              <div v-for="stage in productionStages" :key="stage.name" class="stage-item">
                <div class="stage-header">
                  <span class="stage-name">{{ stage.name }}</span>
                  <span class="stage-count">{{ stage.count }}</span>
                </div>
                <div class="stage-bar-bg">
                  <div class="stage-bar" :style="{ width: stage.percent + '%', background: stage.color }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-1">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                <rect x="9" y="9" width="6" height="6"/>
                <line x1="9" y1="1" x2="9" y2="4"/>
                <line x1="15" y1="1" x2="15" y2="4"/>
                <line x1="9" y1="20" x2="9" y2="23"/>
                <line x1="15" y1="20" x2="15" y2="23"/>
                <line x1="20" y1="9" x2="23" y2="9"/>
                <line x1="20" y1="14" x2="23" y2="14"/>
                <line x1="1" y1="9" x2="4" y2="9"/>
                <line x1="1" y1="14" x2="4" y2="14"/>
              </svg>
              设备状态
            </h3>
          </div>
          <div class="device-body">
            <div class="device-summary">
              <div class="device-stat" v-for="stat in deviceStats" :key="stat.label">
                <span class="device-dot" :style="{ background: stat.color }"></span>
                <span class="device-label">{{ stat.label }}</span>
                <span class="device-count">{{ stat.count }}</span>
              </div>
            </div>
            <div class="device-list">
              <div v-for="device in devices" :key="device.name" class="device-item">
                <span class="device-name">{{ device.name }}</span>
                <span class="device-status" :class="`status--${device.status}`">{{ device.statusText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: 工单列表 + 今日产出 -->
      <div class="charts-row row-3">
        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              进行中工单
            </h3>
            <span class="chart-subtitle">{{ workOrders.length }} 单</span>
          </div>
          <div class="workorder-list">
            <div v-for="order in workOrders" :key="order.id" class="workorder-item">
              <div class="workorder-info">
                <span class="workorder-code">{{ order.code }}</span>
                <span class="workorder-progress">{{ order.progress }}%</span>
              </div>
              <div class="workorder-bar-bg">
                <div class="workorder-bar" :style="{ width: order.progress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="20" x2="12" y2="10"/>
                <line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </svg>
              今日产出统计
            </h3>
          </div>
          <div class="output-body">
            <div class="output-item" v-for="item in outputStats" :key="item.label">
              <div class="output-icon" :style="{ background: item.bgColor }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.icon"></svg>
              </div>
              <div class="output-info">
                <span class="output-value">{{ item.value }}</span>
                <span class="output-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardHeader from './dashboardHeader.vue'

const loading = ref(false)
const refreshInterval = ref(300000)

const chartTabs = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
]
const activeTab = ref('today')

const stats = ref({
  printing: 42,
  postProcess: 28,
  qc: 15,
  completed: 86,
})

const statCards = computed(() => [
  {
    key: 'printing',
    label: '打印中',
    value: stats.value.printing,
    color: 'cyan',
    badge: '进行中',
    badgeColor: 'info',
    icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>',
    onClick: () => {},
  },
  {
    key: 'postProcess',
    label: '后处理中',
    value: stats.value.postProcess,
    color: 'purple',
    badge: '进行中',
    badgeColor: 'info',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4"/>',
    onClick: () => {},
  },
  {
    key: 'qc',
    label: '质检中',
    value: stats.value.qc,
    color: 'orange',
    badge: '待检',
    badgeColor: 'warning',
    icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    onClick: () => {},
  },
  {
    key: 'completed',
    label: '今日完成',
    value: stats.value.completed,
    color: 'green',
    badge: '+12',
    badgeColor: 'success',
    icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    onClick: () => {},
  },
])

const productionStages = ref([
  { name: '数据建模', count: 156, percent: 95, color: '#059669' },
  { name: '模型切片', count: 142, percent: 86, color: '#10b981' },
  { name: '3D打印', count: 98, percent: 60, color: '#06b6d4' },
  { name: '后处理', count: 72, percent: 44, color: '#3b82f6' },
  { name: '质量检验', count: 58, percent: 35, color: '#8b5cf6' },
])

const deviceStats = ref([
  { label: '运行中', count: 8, color: '#10b981' },
  { label: '空闲', count: 3, color: '#94a3b8' },
  { label: '故障', count: 1, color: '#ef4444' },
])

const devices = ref([
  { name: '打印机-01', status: 'online', statusText: '运行中' },
  { name: '打印机-02', status: 'online', statusText: '运行中' },
  { name: '打印机-03', status: 'idle', statusText: '空闲' },
  { name: '后处理-01', status: 'online', statusText: '运行中' },
  { name: '后处理-02', status: 'offline', statusText: '故障' },
])

const workOrders = ref([
  { id: '1', code: 'WO-2026-1562', progress: 85 },
  { id: '2', code: 'WO-2026-1563', progress: 72 },
  { id: '3', code: 'WO-2026-1564', progress: 58 },
  { id: '4', code: 'WO-2026-1565', progress: 35 },
  { id: '5', code: 'WO-2026-1566', progress: 22 },
])

const outputStats = ref([
  { label: '打印件数', value: 128, bgColor: '#dbeafe', icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4"/>' },
  { label: '合格件数', value: 125, bgColor: '#d1fae5', icon: '<polyline points="20 6 9 17 4 12"/>' },
  { label: '平均耗时', value: '4.2h', bgColor: '#fef3c7', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
])

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}
</script>

<style scoped>
.production-dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f4f8;
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, sans-serif;
}

.dashboard-main {
  flex: 1;
  padding: 0px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  min-height: 0;
}

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
}

.stat-card__value {
  font-size: 24px;
  font-weight: 800;
  font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
  color: #1e293b;
  line-height: 1.2;
  margin-top: 2px;
}

.stat-card__meta {
  flex-shrink: 0;
}

.stat-badge {
  display: inline-flex;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
}

.stat-badge--info { background: #dbeafe; color: #2563eb; }
.stat-badge--warning { background: #ffedd5; color: #ea580c; }
.stat-badge--success { background: #d1fae5; color: #059669; }

.stat-card--cyan .stat-card__icon { background: linear-gradient(135deg, #cffafe, #a5f3fc); color: #0891b2; }
.stat-card--purple .stat-card__icon { background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #7c3aed; }
.stat-card--orange .stat-card__icon { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #ea580c; }
.stat-card--green .stat-card__icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }

.charts-row {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}

.row-2 { flex-shrink: 0; min-height: 240px; }
.row-3 { flex-shrink: 0; min-height: 200px; }

.flex-2 { flex: 2; min-width: 0; }
.flex-1 { flex: 1; min-width: 0; }
.flex-equal { flex: 1; min-width: 0; }

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
  color: #059669;
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
  color: #059669;
  box-shadow: 0 1px 4px rgba(5, 150, 105, 0.2);
}

.chart-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  min-height: 0;
}

.production-stages {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stage-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-name {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.stage-count {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

.stage-bar-bg {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.stage-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.device-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.device-summary {
  display: flex;
  gap: 16px;
}

.device-stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.device-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.device-label {
  font-size: 11px;
  color: #64748b;
}

.device-count {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.device-name {
  font-size: 12px;
  color: #475569;
}

.device-status {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

.status--online { background: #d1fae5; color: #059669; }
.status--idle { background: #f1f5f9; color: #64748b; }
.status--offline { background: #fee2e2; color: #dc2626; }

.workorder-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.workorder-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.workorder-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workorder-code {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

.workorder-progress {
  font-size: 11px;
  font-weight: 700;
  color: #059669;
  font-family: 'JetBrains Mono', monospace;
}

.workorder-bar-bg {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.workorder-bar {
  height: 100%;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.output-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.output-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.output-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.output-icon svg {
  width: 22px;
  height: 22px;
  color: #475569;
}

.output-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.output-value {
  font-size: 20px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
}

.output-label {
  font-size: 11px;
  color: #64748b;
}

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .row-2, .row-3 { flex-direction: column; }
  .flex-2, .flex-1 { flex: none; }
}
</style>
