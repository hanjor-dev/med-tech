<template>
  <dialog-modal v-model="visible" title="修改申请详情" :subtitle="`申请ID：${applyId}`" width="720px"
    @modal-close="handleClose">
    <div class="dialog-shell modify-apply-detail-dialog">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">订单编号</span>
            <span class="info-value">{{ detail?.orderCode || '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">申请人</span>
            <span class="info-value">{{ detail?.applyUserName || '—' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">申请时间</span>
            <span class="info-value">{{ detail?.applyTime ? dayjs(detail.applyTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">过期时间</span>
            <span class="info-value">{{ detail?.expireTime ? dayjs(detail.expireTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">状态</span>
            <el-tag size="small" :type="getStatusType(detail?.status)" effect="light">
              {{ detail?.statusDesc || '—' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 变更详情 -->
      <div class="diff-section" v-loading="detailLoading">
        <div class="section-title">变更详情</div>

        <!-- 基础信息变更 -->
        <div v-if="detail?.diff?.infoFields?.length" class="diff-group">
          <div class="diff-group-title">基础信息</div>
          <el-table :data="detail.diff.infoFields" border size="small">
            <el-table-column prop="fieldLabel" label="字段名称" width="140" />
            <el-table-column label="原值">
              <template #default="{ row }">
                <span class="old-value">{{ row.oldDisplay || row.oldValue || '(空)' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="新值">
              <template #default="{ row }">
                <span class="new-value">{{ row.newDisplay || row.newValue || '(空)' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 重建项目变更 -->
        <div v-if="detail?.diff?.items" class="diff-group">
          <div class="diff-group-title">重建项目</div>
          <el-table
            v-if="(detail.diff.items.added?.length || detail.diff.items.deleted?.length || detail.diff.items.modified?.length)"
            :data="
              [
                ...(detail.diff.items.added || []).map((item: any) => ({ ...item, _changeType: 'added' })),
                ...(detail.diff.items.deleted || []).map((item: any) => ({ ...item, _changeType: 'deleted' })),
                ...(detail.diff.items.modified || []).map((item: any) => ({ ...item, _changeType: 'modified' })),
              ]"
            border size="small"
          >
            <el-table-column label="变更类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getChangeTypeTag(row._changeType)" size="small">
                  {{ getChangeTypeLabel(row._changeType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="projectName" label="项目名称" width="160" />
            <el-table-column prop="bodyPartName" label="部位" width="120" />
            <el-table-column prop="categoryName" label="分类" />
          </el-table>
          <div v-else class="empty-diff-small">无重建项目变更</div>
        </div>

        <!-- 图片数据变更 -->
        <div v-if="detail?.diff?.imageData" class="diff-group">
          <div class="diff-group-title">影像数据</div>
          <div v-if="detail.diff.imageData.added?.length || detail.diff.imageData.deleted?.length" class="diff-image-wrap">
            <div v-if="detail.diff.imageData.added?.length" class="diff-image-section">
              <div class="diff-image-label">新增</div>
              <div class="diff-image-list">
                <span v-for="item in detail.diff.imageData.added" :key="item" class="diff-image-tag is-added">{{ item }}</span>
              </div>
            </div>
            <div v-if="detail.diff.imageData.deleted?.length" class="diff-image-section">
              <div class="diff-image-label">删除文件</div>
              <div class="diff-image-list">
                <span v-for="item in detail.diff.imageData.deleted" :key="item" class="diff-image-tag is-deleted">{{ item }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-diff-small">无图片数据变更</div>
        </div>

        <!-- 图片报告变更 -->
        <div v-if="detail?.diff?.imageReport" class="diff-group">
          <div class="diff-group-title">影像报告</div>
          <div v-if="detail.diff.imageReport.added?.length || detail.diff.imageReport.deleted?.length" class="diff-image-wrap">
            <div v-if="detail.diff.imageReport.added?.length" class="diff-image-section">
              <div class="diff-image-label">新增</div>
              <div class="diff-image-list">
                <span v-for="item in detail.diff.imageReport.added" :key="item" class="diff-image-tag is-added">{{ item }}</span>
              </div>
            </div>
            <div v-if="detail.diff.imageReport.deleted?.length" class="diff-image-section">
              <div class="diff-image-label">删除文件</div>
              <div class="diff-image-list">
                <span v-for="item in detail.diff.imageReport.deleted" :key="item" class="diff-image-tag is-deleted">{{ item }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-diff-small">无图片报告变更</div>
        </div>

        <!-- 无变更 -->
        <div v-if="isDiffEmpty(detail?.diff)" class="empty-diff">
          暂无变更详情
        </div>
      </div>

      <!-- 审核备注 -->
      <div class="remark-section" v-if="detail?.status === 1">
        <div class="section-title">审核备注</div>
        <el-input v-model="auditRemark" type="textarea" :rows="3" placeholder="请输入审核备注（驳回时建议填写）" />
      </div>
    </div>

    <template #footer-btn>
      <div class="dlr-actions">
        <div class="action-btn action-btn-approve" v-if="detail?.status === 1" :class="{ 'is-loading': approveLoading }"
          @click="handleApprove">
          <div class="action-content">
            <span class="action-label">审核通过</span>
          </div>
        </div>
        <div class="action-btn action-btn-reject" v-if="detail?.status === 1":class="{ 'is-loading': rejectLoading }"
          @click="handleReject">
          <div class="action-content">
            <span class="action-label">审核驳回</span>
          </div>
        </div>
        <el-button class="btn-ghost" @click="handleClose">取消</el-button>
      </div>
      
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DialogModal from '@/components/dialogModal.vue'
import { modifyApplyDetail, modifyApplyAudit, type ModifyApplyVO, type ModifyApplyDetailVO, type ModifyApplyDiff, type ModifyApplyItem } from '@/api/order'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
  applyId: number
  applyData?: ModifyApplyDetailVO | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const detail = ref<ModifyApplyDetailVO | null>(null)
const detailLoading = ref(false)
const auditRemark = ref('')
const approveLoading = ref(false)
const rejectLoading = ref(false)

const getStatusType = (status?: number) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'danger'
    default: return 'info'
  }
}

const isDiffEmpty = (diff?: ModifyApplyDiff) => {
  if (!diff) return true
  if (diff.infoFields?.length) return false
  if (diff.items?.added?.length || diff.items?.deleted?.length || diff.items?.modified?.length) return false
  if (diff.imageData?.added?.length || diff.imageData?.deleted?.length) return false
  if (diff.imageReport?.added?.length || diff.imageReport?.deleted?.length) return false
  return true
}

const getChangeTypeTag = (type?: string) => {
  switch (type) {
    case 'added': return 'success'
    case 'deleted': return 'danger'
    case 'modified': return 'warning'
    default: return 'info'
  }
}

const getChangeTypeLabel = (type?: string) => {
  switch (type) {
    case 'added': return '新增'
    case 'deleted': return '删除'
    case 'modified': return '修改'
    default: return '未知'
  }
}

const fetchDetail = async () => {
  if (!props.applyId) return
  detailLoading.value = true
  try {
    const res = await modifyApplyDetail(props.applyId)
    detail.value = res
  } catch {
  } finally {
    detailLoading.value = false
  }
}

watch(visible, async (v) => {
  if (v) {
    auditRemark.value = ''
    await fetchDetail()
  }
})

const handleClose = () => {
  visible.value = false
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm('确认审核通过该修改申请？', '审核确认', {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'success',
    })
  } catch {
    return
  }
  approveLoading.value = true
  try {
    await modifyApplyAudit(props.applyId, 1, auditRemark.value)
    ElMessage.success('审核通过')
    emit('success')
    handleClose()
  } catch {
  } finally {
    approveLoading.value = false
  }
}

const handleReject = async () => {
  if (!auditRemark.value.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  try {
    await ElMessageBox.confirm(`确认驳回该修改申请？\n驳回原因：${auditRemark.value}`, '审核确认', {
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  rejectLoading.value = true
  try {
    await modifyApplyAudit(props.applyId, 2, auditRemark.value)
    ElMessage.success('已驳回')
    emit('success')
    handleClose()
  } catch {
  } finally {
    rejectLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.modify-apply-detail-dialog{
  max-height: 500px;
  overflow-y: auto;
}
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
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.diff-section {
  margin-bottom: 20px;
}

.diff-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.diff-group-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.old-value {
  color: #f56c6c;
  text-decoration: line-through;
}

.new-value {
  color: #67c23a;
}

.empty-diff {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.remark-section {
  margin-top: 16px;
}

.diff-image-wrap {
  display: flex;
  gap: 24px;
}

.diff-image-section {
  flex: 1;
}

.diff-image-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.diff-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.diff-image-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f5f7fa;
  color: #606266;
  word-break: break-all;

  &.is-added {
    background: #f0f9eb;
    color: #67c23a;
  }

  &.is-deleted {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.empty-diff-small {
  text-align: center;
  color: #909399;
  padding: 18px 0;
}
</style>
