<template>
  <div class="data-card" @click="card.link && $router.push(card.link)">
    <div class="card-title">{{ card.title }}</div>
    <div class="card-value">
      {{ card.value }}<span v-if="card.unit" class="unit">{{ card.unit }}</span>
    </div>
    <div v-if="card.change" class="card-change" :class="card.trend">
      <el-icon v-if="card.trend === 'up'"><ArrowUp /></el-icon>
      <el-icon v-else-if="card.trend === 'down'"><ArrowDown /></el-icon>
      {{ card.change }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import type { CardVO } from '@/api/dashboard'

defineProps<{ card: CardVO }>()
</script>

<style scoped>
.data-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  cursor: pointer;
  transition: box-shadow .2s;
}
.data-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.card-title { color: #909399; font-size: 13px; margin-bottom: 8px; }
.card-value { font-size: 28px; font-weight: 600; color: #303133; }
.unit { font-size: 14px; font-weight: 400; margin-left: 4px; color: #606266; }
.card-change { font-size: 12px; margin-top: 6px; color: #909399; display: flex; align-items: center; gap: 2px; }
.card-change.up { color: #f56c6c; }
.card-change.down { color: #67c23a; }
</style>
