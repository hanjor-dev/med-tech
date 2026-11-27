<script setup lang="ts">
defineProps<{
  provideUdi?: number | null
  index?: number
}>()
</script>

<template>
  <template v-if="index !== undefined">
    <span v-if="provideUdi === 1" class="udi-corner" title="此订单勾选了提供UDI码" aria-label="提供UDI码">
      <span class="udi-ribbon">UDI</span>
    </span>
    <span :class="{ 'udi-index--marked': provideUdi === 1 }">{{ index }}</span>
  </template>
  <span v-else-if="provideUdi === 1" class="udi-tag" title="此订单勾选了提供UDI码">
    <strong class="udi-tag__code">UDI</strong><span class="udi-tag__notice">需提供</span>
  </span>
</template>

<style scoped>
.udi-corner,
.udi-tag {
  display: inline-flex;
  align-items: center;
  font-family: Arial, sans-serif;
  font-weight: 700;
  letter-spacing: .04em;
  white-space: nowrap;
}

/* Element Plus positions each table cell, including fixed index columns. */
.udi-corner {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  width: 36px;
  height: 36px;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.udi-ribbon {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 52px;
  transform: translate(-50%, -50%) rotate(-45deg);
  background: #b42336;
  color: #fff;
  text-align: center;
  font-size: 10px;
  line-height: 17px;
}

.udi-index--marked {
  display: inline-block;
  padding-inline-start: 8px;
  font-variant-numeric: tabular-nums;
}

.udi-tag {
  flex: none;
  vertical-align: middle;
  margin-inline-start: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: #fff0f2;
  box-shadow: inset 0 0 0 1px #dfa2ad;
  color: #8e2036;
  line-height: 26px;
}

.udi-tag__code {
  padding: 0 10px 0 8px;
  clip-path: polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
  background: #ac243d;
  color: white;
  font-size: 14px;
  letter-spacing: .07em;
}

.udi-tag__notice {
  padding: 0 9px 0 5px;
  font-family: system-ui, sans-serif;
  font-size: 12px;
  letter-spacing: .02em;
}
</style>
