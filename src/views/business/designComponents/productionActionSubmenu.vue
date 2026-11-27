<template>
  <component :is="inRow ? ElDropdownItem : ElButton" aria-haspopup="menu" :aria-expanded="expanded"
    @click.prevent="dropdown?.handleOpen()" @keydown.capture="onTriggerKey">
    <span ref="labelElement" class="production-submenu-label">
      <el-icon><ArrowLeft /></el-icon>{{ label }}
    </span>
  </component>
  <el-dropdown v-if="anchor" ref="dropdown" class="production-submenu-positioner" virtual-triggering
    :virtual-ref="anchor" trigger="hover" placement="left-start" :show-timeout="0" :hide-timeout="180"
    :append-to="group ? parentPopper : undefined" :hide-on-click="!!group" :trigger-keys="[]" :show-arrow="false" :persistent="false" :popper-options="popperOptions"
    @visible-change="expanded = $event" @command="selectAction">
    <template #dropdown>
      <el-dropdown-menu :aria-labelledby="titleId" @keydown.esc.capture.stop.prevent="closeToTrigger"
        @keydown.right.capture.stop.prevent="closeToTrigger">
        <li :id="titleId" role="presentation" class="production-submenu-name">{{ label }}</li>
        <template v-if="group">
          <el-dropdown-item v-for="action in group.actions" :key="action.command" :command="action.command"
            :icon="action.command === 'printInfo' ? Printer : Document">{{ action.label }}</el-dropdown-item>
        </template>
        <template v-else>
          <ProductionActionSubmenu v-for="category in menu.groups" :key="category.title" in-row
            :label="category.title" :menu="menu" :group="category" @select="selectAction" />
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { ElButton, ElDropdownItem, type DropdownInstance } from 'element-plus'
import { ArrowLeft, Document, Printer } from '@element-plus/icons-vue'
import type { ProductionSubmenu } from '../productionBranch'

defineProps<{ label: string; menu: ProductionSubmenu; inRow?: boolean; group?: ProductionSubmenu['groups'][number] }>()
const emit = defineEmits<{ select: [command: string] }>()
const dropdown = ref<DropdownInstance>()
const labelElement = ref<HTMLElement>()
const anchor = computed(() => labelElement.value?.closest<HTMLElement>('li, button') ?? undefined)
const parentPopper = computed(() => anchor.value?.closest<HTMLElement>('.el-popper') ?? undefined)
function selectAction(command?: string) {
  if (!command) return
  dropdown.value?.handleClose()
  emit('select', command)
}
const expanded = ref(false)
const titleId = useId()
const popperOptions = { modifiers: [
  { name: 'offset', options: { offset: [0, 2] } },
  { name: 'flip', options: { fallbackPlacements: ['left-end', 'right-start', 'right-end'] } },
] }

function onTriggerKey(event: KeyboardEvent) {
  if (expanded.value && ['Escape', 'ArrowRight'].includes(event.key)) {
    event.preventDefault()
    event.stopImmediatePropagation()
    closeToTrigger()
    return
  }
  if (!['Enter', ' ', 'ArrowLeft'].includes(event.key)) return
  event.preventDefault()
  event.stopImmediatePropagation()
  dropdown.value?.handleOpen()
}

function closeToTrigger() {
  dropdown.value?.handleClose()
  anchor.value?.focus({ preventScroll: true })
}
</script>

<style scoped>
.production-submenu-positioner { display: none; }
.production-submenu-label { display: inline-flex; align-items: center; }
.production-submenu-name { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
