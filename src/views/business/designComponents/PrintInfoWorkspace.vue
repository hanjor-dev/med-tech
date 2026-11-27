<template>
  <div class="print-info-workspace">
    <div class="dlr-root">
      <aside class="dlr-slidebar">
        <div class="dlr-slidebar__header">
          <span class="dlr-slidebar__num">01</span>
          <span class="dlr-slidebar__title">数据包</span>
          <span class="dlr-slidebar__count">{{ packages.length }}</span>
          <button class="dlr-slidebar__refresh" @click="emit('refresh')" :disabled="loading || disabled" title="刷新">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        <div class="dlr-slidebar__list">
          <div v-if="packages.length === 0 && !loading" class="dlr-slidebar__empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0c8e0" stroke-width="1.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>暂无数据包</span>
            <span class="dlr-slidebar__empty-sub">请先上传打印文件包</span>
          </div>

          <div v-for="pkg in packages" :key="pkg.id" class="pkg-item"
            :class="{ 'pkg-item--active': selectedId === pkg.id }" role="button" :aria-pressed="selectedId === pkg.id" :aria-disabled="disabled" :tabindex="disabled ? -1 : 0"
            :title="(pkg.files || []).map(file => file.fileName).join('\n')" @click="choose(pkg)" @keydown.enter.prevent="choose(pkg)" @keydown.space.prevent="choose(pkg)">
            <div class="pkg-item__header">
              <svg class="pkg-item__icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span class="pkg-item__name">{{ pkg.packageCode || `数据包 #${pkg.packageSeq}` }}</span>
              <span v-if="batchId && pkg.batchId === batchId" class="pkg-item__append-badge">追加</span>
              <span class="pkg-item__badge">×{{ pkg.fileCount ?? pkg.files?.length ?? 0 }}</span>
            </div>
            <div class="pkg-item__files">
              <span v-for="f in (pkg.files || []).slice(0, 3)" :key="f.id" class="pkg-item__tag" :title="f.fileName">
                {{ f.fileName.replace(/\.[^.]+$/, '') }}
              </span>
              <span v-if="(pkg.files || []).length > 3" class="pkg-item__more">
                +{{ (pkg.files || []).length - 3 }}
              </span>
            </div>
            <div class="pkg-item__status" v-if="status(pkg)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {{ status(pkg) }}
            </div>
          </div>
        </div>
      </aside>
      <main class="dlr-main" :class="{ 'dpid2-info-panel--empty': !selectedId }"><slot /></main>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: number; packageCode?: string; packageSeq?: number; batchId?: number | null; fileCount?: number; files?: { id: number; fileName: string }[] }">
const props = defineProps<{ packages: T[]; selectedId: number | null; batchId?: number | null; disabled: boolean; loading: boolean; status: (pkg: T) => string }>()
const emit = defineEmits<{ select: [pkg: T]; refresh: [] }>()
function choose(pkg: T) {
  if (!props.disabled) emit('select', pkg)
}
</script>

<style lang="scss">
@use 'sass:meta';
.print-info-workspace {
  @include meta.load-css('./printInfoWorkspace.scss');
}
</style>
