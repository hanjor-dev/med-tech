<template>
  <dialog-modal v-model="visible" title="分配设计师" :subtitle="orderCode ? `订单号：${orderCode}` : ''" width="860px"
    @modal-close="handleClose">
    <div class="dialog-shell">
      <!-- 搜索栏 -->
      <div class="dla-search">
        <div class="dla-search__input-wrap">
          <svg class="dla-search__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="keyword" class="dla-search__input" placeholder="搜索设计师姓名或专长…" spellcheck="false" />
          <button v-if="keyword" class="dla-search__clear" @click="keyword = ''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="dla-search__meta">
          <span class="dla-search__count">
            共 <strong>{{ filteredDesigners.length }}</strong> 人
          </span>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="dla-body">

        <!-- 加载状态 -->
        <div v-if="loading" class="dla-state">
          <div class="dla-state__ring"></div>
          <span>正在检索可用设计师…</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredDesigners.length === 0" class="dla-state dla-state--empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <p>{{ keyword ? '未找到匹配的设计师' : '当前暂无可用设计师' }}</p>
        </div>

        <!-- 设计师列表 -->
        <div v-else class="dla-list">
          <div v-for="d in filteredDesigners" :key="d.userId" class="dla-card" :class="{
            'is-selected': selectedUserId === d.userId,
            'is-current': props.currentDesignerId === d.userId,
          }" @click="selectedUserId = d.userId">
            <!-- 头像 -->
            <div class="dla-card__avatar" :class="`dla-card__avatar--${avatarColor(d.userId)}`">
              <span>{{ d.realName?.charAt(0) || '?' }}</span>
            </div>

            <!-- 信息区 -->
            <div class="dla-card__body">
              <div class="dla-card__name-row">
                <div class="dla-card__name">{{ d.realName }}</div>
                <span v-if="props.currentDesignerId === d.userId" class="dla-card__current-badge">当前设计师</span>
              </div>
              <div class="dla-card__tags">
                <span v-for="s in (d.specialtyNameList || d.specialtyList || []).slice(0, 2)" :key="s"
                  class="dla-card__tag">{{ s }}</span>
                <span v-if="(d.specialtyNameList || d.specialtyList || []).length > 2"
                  class="dla-card__tag dla-card__tag--more">+{{ (d.specialtyNameList || d.specialtyList || []).length -
                    2 }}</span>
              </div>
            </div>

            <!-- 负载指示器 -->
            <div class="dla-card__load" :class="`dla-card__load--${loadLevel(d.currentLoad)}`">
              <div class="dla-card__load-ring">
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke-width="3" stroke="#f1f5f9" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke-width="3" stroke-linecap="round"
                    :stroke="loadColor(d.currentLoad)"
                    :stroke-dasharray="`${loadCircumference(d.currentLoad)} ${loadCircumference(15)}`"
                    stroke-dashoffset="0" transform="rotate(-90 18 18)" />
                </svg>
                <span class="dla-card__load-num" :class="`dla-card__load-num--${loadLevel(d.currentLoad)}`">
                  {{ d.currentLoad }}
                </span>
              </div>
              <span class="dla-card__load-label">工单</span>
            </div>

            <!-- 选中勾 -->
            <div v-if="selectedUserId === d.userId" class="dla-card__check"
              :class="{ 'dla-card__check--amber': props.currentDesignerId === d.userId }">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部状态栏 -->
      <div v-if="selectedUserId && !loading" class="dla-footer-bar"
        :class="{ 'dla-footer-bar--same': selectedUserId === props.currentDesignerId }">
        <svg v-if="selectedUserId === props.currentDesignerId" width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span v-if="selectedUserId === props.currentDesignerId">目前就是该设计师</span>
        <span v-else>指派给 <strong>{{designers.find(d => d.userId === selectedUserId)?.realName}}</strong></span>
      </div>
    </div>


    <template #footer-btn>
      <el-button class="btn-ghost" @click="handleClose">取消</el-button>
      <el-button class="btn-primary" :loading="submitting"
        :disabled="!selectedUserId || selectedUserId === props.currentDesignerId" @click="handleSubmit">确认分配</el-button>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DialogModal from '@/components/dialogModal.vue'
import { availableDesigners, assignDesigner } from '@/api/design'

const props = defineProps<{
  modelValue: boolean
  orderId: number | null
  orderCode?: string
  currentDesignerId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const designers = ref<AvailableDesigner[]>([])
const selectedUserId = ref<number | null>(null)
const loading = ref(false)
const submitting = ref(false)
const keyword = ref('')

interface AvailableDesigner {
  userId: number
  realName: string
  specialtyList?: string[]
  specialtyNameList?: string[]
  currentLoad: number
}

/** 负载等级 */
const loadLevel = (load: number) => {
  if (load === 0) return 'free'
  if (load < 5) return 'light'
  if (load < 10) return 'medium'
  return 'heavy'
}

/** 环形图弧长（半径14 => 周长≈88） */
const loadCircumference = (max: number) => `${(88 * Math.min(max, 15)) / 15}`

/** 环形图颜色 */
const loadColor = (load: number): string => {
  if (load === 0) return '#22c55e'
  if (load < 5) return '#14b8a6'
  if (load < 10) return '#f59e0b'
  return '#f43f5e'
}

/** 头像配色 */
const avatarColor = (userId: number): string => {
  const palette = ['amber', 'teal', 'violet', 'rose', 'sky']
  return palette[userId % palette.length]
}

const filteredDesigners = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return designers.value
  return designers.value.filter(d =>
    d.realName.toLowerCase().includes(kw) ||
    (d.specialtyNameList || d.specialtyList || []).some(s => s.toLowerCase().includes(kw))
  )
})

watch(visible, async (v) => {
  if (v) {
    keyword.value = ''
    selectedUserId.value = props.currentDesignerId ?? null
    loading.value = true
    designers.value = []
    try {
      const res: any = await availableDesigners(props.orderId!)
      designers.value = res?.data ?? res ?? []
    } catch {
      ElMessage.error('加载设计师列表失败')
    } finally {
      loading.value = false
    }
  }
})

const handleClose = () => { visible.value = false }

const handleSubmit = async () => {
  if (!selectedUserId.value || !props.orderId) return
  submitting.value = true
  try {
    await assignDesigner(props.orderId, selectedUserId.value)
    ElMessage.success('分配成功')
    visible.value = false
    emit('success')
  } catch {
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
// ─── Palette ───────────────────────────────────────────────
$bg: #f8f9fc;
$surface: #ffffff;
$surface-hover: #f1f5f9;
$border: #e8edf5;
$border-active: #1e6fd9;
$primary: #1e6fd9;
$primary-light: #e8f0fc;
$primary-dim: rgba(30, 111, 217, 0.08);
$amber: #f59e0b;
$amber-bg: #fffbeb;
$teal: #14b8a6;
$teal-bg: #f0fdfa;
$violet: #8b5cf6;
$violet-bg: #f5f3ff;
$rose: #f43f5e;
$rose-bg: #fff1f2;
$sky: #0ea5e9;
$sky-bg: #f0f9ff;
$green: #22c55e;
$green-bg: #f0fdf4;
$text: #1e293b;
$text-muted: #64748b;
$text-light: #94a3b8;
$text-dim: #cbd5e1;

// ─── Search Bar ────────────────────────────────────────────
.dla-search {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.dla-search__input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.dla-search__icon {
  position: absolute;
  left: 12px;
  color: $text-light;
  pointer-events: none;
  z-index: 1;
}

.dla-search__input {
  width: 100%;
  padding: 9px 36px 9px 34px;
  background: $surface;
  border: 1.5px solid $border;
  border-radius: 10px;
  color: $text;
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: $text-dim;
  }

  &:focus {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }
}

.dla-search__clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: $text-light;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: color 0.15s;

  &:hover {
    color: $text-muted;
  }
}

.dla-search__meta {
  flex-shrink: 0;
}

.dla-search__count {
  font-size: 12px;
  color: $text-muted;
  font-family: 'SF Mono', monospace;
  white-space: nowrap;

  strong {
    color: $primary;
    font-weight: 700;
  }
}

// ─── Body ─────────────────────────────────────────────────
.dla-body {
  min-height: 220px;
  max-height: 420px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $border;
    border-radius: 9999px;

    &:hover {
      background: $text-dim;
    }
  }
}

// ─── State ────────────────────────────────────────────────
.dla-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 60px 0;
  color: $text-muted;
  font-size: 13px;
  font-family: 'SF Mono', monospace;

  &--empty {
    svg {
      opacity: 0.2;
    }

    p {
      margin: 0;
      color: $text-light;
    }
  }
}

.dla-state__ring {
  width: 28px;
  height: 28px;
  border: 2px solid rgba($primary, 0.15);
  border-top-color: $primary;
  border-radius: 50%;
  animation: dla-spin 0.75s linear infinite;
}

@keyframes dla-spin {
  to {
    transform: rotate(360deg);
  }
}

// ─── List ──────────────────────────────────────────────────
.dla-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-bottom: 4px;
}

// ─── Card ─────────────────────────────────────────────────
.dla-card {
  position: relative;
  background: $surface;
  border: 1.5px solid $border;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
  animation: dla-enter 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;

  @for $i from 1 through 12 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.03}s;
    }
  }

  &:hover {
    border-color: rgba($primary, 0.35);
    transform: translateY(-2px);
  }

  &.is-selected {
    border-color: $primary;
    transform: translateY(-2px);
  }

  &.is-current {
    border-color: rgba($amber, 0.5);
  }
}

@keyframes dla-enter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// ─── Avatar ───────────────────────────────────────────────
.dla-card__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 900;
  flex-shrink: 0;
  letter-spacing: -0.5px;

  &--amber {
    color: $amber;
    box-shadow: 0 3px 10px rgba($amber, 0.35);
  }

  &--teal {
    color:$teal;
    box-shadow: 0 3px 10px rgba($teal, 0.3);
  }

  &--violet {
    color:$violet;
    box-shadow: 0 3px 10px rgba($violet, 0.3);
  }

  &--rose {
    color: $rose;
    box-shadow: 0 3px 10px rgba($rose, 0.3);
  }

  &--sky {
    color: $sky;
    box-shadow: 0 3px 10px rgba($sky, 0.3);
  }
}

// ─── Card Body ───────────────────────────────────────────
.dla-card__body {
  flex: 1;
  min-width: 0;
}

.dla-card__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.dla-card__name {
  font-size: 14px;
  font-weight: 700;
  color: $text;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dla-card__current-badge {
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  font-family: 'SF Mono', monospace;
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  color: #d97706;
  border: 1px solid rgba(#d97706, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
}

.dla-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dla-card__tag {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  background: $bg;
  color: $text-muted;
  border: 1px solid $border;

  &--more {
    color: $text-light;
    border-style: dashed;
    background: transparent;
  }
}

// ─── Load Ring ────────────────────────────────────────────
.dla-card__load {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dla-card__load-ring {
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;

  svg {
    display: block;
  }
}

.dla-card__load-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 800;
  font-family: 'SF Mono', 'Fira Code', monospace;

  &--free {
    color: $green;
  }

  &--light {
    color: $teal;
  }

  &--medium {
    color: $amber;
  }

  &--heavy {
    color: $rose;
  }
}

.dla-card__load-label {
  font-size: 11px;
  font-family: 'SF Mono', monospace;
  color: $text-light;
  font-weight: 600;
}

// ─── Check Badge ──────────────────────────────────────────
.dla-card__check {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  border-radius: 0 10px 0px 4px;
  background: #1e6fd9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(30, 111, 217, 0.4);

  &--amber {
    background: $amber;
    box-shadow: 0 2px 8px rgba($amber, 0.45);
  }
}

@keyframes dla-pop {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

// ─── Footer Bar ────────────────────────────────────────────
.dla-footer-bar {
  margin-top: 10px;
  padding: 10px 14px;
  background: $primary-dim;
  border: 1px solid rgba($primary, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: $text-muted;
  font-family: 'SF Mono', monospace;
  animation: dla-enter 0.2s ease;

  svg {
    color: $primary;
    flex-shrink: 0;
  }

  strong {
    color: $primary;
    font-weight: 700;
  }

  &--same {
    background: rgba($amber, 0.08);
    border-color: rgba($amber, 0.3);

    svg {
      color: $amber;
    }

    span {
      color: #92400e;
    }
  }
}
</style>
