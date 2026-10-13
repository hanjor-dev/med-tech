<template>
  <el-dialog v-model="visible" title="导出产品台账" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form :model="form" label-width="100px">
      <el-form-item label="流转卡编号">
        <el-input v-model="form.recordNo" placeholder="支持模糊查询" clearable style="width: 280px" />
      </el-form-item>
      <el-form-item label="订单编号">
        <el-input v-model="form.orderCode" placeholder="支持模糊查询" clearable style="width: 280px" />
      </el-form-item>
      <el-form-item label="产品编号">
        <el-input v-model="form.productNo" placeholder="支持模糊查询" clearable style="width: 280px" />
      </el-form-item>
      <el-form-item label="上机打印日期">
        <el-date-picker v-model="timeRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
          format="YYYY-MM-DD" style="width: 280px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="exporting" @click="handleExport">确认导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { exportProductionProductLedger } from '@/api/production'

const visible = defineModel<boolean>({ default: false })
const exporting = ref(false)
const timeRange = ref<[string, string] | null>(null)
const form = reactive({
  recordNo: '',
  orderCode: '',
  productNo: '',
})

const handleClose = () => {
  form.recordNo = ''
  form.orderCode = ''
  form.productNo = ''
  timeRange.value = null
}

const handleExport = async () => {
  exporting.value = true
  try {
    const params: any = {}
    if (form.recordNo) params.recordNo = form.recordNo
    if (form.orderCode) params.orderCode = form.orderCode
    if (form.productNo) params.productNo = form.productNo
    if (timeRange.value?.[0]) params.startTime = timeRange.value[0]
    if (timeRange.value?.[1]) params.endTime = timeRange.value[1]

    const { blob, fileName } = await exportProductionProductLedger(params)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
    visible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}
</script>
