<template>
  <div class="quality-dashboard">
    <DashboardHeader
      title="质量管理看板"
      theme-color="#0891b2"
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

      <!-- Row 2: 质检进度 + 不良分析 -->
      <div class="charts-row row-2">
        <div class="chart-card flex-2">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              质检进度
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
            <div class="qc-progress">
              <div class="qc-summary">
                <div class="qc-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#0891b2" stroke-width="8"
                      :stroke-dasharray="`${passRate * 2.51} 251`" stroke-linecap="round"/>
                  </svg>
                  <div class="qc-circle-text">
                    <span class="qc-percent">{{ passRate }}%</span>
                    <span class="qc-label">合格率</span>
                  </div>
                </div>
                <div class="qc-stats">
                  <div class="qc-stat">
                    <span class="qc-stat-value pass">{{ passed }}</span>
                    <span class="qc-stat-label">合格</span>
                  </div>
                  <div class="qc-stat">
                    <span class="qc-stat-value fail">{{ failed }}</span>
                    <span class="qc-stat-label">不合格</span>
                  </div>
                  <div class="qc-stat">
                    <span class="qc-stat-value rework">{{ rework }}</span>
                    <span class="qc-stat-label">返工</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-1">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              不良类型分析
            </h3>
          </div>
          <div class="chart-body">
            <div class="defect-list">
              <div v-for="item in defectTypes" :key="item.name" class="defect-item">
                <div class="defect-info">
                  <span class="defect-dot" :style="{ background: item.color }"></span>
                  <span class="defect-name">{{ item.name }}</span>
                </div>
                <div class="defect-stats">
                  <span class="defect-count">{{ item.count }}</span>
                  <span class="defect-percent">{{ item.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: 质检记录 + 问题追踪 -->
      <div class="charts-row row-3">
        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              最新质检记录
            </h3>
            <span class="chart-subtitle">{{ qcRecords.length }} 条</span>
          </div>
          <div class="record-list">
            <div v-for="record in qcRecords" :key="record.id" class="record-item">
              <div class="record-info">
                <span class="record-code">{{ record.code }}</span>
                <span class="record-type">{{ record.type }}</span>
              </div>
              <div class="record-result" :class="`result--${record.result}`">
                {{ record.resultText }}
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card flex-equal">
          <div class="chart-header">
            <h3 class="chart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              问题追踪
            </h3>
            <span class="chart-subtitle">{{ issues.length }} 项</span>
          </div>
          <div class="issue-list">
            <div v-for="issue in issues" :key="issue.id" class="issue-item">
              <div class="issue-header">
                <span class="issue-code">{{ issue.code }}</span>
                <span class="issue-level" :class="`level--${issue.level}`">{{ issue.levelText }}</span>
              </div>
              <span class="issue-desc">{{ issue.desc }}</span>
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
  total: 1286,
  passed: 1250,
  failed: 18,
  rework: 18,
})

const passRate = computed(() => Math.round((stats.value.passed / stats.value.total) * 100))
const passed = computed(() => stats.value.passed)
const failed = computed(() => stats.value.failed)
const rework = computed(() => stats.value.rework)

const statCards = computed(() => [
  {
    key: 'total',
    label: '检验总数',
    value: stats.value.total,
    color: 'cyan',
    badge: '本月',
    badgeColor: 'info',
    icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    onClick: () => {},
  },
  {
    key: 'passed',
    label: '合格数量',
    value: stats.value.passed,
    color: 'green',
    badge: `${passRate.value}%`,
    badgeColor: 'success',
    icon: '<polyline points="20 6 9 17 4 12"/>',
    onClick: () => {},
  },
  {
    key: 'failed',
    label: '不合格',
    value: stats.value.failed,
    color: 'red',
    badge: '需处理',
    badgeColor: 'danger',
    icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    onClick: () => {},
  },
  {
    key: 'rework',
    label: '返工数量',
    value: stats.value.rework,
    color: 'orange',
    badge: '跟进中',
    badgeColor: 'warning',
    icon: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
    onClick: () => {},
  },
])

const defectTypes = ref([
  { name: '尺寸偏差', count: 8, percent: 44, color: '#ef4444' },
  { name: '表面瑕疵', count: 5, percent: 28, color: '#f59e0b' },
  { name: '结构缺陷', count: 3, percent: 17, color: '#8b5cf6' },
  { name: '材料问题', count: 2, percent: 11, color: '#64748b' },
])

const qcRecords = ref([
  { id: '1', code: 'QC-2026-8921', type: '手术导板', result: 'pass', resultText: '合格' },
  { id: '2', code: 'QC-2026-8922', type: '术前规划', result: 'pass', resultText: '合格' },
  { id: '3', code: 'QC-2026-8923', type: '3D模型', result: 'fail', resultText: '不合格' },
  { id: '4', code: 'QC-2026-8924', type: '个性化假体', result: 'pass', resultText: '合格' },
])

const issues = ref([
  { id: '1', code: 'ISS-2026-156', level: 'high', levelText: '高', desc: '打印机-02 精度偏差超标' },
  { id: '2', code: 'ISS-2026-157', level: 'medium', levelText: '中', desc: '某批次材料硬度不足' },
  { id: '3', code: 'ISS-2026-158', level: 'low', levelText: '低', desc: '包装防护需加强' },
])

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}
</script>

<style scoped>
.quality-dashboard {
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
.stat-badge--warning { background: #ffedd5; color: #ea580c; }

.stat-card--cyan .stat-card__icon { background: linear-gradient(135deg, #cffafe, #a5f3fc); color: #0891b2; }
.stat-card--green .stat-card__icon { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }
.stat-card--red .stat-card__icon { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #dc2626; }
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
  color: #0891b2;
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
  color: #0891b2;
  box-shadow: 0 1px 4px rgba(8, 145, 178, 0.2);
}

.chart-body {
  padding: 14px 18px;
  flex: 1;
  display: flex;
  min-height: 0;
}

.qc-progress {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qc-summary {
  display: flex;
  align-items: center;
  gap: 40px;
}

.qc-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.qc-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.qc-circle-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qc-percent {
  font-size: 24px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  color: #0891b2;
}

.qc-label {
  font-size: 11px;
  color: #64748b;
}

.qc-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qc-stat {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qc-stat-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  min-width: 50px;
}

.qc-stat-value.pass { color: #059669; }
.qc-stat-value.fail { color: #dc2626; }
.qc-stat-value.rework { color: #ea580c; }

.qc-stat-label {
  font-size: 12px;
  color: #64748b;
}

.defect-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.defect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.defect-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.defect-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.defect-name {
  font-size: 12px;
  color: #475569;
}

.defect-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.defect-count {
  font-size: 14px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
}

.defect-percent {
  font-size: 11px;
  color: #94a3b8;
  min-width: 32px;
  text-align: right;
}

.record-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
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

.record-type {
  font-size: 11px;
  color: #64748b;
}

.record-result {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
}

.result--pass { background: #d1fae5; color: #059669; }
.result--fail { background: #fee2e2; color: #dc2626; }
.result--rework { background: #ffedd5; color: #ea580c; }

.issue-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.issue-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #fef3c7;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-code {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

.issue-level {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

.level--high { background: #fee2e2; color: #dc2626; }
.level--medium { background: #ffedd5; color: #ea580c; }
.level--low { background: #f1f5f9; color: #64748b; }

.issue-desc {
  font-size: 11px;
  color: #64748b;
}

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .row-2, .row-3 { flex-direction: column; }
  .flex-2, .flex-1 { flex: none; }
}
</style>
