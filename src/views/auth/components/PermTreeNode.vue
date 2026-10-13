<template>
  <div class="perm-node">
    <div
      class="perm-node__self"
      :class="`perm-node__self--type${node.resourceType}`"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
    >
      <span class="perm-node__arrow" :class="{ 'perm-node__arrow--empty': !hasChildren }">
        {{ hasChildren ? (node.expanded ? '▼' : '▶') : '' }}
      </span>
      <span class="perm-node__icon">{{ node.resourceType === 3 ? '⚡' : '📁' }}</span>
      <span class="perm-node__name">{{ node.resourceName }}</span>
    </div>
    <div v-if="hasChildren" class="perm-node__children">
      <PermTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceNode } from './role.vue'

const props = defineProps<{
  node: ResourceNode
  depth?: number
}>()

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
</script>

<style lang="scss" scoped>
.perm-node {
  &__self {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 4px;
    cursor: default;
    font-size: 13px;
    line-height: 1.4;
    transition: background 0.15s;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &--type1 {
      color: #1d4ed8;
      font-weight: 600;
    }

    &--type2 {
      color: #15803d;
      font-weight: 500;
    }

    &--type3 {
      color: #92400e;
      font-size: 12.5px;
    }
  }

  &__arrow {
    font-size: 8px;
    color: #9ca3af;
    width: 12px;
    flex-shrink: 0;

    &--empty {
      opacity: 0;
    }
  }

  &__icon {
    font-size: 12px;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
  }
}
</style>
