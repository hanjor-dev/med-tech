<template>
  <div class="dashboard-header">
    <div class="header-left">
      <div class="time-info">
        <span class="time-main">{{ currentTime }}</span>
        <span class="time-date">{{ currentDate }}</span>
      </div>
      <div class="divider" />
      <div class="refresh-control">
        <span class="refresh-label">刷新</span>
        <el-select v-model="localRefreshInterval" size="small" class="refresh-select" @change="handleRefreshIntervalChange">
          <el-option label="15秒" :value="15000" />
          <el-option label="30秒" :value="30000" />
          <el-option label="1分钟" :value="60000" />
          <el-option label="3分钟" :value="180000" />
          <el-option label="5分钟" :value="300000" />
        </el-select>
      </div>
    </div>

    <div class="header-center">
      <div class="title-wrapper">
        <div class="title-line left" />
        <div class="title-content">
          <h1 class="header-title">{{ title }}</h1>
          <!-- <div class="title-sub">{{ subtitle }}</div> -->
        </div>
        <div class="title-line right" />
      </div>
    </div>

    <div class="header-right">
      <div class="time-range-wrapper">
        <el-radio-group v-model="localTimeRange" size="small" class="time-range-group" @change="handleTimeRangeChange">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
          <el-radio-button value="quarter">季度</el-radio-button>
          <el-radio-button value="year">年度</el-radio-button>
          <el-radio-button value="custom">自定义</el-radio-button>
        </el-radio-group>
        <transition name="slide-fade">
          <div v-if="localTimeRange === 'custom'" class="date-picker-dropdown">
            <el-date-picker
              v-model="customDateRange"
              type="daterange"
              size="small"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              value-format="YYYY-MM-DD"
              :clearable="false"
              @change="handleCustomDateChange"
              class="custom-date-picker"
            />
          </div>
        </transition>
      </div>
      <div class="action-buttons">
        <el-button :icon="Refresh" :loading="loading" circle size="small" class="action-btn" @click="$emit('refresh')" />
        <el-button :icon="isFullscreen ? Aim : FullScreen" circle size="small" class="action-btn" @click="toggleFullscreen" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Refresh, FullScreen, Aim } from '@element-plus/icons-vue'

interface TimeRange {
  start: string
  end: string
}

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  themeColor?: string
  loading?: boolean
  refreshInterval?: number
}>(), {
  title: '医 工 宝',
  subtitle: '数据看板系统',
  themeColor: '#0ea5e9',
  loading: false,
  refreshInterval: 300000,
})

const emit = defineEmits<{
  refresh: []
  'time-range-change': [range: TimeRange]
}>()

const currentTime = ref<string>('')
const currentDate = ref<string>('')
const localRefreshInterval = ref(props.refreshInterval)
const localTimeRange = ref('today')
const customDateRange = ref<[string, string] | null>(null)
const isFullscreen = ref(false)

function updateTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`

  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  currentDate.value = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')} ${weekDay}`
}

function handleRefreshIntervalChange() {
  emit('time-range-change', { start: '', end: '' })
}

function handleTimeRangeChange(value: string) {
  if (value !== 'custom') {
    emit('time-range-change', { start: '', end: '' })
  }
}

function handleCustomDateChange(dates: [string, string] | null) {
  if (dates?.[0] && dates?.[1]) {
    emit('time-range-change', { start: dates[0], end: dates[1] })
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateTime()
  clockTimer = setInterval(updateTime, 1000)
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

watch(() => props.refreshInterval, (val) => {
  localRefreshInterval.value = val
})
</script>

<style scoped>
.dashboard-header {
  --theme-color: v-bind(themeColor);
  --theme-light: color-mix(in srgb, v-bind(themeColor) 12%, white);
  --theme-lighter: color-mix(in srgb, v-bind(themeColor) 8%, white);

  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  flex-shrink: 0;
  padding: 0 24px;
  background: linear-gradient(180deg, #ffffff 0%, var(--theme-lighter) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--theme-color), transparent);
  opacity: 0.6;
}

/* Left Section */
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.time-main {
  font-size: 15px;
  font-weight: 600;
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
  color: #1e293b;
  letter-spacing: 1px;
}

.time-date {
  font-size: 10px;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.refresh-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-label {
  font-size: 12px;
  color: #94a3b8;
}

.refresh-select {
  width: 80px;
}

/* Center Section */
.header-center {
  position: absolute;
  left: 45%;
  transform: translateX(-50%);
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--theme-color));
  position: relative;
}

.title-line.right {
  background: linear-gradient(90deg, var(--theme-color), transparent);
}

.title-line::before {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--theme-color);
  top: 50%;
  transform: translateY(-50%);
}

.title-line.left::before {
  right: 0;
}

.title-line.right::before {
  left: 0;
}

.title-content {
  text-align: center;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 6px;
  color: #0f172a;
  margin: 0;
  background: linear-gradient(135deg, #0f172a 0%, var(--theme-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-sub {
  font-size: 10px;
  color: #94a3b8;
  letter-spacing: 2px;
  margin-top: 2px;
}

/* Right Section */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

.time-range-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 100;
}

.time-range-group {
  display: flex;
}

.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.custom-date-picker {
  width: 260px;
}

.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: transparent !important;
  border-color: #dcdfe6 !important;
  color: #909399 !important;
}

.action-btn:hover {
  border-color: var(--theme-color) !important;
  color: var(--theme-color) !important;
}

/* Element Plus Overrides */
:deep(.el-select .el-input__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: var(--theme-color) !important;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  border-color: var(--theme-color) !important;
  box-shadow: 0 0 0 2px var(--theme-light) !important;
}

:deep(.el-input__inner) {
  font-size: 12px !important;
  color: #64748b !important;
}

:deep(.el-select-dropdown__item) {
  font-size: 12px !important;
  padding: 6px 12px !important;
}

:deep(.el-radio-button__inner) {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #64748b !important;
  padding: 5px 10px !important;
  font-size: 11px !important;
  border-radius: 4px !important;
  transition: all 0.15s ease !important;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 4px !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--theme-color) !important;
  border-color: var(--theme-color) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover) {
  background: color-mix(in srgb, var(--theme-color) 85%, black) !important;
}
</style>
