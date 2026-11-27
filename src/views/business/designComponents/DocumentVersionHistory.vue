<template>
  <div class="ddpd-history" :class="{ 'ddpd-history--expanded': expanded }">
    <button class="ddpd-history__toggle" @click="expanded = !expanded">
      <div class="ddpd-history__toggle-left">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        版本历史
        <span class="ddpd-history__count">{{ historyList.length }}</span>
        <span class="ddpd-history__confirmed-hint" v-if="confirmedCount > 0">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ confirmedCount }} 个已确认
        </span>
      </div>
      <svg class="ddpd-history__chevron" :class="{ 'ddpd-history__chevron--up': expanded }"
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <div class="ddpd-history__list" v-show="expanded">
      <div v-if="historyLoading" class="ddpd-history__loading">
        <el-icon :size="16" class="ddpd-history__loading-icon">
          <Loading />
        </el-icon>
        加载历史版本…
      </div>
      <div v-else-if="historyList.length === 0" class="ddpd-history__empty">
        暂无历史版本
      </div>
      <div v-else class="ddpd-history__items">
        <div v-for="(item, idx) in historyList" :key="item.id" class="ddpd-history-item"
          :class="{ 'ddpd-history-item--current': item.id === currentDocId, 'ddpd-history-item--confirmed': item.isConfirmed }"
          :style="{ animationDelay: `${idx * 0.04}s` }">
          <div class="ddpd-history-item__version">
            <span class="ddpd-history-item__ver-text">{{ item.version }}</span>
            <span class="ddpd-history-item__current-tag" v-if="item.id === currentDocId">当前</span>
            <span class="ddpd-history-item__confirmed-tag" v-if="item.isConfirmed">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              已确认
            </span>
          </div>
          <slot name="details" :item="item" />
          <div class="ddpd-history-item__time">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {{ item.time || '—' }}
          </div>
          <div class="ddpd-history-item__actions">
            <button class="ddpd-history-item__btn" @click="$emit('preview', item)" :disabled="busy" title="预览">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button class="ddpd-history-item__btn" @click="$emit('download', item)" :disabled="busy" title="下载">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" generic="T extends { id: number; version: string; isConfirmed?: number; time?: string | null }">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
const props = defineProps<{ historyList: T[]; currentDocId?: number | null; historyLoading?: boolean; busy?: boolean }>()
const expanded = defineModel<boolean>('expanded', { default: false })
const confirmedCount = computed(() => props.historyList.filter(item => item.isConfirmed === 1).length)
defineEmits<{ preview: [item: T]; download: [item: T] }>()
</script>
<style lang="scss" scoped>
@keyframes ddpdFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ─── History ────────────────────────────────────────────────────────────
.ddpd-history {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
  transition: border-color 0.2s;
  animation: ddpdFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;

  &:hover {
    border-color: var(--border-mid);
  }

  &--expanded {
    border-color: var(--blue-light);
  }

  &__toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;

    &:hover {
      background: var(--surface-raised);
    }
  }

  &__toggle-left {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;

    svg {
      color: var(--text-faint);
      flex-shrink: 0;
    }
  }

  &__count {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    background: var(--border);
    color: var(--text-muted);
    padding: 1px 6px;
    border-radius: 9999px;
  }

  &__confirmed-hint {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: var(--success);
    background: var(--success-light);
    padding: 1px 6px;
    border-radius: 9999px;
    text-transform: none;
    letter-spacing: 0;

    svg {
      color: var(--success);
    }
  }

  &__chevron {
    color: var(--text-faint);
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &--up {
      transform: rotate(180deg);
    }
  }

  &__list {
    border-top: 1px solid var(--border);
    max-height: 260px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-mid) transparent;
  }

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    font-size: 12px;
    color: var(--text-faint);

    &-icon {
      animation: spin 0.8s linear infinite;
      color: var(--blue);
    }
  }

  &__items {
    padding: 6px 0;
  }
}

// ─── History Item ───────────────────────────────────────────────────────
.ddpd-history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  transition: background 0.15s;
  animation: ddpdFadeIn 0.25s ease both;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 0;
    background: var(--blue);
    border-radius: 0 1px 1px 0;
    transition: height 0.15s;
  }

  &:hover {
    background: var(--surface-raised);

    &::before {
      height: 60%;
    }
  }

  &--current {
    background: var(--blue-pale);

    &::before {
      height: 70%;
      background: var(--blue);
    }
  }

  &--confirmed {
    &::before {
      background: var(--success);
    }
  }

  &__version {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 72px;
  }

  &__ver-text {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-mid);
  }

  &__current-tag {
    font-size: 9.5px;
    font-weight: 700;
    color: white;
    background: var(--blue);
    padding: 1px 5px;
    border-radius: 3px;
    letter-spacing: 0.3px;
  }

  &__confirmed-tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 9.5px;
    font-weight: 700;
    color: var(--success);
    background: var(--success-light);
    padding: 1px 5px;
    border-radius: 3px;
  }

  &__time {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-faint);

    svg {
      flex-shrink: 0;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s;

    .ddpd-history-item:hover & {
      opacity: 1;
    }

    .ddpd-history-item--current & {
      opacity: 1;
    }
  }

  &__btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-muted);
    transition: all 0.15s;
    padding: 0;

    &:hover {
      border-color: var(--blue-light);
      color: var(--blue);
      background: var(--blue-pale);
    }
  }
}

</style>
