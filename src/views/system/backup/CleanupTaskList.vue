<template>
  <div class="page-container backup-cleanup">
    <div class="page-header"><div><h2>COS 清理</h2><p>按订单创建时间评估并管理云端历史文件清理任务。</p></div></div>
    <el-card shadow="never">
      <el-form inline @submit.prevent>
        <el-form-item label="订单创建时间早于"><el-input-number v-model="days" :min="1" :max="3650" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="loading" @click="evaluate" v-permission="'backup-cleanup:DryRun'">试运行评估</el-button></el-form-item>
      </el-form>
      <el-alert v-if="evaluation" type="warning" :closable="false" title="试运行结果" class="result">
        <template #default>任务：{{ evaluation.taskId }}；候选对象：{{ evaluation.keys?.length || 0 }}；预计容量：{{ evaluation.estimatedBytes || 0 }} 字节；保护：{{ evaluation.protectedCount || 0 }}；跳过：{{ evaluation.skippedCount || 0 }}。本页面仅执行试运行，不直接触发对象删除。</template>
      </el-alert>
      <el-table :data="tasks" v-loading="loadingTasks" class="task-table" empty-text="暂无实际清理任务">
        <el-table-column prop="id" label="任务编号" min-width="220" />
        <el-table-column prop="olderThanDays" label="清理阈值（天）" width="150" />
        <el-table-column prop="status" label="状态" width="120"><template #default="scope"><el-tag :type="statusType(scope.row.status)">{{ scope.row.status }}</el-tag></template></el-table-column>
        <el-table-column label="对象数" width="100"><template #default="scope">{{ objectCount(scope.row) }}</template></el-table-column>
        <el-table-column label="预计容量" width="130"><template #default="scope">{{ formatBytes(scope.row.estimatedBytes) }}</template></el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button link type="primary" @click="openTask(scope.row)" v-permission="'backup-cleanup:View'">详情</el-button>
            <el-button v-if="scope.row.status === 'RUNNING'" link type="warning" @click="pause(scope.row)" v-permission="'backup-cleanup:Pause'">暂停</el-button>
            <el-button v-if="scope.row.status === 'PAUSED'" link type="primary" @click="resume(scope.row)" v-permission="'backup-cleanup:Resume'">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog v-model="detailVisible" title="COS 清理任务详情" width="900px" destroy-on-close>
        <el-skeleton v-if="detailLoading" :rows="6" animated />
        <template v-else-if="selectedTask">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="任务编号">{{ selectedTask.id }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ selectedTask.status }}</el-descriptions-item>
            <el-descriptions-item label="审计编号">{{ selectedTask.auditId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="对象数">{{ objectCount(selectedTask) }}</el-descriptions-item>
            <el-descriptions-item label="保护对象">{{ selectedTask.protectedCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="跳过对象">{{ selectedTask.skippedCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ selectedTask.createdAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ selectedTask.updatedAt || '-' }}</el-descriptions-item>
          </el-descriptions>
          <h4>保护/跳过原因</h4>
          <el-table :data="reasonRows(selectedTask)" size="small" max-height="220" empty-text="暂无保护或跳过记录">
            <el-table-column prop="key" label="对象键" min-width="300" />
            <el-table-column prop="reason" label="原因" min-width="360" />
            <el-table-column prop="kind" label="类型" width="100" />
          </el-table>
          <h4>失败对象</h4>
          <el-table :data="selectedTask.failedObjects || []" size="small" max-height="180" empty-text="暂无失败对象">
            <el-table-column prop="key" label="对象键" min-width="300" />
            <el-table-column prop="code" label="错误码" width="160" />
            <el-table-column prop="reason" label="失败原因" min-width="300" />
          </el-table>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { evaluateCleanup, getCleanupTask, listCleanupTasks, pauseCleanup, resumeCleanup, type CleanupEvaluation, type CleanupTask } from '@/api/backupCleanup'

const days = ref(180); const loading = ref(false); const loadingTasks = ref(false); const evaluation = ref<CleanupEvaluation>(); const tasks = ref<CleanupTask[]>([])
const detailVisible = ref(false); const detailLoading = ref(false); const selectedTask = ref<CleanupTask>()
function messageOf(error: unknown) { return typeof error === 'string' ? error : (error as { message?: string })?.message || '操作失败' }
function objectCount(task: CleanupTask) { return task.objectCount ?? task.keys?.length ?? 0 }
function formatBytes(bytes?: number) { if (bytes == null) return '-'; if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`; if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`; return `${(bytes / 1024 ** 3).toFixed(2)} GB` }
function statusType(status: string) { return status === 'RUNNING' ? 'warning' : status === 'PAUSED' ? 'info' : status === 'FAILED' ? 'danger' : 'success' }
function reasonRows(task: CleanupTask) {
  const rows: Array<{ key: string; reason: string; kind: string }> = []
  for (const item of task.protectedReasons || []) rows.push(typeof item === 'string' ? { key: '-', reason: item, kind: '保护' } : { key: item.key || '-', reason: item.reason || '-', kind: '保护' })
  for (const item of task.skippedReasons || []) rows.push(typeof item === 'string' ? { key: '-', reason: item, kind: '跳过' } : { key: item.key || '-', reason: item.reason || '-', kind: '跳过' })
  return rows
}
async function loadTasks() {
  loadingTasks.value = true
  try { tasks.value = await listCleanupTasks() as unknown as CleanupTask[] } catch (error) { ElMessage.error(messageOf(error)) } finally { loadingTasks.value = false }
}
async function evaluate() {
  loading.value = true
  try { evaluation.value = await evaluateCleanup({ olderThanDays: days.value }) as unknown as CleanupEvaluation; ElMessage.success('评估完成') } catch (error) { ElMessage.error(messageOf(error)) } finally { loading.value = false }
}
async function openTask(task: CleanupTask) {
  selectedTask.value = task; detailVisible.value = true; detailLoading.value = true
  try { selectedTask.value = await getCleanupTask(task.id) as unknown as CleanupTask } catch (error) { ElMessage.error(messageOf(error)) } finally { detailLoading.value = false }
}
async function pause(task: CleanupTask) { try { await pauseCleanup(task.id); await loadTasks(); ElMessage.success('任务已暂停') } catch (error) { ElMessage.error(messageOf(error)) } }
async function resume(task: CleanupTask) { try { await resumeCleanup(task.id); await loadTasks(); ElMessage.success('任务已恢复') } catch (error) { ElMessage.error(messageOf(error)) } }
onMounted(loadTasks)
</script>

<style scoped>
.backup-cleanup { padding: 24px; }.page-header { margin-bottom: 16px; }.page-header h2 { margin: 0; }.page-header p { color: #86909c; }.result { margin-top: 16px; }.task-table { margin-top:20px; }
</style>
