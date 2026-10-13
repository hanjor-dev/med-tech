<template>

  <!-- Auth 风格分页：左侧统计信息 + 右侧控件 -->
  <div class="auth-pagination">
    <div class="auth-pagination__info">
      共 <strong>{{ totalCount }}</strong> 条，第 <strong>{{ currentPage }}</strong>/<strong>{{ totalPages }}</strong> 页
    </div>
    <div class="auth-pagination__controls">
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="pageSizes" :total="totalCount"
        :pager-count="pagerCount" layout=" prev, pager, next" background @current-change="handleCurrentChange"
        @size-change="handleSizeChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Auth 风格分页组件的名称（用于模板中 <auth-pagination> 标签）
defineOptions({ name: 'authPagination' })

export interface PageProps {
  totalCount?: number
  currentPage?: number
  pageSize?: number
  pageSizes?: number[]
  pagerCount?: number
  type?: 'default' | 'auth'
}

const props = withDefaults(defineProps<PageProps>(), {
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50],
  pagerCount: 5,
  type: 'default',
})

const emit = defineEmits<{
  'current-change': [page: number]
  'size-change': [size: number]
}>()

const totalPages = computed(() =>
  props.totalCount === 0 ? 1 : Math.ceil(props.totalCount / props.pageSize)
)

const handleSizeChange = (val: number) => {
  emit('size-change', val)
}

const handleCurrentChange = (val: number) => {
  emit('current-change', val)
}
</script>

<style lang="scss" scoped>
// ── AuthPagination（auth 风格分页）──────────────
.auth-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #f0f0ee;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.auth-pagination__info {
  font-size: 12px;
  color: #9ca3af;

  strong {
    color: #374151;
    font-weight: 600;
  }
}

.auth-pagination__controls {
  :deep(.el-pagination) {
    gap: 8px;
    font-weight: 500;
  }

  :deep(.el-pagination__total) {
    display: none;
  }

  :deep(.el-select) {
    .el-input__wrapper {
      border-radius: 8px;
      height: 32px;
      background: #fff;
      border: 1px solid var(--el-border-color-lighter);
      box-shadow: none;

      &:hover,
      &.is-focus {
        border-color: var(--el-color-primary);
      }
    }

    .el-input__inner {
      font-size: 12px;
      color: #374151;
    }
  }

  :deep(.el-pagination__sizes) {
    margin-right: 4px;
  }

  :deep(.btn-prev),
  :deep(.btn-next) {
    height: 32px;
    min-width: 32px;
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-regular);
    box-shadow: 0 1px 0 rgba(17, 24, 39, 0.04);
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      border-color: rgba(47, 91, 255, 0.5);
      color: #2f5bff;
    }

    &:disabled {
      background: #f8fafc;
      color: var(--el-text-color-disabled);
      box-shadow: none;
    }
  }

  :deep(.el-pager li) {
    height: 32px;
    min-width: 32px;
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-regular);
    font-size: 12px;
    margin: 0 2px;
    box-shadow: 0 1px 0 rgba(17, 24, 39, 0.04);
    transition: all 0.15s ease;

    &:hover:not(.is-active) {
      border-color: rgba(47, 91, 255, 0.5);
      color: #2f5bff;
    }

    &.is-active {
      background: #2f5bff !important;
      border-color: #2f5bff !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(47, 91, 255, 0.3);
    }
  }
}
</style>
