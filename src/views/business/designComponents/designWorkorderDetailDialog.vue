<template>
  <dialog-modal v-model="visible" :title="workorder ? '工单详情' : '加载中…'" :subtitle="subtitle" width="1100px"
    @modal-close="visible = false">
    <template #title-badge>
      <UdiBadge :provide-udi="workorder?.provideUdi" />
    </template>
    <template #subtitle-action>
      <button v-if="workorder?.orderCode" class="dwd-copy-btn" title="复制订单号" @click="handleCopyOrderCode">
        复制
      </button>
    </template>
    <div class="dlr-root" v-if="workorder">
      <!-- Left Sidebar: Redesigned Medical Dashboard -->
      <aside class="dlr-slidebar">
        <!-- Patient Identity Card -->
        <div class="dwd-pt-card">
          <div class="dwd-pt-avatar">
            <span>{{ workorder.patientName?.charAt(0) || '?' }}</span>
          </div>
          <div class="dwd-pt-meta">
            <div class="dwd-pt-name">{{ workorder.patientName }}</div>
            <div class="dwd-pt-tags">
              <span class="dwd-pt-tag">{{ workorder.patientGenderName }}</span>
              <span class="dwd-pt-tag-sep">/</span>
              <span class="dwd-pt-tag">{{ workorder.patientAge }}岁</span>
              <span class="dwd-pt-tag-sep">/</span>
              <span class="dwd-pt-tag">{{ workorder.phaseName }}</span>
            </div>
          </div>
          <div class="dwd-pt-indicator" :class="`is-${workorder.status}`"></div>
        </div>

        <!-- Hospital & Dept -->
        <div class="dwd-org-block">
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span class="dwd-org-row__value">{{ workorder.hospitalName }}</span>
          </div>
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span class="dwd-org-row__value">{{ workorder.hospitalDeptName }}</span>
          </div>
          <div class="dwd-org-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span class="dwd-org-row__value">{{ workorder.doctorName }}</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="dwd-sidebar-rule"></div>

        <!-- Order Info Grid -->
        <div class="dwd-order-grid">
          <div class="dwd-order-grid__label">订单类型</div>
          <div class="dwd-order-grid__value">
            <el-tag size="small" :type="workorder.orderType === 1 ? 'primary' : 'warning'" effect="dark">{{
              workorder.orderTypeName }}</el-tag>
          </div>

          <div class="dwd-order-grid__label">虚拟单号</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ workorder.publicOrderCode || '—' }}</div>

          <div class="dwd-order-grid__label">业务类型</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ workorder.businessTypeName }}</div>

          <div class="dwd-order-grid__label">操作员</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ workorder.operatorName }}</div>

          <div class="dwd-order-grid__label">联系电话</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ workorder.operatorPhone }}</div>

          <div class="dwd-order-grid__label">设计师</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--inline-row">
            <span class="dwd-order-grid__value--mono">{{ workorder.designerName || '—' }}</span>
            <button class="dwd-history-btn" title="查看分配历史" @click="openHistory" v-permission="'design: AssignDesignerLog'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              分配历史
            </button>
          </div>

          <div class="dwd-order-grid__label">开始设计</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ workorder.designStartTime ?
            dayjs(workorder.designStartTime).format('YYYY-MM-DD HH:mm') : '—' }}</div>

          <div class="dwd-order-grid__label">机构</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ workorder.orgName }}</div>

          <div class="dwd-order-grid__label">地区</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">{{ workorder.fullAreaName || workorder.areaName
            || '—' }}</div>
          <div class="dwd-order-grid__label">期望交付</div>
          <div class="dwd-order-grid__value dwd-order-grid__value--mono">
            {{ dayjs(workorder.expectedDeliveryDate).format('YYYY-MM-DD HH:mm') }}</div>

        </div>
        <!-- Divider -->
        <div class="dwd-sidebar-rule"></div>
        <!-- Flags -->
        <div class="dwd-sidebar-flags">
          <div class="dwd-flag-item dwd-flag-item--urgent" v-if="workorder.isUrgent === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            加急
          </div>
          <div class="dwd-flag-item dwd-flag-item--postal" v-if="workorder.isPostal === 1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            邮寄
          </div>
          <div class="dwd-flag-item dwd-flag-item--delivery" v-if="isLocalPhysical(workorder)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            实体交付
          </div>
        </div>
        <div class="dwd-flag-addr" v-if="workorder.isPostal === 1 && workorder.postalAddress">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style="flex:1;word-break:break-all">{{ workorder.postalAddress }}</span>
        </div>
      </aside>
      <!-- Right Main Content -->
      <main class="dlr-main">
        <!-- 01 重建项目 -->
        <section class="form-section" v-if="workorder.rebuildProjectList?.length">
          <div class="form-section-header">
            <span class="form-section-num">01</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">重建项目</span>
            <span class="form-section-count">{{ workorder.rebuildProjectList.length }}</span>
          </div>
          <div class="dwd-rebuild-grid">
            <div v-for="item in workorder.rebuildProjectList" :key="item.projectName + item.bodyPartName"
              class="dwd-rebuild-card">
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
            </div>
          </div>
        </section>

        <!-- 02 影像文件 -->
        <section class="form-section" v-if="workorder.imageDataFiles?.length || workorder.imageReportFiles?.length">
          <div class="form-section-header">
            <span class="form-section-num">02</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">影像文件</span>
            <span class="form-section-count">{{ (workorder.imageDataFiles?.length || 0) +
              (workorder.imageReportFiles?.length || 0) }}</span>
          </div>

          <!-- 原始影像数据 -->
          <div v-if="workorder.imageDataFiles?.length" class="dwd-img-zone">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              原始影像数据
            </div>
            <div class="dwd-img-grid">
              <div v-for="f in workorder.imageDataFiles" :key="f.fileId" class="dwd-img-card">
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
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.downloadUrl ?? '', f.fileUrl, f.fileName)">
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
          <div v-if="workorder.imageReportFiles?.length" class="dwd-img-zone" style="margin-top:10px">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              </svg>
              影像报告文件
            </div>
            <div class="dwd-img-grid">
              <div v-for="f in workorder.imageReportFiles" :key="f.fileId" class="dwd-img-card">
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
                <el-button link class="dwd-img-card__dl" @click="handleDownloadFile(f.downloadUrl ?? '', f.fileUrl, f.fileName)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="!workorder.imageDataFiles?.length && !workorder.imageReportFiles?.length" class="dwd-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>暂无影像文件</span>
          </div>
        </section>

        <!-- 03 打印数据包 -->
        <section class="form-section" v-if="workorder.packageList?.length">
          <div class="form-section-header">
            <span class="form-section-num">03</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">打印数据包</span>
            <span class="form-section-count">{{ workorder.packageList.length }}</span>
          </div>
          <div class="dwd-pkg-list">
            <div v-for="(pkg, idx) in workorder.packageList" :key="pkg.id" class="dwd-pkg-card"
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
                    <el-tag size="small" effect="plain" v-if="packageProductionType(workorder, pkg)">
                      {{ productionTypeNames[packageProductionType(workorder, pkg)!] }}
                    </el-tag>
                    <el-tag size="small" effect="light" v-if="usesProcessingApplication(workorder, pkg)">
                      加工申请单
                    </el-tag>
                    <el-tag size="small" effect="light" v-if="canViewMedicalDocuments && pkg.latestInstruction">指令单</el-tag>
                    <el-tag size="small" type="primary" effect="light" v-if="canViewMedicalDocuments && pkg.latestDrawings?.length">图纸</el-tag>
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

                <div v-if="usesProcessingApplication(workorder, pkg) && pkg.processingApplication && userInfo.hasPermission('design:ProcessingApplicationView')" class="dwd-pkg-versions">
                  <processing-document-file :file="pkg.processingApplication" :revision="pkg.processingApplication.revision" />
                </div>
                <!-- 版本信息 -->
                <div v-if="canViewMedicalDocuments && (pkg.latestInstruction || pkg.latestDrawings?.length)" class="dwd-pkg-versions">
                  <PackageDocumentCard v-if="pkg.latestInstruction" label="指令单" :confirmed="pkg.latestInstruction.isConfirmed === 1">
                    <div v-if="pkg.latestInstruction.templateFileUrl" class="dwd-pkg-ver__item">
                      <span>版本 {{ pkg.latestInstruction.version }}</span>
                      <el-button link size="small"
                        @click="handleDownloadFile(pkg.latestInstruction!.templateDownloadUrl ?? '', pkg.latestInstruction!.templateFileUrl, `指令单模板_v${pkg.latestInstruction!.version}.${getExt(pkg.latestInstruction!.templateFileUrl)}`)">
                        <PackageDownloadIcon />
                      </el-button>
                    </div>
                    <div v-if="pkg.latestInstruction.revisedFileUrl" class="dwd-pkg-ver__item">
                      <span>修订版</span>
                      <el-button link size="small"
                        @click="handleDownloadFile(pkg.latestInstruction!.revisedDownloadUrl ?? '', pkg.latestInstruction!.revisedFileUrl, `指令单修订版.${getExt(pkg.latestInstruction!.revisedFileUrl)}`)">
                        <PackageDownloadIcon />
                      </el-button>
                    </div>
                  </PackageDocumentCard>
                  <PackageDocumentCard v-for="drawing in pkg.latestDrawings" :key="drawing.id" label="图纸" drawing
                    :category="drawing.productCategory === '17.1' ? '模型类' : '导板类'" :confirmed="drawing.isConfirmed === 1">
                    <div v-if="drawing.templateFileUrl" class="dwd-pkg-ver__item">
                      <span>版本 {{ drawing.version }}</span>
                      <el-button link size="small"
                        @click="handleDownloadFile(drawing.templateDownloadUrl ?? '', drawing.templateFileUrl, `图纸模板_v${drawing.version}.${getExt(drawing.templateFileUrl)}`)">
                        <PackageDownloadIcon />
                      </el-button>
                    </div>
                    <div v-if="drawing.revisedFileUrl" class="dwd-pkg-ver__item">
                      <span>修订版</span>
                      <el-button link size="small"
                        @click="handleDownloadFile(drawing.revisedDownloadUrl ?? '', drawing.revisedFileUrl, `图纸修订版.${getExt(drawing.revisedFileUrl)}`)">
                        <PackageDownloadIcon />
                      </el-button>
                    </div>
                  </PackageDocumentCard>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!workorder.packageList?.length" class="dwd-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span>暂无数据包</span>
          </div>
        </section>

        <!-- 04 模型 & 报告 -->
        <section class="form-section form-section--alt" v-if="workorder.modelList?.length || workorder.reports?.length">
          <div class="form-section-header">
            <span class="form-section-num">04</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">模型 & 报告</span>
            <span class="form-section-count">{{ (workorder.modelList?.length || 0) + (workorder.reports?.length || 0)
            }}</span>
          </div>

          <!-- 可视化模型 -->
          <div v-if="workorder.modelList?.length" class="dwd-model-zone">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              可视化模型
            </div>
            <div class="dwd-img-grid">
              <div v-for="m in workorder.modelList" :key="m.id" class="dwd-img-card">
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
          <div v-if="workorder.reports?.length" class="dwd-model-zone" style="margin-top:10px">
            <div class="dwd-img-zone__label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              设计报告
            </div>
            <div class="dwd-img-grid">
              <div v-for="report in workorder.reports" :key="report.id" class="dwd-img-card">
                <div class="dwd-img-card__thumb dwd-img-card__thumb--doc">
                  <div class="dwd-img-card__thumb-empty" style="color:#10b981">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
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

          <div v-if="!workorder.modelList?.length && !workorder.reports?.length" class="dwd-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span>暂无模型或报告</span>
          </div>
        </section>

        <!-- 05 设计师备注 -->
        <section class="form-section">
          <div class="form-section-header">
            <span class="form-section-num">05</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">设计师备注</span>
          </div>
          <div class="dwd-remark-wrap">
            <el-input
              v-model="designerRemark"
              type="textarea"
              :rows="4"
              :maxlength="2000"
              show-word-limit
              placeholder="请输入设计师备注，最多 2000 字符"
              :class="{ 'is-error': remarkError }"
              @blur="remarkError = !designerRemark.trim()"
            />
            <p v-if="remarkError" class="dwd-remark-error">设计师备注为必填项</p>
            <div class="dwd-remark-footer" v-if="isRemarkChanged">
              <el-button type="primary" size="small" :loading="remarkSaving" @click="handleSaveRemark">
                保存备注
              </el-button>
            </div>
          </div>
        </section>

      </main>
    </div>
    <div v-else-if="loading" class="dwd-loading">
      <el-icon class="is-loading" :size="24" color="#818cf8">
        <Loading />
      </el-icon>
    </div>
    <template #footer-btn>
      <div class="maad-actions">
        <!-- <div v-if="workorder?.status === 2040" class="maad-action-btn maad-action-approve"
          :class="{ 'is-loading': approveLoading }" @click="handleApprove" v-permission="'design:Approve'">
          <span class="maad-action-label">审核通过</span>
        </div>
        <div v-if="workorder?.status === 2040" class="maad-action-btn maad-action-reject"
          :class="{ 'is-loading': rejectLoading }" @click="handleReject" v-permission="'design:Reject'">
          <span class="maad-action-label">审核驳回</span>
        </div>
        <div class="maad-action-btn maad-action-submit" v-if="workorder?.submitCheck.canSubmit && workorder?.status !== 2040" :class="{ 'is-loading': submitLoading }" @click="handleSubmitCheck" v-permission="'design:SubmitCheck'">
          <span class="maad-action-label">提交设计审核</span>
        </div> -->
        <el-alert v-if="completionIssue" type="error" :title="completionIssue" :closable="false" />
        <el-button type="primary" @click="handleCompleteDesign" :loading="completingDesign"
          v-if="workorder?.status === 2020" v-permission="'design:Complete'">完成设计</el-button>
        <el-button type="primary" @click="handleStartDesign" :loading="startingDesign"
          v-if="workorder?.status === 2010" v-permission="'design:Start'">开始设计</el-button>
        <el-button @click="visible = false" class="btn btn-ghost">关闭</el-button>
      </div>
    </template>
  </dialog-modal>

  <!-- 分配历史弹窗 -->
  <dialog-modal v-model="historyVisible" title="分配历史" width="680px" @modal-close="historyVisible = false">
    <div class="dwd-history-body">
      <!-- 加载态 -->
      <div v-if="historyLoading" class="dwd-history-state">
        <div class="dwd-history-spinner"></div>
        <span>加载中…</span>
      </div>

      <!-- 空态 -->
      <div v-else-if="!historyList.length" class="dwd-history-state dwd-history-state--empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <p>暂无分配记录</p>
      </div>

      <!-- 时间线列表 -->
      <div v-else class="dwd-history-timeline">
        <div v-for="item in historyList" :key="item.id" class="dwd-history-item">
          <div class="dwd-history-item__dot"></div>
          <div class="dwd-history-item__card">
            <div class="dwd-history-item__header">
              <span class="dwd-history-item__time">{{ dayjs(item.assignTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              <span class="dwd-history-item__type">{{ item.assignType || '分配' }}</span>
            </div>
            <div class="dwd-history-item__body">
              <span class="dwd-history-item__name dwd-history-item__name--out">
                {{ item.oldDesignerName || '—' }}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
              <span class="dwd-history-item__name dwd-history-item__name--in">
                {{ item.newDesignerName || '—' }}
              </span>
            </div>
            <div class="dwd-history-item__footer">
              <span v-if="item.operatorName">操作人：{{ item.operatorName }}</span>
              <span v-if="item.remark" class="dwd-history-item__remark">{{ item.remark }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer-btn>
      <el-button class="btn-ghost" @click="historyVisible = false">关闭</el-button>
    </template>
  </dialog-modal>
 
</template>

<script setup lang="ts">
import UdiBadge from '@/components/UdiBadge.vue'
import { computed, ref, watch } from 'vue'
import PackageDownloadIcon from './PackageDownloadIcon.vue'
import PackageDocumentCard from './PackageDocumentCard.vue'
import ProcessingDocumentFile from './processingDocumentFile.vue'
import dialogModal from '@/components/dialogModal.vue'
import { ElTag, ElIcon, ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheckFilled, Loading,
  Document,
} from '@element-plus/icons-vue'
import { designWorkorderDetail, designWorkorderStart, designWorkorderCompleteDesign, designWorkorderAuditPass, designWorkorderAuditReject, designWorkorderSubmitDesign, assignmentHistory, designWorkorderSaveDesignerRemark, type DesignWorkorderDetailVO, type AssignmentHistoryItem } from '@/api/design'
import { Session } from '@/utils/storage'
import { useUserInfo } from '@/stores/userInfo'
import { isLocalPhysical, packageProductionType, productionTypeNames, usesProcessingApplication } from '../productionBranch'
import dayjs from 'dayjs'

defineOptions({ name: 'DesignWorkorderDetailDialog' })

const props = defineProps<{
  modelValue: boolean
  workorderId: number | null
  refreshVersion: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
  (e: 'refresh'): void
}>()
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const userInfo = useUserInfo()
const loading = ref(false)
const startingDesign = ref(false)
const completingDesign = ref(false)
const submitLoading = ref(false)
const approveLoading = ref(false)
const rejectLoading = ref(false)
const workorder = ref<DesignWorkorderDetailVO | null>(null)
const canViewMedicalDocuments = computed(() => workorder.value && (!isLocalPhysical(workorder.value) || userInfo.hasPermission('design:DocumentPreview')))

// ── 设计师备注 ──────────────────────────────────────────────────
const designerRemark = ref('')
const designerRemarkOriginal = ref('')
const remarkSaving = ref(false)
const remarkError = ref(false)

const isRemarkChanged = computed(() => designerRemark.value !== designerRemarkOriginal.value)

const loadRemark = () => {
  designerRemark.value = workorder.value?.designerRemark || ''
  designerRemarkOriginal.value = designerRemark.value
  remarkError.value = false
}

const handleSaveRemark = async () => {
  if (!workorder.value) return
  if (!designerRemark.value.trim()) {
    remarkError.value = true
    return
  }
  const orderId = workorder.value.id
  const submitted = designerRemark.value
  remarkSaving.value = true
  try {
    await designWorkorderSaveDesignerRemark(orderId, submitted.trim())
    if (workorder.value?.id !== orderId) return
    designerRemarkOriginal.value = submitted.trim()
    if (designerRemark.value === submitted) designerRemark.value = submitted.trim()
    ElMessage.success('备注保存成功')
  } catch {
  } finally {
    remarkSaving.value = false
  }
}

const historyVisible = ref(false)
const historyLoading = ref(false)
const historyList = ref<AssignmentHistoryItem[]>([])

const openHistory = async () => {
  if (!props.workorderId) return
  historyVisible.value = true
  historyList.value = []
  historyLoading.value = true
  try {
    const res = await assignmentHistory(props.workorderId) as any
    historyList.value = res?.data || res || []
  } catch {
    ElMessage.error('加载分配历史失败')
  } finally {
    historyLoading.value = false
  }
}

const completeError = ref('')
const completionIssue = computed(() => completeError.value || (workorder.value?.status === 2020 && workorder.value.submitCheck?.blockReason) || '')
let detailRequest = 0
watch(() => [props.modelValue, props.workorderId, props.refreshVersion] as const, async ([val, id]) => {
  const ticket = ++detailRequest
  completeError.value = ''
  if (val && id) {
    loading.value = true
    if (workorder.value?.id !== id) workorder.value = null
    try {
      const res = await designWorkorderDetail(id)
      if (ticket !== detailRequest) return
      const keepRemark = workorder.value?.id === id && isRemarkChanged.value
      workorder.value = res
      if (!keepRemark) loadRemark()
    } catch {
      if (ticket === detailRequest) ElMessage.error('加载工单详情失败')
    } finally {
      if (ticket === detailRequest) loading.value = false
    }
  } else {
    workorder.value = null
  }
}, { immediate: true })
const subtitle = computed(() => workorder.value ? `订单号：${workorder.value.orderCode}` : '')

const handleStartDesign = async () => {
  if (!workorder.value) return
  try {
    startingDesign.value = true
    await designWorkorderStart(workorder.value.id, workorder.value.version)
    ElMessage.success('已进入设计阶段')
    visible.value = false
    emit('refresh')
  } catch {
  } finally {
    startingDesign.value = false
  }
}

const handleCompleteDesign = async () => {
  const ticket = detailRequest
  completeError.value = ''
  if (!workorder.value) return
  try {
    completingDesign.value = true
    await designWorkorderCompleteDesign(workorder.value.id, workorder.value.version)
    if (ticket !== detailRequest) return
    ElMessage.success('设计已完成')
    visible.value = false
    emit('refresh')
  } catch (failure) {
    if (ticket === detailRequest) completeError.value = failure instanceof Error ? failure.message : String(failure || '完成设计失败')
  } finally {
    completingDesign.value = false
  }
}

const handleSubmitCheck = async () => {
  if (!workorder.value) return
  try {
    submitLoading.value = true
    await designWorkorderSubmitDesign(workorder.value.id, workorder.value.version)
    ElMessage.success('已提交设计审核')
    emit('refresh')
    visible.value = false
  } catch (err: any) {
    // ElMessage.error(err.message || '提交失败')
  } finally {
    submitLoading.value = false
  }
}

const handleApprove = async () => {
  if (!workorder.value) return
  try {
    const { value } = await ElMessageBox.prompt(
      '如有审批意见请填写（选填）',
      '审核通过',
      {
        confirmButtonText: '确认通过',
        cancelButtonText: '取消',
        type: 'success',
        inputPlaceholder: '选填：可在此填写审批意见',
      }
    )
    approveLoading.value = true
    loading.value = true
    await designWorkorderAuditPass(workorder.value.id, workorder.value.version, value || undefined)
    ElMessage.success('审核通过')
    emit('refresh')
    visible.value = false
  } catch (err: any) {
    if (err !== 'cancel' && err !== 'close') {
      // ElMessage.error(err.message || '操作失败')
    }
  } finally {
    approveLoading.value = false
    rejectLoading.value = false
    loading.value = false
  }
}

const handleReject = async () => {
  if (!workorder.value) return
  try {
    const { value } = await ElMessageBox.prompt(
      `请填写工单「${workorder.value.orderCode}」的驳回原因（必填）`,
      '审核驳回',
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
    await designWorkorderAuditReject(workorder.value.id, workorder.value.version, value)
    ElMessage.success('已驳回')
    emit('refresh')
    visible.value = false
  } catch (err: any) {
    if (err !== 'cancel' && err !== 'close') {
      // ElMessage.error(err.message || '操作失败')
    }
  } finally {
    approveLoading.value = false
    rejectLoading.value = false
    loading.value = false
  }
}

// ── 文件下载 ──────────────────────────────────────────────────────
const handleDownloadFile = (downloadUrl: string, fileUrl: string, fileName: string) => {
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

// ── 复制订单号 ──────────────────────────────────────────────────────
const handleCopyOrderCode = async () => {
  if (!workorder.value?.orderCode) return
  const text = workorder.value.orderCode
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

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const getExt = (url: string): string => url.split('.').pop() || ''

</script>

<style scoped lang="scss">
@use '@/assets/style/dialogLeftRight.scss' as *;
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

  // Ambient glow behind avatar
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
}

.dwd-pt-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
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

  &.is-2010 {
    background: #64748b;
    box-shadow: 0 0 6px rgba(100, 116, 139, 0.4);
  }

  &.is-2020 {
    background: #f59e0b;
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
    animation: statusPulse 2s ease-in-out infinite;
  }

  &.is-2040 {
    background: #06b6d4;
    box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
    animation: statusPulse 2s ease-in-out infinite;
  }

  &.is-2060 {
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
    animation: statusPulse 1.5s ease-in-out infinite;
  }
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
  background: linear-gradient(to right, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.1), transparent);
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

// ── Delivery Dot ───────────────────────────────────────────────────────────────
.dwd-delivery-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
  transition: all 0.3s ease;

  &.is-active {
    background: #10b981;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    animation: statusPulse 2s ease-in-out infinite;
  }
}

.dwd-delivery-text {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

// ── Context Grid ──────────────────────────────────────────────────────────────
.dwd-ctx-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 14px;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.14s both;
}

.dwd-ctx-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 10px;
  border: 1px solid #e8edf5;
  background: #fff;
  transition: all 0.18s ease;
  overflow: hidden;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  &--accent {
    border-color: rgba(6, 182, 212, 0.25);
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);

    &:hover {
      border-color: rgba(6, 182, 212, 0.45);
      box-shadow: 0 2px 12px rgba(6, 182, 212, 0.12);
    }
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.dwd-ctx-cell__icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  color: #0891b2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    flex-shrink: 0;
  }

  &--accent {
    background: rgba(6, 182, 212, 0.12);
    box-shadow: inset 0 0 0 1px rgba(6, 182, 212, 0.15);
  }
}

.dwd-ctx-cell__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.dwd-ctx-cell__label {
  font-size: 9px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.dwd-ctx-cell__value {
  font-size: 11.5px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--accent {
    color: #0891b2;
    font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
    font-size: 11px;
    font-weight: 700;
  }
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

  &--postal {
    background: rgba(16, 185, 129, .08);
    border-color: rgba(16, 185, 129, .25);
    color: #059669;
  }

  &--delivery {
    background: rgba(6, 182, 212, .08);
    border-color: rgba(6, 182, 212, .25);
    color: #0891b2;
  }
}

.dwd-flag-addr {
  font-size: 10px;
  color: #64748b;
  padding: 4px 8px;
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 6px;
  line-height: 1.4;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #94a3b8;
  }
}

// ── Status Pill ────────────────────────────────────────────────────────────────
.dwd-sidebar__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px 4px 7px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  border: 1.5px solid;
  letter-spacing: 0.3px;
  width: fit-content;
  margin-bottom: 10px;

  &.is-status-2010 {
    background: rgba(100, 116, 139, .08);
    border-color: rgba(100, 116, 139, .3);
    color: #64748b;

    .dwd-sidebar__status-dot {
      background: #64748b;
    }
  }

  &.is-status-2020 {
    background: rgba(245, 158, 11, .08);
    border-color: rgba(245, 158, 11, .3);
    color: #d97706;

    .dwd-sidebar__status-dot {
      background: #f59e0b;
      box-shadow: 0 0 6px rgba(245, 158, 11, .6);
      animation: statusPulse 2s ease-in-out infinite;
    }
  }

  &.is-status-2040 {
    background: rgba(6, 182, 212, .08);
    border-color: rgba(6, 182, 212, .3);
    color: #0891b2;

    .dwd-sidebar__status-dot {
      background: #06b6d4;
      box-shadow: 0 0 8px rgba(6, 182, 212, .6);
      animation: statusPulse 2s ease-in-out infinite;
    }
  }

  &.is-status-2060 {
    background: rgba(239, 68, 68, .08);
    border-color: rgba(239, 68, 68, .3);
    color: #dc2626;

    .dwd-sidebar__status-dot {
      background: #ef4444;
      box-shadow: 0 0 6px rgba(239, 68, 68, .6);
    }
  }
}

.dwd-sidebar__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ── Reject Alert ───────────────────────────────────────────────────────────────
.dwd-reject-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(239, 68, 68, .05);
  border: 1px solid rgba(239, 68, 68, .15);
  border-radius: 10px;
  animation: sidebarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
}

.dwd-reject-icon {
  color: #ef4444;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

.dwd-reject-title {
  font-size: 10.5px;
  font-weight: 800;
  color: #dc2626;
  margin-bottom: 2px;
  letter-spacing: 0.3px;
}

.dwd-reject-msg {
  font-size: 11.5px;
  color: #475569;
  line-height: 1.5;
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
    border-color: #0891b2;
    box-shadow: 0 4px 16px rgba(8, 145, 178, 0.1);
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
  background: #0891b2;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
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
  width: 28px;
  flex-shrink: 0;
  padding-top: 1px;
}

.dwd-rebuild-req__text {
  font-size: 11.5px;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
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

.dwd-pkg-card__index {
  font-size: 22px;
  font-weight: 900;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  line-height: 1;
  flex-shrink: 0;
  padding-top: 2px;
  width: 28px;
  letter-spacing: -1px;
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

  .el-icon {
    display: flex;
  }
}

.dwd-pkg-versions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
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

// ── Loading ─────────────────────────────────────────────────────────────────────
.dwd-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
}

// ── Footer ──────────────────────────────────────────────────────────────────────
.maad-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.maad-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 9px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  user-select: none;

  &:active {
    transform: scale(0.97);
  }
}

.maad-action-approve {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;

  &:hover {
    background: #dcfce7;
    border-color: #86efac;
    box-shadow: 0 4px 12px rgba(34, 197, 94, .2);
    transform: translateY(-1px);
  }

  &.is-loading {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}
.maad-action-submit {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-8);;
  color: var(--el-color-primary);;

  &:hover {
    background: var(--el-color-primary-light-8);
    border-color: var(--el-color-primary-light-7);
    box-shadow: 0 4px 12px rgba(34, 197, 94, .2);
    transform: translateY(-1px);
  }

  &.is-loading {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.maad-action-reject {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;

  &:hover {
    background: #ffe4e6;
    border-color: #fda4af;
    box-shadow: 0 4px 12px rgba(244, 63, 94, .2);
    transform: translateY(-1px);
  }

  &.is-loading {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.maad-action-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.text-muted {
  color: #94a3b8;
}

// ─── Designer Row Inline History Button ────────────────────
.dwd-order-grid__value--inline-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dwd-history-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(30, 111, 217, 0.25);
  background: rgba(30, 111, 217, 0.06);
  color: #1e6fd9;
  font-size: 11px;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(30, 111, 217, 0.12);
    border-color: rgba(30, 111, 217, 0.4);
    box-shadow: 0 2px 8px rgba(30, 111, 217, 0.12);
  }
}

// ─── History Dialog ────────────────────────────────────────
.dwd-history-body {
  max-height: 520px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 9999px;
  }
}

.dwd-history-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: #94a3b8;
  font-size: 13px;
  font-family: 'SF Mono', monospace;

  &--empty {
    svg {
      opacity: 0.2;
    }

    p {
      margin: 0;
      color: #64748b;
    }
  }
}

.dwd-history-spinner {
  width: 26px;
  height: 26px;
  border: 2px solid rgba(30, 111, 217, 0.15);
  border-top-color: #1e6fd9;
  border-radius: 50%;
  animation: dwd-spin 0.75s linear infinite;
}

@keyframes dwd-spin {
  to {
    transform: rotate(360deg);
  }
}

.dwd-history-timeline {
  padding: 8px 0;
  position: relative;

  // 竖线
  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 20px;
    bottom: 20px;
    width: 1.5px;
    background: linear-gradient(to bottom, #e2e8f0, #f1f5f9);
  }
}

.dwd-history-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 0 0 20px;

  &:last-child {
    padding-bottom: 0;

    .dwd-history-item__dot {
      background: #22c55e;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);

      &::after {
        display: none;
      }
    }
  }
}

.dwd-history-item__dot {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #94a3b8;
  flex-shrink: 0;
  margin-top: 12px;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.15);
  z-index: 1;

  // 向下延伸线（除最后一个）
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 12px;
    width: 1px;
    height: calc(100% + 8px);
    background: #e2e8f0;
    transform: translateX(-50%);
  }
}

.dwd-history-item__card {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  min-width: 0;
}

.dwd-history-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dwd-history-item__time {
  font-size: 11px;
  font-family: 'SF Mono', monospace;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.dwd-history-item__type {
  font-size: 10px;
  font-family: 'SF Mono', monospace;
  font-weight: 700;
  color: #1e6fd9;
  background: rgba(30, 111, 217, 0.08);
  border: 1px solid rgba(30, 111, 217, 0.18);
  border-radius: 4px;
  padding: 1px 7px;
}

.dwd-history-item__body {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  svg {
    color: #94a3b8;
    flex-shrink: 0;
  }
}

.dwd-history-item__name {
  font-size: 13px;
  font-weight: 700;
  font-family: 'SF Mono', monospace;

  &--out {
    color: #64748b;
    text-decoration: line-through;
    text-decoration-color: #cbd5e1;
  }

  &--in {
    color: #1e293b;
  }
}

.dwd-history-item__footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  font-family: 'SF Mono', monospace;
  color: #94a3b8;

  span:first-child {
    background: #f1f5f9;
    border-radius: 4px;
    padding: 1px 6px;
  }
}

.dwd-history-item__remark {
  color: #f59e0b;
  font-style: italic;
}

// ── 设计师备注 ────────────────────────────────────────────────
.dwd-remark-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dwd-remark-error {
  margin: 0;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.4;
}

.dwd-remark-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.is-error .el-textarea__inner) {
  border-color: #f56c6c;
}

</style>
