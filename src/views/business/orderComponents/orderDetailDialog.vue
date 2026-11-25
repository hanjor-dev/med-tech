<template>
  <dialog-modal v-model="visible" :title="isDraft ? '草稿详情' : isClassicCase ? '经典案例详情' : '订单详情'"
    :subtitle="(order?.orderCode ? `订单号：${order.orderCode}` : '') || (order?.id ? `草稿 ${order.id}` : '')"
    width="1100px" :show-footer="!isDraft" @modal-close="visible = false">
    <template #subtitle-action>
      <button v-if="order?.orderCode" class="dwd-copy-btn" title="复制订单号" @click="handleCopyOrderCode">
        复制
      </button>
    </template>
    <div class="dlr-root" v-if="order">
      <!-- Left Sidebar -->
      <aside class="dlr-slidebar">
        <!-- Patient Identity Card -->
        <div class="dwd-pt-card">
          <span v-if="props.isClassicCase"  class="dwd-classic-badge">
            <el-icon class="classic-icon">
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
              <span class="dwd-pt-tag-sep" v-if="!isDraft">/</span>
              <span class="dwd-pt-tag" v-if="!isDraft">{{ order.statusName }}</span>
            </div>
          </div>
          <div class="dwd-pt-indicator" v-if="!isDraft" :class="`is-${(order as any).status}`"></div>
        </div>

        <!-- Hospital & Dept & Doctor -->
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
            <span class="dwd-org-row__value">{{ order.hospitalDeptName }}</span>
          </div>
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span class="dwd-org-row__value">{{ order.doctorName }}</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="dwd-sidebar-rule"></div>

        <!-- Order Info Grid -->
        <div class="dwd-order-grid">
          <div class="dwd-order-grid__label">订单类型</div>
          <div class="dwd-order-grid__value">
            <el-tag size="small" :type="order.orderType === 1 ? 'primary' : 'warning'" effect="dark">
              {{ order.orderTypeName }}
            </el-tag>
          </div>

          <div class="dwd-order-grid__label">虚拟单号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ order.publicOrderCode || '—' }}</div>

          <div class="dwd-order-grid__label">业务类型</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            {{ (order as any).businessTypeName || order.businessType || '—' }}
          </div>

          <div class="dwd-order-grid__label">提单机构</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ order.orgName }}</div>

          <div class="dwd-order-grid__label">操作员</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ safeOperatorName }}</div>

          <div class="dwd-order-grid__label" v-if="!isDraft">设计师</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono" v-if="!isDraft">
            {{ order.designerName || '—' }}
          </div>

          <div class="dwd-order-grid__label" v-if="isDraft">联系电话</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono" v-if="isDraft">
            {{ safeOperatorPhone }}
          </div>

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

          <template v-if="props.isClassicCase">
            <div class="dwd-order-grid__label">标记时间</div>
            <div class="dwd-order-grid__value dwd-order-grid__value--mono">
              {{ order?.classicCaseTime ? dayjs(order.classicCaseTime).format('YYYY-MM-DD HH:mm') : '—' }}
            </div>

            <div class="dwd-order-grid__label">标记人</div>
            <div class="dwd-order-grid__value dwd-order-grid__value--mono">
              {{ order?.classicCaseByName || '—' }}
            </div>

            <div class="dwd-order-grid__label">标记备注</div>
            <div class="dwd-order-grid__value dwd-order-grid__value--mono">
              {{ order?.classicCaseRemark || '—' }}
            </div>
          </template>
        </div>

        <!-- Divider -->
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
      <!-- Right Main Content -->
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
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.downloadUrl, f.fileUrl, f.fileName)">
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
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.downloadUrl, f.fileUrl, f.fileName)">
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
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.downloadUrl, f.fileUrl, f.fileName)">
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
          v-if="(!order.items || order.items.length === 0) && (!order.imageDataFiles?.length) && (!order.imageReportFiles?.length) && (!order.approvalFiles?.length) && (!order.packageList?.length) && (!order.modelList?.length) && (!order.reports?.length)"
          class="dwd-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>暂无重建项目或影像文件</span>
        </div>

        <!-- 03 打印数据包 -->
        <section class="form-section" v-if="order.packageList?.length">
          <div class="form-section-header">
            <span class="form-section-num">03</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">打印数据包</span>
            <span class="form-section-count">{{ order.packageList.length }}</span>
          </div>
          <div class="dwd-pkg-list">
            <div v-for="(pkg, idx) in order.packageList" :key="pkg.id" class="dwd-pkg-card"
              :class="{ 'dwd-pkg-card--append': pkg.batchId }">
              <div class="dwd-pkg-card__body">
                <div class="dwd-pkg-card__head">
                  <div class="dwd-pkg-card__code">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2">
                      <path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    {{pkg.fileName}}-({{ pkg.packageCode }})
                    <span v-if="pkg.batchId" class="dwd-pkg-card__append-badge">追加</span>
                  </div>
                  <div class="dwd-pkg-card__tags">
                    <el-tag size="small" effect="light" v-if="pkg.latestInstruction">指令单</el-tag>
                    <el-tag size="small" type="primary" effect="light" v-if="pkg.latestDrawings?.length">图纸</el-tag>
                    <span class="dwd-pkg-card__file-count">{{ pkg.fileCount }} 个文件</span>
                  </div>
                </div>

                <!-- 文件列表 -->
                <div v-if="pkg.files?.length" class="dwd-pkg-files">
                  <div v-for="f in pkg.files" :key="f.id" class="dwd-pkg-file-chip">
                    <div class="dwd-pkg-file-chip__icon">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <span class="dwd-pkg-file-chip__name" :title="f.fileName">{{ f.fileName }}</span>
                    <el-icon size="10" color="#10b981" v-if="f.hasPrintInfo" class="dwd-pkg-file-chip__badge">
                      <CircleCheckFilled />
                    </el-icon>
                    <el-button link size="small" class="dwd-pkg-file-chip__dl"
                      @click="handleDownloadFile(f.downloadUrl ?? '', f.fileUrl, f.fileName)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </el-button>
                  </div>
                </div>

                <processing-document-file v-if="pkg.processingApplication" :file="pkg.processingApplication"
                  :revision="pkg.processingApplication.revision" />
                <!-- 版本信息 -->
                <div v-if="pkg.latestInstruction || pkg.latestDrawings?.length" class="dwd-pkg-versions">
                  <div v-if="pkg.latestInstruction" class="dwd-pkg-ver dwd-pkg-ver--instr">
                    <div class="dwd-pkg-ver__label">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      指令单
                      <span class="dwd-confirmed-badge" v-if="pkg.latestInstruction.isConfirmed === 1">
                        <span class="dwd-confirmed-badge__dot"></span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        已确认
                      </span>
                    </div>
                    <div class="dwd-pkg-ver__items">
                      <div v-if="pkg.latestInstruction.templateFileUrl" class="dwd-pkg-ver__item">
                        <span>版本 {{ pkg.latestInstruction.version }}</span>
                        <el-button link size="small"
                          @click="handleDownloadFile(pkg.latestInstruction!.templateDownloadUrl ?? '', pkg.latestInstruction!.templateFileUrl, `指令单模板_v${pkg.latestInstruction!.version}.${getExt(pkg.latestInstruction!.templateFileUrl)}`)">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </el-button>
                      </div>
                      <div v-if="pkg.latestInstruction.revisedFileUrl" class="dwd-pkg-ver__item">
                        <span>修订版</span>
                        <el-button link size="small"
                          @click="handleDownloadFile(pkg.latestInstruction!.revisedDownloadUrl ?? '', pkg.latestInstruction!.revisedFileUrl, `指令单修订版.${getExt(pkg.latestInstruction!.revisedFileUrl)}`)">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div v-for="drawing in pkg.latestDrawings" :key="drawing.id" class="dwd-pkg-ver dwd-pkg-ver--draw">
                    <div class="dwd-pkg-ver__label">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <polyline points="9 15 11 17 15 13" />
                      </svg>
                      图纸
                      <span class="dwd-category-tag">{{ drawing.productCategory === '17.1' ? '模型类' : '导板类' }}</span>
                      <span class="dwd-confirmed-badge" v-if="drawing.isConfirmed === 1">
                        <span class="dwd-confirmed-badge__dot"></span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        已确认
                      </span>
                    </div>
                    <div class="dwd-pkg-ver__items">
                      <div v-if="drawing.templateFileUrl" class="dwd-pkg-ver__item">
                        <span>版本 {{ drawing.version }}</span>
                        <el-button link size="small"
                          @click="handleDownloadFile(drawing.templateDownloadUrl ?? '', drawing.templateFileUrl, `图纸模板_v${drawing.version}.${getExt(drawing.templateFileUrl)}`)">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </el-button>
                      </div>
                      <div v-if="drawing.revisedFileUrl" class="dwd-pkg-ver__item">
                        <span>修订版</span>
                        <el-button link size="small"
                          @click="handleDownloadFile(drawing.revisedDownloadUrl ?? '', drawing.revisedFileUrl, `图纸修订版.${getExt(drawing.revisedFileUrl)}`)">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!order.packageList?.length" class="dwd-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span>暂无数据包</span>
          </div>
        </section>

        <!-- 04 模型 & 报告 -->
        <section class="form-section form-section--alt" v-if="order.modelList?.length || order.reports?.length">
          <div class="form-section-header">
            <span class="form-section-num">04</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">模型 & 报告</span>
            <span class="form-section-count">{{ (order.modelList?.length || 0) + (order.reports?.length || 0)
            }}</span>
          </div>

          <!-- 可视化模型 -->
          <div v-if="order.modelList?.length" class="dwd-model-zone">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              可视化模型
            </div>
            <div class="dwd-img-grid">
              <div v-for="m in order.modelList" :key="m.id" class="dwd-img-card">
                <div class="dwd-img-card__thumb dwd-img-card__thumb--model">
                  <div class="dwd-img-card__thumb-empty" style="color:#0891b2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                </div>
                <div class="dwd-img-card__info">
                  <span class="dwd-img-card__name">{{ m.fileName }}</span>
                  <span class="dwd-img-card__meta">{{ formatFileSize(m.fileSize) }}</span>
                </div>
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(m.downloadUrl ?? '', m.fileUrl, m.fileName)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 设计报告 -->
          <div v-if="order.reports?.length" class="dwd-model-zone" style="margin-top:10px">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              </svg>
              设计报告
            </div>
            <div class="dwd-img-grid">
              <div v-for="report in order.reports" :key="report.id" class="dwd-img-card">
                <div class="dwd-img-card__thumb dwd-img-card__thumb--doc">
                  <div class="dwd-img-card__thumb-empty" style="color:#0891b2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <polyline points="9 15 11 17 15 13" />
                    </svg>
                  </div>
                </div>
                <div class="dwd-img-card__info">
                  <span class="dwd-img-card__name">{{ report.fileName }}</span>
                  <span class="dwd-img-card__meta">{{ report.fileSizeText }}</span>
                </div>
                <el-button link class="dwd-img-card__dl"
                  @click="handleDownloadFile(report.downloadUrl ?? '', report.fileUrl, report.fileName)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="!order.modelList?.length && !order.reports?.length" class="dwd-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span>暂无模型或报告</span>
          </div>
        </section>
      </main>
    </div>
    <template #footer-btn>
      <div class="dlr-actions">
        <div v-if="showAuditButtons.auditPass" v-permission="'order:Approve'"
          class="action-btn action-btn-approve" :class="{ 'is-loading': loading && approveLoading }"
          @click="handleApprove((props.order as any).status)">
          <div class="action-content">
            <span class="action-label">审核通过</span>
          </div>
        </div>
        <div v-if="showAuditButtons.auditReject" v-permission="'order:Reject'"
          class="action-btn action-btn-reject" :class="{ 'is-loading': loading && rejectLoading }"
          @click="handleReject((props.order as any).status)">
          <div class="action-content">
            <span class="action-label">审核驳回</span>
          </div>
        </div>
        <el-button v-if="(props.order as any).status === 2030 && (props.order as any).needsPhysicalDelivery !== 1" type="primary" :loading="completeLoading"
          @click="handleManualComplete">
          完成订单
        </el-button>
        <el-button class="btn btn-ghost" @click="visible = false" :disabled="loading">
          关闭
        </el-button>
      </div>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProcessingDocumentFile from '../designComponents/processingDocumentFile.vue'
import dialogModal from '@/components/dialogModal.vue'
import { ElTag, ElButton, ElIcon, ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { StarFilled } from '@element-plus/icons-vue'
import { orderAuditPass, orderAuditReject, orderManualComplete, classicCaseDetail } from '@/api/order'
import type { OrderVO, OrderDetailVO, DraftDetailVO } from '@/api/order'
import { Session } from '@/utils/storage'
import { useUserInfo } from '@/stores/userInfo'
import dayjs from 'dayjs'

defineOptions({ name: 'OrderDetailDialog' })

type DetailData = Partial<OrderDetailVO & DraftDetailVO> & Record<string, any>

const props = defineProps<{
  modelValue: boolean
  order?: DetailData | null
  isClassicCase?: boolean
  orderId?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'action', action: string, order: OrderVO): void
  (e: 'audit-success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const userStore = useUserInfo()
const currentUserRole = computed(() => userStore.userInfos.roleCode || '')

const isDraft = computed(() => !props.order?.orderCode)
const isTrialOrder = computed(() => (props.order as any)?.businessType === '11.3')
const currentAuditStage = computed(() => (props.order as any)?.auditStage || '')
const currentStatus = computed(() => (props.order as any)?.status)

const showAuditButtons = computed(() => {
  const showButtons = {
    auditPass: false,
    auditReject: false,
  }

  if (!props.order || isDraft.value || currentStatus.value !== 1020 || currentAuditStage.value === 'PASSED') {
    return showButtons
  }

  if (isTrialOrder.value) {
    switch (currentAuditStage.value) {
      case 'REGIONAL_PENDING':
        if (currentUserRole.value === 'regional-manager') {
          showButtons.auditPass = true
          showButtons.auditReject = true
        }
        break
      case 'DESIGN_PENDING':
        if (currentUserRole.value === 'designer-manager') {
          showButtons.auditPass = true
          showButtons.auditReject = true
        }
        break
    }
  } else {
    switch (currentAuditStage.value) {
      case 'DESIGN_PENDING':
        if (currentUserRole.value === 'designer-manager') {
          showButtons.auditPass = true
          showButtons.auditReject = true
        }
        break
    }
  }

  return showButtons
})

const safeOperatorName = computed(() => (props.order as any)?.operatorName || '')
const safeOperatorPhone = computed(() => (props.order as any)?.operatorPhone || '—')

const loading = ref(false)
const approveLoading = ref(false)
const rejectLoading = ref(false)
const completeLoading = ref(false)

const handleApprove = async (status: number) => {
  if (status !== 1020 && status !== 1040 || !props.order) return
  try {
    await ElMessageBox.confirm(
      `确定审核通过订单「${props.order.orderCode}」？`,
      '审核通过',
      { confirmButtonText: '确认通过', cancelButtonText: '取消', type: 'success' }
    )
    approveLoading.value = true
    loading.value = true
    await orderAuditPass((props.order as any).id, (props.order as any).version)
    ElMessage.success('审核通过')
    emit('audit-success')
    visible.value = false
  } catch (err: any) {
    if (err !== 'cancel' && err !== 'close') {
      // no-op
    }
  } finally {
    approveLoading.value = false
    rejectLoading.value = false
    loading.value = false
  }
}

const handleReject = async (status: number) => {
  if (status !== 1020 || !props.order) return
  try {
    const { value } = await ElMessageBox.prompt(
      `请填写订单「${props.order.orderCode}」的驳回原因`,
      '审核不通过',
      {
        confirmButtonText: '确认驳回',
        cancelButtonText: '取消',
        type: 'warning',
        inputPattern: /\S+/,
        inputErrorMessage: '驳回原因不能为空',
      }
    )
    rejectLoading.value = true
    loading.value = true
    await orderAuditReject((props.order as any).id, (props.order as any).version, value)
    ElMessage.success('已驳回')
    emit('audit-success')
    visible.value = false
  } catch (err: any) {
    if (err !== 'cancel' && err !== 'close') {
      // no-op
    }
  } finally {
    approveLoading.value = false
    rejectLoading.value = false
    loading.value = false
  }
}

const handleManualComplete = async () => {
  const order = props.order as any
  if (!order) return
  try {
    completeLoading.value = true
    await orderManualComplete(order.id, order.version)
    ElMessage.success('订单已完成')
    emit('audit-success')
    emit('update:modelValue', false)
  } catch {
  } finally {
    completeLoading.value = false
  }
}

// ── 文件下载 ──────────────────────────────────────────────────────
const handleDownloadFile = (downloadUrl?: string, fileUrl?: string, fileName?: string) => {
  const token = Session.get('token') || ''
  const url = downloadUrl || fileUrl
  const a = document.createElement('a')
  a.href = url || ''
  a.download = fileName || ''
  if (token) a.setAttribute('Authorization', token)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const getExt = (url: string): string => url.split('.').pop() || ''

// ── 复制订单号 ──────────────────────────────────────────────────────
const handleCopyOrderCode = async () => {
  if (!props.order?.orderCode) return
  const text = props.order.orderCode
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
  ElMessage.success('订单号已复制')
}
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

.dwd-copy-btn {
  margin-left: 6px;
  border: none;
  background: none;
  color: #409eff;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
}

// ── Image Files ────────────────────────────────────────────────────────────────
.dwd-img-zone__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;

  svg {
    color: #0891b2;
  }
}

.dwd-img-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.dwd-img-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: #0891b2;
    box-shadow: 0 2px 10px rgba(8, 145, 178, 0.08);
    transform: translateY(-1px);
  }
}

.dwd-img-card__thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8fafc;
  border: 1px solid #f1f5f9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--doc {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0fdfa;
    border-color: #ccfbf1;
  }

  &--model {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f9ff;
    border-color: #e0f2fe;
  }
}

.dwd-img-card__thumb-empty {
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.dwd-img-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.dwd-img-card__dl {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(47, 91, 255, 0.06);
  color: #2f5bff;
  cursor: pointer;
  transition: background 0.15s;
  padding: 0 !important;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
    stroke: #2f5bff;
  }

  &:hover {
    background: rgba(47, 91, 255, 0.12);
  }
}

// ── Package List ───────────────────────────────────────────────────────────────
.dwd-pkg-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dwd-pkg-card {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &--append {
    border-color: #f59e0b;
    box-shadow: 0 3px 12px rgba(245, 158, 11, 0.12);

    &:hover {
      border-color: #d97706;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
    }
  }

  &:hover {
    border-color: #0891b2;
    box-shadow: 0 4px 16px rgba(8, 145, 178, 0.08);
  }
}

.dwd-pkg-card__append-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  background: #fef3c7;
  color: #b45309;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
}

.dwd-pkg-card__body {
  flex: 1;
  min-width: 0;
}

.dwd-pkg-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.dwd-pkg-card__code {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.2px;
}

.dwd-pkg-card__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.dwd-pkg-card__file-count {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
}

.dwd-pkg-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.dwd-pkg-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px 4px 6px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  transition: all 0.18s ease;
  max-width: 200px;
  cursor: default;

  &:hover {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-color: #7dd3fc;
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.1);
    transform: translateY(-1px);
  }
}

.dwd-pkg-file-chip__icon {
  color: #64748b;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.dwd-pkg-file-chip__name {
  font-size: 11px;
  color: #334155;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.dwd-pkg-file-chip__badge {
  flex-shrink: 0;
}

.dwd-pkg-file-chip__dl {
  color: #94a3b8;
  padding: 2px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover {
    color: #0891b2;
    background: rgba(8, 145, 178, 0.08);
  }
}

.dwd-pkg-versions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
}

.dwd-pkg-ver {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid transparent;

  &--instr {
    background: linear-gradient(135deg, #eff6ff 0%, #e8f2ff 100%);
    border-color: #bfdbfe;
  }

  &--draw {
    background: linear-gradient(135deg, #fffbf0 0%, #fff9e6 100%);
    border-color: #fde68a;
  }
}

.dwd-pkg-ver__label {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.dwd-pkg-ver__items {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dwd-pkg-ver__item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #475569;

  > span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .el-button {
    color: #94a3b8;
    padding: 2px;
    flex-shrink: 0;

    &:hover {
      color: #0891b2;
    }
  }
}

.dwd-category-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #e0e7ff;
  color: #4338ca;
  margin-left: 4px;
}

.dwd-confirmed-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px 2px 4px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #6ee7b7;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  color: #065f46;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 4px rgba(16, 185, 129, 0.2);
  flex-shrink: 0;

  svg {
    color: #059669;
    flex-shrink: 0;
  }

  &__dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #059669;
    flex-shrink: 0;
    animation: dwd-confirmed-pulse 2s ease-in-out infinite;
  }
}

@keyframes dwd-confirmed-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

// ── Empty ───────────────────────────────────────────────────────────────────────
.dwd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 24px;
  color: #cbd5e1;

  svg {
    opacity: 0.4;
  }

  span {
    font-size: 12px;
    font-weight: 600;
  }
}

// ── Model Zone ───────────────────────────────────────────────────────────────
.dwd-model-zone {
  margin-bottom: 10px;
}
</style>
