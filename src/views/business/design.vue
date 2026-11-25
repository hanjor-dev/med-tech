<template>
  <list-template ref="listTemplateRef" page-class="design" hero-eyebrow="Designer" hero-title="我的工单"
    hero-desc="管理设计工单，上传模型并按订单类型准备生产资料。" :stats="stats" :filter-inputs="filterInputs"
    :filter-selects="filterSelects" :filter-date-ranges="filterDateRanges" :show-filter-reset="false"
    :show-filter-create="false" :hideFilter="false" @filter-input-change="onFilterInputChange"
    @filter-change="onFilterChange" @filter-reset="handleFilterReset">

    <!-- 状态流水线（filter-bottom slot） -->
    <template #filter-bottom>
      <div class="segment-tabs" role="tablist">
        <button v-for="step in designerSteps" :key="step.value" class="segment-tabs__btn"
          :class="{ 'is-active': activeStatus === step.value }" @click="switchStatus(step.value)">
          {{ step.label }}
        </button>
      </div>
    </template>

    <!-- 筛选栏右侧操作 -->
    <template #filter-extra-actions>
      <div class="filter-actions">
        <el-button class="filter-btn" @click="handleFilterReset">重置</el-button>
      </div>
    </template>

    <!-- 主内容：数据表格 -->
    <div class="page-body-panel">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">工单列表</div>
            <div class="header-actions">
              <el-button link type="primary" size="small" @click="handleExport" v-permission="'design:WorkExport'">
                <el-icon>
                  <Download />
                </el-icon>
                <span>设计师工作量统计</span>
              </el-button>
            </div>
          </div>
        </template>
        <div class="roles-list-wrap table-scroll-container" ref="tableScrollRef" @mousedown="onTableScrollMouseDown"
          @mousemove="onTableScrollMouseMove" @mouseup="onTableScrollMouseUp" @mouseleave="onTableScrollMouseLeave">
          <el-table :data="tableData" v-loading="loading" ref="tableRef" :header-cell-style="{ background: '#f9fafb' }"
            stripe height="100%">
            <el-table-column type="index" label="序号" width="55" align="center" fixed />
            <!-- 动态列 -->
            <template v-for="col in visibleColumns" :key="col.field">
              <!-- 订单编号 -->
              <el-table-column v-if="col.field === 'orderCode'" :prop="col.field" :label="col.label" :width="col.width"
                :min-width="!col.width ? 170 : undefined">
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <span class="order-code-text">{{ row.orderCode }}</span>
                </template>
              </el-table-column>

              <!-- 状态 -->
              <el-table-column v-else-if="col.field === 'statusName'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <div class="status-cell">
                    <el-tag size="small" effect="light"
                    :style="{
                      backgroundColor: row.statusColor?.bgColor || '#f3f4f6',
                      borderColor: row.statusColor?.bdColor || '#e5e7eb',
                      color: row.statusColor?.color || '#6b7280',
                    }">
                    {{ row.statusName }}
                  </el-tag>
                  </div>
                </template>
              </el-table-column>

              <!-- 加急 -->
              <el-table-column v-else-if="col.field === 'isUrgent'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <el-tag v-if="row.isUrgent === 1" size="small" type="danger" effect="light"
                    class="urgent-tag">加急</el-tag>
                  <span v-else>否</span>
                </template>
              </el-table-column>

              <!-- 患者姓名 -->
              <el-table-column v-else-if="col.field === 'patientName'" :prop="col.field" :label="col.label"
                :width="col.width" :min-width="!col.width ? 100 : undefined" show-overflow-tooltip>
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <span class="patient-name">{{ row.patientName }}</span>
                </template>
              </el-table-column>

              <!-- 数据包 -->
              <el-table-column v-else-if="col.field === 'packageCount'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner">{{ col.label }}</span>
                </template>
                <template #default="{ row }">
                  <template v-if="row.packageCount > 0">
                    <span class="pkg-badge">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M2 4.5C2 3.67 2.67 3 3.5 3h2C6.33 3 7 3.67 7 4.5v1C7 6.33 6.33 7 5.5 7h-2C2.67 7 2 6.33 2 5.5v-1z"
                          fill="currentColor" opacity=".5" />
                        <path
                          d="M9 7.5C9 6.67 9.67 6 10.5 6h2c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5h-2c-.83 0-1.5-.67-1.5-1.5v-1z"
                          fill="currentColor" opacity=".5" />
                        <path d="M4 9h8M4 11h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                      </svg>
                      {{ row.packageCount }}
                    </span>
                  </template>
                  <span v-else class="text-muted pkg-none">未上传</span>
                </template>
              </el-table-column>

              <!-- 重建项目摘要 -->
              <el-table-column v-else-if="col.field === 'rebuildProjectSummary'" :prop="col.field" :label="col.label"
                :width="col.width" :min-width="!col.width ? 180 : undefined">
                <template #header>
                  <span class="th-inner">{{ col.label }}</span>
                </template>
                <template #default="{ row }">
                  <div class="project-tags">
                    <el-tag v-if="row.rebuildProjectSummary" size="small" type="primary" effect="plain">
                      {{ row.rebuildProjectSummary }}
                    </el-tag>
                    <span v-else class="text-muted">—</span>
                  </div>
                </template>
              </el-table-column>

              <!-- 实体交付 -->
              <el-table-column v-else-if="col.field === 'needsPhysicalDelivery'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner">{{ col.label }}</span>
                </template>
                <template #default="{ row }">
                  <el-tag v-if="row.needsPhysicalDelivery === 1" size="small" type="success" effect="plain">
                    是
                  </el-tag>
                  <span v-else class="text-muted">否</span>
                </template>
              </el-table-column>

              <!-- 开始设计时间 -->
              <el-table-column v-else-if="col.field === 'designStartTime'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <span>{{ dayjs(row.designStartTime).format('YYYY-MM-DD HH:mm:ss') }} </span>
                </template>
              </el-table-column>

              <!-- 设计结束时间 -->
              <el-table-column v-else-if="col.field === 'designSubmitTime'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <span>{{ row.designSubmitTime ? dayjs(row.designSubmitTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}
                  </span>
                </template>
              </el-table-column>

              <!-- 创建时间 -->
              <el-table-column v-else-if="col.field === 'createTime'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <span>{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }} </span>
                </template>
              </el-table-column>

              <!-- 期望交付时间 -->
              <el-table-column v-else-if="col.field === 'expectedDeliveryDate'" :prop="col.field" :label="col.label"
                :width="col.width" align="center">
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <span>{{ dayjs(row.expectedDeliveryDate).format('YYYY-MM-DD HH:mm:ss') }} </span>
                </template>
              </el-table-column>

              <!--操作列-->
              <el-table-column v-else-if="col.field === 'action'" :prop="col.field" :label="col.label"
                :width="col.width" :fixed="col.fixed" align="center">
                <template #default="{ row }">
                  <el-dropdown trigger="click" @command="(cmd: string) => handleActionCommand(cmd, row)">
                    <el-button text :icon="MoreFilled" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <template v-for="action in getRowActions(row)" :key="action.command">
                          <el-dropdown-item :command="action.command" :divided="action.divided">
                            <span class="icon-tag" v-if="action.permission" v-permission="action.permission">
                              <el-icon>
                                <component :is="action.icon" />
                              </el-icon>
                              {{ action.label }}
                            </span>
                            <span class="icon-tag" v-else>
                              <el-icon>
                                <component :is="action.icon" />
                              </el-icon>
                              {{ action.label }}
                            </span>
                          </el-dropdown-item>
                        </template>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
              <!-- 默认可排序列 -->
              <el-table-column v-else :prop="col.field" :label="col.label" :width="col.width"
                :min-width="!col.width ? 120 : undefined" show-overflow-tooltip>
                <template #header>
                  <span class="th-inner" :class="{ 'th-inner--sortable': !!col.sortField }"
                    @click="handleColumnSort(col)">
                    {{ col.label }}
                    <span v-if="col.sortField" class="th-sort-icon"
                      :class="{ 'th-sort-icon--active': currentSortField === col.sortField }">
                      <el-icon v-if="currentSortField === col.sortField && currentSortOrder === 'DESC'">
                        <CaretBottom />
                      </el-icon>
                      <el-icon v-else-if="currentSortField === col.sortField && currentSortOrder === 'ASC'">
                        <CaretTop />
                      </el-icon>
                      <el-icon v-else class="th-sort-icon--inactive">
                        <Sort />
                      </el-icon>
                    </span>
                  </span>
                </template>
                <template #default="{ row }">
                  <span>{{ (row as any)[col.field] || '—' }}</span>
                </template>
              </el-table-column>
            </template>
          </el-table>
          <page-box :currentPage="pager.currentPage" :pageSize="pager.pageSize" :totalCount="pager.total"
            @current-change="handlePageChange" />
        </div>
      </el-card>
    </div>
  </list-template>

  <!-- 工单详情弹窗 -->
  <design-workorder-detail-dialog v-if="showDetailDialog" :refresh-version="detailRevision" v-model="showDetailDialog" :workorder-id="detailWorkorderId"
    :production-actions="productionActions" @production="openProductionAction" @close="showDetailDialog = false" @refresh="fetchList" />

  <!-- v-if="showFileUploadDialog" -->
  <design-file-upload-dialog :key="`${fileUploadOrderId ?? 'design-file-upload'}-${fileUploadMode}-${appendBatchId ?? ''}`" v-model="showFileUploadDialog" :order-id="fileUploadOrderId"
    :order-code="currentOrderCode || ''" :mode="fileUploadMode" :batch-id="appendBatchId" @refresh="fetchList" @success="fetchList" @next="handleUploadNext" />

  <processing-application-dialog v-if="processingOrder" v-model="showProcessing" :order-id="processingOrder.id"
    :batch-id="processingBatchId" :initial-package-id="processingPackageId" :allow-edit="processingMode === 'edit'" :can-view="hasPermission('design:ProcessingApplicationView')"
    @saved="handleProcessingSaved" />
  <design-print-info-dialog v-if="showPrintInfoDialog" v-model="showPrintInfoDialog" :order-id="printInfoOrderId" :batch-id="appendBatchId"
    @refresh="fetchList" @success="fetchList" />

  <design-document-preview-dialog v-if="showDocumentPreviewDialog" v-model="showDocumentPreviewDialog"
    :order-id="documentPreviewOrderId" :order-code="documentPreviewOrderCode || undefined" :batch-id="appendBatchId" @refresh="fetchList" />

  <!-- <designer-assign-dialog v-model="showDesignerAssignDialog" :order-id="designerAssignOrderId"
    :order-code="designerAssignOrderCode || undefined" :current-designer-id="designerAssignCurrentDesignerId"
    @success="fetchList" /> -->

  <!-- 二维码弹窗 -->
  <dialog-modal v-model="showQRCodeDialog" :title="qrHospitalName || '影像预览二维码'" width="360px"
    @modal-close="showQRCodeDialog = false">
    <div class="qrcode-wrapper">
      <img v-if="qrCodeShareImage" :src="qrCodeShareImage" alt="QR Code with Text" class="final-qr" />
      <!-- <div v-if="qrCodePatientName" class="qrcode-patient-name">{{ qrCodeOrderCode }}-{{ qrCodePatientName }}</div> -->
    </div>
    <template #footer-btn>
      <el-button type="primary" @click="copyUrl">复制链接</el-button>
      <el-button @click="openUrl">打开链接</el-button>
    </template>
  </dialog-modal>

</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElTable } from 'element-plus'
import Sortable from 'sortablejs'
import {
  View,
  Box, Clock, EditPen,
  Sort, CaretTop, CaretBottom,
  MoreFilled, Upload, Printer,
  Document, DataAnalysis, Link, Remove, Finished, Download
} from '@element-plus/icons-vue'
import listTemplate from '@/components/listTemplate.vue'
import dialogModal from '@/components/dialogModal.vue'
import designWorkorderDetailDialog from './designComponents/designWorkorderDetailDialog.vue'
import designFileUploadDialog from './designComponents/fileDialog.vue'
import ProcessingApplicationDialog from './designComponents/processingApplicationDialog.vue'
import { processingAction, usesProcessingApplication, type ProductionOrder } from './productionBranch'
import designPrintInfoDialog from './designComponents/designPrintInfoDialog.vue'
import designDocumentPreviewDialog from './designComponents/designDocumentPreviewDialog.vue'
import * as QRCode from 'qrcode'
import {
  designWorkorderPage,
  designWorkorderStatistics,
  designColumnConfigGet,
  designColumnConfigSave,
  designWorkorderExport,
  designWorkorderUploadQrImage,
  designWorkorderGetQrImage,
  designAppendBatchCreate,
  designAppendBatchList,
  type DesignWorkorderVO,
  type DesignWorkorderStatisticsVO,
  type DesignWorkorderQuery,
} from '@/api/design'
import { orderCancel, getOrderStatus } from '@/api/order'
import $axios from '@/utils/http'
import pageBox from '@/components/pageBox.vue'
import dayjs from 'dayjs'
import { useUserInfo } from '@/stores/userInfo'

defineOptions({ name: 'DesignView' })

const userInfoStore = useUserInfo()

// ── 常量 ───────────────────────────────────────────────────────────────

// ── Refs ───────────────────────────────────────────────────────────────

const listTemplateRef = ref()
const tableRef = ref<InstanceType<typeof ElTable>>()
const tableScrollRef = ref<HTMLElement>()
const loading = ref(false)
const tableData = ref<DesignWorkorderVO[]>([])

const pager = reactive({
  currentPage: 1,
  pageSize: 15,
  total: 0,
})

// ── 二维码弹窗 ──────────────────────────────────────────────────────────

const showQRCodeDialog = ref(false)
const qrCodeUrl = ref('')
const qrCodePatientName = ref('')
const qrCodeOrderCode = ref('')
const qrHospitalName = ref('')
const qrCodeShareImage = ref('')
const qrCodeCurrentRow = ref<DesignWorkorderVO | null>(null)

const handleQrCodeGenerate = async (row: DesignWorkorderVO) => {
  try {
    qrCodeCurrentRow.value = row
    qrCodeOrderCode.value = row.orderCode || ''
    qrHospitalName.value = row.hospitalName || ''
    const res = await $axios.get('/imaging/v1/config', { params: { orderId: row.id } }) as any
    const orderId = res.paths.stlList.params.orderId
    const param = {
      paths: res.paths.stlList.path
    }
    const encoded = btoa(JSON.stringify(param))
    qrCodeUrl.value = `http://view.yigongbao.com.cn:8080/#/aiView?kv=${encoded}&orderId=${orderId}`
    qrCodePatientName.value = row.patientName || ''
    qrCodeShareImage.value = await QRCode.toDataURL(qrCodeUrl.value, {
      width: 240,
      margin: 3,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
      },
    })
    await nextTick()
    await buildShareQrImage(qrCodeShareImage.value)
    showQRCodeDialog.value = true
  } catch {
  }
}

const buildShareQrImage = async (qrDataUrl: string) => {
  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = qrDataUrl
  })

  const padding = 12
  const width = qrImg.width
  const footerHeight = 20
  const height = qrImg.height + padding * 2 + footerHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  const qrX = (width - qrImg.width) / 2
  const qrY = padding
  ctx.drawImage(qrImg, qrX, qrY, qrImg.width, qrImg.height)

  const cx = width / 2
  const cy = qrY + qrImg.height / 2
  const label = 'JOYE'
  const labelFont = 'bold 20px Fira Code'
  ctx.font = labelFont
  const metrics = ctx.measureText(label)
  const labelW = metrics.width + 16
  const labelH = 30
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.rect(cx - labelW / 2, cy - labelH / 2, labelW, labelH)
  ctx.fill()
  ctx.fillStyle = '#dbb96c'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy)

  const lineHeight = 10
  const nameY =  qrY + qrImg.height + lineHeight * 1.1
  ctx.fillStyle = '#374151'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${qrCodeOrderCode.value}-${qrCodePatientName.value}`, width / 2, nameY)
  qrCodeShareImage.value = canvas.toDataURL('image/png')
}

const copyUrl = async () => {
  const text = qrCodeUrl.value
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  ElMessage.success('链接已复制')
}

const openUrl = () => {
  window.open(qrCodeUrl.value, '_blank')
}

// ── 列配置 ──────────────────────────────────────────────────────────

interface ColDef {
  field: string
  label: string
  visible: boolean
  sort: number
  width?: number
  fixed?: string
  sortField?: string
}

const allColumns = ref<ColDef[]>([])

const visibleColumns = computed(() =>
  [...allColumns.value].filter(c => c.visible).sort((a, b) => {
    if (a.field === 'action') return 1
    if (b.field === 'action') return -1
    return a.sort - b.sort
  })
)

const currentSortField = computed(() => (currentQuery as any).sortField)
const currentSortOrder = computed(() => (currentQuery as any).sortOrder)

// ── 状态筛选 ─────────────────────────────────────────────────────────

const activeStatus = ref<string>('all')
const designStatistics = ref<DesignWorkorderStatisticsVO | null>(null)

const designerSteps = [
  { label: '全部', value: 'all' },
  { label: '待设计', value: '2010' },
  { label: '设计中', value: '2020' },
  { label: '已完成', value: '2030' },
]

const switchStatus = (val: string) => {
  activeStatus.value = val
  pager.currentPage = 1
  fetchList()
}
// ── 统计数据 ────────────────────────────────────────────────────────

const stats = computed(() => {
  return [
    { label: '全部工单', value: designStatistics.value?.total ?? '—', icon: Box },
    { label: '待设计', value: designStatistics.value?.pendingDesign ?? '—', icon: Clock },
    { label: '设计中', value: designStatistics.value?.designing ?? '—', icon: EditPen },
  ]
})

// ── 筛选配置 ───────────────────────────────────────────────────────

const orderStatusOptions = ref<{ label: string; value: string; show?: boolean }[]>([])

// 获取订单状态列表
const fetchOrderStatusOptions = async () => {
  try {
    const res = await getOrderStatus()
    orderStatusOptions.value = res.filter((item) => item.show)
  } catch (error) {
    console.error('获取订单状态列表失败', error)
  }
}

const filterInputs = computed(() => [
  { modelKey: 'orderCode', placeholder: '搜索订单编号、提单机构、业务员、医院、患者模糊搜索' },
])

const filterSelects = computed(() => [
  {
    modelKey: 'isUrgent', placeholder: '是否加急', options: [
      { label: '是', value: 1 },
      { label: '否', value: 0 },
    ],
  },
  {
    modelKey: 'status', placeholder: '当前状态', options: orderStatusOptions.value,
  },
])

const filterDateRanges = computed(() => [
  {
    modelKey: 'createTimeRange',
    startPlaceholder: '创建开始',
    endPlaceholder: '创建结束',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
  },
])

// ── 筛选数据 ─────────────────────────────────────────────────────

const currentQuery = reactive<DesignWorkorderQuery>({
  pageNum: 1,
  pageSize: 20,
})

const onFilterInputChange = ({ modelKey, value }: { modelKey: string; value: string }) => {
  ; (currentQuery as any)[modelKey] = value || undefined
  pager.currentPage = 1
  fetchList()
}

const onFilterChange = (key: string, value: any) => {
  if (key === 'createTimeRange') {
    currentQuery.createTimeStart = value?.[0] || undefined
    currentQuery.createTimeEnd = value?.[1] || undefined
  } else {
    ; (currentQuery as any)[key] = value || undefined
  }
  pager.currentPage = 1
  fetchList()
}

// ── 重置筛选 ───────────────────────────────────────────────────

const clearFilterState = () => {
  if (listTemplateRef.value) {
    const { filterInputsData, filterSelectsData, filterDateRangesData } = listTemplateRef.value
    Object.keys(filterInputsData).forEach(k => { filterInputsData[k] = '' })
    Object.keys(filterSelectsData).forEach(k => { (filterSelectsData as any)[k] = undefined })
    Object.keys(filterDateRangesData).forEach(k => { filterDateRangesData[k] = null })
  }
}

const handleFilterReset = () => {
  clearFilterState()
  Object.assign(currentQuery, { pageNum: 1, pageSize: 20 })
  pager.currentPage = 1
  fetchList()
}

const fetchList = async () => {
  loading.value = true
  try {
    const params: DesignWorkorderQuery = {
      ...currentQuery,
      pageNum: pager.currentPage,
      pageSize: pager.pageSize,
    }
    if (activeStatus.value !== 'all') {
      params.status = Number(activeStatus.value)
    }
    const res: any = await designWorkorderPage(params)
    tableData.value = res.records
    pager.total = res.total
  } catch {
    ElMessage.error('加载工单列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    designStatistics.value = await designWorkorderStatistics()
  } catch (error) {
    designStatistics.value = null
    console.error('加载设计工单统计失败', error)
  }
}

// ── 分页 ──────────────────────────────────────────────────────────

const handlePageChange = (page: number) => {
  pager.currentPage = page
  fetchList()
}

// ── 导出 ──────────────────────────────────────────────────────────

const handleExport = async () => {
  try {
    const params: { createTimeStart?: string; createTimeEnd?: string } = {}
    if (currentQuery.createTimeStart) params.createTimeStart = currentQuery.createTimeStart
    if (currentQuery.createTimeEnd) params.createTimeEnd = currentQuery.createTimeEnd
    const { blob, fileName } = await designWorkorderExport(params)
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
  } catch (e: any) {
    ElMessage.error(e?.message || '导出失败')
  }
}

// ── 列排序 ──────────────────────────────────────────────────────

const handleColumnSort = (col: ColDef) => {
  if (!col.sortField) return
  const field = col.sortField
  if (currentSortField.value === field) {
    ; (currentQuery as any).sortOrder = currentSortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    ; (currentQuery as any).sortField = field
      ; (currentQuery as any).sortOrder = 'DESC'
  }
  pager.currentPage = 1
  fetchList()
}

// ── 列拖拽 ──────────────────────────────────────────────────────

let columnSortable: Sortable | null = null

const getTableHeaderRow = () => {
  const el = tableRef.value?.$el as HTMLElement
  return el?.querySelector('.el-table__header-wrapper thead tr') as HTMLElement | null
}

const initColumnSortable = () => {
  const headerRow = getTableHeaderRow()
  if (!headerRow || columnSortable) return
  columnSortable = Sortable.create(headerRow, {
    filter: 'th:nth-child(-n+1), th:nth-last-child(-n+1)',
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
      const cols = visibleColumns.value.slice()
      const moved = cols.splice(oldIndex - 1, 1)
      cols.splice(newIndex - 1, 0, ...moved)
      const sortMap = new Map(cols.map((c, i) => [c.field, i + 1]))
      allColumns.value = allColumns.value.map(c => ({ ...c, sort: sortMap.get(c.field) ?? c.sort }))
      designColumnConfigSave({
        columns: allColumns.value.map(c => ({
          field: c.field,
          label: c.label,
          visible: c.visible,
          sort: c.sort,
          width: c.width,
          fixed: c.fixed,
          sortField: c.sortField,
        })),
      }).catch(() => ElMessage.error('列顺序保存失败'))
    },
  })
}

const destroyColumnSortable = () => {
  columnSortable?.destroy()
  columnSortable = null
}

const loadColumnConfig = async () => {
  destroyColumnSortable()
  try {
    const res = await designColumnConfigGet()
    if (res && res.columns && res.columns.length > 0) {
      allColumns.value = res.columns.map((col: any) => ({
        field: col.field,
        label: col.label,
        visible: col.visible,
        sort: col.sort,
        width: col.width ?? undefined,
        fixed: col.fixed ?? undefined,
        sortField: col.sortField ?? col.field,
      }))
    } else {
      allColumns.value = []
    }
  } catch {
    allColumns.value = []
  }
  await nextTick()
  initColumnSortable()
}

// ── 操作菜单 ──────────────────────────────────────────────────────

interface ActionItem {
  command: string
  label: string
  icon: Component
  permission?: string
  divided?: boolean
}

const hasPermission = (permission: string): boolean => {
  return userInfoStore.hasPermission(permission)
}

const productionActions = (row: ProductionOrder): ActionItem[] => {
  if (usesProcessingApplication(row)) {
    const mode = processingAction(row.status, hasPermission('design:ProcessingApplicationEdit'), hasPermission('design:ProcessingApplicationView'))
    if (!mode) return []
    return [{ command: 'processing', label: mode === 'edit' ? '填写加工申请单' : '查看加工申请单', icon: Document }]
  }
  if (![1030, 2020, 2030, 3010, 3020, 3030, 3040, 4010, 5010, 5020, 5030, 5040, 5050, 6010, 6020, 6030, 8010].includes(row.status)) return []
  return [
    { command: 'printInfo', label: '填写打印信息', icon: Printer, permission: 'design:PrintInfo' },
    { command: 'printInfoView', label: '指令单和图纸', icon: Document, permission: 'design:DocumentPreview' },
  ].filter(action => hasPermission(action.permission))
}

const getRowActions = (row: DesignWorkorderVO): ActionItem[] => {
  const status = row.status

  if (status === 9010) {
    return [
      { command: 'view', label: '查看详情', icon: View, permission: 'design:View' },
      ...productionActions(row),
      { command: 'dicomInfoView', label: '可视化预览', icon: DataAnalysis, permission: 'design:DicomView' },
      { command: 'stlInfoView', label: '在线标注', icon: Finished, permission: 'design:StlMark' },
    ].filter(action => !action.permission || hasPermission(action.permission))
  }

  if (status === 2010) {
    return [
      { command: 'view', label: '查看详情', icon: View, permission: 'design:View' },
      // { command: 'assign', label: '分配设计师', icon: User, permission: 'design:AssignDesigner' },
      { command: 'dicomInfoView', label: '可视化预览', icon: DataAnalysis, permission: 'design:DicomView', divided: true },
      { command: 'stlInfoView', label: '在线标注', icon: Finished, permission: 'design:StlMark' },
      { command: 'qrCodeGenerate', label: '生成二维码', icon: Link, permission: 'design:EncodeView' },
      { command: 'cancel', label: '订单取消', icon: Remove, permission: 'design:Cancel' },
    ]
  }

  if (status === 2020) {
    const actions: ActionItem[] = [
      { command: 'view', label: '查看详情', icon: View, permission: 'design:View' },
      { command: 'upload', label: '上传设计文件', icon: Upload, permission: 'design:Upload' },
      ...productionActions(row)
    ]
    actions.push({ command: 'dicomInfoView', label: '可视化预览', icon: DataAnalysis, permission: 'design:DicomView', divided: true })
    actions.push({ command: 'stlInfoView', label: '在线标注', icon: Finished, permission: 'design:StlMark' })
    actions.push({ command: 'qrCodeGenerate', label: '生成二维码', icon: Link, permission: 'design:EncodeView' })
    actions.push({ command: 'cancel', label: '订单取消', icon: Remove, permission: 'design:Cancel' })
    return actions.filter(action => !action.permission || hasPermission(action.permission))
  }

  const appendStatuses = [2030, 3010, 3020, 3030, 3040, 4010, 5010, 5020, 5030, 5040, 5050, 6010, 6020, 6030, 8010]

  const normalDesignStatuses = [1030, 2020]
  const isAppendStatus = appendStatuses.includes(status)
  const isNormalDesignStatus = normalDesignStatuses.includes(status)

  // 非设计/追加状态保留原有非文件类入口，但不得兜底暴露设计文件编辑入口。
  const baseActions: ActionItem[] = [
    { command: 'view', label: '查看详情', icon: View, permission: 'design:View' },
    ...(isAppendStatus
      ? [{ command: 'upload', label: '上传设计文件', icon: Upload, permission: 'design:Upload' }]
      : isNormalDesignStatus
        ? [{ command: 'upload', label: '上传设计文件', icon: Upload, permission: 'design:Upload' }]
        : []),
    ...productionActions(row),
    { command: 'dicomInfoView', label: '可视化预览', icon: DataAnalysis, permission: 'design:DicomView', divided: true },
    { command: 'stlInfoView', label: '在线标注', icon: Finished, permission: 'design:StlMark' },
    { command: 'qrCodeGenerate', label: '生成二维码', icon: Link, permission: 'design:EncodeView' },
    { command: 'cancel', label: '订单取消', icon: Remove, permission: 'design:Cancel' },
  ]
  // 分配设计师：仅在 status === 1030 || status === 2010 时显示
  // if (status === 1030 || status === 2010) {
  //   baseActions.splice(1, 0, { command: 'assign', label: '分配设计师', icon: User, permission: 'design:AssignDesigner' })
  // }
  return baseActions.filter(action => !action.permission || hasPermission(action.permission))
}

// ── 操作 ──────────────────────────────────────────────────────────

const showDetailDialog = ref(false)
const detailWorkorderId = ref<number | null>(null)
const detailRevision = ref(0)
const handleProcessingSaved = () => {
  detailRevision.value++
  fetchList()
}
const showFileUploadDialog = ref(false)
const fileUploadOrderId = ref<number | null>(null)
const currentOrderCode = ref<string | null>(null)
const fileUploadMode = ref<'NORMAL' | 'APPEND_BATCH'>('NORMAL')
const appendBatchId = ref<number | null>(null)
const showPrintInfoDialog = ref(false)
const printInfoOrderId = ref<number | null>(null)
const showDocumentPreviewDialog = ref(false)
const documentPreviewOrderId = ref<number | null>(null)
const documentPreviewOrderCode = ref<string | null>(null)
// const showDesignerAssignDialog = ref(false)
// const designerAssignOrderId = ref<number | null>(null)
// const designerAssignOrderCode = ref<string | null>(null)
// const designerAssignCurrentDesignerId = ref<number | null>(null)

const handleView = (row: DesignWorkorderVO) => {
  detailWorkorderId.value = row.id
  showDetailDialog.value = true
}

const appendDesignStatuses = new Set([2020, 2030, 3010, 3020, 3030, 3040, 4010, 5010, 5020, 5030, 5040, 5050, 6010, 6020, 6030, 8010])

const uploadOrder = ref<ProductionOrder | null>(null)
const processingOrder = ref<ProductionOrder | null>(null)
const processingBatchId = ref<number | null>(null)
const processingPackageId = ref<number | null>(null)
const processingMode = ref<'edit' | 'view'>('view')
const showProcessing = computed({
  get: () => !!processingOrder.value,
  set: (open: boolean) => { if (!open) processingOrder.value = null },
})

const openProcessing = (row: ProductionOrder, batchId: number | null = null, packageId: number | null = null) => {
  const mode = processingAction(row.status, hasPermission('design:ProcessingApplicationEdit'), hasPermission('design:ProcessingApplicationView'))
  if (!mode) return
  processingMode.value = mode
  processingBatchId.value = batchId
  processingPackageId.value = packageId
  processingOrder.value = row
}

const openProductionAction = (command: string, row: ProductionOrder) => {
  if (command === 'processing') openProcessing(row)
  else if (command === 'printInfo') handlePrintInfo(row)
  else if (command === 'printInfoView') handleDocumentPreview(row)
}

const handleFileUpload = async (row: DesignWorkorderVO) => {
  uploadOrder.value = row
  if (appendDesignStatuses.has(row.status)) {
    if (row.status !== 2020) {
      await handleAppendBatch(row)
      return
    }
    // 2020 既可能是首次设计，也可能是追加上传后的设计中；仅存在未完成追加批次时才复用追加模式。
    try {
      const batches = await designAppendBatchList(row.id)
      const activeBatch = selectActiveAppendBatch(batches)
      if (activeBatch && !['CANCELLED', 'COMPLETED'].includes(activeBatch.status)) {
        await handleAppendBatch(row)
        return
      }
    } catch {
      ElMessage.error('追加批次状态查询失败，请重试后再上传')
      return
    }
  }
  fileUploadMode.value = 'NORMAL'
  appendBatchId.value = null
  fileUploadOrderId.value = row.id
  currentOrderCode.value = row.orderCode
  showFileUploadDialog.value = true
}

const handleAppendBatch = async (row: DesignWorkorderVO) => {
  try {
    const batch = await designAppendBatchCreate(row.id)
    fileUploadMode.value = 'APPEND_BATCH'
    appendBatchId.value = batch.batchId
    fileUploadOrderId.value = row.id
    currentOrderCode.value = row.orderCode
    showFileUploadDialog.value = true
  } catch {
    // request interceptor displays the backend error
  }
}

const selectActiveAppendBatch = (batches: Array<{ batchId: number; status: string }>) => {
  // 未完成批次必须优先复用；只有不存在未完成批次时才打开最近完成批次的只读数据。
  return batches.find(batch => !['CANCELLED', 'COMPLETED'].includes(batch.status))
    ?? batches.find(batch => batch.status !== 'CANCELLED')
}

const handleUploadNext = (batchId: number | null, packageId: number) => {
  const row = uploadOrder.value
  if (!row) return
  showFileUploadDialog.value = false
  if (usesProcessingApplication(row)) {
    // 新增包已将追加批次转回设计中，服务端仍逐包裁定是否可写。
    openProcessing({ ...row, status: 2020 }, batchId, packageId)
    return
  }
  if (!hasPermission('design:PrintInfo')) return
  appendBatchId.value = batchId
  printInfoOrderId.value = fileUploadOrderId.value
  showPrintInfoDialog.value = true
}

const handlePrintInfo = (row: ProductionOrder) => {
  fileUploadMode.value = 'NORMAL'
  appendBatchId.value = null
  printInfoOrderId.value = row.id
  if (row.status === 2020 || row.status >= 2030) {
    designAppendBatchList(row.id).then(batches => {
      appendBatchId.value = selectActiveAppendBatch(batches)?.batchId ?? null
      showPrintInfoDialog.value = true
    }).catch(() => { showPrintInfoDialog.value = true })
  } else {
    showPrintInfoDialog.value = true
  }
}

const handleDocumentPreview = async (row: ProductionOrder) => {
  appendBatchId.value = null
  if (row.status === 2020 || row.status >= 2030) {
    try {
      const batches = await designAppendBatchList(row.id)
      appendBatchId.value = selectActiveAppendBatch(batches)?.batchId ?? null
    } catch {
      appendBatchId.value = null
    }
  }
  documentPreviewOrderId.value = row.id
  documentPreviewOrderCode.value = row.orderCode
  // 页面打开只复用已有二维码，避免每次进入页面替换二维码并触发历史图纸重生成。
  try {
    const currentQr = await designWorkorderGetQrImage(row.id)
    if (!currentQr) {
      const res = await $axios.get('/imaging/v1/config', { params: { orderId: row.id } }) as any
      const orderId = res.paths.stlList.params.orderId
      const param = {
        paths: res.paths.stlList.path
      }
      const encoded = btoa(JSON.stringify(param))
      const qrUrl = `http://view.yigongbao.com.cn:8080/#/aiView?kv=${encoded}&orderId=${orderId}`
      // 使用 qrcode 生成二维码
      const base64Data = await QRCode.toDataURL(qrUrl, {
        width: 240,
        margin: 3,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
        },
      })
      await buildShareQrImage(base64Data)
      const uploadBase64 = qrCodeShareImage.value.split(',')[1]
      const binaryString = atob(uploadBase64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const file = new File([bytes], `qr_${row.orderCode}.png`, { type: 'image/png' })
      await designWorkorderUploadQrImage(row.id, file)
    }
  } catch (e) {
    // 二维码不是打开页面的前置条件，查询或首次生成失败时仍允许进入页面。
  }
  showDocumentPreviewDialog.value = true
}

// const handleAssignDesigner = (row: DesignWorkorderVO) => {
//   designerAssignOrderId.value = row.id
//   designerAssignOrderCode.value = row.orderCode
//   designerAssignCurrentDesignerId.value = row.designerId || null
//   showDesignerAssignDialog.value = true
// }
const handleDicomView = async (row: DesignWorkorderVO) => {
  try {
    const res = await $axios.get('/imaging/v1/config', { params: { orderId: row.id } })
    const encoded = btoa(JSON.stringify(res))
    const url = `http://view.yigongbao.com.cn:8080/#/aiView?kv=${encoded}`
    window.open(url, '_blank')
  } catch {
  }
}
const handleStlView = async (row: DesignWorkorderVO) => {
  try {
    const res = await $axios.get('/imaging/v1/config', { params: { orderId: row.id } })
    const encoded = btoa(JSON.stringify(res))
    const url = `http://view.yigongbao.com.cn:8080/#/mark?kv=${encoded}`
    window.open(url, '_blank')
  } catch {
  }
}

const handleCancel = async (row: DesignWorkorderVO) => {
  try {
    const res = await ElMessageBox.prompt(
      `确定要取消订单「${row.orderCode}」吗？\n\n订单取消后将由设计师管理员审核，请确认操作。`,
      '取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '暂不取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        inputPlaceholder: '请输入取消原因（选填）',
      }
    )
    const reason = (res as any)?.value || ''
    await orderCancel(row.id, row.version, reason)
    ElMessage.success('取消申请已提交,等待管理员审核')
    fetchList()
  } catch {
    // user cancelled or error handled by interceptor
  }
}

const handleActionCommand = (cmd: string, row: DesignWorkorderVO) => {
  switch (cmd) {
    case 'upload':
      handleFileUpload(row)
      break
    case 'processing':
    case 'printInfo':
    case 'printInfoView':
      openProductionAction(cmd, row)
      break
    case 'view':
      handleView(row)
      break
    case 'dicomInfoView':
      handleDicomView(row)
      break
    case 'stlInfoView':
      handleStlView(row)
      break
    case 'qrCodeGenerate':
      handleQrCodeGenerate(row)
      break
    // case 'assign':
    //   handleAssignDesigner(row)
    //   break
    case 'cancel':
      handleCancel(row)
      break
  }
}


// ── 表格横向拖拽滚动 ──────────────────────────────────────────────

let scrollDragging = false
let scrollStartX = 0
let scrollLeft = 0

const onTableScrollMouseDown = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.el-table__header-wrapper')) return
  scrollDragging = true
  scrollStartX = e.clientX
  scrollLeft = tableScrollRef.value?.scrollLeft ?? 0
  tableScrollRef.value!.style.cursor = 'grabbing'
}

const onTableScrollMouseMove = (e: MouseEvent) => {
  if (!scrollDragging || !tableScrollRef.value) return
  const dx = e.clientX - scrollStartX
  tableScrollRef.value.scrollLeft = scrollLeft - dx
}

const onTableScrollMouseUp = () => {
  if (!scrollDragging) return
  scrollDragging = false
  tableScrollRef.value!.style.cursor = ''
}

const onTableScrollMouseLeave = () => {
  if (!scrollDragging) return
  scrollDragging = false
  tableScrollRef.value!.style.cursor = ''
}

// ── 初始化 ───────────────────────────────────────────────────────

const route = useRoute()
const router = useRouter()
watch(
  () => route.query.detailId,
  (newId) => {
    const detailId = Number(newId)
    if (detailId) handleView({ id: detailId } as DesignWorkorderVO)
    router.replace({ query: {} })
  },
  { immediate: true }
)

onMounted(async () => {
  await loadColumnConfig()
  await fetchOrderStatusOptions()
  fetchList()
  fetchStatistics()
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

.order-code-cell {
  display: flex;
  align-items: center;
  gap: 7px;
}
.view-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(59,130,246,.2);
  box-shadow: 0 2px 8px rgba(59,130,246,.12), inset 0 1px 0 rgba(255,255,255,.8);

  &__btn {
    appearance: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #3b82f6;
    padding: 6px 16px;
    border-radius: 999px;
    background: transparent;
    transition: color .18s, background .18s, box-shadow .18s;
    white-space: nowrap;

    &:hover { color: #1d4ed8; background: rgba(255,255,255,.5); }

    &.is-active {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: #fff;
      box-shadow: 0 2px 8px rgba(59,130,246,.35);
    }
  }
}

.patient-name {
  font-weight: 500;
  font-size: 13px;
}

.hospital-text,
.doctor-text {
  font-size: 12.5px;
  color: #6b7280;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.project-tag {
  font-size: 11.5px;
  border-radius: 4px;

  .project-body {
    color: #0891b2;
    font-weight: 600;
    margin-right: 2px;
  }
}

.project-overflow {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

.urgent-tag {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 4px;
}

.pkg-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #0891b2;
  background: rgba(14, 116, 144, 0.08);
  padding: 2px 7px;
  border-radius: 4px;
  cursor: default;
}

.pkg-none {
  font-size: 12px;
  color: #d1d5db;
}

.date-text {
  font-size: 12px;
  color: #6b7280;
}

.status-tag {
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &.el-tag--warning {
    background: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
  }

  &.el-tag--danger {
    background: #fee2e2;
    color: #991b1b;
    border-color: #fecaca;
  }

  &.el-tag--info {
    background: #f3f4f6;
    color: #4b5563;
    border-color: #e5e7eb;
  }

  &.el-tag--primary {
    background: #ede9fe;
    color: #5b21b6;
    border-color: #ddd6fe;
  }
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;

  &--2010 {
    background: #9ca3af;
  }

  &--2020 {
    background: #f59e0b;
  }

  &--2040 {
    background: #8b5cf6;
  }

  &--2060 {
    background: #ef4444;
  }
}

.reject-text {
  font-size: 12px;
  color: #ef4444;
}

.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-more-btn {
  padding: 2px 6px !important;
  font-size: 16px;
  color: #6366f1 !important;

  &:hover {
    color: #4f46e5 !important;
    background: #eef2ff !important;
    border-radius: 6px;
  }
}

:deep(.action-dropdown-menu) {
  min-width: 150px;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 4px;

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #475569;
    border-radius: 6px;
    padding: 7px 12px;
    margin: 2px 0;
    transition: all 0.15s;

    .el-icon {
      color: #818cf8;
      font-size: 14px;
    }

    &:hover {
      background: #eef2ff;
      color: #4338ca;

      .el-icon {
        color: #6366f1;
      }
    }
  }
}

.accept-btn {
  font-size: 12px;
  font-weight: 600;
  color: #059669 !important;
  padding: 2px 8px;
  border: 1px solid rgba(5, 150, 105, 0.25);
  border-radius: 5px;
  background: rgba(5, 150, 105, 0.05);

  &:hover {
    background: rgba(5, 150, 105, 0.1) !important;
    border-color: #059669 !important;
  }
}

.process-btn {
  font-size: 12px;
  font-weight: 600;
  // color: #0891b2 !important;
  // padding: 2px 8px;

  &:hover {
    color: #0369a1 !important;
  }
}

// ── Expand Panel ─────────────────────────────────────────────────

.expand-panel {
  padding: 14px 20px 16px 48px;
  background: #faf9f7;
  border-bottom: 1px solid #e5e7eb;
  animation: expandFade 0.2s ease;
}

@keyframes expandFade {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px 24px;
}

.expand-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #a8a29e;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
}

.expand-value {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.reject-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 14px;
  background: #fff1f2;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}

.reject-icon {
  color: #ef4444;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.reject-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #991b1b;
  margin-bottom: 3px;
}

.reject-msg {
  font-size: 12.5px;
  color: #7f1d1d;
  line-height: 1.5;
}

// ── 列头排序 ─────────────────────────────────────────────────────

.th-inner {
  &--sortable {
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;
    gap: 3px;

    &:hover {
      color: #2f5bff;
    }
  }
}

.th-sort-icon {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.2s;

  .th-inner--sortable:hover & {
    color: #2f5bff;
  }

  &--active {
    color: #2f5bff;
  }

  &--inactive {
    opacity: 1;
  }
}

// ── Table row hover ─────────────────────────────────────────────

:deep(.el-table tbody tr) {
  transition: background 0.12s;
}

:deep(.row--expanded) {
  background: #faf9f7 !important;
}

.text-muted {
  color: #9ca3af;
}

// 二维码弹窗样式
.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 10px;
  margin-top: 10px;
}

.qrcode-patient-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.icon-tag {
  display: flex;
  align-items: center;
}

// ── 横向滚动条样式 ─────────────────────────────────────────────────

.table-scroll-container {
  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 12px;
    opacity: 1 !important;

    > div {
      background: #2f5bff !important;
      border-radius: 6px;
      height: 10px !important;
    }
  }

  &::-webkit-scrollbar {
    height: 12px;
  }

  &::-webkit-scrollbar-thumb {
    background: #2f5bff;
    border-radius: 6px;
    border: 2px solid #f1f5f9;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #1e40ff;
  }

  &::-webkit-scrollbar-corner {
    background: #f1f5f9;
  }
}
</style>
