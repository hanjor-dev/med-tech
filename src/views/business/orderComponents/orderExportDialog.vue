<template>
  <dialog-modal
    v-model="visible"
    title="自定义导出"
    width="520px"
    :show-footer="true"
    @modal-close="visible = false"
  >
    <div class="dialog-shell">
      <!-- 提示语 -->
      <div class="export-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>请勾选需要导出的字段，确认后开始导出。</span>
      </div>

      <!-- 日期范围 -->
      <div class="export-date-range">
        <el-date-picker
          v-model="exportDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          clearable
          style="width: 100%;"
        />
      </div>

      <!-- 字段选择区 -->
      <div class="export-fields-section">
        <div class="export-fields-header">
          <el-checkbox
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          >
            全选
          </el-checkbox>
          <span class="export-count">已选 {{ checkedFields.length }} / {{ fieldList.length }} 项</span>
        </div>

        <el-checkbox-group v-model="checkedFields" class="export-fields-grid">
          <el-checkbox
            v-for="field in fieldList"
            :key="field.field"
            :value="field.field"
            :label="field.field"
            class="export-field-item"
          >
            {{ field.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 加载态 -->
      <div v-if="loading" class="export-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载导出字段中...</span>
      </div>
    </div>

    <template #footer-btn>
      <el-button class="btn btn-ghost" @click="visible = false">取消</el-button>
      <el-button
        class="btn btn-primary"
        :loading="exporting"
        :disabled="checkedFields.length === 0"
        @click="handleConfirm"
      >
        确认导出
      </el-button>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, Loading } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import {
  orderExportFields,
  orderCustomExport,
  type ExportFieldItem,
  type OrderCustomExportDTO,
} from '@/api/order'

const visible = ref(false)
const loading = ref(false)
const exporting = ref(false)
const fieldList = ref<ExportFieldItem[]>([])
const checkedFields = ref<string[]>([])
const exportDateRange = ref<string[] | null>([])

const checkAll = computed({
  get: () =>
    fieldList.value.length > 0 &&
    checkedFields.value.length === fieldList.value.length,
  set: (val: boolean) => {
    checkedFields.value = val ? fieldList.value.map(f => f.field) : []
  },
})

const isIndeterminate = computed(
  () =>
    checkedFields.value.length > 0 &&
    checkedFields.value.length < fieldList.value.length,
)

const handleCheckAllChange = (val: boolean) => {
  checkedFields.value = val ? fieldList.value.map(f => f.field) : []
}

const open = async () => {
  visible.value = true
  checkedFields.value = []
  loading.value = true
  try {
    const data = await orderExportFields()
    fieldList.value = data
    checkedFields.value = data
      .filter(f => f.checked !== false)
      .map(f => f.field)
  } catch {
    ElMessage.error('加载导出字段失败')
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  if (checkedFields.value.length === 0) {
    ElMessage.warning('请至少选择一项导出字段')
    return
  }
  exporting.value = true
  try {
    const params: OrderCustomExportDTO = {
      exportFields: checkedFields.value,
    }
    if (
      exportDateRange.value &&
      exportDateRange.value.length === 2
    ) {
      params.createTimeStart = exportDateRange.value[0]
      params.createTimeEnd = exportDateRange.value[1]
    }
    const { blob, fileName } = await orderCustomExport(params)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
    visible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

defineExpose({ open })
</script>

<style lang="scss">
// ============================================================
// 使用系统设计系统变量，保持全局一致性
// ============================================================
$primary: #2f5bff;
$primary-light: #4d76ff;
$primary-dark: #3b82f6;
$primary-pale: #eef2ff;
$primary-faint: #dbeeff;

$text: #0f172a;
$text-mid: #1e3a5f;
$text-muted: #64748b;
$text-faint: #8ca0b8;

$border: #e2e8f0;
$border-mid: #c8d6e5;

$surface: #ffffff;
$surface-raised: #f4f8fd;
$surface-hover: #edf5ff;

$radius-sm: 6px;
$radius: 8px;
$radius-lg: 12px;

$shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
$shadow: 0 3px 10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04);
$shadow-blue: 0 4px 16px rgba(47, 91, 255, 0.18);

// ============================================================
// 提示语
// ============================================================
.export-tip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  background: $primary-pale;
  border: 1px solid #d0dff5;
  border-radius: $radius;
  font-size: 13px;
  color: $primary-dark;
  line-height: 1.6;
  letter-spacing: 0.01em;

  :deep(.el-icon) {
    font-size: 15px;
    color: $primary;
    margin-top: 1px;
    flex-shrink: 0;
  }
}

// ============================================================
// 日期范围
// ============================================================
.export-date-range {
  margin: 10px 0;
}

// ============================================================
// 字段选择区
// ============================================================
.export-fields-section {
  border: 1px solid $border;
  border-radius: $radius-lg;
  overflow: hidden;
}

.export-fields-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: $surface-raised;
  border-bottom: 1px solid $border;
}

.export-count {
  font-size: 12px;
  color: $text-faint;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

// ============================================================
// 字段网格
// ============================================================
.export-fields-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  max-height: 280px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: $border;
    border-radius: 10px;
    &:hover {
      background: $border-mid;
    }
  }
}

.export-field-item {
  margin: 0;
  padding: 9px 14px;
  border-right: 1px solid $border;
  transition: background-color 0.15s;
  background: $surface;
  // 每行3个，第三列去掉右边框
  &:nth-child(3n) {
    border-right: none;
  }
  &.is-checked{
    .el-checkbox__label{
      color: $primary-dark;
    }
  }
}

// ============================================================
// 加载态
// ============================================================
.export-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px;
  color: $text-faint;
  font-size: 13px;

  :deep(.el-icon) {
    font-size: 16px;
    color: $primary;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}
</style>
