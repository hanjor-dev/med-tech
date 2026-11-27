<template>
  <div class="ddpd-tabs" role="tablist" :aria-label="label">
    <button v-for="(tab, index) in tabs" :key="tab.value" type="button" role="tab"
      class="ddpd-tab" :class="{ 'ddpd-tab--active': modelValue === tab.value }"
      :aria-selected="modelValue === tab.value" :tabindex="modelValue === tab.value ? 0 : -1"
      @click="emit('update:modelValue', tab.value)" @keydown="navigate($event, index)">
      <el-icon :size="14" aria-hidden="true"><component :is="tab.icon" /></el-icon>
      {{ tab.label }}
      <span v-if="tab.badge != null" class="ddpd-tab__badge"
        :class="{ 'ddpd-tab__badge--amber': tab.amber }">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
import type { Component } from 'vue'

const props = defineProps<{
  label: string
  modelValue: T
  tabs: readonly { value: T; label: string; icon: Component; badge?: string | number | null; amber?: boolean }[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

function navigate(event: KeyboardEvent, index: number) {
  const count = props.tabs.length
  let next: number
  switch (event.key) {
    case 'ArrowLeft': next = (index + count - 1) % count; break
    case 'ArrowRight': next = (index + 1) % count; break
    case 'Home': next = 0; break
    case 'End': next = count - 1; break
    default: return
  }
  event.preventDefault()
  const button = event.currentTarget as HTMLButtonElement
  button.parentElement?.querySelectorAll('button')[next]?.focus()
  emit('update:modelValue', props.tabs[next].value)
}
</script>

<style scoped lang="scss">
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
</style>
