<template>
  <div class="designer-manager-dashboard">
    <DashboardHeader
      title="设计管理员工作台"
      theme-color="#7c3aed"
      :loading="loading"
      :refresh-interval="refreshInterval"
      @refresh="handleRefresh"
    />

    <main class="dashboard-main">
      <!-- Row 1: Stats Cards -->
      <div class="stats-row">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="stat-card"
          :class="`stat-card--${card.color}`"
          @click="card.onClick?.()"
        >
          <div class="stat-card__corner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="card.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-meta">
              <span class="stat-badge" :class="`stat-badge--${card.badgeColor}`">{{ card.badge }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: 订单趋势 + 进行中订单 -->
      <div class="section-row section-row--1-3">
        <!-- 订单趋势 -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">
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
                :class="{ active: activeChartTab === tab.value }"
                @click="activeChartTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
          <div class="section-body">
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-line legend-line--purple"></span>
                <span>订单趋势</span>
              </div>
            </div>
            <div class="chart-content">
              <div class="chart-area">
                <div class="chart-y-axis">
                  <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                </div>
                <svg class="chart-svg" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <line x1="0" y1="10" x2="200" y2="10" stroke="#e2e8f0" stroke-width="0.5"/>
                  <line x1="0" y1="35" x2="200" y2="35" stroke="#e2e8f0" stroke-width="0.5"/>
                  <line x1="0" y1="60" x2="200" y2="60" stroke="#e2e8f0" stroke-width="0.5"/>
                  <line x1="0" y1="85" x2="200" y2="85" stroke="#e2e8f0" stroke-width="0.5"/>
                  <defs>
                    <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4"/>
                      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M12,80 L36,60 L60,65 L84,40 L108,50 L132,30 L156,15 L174,10 L174,100 L12,100 Z" fill="url(#trendGrad)"/>
                  <path d="M12,80 L36,60 L60,65 L84,40 L108,50 L132,30 L156,15" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="80" r="4" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
                  <circle cx="36" cy="60" r="4" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
                  <circle cx="60" cy="65" r="4" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
                  <circle cx="84" cy="40" r="4" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
                  <circle cx="108" cy="50" r="4" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
                  <circle cx="132" cy="30" r="4" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
                  <circle cx="156" cy="15" r="5" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
                </svg>
              </div>
              <div class="chart-x-axis">
                <span>周一</span><span>周二</span><span>周三</span><span>周四</span>
                <span>周五</span><span>周六</span><span>周日</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 进行中订单进度 -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="20" x2="12" y2="10"/>
                <line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </svg>
              进行中订单进度
            </h3>
          </div>
          <div class="section-body">
            <div class="order-list-header">
              <span>医院</span>
              <span>患者</span>
              <span>交付</span>
              <span>进度</span>
            </div>
            <div class="order-scroll-container">
              <div class="order-scroll">
                <div v-for="order in ordersInProgress" :key="order.id" class="order-progress-item">
                  <div class="order-hospital-wrap">
                    <div class="order-hospital-name">{{ order.hospital }}</div>
                    <div class="order-seq">{{ order.code }}</div>
                  </div>
                  <span class="order-patient">{{ order.patient }}</span>
                  <span class="delivery-badge" :class="order.deliveryType === 'physical' ? 'delivery-badge--physical' : 'delivery-badge--virtual'">
                    {{ order.deliveryType === 'physical' ? '实物' : '无实物' }}
                  </span>
                  <div class="progress-info">
                    <div class="progress-bar-row">
                      <div class="progress-bar">
                        <div class="progress-fill progress-fill--design" :style="{ width: order.progress + '%' }"></div>
                      </div>
                      <span class="progress-percent">{{ order.progress }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: 设计师工作负载 + 超时订单 -->
      <div class="section-row section-row--1-1">
        <!-- 设计师工作负载 -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              设计师工作负载
            </h3>
          </div>
          <div class="section-body">
            <div class="workload-container">
              <div class="workload-scroll" :class="{ paused: isHoveringWorkload }" @mouseenter="isHoveringWorkload = true" @mouseleave="isHoveringWorkload = false">
                <div v-for="item in workloadItems" :key="item.id" class="workload-item">
                  <div class="designer-avatar" :class="item.gender === 'male' ? 'designer-avatar--male' : 'designer-avatar--female'">
                    {{ item.name.slice(0, 1) }}
                  </div>
                  <div class="designer-info">
                    <div class="designer-name">{{ item.name }}</div>
                    <div class="designer-stats">
                      <span class="stat-tag stat-tag--red">待设计 {{ item.pending }}</span>
                      <span class="stat-tag stat-tag--yellow">设计中 {{ item.designing }}</span>
                      <span class="stat-tag stat-tag--green">完成 {{ item.completed }}</span>
                    </div>
                  </div>
                </div>
                <!-- Duplicate for seamless scroll -->
                <div v-for="item in workloadItems" :key="'dup-' + item.id" class="workload-item">
                  <div class="designer-avatar" :class="item.gender === 'male' ? 'designer-avatar--male' : 'designer-avatar--female'">
                    {{ item.name.slice(0, 1) }}
                  </div>
                  <div class="designer-info">
                    <div class="designer-name">{{ item.name }}</div>
                    <div class="designer-stats">
                      <span class="stat-tag stat-tag--red">待设计 {{ item.pending }}</span>
                      <span class="stat-tag stat-tag--yellow">设计中 {{ item.designing }}</span>
                      <span class="stat-tag stat-tag--green">完成 {{ item.completed }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 超时订单 -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              超时订单
            </h3>
          </div>
          <div class="section-body">
            <div class="timeout-scroll-container">
              <div class="timeout-scroll">
                <div v-for="item in timeoutOrders" :key="item.id" class="timeout-item">
                  <div class="timeout-info">
                    <span class="timeout-seq">{{ item.code }}</span>
                    <span class="timeout-hospital">{{ item.hospital }}</span>
                  </div>
                  <div class="timeout-details">
                    <span class="timeout-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {{ item.doctor }}/{{ item.patient }}
                    </span>
                    <span class="timeout-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                      </svg>
                      {{ item.designer }}
                    </span>
                  </div>
                  <span class="timeout-days">{{ item.timeoutText }}</span>
                </div>
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
const activeChartTab = ref('week')
const isHoveringWorkload = ref(false)

const chartTabs = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
]

interface StatCard {
  key: string
  label: string
  value: number
  badge: string
  badgeColor: string
  color: string
  icon: string
  onClick?: () => void
}

const statCards = computed<StatCard[]>(() => [
  {
    key: 'pending-distribute',
    label: '待分配订单',
    value: 23,
    badge: '需分配',
    badgeColor: 'warning',
    color: 'primary',
    icon: '<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  },
  {
    key: 'pending-review',
    label: '待审核订单',
    value: 12,
    badge: '待确认',
    badgeColor: 'info',
    color: 'warning',
    icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  },
  {
    key: 'pending-design',
    label: '待设计订单',
    value: 18,
    badge: '待开始',
    badgeColor: 'danger',
    color: 'danger',
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  },
  {
    key: 'designing',
    label: '设计中订单',
    value: 34,
    badge: '进行中',
    badgeColor: 'purple',
    color: 'purple',
    icon: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>',
  },
  {
    key: 'completed',
    label: '设计完成订单',
    value: 15,
    badge: '待后续',
    badgeColor: 'success',
    color: 'success',
    icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  },
  {
    key: 'timeout',
    label: '设计超时订单',
    value: 7,
    badge: '需处理',
    badgeColor: 'danger',
    color: 'danger',
    icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  },
  {
    key: 'pending-production',
    label: '待生产订单',
    value: 28,
    badge: '排队中',
    badgeColor: 'info',
    color: 'cyan',
    icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><circle cx="12" cy="14" r="2"/>',
  },
])

interface OrderProgress {
  id: string
  code: string
  hospital: string
  patient: string
  deliveryType: 'physical' | 'virtual'
  progress: number
}

const ordersInProgress = ref<OrderProgress[]>([
  { id: '1', code: 'ORD-2026-0892', hospital: '北京协和医院', patient: '张某某', deliveryType: 'physical', progress: 45 },
  { id: '2', code: 'ORD-2026-0895', hospital: '上海华山医院', patient: '李某某', deliveryType: 'physical', progress: 72 },
  { id: '3', code: 'ORD-2026-0898', hospital: '广州中山医院', patient: '王某某', deliveryType: 'virtual', progress: 85 },
  { id: '4', code: 'ORD-2026-0901', hospital: '深圳北大医院', patient: '赵某某', deliveryType: 'physical', progress: 28 },
  { id: '5', code: 'ORD-2026-0903', hospital: '成都华西医院', patient: '陈某某', deliveryType: 'physical', progress: 60 },
  { id: '6', code: 'ORD-2026-0906', hospital: '武汉同济医院', patient: '刘某某', deliveryType: 'virtual', progress: 92 },
])

interface WorkloadItem {
  id: string
  name: string
  gender: 'male' | 'female'
  pending: number
  designing: number
  completed: number
}

const workloadItems = ref<WorkloadItem[]>([
  { id: '1', name: '李明轩', gender: 'male', pending: 8, designing: 5, completed: 12 },
  { id: '2', name: '张雨晴', gender: 'female', pending: 5, designing: 3, completed: 9 },
  { id: '3', name: '王子豪', gender: 'male', pending: 12, designing: 7, completed: 15 },
  { id: '4', name: '陈思琪', gender: 'female', pending: 6, designing: 4, completed: 8 },
  { id: '5', name: '赵浩然', gender: 'male', pending: 9, designing: 6, completed: 11 },
  { id: '6', name: '刘雅婷', gender: 'female', pending: 4, designing: 2, completed: 7 },
])

interface TimeoutOrder {
  id: string
  code: string
  hospital: string
  doctor: string
  patient: string
  designer: string
  days: number
  timeoutText: string
}

const timeoutOrders = ref<TimeoutOrder[]>([
  { id: '1', code: 'ORD-2026-0891', hospital: '北京协和医院', doctor: '王医生', patient: '张某某', designer: '李明轩', days: 3, timeoutText: '超3天' },
  { id: '2', code: 'ORD-2026-0887', hospital: '上海华山医院', doctor: '李医生', patient: '李某某', designer: '张雨晴', days: 5, timeoutText: '超5天' },
  { id: '3', code: 'ORD-2026-0885', hospital: '广州中山医院', doctor: '陈医生', patient: '王某某', designer: '王子豪', days: 2, timeoutText: '超2天' },
  { id: '4', code: 'ORD-2026-0882', hospital: '深圳北大医院', doctor: '赵医生', patient: '赵某某', designer: '陈思琪', days: 4, timeoutText: '超4天' },
  { id: '5', code: 'ORD-2026-0879', hospital: '成都华西医院', doctor: '刘医生', patient: '陈某某', designer: '赵浩然', days: 6, timeoutText: '超6天' },
])

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}
</script>

<style scoped>
.designer-manager-dashboard {
  --primary: #2f5bff;
  --primary-light: #4d76ff;
  --primary-lighter: #6d8cff;
  --primary-lightest: #dadff6;
  --bg-main: #f0f2f5;
  --bg-white: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-main {
  flex: 1 1 0;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  min-height: 0;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex-shrink: 0;
}

.stat-card {
  position: relative;
  background: var(--bg-white);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-card__corner {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  opacity: 0.4;
  transition: opacity 0.2s;
}
.stat-card:hover .stat-card__corner { opacity: 0.7; }
.stat-card__corner svg { width: 100%; height: 100%; }

.stat-info { flex: 1; min-width: 0; }
.stat-label { font-size: 9px; color: var(--text-secondary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat-value { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-top: 1px; }

.stat-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}

.stat-badge {
  display: inline-flex; padding: 2px 6px;
  font-size: 9px; font-weight: 600; border-radius: 8px;
}
.stat-badge--warning { background: #fef3c7; color: #d97706; }
.stat-badge--cyan { background: #ecfeff; color: #0891b2; }
.stat-badge--green { background: #ecfdf5; color: #059669; }
.stat-badge--info { background: #e0f2fe; color: #0369a1; }
.stat-badge--purple { background: #ede9fe; color: #7c3aed; }
.stat-badge--danger { background: #fee2e2; color: #dc2626; }

.stat-card--primary { border-color: var(--primary-lightest); background: linear-gradient(135deg, var(--bg-white) 85%, var(--primary-lightest)); }
.stat-card--warning { border-color: #fef3c7; background: linear-gradient(135deg, var(--bg-white) 85%, #fef3c7); }
.stat-card--danger { border-color: #fee2e2; background: linear-gradient(135deg, var(--bg-white) 85%, #fee2e2); }
.stat-card--success { border-color: #d1fae5; background: linear-gradient(135deg, var(--bg-white) 85%, #d1fae5); }
.stat-card--purple { border-color: #ede9fe; background: linear-gradient(135deg, var(--bg-white) 85%, #ede9fe); }
.stat-card--cyan { border-color: #cffafe; background: linear-gradient(135deg, var(--bg-white) 85%, #cffafe); }

/* Section Row */
.section-row {
  display: grid;
  gap: 16px;
  min-height: 240px;
  height: calc((100vh - 180px) / 2);
}
.section-row--1-3 { grid-template-columns: 1fr 3fr; }
.section-row--1-1 { grid-template-columns: 1fr 1fr; }

.section-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.section-title svg { width: 16px; height: 16px; color: var(--primary); }

.section-body {
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* Designer Workload */
.workload-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.workload-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: scrollUp 20s linear infinite;
}
.workload-scroll.paused { animation-play-state: paused; }

@keyframes scrollUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.workload-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-main);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}
.workload-item:hover { background: var(--border-color); }

.designer-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600;
  font-size: 13px;
  color: #fff;
  flex-shrink: 0;
}
.designer-avatar--male { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.designer-avatar--female { background: linear-gradient(135deg, #ec4899, #be185d); }

.designer-info { flex: 1; min-width: 0; }
.designer-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.designer-stats {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.stat-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
.stat-tag--red { background: #fee2e2; color: #dc2626; }
.stat-tag--yellow { background: #fef3c7; color: #d97706; }
.stat-tag--green { background: #d1fae5; color: #059669; }

/* Order Progress */
.order-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 1.2fr;
  gap: 10px;
  padding: 10px 16px;
  background: var(--bg-main);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.order-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  min-height: 0;
}
.order-scroll-container::-webkit-scrollbar { width: 5px; }
.order-scroll-container::-webkit-scrollbar-track { background: var(--bg-main); border-radius: 3px; }
.order-scroll-container::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }

.order-scroll {
  display: flex;
  flex-direction: column;
}

.order-progress-item {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 1.2fr;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  transition: all 0.2s;
}
.order-progress-item:last-child { border-bottom: none; }
.order-progress-item:hover { background: var(--bg-main); margin: 0 -18px; padding: 12px 18px; }

.order-hospital-wrap { min-width: 0; }
.order-hospital-name {
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.order-seq {
  font-size: 10px; color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}
.order-patient { font-size: 13px; color: var(--text-secondary); }

.delivery-badge {
  display: inline-flex; padding: 3px 8px;
  font-size: 11px; font-weight: 600; border-radius: 5px; width: fit-content;
}
.delivery-badge--physical { background: #d1fae5; color: #059669; border: 1px solid rgba(5,150,105,0.2); }
.delivery-badge--virtual { background: #ede9fe; color: #7c3aed; border: 1px solid rgba(124,58,237,0.2); }

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

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
}
.progress-fill--design { background: linear-gradient(90deg, #a855f7, #7c3aed); }

.progress-percent {
  font-size: 12px; font-weight: 700; color: var(--primary);
  font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right;
}

/* Chart */
.chart-tabs {
  display: flex;
  gap: 3px;
  background: var(--bg-main);
  padding: 3px;
  border-radius: 6px;
}
.chart-tab {
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 500;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}
.chart-tab.active {
  background: var(--bg-white);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.chart-legend {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-secondary);
}
.legend-line { width: 16px; height: 3px; border-radius: 2px; }
.legend-line--purple { background: linear-gradient(90deg, #a855f7, #7c3aed); }

.chart-content { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.chart-y-axis {
  display: flex; flex-direction: column; justify-content: space-between;
  padding-right: 8px; font-size: 9px; color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace; padding-top: 4px; flex-shrink: 0; width: 22px;
}
.chart-area { flex: 1; display: flex; min-height: 80px; }
.chart-svg { width: 100%; flex: 1; }
.chart-x-axis {
  display: flex; justify-content: space-around; padding-left: 22px;
  margin-top: 4px; font-size: 8px; color: var(--text-muted);
}

/* Timeout Orders */
.timeout-scroll-container { flex: 1; overflow-y: auto; padding: 0 16px; }
.timeout-scroll-container::-webkit-scrollbar { width: 5px; }
.timeout-scroll-container::-webkit-scrollbar-track { background: var(--bg-main); border-radius: 3px; }
.timeout-scroll-container::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }

.timeout-scroll {
  display: flex; flex-direction: column;
}

.timeout-item {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr;
  gap: 10px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s;
}
.timeout-item:last-child { border-bottom: none; }
.timeout-item:hover { background: var(--bg-main); margin: 0 -18px; padding: 12px 18px; }

.timeout-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.timeout-seq {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
  color: var(--text-primary);
}
.timeout-hospital {
  font-size: 12px; font-weight: 500; color: var(--text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.timeout-details {
  display: flex; gap: 8px; font-size: 11px; color: var(--text-secondary);
}
.timeout-detail { display: flex; align-items: center; gap: 4px; }
.timeout-detail svg { width: 14px; height: 14px; opacity: 0.6; }

.timeout-days {
  font-size: 11px; font-weight: 600; color: #fff;
  background: #ef4444; padding: 4px 10px; border-radius: 12px; width: fit-content;
}

/* Responsive */
@media (max-width: 1600px) {
  .section-row { min-height: 200px; }
  .stats-row { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 1400px) {
  .section-row { min-height: 180px; }
}
@media (max-width: 1200px) {
  .section-row--3-1 { grid-template-columns: 1fr 1fr; }
  .section-row { min-height: 160px; }
}
@media (max-width: 1024px) {
  .section-row--3-1, .section-row--1-1 { grid-template-columns: 1fr; }
  .section-row { min-height: 200px; }
}
</style>
