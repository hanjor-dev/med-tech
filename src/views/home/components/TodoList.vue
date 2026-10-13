<template>
  <div class="todo-wrap">
    <div class="panel-title"><span class="title-bar" />待办事项</div>
    <div v-if="!todos.length" class="empty">暂无待办</div>
    <div v-for="item in todos" :key="item.id" class="todo-item" @click="item.link && $router.push(item.link)">
      <span class="dot" :class="{ urgent: item.urgent }" />
      <span class="todo-name" :class="{ urgent: item.urgent }">{{ item.title }}</span>
      <span v-if="item.count" class="todo-count" :class="{ urgent: item.urgent }">{{ item.count }}</span>
      <el-icon class="arrow"><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import type { TodoVO } from '@/api/dashboard'
defineProps<{ todos: TodoVO[] }>()
</script>

<style scoped>
.todo-wrap {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  flex: 1; min-height: 0; overflow-y: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.panel-title {
  font-size: 13px; font-weight: 500; color: #303133;
  margin-bottom: 10px; padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; gap: 8px;
}
.title-bar {
  display: inline-block; width: 3px; height: 13px;
  background: #2f5bff;
  border-radius: 1px;
}
.empty { font-size: 12px; color: #c0c4cc; text-align: center; padding: 20px 0; }
.todo-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer; transition: padding-left .15s;
}
.todo-item:last-child { border-bottom: none; }
.todo-item:hover { padding-left: 4px; }
.todo-item:hover .todo-name { color: #2f5bff; }
.dot { width: 5px; height: 5px; border-radius: 50%; background: #2f5bff; flex-shrink: 0; }
.dot.urgent { background: #f56c6c; }
.todo-name { flex: 1; font-size: 12px; color: #606266; }
.todo-name.urgent { color: #f56c6b; }
.todo-count {
  font-size: 11px;
  background: #f5f7fa;
  color: #909399;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  padding: 0 7px; min-width: 24px; text-align: center;
}
.todo-count.urgent { background: #fef0f0; color: #f56c6b; border-color: #fde2e2; }
.arrow { font-size: 10px; color: #c0c4cc; }
</style>
