<template>
  <div class="personal-page">
    <!-- Hero Header -->
    <div class="profile-hero">
      <div class="profile-hero__bg"></div>
      <div class="profile-hero__grain"></div>
      <div class="profile-hero__content">
        <!-- 头像 -->
        <div class="profile-hero__avatar-wrap">
          <div class="profile-hero__avatar"
            :style="userInfo?.avatar ? {} : { background: getAvatarBg(userInfo?.realName || '') }">
            <img v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" alt="" />
            <template v-else>{{ getAvatarText(userInfo?.realName || '') }}</template>
          </div>
          <!-- 状态角标 -->
          <div class="profile-hero__avatar-status" :class="userInfo?.status === 1 ? 'is-active' : 'is-inactive'">
            <span class="status-dot"></span>
            {{ userInfo?.statusName || '未知' }}
          </div>
          <!-- 头像光晕装饰 -->
          <div class="avatar-glow"></div>
        </div>

        <!-- 基础信息 -->
        <div class="profile-hero__info">
          <div class="profile-hero__name-row">
            <div class="profile-hero__name">{{ userInfo?.realName || '加载中...' }}</div>
            <div class="profile-hero__tags">
              <span class="hero-tag hero-tag--type">{{ userInfo?.accountTypeName || '-' }}</span>
              <span class="hero-tag hero-tag--role">{{ userInfo?.roleName || '-' }}</span>
            </div>
          </div>
          <div class="profile-hero__meta">
            <span class="meta-item">
              <svg class="meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              {{ userInfo?.orgName || '-' }}
            </span>
            <span class="meta-sep">/</span>
            <span class="meta-item">
              <svg class="meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ userInfo?.deptName || '-' }}
            </span>
          </div>
        </div>

        <!-- 操作区 -->
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

      <!-- 四角装饰线 -->
      <div class="hero-corner tl"></div>
      <div class="hero-corner tr"></div>
      <div class="hero-corner bl"></div>
      <div class="hero-corner br"></div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card" v-for="(card, i) in statCards" :key="i">
        <div class="stat-card__icon-wrap">
          <div class="stat-card__icon" :style="{ background: card.iconBg }">
            <component :is="card.icon" />
          </div>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">{{ card.label }}</div>
          <div class="stat-card__value" :class="{ 'mono': card.mono }">{{ card.value }}</div>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <span v-if="userInfo?.sex === 1" class="sex-tag sex-tag--male">♂ 男</span>
              <span v-else-if="userInfo?.sex === 2" class="sex-tag sex-tag--female">♀ 女</span>
              <span v-else class="info-field__value--null">-</span>
            </div>
          </div>
          <div class="info-field">
            <div class="info-field__label">账号类型</div>
            <div class="info-field__value">
              <span class="type-badge">{{ userInfo?.accountTypeName || '-' }}</span>
            </div>
          </div>
          <div class="info-field">
            <div class="info-field__label">角色</div>
            <div class="info-field__value">
              <span class="role-badge">{{ userInfo?.roleName || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 机构信息 -->
      <div class="info-section info-section--orange">
        <div class="info-section__header">
          <div class="info-section__line info-section__line--purple"></div>
          <h2 class="info-section__title">机构信息</h2>
          <div class="info-section__icon-wrap info-section__icon-wrap--orange">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-field">
            <div class="info-field__label">机构名称</div>
            <div class="info-field__value info-field__value--primary">{{ userInfo?.orgName || '-' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field__label">部门名称</div>
            <div class="info-field__value">{{ userInfo?.deptName || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 专业信息（外部用户） -->
      <div class="info-section info-section--accent" v-if="userInfo?.accountType !== 1 && userInfo?.accountType !== '6.1'">
        <div class="info-section__header">
          <div class="info-section__line info-section__line--accent"></div>
          <h2 class="info-section__title">专业信息</h2>
          <div class="info-section__icon-wrap info-section__icon-wrap--accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
        </div>
        <div class="remark-block">{{ userInfo.remark }}</div>
      </div>
    </div>

    <!-- 登录历史 -->
    <div class="info-section info-section--full login-history" style="margin-top: 18px; position: relative; z-index: 1;">
      <div class="info-section__header">
        <div class="info-section__line"></div>
        <h2 class="info-section__title">登录历史</h2>
        <div class="info-section__icon-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
      </div>
      <div style="padding: 0 22px 18px 26px;">
        <el-table :data="loginHistory" size="small" style="width: 100%" v-loading="historyLoading">
          <el-table-column type="index" label="#" />
          <el-table-column prop="loginTime" label="登录时间">
            <template #default="{ row }">{{ row.loginTime?.replace('T', ' ') }}</template>
          </el-table-column>
          <el-table-column prop="ip" label="IP 地址" />
          <el-table-column prop="location" label="登录地点" />
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="loginType" label="登录方式" />
          <el-table-column label="浏览器 / 客户端">
            <template #default="{ row }">
              <span style="color: var(--clr-text-secondary); font-size: 12px;">{{ parseUA(row.userAgent) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="row.loginStatus === 1 ? 'success' : 'danger'" size="small">{{ row.loginStatus === 1 ? '成功' : '失败' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <DialogModal
      v-model="pwdDialogVisible"
      title="修改密码"
      width="420px"
      :loading="pwdLoading"
      @modal-close="pwdDialogVisible = false"
      @modal-confirm="handlePwdSubmit"
    >
      <div style="padding: 10px 15px">
        <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-position="top">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input v-model="pwdForm.oldPassword" type="password" placeholder="请输入旧密码" show-password size="large" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码（6-20位）" show-password size="large" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="pwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password size="large" />
          </el-form-item>
        </el-form>
      </div>
    </DialogModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getUserInfoApi, changePasswordApi, getLoginHistoryApi, type LoginLogVO } from '@/api/auth'
import { useUserInfo } from '@/stores/userInfo'
import {
  User, OfficeBuilding, Message, Iphone,
} from '@element-plus/icons-vue'
import DialogModal from '@/components/dialogModal.vue'

const storesUserInfo = useUserInfo()
const loginHistory = ref<LoginLogVO[]>([])
const historyLoading = ref(false)
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
  accountType?: number | string
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

// ========== statCards ==========
const statCards = computed(() => [
  {
    label: '用户账号',
    value: userInfo.value?.username || '-',
    icon: User,
    iconBg: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    mono: true,
  },
  {
    label: '工号',
    value: userInfo.value?.employeeNo || '-',
    icon: OfficeBuilding,
    iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
    mono: true,
  },
  {
    label: '手机号码',
    value: userInfo.value?.phone || '-',
    icon: Iphone,
    iconBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    mono: true,
  },
  {
    label: '电子邮箱',
    value: userInfo.value?.email || '-',
    icon: Message,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    mono: false,
  },
])

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
  historyLoading.value = true
  try {
    loginHistory.value = await getLoginHistoryApi(30)
  } catch {
    // error handled by http interceptor
  } finally {
    historyLoading.value = false
  }
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
const parseUA = (ua: string): string => {
  if (!ua) return '-'
  if (/Apifox/.test(ua)) return 'Apifox'
  const browser = (() => {
    if (/Edg\//.test(ua)) return 'Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] ?? '')
    if (/Chrome\/([\d.]+)/.test(ua)) return 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '')
    if (/Firefox\/([\d.]+)/.test(ua)) return 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '')
    if (/Safari\/([\d.]+)/.test(ua)) return 'Safari'
    return ua.slice(0, 40)
  })()
  const os = (() => {
    if (/Windows NT/.test(ua)) return 'Windows'
    if (/Mac OS X/.test(ua)) return 'macOS'
    if (/Android/.test(ua)) return 'Android'
    if (/iPhone|iPad/.test(ua)) return 'iOS'
    if (/Linux/.test(ua)) return 'Linux'
    return ''
  })()
  return os ? `${browser} · ${os}` : browser
}

const getAvatarBg = (name: string): string => {
  const colors = [
    'linear-gradient(135deg, #0d9488, #14b8a6)',
    'linear-gradient(135deg, #0284c7, #0ea5e9)',
    'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    'linear-gradient(135deg, #f97316, #ea580c)',
    'linear-gradient(135deg, #059669, #10b981)',
    'linear-gradient(135deg, #dc2626, #ef4444)',
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
// ================================================================
// personal-page — Professional Clinical Luxury
// Warm ivory + teal-cyan accents, dot-grid texture, refined motion
// ================================================================

// CSS Variables
:root {
  --clr-bg: #f5f3ee;
  --clr-surface: #ffffff;
  --clr-surface-2: #fdfcfa;
  --clr-primary: #0d9488;
  --clr-primary-dark: #0f766e;
  --clr-primary-light: #5eead4;
  --clr-accent: #f97316;
  --clr-accent-soft: #fff7ed;
  --clr-accent-purple: #7c3aed;
  --clr-text: #1c1917;
  --clr-text-secondary: #57534e;
  --clr-text-muted: #a8a29e;
  --clr-border: #e7e5e0;
  --clr-border-subtle: #f0ede8;
  --radius-card: 20px;
  --radius-sm: 10px;
  --radius-pill: 999px;
}

.personal-page {
  min-height: calc(100vh - 140px);
  background: var(--clr-bg);
  padding: 32px 32px 48px;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  position: relative;
  overflow: auto;
  background: #fff;
}

// ── 背景装饰层 ──────────────────────────────────────────────
.personal-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  // 细密的 dot-grid 纹理
  background-image: radial-gradient(circle, rgba(13, 148, 136, 0.12) 1px, transparent 1px);
  background-size: 28px 28px;
}

// 右下角大型渐变光晕
.personal-page::after {
  content: '';
  position: fixed;
  bottom: -200px;
  right: -200px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* ========== Hero ========== */
.profile-hero {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
  margin-bottom: 24px;
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  box-shadow:
    0 1px 3px rgba(0,0,0,0.04),
    0 8px 32px rgba(13, 148, 136, 0.06);
  animation: hero-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  z-index: 1;
}

// 顶部斜向渐变装饰条
.profile-hero__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    #0d9488 0%,
    #14b8a6 30%,
    #5eead4 60%,
    #0d9488 100%
  );
  background-size: 200% 100%;
  animation: shimmer-bar 4s linear infinite;
}

@keyframes shimmer-bar {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

.profile-hero__grain {
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
  background-size: 128px;
  pointer-events: none;
}

.profile-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 40px 44px;
}

.profile-hero__avatar-wrap {
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: avatar-enter 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}

.profile-hero__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 3px rgba(13, 148, 136, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.15);
  letter-spacing: 2px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow:
      0 0 0 4px rgba(13, 148, 136, 0.25),
      0 12px 32px rgba(0, 0, 0, 0.2);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 头像光晕装饰
.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 70%);
  pointer-events: none;
  animation: glow-pulse 3.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
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
  transition: all 0.2s;

  &.is-active {
    background: rgba(13, 148, 136, 0.1);
    color: var(--clr-primary-dark);
    border: 1px solid rgba(13, 148, 136, 0.2);
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

  .is-active & { background: var(--clr-primary); }
  .is-inactive & { background: #ef4444; }
}

.profile-hero__info {
  flex: 1;
  min-width: 0;
  animation: info-enter 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
}

.profile-hero__name-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.profile-hero__name {
  font-size: 26px;
  font-weight: 700;
  color: var(--clr-text);
  letter-spacing: 0.5px;
  line-height: 1.2;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui;
}

.profile-hero__tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-tag {
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.3px;
  transition: all 0.2s;

  &--type {
    background: rgba(13, 148, 136, 0.08);
    color: var(--clr-primary-dark);
    border: 1px solid rgba(13, 148, 136, 0.15);

    &:hover {
      background: rgba(13, 148, 136, 0.14);
    }
  }

  &--role {
    background: rgba(249, 115, 22, 0.08);
    color: #c2410c;
    border: 1px solid rgba(249, 115, 22, 0.15);

    &:hover {
      background: rgba(249, 115, 22, 0.14);
    }
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
  opacity: 0.6;
  color: var(--clr-text-secondary);
  flex-shrink: 0;
}

.meta-sep {
  color: var(--clr-text-muted);
  font-weight: 300;
}

.profile-hero__actions {
  flex-shrink: 0;
  animation: actions-enter 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

.btn-change-pwd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  background: var(--clr-surface) !important;
  border: 1.5px solid var(--clr-border) !important;
  color: var(--clr-text) !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.22s ease;
  letter-spacing: 0.3px;

  svg { flex-shrink: 0; }

  &:hover {
    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.3);
    transform: translateY(-2px);
  }
}

/* ========== Stats Row ========== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  z-index: 1;
  position: relative;
}

.stat-card {
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-card);
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.03);
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
  animation: stat-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;

  @for $i from 1 through 4 {
    &:nth-child(#{$i}) { animation-delay: #{($i - 1) * 0.08 + 0.18}s; }
  }

  // 顶部渐变条（hover 时显示）
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--clr-primary), #5eead4);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }

  &:hover {
    box-shadow: 0 12px 40px rgba(13, 148, 136, 0.1);
    transform: translateY(-3px);
    border-color: rgba(13, 148, 136, 0.2);

    &::before { opacity: 1; }

    .stat-card__icon {
      transform: scale(1.1) rotate(-3deg);
    }
  }
}

.stat-card__icon-wrap {
  flex-shrink: 0;
  position: relative;
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card__body {
  flex: 1;
  min-width: 0;
}

.stat-card__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--clr-text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.stat-card__value {
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

/* ========== Info Grid ========== */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  z-index: 1;
  position: relative;
}

.info-section {
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.03);
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  animation: section-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  position: relative;

  @for $i from 1 through 4 {
    &:nth-child(#{$i}) { animation-delay: #{($i - 1) * 0.09 + 0.28}s; }
  }

  &:hover {
    box-shadow: 0 12px 40px rgba(13, 148, 136, 0.08);
    transform: translateY(-2px);
  }

  // 左侧彩色竖条
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--clr-primary), #5eead4);
    border-radius: var(--radius-card) 0 0 var(--radius-card);
    transition: width 0.3s ease;
  }

  // 联系信息 — 蓝色系
  &--cyan::before {
    background: linear-gradient(180deg, #0ea5e9, #7dd3fc);
  }

  // 机构信息 — 橙色系
  &--orange::before {
    background: linear-gradient(180deg, #f97316, #fed7aa);
  }

  &--accent {
    &::before {
      background: linear-gradient(180deg, #8b5cf6, #c4b5fd);
    }
    background: linear-gradient(135deg, #fafafa 0%, #f8f7ff 100%);
  }

  &--full {
    grid-column: 1 / -1;

    &::before {
      background: linear-gradient(180deg, #0d9488, #99f6e4);
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 22px 14px 26px;
    border-bottom: 1px solid var(--clr-border-subtle);
  }

  &__line {
    display: none;
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
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: rgba(13, 148, 136, 0.08);
    color: var(--clr-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--cyan {
      background: rgba(14, 165, 233, 0.08);
      color: #0284c7;
    }

    &--orange {
      background: rgba(249, 115, 22, 0.08);
      color: #c2410c;
    }

    &--accent {
      background: rgba(139, 92, 246, 0.08);
      color: #7c3aed;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  padding: 18px 22px 22px 26px; // 左边补偿竖条宽度
}

.info-field {
  &--wide {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--clr-text-muted);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    gap: 4px;

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--clr-border);
      flex-shrink: 0;
    }
  }

  &__value {
    font-size: 13.5px;
    color: var(--clr-text);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;

    &--primary {
      color: var(--clr-primary-dark);
      font-weight: 600;
    }

    &--null {
      color: var(--clr-text-muted);
    }

    &.mono {
      font-family: 'SF Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
      font-size: 12px;
      color: var(--clr-text-secondary);
    }
  }
}

// 账号类型 badge
.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: rgba(13, 148, 136, 0.08);
  color: var(--clr-primary-dark);
  border: 1px solid rgba(13, 148, 136, 0.15);
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(13, 148, 136, 0.14);
    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.15);
  }
}

// 角色 badge
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: rgba(249, 115, 22, 0.08);
  color: #c2410c;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(249, 115, 22, 0.14);
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15);
  }
}

// 性别标签
.sex-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;

  &--male {
    color: #0284c7;
  }

  &--female {
    color: #db2777;
  }
}

.remark-block {
  padding: 18px 22px 22px 26px;
  font-size: 13.5px;
  color: var(--clr-text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ========== Password Dialog ========== */
:deep(.pwd-dialog) {
  .el-dialog {
    border-radius: var(--radius-card);
    overflow: hidden;
    border: 1px solid var(--clr-border);
  }

  .el-dialog__header {
    padding: 24px 28px 20px;
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
    padding: 26px 28px;
  }

  .el-dialog__footer {
    padding: 18px 28px 24px;
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
      box-shadow: 0 0 0 1px var(--clr-primary) !important;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2) !important;
      border-color: var(--clr-primary) !important;
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
    letter-spacing: 0.3px;
  }

  .el-button--primary {
    background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-dark) 100%);
    border: none;
    box-shadow: 0 2px 10px rgba(13, 148, 136, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
      transform: translateY(-1px);
    }
  }
}

/* ========== Animations ========== */
@keyframes hero-enter {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes avatar-enter {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes info-enter {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes actions-enter {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes stat-enter {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes section-enter {
  from { opacity: 0; transform: translateY(18px); }
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
    padding: 28px 22px;
    gap: 18px;
  }

  .profile-hero__name {
    font-size: 22px;
  }

  .profile-hero__name-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .info-section__header,
  .info-grid {
    padding-left: 22px;
  }

  .info-section::before {
    width: 3px;
  }
}
</style>
