<template>
  <div class="dpid2-orderbar">
    <div class="dpid2-orderbar__row">
      <div class="dpid2-orderbar__item">
        <span class="dpid2-orderbar__label">订单编号</span>
        <span class="dpid2-orderbar__value">{{ orderInfo?.orderCode || orderCode || '—' }}</span>
      </div>
      <div class="dpid2-orderbar__item">
        <span class="dpid2-orderbar__label">客户</span>
        <span class="dpid2-orderbar__value">{{ orderInfo?.orgName || '—' }}</span>
      </div>
      <div class="dpid2-orderbar__item">
        <span class="dpid2-orderbar__label">联系人</span>
        <span class="dpid2-orderbar__value">{{ orderInfo?.operatorName || '—' }}</span>
      </div>
      <div class="dpid2-orderbar__item">
        <span class="dpid2-orderbar__label">患者姓名</span>
        <span class="dpid2-orderbar__value">{{ orderInfo?.patientName || '—' }}</span>
      </div>
    </div>
    <div class="dpid2-orderbar__separator"></div>
    <div class="dpid2-orderbar__row">
      <div class="dpid2-orderbar__item">
        <span class="dpid2-orderbar__label">医院</span>
        <span class="dpid2-orderbar__value">{{ orderInfo?.hospitalName || '—' }}</span>
      </div>
      <div class="dpid2-orderbar__item">
        <span class="dpid2-orderbar__label">预交货</span>
        <span class="dpid2-orderbar__value">{{ orderInfo?.expectedDeliveryDate || '—' }}</span>
      </div>
      <div class="dpid2-orderbar__item">
        <span class="dpid2-orderbar__label">是否邮寄</span>
        <span class="dpid2-orderbar__tag"
          :class="orderInfo?.isPostal === 1 ? 'dpid2-orderbar__tag--yes' : 'dpid2-orderbar__tag--no'">
          <svg v-if="orderInfo?.isPostal === 1" width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ orderInfo?.isPostal === 1 ? '是' : '否' }}
        </span>
      </div>
      <div class="dpid2-orderbar__item dpid2-orderbar__item--wide"
        v-if="orderInfo?.isPostal === 1 && orderInfo?.postalAddress">
        <span class="dpid2-orderbar__label">邮寄地址</span>
        <span class="dpid2-orderbar__value dpid2-orderbar__value--postal">{{ orderInfo.postalAddress }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  orderCode: string
  orderInfo?: {
    orderCode?: string; orgName?: string; operatorName?: string; patientName?: string; hospitalName?: string
    expectedDeliveryDate?: string | null; isPostal?: number | null; postalAddress?: string | null
  } | null
}>()
</script>
