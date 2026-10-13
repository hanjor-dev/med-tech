<template>
  <dialog-modal v-model="visible" title="取消申请详情" :subtitle="`申请ID：${applyId}`" width="500px" @modal-close="handleClose"
    :show-footer="mode === 'myApplies' ? false : true">
    <div class="dialog-shell">
      <!-- 基本信息 -->
      <div class="info-section" v-loading="detailLoading">
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">订单编号</span>
            <span class="info-value">{{ detail?.orderCode || '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">申请人</span>
            <span class="info-value">{{ detail?.applyByName || '—' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">申请时间</span>
            <span class="info-value">{{ detail?.createTime ? dayjs(detail.createTime).format('YYYY-MM-DD HH:mm:ss') :
              '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态</span>
            <el-tag size="small" :type="getStatusType(detail?.auditStatus)" effect="light">
              {{ getStatusText(detail?.auditStatus) }}
            </el-tag>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item info-item-full">
            <span class="info-label">取消原因</span>
            <span class="info-value info-value-reason">{{ detail?.applyReason || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- 驳回原因 -->
      <div class="reject-section" v-if="detail?.auditStatus === 3">
        <div class="section-title">驳回原因</div>
        <div class="reject-reason">{{ detail?.auditReason || '—' }}</div>
      </div>

      <!-- 审核备注 -->
      <div class="remark-section" v-if="mode === 'list' && detail?.auditStatus === 1">
        <div class="section-title">审核备注</div>
        <el-input v-model="auditReason" type="textarea" :rows="3" placeholder="请输入审核备注（驳回时建议填写）" />
      </div>
    </div>

    <template #footer-btn>
      <div class="dlr-actions" v-if="mode === 'list' && detail?.auditStatus === 1">
        <div class="action-btn action-btn-approve" :class="{ 'is-loading': approveLoading }" @click="handleApprove"
        v-permission="'order:CancelApprove'">
          <div class="action-content">
            <span class="action-label">审核通过</span>
          </div>
        </div>
        <div class="action-btn action-btn-reject" :class="{ 'is-loading': rejectLoading }" @click="handleReject"
        v-permission="'order:CancelReject'">
          <div class="action-content">
            <span class="action-label">审核驳回</span>
          </div>
        </div>
        <el-button class="btn-ghost" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DialogModal from '@/components/dialogModal.vue'
import { cancelApplyDetail, cancelApplyAudit, type CancelApplyVO } from '@/api/order'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
  applyId: number
  mode?: 'list' | 'myApplies'
  auditStatus?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const detail = ref<CancelApplyVO | null>(null)
const detailLoading = ref(false)
const auditReason = ref('')
const approveLoading = ref(false)
const rejectLoading = ref(false)

const getStatusType = (status?: number) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status?: number) => {
  switch (status) {
    case 1: return '待审核'
    case 2: return '已通过'
    case 3: return '已驳回'
    default: return '—'
  }
}

const fetchDetail = async () => {
  if (!props.applyId) return
  detailLoading.value = true
  try {
    const res = await cancelApplyDetail(props.applyId)
    detail.value = res
  } catch {
    ElMessage.error('加载详情失败')
  } finally {
    detailLoading.value = false
  }
}

watch(visible, async (v) => {
  if (v && props.applyId) {
    auditReason.value = ''
    await fetchDetail()
  }
})

const handleClose = () => {
  visible.value = false
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm('确认审核通过该取消申请？', '审核确认', {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'success',
    })
  } catch {
    return
  }
  approveLoading.value = true
  try {
    await cancelApplyAudit(props.applyId, true)
    ElMessage.success('审核通过')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    approveLoading.value = false
  }
}

const handleReject = async () => {
  if (!auditReason.value.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  try {
    await ElMessageBox.confirm(`确认驳回该取消申请？\n驳回原因：${auditReason.value}`, '审核确认', {
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  rejectLoading.value = true
  try {
    await cancelApplyAudit(props.applyId, false, auditReason.value)
    ElMessage.success('已驳回')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    rejectLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.info-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  gap: 40px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;

  &.info-item-full {
    flex: 1;
  }
}

.info-label {
  color: #909399;
  font-size: 13px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  font-size: 13px;
  font-weight: 500;

  &.info-value-reason {
    flex: 1;
    word-break: break-all;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.reject-section {
  margin-bottom: 20px;
}

.reject-reason {
  background: #fef0f0;
  border-radius: 8px;
  padding: 12px 16px;
  color: #f56c6c;
  font-size: 13px;
  line-height: 1.6;
}

.remark-section {
  margin-top: 16px;
}
</style>
