<template>
  <div class="designer-dashboard">
    <DashboardHeader
      title="设计师工作台"
      theme-color="#7c3aed"
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

      <!-- Row 2: 设计进度 + 任务分布 -->
      <div class="charts-row row-2">
        <div class="chart-card flex-2">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
              </svg>
              设计任务进度
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
            <div class="progress-list">
              <div v-for="item in designProgress" :key="item.name" class="progress-item">
                <div class="progress-info">
                  <span class="progress-name">{{ item.name }}</span>
                  <span class="progress-count">{{ item.completed }}/{{ item.total }}</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar" :style="{ width: (item.completed / item.total * 100) + '%', background: item.color }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-1">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              设计类型分布
            </h3>
          </div>
          <div class="chart-body">
            <div class="type-list">
              <div v-for="item in designTypes" :key="item.name" class="type-item">
                <div class="type-info">
                  <span class="type-dot" :style="{ background: item.color }"></span>
                  <span class="type-name">{{ item.name }}</span>
                </div>
                <div class="type-stats">
                  <span class="type-count">{{ item.count }}</span>
                  <span class="type-percent">{{ item.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: 待设计订单 + 设计完成排行 -->
      <div class="charts-row row-3">
        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              待设计订单
            </h3>
            <span class="chart-subtitle">{{ pendingOrders.length }} 单</span>
          </div>
          <div class="order-list">
            <div v-for="order in pendingOrders" :key="order.id" class="order-item">
              <div class="order-info">
                <span class="order-code">{{ order.code }}</span>
                <span class="order-hospital">{{ order.hospital }}</span>
              </div>
              <div class="order-meta">
                <span class="order-priority" :class="`priority--${order.priority}`">{{ order.priorityText }}</span>
                <span class="order-time">{{ order.createTime }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              设计师完成排行
            </h3>
            <span class="chart-subtitle">TOP 5</span>
          </div>
          <div class="rank-body">
            <div v-for="(item, idx) in designerRanking" :key="item.name" class="rank-item">
              <span class="rank-num" :class="`rank-num--${idx + 1}`">{{ idx + 1 }}</span>
              <div class="rank-info">
                <span class="rank-name">{{ item.name }}</span>
                <div class="rank-bar-bg">
                  <div class="rank-bar" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
              </div>
              <span class="rank-value">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DashboardHeader from './dashboardHeader.vue'

interface DesignProgress {
  name: string
  completed: number
  total: number
  color: string
}

interface DesignType {
  name: string
  count: number
  percent: number
  color: string
}

interface PendingOrder {
  id: string
  code: string
  hospital: string
  priority: 'urgent' | 'normal' | 'low'
  priorityText: string
  createTime: string
}

interface DesignerRank {
  name: string
  count: number
  pct: number
  color: string
}

const loading = ref(false)
const refreshInterval = ref(300000)

const chartTabs = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
]
const activeTab = ref('today')

const stats = ref({
  pending: 28,
  designing: 42,
  completedToday: 18,
  urgentTask: 5,
})

const statCards = computed(() => [
  {
    key: 'pending',
    label: '我的工单',
    value: stats.value.pending,
    trend: 0,
    color: 'purple',
    badge: '需处理',
    badgeColor: 'danger',
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    onClick: () => {},
  },
  {
    key: 'designing',
    label: '待开始工单',
    value: stats.value.designing,
    trend: 0,
    color: 'blue',
    badge: '进行中',
    badgeColor: 'info',
    icon: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>',
    onClick: () => {},
  },
  {
    key: 'completed',
    label: '设计中工单',
    value: stats.value.completedToday,
    trend: 0,
    color: 'green',
    badge: '+5',
    badgeColor: 'success',
    icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    onClick: () => {},
  },
  {
    key: 'urgent',
    label: '已完成',
    value: stats.value.urgentTask,
    trend: 0,
    color: 'orange',
    badge: '优先',
    badgeColor: 'warning',
    icon: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    onClick: () => {},
  },
])

const designProgress = ref<DesignProgress[]>([
  { name: '术前规划', completed: 85, total: 100, color: '#7c3aed' },
  { name: '手术导板', completed: 42, total: 60, color: '#3b82f6' },
  { name: '3D建模', completed: 28, total: 50, color: '#06b6d4' },
  { name: '模型打印', completed: 15, total: 30, color: '#10b981' },
])

const designTypes = ref<DesignType[]>([
  { name: '术前规划', count: 156, percent: 35, color: '#7c3aed' },
  { name: '手术导板', count: 128, percent: 29, color: '#3b82f6' },
  { name: '个性化假体', count: 86, percent: 19, color: '#06b6d4' },
  { name: '其他', count: 76, percent: 17, color: '#94a3b8' },
])

const pendingOrders = ref<PendingOrder[]>([
  { id: '1', code: 'ORD-2026-0898', hospital: '北京协和医院', priority: 'urgent', priorityText: '紧急', createTime: '10分钟前' },
  { id: '2', code: 'ORD-2026-0899', hospital: '上海华山医院', priority: 'normal', priorityText: '普通', createTime: '30分钟前' },
  { id: '3', code: 'ORD-2026-0900', hospital: '广州中山医院', priority: 'normal', priorityText: '普通', createTime: '1小时前' },
  { id: '4', code: 'ORD-2026-0901', hospital: '深圳北大医院', priority: 'low', priorityText: '低', createTime: '2小时前' },
])

const designerRanking = ref<DesignerRank[]>([
  { name: '张工', count: 42, pct: 100, color: '#7c3aed' },
  { name: '李工', count: 38, pct: 90, color: '#3b82f6' },
  { name: '王工', count: 35, pct: 83, color: '#06b6d4' },
  { name: '赵工', count: 28, pct: 67, color: '#10b981' },
  { name: '刘工', count: 22, pct: 52, color: '#f59e0b' },
])

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}
</script>

<style scoped>
.designer-dashboard {
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

.stat-badge--danger { background: #fee2e2; color: #dc2626; }
.stat-badge--info { background: #dbeafe; color: #2563eb; }
.stat-badge--success { background: #d1fae5; color: #059669; }
.stat-badge--warning { background: #ffedd5; color: #ea580c; }

.stat-card--purple .stat-card__icon { background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #7c3aed; }
.stat-card--blue .stat-card__icon { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #3b82f6; }
.stat-card--green .stat-card__icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }
.stat-card--orange .stat-card__icon { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #ea580c; }

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
  color: #7c3aed;
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
  color: #7c3aed;
  box-shadow: 0 1px 4px rgba(124, 58, 237, 0.2);
}

.chart-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  min-height: 0;
}

.progress-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-name {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.progress-count {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.type-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.type-name {
  font-size: 12px;
  color: #475569;
}

.type-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-count {
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
}

.type-percent {
  font-size: 11px;
  color: #94a3b8;
  width: 32px;
  text-align: right;
}

.order-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-code {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

.order-hospital {
  font-size: 11px;
  color: #64748b;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.order-priority {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

.priority--urgent { background: #fee2e2; color: #dc2626; }
.priority--normal { background: #f1f5f9; color: #64748b; }
.priority--low { background: #f1f5f9; color: #94a3b8; }

.order-time {
  font-size: 10px;
  color: #94a3b8;
}

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

.rank-num--1 { background: #7c3aed; color: #fff; }
.rank-num--2 { background: #8b5cf6; color: #fff; }
.rank-num--3 { background: #a78bfa; color: #fff; }
.rank-num--4 { background: #c4b5fd; color: #1e293b; }
.rank-num--5 { background: #ddd6fe; color: #1e293b; }

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

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .row-2, .row-3 { flex-direction: column; }
  .flex-2, .flex-1 { flex: none; }
}
</style>
