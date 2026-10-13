<template>
  <dialog-modal v-model="visible" :title="dialogTitle" :subtitle="subtitle" :width="width" :show-footer="false"
    @modal-close="visible = false">
    <div class="dlr-root" v-if="!pkgLoading">
      <!-- 左右主布局 -->
      <!-- 左侧：数据包列表 -->
      <aside class="dlr-slidebar">
        <div class="dlr-slidebar__header">
          <span class="dlr-slidebar__num">01</span>
          <span class="dlr-slidebar__title">数据包</span>
          <span class="dlr-slidebar__count">{{ packageList.length }}</span>
          <button class="dlr-slidebar__refresh" @click="loadPackages" :loading="pkgLoading" title="刷新">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
        <div class="dlr-slidebar__list">
          <div v-if="packageList.length === 0 && !pkgLoading" class="dlr-slidebar__empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>暂无数据包</span>
            <span class="dlr-slidebar__empty-sub">请先上传打印文件包</span>
          </div>

          <div v-for="pkg in packageList" :key="pkg.id" class="pkg-item"
            :class="{ 'pkg-item--active': selectedPackage?.id === pkg.id }" @click="selectPackage(pkg)">
            <div class="pkg-item__header">
              <svg class="pkg-item__icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span class="pkg-item__name">{{ pkg.packageCode || `数据包 #${pkg.packageSeq}` }}</span>
              <span v-if="isCurrentAppendPackage(pkg)" class="pkg-item__append-badge">追加</span>
              <span class="pkg-item__badge">×{{ pkg.fileCount }}</span>
            </div>
            <!-- 数据包确认状态 -->
            <!-- <div class="pkg-item__status-wrap">
              <span
                class="pkg-item__status-tag"
                :class="pkgLatestConfirmedStatus(pkg) === 'confirmed' ? 'pkg-item__status-tag--confirmed' : 'pkg-item__status-tag--pending'"
              >
                {{ pkgLatestConfirmedStatus(pkg) === 'confirmed' ? '已确认' : '待确认' }}
              </span>
            </div> -->
            <div class="pkg-item__files">
              <span v-for="f in (pkg.files || []).slice(0, 3)" :key="f.id" class="pkg-item__tag">
                {{ f.fileName }}
              </span>
              <span v-if="(pkg.files || []).length > 3" class="pkg-item__more">
                +{{ (pkg.files || []).length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <!-- 右侧：指令单 / 图纸内容 -->
      <main class="dlr-main">
        <!-- 加载中（切换包时） -->
        <div class="ddpd-loading" v-if="tabLoading">
          <el-icon class="ddpd-loading__icon" :size="24">
            <Loading />
          </el-icon>
          <span>加载文档信息…</span>
        </div>
        <!-- 未选中数据包时的空状态 -->
        <div class="ddpd-empty-panel" v-if="!selectedPackage">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.3">
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span class="ddpd-empty-panel__title">请从左侧选择一个数据包</span>
          <span class="ddpd-empty-panel__sub">查看该包对应的指令单和图纸</span>
        </div>
         <!-- 空状态（该包无文档） -->
         <div class="ddpd-empty" v-else-if="!currentData && activeTab === 'instruction' && !pkgLatestInstr">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.3">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <span class="ddpd-empty__title">该数据包暂无指令单文件</span>
          <span class="ddpd-empty__sub">请先填写打印信息后自动生成</span>
        </div>
      
        <!-- 文档内容 -->
        <template v-else>
          <!-- 标签切换：指令单 / 图纸 -->
          <div class="ddpd-tabs">
            <button class="ddpd-tab" :class="{ 'ddpd-tab--active': activeTab === 'instruction' }"
              @click="switchTab('instruction')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              指令单
              <span class="ddpd-tab__badge" v-if="currentData && activeTab === 'instruction'">{{ currentData.version
                }}</span>
              <span class="ddpd-tab__badge ddpd-tab__badge--amber"
                v-else-if="pkgLatestInstr && activeTab === 'instruction'">{{ pkgLatestInstr.version }}</span>
            </button>
            <button class="ddpd-tab" :class="{ 'ddpd-tab--active': activeTab === 'drawing' }"
              @click="switchTab('drawing')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              图纸
              <span class="ddpd-tab__badge ddpd-tab__badge--amber" v-if="drawData">{{ drawData.version }}</span>
            </button>
          </div>

          <!-- 图纸分类切换（仅在图纸tab显示） -->
          <div class="draw-category-switch" v-if="activeTab === 'drawing'">
            <button v-for="cat in drawCategoryOptions" :key="cat.value" class="draw-category-btn"
              :class="{ 'draw-category-btn--active': currentDrawCategory === cat.value }"
              @click="switchDrawCategory(cat.value)">
              {{ cat.label }}
            </button>
          </div>

          <!-- 图表纸内容区 -->
          <template v-if="activeTab === 'instruction' || drawData">
            <!-- 指令单加载中 -->
            <div v-if="activeTab === 'instruction' && instrLoading" class="ddpd-loading">
              <el-icon class="ddpd-loading__icon" :size="24">
                <Loading />
              </el-icon>
              <span>加载指令单…</span>
            </div>
            <!-- 指令单内容 -->
            <template v-else-if="activeTab === 'instruction'">
              <!-- 当前版本信息卡 -->
              <div class="ddpd-version-card"
                :class="activeTab === 'instruction' ? 'ddpd-version-card--instr' : 'ddpd-version-card--draw'"
                style="position:relative">
                <!-- 刷新遮罩 -->
                <div v-if="instrRefreshing" class="ddpd-version-card__refreshing-overlay">
                  <el-icon class="ddpd-version-card__refreshing-icon" :size="20">
                    <Loading />
                  </el-icon>
                  <span>刷新中…</span>
                </div>
                <div class="ddpd-version-card__header">
                  <div class="ddpd-version-card__badge">
                    <span class="ddpd-version-card__badge-label">{{ activeTab === 'instruction' ? '指令单' : '图纸'
                      }}</span>
                    <span class="ddpd-version-card__badge-version">
                      {{ (activeTab === 'instruction' ? pkgLatestInstr?.version : drawData?.version) || '—' }}
                    </span>
                  </div>
                  <span class="ddpd-version-card__status"
                    :class="(activeTab === 'instruction' ? pkgLatestInstr?.isConfirmed : drawData?.isConfirmed) ? 'ddpd-version-card__status--confirmed' : 'ddpd-version-card__status--pending'">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <polyline
                        v-if="(activeTab === 'instruction' ? pkgLatestInstr?.isConfirmed : drawData?.isConfirmed)"
                        points="20 6 9 17 4 12" />
                      <circle v-else cx="12" cy="12" r="10" />
                      <line
                        v-if="!(activeTab === 'instruction' ? pkgLatestInstr?.isConfirmed : drawData?.isConfirmed)"
                        x1="12" y1="8" x2="12" y2="12" />
                      <line
                        v-if="!(activeTab === 'instruction' ? pkgLatestInstr?.isConfirmed : drawData?.isConfirmed)"
                        x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {{ (activeTab === 'instruction' ? pkgLatestInstr?.isConfirmed : drawData?.isConfirmed) ? '已确认' :
                      '待确认' }}
                  </span>
                </div>

                <div class="ddpd-version-card__meta">
                  <div class="ddpd-version-card__meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>生成时间</span>
                    <strong>{{ (activeTab === 'instruction' ? dayjs(pkgLatestInstr?.generateTime).format('YYYY-MM-DD HH: mm: ss') : dayjs(drawData?.generateTime).format('YYYY - MM - DD HH: mm: ss'))
                      || '—' }}</strong>
                  </div>
                  <div class="ddpd-version-card__meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>文件ID</span>
                    <strong class="ddpd-version-card__file-id">
                      {{ (activeTab === 'instruction' ? pkgLatestInstr?.fileId : drawData?.fileId) || '—' }}
                    </strong>
                  </div>
                </div>

                <div class="ddpd-version-card__actions">
                  <!-- 指令单上传区域 -->
                  <div class="ddpd-version-card__upload" v-if="activeTab === 'instruction'">
                    <input ref="uploadInstrInputRef" type="file" accept=".xlsx" style="display:none"
                      @change="handleInstrUploadFileChange" />
                    <button class="ddpd-action-btn ddpd-action-btn--upload" @click="triggerInstrUpload"
                      :disabled="uploadingFile || !canEditDocuments">
                      <el-icon v-if="uploadingFile" class="ddpd-action-btn__spin" :size="13">
                        <Loading />
                      </el-icon>
                      <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {{ uploadingFile ? '上传中…' : '上传修订版' }}
                    </button>
                    <span class="ddpd-version-card__upload-hint" v-if="!pkgLatestInstr">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      先生成指令单后再上传修订版
                    </span>
                    <span class="ddpd-version-card__upload-hint ddpd-version-card__upload-hint--success"
                      v-else-if="lastUploadedInstrFileName">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      已上传：{{ lastUploadedInstrFileName }}
                    </span>
                  </div>

                  <button class="ddpd-action-btn ddpd-action-btn--preview" @click="handlePreview"
                    :disabled="!previewUrl">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    在线预览
                  </button>
                  <button class="ddpd-action-btn ddpd-action-btn--download" @click="handleDownload"
                    :disabled="downloading">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {{ downloading ? '下载中…' : '下载文件' }}
                  </button>
                </div>
              </div>
            </template>

            <!-- 图纸加载中 -->
            <div v-if="activeTab === 'drawing' && drawLoading" class="ddpd-loading">
              <el-icon class="ddpd-loading__icon" :size="24">
                <Loading />
              </el-icon>
              <span>加载图纸…</span>
            </div>

            <!-- 图纸空状态（当前分类无数据且非加载中） -->
            <div v-else-if="activeTab === 'drawing' && !drawData" class="ddpd-drawing-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>暂无{{ getCurrentCategoryLabel() }}图纸</span>
            </div>

            <!-- 图纸内容 -->
            <div v-else-if="activeTab === 'drawing' && drawData" class="ddpd-drawing-content">
              <div class="ddpd-version-card ddpd-version-card--draw" style="position:relative">
                <!-- 刷新遮罩 -->
                <div v-if="drawRefreshing" class="ddpd-version-card__refreshing-overlay">
                  <el-icon class="ddpd-version-card__refreshing-icon" :size="20">
                    <Loading />
                  </el-icon>
                  <span>刷新中…</span>
                </div>
                <div class="ddpd-version-card__header">
                  <div class="ddpd-version-card__badge">
                    <span class="ddpd-version-card__badge-label">图纸</span>
                    <span class="ddpd-version-card__badge-version">{{ drawData?.version || '—' }}</span>
                  </div>
                  <span class="ddpd-version-card__status"
                    :class="drawData?.isConfirmed ? 'ddpd-version-card__status--confirmed' : 'ddpd-version-card__status--pending'">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <polyline v-if="drawData?.isConfirmed" points="20 6 9 17 4 12" />
                      <circle v-else cx="12" cy="12" r="10" />
                      <line v-if="!drawData?.isConfirmed" x1="12" y1="8" x2="12" y2="12" />
                      <line v-if="!drawData?.isConfirmed" x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {{ drawData?.isConfirmed ? '已确认' : '待确认' }}
                  </span>
                </div>

                <div class="ddpd-version-card__meta">
                  <div class="ddpd-version-card__meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>生成时间</span>
                    <strong>{{ dayjs(drawData?.generateTime).format('YYYY-MM-DD HH:mm:ss') || '—' }}</strong>
                  </div>
                  <div class="ddpd-version-card__meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>文件ID</span>
                    <strong class="ddpd-version-card__file-id">{{ drawData?.fileId || '—' }}</strong>
                  </div>
                </div>

                <div class="ddpd-version-card__actions">
                  <div class="ddpd-version-card__upload">
                    <input ref="uploadDrawInputRef" type="file" accept=".xlsx" style="display:none"
                      @change="handleDrawUploadFileChange" />
                    <button class="ddpd-action-btn ddpd-action-btn--upload" @click="triggerDrawUpload"
                      :disabled="uploadingDrawFile || !canEditDocuments">
                      <el-icon v-if="uploadingDrawFile" class="ddpd-action-btn__spin" :size="13">
                        <Loading />
                      </el-icon>
                      <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {{ uploadingDrawFile ? '上传中…' : '上传修订版' }}
                    </button>
                    <span class="ddpd-version-card__upload-hint" v-if="!drawData">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      先生成图纸后再上传修订版
                    </span>
                    <span class="ddpd-version-card__upload-hint ddpd-version-card__upload-hint--success"
                      v-else-if="lastUploadedDrawFileName">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      已上传：{{ lastUploadedDrawFileName }}
                    </span>
                  </div>

                  <button class="ddpd-action-btn ddpd-action-btn--preview" @click="handlePreview"
                    :disabled="!previewUrl">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    在线预览
                  </button>
                  <button class="ddpd-action-btn ddpd-action-btn--download" @click="handleDownload"
                    :disabled="downloading">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {{ downloading ? '下载中…' : '下载文件' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 指令单 / 图纸 共用版本历史 -->
            <div class="ddpd-history" :class="{ 'ddpd-history--expanded': historyExpanded }"
              v-if="activeTab === 'instruction' ? (pkgLatestInstr || instrLoading || instrHistory.length > 0) : (drawData || drawLoading || drawHistory.length > 0)">
              <button class="ddpd-history__toggle" @click="historyExpanded = !historyExpanded">
                <div class="ddpd-history__toggle-left">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  版本历史
                  <span class="ddpd-history__count">{{ historyList.length }}</span>
                  <span class="ddpd-history__confirmed-hint" v-if="confirmedCount > 0">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {{ confirmedCount }} 个已确认
                  </span>
                </div>
                <svg class="ddpd-history__chevron" :class="{ 'ddpd-history__chevron--up': historyExpanded }"
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div class="ddpd-history__list" v-show="historyExpanded">
                <div v-if="historyLoading" class="ddpd-history__loading">
                  <el-icon :size="16" class="ddpd-history__loading-icon">
                    <Loading />
                  </el-icon>
                  加载历史版本…
                </div>
                <div v-else-if="historyList.length === 0" class="ddpd-history__empty">
                  暂无历史版本
                </div>
                <div v-else class="ddpd-history__items">
                  <div v-for="(item, idx) in historyList" :key="item.id" class="ddpd-history-item"
                    :class="{ 'ddpd-history-item--current': item.id === currentDocId, 'ddpd-history-item--confirmed': item.isConfirmed }"
                    :style="{ animationDelay: `${idx * 0.04}s` }">
                    <div class="ddpd-history-item__version">
                      <span class="ddpd-history-item__ver-text">{{ item.version }}</span>
                      <span class="ddpd-history-item__current-tag" v-if="item.id === currentDocId">当前</span>
                      <span class="ddpd-history-item__confirmed-tag" v-if="item.isConfirmed">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        已确认
                      </span>
                    </div>
                    <div class="ddpd-history-item__time">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {{ dayjs(item.generateTime || item.revisedUploadTime).format('YYYY-MM-DD HH:mm:ss') || '—' }}
                    </div>
                    <div class="ddpd-history-item__actions">
                      <button class="ddpd-history-item__btn" @click="handleHistoryPreview(item)" title="预览">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button class="ddpd-history-item__btn" @click="handleHistoryDownload(item)" title="下载">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </main>
    </div>
    <!-- 全局加载 -->
    <div class="ddpd-loading-global" v-else>
      <el-icon class="ddpd-loading-global__icon" :size="28">
        <Loading />
      </el-icon>
      <span>加载文档信息…</span>
    </div>
  </dialog-modal>

  <!-- xlsx 内嵌预览弹窗 -->
  <xlsx-preview-dialog v-model="showXlsxPreview" :file-url="xlsxPreviewUrl" :file-name="xlsxPreviewFileName"
    :file-type="xlsxPreviewFileType" :order-id="props.orderId" :package-id="xlsxPreviewPackageId"
    :file-id="xlsxPreviewFileId" :product-category="xlsxPreviewProductCategory" :confirmed="xlsxPreviewConfirmed"
    :batch-id="isCurrentAppendPackage(selectedPackage) ? props.batchId : null"
    :can-edit="canEditDocuments"
    @confirm-success="onXlsxConfirmSuccess" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import xlsxPreviewDialog from './xlsxPreviewDialog.vue'
import {
  designPackageList,
  designInstructionPreviewUrl,
  designDrawingPreviewUrl,
  designInstructionVersions,
  designDrawingVersions,
  designInstructionDownload,
  designDrawingDownload,
  type PackageListItem,
} from '@/api/design'
import { Session } from '@/utils/storage'
import dayjs from 'dayjs'
import { getDictOptions } from '@/utils/dict'

// ============================================================
// 类型定义
// ============================================================

interface DocVersionItem {
  templateFileId: string | null
  id: number
  version: string
  versionSeq: number
  fileId: string | null
  templateFileUrl: string | null
  templateDownloadUrl?: string | null
  revisedFileId: string | null
  revisedFileUrl: string | null
  generateTime: string | null
  revisedUploadTime: string | null
  isConfirmed: number
  confirmTime: string | null
}

// ============================================================
// Props / Emits
// ============================================================

const props = defineProps<{
  modelValue: boolean
  orderId: number | null
  orderCode?: string
  batchId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'refresh'): void
}>()

// ============================================================
// 弹框控制
// ============================================================

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const dialogTitle = '图纸和指令单'
const subtitle = computed(() => props.orderCode ? `订单号：${props.orderCode}` : '')
const width = '960px'

// ============================================================
// 状态
// ============================================================

const loading = ref(false)
const pkgLoading = ref(false)
const instrLoading = ref(false)
const drawLoading = ref(false)
const instrRefreshing = ref(false)
const drawRefreshing = ref(false)
const tabLoading = ref(false)
const activeTab = ref<'instruction' | 'drawing'>('instruction')
const historyExpanded = ref(false)
const historyLoading = ref(false)
const generating = ref(false)
const downloading = ref(false)
const uploadingFile = ref(false)
const uploadingDrawFile = ref(false)
const uploadInstrInputRef = ref<HTMLInputElement | null>(null)
const uploadDrawInputRef = ref<HTMLInputElement | null>(null)
const lastUploadedInstrFileName = ref('')
const lastUploadedDrawFileName = ref('')

// 数据包列表
const packageList = ref<PackageListItem[]>([])

// 选中的数据包
const selectedPackage = ref<PackageListItem | null>(null)

// 当前包最新的指令单
const pkgLatestInstr = ref<DocVersionItem | null>(null)

// 图纸分类相关
const drawCategoryOptions = ref<{ label: string; value: string }[]>([])
const currentDrawCategory = ref<string>('17.1')

// 获取当前分类的显示名称
const getCurrentCategoryLabel = () => {
  const found = drawCategoryOptions.value.find(c => c.value === currentDrawCategory.value)
  return found?.label || ''
}

// 图纸数据（不区分模型/导板，统一赋值给同一个对象）
const drawData = ref<DocVersionItem | null>(null)

// 图纸版本历史
const drawHistory = ref<DocVersionItem[]>([])

// 指令单版本历史
const instrHistory = ref<DocVersionItem[]>([])

// xlsx 预览弹窗
const showXlsxPreview = ref(false)
const xlsxPreviewUrl = ref<string | null>(null)
const xlsxPreviewFileName = ref('')
const xlsxPreviewFileType = ref<'drawing' | 'instruction'>('instruction')
const xlsxPreviewFileId = ref<number | undefined>(undefined)
const xlsxPreviewConfirmed = ref(false)
const xlsxPreviewProductCategory = ref<string | undefined>(undefined)
const xlsxPreviewPackageId = computed(() => selectedPackage.value?.id ?? undefined)

// ============================================================
// 计算属性
// ============================================================

// 当前图纸数据（根据 activeTab 决定用哪个）
const currentData = computed(() =>
  activeTab.value === 'instruction' ? pkgLatestInstr.value : drawData.value
)

const isCurrentAppendPackage = (pkg: PackageListItem | null | undefined) =>
  Boolean(props.batchId && pkg?.batchId && Number(pkg.batchId) === Number(props.batchId))

const canEditDocuments = computed(() => {
  if (!selectedPackage.value) return false
  // 追加模式下只有当前追加批次允许上传修订版，历史数据包只读。
  if (props.batchId && !isCurrentAppendPackage(selectedPackage.value)) return false
  return selectedPackage.value.canEditDocuments !== false
})

const historyList = computed(() =>
  activeTab.value === 'instruction' ? instrHistory.value : drawHistory.value
)

const confirmedCount = computed(() =>
  historyList.value.filter(i => i.isConfirmed === 1).length
)

// 当前文档 ID（用于历史列表中高亮"当前"版本）
const currentDocId = computed(() =>
  activeTab.value === 'instruction' ? pkgLatestInstr.value?.id : drawData.value?.id
)

/**
 * 获取指定数据包的确认状态
 * 优先取 latestInstruction/latestDrawings（来自数据包列表接口）
 * 若为空则回退到右侧版本历史中的最新记录
 */
const pkgLatestConfirmedStatus = (pkg: PackageListItem): 'confirmed' | 'pending' => {
  const hasLatestInstr = pkg.latestInstruction != null
  const hasLatestDraws = pkg.latestDrawings?.length
  if (hasLatestInstr || hasLatestDraws) {
    const instrConfirmed = hasLatestInstr && pkg.latestInstruction!.isConfirmed === 1
    const drawAllConfirmed = pkg.latestDrawings.every(d => d.isConfirmed === 1)
    return instrConfirmed && drawAllConfirmed ? 'confirmed' : 'pending'
  }
  const latestInstrConfirmed = instrHistory.value[0]?.isConfirmed === 1
  const latestDrawConfirmed = drawHistory.value[0]?.isConfirmed === 1
  return latestInstrConfirmed && latestDrawConfirmed ? 'confirmed' : 'pending'
}

const selectDefaultPackage = () => {
  const pendingPackages = packageList.value.filter(pkg => pkgLatestConfirmedStatus(pkg) === 'pending')
  // 优先处理原设计数据包；原数据包均已确认时，再处理追加数据包。
  return pendingPackages.find(pkg => !pkg.batchId) || pendingPackages[0] || packageList.value[0]
}

const previewUrl = computed(() => {
  if (activeTab.value === 'instruction') {
    const d = pkgLatestInstr.value
    if (!d) return null
    return d.revisedFileUrl || d.templateFileUrl || null
  } else {
    const d = drawData.value
    if (!d) return null
    return d.revisedFileUrl || d.templateFileUrl || null
  }
})

const downloadFileId = computed(() => {
  if (activeTab.value === 'instruction') {
    const d = pkgLatestInstr.value
    if (!d) return null
    return d.revisedFileId || d.fileId || null
  } else {
    const d = drawData.value
    if (!d) return null
    return d.revisedFileId || d.fileId || null
  }
})

// ============================================================
// 数据加载
// ============================================================

const loadPackages = async () => {
  await loadPackageList()
  if (packageList.value.length > 0 && !selectedPackage.value) {
    await selectPackage(selectDefaultPackage()!)
  }
}

const loadPackageList = async () => {
  if (!props.orderId) return
  pkgLoading.value = true
  try {
    // 追加模式也需要展示历史包，历史包由后端能力字段控制为只读。
    const res = await designPackageList(props.orderId)
    packageList.value = res ?? []
  } catch {
    packageList.value = []
  } finally {
    pkgLoading.value = false
  }
}

const loadInstructionData = async (pkg: PackageListItem) => {
  if (!props.orderId) return
  try {
    const instrRes = await designInstructionPreviewUrl(props.orderId!, pkg.id, isCurrentAppendPackage(pkg) ? props.batchId : null).catch(() => null)
    return instrRes?.data ?? instrRes ?? null
  } catch {
    return null
  }
}

// ============================================================
// 图纸数据加载
// ============================================================

const loadDrawingData = async (pkg: PackageListItem): Promise<DocVersionItem | null> => {
  if (!props.orderId) return null
  try {
    const res = await designDrawingPreviewUrl(props.orderId!, pkg.id, currentDrawCategory.value, isCurrentAppendPackage(pkg) ? props.batchId : null).catch(() => null)
    return (res?.data ?? res ?? null) as DocVersionItem | null
  } catch {
    return null
  }
}

const loadDrawingHistory = async (pkg: PackageListItem): Promise<DocVersionItem[]> => {
  if (!props.orderId) return []
  try {
    const res = await designDrawingVersions(props.orderId!, pkg.id, currentDrawCategory.value, isCurrentAppendPackage(pkg) ? props.batchId : null).catch(() => null)
    const data = (res?.data ?? res ?? []) as DocVersionItem[]
    drawHistory.value = data
    return data
  } catch {
    drawHistory.value = []
    return []
  }
}

const loadInstructionHistory = async (pkg: PackageListItem): Promise<DocVersionItem[]> => {
  if (!props.orderId) return []
  try {
    const instrRes = await designInstructionVersions(props.orderId, pkg.id, isCurrentAppendPackage(pkg) ? props.batchId : null).catch(() => null)
    const data = (instrRes?.data ?? instrRes ?? []) as DocVersionItem[]
    instrHistory.value = data
    return data
  } catch {
    instrHistory.value = []
    return []
  }
}

// ============================================================
// 图纸分类切换
// ============================================================

const switchDrawCategory = async (category: string) => {
  if (currentDrawCategory.value === category) return
  currentDrawCategory.value = category
  historyExpanded.value = false
  if (!selectedPackage.value) return
  drawLoading.value = true
  historyLoading.value = true
  try {
    const data = await loadDrawingData(selectedPackage.value)
    drawData.value = data
    if (data) {
      await loadDrawingHistory(selectedPackage.value)
    } else {
      drawHistory.value = []
    }
  } finally {
    drawLoading.value = false
    historyLoading.value = false
  }
}

const getFirstAvailableDrawingCategory = (pkg: PackageListItem) => {
  const packageCategories = new Set(
    (pkg.latestDrawings || [])
      .map(drawing => drawing.productCategory)
      .filter(Boolean),
  )
  return drawCategoryOptions.value.find(option => packageCategories.has(option.value))?.value
    || (pkg.latestDrawings || [])[0]?.productCategory
    || drawCategoryOptions.value[0]?.value
    || ''
}

// ============================================================
// 包选择
// ============================================================

const selectPackage = async (pkg: PackageListItem) => {
  selectedPackage.value = pkg
  activeTab.value = 'instruction'
  historyExpanded.value = false
  instrLoading.value = true
  historyLoading.value = true
  try {
    const [instrData, historyData] = await Promise.all([
      loadInstructionData(pkg),
      loadInstructionHistory(pkg),
    ])
    pkgLatestInstr.value = instrData
  } finally {
    instrLoading.value = false
    historyLoading.value = false
  }
}

// ============================================================
// 操作
// ============================================================

const switchTab = async (tab: 'instruction' | 'drawing') => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  if (!selectedPackage.value) return
  if (tab === 'drawing') {
    currentDrawCategory.value = getFirstAvailableDrawingCategory(selectedPackage.value)
    drawLoading.value = true
    historyLoading.value = true
    try {
      const data = await loadDrawingData(selectedPackage.value)
      drawData.value = data
      if (data) {
        await loadDrawingHistory(selectedPackage.value)
      } else {
        drawHistory.value = []
      }
    } finally {
      drawLoading.value = false
      historyLoading.value = false
    }
  } else {
    instrLoading.value = true
    historyLoading.value = true
    try {
      const instrData = await loadInstructionData(selectedPackage.value)
      pkgLatestInstr.value = instrData
      await loadInstructionHistory(selectedPackage.value)
    } finally {
      instrLoading.value = false
      historyLoading.value = false
    }
  }
}

const handlePreview = () => {
  const url = previewUrl.value
  if (!url) {
    ElMessage.warning('预览地址不可用')
    return
  }
  // .xlsx 文件走内嵌预览
  if (url.endsWith('.xlsx') || url.includes('.xlsx')) {
    xlsxPreviewUrl.value = url
    xlsxPreviewFileType.value = activeTab.value === 'drawing' ? 'drawing' : 'instruction'
    xlsxPreviewFileName.value = `${activeTab.value === 'drawing' ? '图纸' : '指令单'} ${pkgLatestInstr.value?.version || ''}`
    xlsxPreviewFileId.value = currentData.value?.id
    xlsxPreviewConfirmed.value = currentData.value?.isConfirmed === 1
    xlsxPreviewProductCategory.value = activeTab.value === 'drawing' ? currentDrawCategory.value : undefined
    showXlsxPreview.value = true
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const handleDownload = () => {
  if (!selectedPackage.value || !props.orderId) {
    ElMessage.warning('数据包或订单信息不可用')
    return
  }
  const instr = pkgLatestInstr.value
  const drawing = drawData.value
  const data = activeTab.value === 'instruction' ? instr : drawing
  if (!data) {
    ElMessage.warning('文件信息不可用')
    return
  }
  const downloadUrl = data.templateDownloadUrl || ''
  const fileUrl = data.templateFileUrl || ''
  const fileName = activeTab.value === 'instruction'
    ? `指令单模板_v${data.version}.${getExt(fileUrl)}`
    : `图纸模板_v${data.version}.${getExt(fileUrl)}`
  handleDownloadFile(downloadUrl, fileUrl, fileName)
}

const getExt = (url: string): string => url.split('.').pop() || ''

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

const handleHistoryPreview = (item: DocVersionItem) => {
  const url = item.revisedFileUrl || item.templateFileUrl || null
  if (!url) {
    ElMessage.warning('预览地址不可用')
    return
  }
  if (url.endsWith('.xlsx') || url.includes('.xlsx')) {
    xlsxPreviewUrl.value = url
    xlsxPreviewFileType.value = activeTab.value === 'drawing' ? 'drawing' : 'instruction'
    xlsxPreviewFileName.value = `版本 ${item.version}`
    xlsxPreviewFileId.value = item.id
    xlsxPreviewConfirmed.value = item.isConfirmed === 1
    xlsxPreviewProductCategory.value = activeTab.value === 'drawing' ? currentDrawCategory.value : undefined
    showXlsxPreview.value = true
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const handleHistoryDownload = (item: DocVersionItem) => {
  const downloadUrl = item.templateDownloadUrl || ''
  const fileUrl = item.templateFileUrl || ''
  if (!fileUrl) {
    ElMessage.warning('文件地址不可用')
    return
  }
  const fileName = activeTab.value === 'instruction'
    ? `指令单模板_v${item.version}.${getExt(fileUrl)}`
    : `图纸模板_v${item.version}.${getExt(fileUrl)}`
  handleDownloadFile(downloadUrl, fileUrl, fileName)
}

const onXlsxConfirmSuccess = async () => {
  const current = currentData.value
  if (current) {
    current.isConfirmed = 1
    current.confirmTime = new Date().toISOString()
  }
  // 同步更新左侧数据包列表的确认状态
  if (selectedPackage.value) {
    const pkg = packageList.value.find(p => p.id === selectedPackage.value!.id)
    if (pkg) {
      if (xlsxPreviewFileType.value === 'drawing') {
        pkg.latestDrawings.forEach(d => {
          d.isConfirmed = 1
          d.confirmTime = new Date().toISOString()
        })
      } else {
        if (pkg.latestInstruction) {
          pkg.latestInstruction.isConfirmed = 1
          pkg.latestInstruction.confirmTime = new Date().toISOString()
        }
      }
    }
  }
  // 同步更新图纸数据
  if (xlsxPreviewFileType.value === 'drawing') {
    if (drawData.value) {
      drawData.value.isConfirmed = 1
      drawData.value.confirmTime = new Date().toISOString()
    }
  }
  if (selectedPackage.value) {
    if (xlsxPreviewFileType.value === 'instruction') {
      await loadInstructionHistory(selectedPackage.value)
    } else {
      await loadDrawingHistory(selectedPackage.value)
    }
  }
}

// ─── 上传修订版：指令单 ──────────────────────────────────────

const triggerInstrUpload = () => {
  if (!canEditDocuments.value) return
  if (!pkgLatestInstr.value) {
    ElMessage.warning('先生成指令单后再上传修订版')
    return
  }
  uploadInstrInputRef.value?.click()
}

const handleInstrUploadFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !selectedPackage.value || !pkgLatestInstr.value) return
  const formData = new FormData()
  uploadingFile.value = true
  lastUploadedInstrFileName.value = ''
  try {
    const token = Session.get('token') || ''
    formData.append('file', file)
    const res = await fetch(
      `/yi/design/workorder/${props.orderId}/package/${selectedPackage.value.id}/instruction/upload-revised/${pkgLatestInstr.value.id}${isCurrentAppendPackage(selectedPackage.value) ? `?batchId=${props.batchId}` : ''}`,
      {
        method: 'POST',
        headers: { 'satoken': token },
        body: formData,
      }
    )
    const data = await res.json()

    if (data?.code === 200 || data?.code === 0) {
      lastUploadedInstrFileName.value = file.name
      ElMessage.success(`上传成功：${file.name}`)
      await loadPackageList()
      instrRefreshing.value = true
      try {
        const [instrData, historyData] = await Promise.all([
          loadInstructionData(selectedPackage.value),
          loadInstructionHistory(selectedPackage.value),
        ])
        pkgLatestInstr.value = instrData
      } finally {
        instrRefreshing.value = false
      }
    } else {
      ElMessage.error(data?.msg || '上传失败')
    }
  } catch (err) {
    console.error('upload error', err)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploadingFile.value = false
    if (uploadInstrInputRef.value) {
      uploadInstrInputRef.value.value = ''
    }
  }
}

// ─── 上传修订版：图纸 ──────────────────────────────────────

const triggerDrawUpload = () => {
  if (!canEditDocuments.value) return
  if (!drawData.value) {
    ElMessage.warning('先生成图纸后再上传修订版')
    return
  }
  uploadDrawInputRef.value?.click()
}

const handleDrawUploadFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !selectedPackage.value || !drawData.value) return

  uploadingDrawFile.value = true
  lastUploadedDrawFileName.value = ''
  try {
    const token = Session.get('token') || ''
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productCategory', currentDrawCategory.value)
    const res = await fetch(
      `/yi/design/workorder/${props.orderId}/package/${selectedPackage.value.id}/drawing/upload-revised/${drawData.value.id}?productCategory=${currentDrawCategory.value}${isCurrentAppendPackage(selectedPackage.value) ? `&batchId=${props.batchId}` : ''}`,
      {
        method: 'POST',
        headers: { 'satoken': token },
        body: formData,
      }
    )
    const data = await res.json()

    if (data?.code === 200 || data?.code === 0) {
      lastUploadedDrawFileName.value = file.name
      ElMessage.success(`上传成功：${file.name}`)
      await loadPackageList()
      drawRefreshing.value = true
      try {
        const [drawDataRes, historyData] = await Promise.all([
          loadDrawingData(selectedPackage.value),
          loadDrawingHistory(selectedPackage.value),
        ])
        drawData.value = drawDataRes
      } finally {
        drawRefreshing.value = false
      }
    } else {
      ElMessage.error(data?.msg || '上传失败')
    }
  } catch (err) {
    console.error('upload error', err)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploadingDrawFile.value = false
    if (uploadDrawInputRef.value) {
      uploadDrawInputRef.value.value = ''
    }
  }
}

// ============================================================
// 监听弹框打开
// ============================================================

watch(() => props.modelValue, async (val) => {
  if (val) {
    packageList.value = []
    selectedPackage.value = null
    pkgLatestInstr.value = null
    drawData.value = null
    instrHistory.value = []
    drawHistory.value = []
    activeTab.value = 'instruction'
    historyExpanded.value = false
    lastUploadedInstrFileName.value = ''
    lastUploadedDrawFileName.value = ''
    // 加载数据包列表
    await loadPackageList()
    // 加载图纸分类选项
    const categoryRes = await getDictOptions('17')
    drawCategoryOptions.value = categoryRes
    if (categoryRes.length > 0) {
      currentDrawCategory.value = categoryRes[0].value
    }
    // 默认选中第一个未确认包，原设计包优先；全部确认后回退到第一个包。
    if (packageList.value.length > 0) {
      await selectPackage(selectDefaultPackage()!)
    }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/assets/style/dialogLeftRight.scss' as *;

@keyframes ddpdFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ─── Loading / Empty ────────────────────────────────────────────────────
.ddpd-loading,
.ddpd-loading-global {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 280px;
  color: var(--text-faint);
  font-size: 13px;

  &__icon {
    animation: spin 0.8s linear infinite;
    color: var(--blue);
  }
}

.ddpd-empty,
.ddpd-empty-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 260px;
  text-align: center;
  flex: 1;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
  }

  &__sub {
    font-size: 12px;
    color: var(--text-faint);
  }

  &__generate {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 20px;
    border: 1.5px solid var(--blue-mid);
    border-radius: 8px;
    background: var(--blue-pale);
    color: var(--blue);
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--blue);
      color: white;
      box-shadow: 0 4px 14px rgba(30, 111, 217, 0.25);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// ─── Drawing Empty ─────────────────────────────────────────────────────
.ddpd-drawing-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 200px;
  text-align: center;
  color: var(--text-muted);
  flex: 1;

  svg {
    color: #b0c8e0;
  }

  span {
    font-size: 13px;
    color: var(--text-muted);
  }
}

// ─── Tabs ───────────────────────────────────────────────────────────────
.ddpd-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--surface-raised);
  border-radius: 10px;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.ddpd-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border: none;
  background: transparent;
  border-radius: 7px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s ease;

  svg {
    transition: color 0.2s;
    flex-shrink: 0;
  }

  &:hover {
    background: var(--surface);
    color: var(--text-mid);
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  }

  &--active {
    background: var(--surface);
    color: var(--blue);
    box-shadow: 0 2px 8px rgba(30, 111, 217, 0.12), 0 1px 2px rgba(15, 23, 42, 0.05);

    svg {
      color: var(--blue);
    }
  }

  &__badge {
    font-family: 'DM Mono', 'Fira Code', monospace;
    font-size: 10px;
    font-weight: 700;
    color: var(--blue);
    background: var(--blue-light);
    padding: 1px 5px;
    border-radius: 4px;
    letter-spacing: 0.3px;

    &--amber {
      color: #92400e;
      background: var(--amber-light);
    }
  }
}

// ─── Drawing Category Switch ─────────────────────────────────────────────────
.draw-category-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--surface-raised);
  border-radius: 8px;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.draw-category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s ease;

  &:hover {
    background: var(--surface);
    color: var(--text-mid);
  }

  &--active {
    background: var(--surface);
    color: var(--blue);
    box-shadow: 0 1px 4px rgba(30, 111, 217, 0.1);
  }

  &__count {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    color: inherit;
    background: rgba(0, 0, 0, 0.06);
    padding: 1px 5px;
    border-radius: 4px;
  }
}

// ─── Version Card ───────────────────────────────────────────────────────
.ddpd-version-card {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  animation: ddpdFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;

  &--instr {
    border: 1.5px solid var(--blue-light);
    background: linear-gradient(135deg, var(--blue-pale) 0%, #e8f2ff 100%);
    box-shadow: 0 2px 12px rgba(30, 111, 217, 0.08);
  }

  &--draw {
    border: 1.5px solid var(--amber-light);
    background: linear-gradient(135deg, #fffbf0 0%, #fff9e6 100%);
    box-shadow: 0 2px 12px rgba(217, 119, 6, 0.08);
  }

  &__refreshing-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
    border-radius: 12px;
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 500;
  }

  &__refreshing-icon {
    animation: spin 0.8s linear infinite;
    color: var(--blue);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  &__badge {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__badge-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-faint);
  }

  &__badge-version {
    font-family: 'DM Mono', 'Fira Code', monospace;
    font-size: 18px;
    font-weight: 700;
    color: var(--blue-dark);

    .ddpd-version-card--draw & {
      color: #92400e;
    }
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 9999px;

    &--pending {
      background: var(--amber-light);
      color: #92400e;
    }

    &--confirmed {
      background: var(--success-light);
      color: #065f46;
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 18px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  &__meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--text-muted);

    svg {
      color: var(--text-faint);
      flex-shrink: 0;
    }

    span {
      flex-shrink: 0;
    }

    strong {
      font-weight: 600;
      color: var(--text-mid);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__file-id {
    font-family: 'DM Mono', 'Fira Code', monospace;
    font-size: 10.5px !important;
    color: var(--blue) !important;
  }

  &__actions {
    display: flex;
    gap: 10px;
    padding: 12px 18px;
    flex-wrap: wrap;
  }

  &__upload {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__upload-hint {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10.5px;
    color: var(--text-faint);

    svg {
      flex-shrink: 0;
    }

    &--success {
      color: var(--success);
    }
  }
}

// ─── Action Buttons ──────────────────────────────────────────────────────
.ddpd-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }

  &__spin {
    animation: spin 0.8s linear infinite;
  }

  &--upload {
    background: white;
    color: var(--text-mid);
    border: 1.5px solid var(--border-mid);

    svg {
      color: var(--text-muted);
      transition: color 0.2s;
    }

    &:hover {
      border-color: var(--blue-mid);
      color: var(--blue);
      background: var(--blue-pale);
      box-shadow: 0 2px 8px rgba(30, 111, 217, 0.08);

      svg {
        color: var(--blue);
      }
    }
  }

  &--preview {
    background: var(--blue);
    color: white;
    border: none;
    box-shadow: 0 2px 8px rgba(30, 111, 217, 0.22);

    &:hover {
      background: var(--blue-dark);
      box-shadow: 0 4px 16px rgba(30, 111, 217, 0.3);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(30, 111, 217, 0.22);
    }
  }

  &--download {
    background: white;
    color: var(--text-mid);
    border: 1.5px solid var(--border-mid);

    svg {
      color: var(--text-muted);
      transition: color 0.2s;
    }

    &:hover {
      border-color: var(--blue-mid);
      color: var(--blue);
      background: var(--blue-pale);
      box-shadow: 0 2px 8px rgba(30, 111, 217, 0.08);

      svg {
        color: var(--blue);
      }
    }
  }
}

// ─── History ────────────────────────────────────────────────────────────
.ddpd-history {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
  transition: border-color 0.2s;
  animation: ddpdFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;

  &:hover {
    border-color: var(--border-mid);
  }

  &--expanded {
    border-color: var(--blue-light);
  }

  &__toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;

    &:hover {
      background: var(--surface-raised);
    }
  }

  &__toggle-left {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;

    svg {
      color: var(--text-faint);
      flex-shrink: 0;
    }
  }

  &__count {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    background: var(--border);
    color: var(--text-muted);
    padding: 1px 6px;
    border-radius: 9999px;
  }

  &__confirmed-hint {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: var(--success);
    background: var(--success-light);
    padding: 1px 6px;
    border-radius: 9999px;
    text-transform: none;
    letter-spacing: 0;

    svg {
      color: var(--success);
    }
  }

  &__chevron {
    color: var(--text-faint);
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &--up {
      transform: rotate(180deg);
    }
  }

  &__list {
    border-top: 1px solid var(--border);
    max-height: 260px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-mid) transparent;
  }

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    font-size: 12px;
    color: var(--text-faint);

    &-icon {
      animation: spin 0.8s linear infinite;
      color: var(--blue);
    }
  }

  &__items {
    padding: 6px 0;
  }
}

// ─── History Item ───────────────────────────────────────────────────────
.ddpd-history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  transition: background 0.15s;
  animation: ddpdFadeIn 0.25s ease both;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 0;
    background: var(--blue);
    border-radius: 0 1px 1px 0;
    transition: height 0.15s;
  }

  &:hover {
    background: var(--surface-raised);

    &::before {
      height: 60%;
    }
  }

  &--current {
    background: var(--blue-pale);

    &::before {
      height: 70%;
      background: var(--blue);
    }
  }

  &--confirmed {
    &::before {
      background: var(--success);
    }
  }

  &__version {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 72px;
  }

  &__ver-text {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-mid);
  }

  &__current-tag {
    font-size: 9.5px;
    font-weight: 700;
    color: white;
    background: var(--blue);
    padding: 1px 5px;
    border-radius: 3px;
    letter-spacing: 0.3px;
  }

  &__confirmed-tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 9.5px;
    font-weight: 700;
    color: var(--success);
    background: var(--success-light);
    padding: 1px 5px;
    border-radius: 3px;
  }

  &__time {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-faint);

    svg {
      flex-shrink: 0;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s;

    .ddpd-history-item:hover & {
      opacity: 1;
    }

    .ddpd-history-item--current & {
      opacity: 1;
    }
  }

  &__btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-muted);
    transition: all 0.15s;
    padding: 0;

    &:hover {
      border-color: var(--blue-light);
      color: var(--blue);
      background: var(--blue-pale);
    }
  }
}

// ─── Global Loading ─────────────────────────────────────────────────────
.ddpd-loading-global {
  min-height: 360px;
  font-size: 13px;

  &__icon {
    animation: spin 0.8s linear infinite;
    color: var(--blue);
  }
}
</style>
