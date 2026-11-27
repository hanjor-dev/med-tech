<template>
  <div class="dwd-pkg-ver" :class="drawing ? 'dwd-pkg-ver--draw' : 'dwd-pkg-ver--instr'">
    <div class="dwd-pkg-ver__label">
      <el-icon size="10" color="#0891b2"><component :is="drawing ? DocumentChecked : Document" /></el-icon>
      {{ label }}
      <span v-if="category" class="dwd-category-tag">{{ category }}</span>
      <span class="dwd-confirmed-badge" v-if="confirmed">
        <span class="dwd-confirmed-badge__dot"></span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        已确认
      </span>
    </div>
    <div class="dwd-pkg-ver__items"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { Document, DocumentChecked } from '@element-plus/icons-vue'
defineProps<{ label: string; drawing?: boolean; category?: string; confirmed?: boolean }>()
</script>

<style scoped lang="scss">
.dwd-pkg-ver {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid transparent;

  &--instr {
    background: linear-gradient(135deg, var(--blue-pale) 0%, #e8f2ff 100%);
    border-color: #bfdbfe;
  }

  &--draw {
    background: linear-gradient(135deg, #fffbf0 0%, #fff9e6 100%);
    border-color: #fde68a;
  }
}


.dwd-pkg-ver__label {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.dwd-pkg-ver__items {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

:deep(.dwd-pkg-ver__item) {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #475569;

  >span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .el-button {
    color: #94a3b8;
    padding: 2px;
    flex-shrink: 0;

    &:hover {
      color: #0891b2;
    }
  }
}

.dwd-category-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #e0e7ff;
  color: #4338ca;
  margin-left: 4px;
}

.dwd-confirmed-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px 2px 4px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #6ee7b7;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  color: #065f46;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 4px rgba(16, 185, 129, 0.2);
  flex-shrink: 0;

  svg {
    color: #059669;
    flex-shrink: 0;
  }

  &__dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #059669;
    flex-shrink: 0;
    animation: dwd-confirmed-pulse 2s ease-in-out infinite;
  }
}

@keyframes dwd-confirmed-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
</style>
