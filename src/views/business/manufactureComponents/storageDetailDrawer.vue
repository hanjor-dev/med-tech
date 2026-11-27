<template>
  <dialog-modal
    v-model="visible"
    :title="modalTitle"
    :subtitle="detail?.recordNo || ''"
    width="980px"
    :show-footer="false"
    @modal-close="visible = false">
    <template #title-badge>
      <UdiBadge :provide-udi="detail?.provideUdi" />
    </template>

    <div v-if="detail" class="sdd-layout">
      <!-- 左侧 -->
      <div class="sdd-sidebar">
        <!-- 患者卡片 -->
        <div class="sdd-patient">
          <div class="sdd-patient__avatar">{{ detail.patientName?.charAt(0) || '?' }}</div>
          <div class="sdd-patient__info">
            <div class="sdd-patient__name">{{ detail.patientName }}</div>
            <div class="sdd-patient__hospital">{{ detail.hospitalName }}</div>
          </div>
          <div class="sdd-patient__badges">
            <span v-if="detail.isUrgent === 1" class="sdd-badge sdd-badge--urgent">加急</span>
            <span v-if="detail.isPostal === 1" class="sdd-badge sdd-badge--postal">邮寄</span>
          </div>
        </div>

        <!-- 统计条 -->
        <div class="sdd-stats">
          <div class="sdd-stat">
            <span class="sdd-stat__num">{{ detail.totalProductCount }}</span>
            <span class="sdd-stat__label">总数</span>
          </div>
          <div class="sdd-stat sdd-stat--pending">
            <span class="sdd-stat__num">{{ detail.products?.filter((p: any) => p.status === 'pending_warehouse_in').length ?? 0 }}</span>
            <span class="sdd-stat__label">待入库</span>
          </div>
          <div class="sdd-stat sdd-stat--in">
            <span class="sdd-stat__num">{{ detail.products?.filter((p: any) => p.status === 'warehoused').length ?? 0 }}</span>
            <span class="sdd-stat__label">已入库</span>
          </div>
          <div class="sdd-stat sdd-stat--out">
            <span class="sdd-stat__num">{{ detail.products?.filter((p: any) => p.status === 'warehouse_out').length ?? 0 }}</span>
            <span class="sdd-stat__label">已出库</span>
          </div>
        </div>

        <!-- 字段列表 -->
        <div class="sdd-fields">
          <div class="sdd-field">
            <span class="sdd-field__label">状态</span>
            <span class="sdd-field__value sdd-field__value--tag">
              <el-tag size="small" :style="statusStyle(detail.status, detail.statusColor)">{{ statusLabel(detail.status) }}</el-tag>
            </span>
          </div>
          <div v-for="field in metaFields" :key="field.label" class="sdd-field">
            <span class="sdd-field__label">{{ field.label }}</span>
            <span class="sdd-field__value">{{ field.value || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧产品列表 -->
      <div class="sdd-main">
        <div class="form-section-header">
          <span class="form-section-num">01</span>
          <span class="form-section-line"></span>
          <span class="form-section-title">产品列表</span>
          <span class="form-section-count">{{ detail.products?.length }}</span>
        </div>
        <div class="sdd-prod-list">
          <div class="sdd-prod-grid">
            <div v-for="p in detail.products" :key="p.id" class="sdd-prod-card">
              <div class="sdd-prod-card__header">
                <div class="sdd-prod-card__name">{{ p.fileName || p.productName }}</div>
                <div class="sdd-prod-card__tags">
                  <span class="sdd-pill" :class="`sdd-pill--${prodStatus(p.status)}`">
                    {{ { warehoused: '已入库', warehouse_out: '已出库' }[p.status] ?? '待入库' }}
                  </span>
                  <span v-if="p.qcResult === 'pass'" class="sdd-pill sdd-pill--qc-pass">合格</span>
                  <span v-else-if="p.qcResult === 'fail'" class="sdd-pill sdd-pill--qc-fail">不合格</span>
                </div>
              </div>
              <div class="sdd-prod-card__rows">
                <div class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">编号</span>
                  <span class="sdd-prod-card__val sdd-prod-card__val--mono">{{ p.productNo || '—' }}</span>
                </div>
                <div v-if="p.specName" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">规格</span>
                  <span class="sdd-prod-card__val">{{ p.specName }}</span>
                </div>
                <div v-if="p.materialName" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">材质</span>
                  <span class="sdd-prod-card__val">{{ p.materialName }}</span>
                </div>
                <div v-if="p.colorName" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">颜色</span>
                  <span class="sdd-prod-card__val">{{ p.colorName }}</span>
                </div>
                <div v-if="p.weight != null" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">重量</span>
                  <span class="sdd-prod-card__val">{{ p.weight }}g</span>
                </div>
                <div v-if="p.certNo" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">注册证号</span>
                  <span class="sdd-prod-card__val sdd-prod-card__val--mono">{{ p.certNo }}</span>
                </div>
                <div v-if="p.udiCode" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">UDI</span>
                  <span class="sdd-prod-card__val sdd-prod-card__val--mono">{{ p.udiCode }}</span>
                </div>
                <div v-if="p.warehouseInTime" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">入库</span>
                  <span class="sdd-prod-card__val sdd-prod-card__val--mono">{{ p.warehouseInTime }}</span>
                </div>
                <div v-if="p.warehouseOutTime" class="sdd-prod-card__row">
                  <span class="sdd-prod-card__key">出库</span>
                  <span class="sdd-prod-card__val sdd-prod-card__val--mono">{{ p.warehouseOutTime }}</span>
                </div>
              </div>
              <div v-if="mode && mode !== 'view'" class="sdd-prod-card__action">
                <el-button
                  v-if="mode === 'in' && p.status === 'pending_warehouse_in'"
                  size="small" type="primary"
                  :loading="actionLoading === p.id"
                  @click="doWarehouseIn(p.id)">入库</el-button>
                <el-button
                  v-else-if="mode === 'out' && p.status === 'warehoused'"
                  size="small" type="warning"
                  :loading="actionLoading === p.id"
                  @click="doWarehouseOut(p.id)">出库</el-button>
              </div>
            </div>
          </div>
          <div v-if="!detail.products?.length" class="sdd-prod-empty">暂无产品数据</div>
        </div>
      </div>
    </div>

    <div v-else class="sdd-loading">
      <el-icon class="is-loading" size="22"><Loading /></el-icon>
      <span>加载中…</span>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import UdiBadge from '@/components/UdiBadge.vue'
import { ref, computed, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import { getWarehouseDetail, warehouseIn, warehouseOut, type WarehouseDetailVO } from '@/api/warehouse'
import { statusLabel, statusStyle } from '../statusConfig'

const props = defineProps<{
  modelValue: boolean
  recordId: number | null
  mode?: 'view' | 'in' | 'out'
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'refresh'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const detail = ref<WarehouseDetailVO | null>(null)
const actionLoading = ref<number | null>(null)

const modalTitle = computed(() => {
  if (props.mode === 'in') return '产品入库'
  if (props.mode === 'out') return '产品出库'
  return '仓储详情'
})

const prodStatus = (s: string) => ({ warehoused: 'in', warehouse_out: 'out' }[s] ?? 'pending')

let detailRequest = 0
const refreshProducts = async () => {
  const request = ++detailRequest
  if (!props.recordId) return
  const res = await getWarehouseDetail(props.recordId) as any
  if (request === detailRequest) detail.value = res
}

const doWarehouseIn = async (productId: number) => {
  actionLoading.value = productId
  try {
    await warehouseIn(productId)
    ElMessage.success('入库成功')
    await refreshProducts()
    emit('refresh')
  } finally {
    actionLoading.value = null
  }
}

const doWarehouseOut = async (productId: number) => {
  actionLoading.value = productId
  try {
    await warehouseOut(productId)
    ElMessage.success('出库成功')
    await refreshProducts()
    emit('refresh')
  } finally {
    actionLoading.value = null
  }
}

const metaFields = computed(() => [
  { label: '流转卡', value: detail.value?.recordNo },
  { label: '订单号', value: detail.value?.orderCode },
  { label: '虚拟单号', value: detail.value?.publicOrderCode },
  { label: '数据包', value: detail.value?.designPackageCode },
  { label: '生产批号', value: detail.value?.productionBatchNo },
  { label: '原料批号', value: detail.value?.materialBatchNo },
  { label: '科室', value: detail.value?.hospitalDeptName },
  { label: '医生', value: detail.value?.doctorName },
  { label: '期望交付', value: detail.value?.expectedDeliveryDate?.replace('T', ' ') },
  { label: '加工中心', value: detail.value?.processingCenterName },
])

watch(() => [props.modelValue, props.recordId] as const, ([open, id]) => {
  detailRequest++
  detail.value = null
  if (open && id) return refreshProducts()
}, { immediate: true })
</script>

<style scoped lang="scss">
.form-section-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
}
.form-section-num {
  font-size: 10px; font-weight: 900; color: #fff; background: #0891b2;
  letter-spacing: 0.5px; width: 22px; height: 22px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 6px; flex-shrink: 0;
}
.form-section-line { display: block; width: 16px; height: 1px; background: #cbd5e1; }
.form-section-title { font-size: 13px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; flex: 1; }
.form-section-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 6px;
  background: #e0f2fe; border-radius: 20px;
  font-size: 10px; font-weight: 700; color: #0369a1;
}

.sdd-layout {
  display: flex;
  gap: 0;
  min-height: 480px;
  padding: 15px;
}

/* ── 左侧 ── */
.sdd-sidebar {
  width: 230px;
  flex-shrink: 0;
  border-right: 1px solid #f0f4f8;
  padding: 4px 16px 8px 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sdd-patient {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f4fd 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  position: relative;
}
.sdd-patient__avatar {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff;
  box-shadow: 0 3px 10px rgba(14,165,233,0.35);
}
.sdd-patient__info { flex: 1; min-width: 0; }
.sdd-patient__name {
  font-size: 14px; font-weight: 700; color: #0f172a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sdd-patient__hospital { font-size: 11px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sdd-patient__badges { display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }

.sdd-badge {
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.3px;
}
.sdd-badge--urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.sdd-badge--postal { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

.sdd-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.sdd-stat {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 8px 6px; border-radius: 10px; background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.sdd-stat--pending { background: #fffbeb; border-color: #fde68a; }
.sdd-stat--in { background: #f0fdf4; border-color: #86efac; }
.sdd-stat--out { background: #eff6ff; border-color: #93c5fd; }
.sdd-stat__num { font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }
.sdd-stat__label { font-size: 10px; color: #94a3b8; margin-top: 3px; font-weight: 500; }

.sdd-fields { display: flex; flex-direction: column; }
.sdd-field {
  display: flex; align-items: baseline; gap: 6px;
  padding: 5px 0;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
}
.sdd-field__label {
  font-size: 10px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px;
  flex-shrink: 0; width: 52px;
}
.sdd-field__value {
  font-size: 11.5px; font-weight: 600; color: #374151;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}
.sdd-field__value--tag {
  display: flex; align-items: center;
  font-family: inherit;
}

/* ── 右侧 ── */
.sdd-main {
  flex: 1; min-width: 0;
  padding: 4px 0 8px 20px;
  display: flex; flex-direction: column;
}

.sdd-prod-list {
  flex: 1; overflow-y: auto; max-height: 500px;
}
.sdd-prod-empty { text-align: center; padding: 48px 0; color: #cbd5e1; font-size: 13px; }

.sdd-prod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.sdd-prod-card {
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;
  transition: all .2s cubic-bezier(.16,1,.3,1);
  &:hover { border-color: #0ea5e9; box-shadow: 0 4px 16px rgba(14,165,233,.1); transform: translateY(-1px); }
}
.sdd-prod-card__header {
  display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
}
.sdd-prod-card__name {
  font-size: 13px; font-weight: 800; color: #1e293b;
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.sdd-prod-card__tags { display: flex; gap: 4px; flex-shrink: 0; }
.sdd-prod-card__rows {
  display: flex; flex-direction: column; gap: 4px;
  border-top: 1px solid #f1f5f9; padding-top: 8px;
}
.sdd-prod-card__row { display: flex; align-items: flex-start; gap: 6px; }
.sdd-prod-card__key {
  font-size: 9.5px; font-weight: 800; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .5px;
  white-space: nowrap; flex-shrink: 0; padding-top: 1px;
}
.sdd-prod-card__val {
  font-size: 11.5px; color: #475569; line-height: 1.5; word-break: break-all;
  &--mono { font-family: 'JetBrains Mono', 'SF Mono', monospace; }
}

.sdd-prod-card__action {
  display: flex; justify-content: flex-end;
  margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9;
}

.sdd-pill {
  display: inline-block; font-size: 10.5px; font-weight: 600;
  padding: 2px 7px; border-radius: 5px; white-space: nowrap;
  &--pending { background: #f1f5f9; color: #64748b; }
  &--in { background: #dcfce7; color: #16a34a; }
  &--out { background: #dbeafe; color: #2563eb; }
  &--qc-pass { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  &--qc-fail { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
}

/* 加载态 */
.sdd-loading {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 80px 0; color: #94a3b8; font-size: 13px;
}
</style>
