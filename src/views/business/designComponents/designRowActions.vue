<template>
  <el-dropdown ref="dropdown" trigger="click" :persistent="false" @visible-change="onVisibleChange" @command="select">
    <el-button text :icon="MoreFilled" aria-label="工单操作" />
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="action in actions" :key="action.command">
          <ProductionActionSubmenu v-if="action.submenu" in-row :label="action.label" :menu="action.submenu"
            @select="selectChild" />
          <el-dropdown-item v-else :command="action.command" :divided="action.divided" :icon="action.icon">
            {{ action.label }}
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import type { DropdownInstance } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import type { ProductionSubmenu } from '../productionBranch'
import ProductionActionSubmenu from './productionActionSubmenu.vue'

defineProps<{ actions: { command: string; label: string; icon: Component; divided?: boolean; submenu?: ProductionSubmenu }[] }>()
const emit = defineEmits<{ open: []; select: [command: string] }>()
const dropdown = ref<DropdownInstance>()
const onVisibleChange = (open: boolean) => { if (open) emit('open') }
const select = (command: string) => emit('select', command)
const selectChild = (command: string) => {
  dropdown.value?.handleClose()
  select(command)
}
</script>
