<template>
  <dialog-modal v-model="visible" title="历史列表"  width="950px"
    @modal-close="handleClose" :show-footer="false">
    <div class="dialog-shell">
      <el-table :data="list" v-loading="loading" :header-cell-style="{ background: '#f9fafb' }" border size="small" height="400px">
        <el-table-column type="index" label="序号" align="center"/>
        <el-table-column prop="applyByName" label="申请人" align="center" />
        
        <el-table-column prop="applyReason" label="申请原因" show-overflow-tooltip />
        <el-table-column prop="auditStatus" label="审核状态" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusType(row.auditStatus)" effect="light">
              {{ getStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" min-width="120">
          <template #default="{ row }">
            {{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" min-width="120">
          <template #default="{ row }">
            {{ row.auditTime ? dayjs(row.auditTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="auditByName" label="审核人" align="center" />
        <el-table-column prop="auditReason" label="驳回原因" show-overflow-tooltip/>
      </el-table>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DialogModal from '@/components/dialogModal.vue'
import { cancelApplyHistory, type CancelApplyHistoryItem } from '@/api/order'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
  orderId: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const list = ref<CancelApplyHistoryItem[]>([])

const getStatusType = (status: number) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 1: return '待审核'
    case 2: return '已通过'
    case 3: return '已驳回'
    default: return '未知'
  }
}

const fetchHistory = async () => {
  if (!props.orderId) return
  loading.value = true
  try {
    const res = await cancelApplyHistory(props.orderId)
    list.value = res
  } catch {
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

watch(visible, async (v) => {
  if (v && props.orderId) {
    await fetchHistory()
  }
})

const handleClose = () => {
  visible.value = false
}
</script>

<!-- <style scoped lang="scss">
.dialog-shell {
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 2px;
  }
}
</style> -->
