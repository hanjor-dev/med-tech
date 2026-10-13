<template>
  <div class="finance-dashboard">
    <DashboardHeader
      title="财务管理看板"
      theme-color="#2563eb"
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
          <div class="stat-card__trend" :class="{ negative: card.trend < 0 }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline v-if="card.trend >= 0" points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline v-else points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            </svg>
            <span>{{ Math.abs(card.trend) }}%</span>
          </div>
        </div>
      </div>

      <!-- Row 2: 收入趋势 + 支出分类 -->
      <div class="charts-row row-2">
        <div class="chart-card flex-2">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="20" x2="12" y2="10"/>
                <line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </svg>
              收入支出趋势
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
            <div class="trend-summary">
              <div class="trend-item">
                <span class="trend-label">收入</span>
                <span class="trend-value income">¥{{ income.toLocaleString() }}</span>
              </div>
              <div class="trend-item">
                <span class="trend-label">支出</span>
                <span class="trend-value expense">¥{{ expense.toLocaleString() }}</span>
              </div>
              <div class="trend-item">
                <span class="trend-label">利润</span>
                <span class="trend-value profit">¥{{ profit.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-1">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0110 10"/>
              </svg>
              支出分类占比
            </h3>
          </div>
          <div class="chart-body">
            <div class="expense-list">
              <div v-for="item in expenseCategories" :key="item.name" class="expense-item">
                <div class="expense-info">
                  <span class="expense-dot" :style="{ background: item.color }"></span>
                  <span class="expense-name">{{ item.name }}</span>
                </div>
                <div class="expense-stats">
                  <span class="expense-amount">¥{{ item.amount.toLocaleString() }}</span>
                  <span class="expense-percent">{{ item.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: 待收款 + 回款统计 -->
      <div class="charts-row row-3">
        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              待收款订单
            </h3>
            <span class="chart-subtitle">{{ pendingPayments.length }} 单</span>
          </div>
          <div class="payment-list">
            <div v-for="item in pendingPayments" :key="item.id" class="payment-item">
              <div class="payment-info">
                <span class="payment-code">{{ item.code }}</span>
                <span class="payment-customer">{{ item.customer }}</span>
              </div>
              <div class="payment-amount">
                <span class="amount-value">¥{{ item.amount.toLocaleString() }}</span>
                <span class="amount-status" :class="`status--${item.status}`">{{ item.statusText }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
              回款统计
            </h3>
            <span class="chart-subtitle">TOP 5</span>
          </div>
          <div class="rank-body">
            <div v-for="(item, idx) in paymentRanking" :key="item.customer" class="rank-item">
              <span class="rank-num" :class="`rank-num--${idx + 1}`">{{ idx + 1 }}</span>
              <div class="rank-info">
                <span class="rank-name">{{ item.customer }}</span>
                <div class="rank-bar-bg">
                  <div class="rank-bar" :style="{ width: item.pct + '%', background: item.color }"></div>
                </div>
              </div>
              <span class="rank-value">¥{{ item.amount.toLocaleString() }}</span>
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
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
]
const activeTab = ref('month')

const stats = ref({
  totalIncome: 2850000,
  totalExpense: 1860000,
  profit: 990000,
  pendingReceive: 580000,
})

const income = computed(() => stats.value.totalIncome)
const expense = computed(() => stats.value.totalExpense)
const profit = computed(() => stats.value.profit)

const statCards = computed(() => [
  {
    key: 'income',
    label: '总收入',
    value: stats.value.totalIncome,
    trend: 15.8,
    color: 'blue',
    icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    onClick: () => {},
  },
  {
    key: 'expense',
    label: '总支出',
    value: stats.value.totalExpense,
    trend: -8.2,
    color: 'orange',
    icon: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    onClick: () => {},
  },
  {
    key: 'profit',
    label: '净利润',
    value: stats.value.profit,
    trend: 22.5,
    color: 'green',
    icon: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    onClick: () => {},
  },
  {
    key: 'pending',
    label: '待收款',
    value: stats.value.pendingReceive,
    trend: 0,
    color: 'purple',
    badge: '待确认',
    icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    onClick: () => {},
  },
])

const expenseCategories = ref([
  { name: '材料成本', amount: 856000, percent: 46, color: '#3b82f6' },
  { name: '设备折旧', amount: 320000, percent: 17, color: '#8b5cf6' },
  { name: '人工成本', amount: 420000, percent: 23, color: '#06b6d4' },
  { name: '运营费用', amount: 264000, percent: 14, color: '#f59e0b' },
])

const pendingPayments = ref([
  { id: '1', code: 'ORD-2026-0856', customer: '北京协和医院', amount: 128000, status: 'overdue', statusText: '逾期' },
  { id: '2', code: 'ORD-2026-0862', customer: '上海华山医院', amount: 86000, status: 'pending', statusText: '待确认' },
  { id: '3', code: 'ORD-2026-0868', customer: '广州中山医院', amount: 156000, status: 'pending', statusText: '待确认' },
  { id: '4', code: 'ORD-2026-0875', customer: '深圳北大医院', amount: 92000, status: 'pending', statusText: '待确认' },
])

const paymentRanking = ref([
  { customer: '北京协和医院', amount: 485000, pct: 100, color: '#3b82f6' },
  { customer: '上海华山医院', amount: 368000, pct: 76, color: '#8b5cf6' },
  { customer: '广州中山医院', amount: 285000, pct: 59, color: '#06b6d4' },
  { customer: '深圳北大医院', amount: 196000, pct: 40, color: '#10b981' },
  { customer: '成都华西医院', amount: 142000, pct: 29, color: '#f59e0b' },
])

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}
</script>

<style scoped>
.finance-dashboard {
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
  font-size: 20px;
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
  color: #10b981;
  flex-shrink: 0;
}

.stat-card__trend svg {
  width: 13px;
  height: 13px;
}

.stat-card__trend.negative {
  color: #ef4444;
}

.stat-card--blue .stat-card__icon { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }
.stat-card--orange .stat-card__icon { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #ea580c; }
.stat-card--green .stat-card__icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }
.stat-card--purple .stat-card__icon { background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #7c3aed; }

.charts-row {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}

.row-2 { flex-shrink: 0; min-height: 200px; }
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
  color: #2563eb;
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
  color: #2563eb;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.2);
}

.chart-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  min-height: 0;
}

.trend-summary {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.trend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.trend-label {
  font-size: 12px;
  color: #64748b;
}

.trend-value {
  font-size: 22px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

.trend-value.income { color: #2563eb; }
.trend-value.expense { color: #ea580c; }
.trend-value.profit { color: #059669; }

.expense-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expense-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.expense-name {
  font-size: 12px;
  color: #475569;
}

.expense-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expense-amount {
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
}

.expense-percent {
  font-size: 11px;
  color: #94a3b8;
  min-width: 32px;
  text-align: right;
}

.payment-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-code {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

.payment-customer {
  font-size: 11px;
  color: #64748b;
}

.payment-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount-value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
}

.amount-status {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

.status--overdue { background: #fee2e2; color: #dc2626; }
.status--pending { background: #fef3c7; color: #d97706; }

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

.rank-num--1 { background: #2563eb; color: #fff; }
.rank-num--2 { background: #3b82f6; color: #fff; }
.rank-num--3 { background: #60a5fa; color: #fff; }
.rank-num--4 { background: #93c5fd; color: #1e293b; }
.rank-num--5 { background: #bfdbfe; color: #1e293b; }

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
  min-width: 70px;
  text-align: right;
}

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .row-2, .row-3 { flex-direction: column; }
  .flex-2, .flex-1 { flex: none; }
}
</style>
