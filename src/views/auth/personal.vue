<template>
  <div class="personal-page">
    <!-- Hero Header -->
    <div class="profile-hero">
      <div class="profile-hero__bg"></div>
      <div class="profile-hero__grain"></div>
      <div class="profile-hero__content">
        <div class="profile-hero__avatar-wrap">
          <div class="profile-hero__avatar" :style="{ background: getAvatarBg(userInfo?.realName || '') }">
            {{ getAvatarText(userInfo?.realName || '') }}
          </div>
          <div class="profile-hero__avatar-status" :class="userInfo?.status === 1 ? 'is-active' : 'is-inactive'">
            <span class="status-dot"></span>
            {{ userInfo?.statusName || '未知' }}
          </div>
        </div>
        <div class="profile-hero__info">
          <div class="profile-hero__name">{{ userInfo?.realName || '加载中...' }}</div>
          <div class="profile-hero__tags">
            <span class="hero-tag hero-tag--type">{{ userInfo?.accountTypeName || '-' }}</span>
            <span class="hero-tag hero-tag--role">{{ userInfo?.roleName || '-' }}</span>
          </div>
          <div class="profile-hero__meta">
            <span class="meta-item">
              <span class="meta-icon">🏢</span>
              {{ userInfo?.orgName || '-' }}
            </span>
            <span class="meta-sep">/</span>
            <span class="meta-item">
              <span class="meta-icon">🧭</span>
              {{ userInfo?.deptName || '-' }}
            </span>
          </div>
        </div>
        <div class="profile-hero__actions">
          <el-button class="btn-change-pwd" @click="handleChangePassword">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            修改密码
          </el-button>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">用户账号</div>
          <div class="stat-card__value mono">{{ userInfo?.username || '-' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">工号</div>
          <div class="stat-card__value mono">{{ userInfo?.employeeNo || '-' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--amber">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">创建时间</div>
          <div class="stat-card__value mono">{{ userInfo?.createTime ? formatDate(userInfo.createTime) : '-' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--violet">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">数据权限</div>
          <div class="stat-card__value">{{ getDataScopeLabel(userInfo?.dataScopeType) }}</div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="profile-grid">
      <!-- 基础信息 -->
      <div class="info-section">
        <div class="info-section__header">
          <div class="info-section__line"></div>
          <h2 class="info-section__title">基础信息</h2>
          <div class="info-section__icon-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-field">
            <div class="info-field__label">真实姓名</div>
            <div class="info-field__value">{{ userInfo?.realName || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">性别</div>
            <div class="info-field__value">
              <span v-if="userInfo?.sex === 1" class="sex-dot sex-dot--male">♂ 男</span>
              <span v-else-if="userInfo?.sex === 2" class="sex-dot sex-dot--female">♀ 女</span>
              <span v-else class="info-field__value--null">-</span>
            </div>
          </div>
          <div class="info-field">
            <div class="info-field__label">账号类型</div>
            <div class="info-field__value">{{ userInfo?.accountTypeName || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">角色</div>
            <div class="info-field__value">{{ userInfo?.roleName || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="info-section">
        <div class="info-section__header">
          <div class="info-section__line"></div>
          <h2 class="info-section__title">联系信息</h2>
          <div class="info-section__icon-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-field">
            <div class="info-field__label">手机号码</div>
            <div class="info-field__value mono">{{ userInfo?.phone || '-' }}</div>
          </div>
          <div class="info-field info-field--wide">
            <div class="info-field__label">电子邮箱</div>
            <div class="info-field__value">{{ userInfo?.email || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 机构与部门 -->
      <div class="info-section">
        <div class="info-section__header">
          <div class="info-section__line"></div>
          <h2 class="info-section__title">机构信息</h2>
          <div class="info-section__icon-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-field info-field--wide">
            <div class="info-field__label">机构名称</div>
            <div class="info-field__value info-field__value--primary">{{ userInfo?.orgName || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">机构ID</div>
            <div class="info-field__value mono">{{ userInfo?.orgId || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">部门名称</div>
            <div class="info-field__value">{{ userInfo?.deptName || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">部门ID</div>
            <div class="info-field__value mono">{{ userInfo?.deptId || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 医生/业务员专属信息 -->
      <div class="info-section info-section--accent" v-if="userInfo?.accountType !== 1">
        <div class="info-section__header">
          <div class="info-section__line info-section__line--accent"></div>
          <h2 class="info-section__title">专业信息</h2>
          <div class="info-section__icon-wrap info-section__icon-wrap--accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-field">
            <div class="info-field__label">专业 / 科室</div>
            <div class="info-field__value">{{ userInfo?.specialtyName || userInfo?.specialty || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">资质信息</div>
            <div class="info-field__value">{{ userInfo?.qualification || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">结算类型</div>
            <div class="info-field__value">{{ userInfo?.settlementTypeName || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div class="info-section info-section--full" v-if="userInfo?.remark">
        <div class="info-section__header">
          <div class="info-section__line"></div>
          <h2 class="info-section__title">备注说明</h2>
          <div class="info-section__icon-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
        </div>
        <div class="remark-block">{{ userInfo.remark }}</div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="pwdDialogVisible"
      title="修改密码"
      width="420px"
      :close-on-click-modal="false"
      destroy-on-close
      class="pwd-dialog"
    >
      <div class="pwd-dialog-body">
        <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-position="top" class="pwd-form">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              v-model="pwdForm.oldPassword"
              type="password"
              placeholder="请输入旧密码"
              show-password
              size="large"
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="pwdForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              show-password
              size="large"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="pwdForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              size="large"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="pwd-dialog-footer">
          <el-button size="large" @click="pwdDialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" :loading="pwdLoading" @click="handlePwdSubmit">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getUserInfoApi, changePasswordApi } from '@/api/auth'
import { useUserInfo } from '@/stores/userInfo'

const storesUserInfo = useUserInfo()
const pwdDialogVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref<FormInstance>()

interface UserVO {
  id?: number | string
  username?: string
  realName?: string
  phone?: string
  email?: string
  sex?: number
  sexName?: string
  avatar?: string
  accountType?: number
  accountTypeName?: string
  orgId?: number | string
  orgName?: string
  deptId?: number | string
  deptName?: string
  roleId?: number | string
  roleName?: string
  roleCode?: string
  dataScopeType?: string
  status?: number
  statusName?: string
  remark?: string
  employeeNo?: string
  specialty?: string
  specialtyName?: string
  qualification?: string
  settlementType?: number
  settlementTypeName?: string
  createTime?: string
}

const userInfo = ref<UserVO | null>(null)

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirm = (_rule: any, value: string, callback: any) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度需为 6-20 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

// ========== 初始化 ==========
onMounted(async () => {
  if (storesUserInfo.userInfos.isLogin) {
    userInfo.value = storesUserInfo.userInfos as UserVO
  }
  await loadUserInfo()
})

const loadUserInfo = async () => {
  try {
    const res = await getUserInfoApi()
    userInfo.value = res.user
    storesUserInfo.setInfos(res.user, res.menus, res.permissions)
  } catch {
    // error handled by http interceptor
  }
}

// ========== 工具方法 ==========
const getAvatarBg = (name: string): string => {
  const colors = [
    'linear-gradient(135deg, #0ea5e9, #6366f1)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #10b981, #3b82f6)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #14b8a6, #3b82f6)',
    'linear-gradient(135deg, #f97316, #facc15)',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getAvatarText = (name: string): string => {
  if (!name) return '?'
  return name.length >= 2 ? name.slice(0, 2) : name[0]
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getDataScopeLabel = (type?: string): string => {
  const map: Record<string, string> = {
    all: '全部数据',
    dept: '本部门数据',
    dept_and_child: '本部门及以下',
    self: '仅本人数据',
    custom: '自定义',
  }
  return type ? (map[type] || type) : '-'
}

// ========== 修改密码 ==========
const handleChangePassword = () => {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdFormRef.value?.resetFields()
  pwdDialogVisible.value = true
}

const handlePwdSubmit = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      pwdLoading.value = true
      try {
        await changePasswordApi({
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword,
        })
        ElMessage.success('密码修改成功')
        pwdDialogVisible.value = false
      } catch {
        // error handled by http interceptor
      } finally {
        pwdLoading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
/* ============================================================
   Clinical Precision — 医疗科技专业感设计系统
   ============================================================ */

// CSS Variables
:root {
  --clr-bg: #f8f7f4;
  --clr-surface: #ffffff;
  --clr-primary: #0c4a6e;
  --clr-primary-light: #0ea5e9;
  --clr-accent: #6366f1;
  --clr-accent-soft: #eef2ff;
  --clr-text: #1c1917;
  --clr-text-secondary: #78716c;
  --clr-text-muted: #a8a29e;
  --clr-border: #e7e5e4;
  --clr-border-subtle: #f0eeec;
  --radius-card: 16px;
  --radius-sm: 8px;
  --radius-pill: 999px;
}

.personal-page {
  min-height: calc(100vh - 140px);
  background: var(--clr-bg);
  padding: 28px 28px 40px;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
}

/* ========== Hero ========== */
.profile-hero {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
  margin-bottom: 20px;
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
  animation: hero-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.profile-hero__bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(12,74,110,0.04) 0%, rgba(99,102,241,0.06) 100%);
  pointer-events: none;
}

.profile-hero__grain {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 128px;
  pointer-events: none;
}

.profile-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 36px 40px;
}

.profile-hero__avatar-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: avatar-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}

.profile-hero__avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  letter-spacing: 2px;
}

.profile-hero__avatar-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.3px;

  &.is-active {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  &.is-inactive {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.15);
  }
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;

  .is-active & { background: #10b981; }
  .is-inactive & { background: #ef4444; }
}

.profile-hero__info {
  flex: 1;
  min-width: 0;
  animation: info-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
}

.profile-hero__name {
  font-size: 24px;
  font-weight: 700;
  color: var(--clr-text);
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  line-height: 1.2;
}

.profile-hero__tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.hero-tag {
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.3px;

  &--type {
    background: var(--clr-accent-soft);
    color: var(--clr-accent);
    border: 1px solid rgba(99, 102, 241, 0.15);
  }

  &--role {
    background: rgba(14, 165, 233, 0.08);
    color: #0284c7;
    border: 1px solid rgba(14, 165, 233, 0.15);
  }
}

.profile-hero__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--clr-text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-icon {
  font-size: 12px;
  opacity: 0.7;
}

.meta-sep {
  color: var(--clr-text-muted);
  font-weight: 300;
}

.profile-hero__actions {
  flex-shrink: 0;
  animation: actions-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

.btn-change-pwd {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  background: var(--clr-surface) !important;
  border: 1.5px solid var(--clr-border) !important;
  color: var(--clr-text) !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s ease;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: var(--clr-primary) !important;
    border-color: var(--clr-primary) !important;
    color: #fff !important;
    box-shadow: 0 4px 14px rgba(12, 74, 110, 0.25);
    transform: translateY(-1px);
  }
}

/* ========== Stats Row ========== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-card);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.22s ease;
  animation: stat-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;

  @for $i from 1 through 4 {
    &:nth-child(#{$i}) { animation-delay: #{($i - 1) * 0.07 + 0.15}s; }
  }

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    transform: translateY(-2px);
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--blue {
      background: rgba(14, 165, 233, 0.1);
      color: #0284c7;
    }

    &--green {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    &--amber {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }

    &--violet {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: var(--clr-text-muted);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  &__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--clr-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.mono {
      font-family: 'SF Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
      font-size: 12.5px;
      color: var(--clr-text-secondary);
      font-weight: 500;
    }
  }
}

/* ========== Info Grid ========== */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-section {
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-card);
  padding: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.22s ease;
  animation: section-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;

  @for $i from 1 through 4 {
    &:nth-child(#{$i}) { animation-delay: #{($i - 1) * 0.08 + 0.25}s; }
  }

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    transform: translateY(-1px);
  }

  &--accent {
    border-color: rgba(99, 102, 241, 0.2);
    background: linear-gradient(135deg, #fafafa 0%, #f8f7ff 100%);
  }

  &--full {
    grid-column: 1 / -1;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 22px 14px;
    border-bottom: 1px solid var(--clr-border-subtle);
  }

  &__line {
    width: 3px;
    height: 18px;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--clr-primary-light), var(--clr-accent));
    flex-shrink: 0;

    &--accent {
      background: linear-gradient(180deg, #818cf8, #a78bfa);
    }
  }

  &__title {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--clr-text);
    margin: 0;
    letter-spacing: 0.3px;
    flex: 1;
  }

  &__icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: rgba(14, 165, 233, 0.08);
    color: #0284c7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--accent {
      background: rgba(99, 102, 241, 0.08);
      color: var(--clr-accent);
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 16px 22px;
  gap: 12px 24px;
}

.info-field {
  &--wide {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: var(--clr-text-muted);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  &__value {
    font-size: 13.5px;
    color: var(--clr-text);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--primary {
      color: var(--clr-primary);
      font-weight: 600;
    }

    &--null {
      color: var(--clr-text-muted);
    }

    &.mono {
      font-family: 'SF Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
      font-size: 12.5px;
      color: var(--clr-text-secondary);
    }
  }
}

.sex-dot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;

  &--male {
    color: #0284c7;
  }

  &--female {
    color: #db2777;
  }
}

.remark-block {
  padding: 16px 22px 20px;
  font-size: 13.5px;
  color: var(--clr-text-secondary);
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ========== Password Dialog ========== */
:deep(.pwd-dialog) {
  .el-dialog {
    border-radius: var(--radius-card);
    overflow: hidden;
  }

  .el-dialog__header {
    padding: 22px 28px 18px;
    border-bottom: 1px solid var(--clr-border-subtle);
    margin-right: 0;

    .el-dialog__title {
      font-size: 15px;
      font-weight: 700;
      color: var(--clr-text);
      letter-spacing: 0.3px;
    }
  }

  .el-dialog__body {
    padding: 24px 28px;
  }

  .el-dialog__footer {
    padding: 16px 28px 22px;
    border-top: 1px solid var(--clr-border-subtle);
  }
}

.pwd-dialog-body {
  .el-form-item__label {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--clr-text);
    letter-spacing: 0.3px;
  }

  .el-input__wrapper {
    border-radius: var(--radius-sm);
    transition: all 0.18s ease;

    &:hover {
      box-shadow: 0 0 0 1px var(--clr-primary-light) !important;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2) !important;
      border-color: var(--clr-primary-light) !important;
    }
  }
}

.pwd-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .el-button {
    border-radius: var(--radius-sm);
    font-weight: 600;
  }

  .el-button--primary {
    background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-accent) 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(12, 74, 110, 0.25);

    &:hover {
      box-shadow: 0 4px 16px rgba(12, 74, 110, 0.35);
      transform: translateY(-1px);
    }
  }
}

/* ========== Animations ========== */
@keyframes hero-enter {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes avatar-enter {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes info-enter {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes actions-enter {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes stat-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes section-enter {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== Responsive ========== */
@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .personal-page {
    padding: 16px;
  }

  .profile-hero__content {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 20px;
    gap: 16px;
  }

  .profile-hero__name {
    font-size: 20px;
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
