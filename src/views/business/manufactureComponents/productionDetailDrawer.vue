<template>
  <dialog-modal
    v-model="visible"
    title="生产工单详情"
    :subtitle="detail?.recordNo || ''"
    width="1100px"
    :show-footer="false"
    @modal-close="visible = false">
    <div class="dlr-root" v-if="detail">
      <!-- Left Sidebar -->
      <aside class="dlr-slidebar">
        <!-- Patient Identity Card -->
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
          <div class="dwd-pt-indicator" :class="`is-${detail.status}`"></div>
        </div>

        <!-- Hospital & Dept & Doctor -->
        <div class="dwd-org-block">
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span class="dwd-org-row__value">{{ detail.hospitalName }}</span>
          </div>
          <div class="dwd-org-row" v-if="detail.hospitalDeptName">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span class="dwd-org-row__value">{{ detail.hospitalDeptName }}</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="dwd-sidebar-rule"></div>

        <!-- Production Info Grid -->
        <div class="dwd-order-grid">
          <div class="dwd-order-grid__label">生产状态</div>
          <div class="dwd-order-grid__value">
            <el-tag size="small" :style="statusStyle(detail.status, detail.statusColor)">
              {{ statusLabel(detail.status) }}
            </el-tag>
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

          <div class="dwd-order-grid__label">订单类型</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            {{ detail.orderType === 1 ? '医疗器械' : detail.orderType === 2 ? '非医疗器械' : '—' }}
          </div>

          <div class="dwd-order-grid__label">当前工序</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ detail.currentProcessName || '—' }}</div>

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
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ dayjs(detail.expectedDeliveryDate).format('YYYY-MM-DD HH:mm:ss') || '—' }}</div>

          <template v-if="detail.processingApplicationId">
            <div class="dwd-order-grid__label">申请交付时间</div>
            <div class="dwd-order-grid__value">{{ detail.processingDeliveryTime?.replace('T', ' ') || '—' }}</div>
            <div class="dwd-order-grid__label">申请邮寄地址</div>
            <div class="dwd-order-grid__value">{{ detail.processingPostalAddress || '—' }}</div>
          </template>
          <div class="dwd-order-grid__label">创建时间</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ dayjs(detail.createTime).format('YYYY-MM-DD HH:mm:ss') || '—' }}</div>
        </div>

        <!-- Divider -->
        <div class="dwd-sidebar-rule"></div>

        <!-- Flags -->
        <div class="dwd-sidebar-flags">
          <div class="dwd-flag-item dwd-flag-item--urgent" v-if="detail.isUrgent === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            加急
          </div>
        </div>
      </aside>

      <!-- Right Main Content -->
      <main class="dlr-main">
        <!-- 01 生产进度 -->
        <section class="form-section">
          <div class="form-section-header">
            <span class="form-section-num">01</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">生产进度</span>
          </div>
          <div class="progress-steps">
            <div
              v-for="(step, idx) in progressSteps"
              :key="step.value"
              class="ps-item"
              :class="{
                'is-done': detail.status > step.value,
                'is-active': detail.status === step.value,
                'is-waiting': detail.status < step.value,
              }">
              <div class="ps-dot">
                <svg v-if="detail.status > step.value" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div class="ps-label">{{ step.label }}</div>
            </div>
          </div>
        </section>

        <!-- 02 文件下载 -->
        <section class="form-section" v-if="detail.processingApplicationFile || detail.instructionFile || detail.drawingFile || detail.dataPackageFile || detail.flowCardFile">
          <div class="form-section-header">
            <span class="form-section-num">02</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">文件下载</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <processing-document-file v-if="detail.processingApplicationFile"
              :file="{ ...detail.processingApplicationFile, previewUrl: detail.processingApplicationFile.fileUrl }"
              :can-download="detail.status !== 9010" />
            <div v-if="detail.instructionFile" class="dwd-file-card">
              <div class="dwd-file-card__icon instruction">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="dwd-file-card__info">
                <span class="dwd-file-card__name">指令单</span>
              </div>
              <div class="dwd-file-card__actions">
                <el-button size="small" @click="previewFile(detail.instructionFile!.fileUrl, '指令单', 'instruction')">预览</el-button>
                <el-button v-if="detail.status !== 9010" size="small" type="primary" @click="triggerDownload(detail.instructionFile!.fileUrl, (detail.patientName || '') + '指令单.xlsx')">下载</el-button>
              </div>
            </div>
            <div v-if="detail.drawingFile" class="dwd-file-card">
              <div class="dwd-file-card__icon drawing">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div class="dwd-file-card__info">
                <span class="dwd-file-card__name">图纸</span>
              </div>
              <div class="dwd-file-card__actions">
                <el-button size="small" @click="previewFile(detail.drawingFile!.fileUrl, '图纸.xlsx', 'drawing')">预览</el-button>
                <el-button v-if="detail.status !== 9010" size="small" type="primary" @click="triggerDownload(detail.drawingFile!.fileUrl, (detail.patientName || '') + '图纸.xlsx')">下载</el-button>
              </div>
            </div>
            <div v-if="detail.dataPackageFile" class="dwd-file-card">
              <div class="dwd-file-card__icon download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <div class="dwd-file-card__info">
                <span class="dwd-file-card__name">{{ detail.dataPackageFile.fileName || detail.designPackageCode }}</span>
                <span v-if="detail.dataPackageFile.fileSize" class="dwd-file-card__size">{{ (detail.dataPackageFile.fileSize / 1024 / 1024).toFixed(1) }} MB</span>
              </div>
              <div class="dwd-file-card__actions">
                <el-button v-if="detail.status !== 9010" size="small" type="primary" :loading="downloading" @click="handleDownloadPackage">下载</el-button>
              </div>
            </div>
            <div v-if="detail.flowCardFile" class="dwd-file-card">
              <div class="dwd-file-card__icon" style="background:#0369a1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div class="dwd-file-card__info">
                <span class="dwd-file-card__name">{{ detail.flowCardFile.fileName || '流转卡' }}</span>
              </div>
              <div class="dwd-file-card__actions">
                <el-button size="small" @click="previewFile(detail.flowCardFile!.fileUrl, detail.flowCardFile!.fileName || '流转卡', 'instruction')">预览</el-button>
                <el-button v-if="detail.status !== 9010" size="small" type="primary" @click="triggerDownload(detail.flowCardFile!.fileUrl, (detail.patientName || '') + (detail.flowCardFile!.fileName || '流转卡.xlsx'))">下载</el-button>
              </div>
            </div>
          </div>
        </section>

        <!-- 03 产品列表 -->
        <section class="form-section" v-if="detail.products && detail.products.length > 0">
          <div class="form-section-header">
            <span class="form-section-num">03</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">产品列表</span>
            <span class="form-section-count">{{ detail.products.length }}</span>
          </div>
          <div class="dwd-rebuild-grid">
            <div v-for="item in detail.products" :key="item.id" class="dwd-rebuild-card">
              <div class="dwd-rebuild-card__header">
                <!-- <el-tag size="small" :type="productTagType(item.status)" effect="light">{{ item.statusName }}</el-tag> -->
                <div class="dwd-rebuild-card__name">{{ item.fileName }}</div>
              </div>
              <div class="dwd-rebuild-card__reqs">
                <div class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">编号</span>
                  <span class="dwd-rebuild-req__text">{{ item.productNo }}</span>
                </div>
                <div v-if="item.productName" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">产品名称</span>
                  <span class="dwd-rebuild-req__text">{{ item.productName }}</span>
                </div>
                <div v-if="item.materialName" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">材料</span>
                  <span class="dwd-rebuild-req__text">{{ item.materialName }}</span>
                </div>
                <div v-if="item.specName" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">规格</span>
                  <span class="dwd-rebuild-req__text">{{ item.specName }}</span>
                </div>
                <div v-if="item.weight != null" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">重量</span>
                  <span class="dwd-rebuild-req__text">{{ item.weight }} g</span>
                </div>
                <div v-if="item.udiCode || canEditUdi" class="dwd-rebuild-req">
                  <span class="dwd-rebuild-req__tag">UDI</span>
                  <div v-if="editingProductId === item.id" style="display:flex;align-items:center;gap:6px;flex:1">
                    <el-input v-model="editingUdiCode" size="small" placeholder="请输入UDI" style="flex:1" />
                    <el-button size="small" type="primary" :loading="savingUdi" @click="saveUdi(item.id)">保存</el-button>
                    <el-button size="small" @click="cancelEditUdi">取消</el-button>
                  </div>
                  <div v-else style="display:flex;align-items:center;gap:6px;flex:1">
                    <span class="dwd-rebuild-req__text">{{ item.udiCode || '—' }}</span>
                    <svg
                      v-if="canEditUdi"
                      @click="startEditUdi(item.id, item.udiCode || '')"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      style="cursor:pointer;color:#0ea5e9;flex-shrink:0"
                      class="udi-edit-icon">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 04 备注 -->
        <section class="form-section">
          <div class="form-section-header">
            <span class="form-section-num">04</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">备注</span>
          </div>
          <div class="dwd-remark-card">{{ detail.designerRemark || '暂无备注' }}</div>
        </section>
      </main>
    </div>
  </dialog-modal>

  <file-preview-dialog v-model="previewVisible" :file-url="previewUrl" :file-name="previewFileName" />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import ProcessingDocumentFile from '../designComponents/processingDocumentFile.vue'
import FilePreviewDialog from './filePreviewDialog.vue'
import { getProductionRecordDetail, downloadDesignPackage, batchUpdateUdi, type ProductionRecordDetailVO } from '@/api/production'
import { statusLabel, statusStyle } from '../statusConfig'
import dayjs from 'dayjs'

const props = defineProps<{ modelValue: boolean; id: number | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const downloading = ref(false)
const detail = ref<ProductionRecordDetailVO | null>(null)

const editingProductId = ref<number | null>(null)
const editingUdiCode = ref('')
const savingUdi = ref(false)

const canEditUdi = computed(() => {
  return detail.value?.orderType === 1 && detail.value.status >= 3020 && detail.value.status !== 9010
})


const progressSteps = computed(() => {
  const steps = [
    { value: 3010, label: '待打印' },
    { value: 3020, label: '打印中' },
    { value: 3030, label: '打印完成' },
    { value: 4010, label: '后处理中' },
    { value: 5010, label: '过程检' },
    { value: 5050, label: '包装中' },
    { value: 6010, label: '入库' },
  ]
  if (detail.value?.orderType !== 1) return steps.filter(s => s.value !== 4010)
  return steps
})

const PRODUCT_STATUS_TAG: Record<string, string> = {
  in_process: 'primary', pass: 'success', redo: 'danger', fail: 'danger',
}
const productTagType = (s: string) => (PRODUCT_STATUS_TAG[s] || 'info') as any

watch(() => [props.modelValue, props.id] as const, async ([open, id], _, onCleanup) => {
  let current = true
  onCleanup(() => { current = false })
  detail.value = null
  if (!open || !id) return
  loading.value = true
  try {
    const res = await getProductionRecordDetail(id)
    if (current) detail.value = (res as any).data ?? res
  } finally {
    if (current) loading.value = false
  }
})

watch(visible, (val) => { if (!val) { emit('update:modelValue', false); emit('close') } })

const previewVisible = ref(false)
const previewUrl = ref<string | null>(null)
const previewFileName = ref('')
const previewFileType = ref<'drawing' | 'instruction'>('instruction')

const previewFile = (url: string, name: string, type: 'drawing' | 'instruction') => {
  previewUrl.value = url
  previewFileName.value = name
  previewFileType.value = type
  previewVisible.value = true
}

const triggerDownload = async (url: string, name: string) => {
  const blob = await fetch(url).then(r => r.blob())
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

const handleDownloadPackage = async () => {
  if (!detail.value?.id) {
    ElMessage.warning('暂无设计数据包ID，请联系管理员')
    return
  }
  downloading.value = true
  try {
    await downloadDesignPackage(detail.value.id)
    const file = detail.value.dataPackageFile
    if (file?.fileUrl) {
      triggerDownload(file.fileUrl, (detail.value.patientName || '') + (file.fileName || detail.value.designPackageCode || '数据包'))
    }
    ElMessage.success('下载成功，流转卡状态已更新')
  } catch {
    ElMessage.error('下载失败')
  } finally {
    downloading.value = false
  }
}

const startEditUdi = (productId: number, currentUdi: string) => {
  editingProductId.value = productId
  editingUdiCode.value = currentUdi || ''
}

const cancelEditUdi = () => {
  editingProductId.value = null
  editingUdiCode.value = ''
}

const saveUdi = async (productId: number) => {
  if (!detail.value?.id) return

  savingUdi.value = true
  try {
    await batchUpdateUdi({
      recordId: detail.value.id,
      products: [{ productId, udiCode: editingUdiCode.value }]
    })

    // 更新本地数据
    const product = detail.value.products?.find(p => p.id === productId)
    if (product) {
      product.udiCode = editingUdiCode.value
    }

    ElMessage.success('UDI更新成功')
    cancelEditUdi()
  } catch {
    ElMessage.error('UDI更新失败')
  } finally {
    savingUdi.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/style/dialogLeftRight.scss' as *;

// ── Patient Identity Card ───────────────────────────────────────────────────────
.dwd-pt-card {
  margin: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 14px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: sidebarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
}

.dwd-pt-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
}

.dwd-pt-meta {
  flex: 1;
  min-width: 0;
}

.dwd-pt-name {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dwd-pt-tags {
  display: flex;
  align-items: center;
  gap: 3px;
}

.dwd-pt-tag {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}

.dwd-pt-tag-sep {
  color: #cbd5e1;
  font-size: 10px;
}

.dwd-pt-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.is-3010 {
    background: #64748b;
    box-shadow: 0 0 6px rgba(100, 116, 139, 0.4);
  }

  &.is-3020 {
    background: #f59e0b;
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
    animation: statusPulse 2s ease-in-out infinite;
  }

  &.is-3030 {
    background: #6366f1;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
    animation: statusPulse 2s ease-in-out infinite;
  }

  &.is-3040,
  &.is-3070 {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }

  &.is-3050 {
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
    animation: statusPulse 2s ease-in-out infinite;
  }

  &.is-3060 {
    background: #6366f1;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
    animation: statusPulse 2s ease-in-out infinite;
  }
}

@keyframes sidebarSlideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// ── Hospital & Dept ────────────────────────────────────────────────────────────
.dwd-org-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 20px;
  margin-bottom: 14px;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both;
}

.dwd-org-row {
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    flex-shrink: 0;
    color: #94a3b8;
    opacity: 0.8;
  }
}

.dwd-org-row__value {
  font-size: 11.5px;
  color: #475569;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Rule ───────────────────────────────────────────────────────────────────────
.dwd-sidebar-rule {
  height: 1px;
  background: linear-gradient(to right, rgba(14, 165, 233, 0.3), rgba(99, 102, 241, 0.1), transparent);
  margin: 0 10px 10px;
}

// ── Order Info Grid ─────────────────────────────────────────────────────────────
.dwd-order-grid {
  padding: 0 20px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0;
  margin-bottom: 14px;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.dwd-order-grid__label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;

  &:nth-last-child(-n+2) {
    border-bottom: none;
  }
}

.dwd-order-grid__value {
  padding: 6px 8px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 6px;

  &:nth-last-child(-n+2) {
    border-bottom: none;
  }
}

.dwd-order-grid__value--mono {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Flags ──────────────────────────────────────────────────────────────────────
.dwd-sidebar-flags {
  margin: 0 15px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both;
}

.dwd-flag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  border: 1px solid;
  letter-spacing: 0.2px;

  &--urgent {
    background: rgba(239, 68, 68, .08);
    border-color: rgba(239, 68, 68, .25);
    color: #dc2626;
  }
}

// ── Rebuild Projects ────────────────────────────────────────────────────────────
.dwd-rebuild-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.dwd-rebuild-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: #0ea5e9;
    box-shadow: 0 4px 16px rgba(14, 165, 233, 0.1);
    transform: translateY(-1px);
  }
}

.dwd-rebuild-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dwd-rebuild-card__part-chip {
  font-size: 9.5px;
  font-weight: 800;
  color: #fff;
  background: #0ea5e9;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.dwd-rebuild-card__name {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.2px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dwd-rebuild-card__reqs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
}

.dwd-rebuild-req {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.dwd-rebuild-req__tag {
  font-size: 11.5px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: auto;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 1px;
}

.dwd-rebuild-req__text {
  font-size: 11.5px;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

// ── Progress Steps ─────────────────────────────────────────────────────────────
.progress-steps {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  overflow-x: auto;
}

.ps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 60px;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 10px;
    left: calc(50% + 12px);
    width: calc(100% - 24px);
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
  }

  &.is-done {
    .ps-dot {
      background: #10b981;
      border-color: #10b981;
      color: #fff;
    }
    .ps-label { color: #10b981; }
    &:not(:last-child)::after { background: #10b981; }
  }

  &.is-active {
    .ps-dot {
      background: #0ea5e9;
      border-color: #0ea5e9;
      color: #fff;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
    }
    .ps-label { color: #0ea5e9; font-weight: 700; }
    &:not(:last-child)::after { background: linear-gradient(to right, #0ea5e9, #e2e8f0); }
  }

  &.is-waiting {
    .ps-dot {
      background: #fff;
      border-color: #e2e8f0;
      color: #94a3b8;
    }
    .ps-label { color: #94a3b8; }
  }
}

.ps-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.2s;
  z-index: 1;
}

.ps-label {
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

// ── File Card ─────────────────────────────────────────────────────────────────
.dwd-file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: #0ea5e9;
    box-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
    transform: translateY(-1px);
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.instruction { background: #7c3aed; }
    &.drawing { background: #0369a1; }
    &.download { background: #0d9488; }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__name {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__size {
    font-size: 11px;
    color: #94a3b8;
  }

  &__actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
}

.dwd-remark-card {
  max-height: 180px;
  min-height: 72px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

// ── Empty ─────────────────────────────────────────────────────────────────────
.dwd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 24px;
  color: #cbd5e1;

  svg { opacity: 0.4; }
  span { font-size: 12px; font-weight: 600; }
}

// ── UDI Edit Icon ─────────────────────────────────────────────────────────────
.udi-edit-icon {
  transition: all 0.2s;

  &:hover {
    color: #0284c7;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
