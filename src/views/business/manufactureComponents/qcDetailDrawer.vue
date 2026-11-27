<template>
  <dialog-modal
    v-model="visible"
    title="质检详情"
    :subtitle="detail?.recordNo || ''"
    width="1100px"
    :show-footer="false"
    @modal-close="visible = false">
    <template #title-badge>
      <UdiBadge :provide-udi="detail?.provideUdi" />
    </template>
    <div class="dlr-root" v-if="detail">
      <aside class="dlr-slidebar">
        <div class="dwd-pt-card">
          <div class="dwd-pt-avatar">
            <span>{{ detail.patientName?.charAt(0) || '?' }}</span>
          </div>
          <div class="dwd-pt-meta">
            <div class="dwd-pt-name">{{ detail.patientName }}</div>
            <div class="dwd-pt-tags">
              <span class="dwd-pt-tag">{{ detail.hospitalName?.slice(0, 6) || '—' }}</span>
              <span class="dwd-pt-tag-sep" v-if="detail.hospitalDeptName">/</span>
              <span class="dwd-pt-tag" v-if="detail.hospitalDeptName">{{ detail.hospitalDeptName }}</span>
            </div>
          </div>
        </div>

        <div class="dwd-org-block">
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span class="dwd-org-row__value">{{ detail.hospitalName }}</span>
          </div>
          <div class="dwd-org-row" v-if="detail.hospitalDeptName">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span class="dwd-org-row__value">{{ detail.hospitalDeptName }}</span>
          </div>
        </div>

        <div class="dwd-sidebar-rule"></div>

        <div class="dwd-order-grid">
          <div class="dwd-order-grid__label">生产状态</div>
          <div class="dwd-order-grid__value">
            <el-tag size="small" :style="statusStyle(detail.status, detail.statusColor)">{{ statusLabel(detail.status) }}</el-tag>
          </div>
          <div class="dwd-order-grid__label">流转卡编号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.recordNo || '—' }}</div>
          <div class="dwd-order-grid__label">生产批号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.productionBatchNo || '—' }}</div>
          <div class="dwd-order-grid__label">订单编号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.orderCode || '—' }}</div>
          <div class="dwd-order-grid__label">虚拟单号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.publicOrderCode || '—' }}</div>
          <div class="dwd-order-grid__label">数据包编号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.designPackageCode || '—' }}</div>
          <div class="dwd-order-grid__label">产品总数</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.totalProductCount ?? '—' }}</div>
          <div class="dwd-order-grid__label">合格/不合格</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            <span style="color:#16a34a">{{ detail.qualifiedCount }}</span>
            <span style="color:#94a3b8"> / </span>
            <span style="color:#dc2626">{{ detail.unqualifiedCount }}</span>
          </div>
          <div class="dwd-order-grid__label">医生</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.doctorName || '—' }}</div>
          <div class="dwd-order-grid__label">期望交付</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.expectedDeliveryDate || '—' }}</div>
          <div class="dwd-order-grid__label">创建时间</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.createTime || '—' }}</div>
        </div>

        <div class="dwd-sidebar-rule"></div>
        <div class="dwd-sidebar-flags">
          <div class="dwd-flag-item dwd-flag-item--urgent" v-if="detail.isUrgent === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            加急
          </div>
        </div>
      </aside>

      <main class="dlr-main">
        <section class="form-section" v-if="detail.products && detail.products.length > 0">
          <div class="form-section-header">
            <span class="form-section-num">01</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">产品列表</span>
            <span class="form-section-count">{{ detail.products.length }}</span>
          </div>
          <div class="dwd-rebuild-grid">
            <div v-for="item in detail.products" :key="item.id" class="dwd-rebuild-card">
              <div class="dwd-rebuild-card__header">
                <div class="dwd-rebuild-card__name">{{ item.fileName || item.productName }}</div>
                <el-tag v-if="item.qcResult === 'pass'" size="small" type="success" effect="plain">合格</el-tag>
                <el-tag v-else-if="item.qcResult === 'fail'" size="small" type="danger" effect="plain">不合格</el-tag>
                <el-tag v-else size="small" type="info" effect="plain">待检</el-tag>
              </div>
              <div class="dwd-rebuild-card__reqs">
                <div class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">编号</span>
                  <span class="dwd-rebuild-req__text">{{ item.productNo }}</span>
                </div>
                <div v-if="item.materialName" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">材料</span>
                  <span class="dwd-rebuild-req__text">{{ item.materialName }}</span>
                </div>
                <div v-if="item.specName" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">规格</span>
                  <span class="dwd-rebuild-req__text">{{ item.specName }}</span>
                </div>
                <div v-if="item.colorName" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">颜色</span>
                  <span class="dwd-rebuild-req__text">{{ item.colorName }}</span>
                </div>
                <div v-if="item.certNo" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">注册证号</span>
                  <span class="dwd-rebuild-req__text dwd-rebuild-req__text--mono">{{ item.certNo }}</span>
                </div>
                <div v-if="item.statusName" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">状态</span>
                  <span class="dwd-rebuild-req__text">{{ item.statusName }}</span>
                </div>
                <div v-if="item.weight != null" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">重量</span>
                  <span class="dwd-rebuild-req__text">{{ item.weight }}g</span>
                </div>
                <div v-if="item.udiCode" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">UDI</span>
                  <span class="dwd-rebuild-req__text">{{ item.udiCode }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import UdiBadge from '@/components/UdiBadge.vue'
import { ref, watch, computed } from 'vue'
import dialogModal from '@/components/dialogModal.vue'
import { getProductionRecordDetail } from '@/api/production'
import { statusLabel, statusStyle } from '../statusConfig'

const props = defineProps<{ modelValue: boolean; recordId: number | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const detail = ref<any>(null)

watch(() => [props.modelValue, props.recordId] as const, async ([open, id], _, onCleanup) => {
  let current = true
  onCleanup(() => { current = false })
  detail.value = null
  if (!open || !id) return
  const res = await getProductionRecordDetail(id)
  if (current) detail.value = (res as any).data ?? res
}, { immediate: true })
</script>

<style scoped lang="scss">
@use '@/assets/style/dialogLeftRight.scss' as *;

.dwd-pt-card {
  margin: 10px; display: flex; align-items: center; gap: 10px; padding: 12px;
  background: #fff; border: 1px solid #e8edf5; border-radius: 14px; margin-bottom: 14px;
  position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
.dwd-pt-avatar {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 16px; font-weight: 800; color: #fff;
  box-shadow: 0 4px 14px rgba(14,165,233,.3);
}
.dwd-pt-meta { flex: 1; min-width: 0; }
.dwd-pt-name { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dwd-pt-tags { display: flex; align-items: center; gap: 3px; }
.dwd-pt-tag { font-size: 10.5px; font-weight: 600; color: #64748b; font-family: 'JetBrains Mono', monospace; }
.dwd-pt-tag-sep { color: #cbd5e1; font-size: 10px; }

.dwd-org-block { display: flex; flex-direction: column; gap: 6px; padding: 0 20px; margin-bottom: 14px; }
.dwd-org-row { display: flex; align-items: center; gap: 6px; svg { flex-shrink: 0; color: #94a3b8; } }
.dwd-org-row__value { font-size: 11.5px; color: #475569; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dwd-sidebar-rule { height: 1px; background: linear-gradient(to right, rgba(14,165,233,.3), rgba(99,102,241,.1), transparent); margin: 0 10px 10px; }

.dwd-order-grid { padding: 0 20px; display: grid; grid-template-columns: auto 1fr; gap: 0; margin-bottom: 14px; }
.dwd-order-grid__label {
  font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;
  letter-spacing: .6px; padding: 6px 0; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center;
  &:nth-last-child(-n+2) { border-bottom: none; }
}
.dwd-order-grid__value {
  padding: 6px 8px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 6px;
  &:nth-last-child(-n+2) { border-bottom: none; }
}
.dwd-order-grid__value--mono { font-size: 11px; font-weight: 600; color: #475569; font-family: 'JetBrains Mono', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dwd-sidebar-flags { margin: 0 15px; display: flex; gap: 6px; }
.dwd-flag-item { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 10.5px; font-weight: 700; border: 1px solid; }
.dwd-flag-item--urgent { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.25); color: #dc2626; }

.dwd-rebuild-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.dwd-rebuild-card {
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;
  transition: all .2s cubic-bezier(.16,1,.3,1);
  &:hover { border-color: #0ea5e9; box-shadow: 0 4px 16px rgba(14,165,233,.1); transform: translateY(-1px); }
}
.dwd-rebuild-card__header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dwd-rebuild-card__name { font-size: 13px; font-weight: 800; color: #1e293b; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dwd-rebuild-card__reqs { display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
.dwd-rebuild-req { display: flex; align-items: flex-start; gap: 6px; }
.dwd-rebuild-req__tag { font-size:11.5px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; white-space: nowrap; flex-shrink: 0; padding-top: 1px; }
.dwd-rebuild-req__text { font-size: 11.5px; color: #475569; line-height: 1.5; word-break: break-all; }
.dwd-rebuild-req__text--mono { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #7c3aed; }
</style>
