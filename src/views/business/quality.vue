<template>
  <!-- ══════════════════════════════════════════════════════════════
       主体列表
  ══════════════════════════════════════════════════════════════ -->
  <list-template ref="listTemplateRef"
    page-class="inspect-page"
    hero-eyebrow="Quality"
    hero-title="质检管理"
    hero-desc="对待检流转卡逐件质检，合格后转入包装。"
    :stats="stats"
    :filter-inputs="filterInputs"
    :filter-selects="[]"
    :filter-date-ranges="filterDateRanges"
    :show-filter-reset="true"
    :show-filter-create="false"
    @filter-input-change="onFilterInputChange"
    @filter-change="onFilterChange"
    @filter-reset="handleFilterReset">

    <template #filter-bottom>
      <!-- 状态切换 Tab -->
      <div class="segment-tabs" role="tablist">
        <button v-for="tab in statusTabs" :key="tab.value"
          class="segment-tabs__btn"
          :class="{ 'is-active': activeStatus === tab.value }"
          @click="switchStatus(tab.value)">
          {{ tab.label }}
        </button>
      </div>
    </template>

    <template #filter-extra-actions>
    </template>

    <!-- ══ 主表格面板 ══ -->
    <div class="page-body-panel">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">产品检验列表</div>
            
            <el-input v-model="headerScanCode"
              placeholder="扫码枪扫描产品编号"
              size="small"
              style="width:220px;margin-left:auto"
              clearable
              @keyup.enter="handleHeaderScan">
              <template #prefix><el-icon><Aim /></el-icon></template>
            </el-input>
          </div>
        </template>

        <div class="roles-list-wrap">
          <el-table
            ref="tableRef"
            :data="pagedTableData"
            v-loading="loading"
            highlight-current-row
            :header-cell-style="{ background: '#f9fafb' }"
            row-key="id">

            <el-table-column type="index" label="序号" width="60" align="center" fixed />
            <template v-for="col in visibleColumns" :key="col.field">
              <el-table-column v-if="col.field === 'isUrgent'" :label="col.label" :width="col.width || 65" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.isUrgent === 1" size="small" type="danger" effect="plain">加急</el-tag>
                  <span v-else>—</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'isPostal'" :label="col.label" :width="col.width || 65" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.isPostal === 1" size="small" type="info" effect="plain">邮寄</el-tag>
                  <span v-else>—</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'expectedDeliveryDate'" :label="col.label" :width="col.width || 110" align="center">
                <template #default="{ row }">
                  <span>{{ row.expectedDeliveryDate?.replace('T', ' ') || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'qualifiedCount'" :label="col.label" :width="col.width || 60" align="center">
                <template #default="{ row }">
                  <span style="color:#059669;font-weight:600">{{ row.qualifiedCount || 0 }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'unqualifiedCount'" :label="col.label" :width="col.width || 70" align="center">
                <template #default="{ row }">
                  <span v-if="row.unqualifiedCount > 0" style="color:#dc2626;font-weight:600">{{ row.unqualifiedCount }}</span>
                  <span v-else style="color:#cbd5e1">—</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'pendingCount'" :label="col.label" :width="col.width || 60" align="center">
                <template #default="{ row }">
                  <span v-if="(row.totalProductCount || 0) - (row.qualifiedCount || 0) - (row.unqualifiedCount || 0) > 0" style="color:#d97706;font-weight:600">{{ (row.totalProductCount || 0) - (row.qualifiedCount || 0) - (row.unqualifiedCount || 0) }}</span>
                  <span v-else style="color:#cbd5e1">—</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'status'" :label="col.label" :width="col.width || 100" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :style="statusStyle(row.status, row.statusColor)" round>
                    {{ statusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'createTime'" :label="col.label" :width="col.width || 160" align="center">
                <template #default="{ row }">
                  <span>{{ row.createTime?.replace('T', ' ') || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column v-else-if="col.field === 'action'" :label="col.label" :width="col.width || 170" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button v-if="row.status === 5010 && !(row.unqualifiedCount > 0)" link type="primary" size="small" @click="handleOpenQc(row)" v-permission="'quality:Start'">
                    <el-icon><Aim /></el-icon>质检
                  </el-button>
                  <el-button v-if="row.status === 5010 && row.unqualifiedCount > 0" link type="warning" size="small" @click="handleOpenReInspect(row)" v-permission="'quality:Again'">
                    <el-icon><Refresh /></el-icon>重新质检
                  </el-button>
                  <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
                </template>
              </el-table-column>
              <el-table-column v-else :prop="col.field" :label="col.label"
                :width="col.width || undefined" :min-width="!col.width ? 120 : undefined"
                :fixed="col.fixed || undefined" show-overflow-tooltip>
                <template #default="{ row }">
                  <span>{{ (row as any)[col.field] != null ? String((row as any)[col.field]) : '—' }}</span>
                </template>
              </el-table-column>
            </template>
          </el-table>

          <!-- 分页 -->
          <page-box
            :currentPage="pageInfo.currentPage"
            :pageSize="pageInfo.pageSize"
            :totalCount="pageInfo.totalCount"
            @current-change="currentChange"
          />
        </div>
      </el-card>
    </div>

  </list-template>

  <!-- ══════════════════════════════════════════════════════════════
       质检弹窗 — 医疗器械精密检测主题
  ══════════════════════════════════════════════════════════════ -->
  <dialog-modal
    v-model="qcDialogVisible"
    title="质检操作"
    subtitle="批次产品扫码质检"
    width="900px"
    :loading="productsLoading"
    :show-footer="false"
    @modal-close="handleQcDialogClose">

    <!-- 弹窗头部：批次概览 -->
    <div class="qc-dialog-shell">
      <div class="qc-header">
        <div class="qc-header__left">
          <div class="qc-header__badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M8 4.5v4l2.5 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            批次质检
          </div>
          <div class="qc-header__meta">
            <span class="qc-header__recordno">{{ currentRecord?.recordNo }}</span>
            <span class="qc-header__sep">·</span>
            <span class="qc-header__pkgcode">{{ currentRecord?.designPackageCode }}</span>
            <span class="qc-header__sep">·</span>
            <span class="qc-header__info">批号：{{ currentRecord?.productionBatchNo || '—' }}</span>
          </div>
          <div class="qc-header__meta" style="margin-top:4px;flex-wrap:wrap;gap:12px">
            <span class="qc-header__info" v-if="currentRecord?.orderCode">订单：{{ currentRecord.orderCode }}</span>
            <span class="qc-header__info" v-if="currentRecord?.hospitalName">医院：{{ currentRecord.hospitalName }}</span>
            <span class="qc-header__info" v-if="currentRecord?.hospitalDeptName">科室：{{ currentRecord.hospitalDeptName }}</span>
            <span class="qc-header__info" v-if="currentRecord?.doctorName">医生：{{ currentRecord.doctorName }}</span>
            <span class="qc-header__info" v-if="currentRecord?.patientName">患者：{{ currentRecord.patientName }}</span>
            <span class="qc-header__info" v-if="currentRecord?.expectedDeliveryDate">交付：{{ currentRecord.expectedDeliveryDate }}</span>
            <span class="qc-header__info" v-if="currentRecord?.orgName">机构：{{ currentRecord.orgName }}</span>
            <el-tag v-if="currentRecord?.isUrgent === 1" size="small" type="danger" effect="plain" style="height:20px">加急</el-tag>
            <el-tag v-if="currentRecord?.isPostal === 1" size="small" type="info" effect="plain" style="height:20px">邮寄</el-tag>
          </div>
        </div>
        <div class="qc-header__stats">
          <div class="qc-stat-chip qc-stat-chip--total">
            <span class="qc-stat-chip__num">{{ currentRecord?.totalProductCount || 0 }}</span>
            <span class="qc-stat-chip__label">总数</span>
          </div>
          <div class="qc-stat-chip qc-stat-chip--pass">
            <span class="qc-stat-chip__num">{{ checkedCount }}</span>
            <span class="qc-stat-chip__label">已检</span>
          </div>
          <div class="qc-stat-chip qc-stat-chip--pending">
            <span class="qc-stat-chip__num">{{ pendingCount }}</span>
            <span class="qc-stat-chip__label">待检</span>
          </div>
        </div>
      </div>

      <!-- 产品列表 -->
      <div class="qc-products-section">
        <div class="qc-products-section__header">
          <span>产品列表</span>
          <span class="qc-products-count">{{ currentProducts.length }} 件</span>
        </div>
        <el-table
          :data="currentProducts"
          size="small"
          :header-cell-style="{ background: '#f9fafb' }"
          v-loading="productsLoading"
          max-height="320"
          class="qc-products-table">

          <el-table-column label="产品编号" min-width="160" prop="productNo" show-overflow-tooltip />
          <el-table-column label="产品名称" min-width="120" prop="productName" show-overflow-tooltip />
          <el-table-column label="规格" min-width="90" prop="specName" show-overflow-tooltip />
          <el-table-column label="材料" min-width="90" prop="materialName" show-overflow-tooltip />
          <el-table-column label="颜色" min-width="90" prop="colorName" show-overflow-tooltip />

          <el-table-column label="质检状态" width="95" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.qcResult === 'pass'" size="small" type="success" effect="plain">合格</el-tag>
              <el-tag v-else-if="row.qcResult === 'fail'" size="small" type="danger" effect="plain">不合格</el-tag>
              <el-tag v-else size="small" type="info" effect="plain">待检</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="UDI码" min-width="140">
            <template #default="{ row }">
              <span v-if="row.udiCode" class="udi-code-text">{{ row.udiCode }}</span>
              <span v-else class="text-gray">—</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="90" align="center">
            <template #default="{ row }">
              <el-button
                v-if="!row.qcResult || (reInspectMode && row.qcResult === 'fail')"
                link type="primary" size="small"
                @click="openProductQc(row)">
                <el-icon><Aim /></el-icon>{{ row.qcResult === 'fail' ? '重新质检' : '质检' }}
              </el-button>
              <span v-else class="text-gray">—</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 底部操作栏 -->
      <div class="qc-footer">
        <el-button @click="qcDialogVisible = false">关闭</el-button>
        <el-button
          type="success"
          :disabled="!canTransfer"
          @click="handleTransferToPack"
          v-permission="'quality:ToPackaging'"
          class="transfer-btn">
          <el-icon><DArrowRight /></el-icon>
          质检完成，流转到包装
        </el-button>
      </div>
    </div>
  </dialog-modal>

  <!-- ══════════════════════════════════════════════════════════════
       单产品质检弹窗 — 精密仪表盘风格
  ══════════════════════════════════════════════════════════════ -->
  <!-- 包装弹窗 -->
  <dialog-modal
    v-model="packDialogVisible"
    title="包装操作"
    subtitle="填写包装信息并流转入库"
    width="820px"
    :loading="packSubmitting"
    :show-footer="false"
    @modal-close="packDialogVisible = false">

    <div class="pack-dialog-shell" v-if="packRecord">
      <!-- 左侧：详情信息 -->
      <aside class="pack-sidebar">
        <div class="dwd-pt-card">
          <div class="dwd-pt-avatar">
            <span>{{ packRecord.patientName?.charAt(0) || '?' }}</span>
          </div>
          <div class="dwd-pt-meta">
            <div class="dwd-pt-name">{{ packRecord.patientName || '—' }}</div>
            <div class="dwd-pt-tags">
              <span class="dwd-pt-tag">{{ packRecord.hospitalName?.slice(0, 6) || '—' }}</span>
              <span class="dwd-pt-tag-sep" v-if="packRecord.hospitalDeptName">/</span>
              <span class="dwd-pt-tag" v-if="packRecord.hospitalDeptName">{{ packRecord.hospitalDeptName }}</span>
            </div>
          </div>
        </div>

        <div class="dwd-org-block">
          <div class="dwd-org-row" v-if="packRecord.hospitalName">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span class="dwd-org-row__value">{{ packRecord.hospitalName }}</span>
          </div>
          <div class="dwd-org-row" v-if="packRecord.hospitalDeptName">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span class="dwd-org-row__value">{{ packRecord.hospitalDeptName }}</span>
          </div>
        </div>

        <div class="dwd-sidebar-rule"></div>

        <div class="dwd-order-grid">
          <div class="dwd-order-grid__label">生产状态</div>
          <div class="dwd-order-grid__value">
            <el-tag size="small" :style="statusStyle(packRecord.status, packRecord.statusColor)" round>{{ statusLabel(packRecord.status) }}</el-tag>
          </div>

          <div class="dwd-order-grid__label">流转卡编号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.recordNo || '—' }}</div>

          <div class="dwd-order-grid__label">生产批号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.productionBatchNo || '—' }}</div>

          <div class="dwd-order-grid__label">订单编号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.orderCode || '—' }}</div>

          <div class="dwd-order-grid__label">数据包编号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.designPackageCode || '—' }}</div>

          <div class="dwd-order-grid__label">订单类型</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            {{ packRecord.orderType === 1 ? '医疗器械' : packRecord.orderType === 2 ? '非医疗器械' : '—' }}
          </div>

          <div class="dwd-order-grid__label">产品总数</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.totalProductCount ?? '—' }}</div>

          <div class="dwd-order-grid__label">合格/不合格</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            <span style="color:#16a34a">{{ packRecord.qualifiedCount ?? 0 }}</span>
            <span style="color:#94a3b8"> / </span>
            <span style="color:#dc2626">{{ packRecord.unqualifiedCount ?? 0 }}</span>
          </div>

          <div class="dwd-order-grid__label">医生</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.doctorName || '—' }}</div>

          <div class="dwd-order-grid__label">期望交付</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.expectedDeliveryDate?.replace('T', ' ') || '—' }}</div>

          <div class="dwd-order-grid__label">创建时间</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ packRecord.createTime?.replace('T', ' ') || '—' }}</div>
        </div>

        <div class="dwd-sidebar-rule"></div>
        <div class="dwd-sidebar-flags">
          <div class="dwd-flag-item dwd-flag-item--urgent" v-if="packRecord.isUrgent === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            加急
          </div>
          <div class="dwd-flag-item dwd-flag-item--postal" v-if="packRecord.isPostal === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
            邮寄
          </div>
        </div>
      </aside>

      <!-- 右侧：包装表单 -->
      <div class="pack-form-area">
        <!-- 产品列表 -->
        <div class="pack-form-title">产品列表</div>
        <el-table
          :data="packRecord.products || []"
          size="small"
          :header-cell-style="{ background: '#f9fafb' }"
          max-height="200"
          style="margin-bottom:12px">
          <el-table-column label="产品编号" min-width="140" prop="productNo" show-overflow-tooltip />
          <el-table-column label="产品名称" min-width="110" prop="productName" show-overflow-tooltip />
          <el-table-column label="材料" min-width="80" prop="materialName" show-overflow-tooltip />
          <el-table-column label="规格" min-width="80" prop="specName" show-overflow-tooltip />
          <el-table-column label="UDI" min-width="120" prop="udiCode" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.udiCode" class="udi-code-text">{{ row.udiCode }}</span>
              <span v-else class="text-gray">—</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pack-form-title">包装信息</div>
        <el-form :model="packForm" label-width="110px" size="small">
          <el-form-item label="包装设备" required>
            <el-select v-model="packForm.packDeviceId" placeholder="请选择封口机" style="width:100%">
              <el-option-group v-for="group in packDevices" :key="group.centerId" :label="group.centerName">
                <el-option
                  v-for="d in group.devices"
                  :key="d.id"
                  :label="`${d.deviceName}（${d.deviceNo}）`"
                  :value="d.id"
                  :disabled="d.status === 0" />
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="热封温度(℃)">
            <el-input-number v-model="packForm.packSealTemperature" :precision="1" :step="0.5" style="width:100%" />
          </el-form-item>
          <el-form-item label="热封时间(秒)">
            <el-input-number v-model="packForm.packSealTime" :min="0" style="width:100%" />
          </el-form-item>
          <el-form-item label="灭菌方式">
            <el-input v-model="packForm.packSterilizationMethod" placeholder="如：环氧乙烷灭菌" />
          </el-form-item>
          <el-form-item label="灭菌批号">
            <el-input v-model="packForm.packSterilizationBatchNo" placeholder="如：STER20260528001" />
          </el-form-item>
        </el-form>

        <div class="pack-footer-actions">
          <el-button
            type="primary"
            :disabled="!packForm.packDeviceId || packSubmitting"
            :loading="packSubmitting"
            @click="handlePackFill">
            保存包装信息
          </el-button>
          <el-button
            type="success"
            :disabled="!packFilled || packTransferring"
            :loading="packTransferring"
            @click="handlePackTransfer">
            <el-icon><DArrowRight /></el-icon>
            包装完成，流转入库
          </el-button>
        </div>
      </div>
    </div>
  </dialog-modal>

  <dialog-modal
    v-model="productQcVisible"
    title="产品质检"
    subtitle="扫码产品质检判定"
    width="500px"
    :loading="submitting"
    @modal-close="productQcVisible = false"
    @modal-confirm="handleQcConfirm">

    <div class="product-qc-shell">
      <!-- 产品身份区 -->
      <div class="pqc-identity">
        <div class="pqc-identity__label">产品编号</div>
        <div class="pqc-identity__code">{{ scannedProduct?.productNo }}</div>
        <div class="pqc-identity__meta">
          <span>{{ scannedProduct?.productName || '—' }}</span>
          <span class="pqc-identity__sep">|</span>
          <span>{{ scannedProduct?.specName || '—' }}</span>
          <span class="pqc-identity__sep">|</span>
          <span>{{ scannedProduct?.materialName || '—' }}</span>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="pqc-divider">
        <div class="pqc-divider__line"></div>
        <div class="pqc-divider__text">质检判定</div>
        <div class="pqc-divider__line"></div>
      </div>

      <!-- 质检结果选择 -->
      <div class="pqc-result-area">
        <div class="pqc-result-area__title">
          质检结果 <span class="required-star">*</span>
        </div>
        <div class="pqc-result-toggle">
          <button
            class="pqc-toggle-btn pqc-toggle-btn--pass"
            :class="{ 'is-active': qcResult === 'pass' }"
            @click="qcResult = 'pass'">
            <div class="pqc-toggle-btn__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
                <path d="M7.5 12l3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="pqc-toggle-btn__text">
              <div class="pqc-toggle-btn__main">合格</div>
              <div class="pqc-toggle-btn__sub">产品通过质检</div>
            </div>
          </button>
          <button
            class="pqc-toggle-btn pqc-toggle-btn--fail"
            :class="{ 'is-active': qcResult === 'fail' }"
            @click="qcResult = 'fail'">
            <div class="pqc-toggle-btn__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="pqc-toggle-btn__text">
              <div class="pqc-toggle-btn__main">不合格</div>
              <div class="pqc-toggle-btn__sub">需填写不合格原因</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 不合格原因 -->
      <transition name="unqualified-slide">
        <div v-if="qcResult === 'fail'" class="pqc-reason-area">
          <div class="pqc-reason-area__title">
            不合格原因 <span class="required-star">*</span>
          </div>
          <el-input
            v-model="failReason"
            type="textarea"
            :rows="3"
            placeholder="请填写不合格原因，如：尺寸偏差、表面瑕疵、固化不足、材质异常等"
            maxlength="200"
            show-word-limit
            clearable />
        </div>
      </transition>
    </div>
  </dialog-modal>

  <qc-detail-drawer v-model="detailVisible" :record="detailRecord" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Check, MoreFilled, DArrowRight,
  DataLine, Aim, WarningFilled, Box, Refresh
} from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import listTemplate from '@/components/listTemplate.vue'
import PageBox from '@/components/pageBox.vue'
import DialogModal from '@/components/dialogModal.vue'
import QcDetailDrawer from './manufactureComponents/qcDetailDrawer.vue'
import {
  getQcList, getQcProducts, markProductPass,
  markProductFail, transferToPack,
  getDevicesByCenter, fillPackInfo, transferPackToStorage, getProductionRecordDetail,
  qualityColumnConfigGet, qualityColumnConfigSave,
  getQcStatistics,
  type CenterDeviceGroupVO, type ProductionColumnItem, type QcStatisticsVO,
} from '@/api/production'
import { statusLabel, statusStyle } from './statusConfig'
import type { ElTable } from 'element-plus'

// ========== Data ==========
const listTemplateRef = ref()

const DEFAULT_QUALITY_COLUMNS: ProductionColumnItem[] = [
  { field: 'recordNo', label: '流转卡编号', visible: true, sort: 1, width: 160, fixed: null },
  { field: 'designPackageCode', label: '数据包编号', visible: true, sort: 2, width: 160, fixed: null },
  { field: 'productionBatchNo', label: '生产批号', visible: true, sort: 3, width: 140, fixed: null },
  { field: 'orderCode', label: '订单号', visible: true, sort: 4, width: 130, fixed: null },
  { field: 'hospitalName', label: '医院名称', visible: true, sort: 5, width: 130, fixed: null },
  { field: 'hospitalDeptName', label: '科室', visible: true, sort: 6, width: 110, fixed: null },
  { field: 'doctorName', label: '医生', visible: true, sort: 7, width: 90, fixed: null },
  { field: 'patientName', label: '患者', visible: true, sort: 8, width: 90, fixed: null },
  { field: 'isUrgent', label: '加急', visible: true, sort: 9, width: 65, fixed: null },
  { field: 'isPostal', label: '邮寄', visible: true, sort: 10, width: 65, fixed: null },
  { field: 'expectedDeliveryDate', label: '期望交付', visible: true, sort: 11, width: 110, fixed: null },
  { field: 'orgName', label: '机构', visible: true, sort: 12, width: 110, fixed: null },
  { field: 'totalProductCount', label: '产品数', visible: true, sort: 13, width: 70, fixed: null },
  { field: 'qualifiedCount', label: '合格', visible: true, sort: 14, width: 60, fixed: null },
  { field: 'unqualifiedCount', label: '不合格', visible: true, sort: 15, width: 70, fixed: null },
  { field: 'pendingCount', label: '待检', visible: true, sort: 16, width: 60, fixed: null },
  { field: 'status', label: '状态', visible: true, sort: 17, width: 100, fixed: null },
  { field: 'createTime', label: '创建时间', visible: true, sort: 18, width: 160, fixed: null },
  { field: 'action', label: '操作', visible: true, sort: 19, width: 170, fixed: 'right' },
]
const loading = ref(false)
const activeStatus = ref(0)
const filterInputsData = reactive({ productionCode: '', orderNo: '' })
const filterDateRangesData = reactive({ qcStartTime: [] as string[] })
const tableData = ref<any[]>([])
const tableRef = ref<InstanceType<typeof ElTable>>()

// 列配置
const allColumns = ref<ProductionColumnItem[]>([])
const visibleColumns = computed(() =>
  [...allColumns.value].filter(c => c.visible).sort((a, b) => {
    if (a.field === 'action') return 1
    if (b.field === 'action') return -1
    return a.sort - b.sort
  })
)
let columnSortable: any = null

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
      qualityColumnConfigSave({ columns: allColumns.value }).catch(() => ElMessage.error('列顺序保存失败'))
    },
  })
}

const loadColumnConfig = async () => {
  if (columnSortable) { columnSortable.destroy(); columnSortable = null }
  try {
    const res = await qualityColumnConfigGet()
    allColumns.value = (res?.columns ?? []).map((c: ProductionColumnItem) => ({ ...c }))
  } catch {
    allColumns.value = DEFAULT_QUALITY_COLUMNS.map(c => ({ ...c }))
  }
  await nextTick()
  initColumnSortable()
}

// 分页
const pageInfo = reactive({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
})
const qcStatistics = ref<QcStatisticsVO | null>(null)

// ========== Computed ==========
const allProducts = computed(() =>
  tableData.value.flatMap(r =>
    (r.products || []).map((p: any) => ({ ...p, recordId: r.id }))
  )
)

const stats = computed(() => [
  {
    label: '质检中',
    value: qcStatistics.value?.qcInProgress ?? '—',
    icon: DataLine,
    color: '#0d9488',
  },
  {
    label: '质检完成',
    value: qcStatistics.value?.qcCompleted ?? '—',
    icon: Check,
    color: '#059669',
  },
])

const pendingOf = (r: any) =>
  (r.totalProductCount || 0) - (r.qualifiedCount || 0) - (r.unqualifiedCount || 0)

const statusTabs = [
  { label: '全部', value: 0 },
  { label: '过程检验', value: 5010 },
  { label: '出厂检验', value: 5050 },
]

const filterInputs = computed(() => [
  { modelKey: 'productionCode', placeholder: '流转卡编号' },
  { modelKey: 'orderNo', placeholder: '订单号' },
])

const filterDateRanges = computed(() => [
  {
    modelKey: 'qcStartTime',
    startPlaceholder: '进入质检开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
])

const filteredTableData = computed(() => tableData.value)
const pagedTableData = computed(() => tableData.value)

// ========== Methods ==========
const loadData = async () => {
  loading.value = true
  try {
    const res = await getQcList({ pageNum: pageInfo.currentPage, pageSize: pageInfo.pageSize, ...(activeStatus.value ? { status: activeStatus.value } : {}) }) as any
    tableData.value = res.records ?? []
    pageInfo.totalCount = res.total ?? 0
  } catch (error) {
    ElMessage.error('加载质检列表失败')
    console.error('加载质检列表失败', error)
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    qcStatistics.value = await getQcStatistics()
  } catch (error) {
    qcStatistics.value = null
    console.error('加载质检统计失败', error)
  }
}

const currentChange = (page: number) => {
  pageInfo.currentPage = page
  loadData()
}

const switchStatus = (val: number) => {
  activeStatus.value = val
  pageInfo.currentPage = 1
  loadData()
}

const onFilterInputChange = ({ modelKey, value }: { modelKey: string; value: string }) => {
  ;(filterInputsData as any)[modelKey] = value
  pageInfo.currentPage = 1
  loadData()
}

const onFilterChange = () => {
  pageInfo.currentPage = 1
  loadData()
}

const handleFilterReset = () => {
  filterInputsData.productionCode = ''
  filterInputsData.orderNo = ''
  filterDateRangesData.qcStartTime = []
  activeStatus.value = 0
  pageInfo.currentPage = 1
  loadData()
}

// ── 详情抽屉 ─────────────────────────────────────────────
const detailVisible = ref(false)
const detailRecord = ref<any>(null)
const openDetail = (row: any) => { detailRecord.value = row; detailVisible.value = true }

// ── 表头扫码 ─────────────────────────────────────────────
const headerScanCode = ref('')
const handleHeaderScan = () => {
  const code = headerScanCode.value.trim().toUpperCase()
  if (!code) return
  headerScanCode.value = ''
  const prod = allProducts.value.find(p => p.productNo?.toUpperCase() === code)
  if (!prod) { ElMessage.error('未找到产品编号：' + code); return }
  if (prod.qcResult) { ElMessage.warning('该产品已完成质检'); return }
  const record = tableData.value.find(r => r.id === prod.recordId)
  if (record) handleOpenQc(record, prod)
}

// ── 质检弹窗 ─────────────────────────────────────────────
const qcDialogVisible = ref(false)
const reInspectMode = ref(false)
const currentRecord = ref<any>(null)
const currentProducts = ref<any[]>([])
const productsLoading = ref(false)
const scanInputRef = ref()
const scanInputCode = ref('')

const checkedCount = computed(() =>
  currentProducts.value.filter(p => p.qcResult).length
)
const pendingCount = computed(() =>
  currentProducts.value.filter(p => !p.qcResult).length
)
const canTransfer = computed(() =>
  currentProducts.value.length > 0 &&
  pendingCount.value === 0 &&
  currentProducts.value.every(p => p.qcResult === 'pass')
)

const handleQcDialogClose = () => {
  reInspectMode.value = false
  qcDialogVisible.value = false
}

const handleOpenReInspect = (row: any) => {
  reInspectMode.value = true
  handleOpenQc(row)
}

const handleOpenQc = async (row: any, autoOpenProduct?: any) => {
  currentRecord.value = { ...row }
  qcDialogVisible.value = true
  productsLoading.value = true
  try {
    const res = await getQcProducts(row.id) as any
    currentProducts.value = res
    if (autoOpenProduct) {
      const fresh = res.find((p: any) => p.id === autoOpenProduct.id)
      if (fresh && !fresh.qcResult) openProductQc(fresh)
    }
  } finally {
    productsLoading.value = false
    nextTick(() => scanInputRef.value?.focus())
  }
}

const handleScanConfirm = () => {
  const code = scanInputCode.value.trim().toUpperCase()
  if (!code) return
  scanInputCode.value = ''
  const product = currentProducts.value.find(p => p.productNo?.toUpperCase() === code)
  if (!product) { ElMessage.error('未找到产品编号：' + code); return }
  if (product.qcResult) { ElMessage.warning('该产品已完成质检'); return }
  openProductQc(product)
}

const handleTransferToPack = async () => {
  if (!canTransfer.value) return
  await ElMessageBox.confirm(
    `确认将流转卡 ${currentRecord.value.recordNo} 质检完成并流转到包装？`,
    '质检完成',
    {
      confirmButtonText: '确认流转',
      cancelButtonText: '取消',
      type: 'success',
      customClass: 'auth-confirm-dialog',
    }
  )
  await transferToPack(currentRecord.value.id)
  ElMessage.success('已流转到包装')
  qcDialogVisible.value = false
  loadData()
}

// ── 单产品质检弹窗 ───────────────────────────────────────
const productQcVisible = ref(false)
const scannedProduct = ref<any>(null)
const qcResult = ref('')
const failReason = ref('')
const submitting = ref(false)

const canSubmitQc = computed(() => {
  if (!qcResult.value) return false
  if (qcResult.value === 'fail' && !failReason.value.trim()) return false
  return true
})

const openProductQc = (prod: any) => {
  scannedProduct.value = prod
  qcResult.value = ''
  failReason.value = ''
  productQcVisible.value = true
}

const refreshCurrentProducts = async () => {
  const res = await getQcProducts(currentRecord.value.id) as any
  currentProducts.value = res
  const record = tableData.value.find(r => r.id === currentRecord.value.id)
  if (record) {
    record.qualifiedCount = res.filter((p: any) => p.qcResult === 'pass').length
    record.unqualifiedCount = res.filter((p: any) => p.qcResult === 'fail').length
    currentRecord.value.qualifiedCount = record.qualifiedCount
    currentRecord.value.unqualifiedCount = record.unqualifiedCount
  }
}

const handleQcConfirm = async () => {
  if (!canSubmitQc.value || submitting.value) return
  submitting.value = true
  try {
    if (qcResult.value === 'pass') {
      await markProductPass(scannedProduct.value.id)
      ElMessage.success('产品质检合格')
    } else {
      await markProductFail(scannedProduct.value.id, failReason.value.trim())
      ElMessage.success('产品已标记不合格')
    }
    productQcVisible.value = false
    await refreshCurrentProducts()
    nextTick(() => scanInputRef.value?.focus())
  } finally {
    submitting.value = false
  }
}

// ── 包装弹窗 ─────────────────────────────────────────────
const packDialogVisible = ref(false)
const packRecord = ref<any>(null)
const packDevices = ref<CenterDeviceGroupVO[]>([])
const packSubmitting = ref(false)
const packTransferring = ref(false)
const packFilled = ref(false)
const packForm = reactive({
  packDeviceId: null as number | null,
  packSealTemperature: undefined as number | undefined,
  packSealTime: undefined as number | undefined,
  packSterilizationMethod: '',
  packSterilizationBatchNo: '',
})

const handleOpenPack = async (row: any) => {
  packRecord.value = { ...row }
  packFilled.value = false
  packForm.packDeviceId = null
  packForm.packSealTemperature = undefined
  packForm.packSealTime = undefined
  packForm.packSterilizationMethod = ''
  packForm.packSterilizationBatchNo = ''
  packDialogVisible.value = true
  const [detail, devices] = await Promise.all([
    getProductionRecordDetail(row.id) as any,
    getDevicesByCenter({ deviceType: 'SEALING_MACHINE' }) as unknown as CenterDeviceGroupVO[],
  ])
  packRecord.value = detail
  packDevices.value = devices
}

const handlePackFill = async () => {
  if (!packForm.packDeviceId || packSubmitting.value) return
  packSubmitting.value = true
  try {
    await fillPackInfo(packRecord.value.id, {
      packDeviceId: packForm.packDeviceId,
      packSealTemperature: packForm.packSealTemperature,
      packSealTime: packForm.packSealTime,
      packSterilizationMethod: packForm.packSterilizationMethod || undefined,
      packSterilizationBatchNo: packForm.packSterilizationBatchNo || undefined,
    } as any)
    ElMessage.success('包装信息已保存')
    packFilled.value = true
  } finally {
    packSubmitting.value = false
  }
}

const handlePackTransfer = async () => {
  if (!packFilled.value || packTransferring.value) return
  await ElMessageBox.confirm(
    `确认将流转卡 ${packRecord.value.recordNo} 包装完成并流转到入库？`,
    '包装完成',
    { confirmButtonText: '确认流转', cancelButtonText: '取消', type: 'success', customClass: 'auth-confirm-dialog' }
  )
  packTransferring.value = true
  try {
    await transferPackToStorage(packRecord.value.id)
    ElMessage.success('已流转到入库')
    packDialogVisible.value = false
    loadData()
  } finally {
    packTransferring.value = false
  }
}


const route = useRoute()
const router = useRouter()

watch(() => route.query.detailId, (detailId) => {
  if (detailId && tableData.value.length) {
    const row = tableData.value.find(r => r.id === Number(detailId))
    if (row) {
      openDetail(row)
      router.replace({ query: {} })
    }
  }
}, { immediate: true })

onMounted(async () => {
  await loadColumnConfig()
  loadData()
  fetchStatistics()
})

onUnmounted(() => {
  if (columnSortable) { columnSortable.destroy(); columnSortable = null }
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/authCommon.scss' as *;

// ── 质检页主题色 ──
.inspect-page {
  --qc-primary: #0d9488;
  --qc-primary-light: #ccfbf1;
  --qc-primary-pale: #f0fdfa;
  --qc-danger: #dc2626;
  --qc-danger-light: #fee2e2;
  --qc-success: #059669;
  --qc-success-light: #d1fae5;
  --qc-warning: #d97706;
  --qc-warning-light: #fef3c7;
  --qc-neutral: #64748b;
  --qc-border: #e2e8f0;
  --qc-surface: #ffffff;
  --qc-bg: #f8fafc;
  --qc-text: #0f172a;
  --qc-text-muted: #64748b;
  --qc-radius: 14px;
  --qc-radius-sm: 10px;
}

.udi-code-text {
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 11px;
  color: #7c3aed;
  letter-spacing: 0.3px;
}

.list-subtitle {
  font-size: 12px;
  color: var(--qc-text-muted);
}

// ══════════════════════════════════════════════════════════════
// 质检弹窗
// ══════════════════════════════════════════════════════════════
.qc-dialog-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
}

.qc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
  border: 1px solid #99f6e4;
  border-radius: var(--qc-radius);

  &__left { display: flex; flex-direction: column; gap: 4px; }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: var(--qc-primary);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  &__meta { display: flex; align-items: center; gap: 8px; }

  &__recordno {
    font-family: "JetBrains Mono", monospace;
    font-size: 16px;
    font-weight: 700;
    color: var(--qc-text);
  }

  &__sep { color: #94a3b8; }

  &__pkgcode {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    color: #7c3aed;
    font-weight: 600;
  }

  &__info {
    font-size: 12px;
    color: var(--qc-text-muted);
  }

  &__stats { display: flex; gap: 10px; align-items: center; }
}

.qc-stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 18px;
  border-radius: var(--qc-radius-sm);
  min-width: 60px;
  border: 1px solid transparent;

  &__num {
    font-size: 24px;
    font-weight: 800;
    line-height: 1;
    font-family: "JetBrains Mono", monospace;
  }

  &__label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 3px;
    opacity: 0.7;
  }

  &--total {
    background: rgba(100, 116, 139, 0.08);
    color: var(--qc-neutral);
    border-color: rgba(100, 116, 139, 0.15);
  }

  &--pass {
    background: var(--qc-success-light);
    color: var(--qc-success);
    border-color: rgba(5, 150, 105, 0.2);
  }

  &--pending {
    background: var(--qc-warning-light);
    color: var(--qc-warning);
    border-color: rgba(217, 119, 6, 0.2);
  }
}

.qc-products-section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    color: var(--qc-text);
  }
}

.qc-products-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--qc-primary);
  background: #f0fdfa;
  padding: 2px 8px;
  border-radius: 20px;
}

.qc-products-table {
  border-radius: var(--qc-radius-sm);
  border: 1px solid var(--qc-border);
  overflow: hidden;
}

.qc-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--qc-border);
}

.transfer-btn.el-button--success {
  //--el-button-bg-color: var(--qc-success);
  //--el-button-border-color: var(--qc-success);
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
  font-weight: 600;
}

// ══════════════════════════════════════════════════════════════
// 单产品质检弹窗
// ══════════════════════════════════════════════════════════════
.product-qc-shell {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 15px;
}

.pqc-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 20px;
  background: linear-gradient(160deg, #f0fdfa 0%, #f8fafc 100%);
  border: 1px solid var(--qc-border);
  border-radius: var(--qc-radius);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--qc-primary), #14b8a6, #2dd4bf);
  }

  &__label {
    font-size: 10px;
    font-weight: 700;
    color: var(--qc-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  &__code {
    font-family: "JetBrains Mono", monospace;
    font-size: 22px;
    font-weight: 800;
    color: var(--qc-text);
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--qc-text-muted);
  }

  &__sep { color: #cbd5e1; }
}

.pqc-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 16px;

  &__line { flex: 1; height: 1px; background: var(--qc-border); }

  &__text {
    font-size: 11px;
    font-weight: 700;
    color: var(--qc-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    white-space: nowrap;
  }
}

.pqc-result-area {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--qc-text);
  }
}

.required-star {
  color: var(--qc-danger);
  margin-left: 2px;
}

.pqc-result-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pqc-toggle-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--qc-radius);
  border: 2px solid var(--qc-border);
  background: var(--qc-surface);
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.18s;
  }

  &__text { display: flex; flex-direction: column; gap: 2px; }

  &__main {
    font-size: 15px;
    font-weight: 700;
    color: var(--qc-text);
    transition: color 0.18s;
  }

  &__sub {
    font-size: 11px;
    color: var(--qc-text-muted);
  }

  &--pass {
    &:hover {
      border-color: rgba(5, 150, 105, 0.4);
      background: rgba(5, 150, 105, 0.03);
    }

    .pqc-toggle-btn__icon {
      background: rgba(5, 150, 105, 0.1);
      color: var(--qc-success);
    }

    &.is-active {
      border-color: var(--qc-success);
      background: #bbf7d0;
      box-shadow: 0 2px 12px rgba(5, 150, 105, 0.18);

      .pqc-toggle-btn__icon {
        background: var(--qc-success);
        color: #fff;
      }

      .pqc-toggle-btn__main { color: var(--qc-success); }
    }
  }

  &--fail {
    &:hover {
      border-color: rgba(220, 38, 38, 0.4);
      background: rgba(220, 38, 38, 0.4);
    }

    .pqc-toggle-btn__icon {
      background: rgba(220, 38, 38, 0.1);
      color: var(--qc-danger);
    }

    &.is-active {
      border-color: var(--qc-danger);
      background: #fecaca;
      box-shadow: 0 2px 12px rgba(220, 38, 38, 0.18);

      .pqc-toggle-btn__icon {
        background: var(--qc-danger);
        color: #fff;
      }

      .pqc-toggle-btn__main { color: var(--qc-danger); }
    }
  }
}

.pqc-reason-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 14px;

  &__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--qc-text);
  }
}

.unqualified-slide-enter-active,
.unqualified-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.unqualified-slide-enter-from,
.unqualified-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
}

.unqualified-slide-enter-to,
.unqualified-slide-leave-from {
  opacity: 1;
  max-height: 200px;
}

.pack-dialog-shell {
  display: flex;
  gap: 0;
  min-height: 400px;
}

.pack-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--qc-border);
  overflow-y: auto;
  padding: 10px 0;
}

.pack-form-area {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pack-form-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--qc-text);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--qc-border);
}

.pack-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--qc-border);
  margin-top: auto;
}

// 复用详情抽屉样式
.dwd-pt-card {
  margin: 0 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}

.dwd-pt-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}

.dwd-pt-meta { flex: 1; min-width: 0; }

.dwd-pt-name {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dwd-pt-tags { display: flex; align-items: center; gap: 3px; }

.dwd-pt-tag {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60px;
}

.dwd-pt-tag-sep { color: #cbd5e1; font-size: 10px; }

.dwd-org-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 18px;
  margin-bottom: 12px;
}

.dwd-org-row {
  display: flex;
  align-items: center;
  gap: 6px;
  svg { flex-shrink: 0; color: #94a3b8; }
}

.dwd-org-row__value {
  font-size: 11px;
  color: #475569;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dwd-sidebar-rule {
  height: 1px;
  background: linear-gradient(to right, rgba(14,165,233,.3), rgba(99,102,241,.1), transparent);
  margin: 0 10px 10px;
}

.dwd-order-grid {
  padding: 0 18px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0;
  margin-bottom: 12px;
}

.dwd-order-grid__label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 5px 0;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  &:nth-last-child(-n+2) { border-bottom: none; }
}

.dwd-order-grid__value {
  padding: 5px 8px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 6px;
  &:nth-last-child(-n+2) { border-bottom: none; }
}

.dwd-order-grid__value--mono {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dwd-sidebar-flags {
  margin: 0 15px;
  display: flex;
  gap: 6px;
}

.dwd-flag-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;

  &--urgent {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  &--postal {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }
}
</style>
