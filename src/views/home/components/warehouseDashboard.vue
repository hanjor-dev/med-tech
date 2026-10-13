<template>
  <div class="warehouse-dashboard">
    <DashboardHeader
      title="仓储管理看板"
      theme-color="#ea580c"
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

      <!-- Row 2: 库位分布 + 库存预警 -->
      <div class="charts-row row-2">
        <div class="chart-card flex-2">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              库位使用情况
            </h3>
          </div>
          <div class="chart-body">
            <div class="storage-grid">
              <div v-for="(zone, idx) in storageZones" :key="idx" class="storage-zone">
                <div class="zone-header">
                  <span class="zone-name">{{ zone.name }}</span>
                  <span class="zone-usage" :class="{ warning: zone.usage > 80 }">{{ zone.usage }}%</span>
                </div>
                <div class="zone-bar-bg">
                  <div class="zone-bar" :style="{ width: zone.usage + '%', background: zone.color }"></div>
                </div>
                <div class="zone-info">
                  <span>{{ zone.used }}/{{ zone.total }} 位</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-1">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              库存预警
            </h3>
            <span class="chart-subtitle">{{ alerts.length }} 条</span>
          </div>
          <div class="alert-list">
            <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="`alert--${alert.level}`">
              <div class="alert-header">
                <span class="alert-material">{{ alert.material }}</span>
                <span class="alert-level" :class="`level--${alert.level}`">{{ alert.levelText }}</span>
              </div>
              <span class="alert-desc">{{ alert.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: 入库记录 + 出库记录 -->
      <div class="charts-row row-3">
        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              入库记录
            </h3>
            <span class="chart-subtitle">{{ inRecords.length }} 条</span>
          </div>
          <div class="record-list">
            <div v-for="record in inRecords" :key="record.id" class="record-item">
              <div class="record-info">
                <span class="record-code">{{ record.code }}</span>
                <span class="record-material">{{ record.material }}</span>
              </div>
              <div class="record-meta">
                <span class="record-quantity">+{{ record.quantity }}</span>
                <span class="record-time">{{ record.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 3 3 3 3 9"/>
                <polyline points="15 21 21 21 21 15"/>
                <line x1="3" y1="9" x2="10" y2="16"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
              </svg>
              出库记录
            </h3>
            <span class="chart-subtitle">{{ outRecords.length }} 条</span>
          </div>
          <div class="record-list">
            <div v-for="record in outRecords" :key="record.id" class="record-item">
              <div class="record-info">
                <span class="record-code">{{ record.code }}</span>
                <span class="record-material">{{ record.material }}</span>
              </div>
              <div class="record-meta">
                <span class="record-quantity out">-{{ record.quantity }}</span>
                <span class="record-time">{{ record.time }}</span>
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

const stats = ref({
  totalItems: 2856,
  inStock: 1680,
  outStock: 896,
  lowStock: 42,
})

const statCards = computed(() => [
  {
    key: 'total',
    label: '库存总量',
    value: stats.value.totalItems,
    color: 'orange',
    badge: '件',
    badgeColor: 'info',
    icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>',
    onClick: () => {},
  },
  {
    key: 'inStock',
    label: '在库',
    value: stats.value.inStock,
    color: 'green',
    badge: '正常',
    badgeColor: 'success',
    icon: '<polyline points="20 6 9 17 4 12"/>',
    onClick: () => {},
  },
  {
    key: 'outStock',
    label: '已出库',
    value: stats.value.outStock,
    color: 'blue',
    badge: '本月',
    badgeColor: 'info',
    icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>',
    onClick: () => {},
  },
  {
    key: 'lowStock',
    label: '库存不足',
    value: stats.value.lowStock,
    color: 'red',
    badge: '需补货',
    badgeColor: 'danger',
    icon: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>',
    onClick: () => {},
  },
])

const storageZones = ref([
  { name: 'A区 - 原材料', used: 42, total: 50, usage: 84, color: '#3b82f6' },
  { name: 'B区 - 半成品', used: 28, total: 40, usage: 70, color: '#10b981' },
  { name: 'C区 - 成品', used: 36, total: 60, usage: 60, color: '#8b5cf6' },
  { name: 'D区 - 包材', used: 18, total: 30, usage: 60, color: '#f59e0b' },
])

const alerts = ref([
  { id: '1', level: 'high', levelText: '紧急', material: 'PLA材料', desc: '库存不足10件，需立即补货' },
  { id: '2', level: 'medium', levelText: '预警', material: '光敏树脂', desc: '库存低于安全库存' },
  { id: '3', level: 'low', levelText: '提示', material: '包装盒', desc: '库存偏低，建议补货' },
])

const inRecords = ref([
  { id: '1', code: 'IN-2026-1892', material: 'PLA材料', quantity: 100, time: '10分钟前' },
  { id: '2', code: 'IN-2026-1893', material: '光敏树脂', quantity: 50, time: '30分钟前' },
  { id: '3', code: 'IN-2026-1894', material: '包装盒', quantity: 200, time: '1小时前' },
  { id: '4', code: 'IN-2026-1895', material: '支撑材料', quantity: 80, time: '2小时前' },
])

const outRecords = ref([
  { id: '1', code: 'OUT-2026-0892', material: '手术导板', quantity: 5, time: '5分钟前' },
  { id: '2', code: 'OUT-2026-0893', material: '术前规划', quantity: 3, time: '20分钟前' },
  { id: '3', code: 'OUT-2026-0894', material: '3D模型', quantity: 8, time: '1小时前' },
  { id: '4', code: 'OUT-2026-0895', material: '个性化假体', quantity: 2, time: '2小时前' },
])

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}
</script>

<style scoped>
.warehouse-dashboard {
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
.stat-badge--success { background: #d1fae5; color: #059669; }
.stat-badge--danger { background: #fee2e2; color: #dc2626; }

.stat-card--orange .stat-card__icon { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #ea580c; }
.stat-card--green .stat-card__icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }
.stat-card--blue .stat-card__icon { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }
.stat-card--red .stat-card__icon { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #dc2626; }

.charts-row {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}

.row-2 { flex-shrink: 0; min-height: 220px; }
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
  color: #ea580c;
}

.chart-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
}

.chart-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  min-height: 0;
}

.storage-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.storage-zone {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zone-name {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.zone-usage {
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #059669;
}

.zone-usage.warning {
  color: #ea580c;
}

.zone-bar-bg {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.zone-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.zone-info {
  font-size: 11px;
  color: #94a3b8;
}

.alert-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 0 14px 14px;
}

.alert-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid;
}

.alert--high {
  background: #fef2f2;
  border-color: #dc2626;
}

.alert--medium {
  background: #fffbeb;
  border-color: #f59e0b;
}

.alert--low {
  background: #f8fafc;
  border-color: #94a3b8;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-material {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.alert-level {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

.level--high { background: #fee2e2; color: #dc2626; }
.level--medium { background: #fef3c7; color: #d97706; }
.level--low { background: #f1f5f9; color: #64748b; }

.alert-desc {
  font-size: 11px;
  color: #64748b;
}

.record-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 0 14px 14px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-code {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

.record-material {
  font-size: 11px;
  color: #64748b;
}

.record-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-quantity {
  font-size: 14px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #059669;
}

.record-quantity.out {
  color: #dc2626;
}

.record-time {
  font-size: 10px;
  color: #94a3b8;
}

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .row-2, .row-3 { flex-direction: column; }
  .flex-2, .flex-1 { flex: none; }
  .storage-grid { grid-template-columns: 1fr; }
}
</style>
