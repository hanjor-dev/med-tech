<template>
  <list-template page-class="account" hero-eyebrow="系统管理" hero-title="账户管理"
    hero-desc="管理系统用户账户，支持账户分类筛选、状态管理、密码重置与医院业务范围分配" :stats="stats" filter-searchable
    filter-search-placeholder="搜索账户名称、真实姓名" :filter-selects="filterSelects" filter-create-label="新建账户"
    @filter-search="onFilterSearch" @filter-reset="handleReset" @filter-create="handleCreate"
    @filter-change="onFilterChange" @filter-input-trigger="onFilterInputTrigger">

    <!-- Table Panel -->
    <div class="page-body-panel panel-flex-2">
      <el-card class="list-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">账户列表</div>
            <el-button link type="primary" size="small" @click="handleExport">
              <el-icon>
                <Download />
              </el-icon>
              导出
            </el-button>
          </div>
        </template>
        <div class="roles-list-wrap">
          <el-table ref="tableRef" :data="filteredUsers" highlight-current-row @current-change="handleCurrentChange"
            :row-class-name="getRowClassName" v-loading="loading" :header-cell-style="{ background: '#f9fafb' }">
            <el-table-column label="账户信息" min-width="180">
              <template #default="{ row }">
                <div class="user-info-cell">
                  <div class="user-avatar"
                    :style="row.avatar ? { background: 'transparent' } : { background: getAvatarBg(row.realName) }">
                    <img v-if="row.avatar" :src="row.avatar" class="user-avatar-img" alt="" />
                    <template v-else>{{ getAvatarText(row.realName) }}</template>
                  </div>
                  <div>
                    <div class="role-name">{{ row.username }}</div>
                    <div class="role-description">
                      <span>{{ row.realName }}</span>
                      <span class="role-code-tag" style="font-size: 11px">{{ row.roleName || '未分配角色' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="账户分类" prop="accountTypeName" min-width="120">
              <template #default="{ row }">
                <el-tag :type="row.accountType === '6.1' ? 'primary' : 'warning'">{{ row.accountTypeName || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="所属部门" prop="deptName" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="data-scope-text">{{ row.deptName || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="所属机构" prop="orgName" min-width="120" show-overflow-tooltip />

            <el-table-column label="联系方式" width="180">
              <template #default="{ row }">
                <div class="contact-cell">
                  <div>{{ row.phone }}</div>
                  <div class="contact-email">{{ row.email }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <span class="status-badge"
                  :class="row.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right" align="center">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd: any) => handleCommand(cmd, row)">
                  <el-button text :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon>
                          <Edit />
                        </el-icon>编辑账户
                      </el-dropdown-item>
                      <el-dropdown-item command="hospital" v-if="showHospitalConfig">
                        <el-icon>
                          <OfficeBuilding />
                        </el-icon>分配医院
                      </el-dropdown-item>
                      <el-dropdown-item command="resetPwd">
                        <el-icon>
                          <Key />
                        </el-icon>重置密码
                      </el-dropdown-item>
                      <el-dropdown-item command="toggle" :divided="true">
                        <el-icon>
                          <Switch />
                        </el-icon>
                        {{ row.status === 1 ? '禁用账户' : '启用账户' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <el-icon style="color: #e11d48">
                          <Delete />
                        </el-icon>
                        <span style="color: #e11d48">删除账户</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <page-box :currentPage="pageInfo.currentPage" :pageSize="pageInfo.pageSize" :totalCount="pageInfo.totalCount"
            @current-change="currentChange" />
        </div>
      </el-card>
    </div>
    <div class="page-body-panel ml-10">
      <div class="detail-column" :class="{ 'detail-column--empty': !selectedUser }">
        <!-- 空状态 -->
        <div v-if="!selectedUser" class="detail-empty">
          <el-empty description="请从左侧选择一个账户" :image-size="80" />
        </div>

        <!-- 已选账户详情 -->
        <el-card v-if="selectedUser" class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-title">账户详情</div>
            </div>
          </template>

          <div class="role-detail">
            <div class="detail-header">
              <div class="detail-role-name">{{ selectedUser.realName }}</div>
              <span class="status-badge"
                :class="selectedUser.status === 1 ? 'status-badge--active' : 'status-badge--inactive'">
                {{ selectedUser.statusName }}
              </span>
            </div>

            <span class="role-code-tag" style="margin: 6px 0 12px; display: inline-block;">{{ selectedUser.username
            }}</span>

            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">账户分类</p>
                <p class="detail-value">{{ selectedUser.accountTypeName }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">所属机构</p>
                <p class="detail-value">{{ selectedUser.orgName }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">所属部门</p>
                <p class="detail-value">{{ selectedUser.deptName || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">关联角色</p>
                <p class="detail-value">{{ selectedUser.roleName || '未分配' }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">工号</p>
                <p class="detail-value">{{ selectedUser.employeeNo || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">联系方式</p>
                <p class="detail-value">{{ selectedUser.phone }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <p class="detail-label">邮箱</p>
                <p class="detail-value">{{ selectedUser.email || '-' }}</p>
              </div>
              <div class="detail-stat">
                <p class="detail-label">创建时间</p>
                <p class="detail-value">{{ dayjs(selectedUser.createTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
              </div>
            </div>
            <div class="detail-stats" v-if="isDesignerRole">
              <div class="detail-stat">
                <p class="detail-label">专业方向</p>
                <div class="detail-hospital-row">
                  <span class="detail-hospital-names">{{ selectedUser.specialtyName || '暂未分配' }}</span>
                </div>
              </div>
            </div>
            <div class="detail-item" v-if="showHospitalConfig">
              <p class="detail-label">分配医院</p>
              <div class="detail-hospital-row">
                <span class="detail-hospital-names">{{ selectedUser.hospitalNames || '暂未分配' }}</span>
              </div>
            </div>
            <div class="detail-item" v-if="selectedUser.remark">
              <p class="detail-label">备注</p>
              <p class="detail-value">{{ selectedUser.remark }}</p>
            </div>
            <div class="detail-actions">
              <el-button style="flex: 1" @click="handleEdit(selectedUser)">
                <el-icon>
                  <Edit />
                </el-icon>编辑
              </el-button>
              <el-button style="flex: 1" @click="handleAssignHospital(selectedUser)" v-if="showHospitalConfig">
                <el-icon>
                  <OfficeBuilding />
                </el-icon>分配医院
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

  </list-template>
  <!-- 新建/编辑账户弹窗 -->
  <dialog-modal v-model="userDialogVisible" :title="editingUser ? '编辑账户' : '新建账户'" subtitle="完善账户基本信息并分配组织归属"
    width="1080px" :loading="userDialogLoading" @modal-close="userDialogVisible = false"
    @modal-confirm="handleSaveUser">
    <el-form ref="userFormRef" :model="userForm" :rules="userRules" class="dlr-root" label-position="top">
      <!-- 左侧身份边栏 -->
      <aside class="dlr-slidebar">
        <!-- Profile Header -->
        <div class="sidebar-profile">
          <!-- Avatar -->
          <div class="sidebar-profile-avatar-wrap">
            <div class="sidebar-avatar-default"
              :style="userForm.avatar ? { background: 'transparent' } : { background: getAvatarBg(userForm.realName || '?') }">
              <img v-if="userForm.avatar" :src="userForm.avatar" class="sidebar-avatar-img" alt="avatar" />
              <span v-else class="sidebar-avatar-default-text">{{ getAvatarText(userForm.realName || '?') }}</span>
            </div>
            <div class="sidebar-avatar-upload" @click.stop>
              <uploadFile ref="avatarUploadRef" :limit="1" :show-file-list="false" :show-tips="false"
                accept=".jpg,.jpeg,.png,gif,webp" :upload-data="{ bizType: '10.11' }" :initial-files="avatarFileList"
                button-text="" button-type="primary" button-size="small" @success="handleAvatarSuccess"
                @remove="handleAvatarRemove" />
            </div>
            <!-- Status badge floating -->
            <span class="sidebar-profile-status-badge"
              :class="editingUser && editingUser.status === 0 ? 'sidebar-profile-status-badge--off' : 'sidebar-profile-status-badge--on'">
              <span class="sidebar-profile-status-dot"></span>
            </span>
          </div>

          <!-- Name + Username -->
          <div class="sidebar-profile-names">
            <div class="sidebar-profile-realname">{{ userForm.realName || '待填写姓名' }}</div>
            <div class="sidebar-profile-username">
              <span class="sidebar-profile-username-at">@</span>{{ userForm.username || '用户名' }}
            </div>
          </div>

          <!-- Account type pill -->
          <div class="sidebar-profile-type-pill"
            :class="userForm.accountType === '6.1' ? 'sidebar-profile-type-pill--inner' : 'sidebar-profile-type-pill--outer'">
            <span class="sidebar-profile-type-icon">
              <el-icon>
                <User />
              </el-icon>
            </span>
            {{ userForm.accountType === '6.1' ? '企业账户' : '业务账户' }}
          </div>
        </div>

        <!-- Contact meta -->
        <div class="sidebar-profile-meta">
          <div class="sidebar-meta-row" v-if="userForm.phone">
            <span class="sidebar-meta-icon">
              <el-icon>
                <Message />
              </el-icon>
            </span>
            <span class="sidebar-meta-text">{{ userForm.phone }}</span>
          </div>
          <div class="sidebar-meta-row" v-if="userForm.email">
            <span class="sidebar-meta-icon">
              <el-icon>
                <Message />
              </el-icon>
            </span>
            <span class="sidebar-meta-text">{{ userForm.email }}</span>
          </div>
        </div>

        <!-- Hospital access strip -->
        <div class="sidebar-profile-strip" v-if="showHospitalConfig">
          <div class="sidebar-strip-header">
            <span class="sidebar-strip-icon">
              <el-icon>
                <OfficeBuilding />
              </el-icon>
            </span>
            <span class="sidebar-strip-label">可操作医院</span>
            <span class="sidebar-strip-count">{{ userForm.hospitalIds?.length || 0 }} 家</span>
          </div>
          <div class="sidebar-strip-bar" v-if="(userForm.hospitalIds?.length || 0) > 0">
            <div class="sidebar-strip-fill" :style="{ width: getHospitalBarWidth() }"></div>
          </div>
          <p class="sidebar-strip-hint" v-else>暂未分配医院权限</p>
        </div>

        <!-- Role indicator -->
        <div class="sidebar-profile-role">
          <div class="sidebar-role-label">关联角色</div>
          <div class="sidebar-role-value" v-if="userForm.roleId">
            <el-icon>
              <Key />
            </el-icon>
            <span>{{roleOptions.find(r => r.value === userForm.roleId)?.label || '—'}}</span>
          </div>
          <div class="sidebar-role-value sidebar-role-value--empty" v-else>
            <el-icon>
              <Key />
            </el-icon>
            <span>未分配角色</span>
          </div>
        </div>
      </aside>
      <!-- 右侧表单主区 -->
      <main class="dlr-main">
        <!-- 专业信息区块（角色） -->
        <section class="form-section form-section--professional">
          <div class="form-section-header">
            <span class="form-section-num">01</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">角色与组织架构</span>
          </div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="关联角色" prop="roleId">
                <el-select v-model="userForm.roleId" placeholder="请选择角色" style="width: 100%" clearable
                  @change="handleRoleChange">
                  <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="showProcessingCenter">
              <el-form-item label="加工中心" prop="centerId">
                <el-select v-model="userForm.centerId" placeholder="请选择加工中心" style="width: 100%" clearable>
                  <el-option v-for="item in processingCenterOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 业务账户/医院权限账户：先选部门 → 自动带出关联机构 -->
            <template v-if="userForm.accountType === '6.2' || (userForm.accountType === '6.1' && userForm.dataScopeType === 'hospitals')">
              <el-col :span="12">
                <el-form-item label="所属部门">
                  <el-select v-model="userForm.deptId" placeholder="请选择部门" style="width: 100%" clearable
                    @change="handleOuterDeptChange">
                    <el-option v-for="item in deptOptionsList" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属机构">
                  <el-select v-model="userForm.orgId" placeholder="由部门自动带出" style="width: 100%">
                    <el-option v-for="item in orgOptionsList" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>
            <!-- 其他情况：先选关联企业（机构），再选所属部门 -->
            <template v-else>
              <el-col :span="12">
                <el-form-item label="关联企业（机构）">
                  <el-select v-model="userForm.orgId" placeholder="由角色关联配置自动带出" style="width: 100%" disabled>
                    <el-option v-for="item in orgOptionsList" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属部门">
                  <el-select v-model="userForm.deptId" placeholder="选择部门（可选）" style="width: 100%" clearable>
                    <el-option v-for="item in deptOptionsList" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>

            <!-- 区域管理员：管理机构多选（排除已选的所属机构） -->
            <el-col :span="12" v-if="showManagedOrgSelect">
              <el-form-item label="管理机构" prop="managedOrgIds">
                <el-select v-model="userForm.managedOrgIds" placeholder="请选择管理机构" style="width: 100%"
                  multiple clearable collapse-tags collapse-tags-tooltip>
                  <el-option v-for="item in filteredManagedOrgOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="专业方向" v-if="isDesignerRole" prop="specialtyList">
                <el-select v-model="userForm.specialtyList" placeholder="请选择专业方向（支持多选）" style="width: 100%" clearable
                  multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="3">
                  <el-option v-for="item in specialtyOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资质证书" v-if="isDesignerRole" prop="qualification">
                <uploadFile ref="qualificationUploadRef" :limit="1" :show-file-list="true" :show-tips="true"
                  tips-text="支持 pdf、word、图片格式" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" button-text="上传证书"
                  :initial-files="qualificationFileList" :upload-data="{ bizType: '10.17' }"
                  @success="handleQualificationSuccess" @remove="handleQualificationRemove" />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 医院权限配置（条件展示，合并在专业信息内） -->
          <div class="hospital-permission-block" v-if="showHospitalConfig">
            <div class="hospital-permission-header">
              <span class="hospital-permission-header-icon">
                <el-icon>
                  <Key />
                </el-icon>
              </span>
              <span class="hospital-permission-header-title">医院权限分配</span>
              <el-button type="primary" link size="small" class="hospital-assign-btn"
                @click="handleOpenUserFormHospitalDialog">
                {{ displayedHospitalNames.length ? '修改' : '去选择' }}
              </el-button>
            </div>
            <div class="hospital-permission-body" v-if="displayedHospitalNames.length > 0">
              <el-tag v-for="(name, idx) in displayedHospitalNames.slice(0, 5)" :key="idx" size="small" type="info"
                effect="plain" class="hospital-name-tag">{{ name }}</el-tag>
              <el-tag v-if="displayedHospitalNames.length > 5" size="small" type="info" effect="plain"
                class="hospital-name-tag hospital-name-tag--more">
                +{{ displayedHospitalNames.length - 5 }}
              </el-tag>
            </div>
            <div class="hospital-permission-empty" v-else>
              <span>暂未分配医院权限</span>
            </div>
          </div>
        </section>
        <!-- 基础信息区块 -->
        <section class="form-section">
          <div class="form-section-header">
            <span class="form-section-num">02</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">基础信息</span>
          </div>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username" placeholder="登录账号，3-32字符"
                  :disabled="!!editingUser || autoUsernameEnabled" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="userForm.realName" placeholder="请输入真实姓名" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userForm.phone" type="tel" placeholder="请输入手机号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="登录密码">
                <el-input v-model="userForm.password" :placeholder="`不填则使用默认密码 ${defaultPassword}`" show-password
                  clearable :disabled="!!editingUser" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email" type="email" placeholder="请输入邮箱" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="工号" prop="employeeNo">
                <el-input v-model="userForm.employeeNo" placeholder="请输入工号（可选）" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="性别" prop="sex">
                <el-select v-model="userForm.sex" placeholder="选择性别" style="width: 100%">
                  <el-option v-for="item in sexOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <!-- 其他信息区块 -->
        <section class="form-section form-section--professional">
          <div class="form-section-header">
            <span class="form-section-num">03</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">其他信息</span>
          </div>
          <el-row :gutter="24">
            <!-- <el-col :span="12">
              <el-form-item label="结算类型" prop="settlementType">
                <el-select v-model="userForm.settlementType" placeholder="选择结算类型" style="width: 100%" clearable>
                  <el-option v-for="item in settlementTypeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col> -->
            <el-col :span="12" v-if="userForm.accountType === '6.1'">
              <el-form-item label="资产编号" prop="assetNumber">
                <el-input v-model="userForm.assetNumber" placeholder="资产编号（可选）" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="showChargingTemplate">
              <el-form-item label="收费模板" prop="chargingTemplateId">
                <el-select v-model="userForm.chargingTemplateId" placeholder="请选择收费模板" style="width: 100%" clearable
                  :loading="chargingTemplateLoading">
                  <el-option v-for="item in chargingTemplateOptions" :key="item.id" :label="item.templateName"
                    :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注信息" prop="remark">
                <el-input v-model="userForm.remark" placeholder="备注信息（可选）" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </main>
    </el-form>
  </dialog-modal>

  <!-- 医院分配弹窗 -->
  <dialog-modal v-model="hospitalDialogVisible"
    :title="hospitalDialogSource === 'userForm' ? '分配医院' : `分配医院 — ${hospitalTargetUser?.realName || ''}`"
    subtitle="选择用户可操作的医院范围" width="820px" :loading="hospitalDialogLoading" @modal-close="hospitalDialogVisible = false"
    @modal-confirm="handleSaveHospital">
    <div class="dialog-shell">
      <!-- 两栏布局：7(模板+模板医院) | 3(已选医院) -->
      <div class="hospital-dialog-body hospital-dialog-body--triple">

        <!-- 左侧 panel：医院模板列表 + 模板医院（内部 flex 排列） -->
        <div class="hospital-panel hospital-panel--left hospital-panel--tpl">
          <!-- 7a：医院模板列表 -->
          <div class="tpl-sub-panel tpl-sub-panel--list">
            <div class="hospital-panel-header" style="margin-bottom: 10px;">
              <span>
                <el-icon>
                  <Briefcase />
                </el-icon>
                医院模板
              </span>
            </div>
            <div class="hospital-perm-search">
              <el-input v-model="dialogHospitalSearchKeyword" placeholder="搜索模板名称..." clearable :prefix-icon="Search"
                style="width: 100%" />
            </div>
            <div class="hospital-perm-loading" v-if="dialogHospitalLoading">
              <span class="loading-dots"><span></span><span></span><span></span></span>
              <span class="loading-text">加载模板数据中...</span>
            </div>
            <div class="hospital-perm-grid" v-else>
              <div v-if="dialogFilteredTemplateList.length === 0" class="hospital-perm-empty">
                <el-icon class="hospital-perm-empty__icon">
                  <OfficeBuilding />
                </el-icon>
                <p class="hospital-perm-empty__text">
                  {{ dialogHospitalSearchKeyword ? '没有找到匹配模板' : '暂无可用模板' }}
                </p>
              </div>
              <div v-for="tpl in dialogFilteredTemplateList" :key="tpl.id" class="template-card"
                :class="{ 'template-card--active': activeTemplateId === tpl.id }" @click="activateTemplate(tpl)">
                <div class="template-card__header">
                  <div class="template-card__icon">
                    <el-icon>
                      <Briefcase />
                    </el-icon>
                  </div>
                  <div class="template-card__info">
                    <div class="template-card__name">{{ tpl.templateName }}</div>
                    <div class="template-card__meta">
                      <span class="template-card__count">
                        <el-icon>
                          <OfficeBuilding />
                        </el-icon>
                        {{ tpl.hospitalCount }} 家
                      </span>
                    </div>
                  </div>
                  <el-icon class="template-card__arrow">
                    <ArrowRight />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 7b：当前模板医院 -->
          <div class="tpl-sub-panel tpl-sub-panel--list">
            <div class="hospital-panel-header">
              <span>
                <el-icon>
                  <OfficeBuilding />
                </el-icon>
                {{ activeTemplateName || '模板医院' }}
              </span>
              <el-button link type="primary" size="small" @click="toggleTemplateAllHospitals"
                v-if="activeTemplateHospitals.length > 0">
                {{ isActiveTemplateAllSelected ? '取消全选' : '全选' }}
              </el-button>
            </div>
            <div class="hospital-perm-loading" v-if="activeTemplateLoading">
              <span class="loading-dots"><span></span><span></span><span></span></span>
              <span class="loading-text">加载医院数据中...</span>
            </div>
            <div class="hospital-empty" v-else-if="!activeTemplateId">
              <el-icon>
                <Briefcase />
              </el-icon>
              <p class="hospital-empty-hint">请从左侧选择模板<br>查看并勾选医院</p>
            </div>
            
            <div class="hospital-list" v-else-if="activeTemplateHospitals.length === 0">
              <div class="hospital-perm-empty">
                <el-icon class="hospital-perm-empty__icon">
                  <OfficeBuilding />
                </el-icon>
                <p class="hospital-perm-empty__text">该模板下暂无医院</p>
              </div>
            </div>
            
            <div class="hospital-list" v-else>
           
              <div v-for="hospital in activeTemplateHospitals" :key="hospital.id" class="hospital-item" :class="{
                'hospital-item--selected': selectedHospitalIds.includes(hospital.id),
                'hospital-item--assigned': hospital.assigned,
                'hospital-item--disabled': hospital.isAvailable === false
              }" @click="toggleHospital(hospital.id, hospital.isAvailable)">
                <div class="hospital-item-inner">
                  <div class="hospital-info">
                    <span class="hospital-name">{{ hospital.hospitalName }}</span>
                    <span v-if="hospital.isAvailable === false"
                      class="hospital-assigned-tip hospital-assigned-tip--unavailable">
                      <el-icon>
                        <Lock />
                      </el-icon>
                      不可选
                    </span>
                    <span v-else-if="hospital.assigned" class="hospital-assigned-tip">
                      <el-icon>
                        <WarningFilled />
                      </el-icon>
                      已被其他用户分配
                    </span>
                  </div>
                  <div class="hospital-check">
                    <el-icon v-if="selectedHospitalIds.includes(hospital.id)">
                      <Check />
                    </el-icon>
                    <span v-else class="hospital-check-empty"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3：已选医院 -->
        <div class="hospital-panel hospital-panel--right">
          <div class="hospital-panel-header">
            <span>
              <el-icon>
                <CircleCheck />
              </el-icon>
              已选医院
              <span class="hospital-panel-header__count" v-if="selectedHospitalIds.length > 0">{{
                selectedHospitalIds.length }}</span>
            </span>
            <el-button link type="primary" size="small" @click="clearSelectedHospitals"
              v-if="selectedHospitalIds.length > 0">清空</el-button>
          </div>
          <div class="hospital-tags" v-if="dialogSelectedHospitalsDisplay.length > 0">
            <div v-for="item in dialogSelectedHospitalsDisplay" :key="item.id" class="hospital-tag-item">
              <span class="hospital-tag-name">{{ item.hospitalName }}</span>
              <el-icon class="hospital-tag-remove" @click.stop="handleHospitalTagRemove(item.id)">
                <Close />
              </el-icon>
            </div>
          </div>
          <div class="hospital-empty" v-else>
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <p class="hospital-empty-hint">点击上方医院进行分配</p>
          </div>
        </div>

      </div>
    </div>
  </dialog-modal>

</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  Search,
  Edit,
  Delete,
  MoreFilled,
  Key,
  Switch,
  UserFilled,
  CircleCheck,
  OfficeBuilding,
  Lock,
  Message,
  Briefcase,
  Close,
  Check,
  ArrowRight,
  WarningFilled,
  User,
  Download,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import PageBox, { type PageProps } from '@/components/pageBox.vue'
import listTemplate from '@/components/listTemplate.vue'
import {
  userList,
  userDetail,
  userCreate,
  userUpdate,
  userDelete,
  userChangeStatus,
  userResetPassword,
  userHospitals,
  userAssignHospitals,
  usernamePreview,
  exportUserList,
  userStatistics,
  type UserVO,
  type UserForm,
  type UserQuery,
  type UserStatisticsVO,
} from '@/api/user'
import { orgAll, orgDetail } from '@/api/org'
import { depAll, deptDetail } from '@/api/dept'
import { roleAll } from '@/api/role'
import { hospitalTemplateOptions as getHospitalTemplateOptions, hospitalTemplateDetail, type HospitalTemplateSimpleVO } from '@/api/hospital'
import { listAllProcessingCenter } from '@/api/basic'
import { chargingTemplateAll, type ChargingTemplateVO } from '@/api/chargingTemplate'
import { getDictOptions } from '@/utils/dict'
import { getConfigDetailByKey } from '@/api/param'
import uploadFile from '@/components/uploadFile.vue'
import dayjs from 'dayjs'

export type UserCommand = 'edit' | 'hospital' | 'resetPwd' | 'toggle' | 'delete'

// ========== Data ==========
const loading = ref(false)
const searchText = ref('')
const filterAccountType = ref<string | undefined>()
const filterStatus = ref<number | undefined>()
const filterRoleId = ref<number | undefined>()
const selectedUser = ref<UserVO | null>(null)
const tableRef = ref()
const userDialogVisible = ref(false)
const userDialogLoading = ref(false)
const hospitalDialogVisible = ref(false)
const hospitalDialogLoading = ref(false)
const resetPwdDialogLoading = ref(false)
const userFormRef = ref<FormInstance>()
const defaultPassword = ref('123456')
const autoUsernameEnabled = ref(false)
const usernamePreviewLoading = ref(false)
// 筛选下拉选项（与 listTemplate filter-selects 对应）
const filterSelects = computed(() => [
  {
    modelKey: 'accountType',
    placeholder: '全部账户类型',
    options: [
      { label: '全部账户类型', value: '' },
      ...accountTypeOptions.value.map(item => ({ label: item.label, value: String(item.value) })),
    ]
  },
  {
    modelKey: 'status',
    placeholder: '状态',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
    ]
  },
  {
    modelKey: 'roleId',
    placeholder: '全部角色',
    options: [
      { label: '全部角色', value: '' },
      ...roleOptions.value.map(item => ({ label: item.label, value: item.value })),
    ]
  }
])

// 处理 listTemplate 筛选项变化
const onFilterChange = (key: string, value: any) => {
  if (key === 'accountType') filterAccountType.value = value
  if (key === 'status') filterStatus.value = value
  if (key === 'roleId') filterRoleId.value = value || undefined
  loadData()
}

// 输入框触发查询（blur / Enter）
const onFilterInputTrigger = ({ modelKey, value }: { modelKey: string; value: string }) => {
  if (modelKey === 'search') {
    searchText.value = value
    loadData()
  }
}

// 搜索框触发查询（blur / Enter）
const onFilterSearch = (keyword: string) => {
  searchText.value = keyword
  loadData()
}

const editingUser = ref<UserVO | null>(null)
const hospitalTargetUser = ref<UserVO | null>(null)
// hospital dialog 的打开来源：'userForm' | 'sidebar'
const hospitalDialogSource = ref<'userForm' | 'sidebar' | null>(null)
const selectedHospitalIds = ref<number[]>([])
const dialogUserSelectedHospitals = ref<any[]>()
const dialogHospitalSearchKeyword = ref('')
const dialogHospitalLoading = ref(false)
const dialogTemplateHospitalMap = ref<Map<number, any[]>>(new Map())
// 当前激活的模板 ID（点击模板后激活，右侧显示该模板下医院）
const activeTemplateId = ref<number | null>(null)
// 当前模板医院加载状态
const activeTemplateLoading = ref(false)

// 右侧：当前激活模板下的医院列表
const activeTemplateHospitals = computed(() => {
  if (!activeTemplateId.value) return []
  return dialogTemplateHospitalMap.value.get(activeTemplateId.value) || []
})

// 当前模板名称
const activeTemplateName = computed(() => {
  if (!activeTemplateId.value) return ''
  return hospitalTemplateOptions.value.find(t => t.id === activeTemplateId.value)?.templateName || ''
})

// 当前模板是否全选
const isActiveTemplateAllSelected = computed(() => {
  const hospitals = activeTemplateHospitals.value
  return hospitals.length > 0 && hospitals.every(h => selectedHospitalIds.value.includes(h.id))
})

const pageInfo = reactive<PageProps>({
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
})

const users = ref<UserVO[]>([])
const accountStatistics = ref<UserStatisticsVO | null>(null)

const userForm = ref<UserForm>({
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  sex: undefined,
  avatar: '',
  accountType: '6.1',
  dataScopeType: '',
  orgId: undefined,
  deptId: undefined,
  roleId: undefined,
  employeeNo: '',
  specialtyList: [] as string[],
  qualification: '',
  settlementType: undefined,
  hospitalIds: [],
  remark: '',
  assetNumber: '',
  chargingTemplateId: undefined,
  centerId: undefined,
})

// ========== Computed ==========
const stats = computed(() => [
  {
    label: '账户总数',
    value: accountStatistics.value?.total ?? '—',
    icon: UserFilled
  },
  {
    label: '企业账户',
    value: accountStatistics.value?.enterprise ?? '—',
    icon: Lock
  },
  {
    label: '业务账户',
    value: accountStatistics.value?.business ?? '—',
    icon: OfficeBuilding
  },
])

const filteredUsers = computed(() => {
  const s = searchText.value.trim().toLowerCase()
  return users.value.filter((u) => {
    const matchSearch = !s
      || u.username.toLowerCase().includes(s)
      || u.realName.toLowerCase().includes(s)
      || u.phone.includes(s)
      || u.orgName.toLowerCase().includes(s)
      || u.deptName?.toLowerCase().includes(s)
    const matchAccountType = filterAccountType.value === undefined || u.accountType === filterAccountType.value
    const matchStatus = filterStatus.value === undefined || u.status === filterStatus.value
    return matchSearch && matchAccountType && matchStatus
  })

})

const loadStatistics = async () => {
  try {
    accountStatistics.value = await userStatistics() as unknown as UserStatisticsVO
  } catch (error) {
    accountStatistics.value = null
    console.error('加载账户统计失败', error)
  }
}

// 加载角色选项（已有值则跳过）
const loadRoleOptions = async () => {
  if (roleOptions.value.length > 0) return
  try {
    const res: any = await roleAll()
    roleOptions.value = (((res as any[]) || [])).map((r: any) => ({
      label: r.roleName,
      value: r.id,
      roleCode: r.roleCode,
      dataScopeType: r.dataScopeType,
      accountType: r.accountType,
    }))
  } catch {
    // ignore
  }
}

// 加载部门选项（已有值则跳过）
const loadDeptOptions = async () => {
  if (allDeptOptions.value.length > 0) return
  try {
    const res: any = await depAll()
    allDeptOptions.value = ((res as any[]) || []).map((d: any) => ({
      label: d.deptName,
      value: d.id,
      deptType: d.deptType,
    }))
  } catch {
    // ignore
  }
}

// 外部用户：部门变更时自动带出关联机构
const handleOuterDeptChange = async (deptId: number | undefined) => {
  userForm.value.orgId = undefined
  orgOptionsList.value = []
  if (!deptId) return
  try {
    const res: any = await deptDetail(deptId)
    const orgs = ((res?.orgs as any[]) || [])
    if (orgs.length > 0) {
      orgOptionsList.value = orgs.map((o: any) => ({
        label: o.orgName,
        value: o.id,
      }))
      userForm.value.orgId = orgs[0].id
    }
  } catch {
    // ignore
  }
}

// 部门全量缓存（按 accountType / deptType 筛选展示）
const allDeptOptions = ref<{ label: string; value: number; deptType: string }[]>([])
const deptOptionsList = computed(() => {
  const accountType = userForm.value.accountType
  if (!accountType) return []
  return allDeptOptions.value.filter((d) => d.deptType === accountType)
})

// 机构下拉选项（内部：角色配置自动带出；外部：部门带出）
const orgOptionsList = ref<{ label: string; value: number }[]>([])

// 角色下拉选项（包含 roleCode 和 dataScopeType）
const roleOptions = ref<{ label: string; value: number; roleCode: string; dataScopeType: string; accountType?: string }[]>([])

// 医院组合模板下拉选项
const hospitalTemplateOptions = ref<HospitalTemplateSimpleVO[]>([])

// 已选医院组合模板 ID（多选）
const selectedHospitalTemplateIds = ref<number[]>([])

// 医院卡片列表（带详情）
const hospitalCards = ref<any[]>([])

// 医院搜索关键词
const hospitalSearchKeyword = ref('')

// 医院卡片加载状态
const hospitalLoading = ref(false)

// 已选模板的标签列表
const selectedTemplateTagList = computed(() => {
  return hospitalTemplateOptions.value.filter(t => selectedHospitalTemplateIds.value.includes(t.id))
})

// 过滤后的医院卡片（根据搜索关键词）
const filteredHospitalCards = computed(() => {
  const kw = hospitalSearchKeyword.value.trim().toLowerCase()
  if (!kw) return hospitalCards.value
  return hospitalCards.value.filter(h =>
    h.hospitalName?.toLowerCase().includes(kw) ||
    h.address?.toLowerCase().includes(kw) ||
    h.province?.toLowerCase().includes(kw) ||
    h.city?.toLowerCase().includes(kw)
  )
})

// 医院穿梭框选项（保留兼容）
const hospitalTransferOptions = ref<{ key: number; label: string; disabled: boolean }[]>([])

// 性别字典选项
const sexOptions = ref<{ label: string; value: string; valueId: number }[]>([])

// 资质证书文件列表（uploadFile 组件绑定）
const qualificationFileList = ref<any[]>([])

// 资质证书上传成功：更新 userForm.qualification
const handleQualificationSuccess = (_file: any, response: any) => {
  userForm.value.qualification = response.data?.fileUrl || response.fileUrl
}

// 资质证书移除：清空 userForm.qualification
const handleQualificationRemove = () => {
  userForm.value.qualification = ''
}

// 头像文件列表（uploadFile 组件绑定）
const avatarFileList = ref<any[]>([])

// 头像上传成功：更新 userForm.avatar
const handleAvatarSuccess = (_file: any, response: any) => {
  const url = response.data?.fileUrl || response.fileUrl
  userForm.value.avatar = url
  avatarFileList.value = [{ name: '头像', url, status: 'success' as const }]
}

// 头像移除：清空 userForm.avatar
const handleAvatarRemove = () => {
  userForm.value.avatar = ''
  avatarFileList.value = []
}

// 专业方向字典选项
const specialtyOptions = ref<{ label: string; value: string }[]>([])

// 结算类型选项
const settlementTypeOptions = ref<{ label: string; value: number }[]>([])

// 收费模板选项
const chargingTemplateOptions = ref<ChargingTemplateVO[]>([])
const chargingTemplateLoading = ref(false)

// 加载收费模板选项列表
const loadChargingTemplateOptions = async () => {
  if (chargingTemplateOptions.value.length > 0) return
  chargingTemplateLoading.value = true
  try {
    chargingTemplateOptions.value = await chargingTemplateAll()
  } catch {
    chargingTemplateOptions.value = []
  } finally {
    chargingTemplateLoading.value = false
  }
}

// 加载加工中心选项列表
const loadProcessingCenterOptions = async () => {
  if (processingCenterOptions.value.length > 0) return
  try {
    const res: any = await listAllProcessingCenter()
    processingCenterOptions.value = (((res as any[]) || [])).map((c: any) => ({
      label: c.centerName,
      value: c.id,
    }))
  } catch {
    // ignore
  }
}

// 加载管理机构列表（经销商 orgType=1.2 / 服务商 orgType=1.4，状态正常 status=1）
const loadManagedOrgOptions = async () => {
  if (managedOrgOptions.value.length > 0) return
  try {
    const res: any = await orgAll()
    const list: any[] = Array.isArray(res) ? res : (res?.data ?? [])
    managedOrgOptions.value = list
      .filter((o: any) => (o.orgType === '1.2' || o.orgType === '1.4') && o.status === 1)
      .map((o: any) => ({ label: o.orgName, value: o.id }))
  } catch {
    // ignore
  }
}

// 账户类型选项（用于筛选栏）
const accountTypeOptions = ref<{ label: string; value: string }[]>([])

// 加工中心选项列表
const processingCenterOptions = ref<{ label: string; value: number }[]>([])

// 管理机构选项列表
const managedOrgOptions = ref<{ label: string; value: number }[]>([])

// 是否显示管理机构选择（当角色为区域管理员 regional-manager 时）
const showManagedOrgSelect = computed(() => {
  const code = currentSelectedRole.value?.roleCode || ''
  return code === 'regional-manager'
})

// 管理机构选项（排除已选的所属机构）
const filteredManagedOrgOptions = computed(() => {
  return managedOrgOptions.value.filter(o => o.value !== userForm.value.orgId)
})

// 是否显示加工中心选择（当角色为 production-worker 或 production-manager 时）
const showProcessingCenter = computed(() => {
  const code = currentSelectedRole.value?.roleCode || ''
  return code === 'production-worker' || code === 'production-manager'
})

// 当前选中角色的完整对象
const currentSelectedRole = computed(() => {
  return roleOptions.value.find(r => r.value === userForm.value.roleId) || null
})

// 是否为设计师角色（优先从表单当前选中角色读取，编辑模式下切换角色时实时响应）
const isDesignerRole = computed(() => {
  const code = currentSelectedRole.value?.roleCode || selectedUser.value?.roleCode || ''
  return code === 'designer' || code === 'designer-manager'
})

// 是否显示收费模板（仅业务账户需要）
const showChargingTemplate = computed(() => {
  return userForm.value.accountType === '6.2'
})

// 弹窗：过滤后的模板列表（按关键词搜索）
const dialogFilteredTemplateList = computed(() => {
  const kw = dialogHospitalSearchKeyword.value.trim().toLowerCase()
  if (!kw) return hospitalTemplateOptions.value
  return hospitalTemplateOptions.value.filter(t =>
    t.templateName?.toLowerCase().includes(kw) ||
    t.templateCode?.toLowerCase().includes(kw)
  )
})

// 弹窗：点击模板行 → 设为激活，并异步加载该模板下的医院
const activateTemplate = async (template: HospitalTemplateSimpleVO) => {
  if (activeTemplateId.value === template.id) {
    activeTemplateId.value = null
    return
  }
  activeTemplateId.value = template.id

  const isCached = dialogTemplateHospitalMap.value.has(template.id)
  if (isCached) return

  activeTemplateLoading.value = true
  try {
    const res: any = await hospitalTemplateDetail(template.id)
    const details = res?.details || []
    const hospitals = details.map((d: any) => ({
      id: d.hospitalId,
      label: d.hospitalName || d.name || `医院 ${d.hospitalId}`,
      hospitalName: d.hospitalName || d.name || `医院 ${d.hospitalId}`,
      level: d.level,
      levelText: d.levelText,
      address: d.address,
      province: d.province,
      city: d.city,
      assigned: d.assigned ?? false,
      isAvailable: d.isAvailable,
    }))
    dialogTemplateHospitalMap.value.set(template.id, hospitals)
    dialogTemplateHospitalMap.value = new Map(dialogTemplateHospitalMap.value)
  } catch (e) {
    dialogTemplateHospitalMap.value.set(template.id, [])
    dialogTemplateHospitalMap.value = new Map(dialogTemplateHospitalMap.value)
  } finally {
    activeTemplateLoading.value = false
  }
}

// 弹窗：当前模板全选 / 取消全选
const toggleTemplateAllHospitals = () => {
  const hospitals = activeTemplateHospitals.value
  if (hospitals.length === 0) return
  if (isActiveTemplateAllSelected.value) {
    // 取消全选：移除该模板所有医院
    const idsToRemove = new Set(hospitals.map(h => h.id))
    selectedHospitalIds.value = selectedHospitalIds.value.filter(id => !idsToRemove.has(id))
    if (hospitalDialogSource.value === 'userForm' && dialogUserSelectedHospitals.value) {
      dialogUserSelectedHospitals.value = dialogUserSelectedHospitals.value.filter(h => !idsToRemove.has(h.id))
    }
  } else {
    // 全选：添加该模板所有医院
    const newIds = [...selectedHospitalIds.value, ...hospitals.map(h => h.id)]
    selectedHospitalIds.value = Array.from(new Set(newIds))
    if (hospitalDialogSource.value === 'userForm' && dialogUserSelectedHospitals.value) {
      hospitals.forEach(h => {
        if (!dialogUserSelectedHospitals.value!.find(d => d.id === h.id)) {
          dialogUserSelectedHospitals.value!.push({ id: h.id, hospitalName: h.hospitalName })
        }
      })
    }
  }
}

// 弹窗：已选医院的展示列表
const dialogSelectedHospitalsDisplay = computed(() => {
  if (hospitalDialogSource.value === 'userForm') {
    return dialogUserSelectedHospitals.value || []
  }
  // editingUser 逻辑（侧边栏来源）
  const ids = editingUser.value?.hospitalIds || []
  const namesRaw = editingUser.value?.hospitalNames
  // hospitalNames 可能是逗号分隔的字符串，也可能是数组
  const names = typeof namesRaw === 'string'
    ? namesRaw.split(/[,，]/).map((s: string) => s.trim())
    : (namesRaw || [])

  if (dialogTemplateHospitalMap.value.size > 0) {
    // 从模板医院缓存建立 id -> name 映射
    const templateNameMap = new Map<number, string>()
    dialogTemplateHospitalMap.value.forEach((hospitals: any[]) => {
      hospitals.forEach((h: any) => templateNameMap.set(h.id, h.hospitalName))
    })
    return selectedHospitalIds.value.map((id: number, index: number) => ({
      id,
      hospitalName: templateNameMap.get(id) || names[index] || `医院 ${id}`,
    }))
  } else {
    return ids.map((id: number, index: number) => ({
      id,
      hospitalName: names[index] || `医院 ${id}`,
    }))
  }
})

// 弹窗：切换医院选中状态
const toggleHospital = (id: number, isAvailable?: boolean) => {
  if (isAvailable === false) return
  const idx = selectedHospitalIds.value.indexOf(id)
  if (idx > -1) {
    selectedHospitalIds.value.splice(idx, 1)
    // 同步移除 dialogUserSelectedHospitals 中的记录
    if (hospitalDialogSource.value === 'userForm' && dialogUserSelectedHospitals.value) {
      dialogUserSelectedHospitals.value = dialogUserSelectedHospitals.value.filter(h => h.id !== id)
    }
  } else {
    selectedHospitalIds.value.push(id)
    // 同步添加记录到 dialogUserSelectedHospitals（用于 userForm 来源的右侧展示）
    if (hospitalDialogSource.value === 'userForm' && dialogUserSelectedHospitals.value) {
      const existing = dialogUserSelectedHospitals.value.find(h => h.id === id)
      if (!existing) {
        const fromTemplate = activeTemplateHospitals.value.find(h => h.id === id)
        dialogUserSelectedHospitals.value.push({
          id,
          hospitalName: fromTemplate?.hospitalName || `医院 ${id}`,
        })
      }
    }
  }
}

// 弹窗：清空已选医院
const clearSelectedHospitals = () => {
  selectedHospitalIds.value = []
  if (hospitalDialogSource.value === 'userForm' && dialogUserSelectedHospitals.value) {
    dialogUserSelectedHospitals.value = []
  }
}
//删除已选医院
const handleHospitalTagRemove = (id: number) => {
  const idx = selectedHospitalIds.value.indexOf(id)
  if (idx > -1) {
    selectedHospitalIds.value.splice(idx, 1)
  }
  if (hospitalDialogSource.value === 'userForm' && dialogUserSelectedHospitals.value) {
    dialogUserSelectedHospitals.value = dialogUserSelectedHospitals.value.filter(h => h.id !== id)
  }
}

// 弹窗：模板变更（加载模板下医院，自动合并已选）
const showHospitalConfig = ref(false)

const displayedHospitalNames = computed(() => {
  return hospitalCards.value.map(h => h.hospitalName || h.orgName || h.name).filter(Boolean)
})

const getHospitalBarWidth = () => {
  const count = userForm.value.hospitalIds?.length || 0
  if (count === 0) return '0%'
  const maxDisplay = 20
  return `${Math.min((count / maxDisplay) * 100, 100)}%`
}

// ========== Rules ==========
const userRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  roleId: [{ required: true, message: '请选择关联角色', trigger: 'change' }],
  orgId: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (userForm.value.dataScopeType === 'hospitals' && !_value) {
          callback(new Error('请先选择所属部门以带出机构'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  specialtyList: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (isDesignerRole.value && (!userForm.value.specialtyList || userForm.value.specialtyList.length === 0)) {
          callback(new Error('设计师角色必须选择至少一个专业方向'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  centerId: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (showProcessingCenter.value && !_value) {
          callback(new Error('生产角色必须选择加工中心'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// ========== Methods ==========
const loadData = async () => {
  loading.value = true
  try {
    const query: UserQuery = {
      pageNum: pageInfo.currentPage,
      pageSize: pageInfo.pageSize,
      keyword: searchText.value || undefined,
      accountType: filterAccountType.value,
      status: filterStatus.value,
      roleId: filterRoleId.value,
    }
    const res = await userList(query) as any
    users.value = (res.records || []).map((u: any) => {
      const roleCode = roleOptions.value.find((r: any) => r.value === u.roleId)?.roleCode || ''
      const dataScopeType = roleOptions.value.find((r: any) => r.value === u.roleId)?.dataScopeType || ''
      const hospitalNames = u.hospitalNames.join(', ')
      return { ...u, roleCode, dataScopeType, hospitalNames }
    })
    pageInfo.totalCount = res.total || 0
    selectedUser.value = filteredUsers.value[0]
    tableRef.value?.setCurrentRow(filteredUsers.value[0])
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

// ── 弹窗相关选项（医院模板、默认密码、字典）──
const loadDialogOptions = async () => {
  try {
    const [templateRes, configPasswordRes, configUsernameRes, specialtyData, sexData] = await Promise.all([
      getHospitalTemplateOptions() as any,
      getConfigDetailByKey('default.password') as any,
      getConfigDetailByKey('user.username.auto.generate') as any,
      getDictOptions('7'),
      getDictOptions('9'),
      loadChargingTemplateOptions()
    ])
    hospitalTemplateOptions.value = (((templateRes as any[]) || []))
    if (configPasswordRes?.configValue) {
      defaultPassword.value = configPasswordRes.configValue
    }
    if (configUsernameRes?.configValue) {
      autoUsernameEnabled.value = true
    }
    specialtyOptions.value = specialtyData.map(d => ({ label: d.label, value: d.value }))
    sexOptions.value = sexData.map(d => ({ label: d.label, value: d.value, valueId: d.id }))
    // settlementTypeOptions.value = settlementData.map(d => ({ label: d.label, value: Number(d.value) }))
  } catch {
    // ignore
  }
}

// 机构变更时自动生成用户名
watch(
  () => userForm.value.orgId,
  async (newOrgId) => {
    if (!autoUsernameEnabled.value || !newOrgId) return
    if (editingUser.value) return
    usernamePreviewLoading.value = true
    try {
      const res = await usernamePreview(newOrgId) as any
      if (res) {
        userForm.value.username = res
      }
    } catch {
      // ignore
    } finally {
      usernamePreviewLoading.value = false
    }
  },
  { immediate: false }
)

const handleReset = () => {
  searchText.value = ''
  filterAccountType.value = undefined
  filterStatus.value = undefined
  loadData()
}

// 角色变更时重置关联字段
const handleRoleChange = async (value: number | undefined) => {
  if (!value) {
    userForm.value.accountType = '6.1'
    userForm.value.deptId = undefined
    userForm.value.orgId = undefined
    orgOptionsList.value = []
    showHospitalConfig.value = false
    userForm.value.managedOrgIds = undefined
    managedOrgOptions.value = []
    return
  }
  const selectedRole = roleOptions.value.find((r: any) => r.value === value)
  // 根据角色类型自动切换 accountType 并记录 dataScopeType
  if (selectedRole?.accountType) {
    userForm.value.accountType = selectedRole.accountType
  } else {
    userForm.value.accountType = '6.1' // 默认内部
  }
  userForm.value.dataScopeType = selectedRole?.dataScopeType || ''
  // 根据角色 dataScopeType 决定是否显示医院权限配置
  showHospitalConfig.value = selectedRole?.dataScopeType === 'hospitals'
  // 重置组织架构字段
  userForm.value.deptId = undefined
  userForm.value.orgId = undefined
  orgOptionsList.value = []
  // 统一加载部门列表（内部/外部均使用同一接口）
  await loadDeptOptions()

  const isDeptFirstOrg = userForm.value.accountType === '6.2' || (userForm.value.accountType === '6.1' && userForm.value.dataScopeType === 'hospitals')
  if (!isDeptFirstOrg) {
    await handleInnerLoadDefaultOrg()
  }
  // 先选部门再自动带出关联机构（等待用户选择部门后触发）

  // 重置专业方向（设计师角色变更时清空）
  userForm.value.specialtyList = []
  // 重置医院权限（dataScope 变更时清空）
  userForm.value.hospitalIds = []
  selectedHospitalTemplateIds.value = []
  hospitalCards.value = []
  hospitalSearchKeyword.value = ''
  // 重置资质证书
  userForm.value.qualification = ''
  qualificationFileList.value = []
  avatarFileList.value = []
  // 清空收费模板（非业务账户不需要）
  if (userForm.value.accountType !== '6.2') {
    userForm.value.chargingTemplateId = undefined
  }

  // 重置加工中心（角色变更时清空）
  userForm.value.centerId = undefined

  const roleCode = selectedRole?.roleCode || ''

  // 加载加工中心列表（如果是生产角色）
  if (roleCode === 'production-worker' || roleCode === 'production-manager') {
    await loadProcessingCenterOptions()
  }

  // 加载管理机构列表（如果是区域管理员角色）
  if (roleCode === 'regional-manager') {
    await loadManagedOrgOptions()
  } else {
    // 切换为其他角色时隐藏并清空管理机构字段
    userForm.value.managedOrgIds = undefined
    managedOrgOptions.value = []
  }
}

// 内部用户：根据全局配置查询默认机构并自动带出
const handleInnerLoadDefaultOrg = async () => {
  try {
    const configRes: any = await getConfigDetailByKey('manufacturer.org.id')
    const defaultOrgId = configRes?.configValue
    if (!defaultOrgId) return
    const orgRes: any = await orgDetail(Number(defaultOrgId))
    if (!orgRes) return
    orgOptionsList.value = [{ label: orgRes.orgName, value: orgRes.id }]
    userForm.value.orgId = orgRes.id
  } catch {
    // ignore
  }
}

const currentChange = (val: number) => {
  pageInfo.currentPage = val
  loadData()
}

const handleCurrentChange = async (row: UserVO | null) => {
  selectedUser.value = row
  if (!row) return
  loading.value = true
  try {
    const res = await userDetail(row.id) as any
    const detail = res?.data ?? res as UserVO
    editingUser.value = detail
    userForm.value = { ...detail }
    selectedHospitalTemplateIds.value = []
    hospitalCards.value = []
    hospitalSearchKeyword.value = ''
    qualificationFileList.value = detail.qualification
      ? [{ name: '资质证书', url: detail.qualification, status: 'success' as const }]
      : []
    showHospitalConfig.value = !!(detail.hospitalIds?.length > 0)
  } catch {
    ElMessage.error('加载账户详情失败')
  } finally {
    loading.value = false
  }
}

const getRowClassName = ({ row }: { row: UserVO }) => {
  return selectedUser.value?.id === row.id ? 'selected-row' : ''
}

const handleCommand = (command: UserCommand, row: UserVO) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'hospital':
      handleAssignHospital(row)
      break
    case 'resetPwd':
      handleResetPwd(row)
      break
    case 'toggle':
      handleToggleStatus(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleCreate = async () => {
  editingUser.value = null
  userForm.value = {
    username: '',
    password: '',
    realName: '',
    phone: '',
    email: '',
    sex: undefined,
    avatar: '',
    accountType: '6.1',
    dataScopeType: '',
    orgId: undefined,
    deptId: undefined,
    roleId: undefined,
    employeeNo: '',
    specialtyList: [],
    qualification: '',
    settlementType: undefined,
    hospitalIds: [],
    remark: '',
    assetNumber: '',
    centerId: undefined,
    managedOrgIds: undefined,
  }
  selectedHospitalTemplateIds.value = []
  hospitalCards.value = []
  hospitalSearchKeyword.value = ''
  qualificationFileList.value = []
  orgOptionsList.value = []
  allDeptOptions.value = []
  showHospitalConfig.value = false
  managedOrgOptions.value = []
  await Promise.all([loadDialogOptions(), loadDeptOptions()])
  userDialogVisible.value = true
}

const handleExport = async () => {
  try {
    const { blob, fileName } = await exportUserList()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleEdit = async (user: UserVO) => {
  editingUser.value = user
  selectedHospitalTemplateIds.value = []
  hospitalCards.value = []
  hospitalSearchKeyword.value = ''
  orgOptionsList.value = []
  allDeptOptions.value = []
  await Promise.all([loadDialogOptions(), loadDeptOptions()])
  try {
    const detail = await userDetail(user.id) as any
    userForm.value = { ...detail }
    qualificationFileList.value = detail.qualification
      ? [{ name: '资质证书', url: detail.qualification, status: 'success' as const }]
      : []
    avatarFileList.value = detail.avatar
      ? [{ name: '头像', url: detail.avatar, status: 'success' as const }]
      : []
    const dataScopeType = roleOptions.value.find((r: any) => r.value === detail.roleId)?.dataScopeType || ''
    userForm.value.dataScopeType = dataScopeType
    // dataScopeType 为 hospitals：部门已带回机构，通过部门变更加载机构
    if (dataScopeType === 'hospitals' && detail.deptId) {
      await handleOuterDeptChange(detail.deptId)
      userForm.value.orgId = detail.orgId ?? userForm.value.orgId
    } else {
      // dataScopeType 不为 hospitals：机构由角色关联配置自动带出
      if (detail.orgId) {
        try {
          const orgRes: any = await orgDetail(detail.orgId)
          if (orgRes) {
            orgOptionsList.value = [{ label: orgRes.orgName, value: orgRes.id }]
          }
        } catch { /* ignore */ }
      }
    }
    if (detail.roleId) {
      await loadUserHospitals(detail.id)
    }
    // 编辑模式：根据用户已有的医院权限决定是否显示医院区块
    showHospitalConfig.value = !!(detail.hospitalIds?.length > 0)
    // 编辑模式：如果用户有 centerId，加载加工中心列表
    if (detail.centerId) {
      await loadProcessingCenterOptions()
    }
    // 编辑模式：如果用户有管理机构（区域管理员），加载管理机构列表
    if (detail.managedOrgIds?.length > 0) {
      await loadManagedOrgOptions()
    }
  } catch {
    // ignore
  }
  userDialogVisible.value = true
}

const loadUserHospitals = async (userId: number) => {
  try {
    const res = await userHospitals(userId) as any
    const hospitals = (res?.data || res) as any[]
    userForm.value.hospitalIds = hospitals.map((h: any) => h.id)
    userForm.value.hospitalNames = hospitals.map((h: any) => h.hospitalName || h.orgName || h.name || `医院 ${h.id}`)
    // 同时填充医院卡片列表用于卡片展示
    hospitalCards.value = hospitals
  } catch {
    userForm.value.hospitalIds = []
    userForm.value.hospitalNames = []
    hospitalCards.value = []
  }
}

const handleSaveUser = async () => {
  if (!userFormRef.value) return
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      userDialogLoading.value = true
      try {
        if (editingUser.value) {
          await userUpdate(editingUser.value.id, userForm.value)
          ElMessage.success('修改成功')
        } else {
          const payload = { ...userForm.value }
          if (!payload.password) {
            payload.password = defaultPassword.value
          }
          await userCreate(payload)
          ElMessage.success('创建成功')
        }
        userDialogVisible.value = false
        loadData()
      } finally {
        userDialogLoading.value = false
      }
    }
  })
}

const handleDelete = async (user: UserVO) => {
  try {
    await ElMessageBox.confirm(`确定要删除账户「${user.realName}」吗？删除后不可恢复。`, '提示', {
      type: 'error',
      customClass: 'auth-confirm-dialog auth-confirm-dialog--danger'
    })
    await userDelete(user.id)
    ElMessage.success('删除成功')
    if (selectedUser.value?.id === user.id) {
      const remaining = users.value.filter(u => u.id !== user.id)
      selectedUser.value = remaining[0] || null
      if (remaining[0]) {
        tableRef.value?.setCurrentRow(remaining[0])
      }
    }
    await loadData()
  } catch {
    // user cancel
  }
}

const handleToggleStatus = async (user: UserVO) => {
  const newStatus = user.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '禁用'}账户「${user.realName}」吗？`,
      '提示',
      { type: 'warning', customClass: 'auth-confirm-dialog' }
    )
    await userChangeStatus(user.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
    await loadData()
    if (selectedUser.value?.id === user.id) {
      selectedUser.value = users.value.find(u => u.id === user.id) || null
    }
  } catch {
    // user cancel
  }
}

const handleOpenUserFormHospitalDialog = async () => {
  hospitalDialogSource.value = 'userForm'
  selectedHospitalIds.value = [...(userForm.value.hospitalIds || [])]
  // 从用户表单的 hospitalIds + hospitalNames 初始化已选医院列表
  const formHospitalIds = userForm.value.hospitalIds || []
  const formHospitalNames = userForm.value.hospitalNames || []
  dialogUserSelectedHospitals.value = formHospitalIds.map((id: number, index: number) => ({
    id,
    hospitalName: formHospitalNames[index] || `医院 ${id}`,
  }))
  dialogHospitalSearchKeyword.value = ''
  dialogTemplateHospitalMap.value = new Map()
  activeTemplateId.value = null
  if (hospitalTemplateOptions.value.length === 0) {
    const res = await getHospitalTemplateOptions() as any
    hospitalTemplateOptions.value = (res || [])
  }
  hospitalDialogVisible.value = true
}

const handleAssignHospital = async (user: UserVO) => {
  hospitalDialogSource.value = 'sidebar'
  hospitalTargetUser.value = user
  // 从用户详情获取已分配的医院 ID
  selectedHospitalIds.value = [...(user.hospitalIds || [])]
  dialogUserSelectedHospitals.value = []
  dialogHospitalSearchKeyword.value = ''
  dialogTemplateHospitalMap.value = new Map()
  activeTemplateId.value = null
  // 加载模板选项和可分配的医院列表
  const templateRes = await getHospitalTemplateOptions() as any
  hospitalTemplateOptions.value = (templateRes || [])
  activeTemplateLoading.value = true
  activateTemplate(templateRes[0])
  // const hospitalRes = await hospitalTemplateDetail(templateRes[0].id) as any
  activeTemplateLoading.value = false
  activeTemplateId.value = templateRes[0].id
  // const rawHospitals = hospitalRes.details || []
  // dialogUserSelectedHospitals.value = rawHospitals.map((h: any) => ({
  //   id: h.id,
  //   hospitalName: h.orgName,
  //   province: h.areaName,
  //   isAvailable: h.isAvailable,
  // }))
  hospitalDialogVisible.value = true
}

const handleSaveHospital = async () => {
  hospitalDialogLoading.value = true
  try {
    if (hospitalDialogSource.value === 'sidebar') {
      // 侧边栏来源：调用后端 API 保存
      if (!hospitalTargetUser.value) return
      await userAssignHospitals(hospitalTargetUser.value.id, selectedHospitalIds.value)
      const savedNames = hospitalTransferOptions.value
        .filter((h: any) => selectedHospitalIds.value.includes(h.key))
        .map((h: any) => h.label)
        .join('、')
      if (selectedUser.value?.id === hospitalTargetUser.value.id) {
        selectedUser.value.hospitalNames = savedNames
        const userInList = users.value.find(u => u.id === hospitalTargetUser.value!.id)
        if (userInList) userInList.hospitalNames = savedNames
      }
      ElMessage.success('医院分配成功')
    } else {
      // 用户表单来源：直接回写 userForm.hospitalIds 和 hospitalNames，关闭弹窗
      userForm.value.hospitalIds = [...selectedHospitalIds.value]
      // 根据选中的医院 ID 同步更新 hospitalNames 和 hospitalCards
      const selectedHospitalNames: string[] = []
      const cards: any[] = []
      for (const id of selectedHospitalIds.value) {
        // 优先从模板医院缓存查找
        let found: any = null
        for (const hospitals of dialogTemplateHospitalMap.value.values()) {
          found = hospitals.find(h => h.id === id)
          if (found) break
        }
        if (!found) found = dialogUserSelectedHospitals.value?.find(h => h.id === id)
        if (!found) {
          const foundTransfer = hospitalTransferOptions.value.find((h: any) => h.key === id)
          if (foundTransfer) found = { hospitalName: foundTransfer.label }
        }
        selectedHospitalNames.push(found?.hospitalName || `医院 ${id}`)
        if (found) {
          cards.push({ id, hospitalName: found.hospitalName || found.orgName || found.label })
        } else {
          cards.push({ id, hospitalName: `医院 ${id}` })
        }
      }
      userForm.value.hospitalNames = selectedHospitalNames
      hospitalCards.value = cards
    }
    hospitalDialogVisible.value = false
    dialogTemplateHospitalMap.value = new Map()
    activeTemplateId.value = null
  } finally {
    hospitalDialogLoading.value = false
  }
}

const handleResetPwd = async (user: UserVO) => {
  resetPwdDialogLoading.value = true
  let password = '123456'
  try {
    const config: any = await getConfigDetailByKey('default.password')
    password = config?.configValue || '123456'
    await ElMessageBox.confirm(
      `是否确认重置密码？重置后的密码为 ${password}。`,
      '重置密码',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    await userResetPassword(user.id)
    ElMessage.success('密码重置成功')
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '重置失败')
    }
  } finally {
    resetPwdDialogLoading.value = false
  }
}

const handleConfirmResetPwd = () => { }

const getAvatarBg = (name: string): string => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c71585']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getAvatarText = (name: string): string => {
  if (!name) return '?'
  return name.length >= 2 ? name.slice(-2) : name[0]
}

onMounted(async () => {
  loadData()
  loadStatistics()
  const accountTypeData = await getDictOptions('6')
  accountTypeOptions.value = (accountTypeData || []).map((d: any) => ({ label: d.label, value: d.value }))
  loadRoleOptions()
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/dialogLeftRight.scss' as *;

// ── Account 列表页样式 ──
.user-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;

    .user-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }


}

.contact-cell {
  font-size: 13px;
  color: #606266;

  .contact-email {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
}

// ── Sidebar Profile Panel ──────────────────────────────────────────────

// Avatar – compact circle inside profile header
.sidebar-avatar-default {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2.5px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.18), 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.06);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3), 0 6px 20px rgba(0, 0, 0, 0.14);
  }
}

.sidebar-avatar-default-text {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  text-transform: uppercase;
  user-select: none;
}

// Profile Header
.sidebar-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 16px 14px;
  gap: 0;
  position: relative;

  // Subtle divider under profile section
  &::after {
    content: '';
    display: block;
    width: calc(100% - 24px);
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0 30%, #e2e8f0 70%, transparent);
    margin-top: 14px;
  }
}

// Avatar wrap with floating status badge
.sidebar-profile-avatar-wrap {
  position: relative;
  margin-bottom: 10px;
}

// Floating status dot (top-right of avatar)
.sidebar-profile-status-badge {
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;

  &--on {
    background: #34d399;
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.25), 0 0 6px rgba(52, 211, 153, 0.4);
  }

  &--off {
    background: #94a3b8;
    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.25);
  }
}

.sidebar-profile-status-dot {
  display: none; // visual done via container
}

.sidebar-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.sidebar-avatar-upload {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s;
  overflow: hidden;

  :deep(.el-button) {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: 50%;
    font-size: 20px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 4px;
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;

    &::before {
      content: '+';
      margin-bottom: 2px;
    }
  }
}

.sidebar-profile-avatar-wrap:hover .sidebar-avatar-upload {
  opacity: 1;
}

// Names block
.sidebar-profile-names {
  text-align: center;
  margin-bottom: 8px;
}

.sidebar-profile-realname {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  transition: color 0.3s ease;
}

.sidebar-profile-username {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'DM Mono', 'Fira Code', monospace;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

.sidebar-profile-username-at {
  color: #cbd5e1;
  margin-right: 1px;
}

// Account type pill
.sidebar-profile-type-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  transition: all 0.2s ease;

  .sidebar-profile-type-icon .el-icon {
    font-size: 11px;
  }

  &--inner {
    background: #f0fdf4;
    color: #059669;
    border: 1px solid #d1fae5;
    box-shadow: 0 1px 3px rgba(5, 150, 105, 0.08);
  }

  &--outer {
    background: #fffbeb;
    color: #d97706;
    border: 1px solid #fde68a;
    box-shadow: 0 1px 3px rgba(217, 119, 6, 0.08);
  }
}

// ── Contact Meta ─────────────────────────────────────────────────────────
.sidebar-profile-meta {
  padding: 10px 16px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-meta-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.sidebar-meta-icon {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 11px;
  }
}

.sidebar-meta-text {
  font-size: 11px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ── Hospital Strip ───────────────────────────────────────────────────────
.sidebar-profile-strip {
  margin: 4px 16px 6px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  padding: 10px 12px;
  position: relative;
  overflow: hidden;

  // Decorative corner accent
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.sidebar-strip-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 6px;
}

.sidebar-strip-icon {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 11px;
  }
}

.sidebar-strip-label {
  font-size: 11px;
  color: #065f46;
  font-weight: 500;
  flex: 1;
}

.sidebar-strip-count {
  font-size: 11px;
  font-weight: 700;
  color: #059669;
  background: rgba(5, 150, 105, 0.08);
  padding: 1px 7px;
  border-radius: 10px;
  font-variant-numeric: tabular-nums;
}

.sidebar-strip-bar {
  height: 4px;
  background: rgba(5, 150, 105, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.sidebar-strip-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.4);
}

.sidebar-strip-hint {
  font-size: 10px;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}

// ── Role Indicator ──────────────────────────────────────────────────────
.sidebar-profile-role {
  margin: 4px 16px 16px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.sidebar-role-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.sidebar-role-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;

  .el-icon {
    color: #6366f1;
    font-size: 13px;
  }

  &--empty {
    color: #94a3b8;
    font-weight: 400;

    .el-icon {
      color: #94a3b8;
    }
  }
}

// ── 医院权限配置（合并在组织架构内）──
.hospital-permission-block {
  margin-top: 18px;
  animation: sectionSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.2s;
}

.hospital-permission-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f8faff, #f0f4ff);
  border: 1px solid #e2e8f0;
  border-radius: 10px 10px 0 0;
  border-bottom: none;
}

.hospital-permission-header-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 13px;
  }
}

.hospital-permission-header-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
  flex: 1;
}

.hospital-permission-body {
  padding: 10px 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 10px 10px;
  background: #fff;
}

.hospital-name-tag {
  font-size: 12px;
  border-radius: 4px;

  &--more {
    background: #f1f5f9;
    color: #64748b;
  }
}

.hospital-permission-empty {
  padding: 8px 14px;
  font-size: 12px;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 10px 10px;
  background: #fff;
  font-style: italic;
}

// 模板下拉
.hospital-perm-template-wrap {
  padding: 0 12px 8px;

  :deep(.el-select) {
    .el-select__tags {
      flex-wrap: wrap;
      max-height: 60px;
      overflow-y: auto;
    }

    .el-select__input {
      font-size: 12px;
    }
  }
}

.hospital-perm-template-tags {
  padding: 0 12px 10px;
}

.hospital-template-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

// 医院搜索
.hospital-perm-search {
  padding: 0 12px 8px;
}

// 加载状态
.hospital-perm-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 16px;

  .loading-dots {
    display: flex;
    gap: 4px;

    span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #6366f1;
      animation: loadingBounce 1.2s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.15s;
      }

      &:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
  }

  .loading-text {
    font-size: 11px;
    color: #94a3b8;
  }
}

// 医院卡片网格
.hospital-perm-grid {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 450px;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
  }
}

// 空状态
.hospital-perm-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  color: #94a3b8;

  .hospital-perm-empty__icon {
    font-size: 26px;
    color: #cbd5e1;
  }

  .hospital-perm-empty__text {
    font-size: 11px;
    color: #94a3b8;
    text-align: center;
    margin: 0;
    line-height: 1.5;
  }
}

// 医院卡片
.hospital-card {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 8px 8px 6px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #fafbfc;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.15s;
  position: relative;
  user-select: none;

  &:hover {
    border-color: #a5b4fc;
    background: #f8faff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  }

  &--selected {
    border-color: #6366f1;
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2), 0 2px 8px rgba(99, 102, 241, 0.1);
  }

  // 已被其他用户分配的医院
  &--assigned {
    border-color: #fbbf24;
    background: #fffbeb;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
      border-radius: 7px 7px 0 0;
    }

    &:hover {
      border-color: #f59e0b;
      background: #fef3c7;
    }
  }
}

.hospital-card__checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.hospital-card__check-indicator {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1.5px solid #cbd5e1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all 0.15s;

  .el-icon {
    font-size: 9px;
    color: #fff;
  }

  .hospital-card--selected & {
    background: #6366f1;
    border-color: #6366f1;
  }
}

.hospital-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hospital-card__name {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.hospital-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.hospital-card__level {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
}

.level-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  flex-shrink: 0;

  &--1,
  &--2 {
    background: #ef4444;
  }

  &--3 {
    background: #f59e0b;
  }

  &--4 {
    background: #10b981;
  }
}

.hospital-card__address {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.hospital-card__region {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hospital-card__assigned-tip {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #d97706;
  font-weight: 500;
  margin-top: 2px;

  .el-icon {
    font-size: 11px;
    color: #f59e0b;
  }
}

// 标签入场动画
.tag-slide-enter-active,
.tag-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tag-slide-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.tag-slide-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

// ── 模板/医院标签 ──
.perm-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  color: #065f46;
  border: 1px solid #a7f3d0;

  &__dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;

    &--template {
      background: #34d399;
      box-shadow: 0 0 3px rgba(52, 211, 153, 0.6);
    }
  }

  &__close {
    margin-left: 2px;
    font-size: 10px;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.15s;
    border-radius: 50%;

    &:hover {
      color: #ef4444;
      background: #fee2e2;
    }
  }
}

// ── 动画 ──
@keyframes sectionSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingBounce {

  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// ── 医院模板卡片样式 ──
.template-card {
  background: #fff;
  border: 1px solid #e4e4e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6366f1;
    box-shadow: 0 2px 10px rgba(99, 102, 241, 0.12);
  }

  &--active {
    border-color: #6366f1;
    background: linear-gradient(135deg, #f5f7ff 0%, #eef0ff 100%);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.18);
  }
}

.template-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  transition: background 0.2s;
}

.template-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #f0f1ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  flex-shrink: 0;
  transition: background 0.2s;

  .template-card--active & {
    background: #6366f1;
    color: #fff;
  }
}

.template-card__info {
  flex: 1;
  min-width: 0;
}

.template-card__name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.template-card__count {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 3px;
}

.template-card__selected-badge {
  font-size: 11px;
  color: #6366f1;
  font-weight: 600;
  background: #eef0ff;
  padding: 1px 6px;
  border-radius: 10px;
  border: 1px solid #c7d2fe;
}

.template-card__arrow {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s;

  .template-card:hover & {
    transform: translateX(3px);
    color: #6366f1;
  }
}

// ── 账户类型展示（只读，根据角色自动判定）──
</style>
