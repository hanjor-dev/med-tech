<template>
  <div class="chart-wrap">
    <div class="chart-title">
      <span class="title-bar" />
      {{ chart.title }}
    </div>
    <div ref="el" class="chart-body" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { ChartVO } from '@/api/dashboard'

const props = defineProps<{ chart: ChartVO }>()
const el = ref<HTMLElement>()
let instance: echarts.ECharts | null = null

const COLORS = ['#2f5bff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#c71585']
const AXIS = {
  axisLine: { lineStyle: { color: '#e4e7ed' } },
  axisLabel: { color: '#909399', fontSize: 11 },
  splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' as const } }
}

function buildOption(chart: ChartVO) {
  const { type, data } = chart
  // 兼容后端返回的小写 xaxis
  const xAxisData = data.xAxis || (data as any).xaxis || []
  const yAxisData = data.yAxis || (data as any).yaxis || []

  const base = {
    backgroundColor: '#ffffff',
    textStyle: { color: '#606266' },
    tooltip: { backgroundColor: 'rgba(0,0,0,.8)', borderColor: '#e4e7ed', textStyle: { color: '#ffffff' } },
  }
  if (type === 'line') return {
    ...base,
    tooltip: { ...base.tooltip, trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#909399' } },
    xAxis: { type: 'category', data: xAxisData, ...AXIS, splitLine: { show: false } },
    yAxis: { type: 'value', ...AXIS },
    series: data.series?.map((s: any, i: number) => ({
      ...s, type: 'line', smooth: true,
      lineStyle: { color: COLORS[i], width: 2 },
      itemStyle: { color: COLORS[i] },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: COLORS[i] + '20' }, { offset: 1, color: COLORS[i] + '00' }]) },
      symbol: 'circle', symbolSize: 4,
    })) ?? []
  }
  if (type === 'bar') return {
    ...base,
    tooltip: { ...base.tooltip, trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#5a8ab0' } },
    grid: { top: 10, bottom: 40, left: 50, right: 16 },
    xAxis: { type: 'category', data: xAxisData, ...AXIS, splitLine: { show: false } },
    yAxis: { type: 'value', ...AXIS },
    series: data.series?.map((s: any, i: number) => ({
      ...s, type: 'bar', barMaxWidth: 40, barMinHeight: 2,
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: COLORS[i] }, { offset: 1, color: COLORS[i] + 'cc' }]), borderRadius: [3, 3, 0, 0] },
    })) ?? []
  }
  if (type === 'pie' || type === 'ring') return {
    ...base,
    tooltip: { ...base.tooltip, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#909399' } },
    series: [{
      type: 'pie',
      radius: type === 'ring' ? ['42%', '65%'] : '60%',
      center: ['50%', '44%'],
      data: (data.items ?? []).map((item: any, i: number) => ({ ...item, itemStyle: { color: COLORS[i % COLORS.length] } })),
      label: { color: '#909399', fontSize: 11 },
      labelLine: { lineStyle: { color: '#e4e7ed' } },
    }]
  }
  if (type === 'heatmap') return {
    ...base,
    tooltip: { ...base.tooltip, trigger: 'item', formatter: (p: any) => `${p.name}: ${p.value[2]}` },
    grid: { left: 50, right: 60, top: 10, bottom: 40 },
    xAxis: { type: 'category', data: xAxisData, ...AXIS, splitLine: { show: false } },
    yAxis: { type: 'category', data: yAxisData, ...AXIS, splitLine: { show: false } },
    visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0,
      inRange: { color: ['#dbeafe', '#2f5bff'] }, textStyle: { color: '#909399' }, itemHeight: 80 },
    series: [{ type: 'heatmap', data: data.items ?? [], label: { show: false } }]
  }
  if (type === 'funnel') return {
    ...base,
    tooltip: { ...base.tooltip, trigger: 'item', formatter: '{b}: {c}' },
    series: [{
      type: 'funnel', left: '8%', width: '84%', top: 10, bottom: 30,
      data: (data.items ?? []).map((item: any, i: number) => ({ ...item, itemStyle: { color: COLORS[i % COLORS.length] }, label: { color: '#ffffff' } })),
      label: { position: 'inside', color: '#fff', fontSize: 12 },
      borderColor: 'transparent',
    }]
  }
  return {}
}

let ro: ResizeObserver
onMounted(() => {
  if (!el.value) return
  instance = echarts.init(el.value, undefined, { renderer: 'canvas' })
  instance.setOption(buildOption(props.chart))
  ro = new ResizeObserver(() => instance?.resize())
  ro.observe(el.value)
})
watch(() => props.chart.data, () => instance?.setOption(buildOption(props.chart), true), { deep: true })
onBeforeUnmount(() => { ro?.disconnect(); instance?.dispose() })
</script>

<style scoped>
.chart-wrap {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  display: flex; flex-direction: column;
  height: 100%; box-sizing: border-box;
  position: relative;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.chart-wrap:hover { border-color: #2f5bff; }
.chart-title {
  font-size: 13px; font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0;
}
.title-bar {
  display: inline-block; width: 3px; height: 13px;
  background: #2f5bff;
  border-radius: 1px;
}
.chart-body { flex: 1; min-height: 0; }
</style>
