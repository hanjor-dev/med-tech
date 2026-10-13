<template>
  <div class="list-page" :class="`list-page--${pageClass}`">
    <!-- Slot: page-header-extra — 插在 Hero 右侧，可在外部传入操作按钮等 -->
    <slot name="page-header-extra" />
    <!-- Hero + Stats 双栏布局 -->
    <div class="page-hero-wrapper">
      <!-- 左列：Hero + filter-bottom -->
      <div class="page-hero-col-left">
        <!-- Slot: page-hero-custom — 完全自定义 Hero（替代默认 Hero） -->
        <slot name="page-hero-custom">
          <!-- 默认 Page Hero -->
          <div class="page-hero" v-if="!hideHero">
            <div class="page-hero-eyebrow">{{ heroEyebrow }}</div>
            <h1 class="page-hero-title">{{ heroTitle }}</h1>
            <p class="page-hero-desc">{{ heroDesc }}</p>
          </div>
        </slot>
        <slot name="hero-right" />
        <!-- Slot: filter-bottom — 如 Tab 栏，无内容时不渲染容器 -->
        <div v-if="$slots['filter-bottom']" class="filter-bottom">
          <slot name="filter-bottom" />
        </div>
      </div>
      <!-- 右列：stats-row-custom，垂直居中 -->
      <div class="page-hero-col-right">
        <slot name="stats-row-custom">
          <!-- 默认 Stats Row -->
          <div class="hero-stat-row" v-if="!hideStats && stats.length > 0"
            :style="{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }">
            <div class="hero-stat-chip" v-for="(stat, idx) in stats" :key="stat.label" :class="`hero-stat-chip--${idx}`">
              <div class="hero-stat-icon-wrap">
                <el-icon><component :is="stat.icon" /></el-icon>
              </div>
              <div class="hero-stat-info">
                <div class="hero-stat-value">{{ stat.value }}</div>
                <div class="hero-stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>
    <!-- Slot: filter-bar-custom — 完全自定义筛选栏 -->
    <slot name="filter-bar-custom">
      <!-- 默认 Filter Bar -->
      <div class="filter-bar" v-if="!hideFilter" role="toolbar" aria-label="筛选工具栏">
        <!-- 搜索框（自动聚焦） -->
        <!-- 多输入框模式 -->
        <template v-if="filterInputs && filterInputs.length">
          <div v-for="f in filterInputs" :key="f.modelKey" class="filter-input">
            <el-icon class="filter-icon">
              <Search />
            </el-icon>
            <el-input
              v-model="filterInputsData[f.modelKey]"
              :placeholder="f.placeholder || '搜索...'"
              clearable
              @blur="$emit('filter-input-trigger', { modelKey: f.modelKey, value: filterInputsData[f.modelKey] })"
              @keyup.enter="$emit('filter-input-trigger', { modelKey: f.modelKey, value: filterInputsData[f.modelKey] })"
            />
          </div>
        </template>
        <!-- 单输入框兼容模式 -->
        <div class="filter-input" v-else-if="filterSearchable">
          <el-icon class="filter-icon">
            <Search />
          </el-icon>
          <el-input v-model="filterSearchText" :placeholder="filterSearchPlaceholder || '搜索...'" clearable
            @keyup.enter="$emit('filter-search', filterSearchText)"
            @blur="$emit('filter-search', filterSearchText)" />
        </div>

        <!-- Select 型筛选项 -->
        <template v-if="filterSelects && filterSelects.length">
          <el-select v-for="f in filterSelects" :key="f.modelKey" v-model="(filterSelectsData as any)[f.modelKey]"
            :placeholder="f.placeholder" class="filter-select" clearable @change="onFilterSelectChange(f.modelKey)">
            <el-option v-for="opt in f.options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </template>

        <!-- Date Range 筛选项 -->
        <div>
          <template v-if="filterDateRanges && filterDateRanges.length">
            <el-date-picker v-for="f in filterDateRanges" :key="f.modelKey" v-model="filterDateRangesData[f.modelKey]"
              type="datetimerange" range-separator="至" :start-placeholder="f.startPlaceholder || '开始日期'"
              :end-placeholder="f.endPlaceholder || '结束日期'" :value-format="f.valueFormat || 'YYYY-MM-DD HH:mm:ss'" clearable
              @change="onDateRangeChange(f.modelKey)" />
          </template>
        </div>


        <!-- Slot: filter-extra-actions — 筛选栏右侧扩展操作 -->
        <slot name="filter-extra-actions">
          <div class="filter-actions">
            <el-button class="filter-btn" @click="handleFilterReset" v-if="showFilterReset">
              重置
            </el-button>
            <!-- <el-button type="primary" @click="handleFilterReset" v-if="showFilterReset">
              <el-icon>
                <Search />
              </el-icon>
              查询
            </el-button> -->
            <slot name="filter-create-btn">
              <el-button type="primary" @click="$emit('filter-create')" class="table-btn-primary"
                v-if="showFilterCreate">
                <el-icon>
                  <Plus />
                </el-icon>
                {{ filterCreateLabel || '新建' }}
              </el-button>
            </slot>

          </div>
        </slot>
      </div>
    </slot>
    <!-- 主内容区 -->
    <div class="page-main">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, provide, useSlots } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'

const slots = useSlots()

// ── Stat Item ──
export interface StatItem {
  label: string
  value: string | number
  icon: any
}

// ── Filter Select Item ──
export interface FilterSelect {
  /** v-model 绑定到的 key（必须唯一） */
  modelKey: string
  placeholder?: string
  options: Array<{ label: string; value: any }>
}

// ── Filter Input Item ──
export interface FilterInput {
  /** v-model 绑定到的 key（必须唯一），emit 时作为字段名 */
  modelKey: string
  placeholder?: string
}

// ── Filter Date Range Item ──
export interface FilterDateRange {
  /** v-model 绑定到的 key（必须唯一），emit 时作为字段名 */
  modelKey: string
  startPlaceholder?: string
  endPlaceholder?: string
  /** 日期格式，默认为 YYYY-MM-DD */
  valueFormat?: string
  /** 默认宽度 */
  width?: string
}

const props = withDefaults(defineProps<{
  /** 页面 Class（用于 BEM 变体） */
  pageClass?: string
  /** 是否隐藏 Hero */
  hideHero?: boolean
  /** 是否隐藏 Stats Row */
  hideStats?: boolean
  /** 是否隐藏 Filter Bar */
  hideFilter?: boolean

  // Hero
  heroEyebrow?: string
  heroTitle?: string
  heroDesc?: string

  // Stats
  stats?: StatItem[]

  // Filter
  /** 搜索框是否显示（单输入框兼容模式） */
  filterSearchable?: boolean
  filterSearchPlaceholder?: string
  /** 多输入框配置（优先级高于 filterSearchable） */
  filterInputs?: FilterInput[]
  /** Select 型筛选项 */
  filterSelects?: FilterSelect[]
  /** 日期范围筛选项 */
  filterDateRanges?: FilterDateRange[]
  showFilterReset?: boolean
  showFilterCreate?: boolean
  filterCreateLabel?: string
}>(), {
  pageClass: 'default',
  hideHero: false,
  hideStats: false,
  hideFilter: false,
  heroEyebrow: '',
  heroTitle: '',
  heroDesc: '',
  stats: () => [],
  filterSearchable: false,
  showFilterReset: true,
  showFilterCreate: true,
  filterCreateLabel: '新建',
})

const emit = defineEmits<{
  'filter-search': [keyword: string]
  'filter-reset': []
  'filter-create': []
  'filter-change': [key: string, value: any]
  /** 任意一个多输入框值变化时触发，payload 为 { modelKey, value } */
  'filter-input-change': [payload: { modelKey: string; value: string }]
  /** 多输入框触发查询时触发（blur / Enter），payload 为 { modelKey, value } */
  'filter-input-trigger': [payload: { modelKey: string; value: string }]
}>()

// ── Filter Inputs (multi-input mode) ──
const filterInputsData = reactive<Record<string, string>>({})
if (props.filterInputs) {
  props.filterInputs.forEach(f => {
    filterInputsData[f.modelKey] = ''
  })
}

// ── Filter Search ──
const filterSearchText = ref('')

// ── Filter Inputs (multi) ──
if (props.filterInputs) {
  props.filterInputs.forEach(f => {
    watch(
      () => filterInputsData[f.modelKey],
      (val) => emit('filter-input-change', { modelKey: f.modelKey, value: val })
    )
  })
}

// ── Filter Selects ──
const filterSelectsData = reactive<Record<string, any>>({})
if (props.filterSelects) {
  props.filterSelects.forEach(f => {
    filterSelectsData[f.modelKey] = undefined
  })
}

const onFilterSelectChange = (key: string) => {
  emit('filter-change', key, filterSelectsData[key])
}

// ── Filter Date Ranges ──
const filterDateRangesData = reactive<Record<string, string[] | null>>({})
if (props.filterDateRanges) {
  props.filterDateRanges.forEach(f => {
    filterDateRangesData[f.modelKey] = null
  })
}

const onDateRangeChange = (key: string) => {
  emit('filter-change', key, filterDateRangesData[key])
}

// ── Filter Reset ──
const handleFilterReset = () => {
  filterSearchText.value = ''
  if (props.filterInputs) {
    props.filterInputs.forEach(f => {
      filterInputsData[f.modelKey] = ''
    })
  }
  if (props.filterSelects) {
    props.filterSelects.forEach(f => {
      filterSelectsData[f.modelKey] = undefined
    })
  }
  if (props.filterDateRanges) {
    props.filterDateRanges.forEach(f => {
      filterDateRangesData[f.modelKey] = null
    })
  }
  emit('filter-reset')
}

// 暴露给父组件获取当前筛选项状态
defineExpose({
  filterSearchText,
  filterSelectsData,
  filterInputsData,
  filterDateRangesData,
  handleFilterReset,
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;
// ── Page Layout ──
.list-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  background: #f0f2f5;
}

// ── Hero + Stats 双栏布局 ──
.page-hero-wrapper {
  display: flex;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 16px;
  animation: fadeSlideUp 0.4s ease 0.08s both;
}

// 左列：Hero + hero-right slot + filter-bottom
.page-hero-col-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

// ── Page Hero（纯文本，无 flex 包装） ──
.page-hero {
  margin-bottom: 0;
}

.page-hero-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: #2f5bff;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 14px;
    height: 2px;
    background: #2f5bff;
    border-radius: 2px;
  }
}

.page-hero-title {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
  line-height: 1.2;
  margin: 0 0 5px;
}

.page-hero-desc {
  font-size: 13.5px;
  color: #6b7280;
  margin: 0;
}

// ── Filter Bottom ──
.filter-bottom {
  display: flex;
  align-items: center;
  margin-top: 14px;
  animation: fadeSlideUp 0.4s ease 0.18s both;
}

// ── 右列：stats-row-custom，垂直居中 ──
.page-hero-col-right {
  min-width: 0;
  display: flex;
  align-items: center;
}

// ── Hero Stat Row ──
.hero-stat-row {
  display: grid;
  gap: 10px;
  animation: fadeSlideUp 0.4s ease 0.12s both;
}

.hero-stat-chip {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: default;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border-color: #b8c5e8;
  }
}

.hero-stat-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 18px;
  }

  .hero-stat-chip--0 & {
    background: rgba(47, 91, 255, 0.1);
    color: #2f5bff;
  }
  .hero-stat-chip--1 & {
    background: rgba(5, 150, 105, 0.12);
    color: #059669;
  }
  .hero-stat-chip--2 & {
    background: rgba(217, 119, 6, 0.12);
    color: #d97706;
  }
  .hero-stat-chip--3 & {
    background: rgba(225, 29, 72, 0.12);
    color: #e11d48;
  }
}

.hero-stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.5px;
}

.hero-stat-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

// ── Page Main ──
.page-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  animation: fadeSlideUp 0.4s ease 0.2s both;
}

</style>
