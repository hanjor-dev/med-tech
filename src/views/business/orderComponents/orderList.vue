<template>
  <div class="page-body-panel">
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">订单列表</div>
          <div class="header-actions">
            <el-button link type="primary" size="small" @click="handleExport" v-permission="'order:BatchExport'">
              <el-icon>
                <Download />
              </el-icon>
              <span>批量导出</span>
            </el-button>
          </div>
        </div>
      </template>
      <!-- 表格 -->
      <div class="roles-list-wrap table-scroll-container" ref="tableScrollRef" @mousedown="onTableScrollMouseDown"
        @mousemove="onTableScrollMouseMove" @mouseup="onTableScrollMouseUp" @mouseleave="onTableScrollMouseLeave">
        <el-table :data="orderList" v-loading="loading" @sort-change="handleTableSortChange" stripe ref="orderTableRef"
          :header-cell-style="{ background: '#f9fafb' }" :row-class-name="tableRowClass" height="100%">
          <el-table-column type="index" label="序号" width="55" align="center" fixed />
          <!-- 动态列 -->
          <template v-for="col in visibleColumns" :key="col.field">
            <!-- 订单编号-->
            <el-table-column v-if="col.field === 'orderCode'" :prop="col.field" :label="col.label" width="130">
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
            <!-- 订单类型 -->
            <el-table-column v-else-if="col.field === 'orderTypeName'" :prop="col.field" :label="col.label"
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
                <el-tag size="small" :type="row.orderType === 1 ? 'primary' : 'warning'" effect="plain">
                  {{ row.orderTypeName }}
                </el-tag>
              </template>
            </el-table-column>
            <!-- 业务类型 -->
            <el-table-column v-else-if="col.field === 'businessTypeName'" :prop="col.field" :label="col.label"
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
                <el-tag size="small" type="info" effect="plain">{{ row.businessTypeName }}</el-tag>
              </template>
            </el-table-column>
            <!-- 加急 -->
            <el-table-column v-else-if="col.field === 'isUrgent'" :prop="col.field" :label="col.label" width="col.width"
              align="center">
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
                <el-tag v-if="row.isUrgent === 1" size="small" type="danger" effect="light">加急</el-tag>
                <span v-else>否</span>
              </template>
            </el-table-column>

            <!-- 邮寄 -->
            <el-table-column v-else-if="col.field === 'isPostal'" :prop="col.field" :label="col.label"
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
                <el-icon v-if="row.isPostal === 1" color="#67c23a">
                  <CircleCheckFilled />
                </el-icon>
                <span v-else>否</span>
              </template>
            </el-table-column>

            <!-- 设计师 -->
            <el-table-column v-else-if="col.field === 'designerName'" :prop="col.field" :label="col.label"
              :width="col.width" show-overflow-tooltip>
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
                <span>{{ row.designerName || '—' }}</span>
              </template>
            </el-table-column>

            <!-- 预计费用 -->
            <el-table-column v-else-if="col.field === 'estimatedCost'" :prop="col.field" :label="col.label"
              :width="col.width" align="right">
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
                <span>
                  {{ row.estimatedCost != null ? `¥${Number(row.estimatedCost).toLocaleString()}` : '—' }}
                </span>
              </template>
            </el-table-column>

            <!-- 期望交付 -->
            <el-table-column v-else-if="col.field === 'expectedDeliveryDate'" :prop="col.field" :label="col.label"
              :width="col.width" show-overflow-tooltip>
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
                <span>{{ dayjs(row.expectedDeliveryDate).format('YYYY-MM-DD HH:mm:ss') || '—' }}</span>
              </template>
            </el-table-column>

            <!-- 重建项目摘要 -->
            <el-table-column v-else-if="col.field === 'rebuildProjectList'" :prop="col.field" :label="col.label"
              :width="col.width" :min-width="!col.width ? 200 : undefined">
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
                <div class="project-tags">
                  <template v-if="row.rebuildProjectList && row.rebuildProjectList.length > 0">
                    <el-tag v-for="p in row.rebuildProjectList.slice(0, 2)" :key="p.projectName" size="small"
                      type="primary" effect="plain">
                      {{ p.projectName }}
                    </el-tag>
                    <span v-if="row.rebuildProjectList.length > 2" style="font-size: 11px;">
                      +{{ row.rebuildProjectList.length - 2 }}
                    </span>
                  </template>
                  <span v-else>—</span>
                </div>
              </template>
            </el-table-column>

            <!-- 订单状态 -->
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
                  <el-tag size="small" effect="light" :style="{
                    backgroundColor: row.statusColor?.bgColor || '#f3f4f6',
                    borderColor: row.statusColor?.bdColor || '#e5e7eb',
                    color: row.statusColor?.color || '#6b7280',
                  }">
                    {{ row.statusName }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <!-- 设计开始时间 -->
            <el-table-column v-else-if="col.field === 'designStartTime'" :prop="col.field" :label="col.label"
              :width="col.width" show-overflow-tooltip>
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
                <span>{{ row.designStartTime ? dayjs(row.designStartTime).format('YYYY-MM-DD HH:mm:ss') : '—' }}</span>
              </template>
            </el-table-column>

            <!-- 设计结束时间 -->
            <el-table-column v-else-if="col.field === 'designSubmitTime'" :prop="col.field" :label="col.label"
              :width="col.width" show-overflow-tooltip>
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
                <span>{{ row.designSubmitTime ? dayjs(row.designSubmitTime).format('YYYY-MM-DD HH:mm:ss') : '—'
                  }}</span>
              </template>
            </el-table-column>

            <!-- 生产开始时间 -->
            <el-table-column v-else-if="col.field === 'productionStartTime'" :prop="col.field" :label="col.label"
              :width="col.width" show-overflow-tooltip>
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
                <span>{{ row.productionStartTime ? dayjs(row.productionStartTime).format('YYYY-MM-DD HH:mm:ss') : '—'
                  }}</span>
              </template>
            </el-table-column>

            <!-- 生产结束时间 -->
            <el-table-column v-else-if="col.field === 'productionEndTime'" :prop="col.field" :label="col.label"
              :width="col.width" show-overflow-tooltip>
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
                <span>{{ row.productionEndTime ? dayjs(row.productionEndTime).format('YYYY-MM-DD HH:mm:ss') : '—'
                  }}</span>
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column v-else-if="col.field === 'createTime'" :prop="col.field" :label="col.label"
              :width="col.width" show-overflow-tooltip>
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
                <span>{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') || '—' }}</span>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column v-else-if="col.field === 'action'" :prop="col.field" :label="col.label" :width="col.width"
              fixed="right" align="center">
              <template #default="{ row }">
                <el-dropdown trigger="click">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="userInfo.hasPermission('order:View')" @click.stop="handleView(row)">
                        <span class="icon-tag">
                          <el-icon>
                            <View />
                          </el-icon>查看详情
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleModify(row)" v-if="userInfo.hasPermission('order:Modify') && (row.status !== 9010)">
                        <span class="icon-tag">
                          <el-icon>
                            <EditPen />
                          </el-icon>修改订单
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleResubmit(row)" v-if="userInfo.hasPermission('order:Review') && (row.status === 1040)">
                        <span class="icon-tag">
                          <el-icon>
                            <Upload />
                          </el-icon>重新提交订单
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="userInfo.hasPermission('order:Add')" @click.stop="handleRecreateOrder(row)" divided>
                        <span class="icon-tag">
                          <el-icon>
                            <CirclePlus />
                          </el-icon>再来一单
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleViewModifyLog(row)" v-if="userInfo.hasPermission('order:ModifyHistory') && (row.status !== 9010)">
                        <span class="icon-tag">
                          <el-icon>
                            <Edit />
                          </el-icon>修改历史
                        </span>
                      </el-dropdown-item>

                      <el-dropdown-item @click.stop="handleAssignDesigner(row)"
                        v-if="userInfo.hasPermission('design:AssignDesigner') && (row.status === 1030 || row.status === 2010 || row.status === 2020)">
                        <span class="icon-tag">
                          <el-icon>
                            <User />
                          </el-icon>分配设计师
                        </span>
                      </el-dropdown-item>

                      <el-dropdown-item @click.stop="handleCancel(row)" v-if="userInfo.hasPermission('order:Cancel') && (row.status !== 9010)">
                        <span class="icon-tag">
                          <el-icon>
                            <Remove />
                          </el-icon>订单取消
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="userInfo.hasPermission('order:CancelHistory')" @click.stop="handleCancelHistory(row)">
                        <span class="icon-tag">
                          <el-icon>
                            <Clock />
                          </el-icon>查看取消历史
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item v-if="userInfo.hasPermission('order:DicomView')" @click.stop="handleDicomView(row)" divided>
                        <span class="icon-tag">
                          <el-icon>
                            <Monitor />
                          </el-icon>可视化预览
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleEncodeView(row)" v-if="userInfo.hasPermission('order:EncodeView') && (row.status !== 9010)">
                        <span class="icon-tag">
                          <el-icon>
                            <Link />
                          </el-icon>生成二维码
                        </span>
                      </el-dropdown-item>

                      <el-dropdown-item @click.stop="handleMarkClassicCase(row)"
                        v-if="userInfo.hasPermission('order:MarkCase') && ((row.needsPhysicalDelivery === 1 && (row.phase === 80 || row.status === 6030 || row.status === 8081)) || (row.needsPhysicalDelivery !== 1 && (row.status === 2030 || row.status === 8010)))"
                        divided :disabled="addMarkLoading">
                        <span class="icon-tag">
                          <el-icon>
                            <Star />
                          </el-icon>标记为经典案例
                        </span>
                      </el-dropdown-item>
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
      </div>
      <page-box :current-page="pager.currentPage" :page-size="pager.pageSize" :total-count="pager.totalCount"
        @current-change="handlePageChange" />
    </el-card>
  </div>

  <!-- 新建订单弹窗 -->
  <order-create-dialog v-model="showCreateDialog" @success="handleCreateSuccess"
    @save-and-upload="onCreateSaveAndUpload" :restored-form-data="prevFormData" :re-create="true" />

  <!-- 新建订单 - 文件上传 -->
  <FileUploadDialog v-model="showFileUploadDialog" :draft-id="uploadingDraftId" :order-form-data="uploadingFormData"
    :draft="null" @success="onUploadSuccess" @prev="onUploadPrev" />

  <!-- 修改订单 -->
  <order-create-dialog v-model="showModifyDialog" :order-data="modifyingOrder" @success="onModifySuccess"
    @save-and-upload="onModifySaveAndUpload" :restored-form-data="modifyRestoredFormData" />

  <!-- 修改订单 - 影像文件 -->
  <FileUploadDialog v-model="showModifyFileDialog" :modify-order-id="modifyingOrder?.id" :order-id="modifyingOrder?.id"
    :order-form-data="modifyingFormData" @success="onModifySuccess" @prev="onModifyFilePrev" />

  <!-- 订单详情弹窗 -->
  <order-detail-dialog v-model="showOrderDetail" :order="detailOrder" @action="handleOrderAction"
    @audit-success="handleSuccess" />

  <!-- 分配设计师弹窗 -->
  <designer-assign-dialog v-model="showDesignerAssignDialog" :order-id="designerAssignOrderId"
    :order-code="designerAssignOrderCode || undefined" :current-designer-id="designerAssignCurrentDesignerId"
    @success="handleSuccess" />

  <!-- 修改历史弹窗 -->
  <dialog-modal v-model="showModifyLogDialog" title="修改历史" :subtitle="`订单号：${modifyLogOrder?.orderCode || ''}`"
    width="900px" :show-footer="false" @modal-close="showModifyLogDialog = false">
    <div class="dialog-shell">
      <el-table :data="modifyLogList" v-loading="modifyLogLoading"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }" style="min-height: 400px;">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="fieldLabel" label="修改字段" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">{{ row.fieldLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="oldValue" label="修改前" show-overflow-tooltip />
        <el-table-column prop="newValue" label="修改后" show-overflow-tooltip />
        <el-table-column prop="modifierName" label="修改人" align="center" />
        <el-table-column prop="createTime" label="修改时间" align="center" width="220">
          <template #default="{ row }">
            <span>{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <page-box v-if="modifyLogPager.totalCount > 0" :current-page="modifyLogPager.currentPage"
      :page-size="modifyLogPager.pageSize" :total-count="modifyLogPager.totalCount"
      @current-change="handleModifyLogPageChange" />
    <template #footer v-if="modifyLogList.length === 0 && !modifyLogLoading">
      <el-empty description="暂无修改历史" :image-size="60" />
    </template>
  </dialog-modal>

  <!-- 高级查询弹窗 -->
  <dialog-modal v-model="showAdvancedFilter" title="高级筛选" subtitle="设置筛选条件后点击筛选" width="720px"
    @modal-close="showAdvancedFilter = false">
    <div class="dialog-shell">
      <el-form :model="advFilter" label-position="top" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="地区">
              <el-cascader v-model="advFilter.areaId" :options="areaTreeOptions"
                :props="{ checkStrictly: true, emitPath: false }" placeholder="全部地区" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医院">
              <el-select v-model="advFilter.hospitalId" placeholder="全部医院" clearable filterable style="width: 100%">
                <el-option v-for="h in hospitalOptions" :key="h.value" :label="h.label" :value="h.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="患者姓名">
              <el-input v-model="advFilter.patientName" placeholder="模糊搜索患者姓名" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作员">
              <el-select v-model="advFilter.operatorId" placeholder="全部操作员" clearable filterable style="width: 100%">
                <el-option v-for="op in operatorOptions" :key="op.value" :label="op.label" :value="op.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医生姓名">
              <el-input v-model="advFilter.doctorName" placeholder="模糊搜索医生姓名" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身体部位">
              <el-select v-model="advFilter.bodyPartIds" placeholder="全部部位" clearable multiple collapse-tags
                collapse-tags-tooltip style="width: 100%">
                <el-option v-for="bp in bodyPartFlatOptions" :key="bp.value" :label="bp.label" :value="bp.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="重建项目">
              <el-select v-model="advFilter.projectIds" placeholder="全部项目" clearable multiple collapse-tags
                collapse-tags-tooltip style="width: 100%"
                :disabled="!advFilter.bodyPartIds || advFilter.bodyPartIds.length === 0">
                <el-option v-for="pj in projectFlatOptions" :key="pj.value" :label="pj.label" :value="pj.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="onAdvancedReset">重置</el-button>
      <el-button type="primary" @click="onAdvancedSearch">开始筛选</el-button>
    </template>
  </dialog-modal>

  <!-- 二维码弹窗 -->
  <dialog-modal v-model="showQRCodeDialog" :title="qrHospitalName || '影像预览二维码'" width="360px"
    @modal-close="showQRCodeDialog = false">
    <div class="qrcode-wrapper">
      <img v-if="qrCodeShareImage" :src="qrCodeShareImage" alt="二维码" class="qrcode-img" />
      <!-- <div v-if="qrCodePatientName" class="qrcode-patient-name">{{ qrCodeOrderCode }}-{{ qrCodePatientName }}</div> -->
    </div>
    <template #footer-btn>
      <el-button type="primary" @click="copyUrl">复制链接</el-button>
      <el-button @click="openUrl">打开链接</el-button>
    </template>
  </dialog-modal>

  <!-- 导出弹框 -->
  <order-export-dialog ref="orderExportDialogRef" />

  <!-- 取消申请历史弹框 -->
  <cancel-apply-history-dialog v-model="showCancelHistoryDialog" :order-id="currentCancelOrderId" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElTable } from 'element-plus'
import Sortable from 'sortablejs'
import {
  CircleCheckFilled, Sort, CaretTop, CaretBottom,
  MoreFilled, View, Edit, EditPen, Remove, Monitor, Link, Star, Upload, User, Download, CirclePlus, Clock
} from '@element-plus/icons-vue'
import pageBox from '@/components/pageBox.vue'
import orderCreateDialog from './orderCreateDialog.vue'
import FileUploadDialog from './fileDialog.vue'
import orderDetailDialog from './orderDetailDialog.vue'
import orderExportDialog from './orderExportDialog.vue'
import dialogModal from '@/components/dialogModal.vue'
import cancelApplyHistoryDialog from './cancelApplyHistoryDialog.vue'
import designerAssignDialog from '../designComponents/designerAssignDialog.vue'
import QRCode from 'qrcode'
import { useUserInfo } from '@/stores/userInfo'
import $axios from '@/utils/http'
import {
  orderPageQuery,
  orderDetail,
  checkOrderCanModify,
  columnConfigSave,
  orderSubmit,
  orderWithdraw,
  orderDelete,
  orderModifyApply,
  type OrderVO,
  type OrderPageQuery,
  type DraftDTO,
  type ImageFileVO,
  type OrderModifyFullDTO,
  columnConfigGet,
  orderModifyLogs,
  orderCancel,
  orderResubmit,
  classicCaseMark,
  type ModifyLogRecordVO,
  type ModifyLogQuery,
} from '@/api/order'
import type { OrderListEmits } from './types'
import { rebuildProjectByBodyPart } from '@/api/rebuildProject'
import { userList } from '@/api/user'
import { areaTree } from '@/data/area'
import { bodyPartOptions } from '@/api/bodyPart'
import dayjs from 'dayjs'

defineOptions({ name: 'OrderList' })

const userInfo = useUserInfo()

const canModifyOrder = computed(() => userInfo.hasPermission('order:Modify'))

// 业务员角色判断
const isSalesman = computed(() => {
  const roleCode = userInfo.userInfos.roleCode
  return roleCode ? ['salesman', 'salesman-self', 'regional-manager'].includes(roleCode) : false
})

// 设计师角色判断
const isDesigner = computed(() => {
  const roleCode = userInfo.userInfos.roleCode
  return roleCode ? ['designer', 'designer-manager'].includes(roleCode) : false
})

// 业务员/设计师角色判断（兼容旧逻辑）
const isSalesmanOrDesigner = computed(() => isSalesman.value || isDesigner.value)

// 是否为管理员或企业管理员
const isAdminOrCompanyAdmin = computed(() => {
  const roleCode = userInfo.userInfos.roleCode
  return roleCode ? ['admin', 'company-admin'].includes(roleCode) : false
})

const emit = defineEmits<OrderListEmits>()

// ── Props ─────────────────────────────────────────────────────────────

const props = defineProps<{
  queryParams: OrderPageQuery
}>()

// ── Refs ──────────────────────────────────────────────────────────────

const orderTableRef = ref<InstanceType<typeof ElTable>>()
const orderExportDialogRef = ref<InstanceType<typeof orderExportDialog>>()
const tableScrollRef = ref<HTMLElement>()
const loading = ref(false)
const orderList = ref<OrderVO[]>([])

const pager = reactive({
  currentPage: 1,
  pageSize: 15,
  totalCount: 0,
})

// ── 列配置 ────────────────────────────────────────────────────────────

const allColumns = ref<Array<{
  field: string
  label: string
  visible: boolean
  width?: number
  sortField?: string
  fixed?: string
  sort?: number
}>>([])

const visibleColumns = computed(() => [...allColumns.value]
  .filter(c => c.visible)
  .sort((a, b) => {
    if (a.field === 'action') return 1
    if (b.field === 'action') return -1
    return (a.sort ?? 0) - (b.sort ?? 0)
  }))

const currentSortField = computed(() => (props.queryParams as any).sortField)
const currentSortOrder = computed(() => (props.queryParams as any).sortOrder)

const sortFieldMap: Record<string, string> = {
  orderCode: 'orderCode',
  patientName: 'patientName',
  hospitalName: 'hospitalName',
  doctorName: 'doctorName',
  businessTypeName: 'businessType',
  isUrgent: 'isUrgent',
  expectedDeliveryDate: 'expectedDeliveryDate',
  estimatedCost: 'estimatedCost',
  createTime: 'createTime',
}

// ── 数据加载 ──────────────────────────────────────────────────────────

const fetchList = async () => {
  loading.value = true
  try {
    const params: OrderPageQuery = {
      ...props.queryParams,
      pageNum: pager.currentPage,
      pageSize: pager.pageSize,
    }
    const dateRange = (props.queryParams as any).createTime
    if (dateRange && dateRange.length === 2) {
      params.createTimeStart = `${dateRange[0]}`
      params.createTimeEnd = `${dateRange[1]}`
    }
    delete (params as any).createTime
    const res = await orderPageQuery(params)
    orderList.value = res.records
    pager.totalCount = res.total
  } catch {
    // ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// ── 分页 ─────────────────────────────────────────────────────────────

const handlePageChange = (page: number) => {
  pager.currentPage = page
  fetchList()
}

// ── 导出 ─────────────────────────────────────────────────────────────

const handleExport = () => {
  orderExportDialogRef.value?.open()
}

const handleView = async (row: OrderVO) => {
  try {
    const res = await orderDetail(row.id)
    detailOrder.value = res
    showOrderDetail.value = true
  } catch {
  }
}

// ── 排序 ──────────────────────────────────────────────────────────────

const handleTableSortChange = ({ prop, order }: { prop: string; order: string }) => {
  if (!prop || !order) {
    emit('sort-change', { sortField: undefined, sortOrder: undefined })
    return
  }
  const col = allColumns.value.find(c => c.field === prop)
  const sortOrder = order === 'ascending' ? 'ASC' : 'DESC'
  emit('sort-change', { sortField: col?.sortField ?? prop, sortOrder })
}

const handleColumnSort = (col: { field: string; sortField?: string }) => {
  if (!col.sortField) return
  if (currentSortField.value === col.sortField && currentSortOrder.value === 'DESC') {
    emit('sort-change', { sortField: col.sortField, sortOrder: 'ASC' })
  } else {
    emit('sort-change', { sortField: col.sortField, sortOrder: 'DESC' })
  }
}

// ── 列拖拽 ───────────────────────────────────────────────────────────

let columnSortable: Sortable | null = null

const getTableHeaderRow = () => {
  const el = orderTableRef.value?.$el as HTMLElement
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
      columnConfigSave({
        columns: allColumns.value.map(c => ({
          key: c.field,
          label: c.label,
          field: c.field,
          visible: c.visible,
          width: c.width,
          sort: c.sort,
        })),
      }).catch(() => ElMessage.error('列顺序保存失败'))
    },
  })
}

const destroyColumnSortable = () => {
  columnSortable?.destroy()
  columnSortable = null
}

const defaultColumns = [
  { field: 'orderCode', label: '订单编号', visible: true, width: 170, sortField: 'orderCode' },
  { field: 'orderTypeName', label: '订单类型', visible: true, width: 100, sortField: undefined },
  { field: 'businessTypeName', label: '业务类型', visible: true, width: 110, sortField: undefined },
  { field: 'hospitalName', label: '医院', visible: true, sortField: 'hospitalName' },
  { field: 'patientName', label: '患者', visible: true, sortField: 'patientName' },
  { field: 'rebuildProjectList', label: '重建项目', visible: true, sortField: undefined },
  { field: 'isUrgent', label: '加急', visible: true, width: 70, sortField: undefined },
  { field: 'isPostal', label: '邮寄', visible: true, width: 70, sortField: undefined },
  { field: 'doctorName', label: '医生', visible: true, sortField: 'doctorName' },
  { field: 'designerName', label: '设计师', visible: true, sortField: 'designerName' },
  { field: 'expectedDeliveryDate', label: '期望交付', visible: true, width: 120, sortField: 'expectedDeliveryDate' },
  { field: 'estimatedCost', label: '预计费用', visible: true, width: 110, sortField: 'estimatedCost' },
]

const loadColumnConfig = async () => {
  destroyColumnSortable()
  try {
    const res = await columnConfigGet()
    if (res && res.columns && res.columns.length > 0) {
      allColumns.value = res.columns.map(col => ({
        ...col,
        field: col.field,
        sortField: sortFieldMap[col.field],
      }))
    } else {
      allColumns.value = defaultColumns
    }
  } catch {
    allColumns.value = defaultColumns
  }
  await nextTick()
  initColumnSortable()
}

// ── 辅助 ──────────────────────────────────────────────────────────────

const tableRowClass = () => ''

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

// ── 新建订单 ─────────────────────────────────────────────────────────

const showCreateDialog = ref(false)

// ── 文件上传弹窗 ─────────────────────────────────────────────────
const showFileUploadDialog = ref(false)
const uploadingDraftId = ref<number | null>(null)
const uploadingFormData = ref<DraftDTO | null>(null)
const prevFormData = ref<DraftDTO | null>(null)

const handleCreate = () => {
  prevFormData.value = null
  showCreateDialog.value = true
}

const buildRestoredOrderForm = (row: OrderVO): DraftDTO => {
  return {
    orderType: row.orderType,
    needsPhysicalDelivery: row.needsPhysicalDelivery,
    businessType: row.businessType,
    orgId: row.orgId,
    orgName: row.orgName,
    operatorName: row.operatorName,
    operatorPhone: (row as any).operatorPhone || '',
    hospitalId: row.hospitalId,
    hospitalName: row.hospitalName,
    hospitalDeptId: row.hospitalDeptId,
    hospitalDeptName: row.hospitalDeptName,
    doctorId: row.doctorId,
    doctorName: row.doctorName,
    doctorPhone: (row as any).doctorPhone || '',
    patientName: '',
    patientAge: undefined,
    patientGender: '',
    isUrgent: row.isUrgent,
    isPostal: row.isPostal,
    postalAddress: row.postalAddress,
    expectedDeliveryDate: row.expectedDeliveryDate,
    items: [],
    approvalFileIds: undefined,
  }
}

const handleRecreateOrder = async (row: OrderVO) => {
  try {
    const detail = (await orderDetail(row.id)) as any
    const source = detail || row
    prevFormData.value = buildRestoredOrderForm(source)
    showCreateDialog.value = true
    // nextTick(() => { prevFormData.value = null })
  } catch {
    ElMessage.error('加载订单详情失败，请重试')
  }
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  fetchList()
}

const onCreateSaveAndUpload = (_draftId: number | null, formData: DraftDTO) => {
  showCreateDialog.value = false
  uploadingFormData.value = formData
  showFileUploadDialog.value = true
}

const onUploadSuccess = () => {
  showFileUploadDialog.value = false
  uploadingDraftId.value = null
  uploadingFormData.value = null
  fetchList()
}

const onUploadPrev = (payload: { formData: DraftDTO | null; draftId: number | null }) => {
  showFileUploadDialog.value = false
  if (payload.formData || payload.draftId) {
    prevFormData.value = payload.formData
    uploadingDraftId.value = payload.draftId
    showCreateDialog.value = true
    // 弹窗打开后清除恢复数据，防止下次新建时误用
    nextTick(() => { prevFormData.value = null })
  }
}

// ── 修改订单（直接修改，无需审核） ─────────────────────────────────

const showModifyDialog = ref(false)
const showModifyFileDialog = ref(false)
const modifyingOrder = ref<OrderVO | null>(null)
const modifyingFormData = ref<DraftDTO | null>(null)
const modifyRestoredFormData = ref<DraftDTO | null>(null)

const handleModify = async (row: OrderVO) => {
  // 设计阶段时，业务员和设计师统一判断
  if ((isSalesmanOrDesigner.value && row.phase === 20) || (isSalesman.value && row.phase === 10)) {
    try {
      const canModify = await checkOrderCanModify(row.id)
      if (canModify) {
        const orderInfo = await orderDetail(row.id) as OrderVO
        modifyingOrder.value = orderInfo
        modifyingFormData.value = null
        modifyRestoredFormData.value = null
        showModifyDialog.value = true
      } else {
        ElMessage.error('该订单当前不支持修改')
      }
    } catch {
    }
    return
  }
  // 订单阶段时
  if (row.phase === 10 && isDesigner.value) {
    // 设计师：当前阶段不能修改
      ElMessage.warning('当前阶段不能修改')
      return
  }
  // 其他情况：管理员，直接打开修改页面
  try {
    const orderInfo = await orderDetail(row.id) as OrderVO
    modifyingOrder.value = orderInfo
    modifyingFormData.value = null
    modifyRestoredFormData.value = null
    showModifyDialog.value = true
  } catch {
    ElMessage.error('加载订单详情失败')
  }
}

// // 构建订单完整修改的 payload
// const buildModifyFullPayload = (orderInfo: OrderVO): OrderModifyFullDTO => {
//   return {
//     orderType: orderInfo.orderType,
//     needsPhysicalDelivery: orderInfo.needsPhysicalDelivery,
//     businessType: orderInfo.businessType,
//     hospitalId: orderInfo.hospitalId,
//     hospitalDeptId: orderInfo.hospitalDeptId,
//     doctorId: orderInfo.doctorId,
//     doctorName: orderInfo.doctorName,
//     doctorPhone: orderInfo.doctorPhone,
//     patientName: orderInfo.patientName,
//     patientAge: orderInfo.patientAge,
//     patientGender: orderInfo.patientGender,
//     isUrgent: orderInfo.isUrgent,
//     isPostal: orderInfo.isPostal,
//     postalAddress: orderInfo.postalAddress,
//     expectedDeliveryDate: orderInfo.expectedDeliveryDate,
//     items: orderInfo.items?.map(item => ({
//       id: item.id,
//       bodyPartId: item.bodyPartId,
//       bodyPartName: item.bodyPartName,
//       projectId: item.projectId,
//       projectName: item.projectName,
//       projectDesc: item.projectDesc,
//       formingRequirement: item.formingRequirement,
//       otherRequirement: item.otherRequirement,
//     })),
//     imageDataFileIds: orderInfo.imageDataFiles?.map((f: ImageFileVO) => f.fileId),
//     imageReportFileIds: orderInfo.imageReportFiles?.map((f: ImageFileVO) => f.fileId),
//     approvalFileIds: orderInfo.approvalFiles?.map((f: ImageFileVO) => f.fileId),
//   }
// }

const onModifySuccess = () => {
  showModifyDialog.value = false
  showModifyFileDialog.value = false
  modifyingOrder.value = null
  modifyingFormData.value = null
  modifyRestoredFormData.value = null
  fetchList()
}

const onModifySaveAndUpload = (_orderId: number | null, formData: any) => {
  modifyingFormData.value = formData
  showModifyDialog.value = false
  showModifyFileDialog.value = true
}

const onModifyFilePrev = (payload: { formData: DraftDTO | null; draftId: number | null }) => {
  showModifyFileDialog.value = false
  modifyRestoredFormData.value = payload.formData
  showModifyDialog.value = true
  nextTick(() => { modifyRestoredFormData.value = null })
}


// ── 订单详情 ─────────────────────────────────────────────────────────

const detailOrder = ref<OrderVO | null>(null)
const showOrderDetail = ref(false)


// ── 二维码弹窗 ───────────────────────────────────────────────────────

const showQRCodeDialog = ref(false)
const qrCodeUrl = ref('')
const qrCodePatientName = ref('')
const qrCodeOrderCode = ref('')
const qrHospitalName = ref('')
const qrCodeShareImage = ref('')

const handleEncodeView = async (row: OrderVO) => {
  try {
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
  const nameY = qrY + qrImg.height + lineHeight * 1.1
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

// ── 修改历史 ─────────────────────────────────────────────────────────

const showModifyLogDialog = ref(false)
const modifyLogOrder = ref<OrderVO | null>(null)
const modifyLogList = ref<ModifyLogRecordVO[]>([])

// ── 分配设计师 ──────────────────────────────────────────────────────

const showDesignerAssignDialog = ref(false)
const designerAssignOrderId = ref<number | null>(null)
const designerAssignOrderCode = ref<string | null>(null)
const designerAssignCurrentDesignerId = ref<number | null>(null)

const handleAssignDesigner = (row: OrderVO) => {
  designerAssignOrderId.value = row.id
  designerAssignOrderCode.value = row.orderCode
  designerAssignCurrentDesignerId.value = row.designerId || null
  showDesignerAssignDialog.value = true
}
const modifyLogLoading = ref(false)
const modifyLogPager = reactive({ currentPage: 1, pageSize: 10, totalCount: 0 })

const handleCancel = async (row: OrderVO) => {
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

const showCancelHistoryDialog = ref(false)
const currentCancelOrderId = ref<number>(0)

const handleCancelHistory = (row: OrderVO) => {
  currentCancelOrderId.value = row.id
  showCancelHistoryDialog.value = true
}

const handleResubmit = async (row: OrderVO) => {
  try {
    await ElMessageBox.confirm('确定要重新提交该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await orderResubmit(row.id, row.version)
    ElMessage.success('订单已重新提交')
    fetchList()
  } catch {
    // error handled by interceptor
  }
}

const handleDicomView = async (row: OrderVO) => {
  try {
    const res = await $axios.get('/imaging/v1/config', { params: { orderId: row.id } })
    const encoded = btoa(JSON.stringify(res))
    const url = `http://view.yigongbao.com.cn:8080/#/aiView?kv=${encoded}`
    window.open(url, '_blank')
  } catch {
  }
}

const handleViewModifyLog = async (row: OrderVO) => {
  modifyLogOrder.value = row
  modifyLogPager.currentPage = 1
  showModifyLogDialog.value = true
  await fetchModifyLogList()
}

const fetchModifyLogList = async () => {
  if (!modifyLogOrder.value) return
  modifyLogLoading.value = true
  try {
    const params: ModifyLogQuery = {
      pageNum: modifyLogPager.currentPage,
      pageSize: modifyLogPager.pageSize,
    }
    const res = await orderModifyLogs(params, modifyLogOrder.value.id)
    modifyLogList.value = res.records
    modifyLogPager.totalCount = res.total
  } catch {
    ElMessage.error('加载修改历史失败')
  } finally {
    modifyLogLoading.value = false
  }
}

const handleModifyLogPageChange = (page: number) => {
  modifyLogPager.currentPage = page
  fetchModifyLogList()
}

const addMarkLoading = ref(false)

const handleMarkClassicCase = async (row: OrderVO) => {
  try {
    addMarkLoading.value = true
    const { value } = await ElMessageBox.prompt(
      `请填写「${row.orderCode}」的标记备注（选填）`,
      '标记为经典案例',
      {
        confirmButtonText: '确认标记',
        cancelButtonText: '取消',
        inputPlaceholder: '备注信息（选填）',
      }
    )
    await classicCaseMark(row.id, value || undefined)
    ElMessage.success('标记成功')
    fetchList()
  } catch (err: any) {
  } finally {
    addMarkLoading.value = false
  }
}

const handleOrderAction = async (action: string, row: OrderVO) => {
  try {
    if (action === 'SUBMIT_ORDER') {
      await ElMessageBox.confirm(`确定提交订单「${row.orderCode}」？`, '提交确认')
      await orderSubmit(row.id)
      ElMessage.success('提交成功')
      fetchList()
    } else if (action === 'WITHDRAW') {
      await ElMessageBox.confirm(`确定撤回订单「${row.orderCode}」？`, '撤回确认')
      await orderWithdraw(row.id)
      ElMessage.success('撤回成功')
      fetchList()
    } else if (action === 'DELETE') {
      await ElMessageBox.confirm(`确定删除订单「${row.orderCode}」？`, '删除确认')
      await orderDelete(row.id)
      ElMessage.success('删除成功')
      fetchList()
    }
  } catch (err: any) {

  }
}

// 审核成功后刷新列表
const handleSuccess = () => {
  fetchList()
}

// ── 高级筛选 ─────────────────────────────────────────────────────────

interface AdvFilterForm {
  areaId?: number
  hospitalId?: number
  patientName?: string
  operatorId?: number
  bodyPartIds?: number[]
  projectIds?: number[]
  doctorName?: string
}

const showAdvancedFilter = ref(false)
const advFilter = reactive<AdvFilterForm>({})
const areaTreeOptions = ref<any[]>([])
const operatorOptions = ref<{ label: string; value: number }[]>([])
const bodyPartFlatOptions = ref<{ label: string; value: number }[]>([])
const hospitalOptions = ref<{ label: string; value: number }[]>([])
const projectCache = ref<Record<number, any[]>>({})
const projectFlatOptions = computed<{ label: string; value: number }[]>(() => {
  if (!advFilter.bodyPartIds || advFilter.bodyPartIds.length === 0) return []
  const all: { label: string; value: number }[] = []
  advFilter.bodyPartIds.forEach(bpId => {
    const projects = projectCache.value[bpId] || []
    projects.forEach((p: any) => all.push({ label: p.name, value: p.id }))
  })
  return all
})

const hasAdvancedFilter = computed(() => {
  return !!(
    advFilter.areaId || advFilter.hospitalId || advFilter.patientName ||
    advFilter.operatorId || advFilter.doctorName ||
    (advFilter.bodyPartIds && advFilter.bodyPartIds.length > 0) ||
    (advFilter.projectIds && advFilter.projectIds.length > 0)
  )
})

const onAdvancedReset = () => {
  advFilter.areaId = undefined
  advFilter.hospitalId = undefined
  advFilter.patientName = undefined
  advFilter.operatorId = undefined
  advFilter.doctorName = undefined
  advFilter.bodyPartIds = undefined
  advFilter.projectIds = undefined
}

const onAdvancedSearch = () => {
  showAdvancedFilter.value = false
    ; (props.queryParams as any).areaId = advFilter.areaId || undefined
    ; (props.queryParams as any).hospitalId = advFilter.hospitalId || undefined
    ; (props.queryParams as any).patientName = advFilter.patientName || undefined
    ; (props.queryParams as any).operatorId = advFilter.operatorId || undefined
    ; (props.queryParams as any).doctorName = advFilter.doctorName || undefined
    ; (props.queryParams as any).bodyPartIds = (advFilter.bodyPartIds && advFilter.bodyPartIds.length > 0) ? advFilter.bodyPartIds : undefined
    ; (props.queryParams as any).projectIds = (advFilter.projectIds && advFilter.projectIds.length > 0) ? advFilter.projectIds : undefined
  fetchList()
}

// ── 高级筛选初始化 ────────────────────────────────────────────────────

const loadAdvancedFilterOptions = async () => {
  areaTreeOptions.value = areaTree
  const [userRes, bodyParts] = await Promise.all([
    userList({ pageNum: 1, pageSize: 999 }) as any,
    bodyPartOptions(),
  ])
  if (userRes?.records) {
    operatorOptions.value = (userRes.records as any[]).map((u: any) => ({
      label: u.displayName || u.nickname || u.username,
      value: u.id,
    }))
  }
  bodyPartFlatOptions.value = (bodyParts || []).map(bp => ({
    label: bp.name,
    value: bp.id,
  }))
}

const loadProjectsByBodyParts = async (bodyPartIds: number[]) => {
  await Promise.all(bodyPartIds.map(async bpId => {
    if (!projectCache.value[bpId]) {
      try {
        const res = await rebuildProjectByBodyPart(bpId)
        projectCache.value[bpId] = res || []
      } catch {
        projectCache.value[bpId] = []
      }
    }
  }))
}

watch(() => advFilter.bodyPartIds, async (newVal) => {
  if (newVal && newVal.length > 0) {
    await loadProjectsByBodyParts(newVal)
    advFilter.projectIds = undefined
  } else {
    advFilter.projectIds = undefined
  }
})

watch(showAdvancedFilter, (val) => {
  if (val) {
    advFilter.areaId = (props.queryParams as any).areaId || undefined
    advFilter.hospitalId = (props.queryParams as any).hospitalId || undefined
    advFilter.patientName = (props.queryParams as any).patientName || undefined
    advFilter.operatorId = (props.queryParams as any).operatorId || undefined
    advFilter.doctorName = (props.queryParams as any).doctorName || undefined
    advFilter.bodyPartIds = (props.queryParams as any).bodyPartIds || undefined
    advFilter.projectIds = (props.queryParams as any).projectIds || undefined
  }
})

// ── 暴露 ─────────────────────────────────────────────────────────────

const openAdvancedFilter = () => {
  showAdvancedFilter.value = true
}

defineExpose({ fetchList, loadColumnConfig, handleCreate, openAdvancedFilter, openDetail: handleView })

onMounted(() => {
  loadColumnConfig()
  // loadAdvancedFilterOptions()
  fetchList()
})
</script>

<style lang="scss" scoped>
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
}

.toolbar-info {
  font-size: 12.5px;
  color: #9ca3af;

  strong {
    color: #374151;
    font-weight: 600;
  }
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-muted {
  color: #9ca3af;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

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


// 旗形角标样式
.row-mark {
  position: absolute;
  top: 8px;
  left: 0;

  i {
    font-size: 40px;
  }

  // 待审核 - 红色
  &--pending {
    color: #f65d5d;
  }

  // 待修改 - warning 橙黄
  &--warning {
    color: #e6a23c;
  }

  .row-mark__text {
    font-size: 11px;
    font-weight: bold;
    color: #fff;
    position: absolute;
    top: -4px;
    left: -2px;
    transform: rotate(-45deg);
  }
}

.text-new-value {
  color: #16a34a;
  font-weight: 500;
}

// 二维码弹窗样式
.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 10px;
}

.qrcode-img {
  display: block;
  max-width: 100%;
}

.qrcode-patient-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.qrcode-url {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  word-break: break-all;
  text-align: center;
  max-width: 100%;
}

.icon-tag {
  display: flex;
  align-items: center;
}
</style>
