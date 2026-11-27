<template>
  <div class="dpid2-product-rows">
    <div v-for="(row, idx) in rows" :key="rowKey(row)" class="dpid2-card"
      :style="{ animationDelay: `${idx * 0.07}s` }">
      <!-- 卡片头部 -->
      <div class="dpid2-card__header">
        <div class="dpid2-card__num">
          <span class="dpid2-card__num-text">{{ idx + 1 }}</span>
        </div>
        <span class="dpid2-card__title">产品 {{ idx + 1 }}</span>
        <span class="dpid2-card__category-badge" v-if="categoryName(row)">{{
          categoryName(row) }}</span>
        <div class="dpid2-card__actions">
          <button class="dpid2-card__delete" type="button" :aria-label="removeLabel" @click="emit('remove', idx)" :disabled="!editable"
            title="删除">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 卡片主体 -->
      <div class="dpid2-card__body">
        <slot :row="row" :index="idx" />
      </div>
    </div>

    <!-- 添加产品按钮 -->
    <button class="dpid2-add-btn" v-if="editable || showDisabledAdd" type="button" @click="emit('add')" :disabled="!editable">
      <span class="dpid2-add-btn__icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
      添加产品
    </button>
    <slot name="details" />
  </div>
</template>

<script setup lang="ts" generic="T">
defineProps<{ rows: T[]; rowKey: (row: T) => string | number; categoryName: (row: T) => string | undefined; editable: boolean; showDisabledAdd?: boolean; removeLabel?: string }>()
const emit = defineEmits<{ add: []; remove: [index: number] }>()
</script>
