<template>
  <dialog-modal
    v-model="visible"
    title="设备配置"
    :subtitle="config?.recordNo || ''"
    width="680px"
    :loading="loading"
    @modal-close="visible = false">
    <div v-loading="loading" class="dcfg-body">
      <!-- 工单基本信息 -->
      <div class="dcfg-meta" v-if="config">
        <div class="dcfg-meta__grid">
          <div class="dcfg-meta__item">
            <span class="dcfg-meta__label">流转卡编号</span>
            <span class="dcfg-meta__value mono">{{ config.recordNo || '—' }}</span>
          </div>
          <div class="dcfg-meta__item">
            <span class="dcfg-meta__label">数据包编号</span>
            <span class="dcfg-meta__value mono">{{ config.designPackageCode || '—' }}</span>
          </div>
          <div class="dcfg-meta__item">
            <span class="dcfg-meta__label">当前打印机</span>
            <span class="dcfg-meta__value mono">{{ config.printDeviceName || '未分配' }}</span>
          </div>
        </div>
      </div>

      <!-- 步骤指示器 -->
      <div class="dcfg-steps">
        <div
          v-for="(step, idx) in steps"
          :key="step.value"
          class="dcfg-step"
          :class="{
            'is-done': currentStep > step.value,
            'is-active': currentStep === step.value,
          }">
          <div class="dcfg-step__dot">
            <svg v-if="currentStep > step.value" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span class="dcfg-step__label">{{ step.label }}</span>
        </div>
        <div class="dcfg-step__line" :style="{ width: lineWidth }"></div>
      </div>

      <!-- 步骤1：选择打印机 + 打印配置 -->
      <div v-show="currentStep === 1" class="dcfg-step-content">
        <div class="dcfg-section-title">选择打印机</div>
        <div class="dcfg-printer-row">
        <el-select
          v-model="selectedPrinterId"
          placeholder="请选择一台打印机"
          filterable
          size="large"
          class="dcfg-printer-select">
          <template #prefix>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px">
              <rect x="6" y="2" width="12" height="6" rx="2" />
              <path d="M6 20H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="6" rx="1" />
            </svg>
          </template>
          <el-option
            v-for="p in printerList"
            :key="p.id"
            :label="p.deviceName"
            :value="p.id"
            :disabled="p.status !== 0">
            <div class="dcfg-printer-opt">
              <span class="dcfg-printer-opt__name">{{ p.deviceName }}</span>
              <span class="dcfg-printer-opt__no">{{ p.deviceNo }}</span>
              <el-tag size="small" :type="p.status === 0 ? 'success' : 'danger'" effect="plain">
                {{ p.statusName || (p.status === 0 ? '空闲' : '占用') }}
              </el-tag>
            </div>
          </el-option>
          <template #empty>
            <span style="padding: 8px 0; color: #94a3b8; font-size: 12px">暂无可用打印机</span>
          </template>
        </el-select>
        <el-button
          size="large"
          :disabled="!selectedPrinterId"
          :loading="releaseLoading"
          @click="handleReleaseDevice">
          取消选择
        </el-button>
        </div>

        <!-- 打印参数配置 -->
        <div class="dcfg-section-title" style="margin-top: 16px">打印参数配置</div>
        <el-form label-position="top" class="dcfg-form">
          <el-form-item label="打印材质">
            <el-select v-model="form.material" placeholder="请选择打印材质" clearable style="width: 100%">
              <el-option label="白色树脂" value="白色树脂" />
              <el-option label="透明树脂" value="透明树脂" />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 动态打印参数（来自接口配置） -->
        <div v-if="printParamFields.length" class="dcfg-params">
          <div v-for="field in printParamFields" :key="field.key" class="dcfg-param-field">
            <label class="dcfg-param-field__label">{{ field.label }}</label>
            <el-select
              v-if="field.type === 'select'"
              v-model="printParams[field.key]"
              :placeholder="field.label"
              clearable>
              <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-input
              v-else
              v-model.number="printParams[field.key]"
              :placeholder="field.label"
              clearable>
              <template v-if="field.unit" #suffix><span class="dcfg-param-field__unit">{{ field.unit }}</span></template>
            </el-input>
          </div>
        </div>

        <!-- 产品重量 -->
        <div class="dcfg-section-title" style="margin-top: 16px">中间产品重量设置</div>
        <div class="dcfg-product-list" v-if="productList.length">
          <div class="dcfg-product-header">
            <span class="dcfg-product-header__file">打印文件</span>
            <span class="dcfg-product-header__spec">规格</span>
            <span class="dcfg-product-header__weight">重量（单位：g）</span>
          </div>
          <div
            v-for="product in productList"
            :key="product.id"
            class="dcfg-product-row">
            <span class="dcfg-product-row__file" :title="product.fileName || product.productName">
              {{ product.fileName || product.productName }}
            </span>
            <span class="dcfg-product-row__spec">{{ product.specName || '—' }}</span>
            <div class="dcfg-product-row__weight">
              <el-input
                v-model="weightInputs[product.id]"
                placeholder="请输入"
                clearable
                class="dcfg-weight-input" />
              <span class="dcfg-product-row__unit">g</span>
            </div>
          </div>
        </div>
        <div v-else class="dcfg-empty">暂无产品数据</div>
      </div>

      <!-- 步骤2：填写生产信息并提交 -->
      <div v-show="currentStep === 2" class="dcfg-step-content">
        <div class="dcfg-section-title">填写生产信息</div>
        <el-form label-position="top" class="dcfg-form">
          <el-form-item label="生产批号">
            <div class="dcfg-batch-display">
              <span class="dcfg-batch-display__tip">系统自动生成</span>
            </div>
          </el-form-item>
          <el-form-item label="原材料批号（选填）">
            <el-input
              v-model="form.materialBatchNo"
              placeholder="请输入原材料批号"
              clearable />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer-btn>
      <!-- 步骤1：打印配置 -->
      <template v-if="currentStep === 1">
        <el-button class="btn btn-ghost" @click="visible = false">取消</el-button>
        <el-button class="btn btn-primary" :disabled="!selectedPrinterId" :loading="step1Loading" @click="saveStep1AndNext">
          下一步：填写生产信息 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </template>
      <!-- 步骤2：填写生产信息 -->
      <template v-else>
        <el-button class="btn btn-ghost" @click="currentStep = 1"><el-icon><ArrowLeft /></el-icon>返回</el-button>
        <el-button class="btn btn-primary" :loading="submitLoading" @click="handleSubmit">
          确认提交
        </el-button>
      </template>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, toRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import {
  getDeviceConfig,
  getPrinterList,
  assignDevice,
  checkPrinterOccupation,
  submitBatchNo,
  getProductionRecordDetail,
  getProcessParamsConfig,
  releaseDevice,
} from '@/api/production'
import type { DeviceConfigVO, PrinterVO, ProductionProductVO } from '@/api/production'

const props = defineProps<{ modelValue: boolean; id: number | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const submitLoading = ref(false)
const releaseLoading = ref(false)
const step1Loading = ref(false)

const currentStep = ref(1)
const steps = [
  { value: 1, label: '打印配置' },
  { value: 2, label: '生产信息' },
]

const lineWidth = computed(() => {
  const maxWidth = 66
  const segments = 1
  const progress = currentStep.value - 1
  return `${(progress / segments) * maxWidth}%`
})

const config = ref<DeviceConfigVO | null>(null)
const printerList = ref<PrinterVO[]>([])
const selectedPrinterId = ref<number | null>(null)
const productList = ref<ProductionProductVO[]>([])
const weightInputs = reactive<Record<number, string>>({})
const processParamsConfig = ref<Record<string, any>>({})
const printParams = reactive<Record<string, any>>({})

const printParamFields = computed<{ key: string; label: string; type: string; unit?: string; options?: string[] }[]>(() => {
  const config = processParamsConfig.value['print']
  if (!config) return []
  const fields: any[] = []
  Object.entries(config).forEach(([key, def]: [string, any]) => {
    if (def.type === 'switch' && def.dependents) {
      Object.entries(def.dependents).forEach(([dKey, dDef]: [string, any]) => {
        fields.push({
          key: dKey,
          label: (dDef as any).label,
          type: (dDef as any).type || 'text',
          unit: (dDef as any).unit,
          options: (dDef as any).options,
        })
      })
    } else {
      fields.push({
        key,
        label: def.label,
        type: def.type || 'text',
        unit: def.unit,
        options: def.options,
      })
    }
  })
  return fields
})

const form = reactive({
  materialBatchNo: '',
  material: '',
})

const loadData = async () => {
  if (!props.id) return
  loading.value = true
  try {
    const [cfgRes, printerRes, detailRes, paramsRes] = await Promise.all([
      getDeviceConfig(props.id),
      getPrinterList(),
      getProductionRecordDetail(props.id),
      getProcessParamsConfig(),
    ])
    config.value = (cfgRes as any).data ?? cfgRes

    const groups = (printerRes as any).data ?? printerRes
    printerList.value = Array.isArray(groups)
      ? groups.flatMap((g: any) => g.printers ?? [])
      : []

    if (config.value?.printDeviceId) selectedPrinterId.value = config.value.printDeviceId

    const detail = (detailRes as any).data ?? detailRes
    // 默认材质：导板类（17.2）透明树脂，模型类（17.1）白色树脂；已保存的优先
    form.material = config.value?.material
      || (detail?.productCategory === '17.2' ? '透明树脂' : '白色树脂')
    if (detail?.products) {
      productList.value = detail.products
      detail.products.forEach((p: ProductionProductVO) => {
        weightInputs[p.id] = p.weight != null ? String(p.weight) : ''
      })
    }

    processParamsConfig.value = (paramsRes as any).data ?? paramsRes
    initPrintParamDefaults()
    // 回显已保存的打印参数（覆盖默认值）
    if (config.value?.printParams) {
      try {
        const parsed = JSON.parse(config.value.printParams)
        Object.entries(parsed).forEach(([k, v]) => { printParams[k] = v })
      } catch { /* ignore parse error */ }
    }
  } finally {
    loading.value = false
  }
}

const goToStep = (step: number) => {
  currentStep.value = step
}

// 按参数名称写死的默认值（配置里没有 default 时兜底）
const PRINT_PARAM_LABEL_DEFAULTS: Record<string, number> = {
  '层厚': 0.1,
  '激光器功率': 300,
}

const initPrintParamDefaults = () => {
  const config = processParamsConfig.value['print']
  if (!config) return
  Object.keys(printParams).forEach((k) => delete printParams[k])
  Object.entries(config).forEach(([key, def]: [string, any]) => {
    if (def.type === 'switch' && def.dependents) {
      Object.entries(def.dependents).forEach(([dKey, dDef]: [string, any]) => {
        const val = (dDef as any).default ?? PRINT_PARAM_LABEL_DEFAULTS[(dDef as any).label]
        if (val !== undefined) printParams[dKey] = val
      })
    } else {
      const val = def.default ?? PRINT_PARAM_LABEL_DEFAULTS[def.label]
      if (val !== undefined) printParams[key] = val
    }
  })
}

const buildAssignPayload = (confirmOccupied: boolean) => {
  const payload: {
    deviceId: number
    productWeights: Array<{ productId: number; weight: number | null }>
    material?: string
    printParams?: string
    confirmOccupied?: boolean
  } = {
    deviceId: selectedPrinterId.value!,
    productWeights: productList.value.map((p) => ({
      productId: p.id,
      weight: parseWeight(weightInputs[p.id]),
    })),
    material: form.material || undefined,
    printParams: Object.keys(printParams).length ? JSON.stringify(toRaw(printParams)) : undefined,
  }
  if (confirmOccupied) payload.confirmOccupied = true
  return payload
}

const confirmOccupiedPrinter = async (): Promise<boolean> => {
  try {
    await ElMessageBox.confirm('该打印机已被其他流转卡选择，是否确认继续使用？', '打印机占用提示', {
      confirmButtonText: '确认继续',
      cancelButtonText: '取消',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}

const saveStep1AndNext = async () => {
  if (!props.id || !selectedPrinterId.value) return
  step1Loading.value = true
  try {
    // 占用预检：打印机被其他流转卡选择时先征求用户确认
    const occRes = await checkPrinterOccupation(props.id, selectedPrinterId.value)
    const occData = (occRes as any)?.data ?? occRes
    let confirmOccupied = false
    if (occData?.occupied) {
      const confirmed = await confirmOccupiedPrinter()
      if (!confirmed) return
      confirmOccupied = true
    }
    try {
      await assignDevice(props.id, buildAssignPayload(confirmOccupied))
    } catch (err) {
      // 预检与提交之间存在并发变化：提交时打印机已被占用
      if ((err as any)?.code === 840) {
        const confirmed = await confirmOccupiedPrinter()
        if (!confirmed) return
        await assignDevice(props.id, buildAssignPayload(true))
      } else {
        throw err
      }
    }
    currentStep.value = 2
  } finally {
    step1Loading.value = false
  }
}


const handleReleaseDevice = async () => {
  if (!props.id) return
  releaseLoading.value = true
  try {
    await releaseDevice(props.id)
    selectedPrinterId.value = null
    ElMessage.success('已取消打印机选择')
    await loadData()
  } finally {
    releaseLoading.value = false
  }
}

const parseWeight = (val: string): number | null => {
  if (val === '' || val == null) return null
  const num = parseFloat(val)
  return isNaN(num) ? null : num
}

const handleSubmit = async () => {
  if (!props.id) return
  submitLoading.value = true
  try {
    // 生产批号由后端在提交时自动生成，前端不再传递
    await submitBatchNo(props.id, {
      materialBatchNo: form.materialBatchNo || undefined,
    })
    ElMessage.success('设备配置成功')
    emit('success')
    visible.value = false
  } finally {
    submitLoading.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    currentStep.value = 1
    selectedPrinterId.value = null
    form.materialBatchNo = ''
    form.material = ''
    productList.value = []
    Object.keys(weightInputs).forEach((k) => delete weightInputs[Number(k)])
    Object.keys(printParams).forEach((k) => delete printParams[k])
    loadData()
  }
})

watch(visible, (val) => { if (!val) emit('update:modelValue', false) })
</script>

<style scoped lang="scss">
@use '@/assets/style/dialogLeftRight.scss' as *;

.dcfg-body {
  padding: 10px 20px;
  max-height: 500px;
  overflow-y: auto;
}

// ── Meta Info ──────────────────────────────────────────────────────────────
.dcfg-meta {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
}

.dcfg-meta__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 12px;
}

.dcfg-meta__item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}

.dcfg-meta__label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  min-width: 72px;
}

.dcfg-meta__value {
  color: #1e293b;
  font-weight: 600;
  flex: 1;
  word-break: break-all;

  &.mono {
    font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
    font-size: 11px;
  }
}

// ── Step Indicator ─────────────────────────────────────────────────────────
.dcfg-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px 0;
}

.dcfg-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  position: relative;
  z-index: 1;

  &__dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    transition: all 0.25s;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    white-space: nowrap;
  }

  &__line {
    position: absolute;
    top: 20px;
    left: 17%;
    height: 2px;
    width: 66%;
    background: #0ea5e9;
    border-radius: 1px;
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 0;
  }

  &.is-done {
    .dcfg-step__dot {
      background: #10b981;
      border-color: #10b981;
      color: #fff;
    }
    .dcfg-step__label { color: #10b981; }
  }

  &.is-active {
    .dcfg-step__dot {
      background: #0ea5e9;
      border-color: #0ea5e9;
      color: #fff;
      box-shadow: 0 0 0 5px rgba(14, 165, 233, 0.15);
    }
    .dcfg-step__label { color: #0ea5e9; font-weight: 700; }
  }
}

// ── Section Title ─────────────────────────────────────────────────────────
.dcfg-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
}

// ── Step Content ───────────────────────────────────────────────────────────
.dcfg-step-content {
  animation: fadeSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

// ── Printer Row ────────────────────────────────────────────────────────────
.dcfg-printer-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ── Printer List ───────────────────────────────────────────────────────────
.dcfg-printer-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  &__name {
    font-weight: 600;
    color: #1e293b;
    flex: 1;
  }

  &__no {
    font-size: 11px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    flex-shrink: 0;
  }
}

// ── Form ───────────────────────────────────────────────────────────────────
.dcfg-form {
  .el-form-item { margin-bottom: 4px; }
}

.dcfg-batch-display {
  width: 100%;
  min-height: 32px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;

  &__value {
    color: #1e293b;
    font-weight: 600;
    font-size: 13px;
  }

  &__tip {
    color: #94a3b8;
    font-size: 12px;
  }
}

// ── Dynamic Print Params ────────────────────────────────────────────────────
.dcfg-params {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 14px;
  margin-top: 4px;
}

.dcfg-param-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
  }

  &__unit {
    font-size: 11px;
    color: #94a3b8;
  }
}

// ── Product Weight List ────────────────────────────────────────────────────
.dcfg-product-list {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.dcfg-product-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  &__file {
    flex: 2;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  &__spec {
    flex: 1;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  &__weight {
    width: 170px;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
}

.dcfg-product-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;

  &:last-child { border-bottom: none; }

  &__file {
    flex: 2;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__spec {
    flex: 1;
    font-size: 12px;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__weight {
    width: 170px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__unit {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 600;
    flex-shrink: 0;
  }
}

.dcfg-weight-input {
  width: 130px;
}

// ── Empty ─────────────────────────────────────────────────────────────────
.dcfg-empty {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 13px;
}
</style>
