<template>
  <div class="order-home">
    <div class="order-home-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-left">
          <h1 class="page-title">订单工作台</h1>
          <p class="page-subtitle">{{ currentDate }} · 最后更新: {{ lastUpdate }}</p>
        </div>
        <div class="header-right">
          <el-select v-model="timeRange" class="time-select" placeholder="选择时间范围">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本季度" value="quarter" />
            <el-option label="本年" value="year" />
          </el-select>
          <el-button type="primary" class="refresh-btn" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </header>

      <!-- Primary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">订单总量</span>
            <div class="stat-icon stat-icon-primary">
              <el-icon><Document /></el-icon>
            </div>
          </div>
          <div class="stat-value">{{ stats.totalOrders.toLocaleString() }}</div>
          <div class="stat-meta">
            <span class="stat-change stat-change-up">
              <el-icon><Top /></el-icon>
              +{{ stats.totalChange }}%
            </span>
            <span class="stat-sub">较上周期</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">订单完成率</span>
            <div class="stat-icon stat-icon-success">
              <el-icon><CircleCheck /></el-icon>
            </div>
          </div>
          <div class="stat-value">{{ stats.completionRate }}%</div>
          <div class="stat-meta">
            <span class="stat-change stat-change-up">
              <el-icon><Top /></el-icon>
              +{{ stats.rateChange }}%
            </span>
            <span class="stat-sub">今日完成 {{ metrics.todayCompleted }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">平均订单周期</span>
            <div class="stat-icon stat-icon-warning">
              <el-icon><Clock /></el-icon>
            </div>
          </div>
          <div class="stat-value">{{ stats.avgCycle }}<span class="stat-unit">天</span></div>
          <div class="stat-meta">
            <span class="stat-change stat-change-down">
              <el-icon><Bottom /></el-icon>
              {{ stats.cycleChange }}天
            </span>
            <span class="stat-sub">较上周期</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">异常订单数</span>
            <div class="stat-icon stat-icon-danger">
              <el-icon><WarningFilled /></el-icon>
            </div>
          </div>
          <div class="stat-value">{{ stats.abnormalOrders }}</div>
          <div class="stat-meta">
            <span class="stat-change stat-change-down">异常率 {{ stats.abnormalRate }}%</span>
          </div>
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="secondary-stats">
        <div class="secondary-card">
          <div class="secondary-icon secondary-icon-blue">
            <el-icon><User /></el-icon>
          </div>
          <div class="secondary-content">
            <div class="secondary-label">进行中订单</div>
            <div class="secondary-value">{{ stats.activeOrders }}</div>
          </div>
        </div>

        <div class="secondary-card">
          <div class="secondary-icon secondary-icon-green">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="secondary-content">
            <div class="secondary-label">团队人效</div>
            <div class="secondary-value">{{ stats.efficiency }} <span class="secondary-unit">单/人</span></div>
          </div>
        </div>

        <div class="secondary-card">
          <div class="secondary-icon secondary-icon-orange">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="secondary-content">
            <div class="secondary-label">活跃用户</div>
            <div class="secondary-value">{{ stats.activeUsers }} <span class="secondary-unit">+{{ stats.userChange }}%</span></div>
          </div>
        </div>

        <div class="secondary-card">
          <div class="secondary-icon secondary-icon-blue">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="secondary-content">
            <div class="secondary-label">数据增长</div>
            <div class="secondary-value">+{{ stats.dataGrowth }}%</div>
          </div>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="charts-section">
        <div class="chart-card chart-card-primary">
          <div class="chart-header">
            <h3 class="chart-title">订单全流程漏斗</h3>
          </div>
          <div class="funnel-chart">
            <div class="funnel-item">
              <span class="funnel-label">创建订单</span>
              <div class="funnel-bar-wrap">
                <div class="funnel-bar funnel-bar-primary" style="width: 100%;">
                  <span class="funnel-value">1285</span>
                </div>
              </div>
              <span class="funnel-percent">100%</span>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">审核通过</span>
              <div class="funnel-bar-wrap">
                <div class="funnel-bar funnel-bar-success" style="width: 95%;">
                  <span class="funnel-value">1220</span>
                </div>
              </div>
              <span class="funnel-percent">95%</span>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">设计完成</span>
              <div class="funnel-bar-wrap">
                <div class="funnel-bar funnel-bar-purple" style="width: 92%;">
                  <span class="funnel-value">1180</span>
                </div>
              </div>
              <span class="funnel-percent">92%</span>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">生产完成</span>
              <div class="funnel-bar-wrap">
                <div class="funnel-bar funnel-bar-warning" style="width: 89%;">
                  <span class="funnel-value">1145</span>
                </div>
              </div>
              <span class="funnel-percent">89%</span>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">质检通过</span>
              <div class="funnel-bar-wrap">
                <div class="funnel-bar funnel-bar-pink" style="width: 85%;">
                  <span class="funnel-value">1098</span>
                </div>
              </div>
              <span class="funnel-percent">85%</span>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">入库完成</span>
              <div class="funnel-bar-wrap">
                <div class="funnel-bar funnel-bar-cyan" style="width: 83%;">
                  <span class="funnel-value">1065</span>
                </div>
              </div>
              <span class="funnel-percent">83%</span>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">已完成</span>
              <div class="funnel-bar-wrap">
                <div class="funnel-bar funnel-bar-yellow" style="width: 68%;">
                  <span class="funnel-value">873</span>
                </div>
              </div>
              <span class="funnel-percent">68%</span>
            </div>
          </div>
        </div>

        <div class="chart-card chart-card-success">
          <div class="chart-header">
            <h3 class="chart-title">各阶段平均耗时</h3>
          </div>
          <div class="bar-chart" ref="durationChartRef">
            <div class="bar-item">
              <span class="bar-label">审核</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-success" style="width: 12%;"></div>
              </div>
              <span class="bar-value">24h</span>
            </div>
            <div class="bar-item">
              <span class="bar-label">出库</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-primary" style="width: 24%;"></div>
              </div>
              <span class="bar-value">48h</span>
            </div>
            <div class="bar-item">
              <span class="bar-label">设计</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-purple" style="width: 48%;"></div>
              </div>
              <span class="bar-value">96h</span>
            </div>
            <div class="bar-item">
              <span class="bar-label">生产</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-warning" style="width: 96%;"></div>
              </div>
              <span class="bar-value">192h</span>
            </div>
            <div class="bar-item">
              <span class="bar-label">质检</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-success" style="width: 36%;"></div>
              </div>
              <span class="bar-value">72h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="charts-row">
        <div class="chart-card chart-card-primary">
          <div class="chart-header">
            <h3 class="chart-title">订单趋势分析</h3>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background: var(--el-color-primary);"></span>新建</span>
              <span class="legend-item"><span class="legend-dot" style="background: var(--el-color-success);"></span>完成</span>
              <span class="legend-item"><span class="legend-dot" style="background: var(--el-color-warning);"></span>取消</span>
            </div>
          </div>
          <div class="line-chart" ref="trendChartRef">
            <div class="line-chart-svg">
              <svg viewBox="0 0 400 200" preserveAspectRatio="none">
                <line x1="50" y1="20" x2="380" y2="20" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="50" y1="60" x2="380" y2="60" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="50" y1="100" x2="380" y2="100" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="50" y1="140" x2="380" y2="140" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="50" y1="180" x2="380" y2="180" stroke="#f1f5f9" stroke-width="1"/>
                <path :d="newArea" fill="url(#primaryGradient)" opacity="0.3"/>
                <polyline :points="newPolyline" fill="none" stroke="#2f5bff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline :points="donePolyline" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle v-for="(pt, i) in newPts" :key="'n'+i" :cx="pt.split(' ')[0]" :cy="pt.split(' ')[1]" r="4" fill="#2f5bff"/>
                <text x="50" y="195" text-anchor="middle" fill="#909399" font-size="11">第1周</text>
                <text x="160" y="195" text-anchor="middle" fill="#909399" font-size="11">第2周</text>
                <text x="270" y="195" text-anchor="middle" fill="#909399" font-size="11">第3周</text>
                <text x="380" y="195" text-anchor="middle" fill="#909399" font-size="11">第4周</text>
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#2f5bff" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#2f5bff" stop-opacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <div class="chart-card chart-card-success">
          <div class="chart-header">
            <h3 class="chart-title">部门业绩对比</h3>
          </div>
          <div class="bar-chart-horizontal" ref="deptChartRef">
            <div class="bar-item-h">
              <span class="bar-label-h">华东区</span>
              <div class="bar-track-h">
                <div class="bar-fill bar-fill-primary" style="width: 85%;"></div>
              </div>
              <span class="bar-value-h">428</span>
            </div>
            <div class="bar-item-h">
              <span class="bar-label-h">华南区</span>
              <div class="bar-track-h">
                <div class="bar-fill bar-fill-primary" style="width: 76%;"></div>
              </div>
              <span class="bar-value-h">385</span>
            </div>
            <div class="bar-item-h">
              <span class="bar-label-h">华北区</span>
              <div class="bar-track-h">
                <div class="bar-fill bar-fill-primary" style="width: 68%;"></div>
              </div>
              <span class="bar-value-h">342</span>
            </div>
            <div class="bar-item-h">
              <span class="bar-label-h">西南区</span>
              <div class="bar-track-h">
                <div class="bar-fill bar-fill-primary" style="width: 59%;"></div>
              </div>
              <span class="bar-value-h">298</span>
            </div>
            <div class="bar-item-h">
              <span class="bar-label-h">华中区</span>
              <div class="bar-track-h">
                <div class="bar-fill bar-fill-primary" style="width: 51%;"></div>
              </div>
              <span class="bar-value-h">256</span>
            </div>
          </div>
        </div>

        <div class="chart-card chart-card-primary">
          <div class="chart-header">
            <h3 class="chart-title">用户活跃度</h3>
          </div>
          <div class="radar-chart" ref="activityChartRef">
            <div class="radar-container">
              <svg viewBox="0 0 200 180">
                <!-- Background circles -->
                <circle cx="100" cy="85" r="60" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="100" cy="85" r="45" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="100" cy="85" r="30" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="100" cy="85" r="15" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                <!-- Axes -->
                <line x1="100" y1="25" x2="100" y2="145" stroke="#e2e8f0" stroke-width="1"/>
                <line x1="40" y1="85" x2="160" y2="85" stroke="#e2e8f0" stroke-width="1"/>
                <line x1="55" y1="45" x2="145" y2="125" stroke="#e2e8f0" stroke-width="1"/>
                <line x1="145" y1="45" x2="55" y2="125" stroke="#e2e8f0" stroke-width="1"/>
                <!-- This week area -->
                <polygon points="100,40 130,60 140,95 120,115 80,115 60,95 70,60" 
                  fill="rgba(47, 91, 255, 0.15)" stroke="#2f5bff" stroke-width="2"/>
                <!-- Last week area (dashed) -->
                <polygon points="100,50 125,68 132,95 115,110 85,110 68,95 75,68" 
                  fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="2" stroke-dasharray="4,2"/>
                <!-- Labels -->
                <text x="100" y="15" text-anchor="middle" fill="#475569" font-size="10">周一</text>
                <text x="165" y="50" text-anchor="start" fill="#475569" font-size="10">周二</text>
                <text x="165" y="130" text-anchor="start" fill="#475569" font-size="10">周六</text>
                <text x="35" y="50" text-anchor="end" fill="#475569" font-size="10">周四</text>
                <text x="35" y="130" text-anchor="end" fill="#475569" font-size="10">周日</text>
                <text x="100" y="170" text-anchor="middle" fill="#475569" font-size="10">周三</text>
              </svg>
              <div class="radar-legend">
                <span class="legend-item"><span class="legend-dot" style="background: #2f5bff;"></span>本周</span>
                <span class="legend-item"><span class="legend-dot" style="background: #10b981;"></span>上周</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Monitor -->
      <div class="system-section">
        <div class="system-header">
          <h3 class="system-title">系统监控面板</h3>
          <span class="status-badge status-badge-healthy">
            <span class="status-dot"></span>
            系统运行正常
          </span>
        </div>
        <div class="system-grid">
          <div class="system-item">
            <div class="system-gauge">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="8" 
                  stroke-dasharray="201" stroke-dashoffset="50" stroke-linecap="round"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="gauge-value">92%</div>
            </div>
            <div class="system-info">
              <div class="system-label">
                <el-icon><DataAnalysis /></el-icon>
                服务可用性
              </div>
              <div class="system-desc">过去24小时</div>
            </div>
          </div>

          <div class="system-item">
            <div class="system-gauge">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#2f5bff" stroke-width="8" 
                  stroke-dasharray="251" stroke-dashoffset="40" stroke-linecap="round"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="gauge-value">120<span class="gauge-unit">ms</span></div>
            </div>
            <div class="system-info">
              <div class="system-label">
                <el-icon><Clock /></el-icon>
                响应时间
              </div>
              <div class="system-desc">P95 平均</div>
            </div>
          </div>

          <div class="system-item">
            <div class="system-gauge">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="8" 
                  stroke-dasharray="251" stroke-dashoffset="0" stroke-linecap="round"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="gauge-value">156</div>
            </div>
            <div class="system-info">
              <div class="system-label">
                <el-icon><User /></el-icon>
                活跃用户
              </div>
              <div class="system-desc">实时在线</div>
            </div>
          </div>

          <div class="system-item">
            <div class="system-gauge">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" stroke-width="8" 
                  stroke-dasharray="251" stroke-dashoffset="75" stroke-linecap="round"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="gauge-value">70<span class="gauge-unit">%</span></div>
            </div>
            <div class="system-info">
              <div class="system-label">
                <el-icon><Monitor /></el-icon>
                CPU 使用率
              </div>
              <div class="system-desc">当前负载</div>
            </div>
          </div>

          <div class="system-item">
            <div class="system-gauge">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" stroke-width="8" 
                  stroke-dasharray="251" stroke-dashoffset="100" stroke-linecap="round"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="gauge-value">60<span class="gauge-unit">%</span></div>
            </div>
            <div class="system-info">
              <div class="system-label">
                <el-icon><Odometer /></el-icon>
                内存使用率
              </div>
              <div class="system-desc">服务器内存</div>
            </div>
          </div>

          <div class="system-item">
            <div class="system-gauge">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="8" 
                  stroke-dasharray="251" stroke-dashoffset="0" stroke-linecap="round"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="gauge-value gauge-value-icon">
                <el-icon color="#10b981"><CircleCheck /></el-icon>
              </div>
            </div>
            <div class="system-info">
              <div class="system-label">
                <el-icon><Lock /></el-icon>
                安全状态
              </div>
              <div class="system-desc">无威胁检测</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Refresh, Document, Clock, WarningFilled, CircleCheck, Top, Bottom, 
  User, SuccessFilled, UserFilled, TrendCharts, DataAnalysis, Monitor, Odometer, Lock } from '@element-plus/icons-vue'

// Time range
const timeRange = ref('month')
const currentDate = ref(new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }))
const lastUpdate = ref(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function rndF(min: number, max: number) { return +(Math.random() * (max - min) + min).toFixed(1) }

const stats = reactive({
  totalOrders: rnd(5, 20),
  totalChange: rndF(1, 9),
  completionRate: rnd(5, 20),
  rateChange: rndF(0.5, 5),
  avgCycle: rnd(5, 18),
  cycleChange: -rndF(0.5, 3),
  activeOrders: rnd(5, 20),
  abnormalOrders: rnd(5, 15),
  abnormalRate: rndF(1, 6),
  efficiency: rnd(5, 18),
  activeUsers: rnd(5, 20),
  userChange: rndF(1, 9),
  dataGrowth: rndF(5, 18)
})

const metrics = reactive({
  todayNew: rnd(5, 20),
  todayCompleted: rnd(5, 18),
  currentAbnormal: rnd(5, 15),
  pendingReview: rnd(5, 20)
})

// 订单趋势折线图数据（4周，3条线）
const weeks = ['第1周', '第2周', '第3周', '第4周']
const trendData = {
  new:    weeks.map(() => rnd(5, 20)),
  done:   weeks.map(() => rnd(5, 18)),
  cancel: weeks.map(() => rnd(1, 8)),
}

// 将数值映射到 SVG Y 坐标（绘图区 y: 20~180，x: 50~380）
function toSvgPoints(data: number[]) {
  const max = 20, min = 0
  const xs = [50, 160, 270, 380]
  return data.map((v, i) => {
    const y = 180 - ((v - min) / (max - min)) * 160
    return `${xs[i]} ${y}`
  })
}

const newPts  = toSvgPoints(trendData.new)
const donePts = toSvgPoints(trendData.done)
const newPolyline  = newPts.join(' L ')
const donePolyline = donePts.join(' L ')
const newArea = `M ${newPts.join(' L ')} L 380 180 L 50 180 Z`

// Methods
const handleRefresh = () => {
  lastUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  // Initialize any charts or data fetching here
})
</script>

<style lang="scss" scoped>
.order-home {
  background: #f0f4f8;
  min-height: 100vh;
  padding: 32px 40px;
}

.order-home-container {
  max-width: 1440px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

// Header
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  animation: slideUp 0.6s ease-out 0.1s both;
}

.header-left {
  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
    
    &::before {
      content: '';
      width: 4px;
      height: 32px;
      background: linear-gradient(180deg, #2f5bff 0%, #6d8cff 100%);
      border-radius: 2px;
    }
  }
  
  .page-subtitle {
    font-size: 14px;
    color: #94a3b8;
    padding-left: 16px;
  }
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.time-select {
  width: 140px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  animation: slideUp 0.6s ease-out both;
  
  &:nth-child(1) { animation-delay: 0.15s; }
  &:nth-child(2) { animation-delay: 0.18s; }
  &:nth-child(3) { animation-delay: 0.21s; }
  &:nth-child(4) { animation-delay: 0.24s; }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(47,91,255,0.08);
    border-color: transparent;
  }
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.stat-icon-primary {
    background: #eef2ff;
    color: #2f5bff;
  }
  
  &.stat-icon-success {
    background: #e8f5f0;
    color: #10b981;
  }
  
  &.stat-icon-warning {
    background: #fef6e8;
    color: #f59e0b;
  }
  
  &.stat-icon-danger {
    background: #fef2f2;
    color: #ef4444;
  }
  
  .el-icon {
    font-size: 20px;
  }
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: -1px;
  line-height: 1;
}

.stat-unit {
  font-size: 16px;
  font-weight: 400;
  color: #94a3b8;
}

.stat-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.stat-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  
  &.stat-change-up {
    background: #e8f5f0;
    color: #10b981;
  }
  
  &.stat-change-down {
    background: #fef2f2;
    color: #ef4444;
  }
}

.stat-sub {
  color: #94a3b8;
}

// Secondary Stats
.secondary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.secondary-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.6s ease-out both;
  
  &:nth-child(1) { animation-delay: 0.28s; }
  &:nth-child(2) { animation-delay: 0.32s; }
  &:nth-child(3) { animation-delay: 0.36s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 24px rgba(47,91,255,0.08);
    border-color: #2f5bff;
  }
}

.secondary-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .el-icon {
    font-size: 22px;
  }
  
  &.secondary-icon-blue {
    background: #eef2ff;
    color: #2f5bff;
  }
  
  &.secondary-icon-green {
    background: #e8f5f0;
    color: #10b981;
  }
  
  &.secondary-icon-orange {
    background: #fef6e8;
    color: #f59e0b;
  }
  
  &.secondary-icon-red {
    background: #fef2f2;
    color: #ef4444;
  }
}

.secondary-content {
  flex: 1;
  min-width: 0;
}

.secondary-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.secondary-value {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  
  .secondary-unit {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 400;
  }
}

// Charts Section
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  animation: slideUp 0.6s ease-out 0.4s both;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  
  &:nth-child(odd) {
    border-top: 3px solid #2f5bff;
  }
  
  &:nth-child(even) {
    border-top: 3px solid #10b981;
  }
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '';
    width: 3px;
    height: 16px;
    background: linear-gradient(180deg, #2f5bff, #6d8cff);
    border-radius: 2px;
  }
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

// Funnel Chart
.funnel-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  justify-content: center;
}

.funnel-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.funnel-label {
  width: 80px;
  font-size: 13px;
  color: #475569;
}

.funnel-bar-wrap {
  flex: 1;
  height: 28px;
  background: #f0f4f8;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.funnel-bar {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  transition: width 0.5s ease;
  
  &.funnel-bar-primary {
    background: linear-gradient(90deg, #2f5bff, #6d8cff);
  }
  
  &.funnel-bar-success {
    background: linear-gradient(90deg, #10b981, #34d399);
  }
  
  &.funnel-bar-purple {
    background: linear-gradient(90deg, #6366f1, #818cf8);
  }
  
  &.funnel-bar-warning {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
  }
  
  &.funnel-bar-pink {
    background: linear-gradient(90deg, #ec4899, #f472b6);
  }
  
  &.funnel-bar-cyan {
    background: linear-gradient(90deg, #06b6d4, #22d3ee);
  }
  
  &.funnel-bar-yellow {
    background: linear-gradient(90deg, #fbbf24, #fcd34d);
  }
}

.funnel-value {
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.funnel-percent {
  width: 40px;
  font-size: 12px;
  color: #94a3b8;
  text-align: right;
}

// Bar Chart (Vertical)
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  justify-content: center;
  padding: 0 10px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 40px;
  font-size: 13px;
  color: #475569;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: #f0f4f8;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  
  &.bar-fill-primary {
    background: linear-gradient(90deg, #2f5bff, #6d8cff);
  }
  
  &.bar-fill-success {
    background: #10b981;
  }
  
  &.bar-fill-warning {
    background: #f59e0b;
  }
  
  &.bar-fill-purple {
    background: #6366f1;
  }
}

.bar-value {
  width: 50px;
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
}

// Line Chart
.line-chart {
  height: 200px;
}

.line-chart-svg {
  width: 100%;
  height: 100%;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

// Bar Chart (Horizontal)
.bar-chart-horizontal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  justify-content: center;
}

.bar-item-h {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label-h {
  width: 50px;
  font-size: 13px;
  color: #475569;
  text-align: right;
}

.bar-track-h {
  flex: 1;
  height: 20px;
  background: #f0f4f8;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill-h {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-value-h {
  width: 40px;
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
}

// Radar Chart
.radar-chart {
  height: 200px;
}

.radar-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  svg {
    flex: 1;
    max-height: 160px;
  }
}

.radar-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  margin-top: 8px;
}

// System Monitor
.system-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  animation: slideUp 0.6s ease-out 0.5s both;
  margin-top: 24px;
}

.system-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.system-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '';
    width: 3px;
    height: 16px;
    background: linear-gradient(180deg, #2f5bff, #10b981);
    border-radius: 2px;
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  
  &.status-badge-healthy {
    background: #e8f5f0;
    color: #10b981;
  }
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.system-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  background: #f0f4f8;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.25s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(47,91,255,0.08);
    border-color: #6d8cff;
  }
}

.system-gauge {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.gauge-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.gauge-value-icon {
    .el-icon {
      font-size: 28px;
    }
  }
}

.gauge-unit {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-left: 2px;
}

.system-info {
  text-align: center;
}

.system-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  .el-icon {
    font-size: 14px;
    color: #94a3b8;
  }
}

.system-desc {
  font-size: 11px;
  color: #94a3b8;
}

// Responsive
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .secondary-stats { grid-template-columns: repeat(2, 1fr); }
  .charts-section { grid-template-columns: 1fr; }
  .charts-row { grid-template-columns: 1fr 1fr; }
  .system-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .order-home { padding: 24px 20px; }
  .page-header { flex-direction: column; gap: 20px; }
  .stats-grid { grid-template-columns: 1fr; }
  .secondary-stats { grid-template-columns: 1fr; }
  .charts-section { grid-template-columns: 1fr; }
  .charts-row { grid-template-columns: 1fr; }
  .system-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
