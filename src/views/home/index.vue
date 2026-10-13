<template>
  <div class="screen">
    <!-- 背景网格 -->
    <div class="bg-grid" />
    <!-- 扫描线 -->
    <div class="scan-line" />

    <!-- 顶部标题栏 -->
    <header class="screen-header">
      <div class="header-side">
        <div class="status-dot" /><span class="header-time">{{ currentTime }}</span>
        <span class="refresh-label">刷新频率</span>
        <el-select v-model="refreshInterval" size="small" class="refresh-select" @change="handleRefreshIntervalChange">
          <el-option label="15秒" :value="15000" />
          <el-option label="30秒" :value="30000" />
          <el-option label="1分钟" :value="60000" />
          <el-option label="3分钟" :value="180000" />
          <el-option label="5分钟" :value="300000" />
        </el-select>
      </div>
      <div class="header-center">
        <div class="title-deco left" />
        <h1 class="header-title">医 工 宝 数 据 看 板</h1>
        <div class="title-deco right" />
      </div>
      <div class="header-side header-right">
        <div class="time-range-wrapper">
          <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
            <el-radio-button value="today">今日</el-radio-button>
            <el-radio-button value="week">本周</el-radio-button>
            <el-radio-button value="month">本月</el-radio-button>
            <el-radio-button value="quarter">本季度</el-radio-button>
            <el-radio-button value="year">本年</el-radio-button>
            <el-radio-button value="custom">自定义</el-radio-button>
          </el-radio-group>
          <transition name="date-picker-fade">
            <div v-if="timeRange === 'custom'" class="date-picker-dropdown">
              <el-date-picker
                v-model="customDateRange"
                type="daterange"
                size="small"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                :clearable="false"
                @change="handleCustomDateChange"
                class="custom-date-picker"
              />
            </div>
          </transition>
        </div>
        <el-button :icon="Refresh" :loading="loading" circle size="small" class="refresh-btn" @click="load" />
        <el-button :icon="isFullscreen ? Aim : FullScreen" circle size="small" class="refresh-btn" @click="toggleFullscreen" />
      </div>
    </header>

    <!-- 数据卡片行 -->
    <div class="cards-row">
      <div v-for="card in data.cards" :key="card.key" class="stat-card" @click="card.link && $router.push(card.link)">
        <div class="stat-label">{{ card.title }}</div>
        <div class="stat-value">
          {{ card.value }}<span v-if="card.unit" class="stat-unit">{{ card.unit }}</span>
        </div>
        <div v-if="card.change" class="stat-change" :class="card.trend">
          <el-icon v-if="card.trend === 'up'"><CaretTop /></el-icon>
          <el-icon v-else-if="card.trend === 'down'"><CaretBottom /></el-icon>
          {{ card.change }}
        </div>
      </div>
    </div>

    <!-- 图表 + 待办区 -->
    <div class="charts-area">
      <ChartContainer v-for="chart in data.charts" :key="chart.key" :chart="chart" class="chart-cell" />
    </div>

    <!-- 系统监控面板（仅 super_admin） -->
    <div v-if="data.system" class="system-panel">
      <span class="system-title">系统监控</span>
      <div class="system-item">
        <span class="system-label">健康状态</span>
        <span class="system-dot" :class="data.system.healthStatus" />
        <span class="system-val">{{ data.system.healthStatus === 'healthy' ? '正常' : data.system.healthStatus === 'warning' ? '警告' : '异常' }}</span>
      </div>
      <div class="system-item">
        <span class="system-label">平均响应时间</span>
        <span class="system-val">{{ data.system.avgResponseTime }}</span>
      </div>
      <div class="system-item">
        <span class="system-label">在线用户数</span>
        <span class="system-val">{{ data.system.onlineUsers }}</span>
      </div>
      <div class="system-item">
        <span class="system-label">平均订单周期</span>
        <span class="system-val">{{ data.system.avgOrderCycle }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh, CaretTop, CaretBottom, FullScreen, Aim } from '@element-plus/icons-vue'
import { useUserInfo } from '@/stores/userInfo'
import { type DashboardVO, type DashboardQuery, getDashboard } from '@/api/dashboard'
import ChartContainer from './components/chartContainer.vue'
import TodoList from './components/TodoList.vue'

const userStore = useUserInfo()

const timeRange = ref<DashboardQuery['timeRange']>('today')
const customDateRange = ref<[string, string] | null>(null)
const loading = ref(false)
const data = ref<DashboardVO>({ cards: [], charts: [], todos: [] })
const currentTime = ref('')
const refreshInterval = ref(300000)

function updateTime() {
  currentTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
}

const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function handleTimeRangeChange(value: string) {
  if (value !== 'custom' || customDateRange.value) {
    load()
  }
}

function handleCustomDateChange(dates: [string, string] | null) {
  if (dates?.[0] && dates?.[1]) {
    load()
  }
}

function handleRefreshIntervalChange() {
  clearInterval(refreshTimer)
  refreshTimer = setInterval(load, refreshInterval.value)
}

async function load() {
  loading.value = true
  try {
    const params: DashboardQuery = { timeRange: timeRange.value }

    if (timeRange.value === 'custom' && customDateRange.value) {
      params.startDate = customDateRange.value[0]
      params.endDate = customDateRange.value[1]
    }

    data.value = await getDashboard(userStore.userInfos.roleCode || '', params)
  } finally {
    loading.value = false
  }
}

let refreshTimer: ReturnType<typeof setInterval>
let clockTimer: ReturnType<typeof setInterval>
onMounted(() => {
  updateTime(); load()
  refreshTimer = setInterval(load, refreshInterval.value)
  clockTimer = setInterval(updateTime, 1000)
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})
onUnmounted(() => { clearInterval(refreshTimer); clearInterval(clockTimer) })
</script>

<style scoped>
/* ── 基础容器 ── */
.screen {
  position: relative;
  width: 100%; height: 100%;
  background: #f5f7fa;
  display: flex; flex-direction: column;
  padding: 0 16px 14px;
  box-sizing: border-box;
  overflow: hidden;
  color: #303133;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ── 背景网格（浅色版本） ── */
.bg-grid {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(64,158,255,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64,158,255,.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ── 扫描线（隐藏，浅色主题不需要） ── */
.scan-line {
  display: none;
}

/* ── 所有内容在网格之上 ── */
.screen-header { position: relative; z-index: 100; }
.cards-row, .main-grid { position: relative; z-index: 2; }

/* ── 顶部标题栏 ── */
.screen-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; flex-shrink: 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 14px;
}
.header-center { display: flex; align-items: center; gap: 12px; }
.header-title {
  font-size: 18px; font-weight: 600; letter-spacing: 4px;
  color: #303133;
  white-space: nowrap;
}

.title-deco {
  width: 40px; height: 2px;
  background: linear-gradient(90deg, transparent, #2f5bff);
}
.title-deco.right { transform: scaleX(-1); }

.header-side { flex: 1; display: flex; align-items: center; gap: 8px; }
.header-right { justify-content: flex-end; gap: 10px; }
.status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #67c23a;
  box-shadow: 0 0 8px #67c23a;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
.header-time { font-size: 12px; color: #909399; letter-spacing: 1px; }
.refresh-label { font-size: 12px; color: #909399; margin-left: 16px; }
.refresh-select { width: 70px; }
.refresh-btn { background: transparent !important; border-color: #dcdfe6 !important; color: #909399 !important; }

/* ── 数据卡片 ── */
.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px; flex-shrink: 0; margin-bottom: 12px;
}
.stat-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer; overflow: hidden;
  transition: border-color .25s, box-shadow .25s;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.stat-card:hover {
  border-color: #2f5bff;
  box-shadow: 0 4px 16px rgba(47,91,255,.12);
}

/* 四角装饰（浅色主题改为简洁圆角） */
.corner { display: none; }

.stat-label { font-size: 12px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; color: #303133; line-height: 1; }
.stat-unit { font-size: 13px; font-weight: 400; margin-left: 3px; color: #909399; }
.stat-change { font-size: 11px; margin-top: 6px; color: #909399; display: flex; align-items: center; gap: 2px; }
.stat-change.up { color: #f56c6c; }
.stat-change.down { color: #67c23a; }

/* 卡片光晕扫过效果（浅色主题去掉） */
.card-shine { display: none; }

/* ── 主内容网格 ── */
.charts-area {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 280px;
  gap: 10px;
  overflow-y: auto;
}
.chart-cell { min-height: 0; }
.todo-cell { overflow: hidden; }

/* ── 系统监控面板 ── */
.system-panel {
  display: flex; align-items: center; gap: 24px;
  flex-shrink: 0; margin-top: 10px;
  background: #ffffff; border: 1px solid #ebeef5;
  border-radius: 8px; padding: 10px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.system-title { font-size: 12px; font-weight: 600; color: #303133; white-space: nowrap; }
.system-item { display: flex; align-items: center; gap: 6px; }
.system-label { font-size: 12px; color: #909399; }
.system-val { font-size: 13px; font-weight: 600; color: #303133; }
.system-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.system-dot.healthy { background: #67c23a; box-shadow: 0 0 6px #67c23a; }
.system-dot.warning { background: #e6a23c; box-shadow: 0 0 6px #e6a23c; }

/* ── 自定义日期选择器 ── */
.time-range-wrapper {
  position: relative;
  display: inline-block;
  z-index: 1001;
}

.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
}

.date-picker-fade-enter-active,
.date-picker-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.date-picker-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.date-picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.custom-date-picker {
  width: 260px;
}
.system-dot.error   { background: #f56c6c; box-shadow: 0 0 6px #f56c6c; }

/* ── Element Plus 覆盖 ── */
:deep(.el-radio-button__inner) {
  background: #ffffff !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
  padding: 4px 10px;
  font-size: 12px;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #ecf5ff !important;
  color: #2f5bff !important;
  border-color: #2f5bff !important;
}
</style>
