<template>
  <div class="page-container backup-cleanup">
    <div class="page-header"><div><h2>COS 清理</h2><p>按订单创建时间评估并管理云端历史文件清理任务。</p></div></div>
    <el-card shadow="never">
      <el-form inline @submit.prevent>
        <el-form-item label="订单创建时间早于"><el-input-number v-model="days" :min="1" :max="3650" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="loading" @click="evaluate">试运行评估</el-button></el-form-item>
      </el-form>
      <el-alert v-if="evaluation" type="warning" :closable="false" title="试运行结果" class="result">
        <template #default>任务：{{ evaluation.taskId }}；候选对象：{{ evaluation.keys.length }}；预计容量：{{ evaluation.estimatedBytes }} 字节。本页面仅执行试运行，不直接触发对象删除。</template>
      </el-alert>
      <el-table :data="tasks" v-loading="loadingTasks" class="task-table" empty-text="暂无实际清理任务">
        <el-table-column prop="id" label="任务编号" min-width="220" />
        <el-table-column prop="olderThanDays" label="清理阈值（天）" width="150" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="对象数" width="100"><template #default="scope">{{ scope.row.keys.length }}</template></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button v-if="scope.row.status === 'RUNNING'" link type="warning" @click="pause(scope.row)">暂停</el-button>
            <el-button v-if="scope.row.status === 'PAUSED'" link type="primary" @click="resume(scope.row)">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { evaluateCleanup, listCleanupTasks, pauseCleanup, resumeCleanup, type CleanupEvaluation, type CleanupTask } from '@/api/backupCleanup'

const days = ref(180); const loading = ref(false); const loadingTasks = ref(false); const evaluation = ref<CleanupEvaluation>(); const tasks = ref<CleanupTask[]>([])
async function loadTasks() {
  loadingTasks.value = true
  try { tasks.value = await listCleanupTasks() as unknown as CleanupTask[] } finally { loadingTasks.value = false }
}
async function evaluate() {
  loading.value = true
  try { evaluation.value = await evaluateCleanup({ olderThanDays: days.value }) as unknown as CleanupEvaluation; ElMessage.success('评估完成') } finally { loading.value = false }
}
async function pause(task: CleanupTask) { await pauseCleanup(task.id); await loadTasks(); ElMessage.success('任务已暂停') }
async function resume(task: CleanupTask) { await resumeCleanup(task.id); await loadTasks(); ElMessage.success('任务已恢复') }
onMounted(loadTasks)
</script>

<style scoped>
.backup-cleanup { padding: 24px; }.page-header { margin-bottom: 16px; }.page-header h2 { margin: 0; }.page-header p { color: #86909c; }.result { margin-top: 16px; }.task-table { margin-top:20px; }
</style>
