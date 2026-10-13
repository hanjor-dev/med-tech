<template>
  <div class="fallback-dashboard">
    <DashboardHeader
      title="工作台"
      theme-color="#64748b"
      :loading="loading"
      :refresh-interval="refreshInterval"
      @refresh="handleRefresh"
    />

    <main class="dashboard-main">
      <!-- 通用工作台提示 -->
      <div class="welcome-card">
        <div class="welcome-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="welcome-text">
          <h2>欢迎使用医工智造工作台</h2>
          <p>当前角色暂无专属工作台配置，请联系管理员进行设置</p>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-actions">
        <h3 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          快捷入口
        </h3>
        <div class="action-grid">
          <div v-for="action in quickActions" :key="action.key" class="action-card" @click="handleAction(action.key)">
            <div class="action-icon" :style="{ background: action.bgColor }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="action.icon"></svg>
            </div>
            <span class="action-label">{{ action.label }}</span>
          </div>
        </div>
      </div>

      <!-- 最新动态 -->
      <div class="recent-section">
        <h3 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          最新动态
        </h3>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-dot" :style="{ background: activity.color }"></div>
            <div class="activity-content">
              <span class="activity-text">{{ activity.text }}</span>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardHeader from './dashboardHeader.vue'

const loading = ref(false)
const refreshInterval = ref(300000)

const quickActions = ref([
  { key: 'orders', label: '订单管理', icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>', bgColor: '#dbeafe' },
  { key: 'design', label: '设计管理', icon: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>', bgColor: '#ede9fe' },
  { key: 'production', label: '生产管理', icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>', bgColor: '#d1fae5' },
  { key: 'warehouse', label: '仓储管理', icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>', bgColor: '#ffedd5' },
  { key: 'quality', label: '质量管理', icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>', bgColor: '#cffafe' },
  { key: 'finance', label: '财务管理', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>', bgColor: '#fef3c7' },
])

const recentActivities = ref([
  { id: '1', text: '新订单 ORD-2026-0898 已提交', time: '10分钟前', color: '#3b82f6' },
  { id: '2', text: '设计任务 DS-2026-0234 已完成', time: '30分钟前', color: '#10b981' },
  { id: '3', text: '生产工单 WO-2026-1562 已完成', time: '1小时前', color: '#8b5cf6' },
  { id: '4', text: '质量检验 QC-2026-8921 通过', time: '2小时前', color: '#06b6d4' },
  { id: '5', text: '订单 ORD-2026-0890 已出库', time: '3小时前', color: '#f59e0b' },
])

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1000)
}

function handleAction(key: string) {
  console.log('Navigate to:', key)
}
</script>

<style scoped>
.fallback-dashboard {
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
  gap: 20px;
  overflow-y: auto;
}

.welcome-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 1px solid #dde3ec;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-icon svg {
  width: 32px;
  height: 32px;
  color: #64748b;
}

.welcome-text h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.welcome-text p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.section-title svg {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.quick-actions {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #dde3ec;
  padding: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon svg {
  width: 24px;
  height: 24px;
  color: #475569;
}

.action-label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.recent-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #dde3ec;
  padding: 20px;
  flex: 1;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.activity-text {
  font-size: 13px;
  color: #475569;
}

.activity-time {
  font-size: 11px;
  color: #94a3b8;
}

@media (max-width: 1200px) {
  .action-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
