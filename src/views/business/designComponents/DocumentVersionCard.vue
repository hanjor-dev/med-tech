<template>
  <div class="ddpd-version-card" :class="drawing ? 'ddpd-version-card--draw' : 'ddpd-version-card--instr'" style="position:relative">
    <!-- 刷新遮罩 -->
    <div v-if="refreshing" class="ddpd-version-card__refreshing-overlay">
      <el-icon class="ddpd-version-card__refreshing-icon" :size="20">
        <Loading />
      </el-icon>
      <span>刷新中…</span>
    </div>
    <div class="ddpd-version-card__header">
      <div class="ddpd-version-card__badge">
        <span class="ddpd-version-card__badge-label">{{ label }}</span>
        <span class="ddpd-version-card__badge-version">{{ version || '—' }}</span>
      </div>
      <span class="ddpd-version-card__status"
        :class="confirmed ? 'ddpd-version-card__status--confirmed' : 'ddpd-version-card__status--pending'">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5">
          <polyline v-if="confirmed" points="20 6 9 17 4 12" />
          <circle v-else cx="12" cy="12" r="10" />
          <line v-if="!confirmed" x1="12" y1="8" x2="12" y2="12" />
          <line v-if="!confirmed" x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ status || (confirmed ? '已确认' : '待确认') }}
      </span>
    </div>

    <div class="ddpd-version-card__meta">
      <div class="ddpd-version-card__meta-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>生成时间</span>
        <strong>{{ time || '—' }}</strong>
      </div>
      <div class="ddpd-version-card__meta-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>{{ fileLabel || '文件ID' }}</span>
        <strong class="ddpd-version-card__file-id">{{ file || '—' }}</strong>
      </div>
    </div>

    <div class="ddpd-version-card__actions">
      <div v-if="showUpload" class="ddpd-version-card__upload">
        <slot />
        <button class="ddpd-action-btn ddpd-action-btn--upload" @click="$emit('upload')"
          :disabled="uploadDisabled">
          <el-icon v-if="uploading" class="ddpd-action-btn__spin" :size="13">
            <Loading />
          </el-icon>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {{ uploading ? '上传中…' : '上传修订版' }}
        </button>
        <span class="ddpd-version-card__upload-hint" v-if="uploadHint">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {{ uploadHint }}
        </span>
        <span class="ddpd-version-card__upload-hint ddpd-version-card__upload-hint--success"
          v-else-if="uploadedName">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          已上传：{{ uploadedName }}
        </span>
      </div>

      <button class="ddpd-action-btn ddpd-action-btn--preview" @click="$emit('preview')"
        :disabled="previewDisabled">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {{ previewLabel || '在线预览' }}
      </button>
      <button class="ddpd-action-btn ddpd-action-btn--download" @click="$emit('download')"
        :disabled="downloadDisabled">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {{ downloading ? '下载中…' : '下载文件' }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
defineProps<{
  previewLabel?: string; label: string; version?: string | null; confirmed?: number | boolean; status?: string
  drawing?: boolean; refreshing?: boolean; time?: string | null; fileLabel?: string; file?: string | null
  showUpload?: boolean; uploading?: boolean; uploadDisabled?: boolean; uploadHint?: string; uploadedName?: string
  previewDisabled?: boolean; downloading?: boolean; downloadDisabled?: boolean
}>()
defineEmits<{ upload: []; preview: []; download: [] }>()
</script>
<style lang="scss" scoped>
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

</style>
