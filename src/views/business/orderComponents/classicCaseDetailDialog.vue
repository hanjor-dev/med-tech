<template>
  <dialog-modal v-model="visible" title="经典案例详情" :subtitle="order?.orderCode ? `订单号：${order.orderCode}` : ''"
    width="1100px" :show-footer="false" @modal-close="visible = false">
    <div class="dlr-root" v-if="order">
      <!-- 左侧边栏 -->
      <aside class="dlr-slidebar">
        <!-- 患者卡片 -->
        <div class="dwd-pt-card">
          <span class="dwd-classic-badge">
            <el-icon>
              <StarFilled />
            </el-icon>
          </span>
          <div class="dwd-pt-avatar">
            <span>{{ order.patientName?.charAt(0) || '?' }}</span>
          </div>
          <div class="dwd-pt-meta">
            <div class="dwd-pt-name">
              {{ order.patientName }}
            </div>
            <div class="dwd-pt-tags">
              <span class="dwd-pt-tag">{{ order.patientGenderName }}</span>
              <span class="dwd-pt-tag-sep">/</span>
              <span class="dwd-pt-tag">{{ order.patientAge }}岁</span>
              <span class="dwd-pt-tag-sep">/</span>
              <span class="dwd-pt-tag">{{ order.statusName }}</span>
            </div>
          </div>
          <div class="dwd-pt-indicator" :class="`is-${(order as any).status}`"></div>
        </div>

        <!-- 医院信息 -->
        <div class="dwd-org-block">
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span class="dwd-org-row__value">{{ order.hospitalName }}</span>
          </div>
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span class="dwd-org-row__value">{{ order.deptName }}</span>
          </div>
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span class="dwd-org-row__value">{{ order.doctorName }}</span>
          </div>
        </div>

        <div class="dwd-sidebar-rule"></div>

        <!-- 订单信息 -->
        <div class="dwd-order-grid">
          <div class="dwd-order-grid__label">订单类型</div>
          <div class="dwd-order-grid__value">
            <el-tag size="small" :type="order.orderType === 1 ? 'primary' : 'warning'" effect="dark">
              {{ order.orderTypeName }}
            </el-tag>
          </div>

          <div class="dwd-order-grid__label">业务类型</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ order.businessTypeName }}</div>

          <div class="dwd-order-grid__label">提单机构</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ order.orgName }}</div>

          <div class="dwd-order-grid__label">操作员</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ order.operatorName }}</div>

          <div class="dwd-order-grid__label">设计师</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ order.designerName || '—' }}</div>

          <div class="dwd-order-grid__label">地区</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ order.fullAreaName || '—' }}</div>

          <div class="dwd-order-grid__label">期望交付</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            {{ order.expectedDeliveryDate ? dayjs(order.expectedDeliveryDate).format('YYYY-MM-DD HH:mm') : '—' }}
          </div>

          <div class="dwd-order-grid__label">创建时间</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            {{ order.createTime ? dayjs(order.createTime).format('YYYY-MM-DD HH:mm') : '—' }}
          </div>

          <div class="dwd-order-grid__label">标记时间</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            {{ classicCase?.classicCaseTime ? dayjs(classicCase.classicCaseTime).format('YYYY-MM-DD HH:mm') : '—' }}
          </div>

          <div class="dwd-order-grid__label">标记人</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ classicCase?.classicCaseByName || '—' }}
          </div>

          <div class="dwd-order-grid__label">标记备注</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ classicCase?.classicCaseRemark || '—' }}
          </div>
        </div>

        <div class="dwd-sidebar-rule"></div>
        <!-- Flags -->
        <div class="dwd-sidebar-flags">
          <div class="dwd-flag-item dwd-flag-item--urgent" v-if="order.isUrgent === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            加急
          </div>
          <div class="dwd-flag-item dwd-flag-item--postal" v-if="order.isPostal === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            邮寄
          </div>
          <div class="dwd-flag-item dwd-flag-item--delivery" v-if="order.needsPhysicalDelivery === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            实体交付
          </div>
        </div>
        <div class="dwd-flag-addr" v-if="order.isPostal === 1 && order.postalAddress">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style="flex:1;word-break:break-all">{{ order.postalAddress }}</span>
        </div>
      </aside>
      <!-- 右侧主内容 -->
      <main class="dlr-main">
        <!-- 01 重建项目 -->
        <section class="form-section" v-if="order.items && order.items.length > 0">
          <div class="form-section-header">
            <span class="form-section-num">01</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">重建项目</span>
            <span class="form-section-count">{{ order.items.length }}</span>
          </div>
          <div class="dwd-rebuild-grid">
            <div v-for="(item, idx) in order.items" :key="idx" class="dwd-rebuild-card">
              <div class="dwd-rebuild-card__header">
                <div class="dwd-rebuild-card__part-chip">{{ item.bodyPartName }}</div>
                <div class="dwd-rebuild-card__name">{{ item.projectName }}</div>
                <el-tag v-if="item.categoryName" size="small" effect="plain">{{ item.categoryName }}</el-tag>
              </div>
              <div class="dwd-rebuild-card__reqs"
                v-if="item.projectDesc || item.formingRequirement || item.otherRequirement">
                <div v-if="item.projectDesc" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">说明</span>
                  <span class="dwd-rebuild-req__text">{{ item.projectDesc }}</span>
                </div>
                <div v-if="item.formingRequirement" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">成型</span>
                  <span class="dwd-rebuild-req__text">{{ item.formingRequirement }}</span>
                </div>
                <div v-if="item.otherRequirement" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">其他</span>
                  <span class="dwd-rebuild-req__text">{{ item.otherRequirement }}</span>
                </div>
              </div>
              <div class="dwd-rebuild-card__footer" v-if="item.projectEstimatedHours">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ item.projectEstimatedHours }}h
              </div>
            </div>
          </div>
        </section>

        <!-- 02 影像文件 -->
        <section class="form-section"
          v-if="(order.imageDataFiles && order.imageDataFiles.length > 0) || (order.imageReportFiles && order.imageReportFiles.length > 0) || (order.approvalFiles && order.approvalFiles.length > 0)">
          <div class="form-section-header">
            <span class="form-section-num">02</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">影像文件</span>
            <span class="form-section-count">
              {{ (order.imageDataFiles?.length || 0) + (order.imageReportFiles?.length || 0) +
                (order.approvalFiles?.length || 0) }}
            </span>
          </div>
          <!-- 原始影像数据 -->
          <div v-if="order.imageDataFiles?.length" class="dwd-img-zone">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              原始影像数据
            </div>
            <div class="dwd-img-grid">
              <div v-for="f in order.imageDataFiles" :key="f.fileId" class="dwd-img-card">
                <div class="dwd-img-card__thumb">
                  <img v-if="f.thUrl" :src="f.thUrl" :alt="f.fileName"
                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
                  <div v-else class="dwd-img-card__thumb-empty">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  </div>
                </div>
                <div class="dwd-img-card__info">
                  <span class="dwd-img-card__name">{{ f.fileName }}</span>
                  <span class="dwd-img-card__meta">{{ f.fileSizeText }}</span>
                </div>
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.fileId, f.fileName)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 影像报告文件 -->
          <div v-if="order.imageReportFiles?.length" class="dwd-img-zone" style="margin-top:10px">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              </svg>
              影像报告文件
            </div>
            <div class="dwd-img-grid">
              <div v-for="f in order.imageReportFiles" :key="f.fileId" class="dwd-img-card">
                <div class="dwd-img-card__thumb dwd-img-card__thumb--doc">
                  <div class="dwd-img-card__thumb-empty" style="color:#0891b2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    </svg>
                  </div>
                </div>
                <div class="dwd-img-card__info">
                  <span class="dwd-img-card__name">{{ f.fileName }}</span>
                  <span class="dwd-img-card__meta">{{ f.fileSizeText }}</span>
                </div>
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.fileId, f.fileName)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 审批文件 -->
          <div v-if="order.approvalFiles?.length" class="dwd-img-zone" style="margin-top:10px">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              </svg>
              审批文件
            </div>
            <div class="dwd-img-grid">
              <div v-for="f in order.approvalFiles" :key="f.fileId" class="dwd-img-card">
                <div class="dwd-img-card__thumb dwd-img-card__thumb--doc">
                  <div class="dwd-img-card__thumb-empty" style="color:#f59e0b">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    </svg>
                  </div>
                </div>
                <div class="dwd-img-card__info">
                  <span class="dwd-img-card__name">{{ f.fileName }}</span>
                  <span class="dwd-img-card__meta">{{ f.fileSizeText }}</span>
                </div>
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.fileId, f.fileName)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </el-button>
              </div>
            </div>
          </div>
        </section>

        <!-- 空状态 -->
        <div
          v-if="(!order.items || order.items.length === 0) && (!order.imageDataFiles?.length) && (!order.imageReportFiles?.length) && (!order.approvalFiles?.length)"
          class="dwd-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>暂无重建项目或影像文件</span>
        </div>
      </main>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="dwd-loading">
      <el-icon class="is-loading" :size="28" color="#cbd5e1">
        <Loading />
      </el-icon>
    </div>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loading, StarFilled } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import { orderDetail, classicCaseDetail, type OrderDetailVO } from '@/api/order'
import type { ClassicCaseVO } from '@/api/order'
import dayjs from 'dayjs'

defineOptions({ name: 'ClassicCaseDetailDialog' })

const props = defineProps<{ modelValue: boolean; orderId: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const order = ref<OrderDetailVO | null>(null)
const classicCase = ref<ClassicCaseVO | null>(null)

const fetchDetail = async () => {
  if (!props.orderId) return
  loading.value = true
  try {
    const [orderRes, classicRes] = await Promise.all([
      orderDetail(props.orderId),
      classicCaseDetail(props.orderId),
    ])
    order.value = orderRes
    classicCase.value = classicRes
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    fetchDetail()
  } else {
    order.value = null
    classicCase.value = null
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/style/dialogLeftRight.scss' as *;
@use '@/assets/style/business.scss' as *;


.dwd-classic-badge {
  position: absolute;
  top: 6px;
  right: 8px;

  i {
    color: #f59e0b;
  }
}

.dwd-classic-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dwd-info-row {
  display: flex;
  align-items: baseline;
  gap: 8px;

  &--block {
    flex-direction: column;
    gap: 4px;
  }
}

.dwd-info-label {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.dwd-info-value {
  font-size: 12.5px;
  color: #475569;

  &--remark {
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
    background: #f1f5f9;
    padding: 6px 8px;
    border-radius: 6px;
    width: 100%;
    word-break: break-all;
  }
}

.dwd-main {
  flex: 1;
  min-width: 0;
}

.dwd-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

// 复用 orderDetailDialog 样式



.dwd-img-group {
  margin-bottom: 14px;
}

.dwd-img-group-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.dwd-img-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.dwd-img-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f8fafc;
  border: 1.5px solid #e8edf2;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;

  &:hover {
    border-color: #cbd5e1;
  }
}

.dwd-img-card__thumb {
  width: 100%;
  height: 90px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.dwd-img-placeholder {
  color: #cbd5e1;
}

.dwd-img-card__info {
  padding: 0 8px 8px;
}

.dwd-img-card__name {
  font-size: 11.5px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dwd-img-card__meta {
  font-size: 10px;
  color: #94a3b8;
}

.dwd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 24px;
  color: #cbd5e1;
}

.ml-6 {
  margin-left: 6px;
}

.dwd-pt-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
