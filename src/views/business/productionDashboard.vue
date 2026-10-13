<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

/* ── Types ─────────────────────────────────────────────────── */
interface ProcessStep {
  name: string
  icon: string
  iconClass: string
  barClass: string
  count: number
  percentage: number
}

interface Device {
  name: string
  status: 'busy' | 'online' | 'offline' | 'idle'
  task: string
}

interface Center {
  name: string
  status: 'online' | 'warning' | 'error'
  devices: Device[]
  alerts?: string[]
}

interface WorkOrder {
  id: string
  urgent: boolean
  status: string
  progress: string
  statusClass: string
}

interface DayCapacity {
  label: string
  value: number
  height: number
  gradient: string
}

/* ── Time tabs ─────────────────────────────────────────────── */
const activeTab = ref('week')
const timeTabs = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
]

/* ── Clock ─────────────────────────────────────────────────── */
const currentTime = ref('')
const currentDate = ref('')

const updateClock = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`

  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  currentDate.value = `${year}年${month}月${day}日`
}

let clockTimer: ReturnType<typeof setInterval> | null = null

/* ── Stats ─────────────────────────────────────────────────── */
const stats = reactive({
  totalOrders: 1286,
  urgentOrders: 23,
  totalProducts: 3842,
  completionRate: 98.6,
  changes: {
    totalOrders: 12.5,
    urgentOrders: -8.2,
    totalProducts: 15.3,
    completionRate: 2.1,
  },
})

/* ── Today stats ───────────────────────────────────────────── */
const todayStats = reactive({
  todayOrders: 156,
  completed: 142,
  inProgress: 12,
  urgent: 2,
  changes: {
    todayOrders: 12,
    completed: 8,
    inProgress: -3,
    urgent: -1,
  },
})

/* ── Process flow ──────────────────────────────────────────── */
const processSteps = reactive<ProcessStep[]>([
  { name: '待打印', icon: '⬡', iconClass: 'printing', barClass: 'blue', count: 128, percentage: 45 },
  { name: '打印中', icon: '⬢', iconClass: 'printing', barClass: 'blue', count: 86, percentage: 32 },
  { name: '后处理中', icon: '◇', iconClass: 'post', barClass: 'yellow', count: 52, percentage: 68 },
  { name: '质检中', icon: '◈', iconClass: 'qc', barClass: 'purple', count: 34, percentage: 55 },
  { name: '包装中', icon: '◆', iconClass: 'pack', barClass: 'green', count: 18, percentage: 28 },
  { name: '入库完成', icon: '⬟', iconClass: 'storage', barClass: 'cyan', count: 968, percentage: 92 },
])

/* ── Daily capacity ────────────────────────────────────────── */
const dayCapacity = reactive<DayCapacity[]>([
  { label: '周一', value: 86, height: 50, gradient: 'blue' },
  { label: '周二', value: 124, height: 72, gradient: 'cyan' },
  { label: '周三', value: 98, height: 58, gradient: 'blue' },
  { label: '周四', value: 156, height: 90, gradient: 'cyan' },
  { label: '周五', value: 142, height: 82, gradient: 'blue' },
  { label: '周六', value: 68, height: 40, gradient: 'purple' },
  { label: '周日', value: 42, height: 26, gradient: 'purple' },
])

/* ── Device centers ─────────────────────────────────────────── */
const centers = reactive<Center[]>([
  {
    name: '北京中心',
    status: 'online',
    devices: [
      { name: 'Printer-BJ-01', status: 'busy', task: '批次#0892' },
      { name: 'Printer-BJ-02', status: 'online', task: '空闲' },
      { name: 'Printer-BJ-03', status: 'online', task: '预热中' },
    ],
    alerts: ['Printer-BJ-02 材料余量不足'],
  },
  {
    name: '上海中心',
    status: 'warning',
    devices: [
      { name: 'Printer-SH-01', status: 'busy', task: '批次#0894' },
      { name: 'Printer-SH-02', status: 'busy', task: '批次#0895' },
      { name: 'Printer-SH-03', status: 'offline', task: '维护中' },
    ],
    alerts: ['Printer-SH-03 累计工作超500h'],
  },
  {
    name: '广州中心',
    status: 'online',
    devices: [
      { name: 'Printer-GZ-01', status: 'online', task: '空闲' },
      { name: 'Printer-GZ-02', status: 'busy', task: '批次#0896' },
    ],
  },
  {
    name: '深圳中心',
    status: 'online',
    devices: [
      { name: 'Printer-SZ-01', status: 'busy', task: '批次#0897' },
      { name: 'Printer-SZ-02', status: 'online', task: '空闲' },
      { name: 'Printer-SZ-03', status: 'online', task: '空闲' },
    ],
  },
  {
    name: '成都中心',
    status: 'online',
    devices: [
      { name: 'Printer-CD-01', status: 'busy', task: '批次#0898' },
      { name: 'Printer-CD-02', status: 'online', task: '空闲' },
    ],
  },
  {
    name: '武汉中心',
    status: 'error',
    devices: [
      { name: 'Printer-WH-01', status: 'offline', task: '通讯中断' },
      { name: 'Printer-WH-02', status: 'idle', task: '待机' },
    ],
    alerts: ['Printer-WH-01 通讯异常', '3个紧急工单积压'],
  },
  {
    name: '杭州中心',
    status: 'online',
    devices: [
      { name: 'Printer-HZ-01', status: 'busy', task: '批次#0899' },
      { name: 'Printer-HZ-02', status: 'busy', task: '批次#0900' },
    ],
  },
  {
    name: '西安中心',
    status: 'online',
    devices: [
      { name: 'Printer-XA-01', status: 'online', task: '空闲' },
      { name: 'Printer-XA-02', status: 'busy', task: '批次#0901' },
    ],
  },
])

/* ── Device summary ─────────────────────────────────────────── */
const deviceSummary = reactive({
  online: 28,
  running: 18,
  offline: 3,
})

/* ── Order type distribution ───────────────────────────────── */
const orderDistribution = reactive({
  total: 1286,
  medical: 62,
  nonMedical: 38,
})

/* ── Core metrics ──────────────────────────────────────────── */
const coreMetrics = reactive([
  { label: '平均时长', value: '4.2h', color: 'cyan' },
  { label: '合格率', value: '96.8%', color: 'green' },
  { label: '交付周期', value: '2.1d', color: 'purple' },
  { label: '利用率', value: '99.2%', color: 'blue' },
])

/* ── Work orders ───────────────────────────────────────────── */
const workOrders = reactive<WorkOrder[]>([
  { id: 'FLOW-20260601001', urgent: true, status: '打印中 45%', progress: '45%', statusClass: 'blue' },
  { id: 'FLOW-20260601002', urgent: false, status: '后处理 72%', progress: '72%', statusClass: 'yellow' },
  { id: 'FLOW-20260601003', urgent: true, status: '质检 88%', progress: '88%', statusClass: 'purple' },
  { id: 'FLOW-20260601004', urgent: false, status: '包装 95%', progress: '95%', statusClass: 'green' },
  { id: 'FLOW-20260601005', urgent: false, status: '已完成', progress: '100%', statusClass: 'cyan' },
  { id: 'FLOW-20260601006', urgent: false, status: '待打印', progress: '0%', statusClass: 'blue' },
  { id: 'FLOW-20260601007', urgent: false, status: '后处理 35%', progress: '35%', statusClass: 'yellow' },
  { id: 'FLOW-20260601008', urgent: false, status: '质检 62%', progress: '62%', statusClass: 'purple' },
  { id: 'FLOW-20260601009', urgent: false, status: '打印中 28%', progress: '28%', statusClass: 'blue' },
  { id: 'FLOW-20260601010', urgent: true, status: '包装 78%', progress: '78%', statusClass: 'green' },
])

/* ── Lifecycle ─────────────────────────────────────────────── */
onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

/* ── Tab handler ────────────────────────────────────────────── */
const selectTab = (key: string) => {
  activeTab.value = key
}
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-bg" />
    <div class="grid-lines" />

    <div class="dashboard-container">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <div class="logo">CT</div>
          <div class="header-title">
            <h1>生产监控中心</h1>
            <p>CTSS PRODUCTION MONITORING CENTER</p>
          </div>
        </div>

        <div class="header-center">
          <button
            v-for="tab in timeTabs"
            :key="tab.key"
            class="time-tab"
            :class="{ active: activeTab === tab.key }"
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="header-right">
          <div class="live-indicator">
            <span class="live-dot" />
            <span class="live-text">实时监控</span>
          </div>
          <div class="time-display">
            <div class="current-time">{{ currentTime }}</div>
            <div class="current-date">{{ currentDate }}</div>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <div class="main-content">
        <!-- Left panel -->
        <div class="left-panel">
          <!-- Production overview -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span class="card-title-icon" />
                生产概览
              </div>
              <span class="card-badge">实时</span>
            </div>
            <div class="stat-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalOrders.toLocaleString() }}</div>
                <div class="stat-label">工单总数</div>
                <div class="stat-change up">
                  <span>↑</span> {{ stats.changes.totalOrders }}%
                </div>
              </div>
              <div class="stat-item urgent">
                <div class="stat-value">{{ stats.urgentOrders }}</div>
                <div class="stat-label">紧急工单</div>
                <div class="stat-change down">
                  <span>↓</span> {{ Math.abs(stats.changes.urgentOrders) }}%
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalProducts.toLocaleString() }}</div>
                <div class="stat-label">产品总数</div>
                <div class="stat-change up">
                  <span>↑</span> {{ stats.changes.totalProducts }}%
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.completionRate }}%</div>
                <div class="stat-label">完成率</div>
                <div class="stat-change up">
                  <span>↑</span> {{ stats.changes.completionRate }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Process distribution -->
          <div class="card process-card">
            <div class="card-header">
              <div class="card-title">
                <span class="card-title-icon" />
                工序分布
              </div>
            </div>
            <div class="process-flow">
              <div v-for="step in processSteps" :key="step.name" class="process-step">
                <div class="process-icon-wrap" :class="step.iconClass">{{ step.icon }}</div>
                <div class="process-info">
                  <div class="process-name">{{ step.name }}</div>
                  <div class="process-count">{{ step.count }} 工单</div>
                  <div class="process-bar-wrap">
                    <div class="process-bar" :class="step.barClass" :style="{ width: step.percentage + '%' }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center panel -->
        <div class="center-panel">
          <!-- Chart row -->
          <div class="chart-row">
            <!-- Today overview -->
            <div class="card chart-card">
              <div class="card-header">
                <div class="card-title">
                  <span class="card-title-icon" />
                  今日概况
                </div>
                <span class="card-badge">实时</span>
              </div>
              <div class="stat-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ todayStats.todayOrders }}</div>
                  <div class="stat-label">今日工单</div>
                  <div class="stat-change up"><span>↑</span> {{ todayStats.changes.todayOrders }}%</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ todayStats.completed }}</div>
                  <div class="stat-label">已完成</div>
                  <div class="stat-change up"><span>↑</span> {{ todayStats.changes.completed }}%</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ todayStats.inProgress }}</div>
                  <div class="stat-label">进行中</div>
                  <div class="stat-change down"><span>↓</span> {{ Math.abs(todayStats.changes.inProgress) }}%</div>
                </div>
                <div class="stat-item urgent">
                  <div class="stat-value">{{ todayStats.urgent }}</div>
                  <div class="stat-label">紧急工单</div>
                  <div class="stat-change down"><span>↓</span> {{ Math.abs(todayStats.changes.urgent) }}</div>
                </div>
              </div>
            </div>

            <!-- Daily capacity -->
            <div class="card chart-card">
              <div class="card-header">
                <div class="card-title">
                  <span class="card-title-icon" />
                  每日产能趋势
                </div>
              </div>
              <div class="chart-container">
                <div class="bar-chart">
                  <div v-for="day in dayCapacity" :key="day.label" class="bar-item">
                    <div
                      class="bar"
                      :class="day.gradient"
                      :style="{ height: day.height + 'px' }"
                      :data-value="day.value"
                    />
                    <span class="bar-label">{{ day.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- National device status -->
          <div class="card device-card">
            <div class="card-header">
              <div class="card-title">
                <span class="card-title-icon" />
                全国设备状态
              </div>
              <div class="device-summary">
                <span class="summary-item online">在线 {{ deviceSummary.online }}</span>
                <span class="summary-item running">运行 {{ deviceSummary.running }}</span>
                <span class="summary-item offline">离线 {{ deviceSummary.offline }}</span>
              </div>
            </div>

            <div class="device-center-grid">
              <div v-for="center in centers" :key="center.name" class="device-center-card">
                <div class="device-center-header">
                  <span class="device-center-name">{{ center.name }}</span>
                  <span class="device-center-badge" :class="center.status">
                    {{ center.status === 'online' ? '正常' : center.status === 'warning' ? '告警' : '故障' }}
                  </span>
                </div>
                <div class="device-center-devices">
                  <div v-for="device in center.devices" :key="device.name" class="device-row">
                    <span class="device-row-status" :class="device.status" />
                    <span class="device-row-name">{{ device.name }}</span>
                    <span class="device-row-task">{{ device.task }}</span>
                  </div>
                </div>
                <div v-if="center.alerts && center.alerts.length > 0" class="center-alerts">
                  <div class="center-alert-title">!</div>
                  <div v-for="(alert, idx) in center.alerts" :key="idx" class="center-alert-item">
                    <span>!</span>
                    <span>{{ alert }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="right-panel">
          <!-- Order type distribution -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span class="card-title-icon" />
                订单类型分布
              </div>
            </div>
            <div class="chart-container">
              <div class="donut-chart">
                <svg width="150" height="150" viewBox="0 0 180 180" class="donut-svg">
                  <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(59,130,246,0.08)" stroke-width="20" />
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="url(#grad1)"
                    stroke-width="20"
                    stroke-dasharray="220 220"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="url(#grad2)"
                    stroke-width="20"
                    stroke-dasharray="110 330"
                    stroke-dashoffset="-220"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="url(#grad3)"
                    stroke-width="20"
                    stroke-dasharray="55 385"
                    stroke-dashoffset="-330"
                    stroke-linecap="round"
                  />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#3b82f6" />
                      <stop offset="100%" style="stop-color:#06b6d4" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#8b5cf6" />
                      <stop offset="100%" style="stop-color:#a78bfa" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#10b981" />
                      <stop offset="100%" style="stop-color:#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="donut-center">
                  <div class="donut-value">{{ orderDistribution.total.toLocaleString() }}</div>
                  <div class="donut-label">总订单</div>
                </div>
              </div>
              <div class="donut-legend">
                <div class="legend-item">
                  <span class="legend-dot medical" />
                  <span class="legend-text">医疗器械 {{ orderDistribution.medical }}%</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot non-medical" />
                  <span class="legend-text">非医疗器械 {{ orderDistribution.nonMedical }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Core metrics -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span class="card-title-icon" />
                核心指标
              </div>
            </div>
            <div class="metrics-grid">
              <div v-for="metric in coreMetrics" :key="metric.label" class="metric-item">
                <div class="metric-value" :class="metric.color">{{ metric.value }}</div>
                <div class="metric-label">{{ metric.label }}</div>
              </div>
            </div>
          </div>

          <!-- Real-time work orders -->
          <div class="card workorder-card">
            <div class="card-header">
              <div class="card-title">
                <span class="card-title-icon" />
                实时工单
              </div>
              <span class="card-badge">最新10条</span>
            </div>
            <div class="workorder-list">
              <div
                v-for="order in workOrders"
                :key="order.id"
                class="workorder-item"
                :class="{ urgent: order.urgent }"
              >
                <span v-if="order.urgent" class="urgent-tag">加急</span>
                <span class="workorder-id">{{ order.id }}</span>
                <span class="workorder-status" :class="order.statusClass">{{ order.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fonts */
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap');

/* Variables */
.dashboard-page {
  --bg-primary: #f0f4f8;
  --bg-secondary: #e2e8f0;
  --bg-card: rgba(255, 255, 255, 0.95);
  --border-color: rgba(59, 130, 246, 0.2);
  --accent-blue: #2563eb;
  --accent-cyan: #0891b2;
  --accent-purple: #7c3aed;
  --accent-green: #059669;
  --accent-yellow: #d97706;
  --accent-orange: #ea580c;
  --accent-red: #dc2626;
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --glow-blue: rgba(59, 130, 246, 0.2);
  --glow-cyan: rgba(6, 182, 212, 0.2);
}

/* Background */
.dashboard-page {
  width: 100%;
  max-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dashboard-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 15% 15%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 85%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 60%),
    linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%);
  z-index: -1;
}

.dashboard-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.02) 1px, transparent 0);
  background-size: 40px 40px;
}

.grid-lines {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
  z-index: -1;
}

/* Container */
.dashboard-container {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 100vh;
}

/* Header */
.header {
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  position: relative;
  flex-shrink: 0;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan), var(--accent-purple));
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 0 20px var(--glow-blue);
}

.header-title h1 {
  font-family: 'Rajdhani', sans-serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-title p {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 0.15em;
}

.header-center {
  display: flex;
  gap: 8px;
}

.time-tab {
  padding: 8px 22px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-tab.active {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
  border-color: transparent;
  color: white;
  box-shadow: 0 0 15px var(--glow-blue);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 16px;
}

.live-dot {
  width: 7px;
  height: 7px;
  background: var(--accent-red);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.live-text {
  font-size: 11px;
  color: var(--accent-red);
  font-weight: 500;
}

.time-display {
  text-align: right;
}

.current-time {
  font-family: 'Rajdhani', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.current-date {
  font-size: 11px;
  color: var(--text-muted);
}

/* Main content */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 2fr 1fr;
  gap: 16px;
  min-height: 0;
}

/* Left panel */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

/* Card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.card-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title-icon {
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, var(--accent-blue), var(--accent-cyan));
  border-radius: 2px;
}

.card-badge {
  font-size: 12px;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--accent-blue);
}

/* Stat grid */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 10px;
  padding: 16px 12px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.stat-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent-blue);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.12);
}

.stat-item.urgent {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.2);
}

.stat-item.urgent:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--accent-red);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.15);
}

.stat-value {
  font-family: 'Rajdhani', sans-serif;
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-item.urgent .stat-value {
  background: linear-gradient(135deg, var(--accent-red), var(--accent-orange));
  -webkit-background-clip: text;
  background-clip: text;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.stat-change {
  font-size: 12px;
  margin-top: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.stat-change.up {
  color: var(--accent-green);
}

.stat-change.down {
  color: var(--accent-red);
}

/* Process flow */
.process-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.process-flow {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.process-step {
  display: flex;
  align-items: center;
  gap: 10px;
}

.process-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.process-icon-wrap.printing {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: var(--accent-blue);
}

.process-icon-wrap.post {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08));
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: var(--accent-yellow);
}

.process-icon-wrap.qc {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(139, 92, 246, 0.25);
  color: var(--accent-purple);
}

.process-icon-wrap.pack {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.08));
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: var(--accent-green);
}

.process-icon-wrap.storage {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.08));
  border: 1px solid rgba(6, 182, 212, 0.25);
  color: var(--accent-cyan);
}

.process-info {
  flex: 1;
  min-width: 0;
}

.process-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.process-count {
  font-size: 11px;
  color: var(--text-muted);
}

.process-bar-wrap {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 6px;
}

.process-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 1s ease;
  position: relative;
}

.process-bar::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 15px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25));
}

.process-bar.blue {
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
}

.process-bar.yellow {
  background: linear-gradient(90deg, var(--accent-yellow), var(--accent-orange));
}

.process-bar.purple {
  background: linear-gradient(90deg, var(--accent-purple), #a78bfa);
}

.process-bar.green {
  background: linear-gradient(90deg, var(--accent-green), #34d399);
}

.process-bar.cyan {
  background: linear-gradient(90deg, var(--accent-cyan), #22d3ee);
}

/* Center panel */
.center-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex-shrink: 0;
}

.chart-card {
  height: 315px;
}

.chart-container {
  height: calc(100% - 50px);
  position: relative;
}

/* Bar chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding: 10px 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar {
  width: 28px;
  border-radius: 3px 3px 0 0;
  position: relative;
}

.bar::before {
  content: attr(data-value);
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.bar.blue {
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
}

.bar.cyan {
  background: linear-gradient(180deg, #06b6d4, #0891b2);
}

.bar.purple {
  background: linear-gradient(180deg, #8b5cf6, #7c3aed);
}

.bar-label {
  font-size: 11px;
  color: var(--text-muted);
}

/* Device card */
.device-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.device-summary {
  display: flex;
  gap: 10px;
}

.summary-item {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 500;
}

.summary-item.online {
  background: rgba(16, 185, 129, 0.1);
  color: var(--accent-green);
}

.summary-item.running {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-yellow);
}

.summary-item.offline {
  background: rgba(239, 68, 68, 0.1);
  color: var(--accent-red);
}

.device-center-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
}

.device-center-card {
  background: rgba(59, 130, 246, 0.03);
  border: 1px solid rgba(59, 130, 246, 0.08);
  border-radius: 8px;
  padding: 12px;
}

.device-center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.device-center-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.device-center-badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.device-center-badge.online {
  background: rgba(16, 185, 129, 0.12);
  color: var(--accent-green);
}

.device-center-badge.warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--accent-yellow);
}

.device-center-badge.error {
  background: rgba(239, 68, 68, 0.12);
  color: var(--accent-red);
}

.device-center-devices {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.device-row-status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.device-row-status.online {
  background: var(--accent-green);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}

.device-row-status.busy {
  background: var(--accent-yellow);
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
  animation: pulse 1.5s infinite;
}

.device-row-status.offline {
  background: var(--accent-red);
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
}

.device-row-status.idle {
  background: var(--text-muted);
}

.device-row-name {
  flex: 1;
  color: var(--text-secondary);
}

.device-row-task {
  color: var(--text-muted);
  font-size: 10px;
}

.center-alerts {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
}

.center-alert-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--accent-red);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.center-alert-title::before {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 3px;
  font-size: 10px;
}

.center-alert-item {
  font-size: 10px;
  color: var(--text-muted);
  padding: 4px 0;
  display: flex;
  gap: 6px;
}

.center-alert-item span:first-child {
  color: var(--accent-yellow);
}

/* Right panel */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

/* Donut chart */
.donut-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.donut-svg {
  transform: rotate(-90deg);
}

.donut-center {
  position: absolute;
  text-align: center;
}

.donut-value {
  font-family: 'Rajdhani', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.donut-label {
  font-size: 11px;
  color: var(--text-muted);
}

.donut-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-dot.medical {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
}

.legend-dot.non-medical {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.legend-text {
  font-size: 11px;
  color: var(--text-muted);
}

/* Metrics grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric-item {
  text-align: center;
  padding: 10px 6px;
  background: rgba(59, 130, 246, 0.04);
  border-radius: 8px;
}

.metric-value {
  font-family: 'Rajdhani', sans-serif;
  font-size: 24px;
  font-weight: 700;
}

.metric-value.blue {
  color: var(--accent-blue);
}

.metric-value.cyan {
  color: var(--accent-cyan);
}

.metric-value.green {
  color: var(--accent-green);
}

.metric-value.purple {
  color: var(--accent-purple);
}

.metric-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}

/* Workorder card */
.workorder-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.workorder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.workorder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 8px;
}

.workorder-item.urgent {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

.urgent-tag {
  font-size: 11px;
  padding: 3px 6px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 4px;
  color: var(--accent-red);
  font-weight: 600;
}

.workorder-id {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.workorder-status {
  font-size: 12px;
  font-weight: 500;
}

.workorder-status.blue {
  color: var(--accent-blue);
}

.workorder-status.yellow {
  color: var(--accent-yellow);
}

.workorder-status.purple {
  color: var(--accent-purple);
}

.workorder-status.green {
  color: var(--accent-green);
}

.workorder-status.cyan {
  color: var(--accent-cyan);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.25);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.4);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.6s ease forwards;
}

.left-panel .card:nth-child(1) {
  animation-delay: 0.1s;
}

.left-panel .card:nth-child(2) {
  animation-delay: 0.2s;
}

.center-panel .card:nth-child(1) {
  animation-delay: 0.3s;
}

.center-panel .card:nth-child(2) {
  animation-delay: 0.4s;
}

.right-panel .card:nth-child(1) {
  animation-delay: 0.2s;
}

.right-panel .card:nth-child(2) {
  animation-delay: 0.3s;
}

.right-panel .card:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
