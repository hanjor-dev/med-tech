<template>
  <div ref="host" class="trend" aria-label="本期及上期订单数量趋势" />
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { Trend } from '@/api/orderStatistics'
const props = defineProps<{ trend?: Trend }>()
const host = ref<HTMLDivElement>()
let chart: echarts.ECharts | undefined
let resize: ResizeObserver | undefined
function render() {
  const t = props.trend
  if (!t) {
    chart?.clear()
    return
  }
  const length = Math.max(t.current.length, t.previous.length)
  chart?.setOption(
    {
      color: ['#177768', '#94a9c4'],
      legend: { top: 0 },
      grid: { left: 45, right: 25, bottom: 38 },
      tooltip: {
        trigger: 'axis',
        renderMode: 'richText',
        formatter: (points: any[]) =>
          points
            .map((p) => {
              const bucket = (p.seriesIndex === 0 ? t.current : t.previous)[
                p.dataIndex
              ]
              return bucket
                ? p.seriesName +
                    '  ' +
                    bucket.startDate +
                    ' 至 ' +
                    bucket.endDate +
                    '   ' +
                    bucket.count +
                    ' 单'
                : ''
            })
            .filter(Boolean)
            .join('\n'),
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length }, (_, i) => `第 ${i + 1} 段`),
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        { name: '本期', type: 'line', data: t.current.map((b) => b.count) },
        {
          name: '上期',
          type: 'line',
          lineStyle: { type: 'dashed' },
          data: t.previous.map((b) => b.count),
        },
      ],
    },
    true,
  )
}
onMounted(() => {
  chart = echarts.init(host.value!)
  resize = new ResizeObserver(() => chart?.resize())
  resize.observe(host.value!)
  render()
})
watch(() => props.trend, render)
onBeforeUnmount(() => {
  resize?.disconnect()
  chart?.dispose()
})
</script>
<style scoped>
.trend {
  height: 270px;
  width: 100%;
}
</style>
