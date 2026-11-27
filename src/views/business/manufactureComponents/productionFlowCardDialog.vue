<template>
  <el-dialog
    v-model="visible"
    title=""
    width="960px"
    destroy-on-close
    class="flow-card-dialog"
    @close="handleFlowCardClose">
    <template #header>
      <div class="dialog-hero">
        <div>
          <div class="dialog-title">流程卡 <UdiBadge v-if="recordReady" :provide-udi="flowCardData.provideUdi" /></div>
          <div class="dialog-sub">{{ recordReady ? (flowCardData.productionNo || flowCardData.packageCode) : '加载中' }}</div>
        </div>
      </div>
    </template>

    <div v-if="recordReady" class="flow-card-body">
      <!-- 基础信息区 -->
      <div class="fc-base-info">
        <div class="fbi-item">
          <span class="fbi-label">数据包编号</span>
          <span class="fbi-value mono">{{ flowCardData.packageCode || '—' }}</span>
        </div>
        <div class="fbi-item">
          <span class="fbi-label">生产批号</span>
          <span class="fbi-value mono">{{ flowCardData.productionNo || '—' }}</span>
        </div>
        <div class="fbi-item">
          <span class="fbi-label">产品数量</span>
          <span class="fbi-value">{{ flowCardData.packQuantity }} 件</span>
        </div>
        <div class="fbi-item">
          <span class="fbi-label">产品标识</span>
          <span class="fbi-value">{{ flowCardData.productMark || '—' }}</span>
        </div>
        <div class="fbi-item">
          <span class="fbi-label">3D打印开始</span>
          <span class="fbi-value mono">{{ formatDateTime(flowCardData.printStartTime) || '—' }}</span>
        </div>
        <div class="fbi-item">
          <span class="fbi-label">3D打印结束</span>
          <span class="fbi-value mono">{{ formatDateTime(flowCardData.printFinishTime) || '—' }}</span>
        </div>
        <div class="fbi-item">
          <span class="fbi-label">原材料批号</span>
          <span class="fbi-value mono">{{ flowCardData.materialBatchNo || '—' }}</span>
        </div>
        <div class="fbi-item">
          <span class="fbi-label">负责人</span>
          <span class="fbi-value">{{ flowCardData.operatorName || '—' }}</span>
        </div>
      </div>

      <!-- 工序流程导航（5步标准流程） -->
      <div class="fc-process-nav">
        <div
          v-for="(step, idx) in PROCESS_STEPS"
          :key="step.processType"
          class="fp-nav-item"
          :class="{
            'is-active': activeStep === step.processType,
            'is-done': isStepDone(step.processType),
            'is-exception': isStepException(step.processType),
            'is-pending': !isStepDone(step.processType) && !isStepException(step.processType) && activeStep !== step.processType
          }"
          @click="activeStep = step.processType">
          <div class="fp-dot">
            <el-icon v-if="isStepException(step.processType)"><CloseBold /></el-icon>
            <el-icon v-else-if="isStepDone(step.processType)"><Check /></el-icon>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span class="fp-label">{{ step.processName }}</span>
          <span v-if="getStepRemark(step.processType)" class="fp-remark" :class="isStepException(step.processType) ? 'fp-remark--exception' : ''">
            {{ getStepRemark(step.processType) }}
          </span>
        </div>
      </div>

      <!-- 当前工序操作区 -->
      <div class="fc-process-panel" v-if="currentStepConfig">
        <div class="fcp-header">
          <div class="fcp-title">
            <span>{{ getStepDisplayName(activeStep) }}</span>
            <el-tag size="small" :type="getStepStatusTagType(activeStep)" effect="light">
              {{ getStepStatusText(activeStep) }}
            </el-tag>
            <el-tag v-if="getStepRemark(activeStep)" size="small" type="danger" effect="dark">
              {{ getStepRemark(activeStep) }}
            </el-tag>
          </div>
        </div>

        <!-- 待执行(0): 选择设备 + 开始 -->
        <template v-if="currentStepConfig.status === 0">
          <!-- 主设备 -->
          <div class="fcp-row">
            <div class="fcp-field">
              <label>选择{{ getPrimaryDeviceLabel(activeStep) }}</label>
              <el-select
                v-model="currentStepConfig.primaryDeviceId"
                placeholder="选择设备"
                filterable
                clearable
                size="default"
                style="width: 100%"
                :disabled="activeStep === 'PRINT' && flowCardData.orderStatus === 3020"
                @change="onPrimaryDeviceChange">
                <el-option
                  v-for="d in availablePrimaryDevices"
                  :key="d.id"
                  :label="d.deviceName"
                  :value="d.id">
                  <span>{{ d.deviceName }}</span>
                </el-option>
              </el-select>
            </div>
            <!-- ULTRASONIC 有辅助设备 -->
            <div v-if="activeStep === 'ULTRASONIC'" class="fcp-field">
              <label>选择{{ getSecondaryDeviceLabel(activeStep) }}</label>
              <el-select
                v-model="currentStepConfig.secondaryDeviceId"
                placeholder="选择辅助设备"
                filterable
                clearable
                size="default"
                style="width: 100%">
                <el-option
                  v-for="d in availableSecondaryDevices"
                  :key="d.id"
                  :label="d.deviceName"
                  :value="d.id">
                  <span>{{ d.deviceName }}</span>
                </el-option>
              </el-select>
            </div>
          </div>

          <!-- 动态工序参数 -->
          <div v-if="currentStepConfig.primaryDeviceId && currentStepParamFields.length" class="fcp-row fcp-row-split">
            <div v-if="currentPackGroupLabel" class="fcp-pack-group-badge">
              <el-tag type="info" effect="plain" size="small">产品类型：{{ currentPackGroupLabel }}</el-tag>
            </div>
            <div v-for="field in currentStepParamFields" :key="field.key" class="fcp-field">
              <label>{{ field.label }}</label>
              <el-select v-if="field.type === 'select'" v-model="currentStepConfig.processParams[field.key]" :placeholder="field.label" size="default" style="width:100%">
                <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <el-input v-else v-model.number="currentStepConfig.processParams[field.key]" :placeholder="field.label" clearable size="default">
                <template v-if="field.unit" #suffix>{{ field.unit }}</template>
              </el-input>
            </div>
          </div>

          <div v-if="activeStep !== 'PRINT'" class="fcp-row">
            <template v-if="activeStep === 'PACK' && flowCardData.orderType === 2 && flowCardData.orderStatus < 5050">
              <el-alert title="质检处理中，完成后可开始包装" type="warning" :closable="false" show-icon style="width:100%" />
            </template>
            <el-button v-else type="primary" size="large" @click="handleProcessStart"
              :disabled="!currentStepConfig.primaryDeviceId">
              <el-icon><VideoPlay /></el-icon>开始
            </el-button>
          </div>
        </template>

        <!-- 执行中(1): 设备信息 + 完成 -->
        <template v-else-if="currentStepConfig.status === 1">
          <div class="fcp-device-card">
            <div class="fdc-header">
              <div class="fdc-title">
                <el-icon><Monitor /></el-icon>
                <span>{{ getDeviceNameById(currentStepConfig.primaryDeviceId) }}</span>
              </div>
              <el-tag size="small" type="warning" effect="light">执行中</el-tag>
            </div>
            <div class="fdc-body">
              <div class="fdc-info-grid">
                <div class="fdc-info-item">
                  <span class="fdc-info-label">设备编号</span>
                  <span class="fdc-info-value">{{ getDeviceById(currentStepConfig.primaryDeviceId)?.deviceNo || '—' }}</span>
                </div>
                <div class="fdc-info-item">
                  <span class="fdc-info-label">开始时间</span>
                  <span class="fdc-info-value fdc-time">{{ formatDateTime(currentStepConfig.startTime) || '—' }}</span>
                </div>
              </div>
              <div v-if="currentStepConfig.secondaryDeviceId" class="fdc-info-item">
                <span class="fdc-info-label">{{ getSecondaryDeviceLabel(activeStep) }}</span>
                <span class="fdc-info-value">{{ getDeviceNameById(currentStepConfig.secondaryDeviceId) }}</span>
              </div>
              <div class="fdc-params">
                <template v-for="field in currentStepParamFields" :key="field.key">
                  <span v-if="currentStepConfig.processParams[field.key] !== undefined && currentStepConfig.processParams[field.key] !== ''" class="fdc-param-tag">
                    {{ field.label }}：{{ currentStepConfig.processParams[field.key] }}{{ field.unit ? ' ' + field.unit : '' }}
                  </span>
                </template>
              </div>
            </div>
          </div>
          <div v-if="activeStep !== 'PRINT'" class="fcp-row">
            <el-button type="success" size="large" @click="handleProcessFinish">
              <el-icon><Check /></el-icon>完成
            </el-button>
          </div>
          <!-- 强制完成打印（打印异常时使用） -->
          <div v-else-if="userInfoStore.hasPermission('manufacture:ForceCompletePrint')" class="fcp-row fcp-row--right">
            <el-button
              type="warning"
              size="large"
              plain
              :loading="forceCompleteLoading"
              @click="handleForceCompletePrint">
              <el-icon><Finished /></el-icon>强制完成打印
            </el-button>
          </div>
        </template>

        <!-- 已完成(2): 只读 -->
        <template v-else-if="currentStepConfig.status === 2">
          <div class="fcp-done-info">
            <div class="fcp-info-item">
              <el-icon color="#059669"><Clock /></el-icon>
              开始时间：{{ formatDateTime(currentStepConfig.startTime) || '—' }}
            </div>
            <div class="fcp-info-item">
              <el-icon color="#059669"><Check /></el-icon>
              完成时间：{{ formatDateTime(currentStepConfig.finishTime) || '—' }}
            </div>
            <div class="fcp-info-item">
              <el-icon><Monitor /></el-icon>
              主设备：{{ currentStepConfig.primaryDeviceName || '—' }}
            </div>
            <div v-if="currentStepConfig.secondaryDeviceId" class="fcp-info-item">
              <el-icon><Monitor /></el-icon>
              辅助设备：{{ getDeviceNameById(currentStepConfig.secondaryDeviceId) }}
            </div>
            <template v-for="field in currentStepParamFields" :key="field.key">
              <div v-if="currentStepConfig.processParams[field.key] !== undefined && currentStepConfig.processParams[field.key] !== ''" class="fcp-info-item">
                <el-icon><Setting /></el-icon>
                {{ field.label }}：{{ currentStepConfig.processParams[field.key] }}{{ field.unit ? ' ' + field.unit : '' }}
              </div>
            </template>
          </div>

        </template>
      </div>

      <!-- 产品明细 -->
      <div class="fc-product-section">
        <div class="fps-header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="5" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>产品明细</span>
          <span class="fps-count">共 {{ flowCardData.productList?.length || 0 }} 个</span>
        </div>
        <el-table :data="flowCardData.productList" border size="small" class="fc-product-table">
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="生产编号" prop="productCode" min-width="160">
            <template #default="{ row }">
              <span class="code-text">{{ row.productCode || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="产品名称" prop="productName" min-width="150" show-overflow-tooltip />
          <el-table-column label="文件名称" prop="fileName" min-width="120" show-overflow-tooltip />
          <el-table-column label="型号规格" prop="specName" min-width="120" show-overflow-tooltip />
          <el-table-column label="注册证号" prop="certNo" min-width="140" show-overflow-tooltip />
          <el-table-column label="材质" prop="materialName" width="100" show-overflow-tooltip />
          <el-table-column label="颜色" prop="colorName" width="80" align="center">
            <template #default="{ row }">{{ row.colorName || '—' }}</template>
          </el-table-column>
          <el-table-column label="产品状态" prop="statusName" width="90" align="center">
            <template #default="{ row }">{{ row.statusName || '—' }}</template>
          </el-table-column>
          <el-table-column label="质检结果" width="100" align="center">
            <template #default="{ row }">
              <template v-if="row.failReason">
                <div class="qc-status-cell">
                  <el-tag size="small" type="danger" effect="dark">不合格</el-tag>
                  <div class="qc-status-reason">原因：{{ row.failReason }}</div>
                  <el-tag v-if="row.handleType === 'REDO_CURRENT'" size="small" type="warning" effect="plain">重做当前工序</el-tag>
                  <el-tag v-else-if="row.handleType === 'REWORK_TO_PRINT'" size="small" type="danger" effect="plain">返工到打印</el-tag>
                </div>
              </template>
              <template v-else-if="row.qcResult === 'pass' || row.qcResult === 1">
                <el-tag size="small" type="success" effect="light">合格</el-tag>
              </template>
              <template v-else>
                <span class="text-gray">—</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="UDI" prop="udiCode" min-width="200">
            <template #default="{ row }">
              <span class="code-text small purple">{{ row.udiCode || '—' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import UdiBadge from '@/components/UdiBadge.vue'
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, VideoPlay, Monitor, Clock, Setting, WarningFilled, CloseBold, Finished } from '@element-plus/icons-vue'
import { getProductionRecordDetail, getProcessList, getDevicesByCenter, getProcessParamsConfig, startProcess, finishProcess, forceCompletePrint, fillPackInfo, transferPackToStorage, type CenterDeviceVO, type CenterDeviceGroupVO } from '@/api/production'
import { formatDateTime } from '@/utils/format'
import { useUserInfo } from '@/stores/userInfo'

const userInfoStore = useUserInfo()

// ─────────────────────────────────────────────────────────────────
// 标准工序步骤定义（文档 5.3 第 4.9 节）
// ─────────────────────────────────────────────────────────────────
const ALL_PROCESS_STEPS = [
  { processType: 'PRINT',       processName: '3D打印',              processSeq: 1 },
  { processType: 'WASH',        processName: '酒精清洗/打磨（含干燥）', processSeq: 2 },
  { processType: 'CURING',      processName: 'UV固化',              processSeq: 3 },
  { processType: 'ULTRASONIC',  processName: '超声清洗/干燥',         processSeq: 4 },
  { processType: 'PACK',        processName: '包装',                processSeq: 5 },
]
const NON_MEDICAL_STEPS = ['PRINT', 'PACK']

/**
 * 判断 pack 配置是否是分组结构（如 { "17.1": {...}, "17.2": {...} }）
 * 分组结构的第一层值是 category group 对象（不含 type 字段），
 * 扁平结构的第一层值直接是字段定义（含 type 字段）。
 */
const isPackGrouped = (config: Record<string, any>): boolean => {
  if (!config) return false
  const values = Object.values(config)
  if (values.length === 0) return false
  return values.every((v: any) => typeof v === 'object' && v !== null && !('type' in v))
}

/**
 * 从配置对象中提取参数字段列表（跳过 label 等元信息）
 */
const extractParamFields = (config: Record<string, any>) => {
  const fields: { key: string; label: string; type: string; unit?: string; options?: string[] }[] = []
  Object.entries(config).forEach(([key, def]: any) => {
    if (key === 'label') return
    if (def.type === 'switch') {
      if (def.dependents) {
        Object.entries(def.dependents).forEach(([dKey, dDef]: any) => {
          fields.push({
            key: dKey,
            label: dDef.label,
            type: dDef.type || 'text',
            unit: dDef.unit,
            options: dDef.options,
          })
        })
      }
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
}

/**
 * 获取配置对象中的默认值（跳过 label）
 */
const extractParamDefaults = (config: Record<string, any>): Record<string, any> => {
  const defaults: Record<string, any> = {}
  Object.entries(config).forEach(([key, def]: any) => {
    if (key === 'label') return
    if (def.type === 'switch') {
      if (def.dependents) {
        Object.entries(def.dependents).forEach(([dKey, dDef]: any) => {
          if (dDef.default !== undefined) defaults[dKey] = dDef.default
        })
      }
    } else if (def.default !== undefined) {
      defaults[key] = def.default
    }
  })
  return defaults
}

// 工序状态：0=待执行, 1=执行中, 2=已完成, 3=已跳过, 4=待质检
type ProcessStatus = 0 | 1 | 2 | 3 | 4

// ─────────────────────────────────────────────────────────────────
// 接口 VO（文档 4.10 + 5.3 第 4.10 节）
// ─────────────────────────────────────────────────────────────────
interface ProductVO {
  id: number
  productId: number
  productName: string
  specName: string
  certNo?: string
  materialName?: string
  colorName?: string
  statusName?: string
  quantity: number
  productCode?: string
  udiCode?: string
  qcResult: number | string
  failReason?: string
  handleType?: string
}

interface FlowCardVO {
  orderId: number
  packageCode: string
  productionNo: string
  packQuantity: number
  productMark: string
  productCategory?: string
  printStartTime: string
  printFinishTime: string
  materialBatchNo: string
  operatorName: string
  provideUdi: number
  orderType: number | null
  orderStatus: number
  productList: ProductVO[]
}

interface ProcessVO {
  processType: string
  processName: string
  processSeq: number
  status: ProcessStatus
  processId?: number
  configId?: number
  primaryDeviceId?: number
  primaryDeviceName?: string
  secondaryDeviceId?: number
  secondaryDeviceName?: string
  processParams: Record<string, any>
  startTime?: string
  finishTime?: string
  operatorName?: string
  latestQcResult?: number
  qcRecords: QcRecordVO[]
}

interface QcRecordVO {
  id: number
  processConfigId: number
  productId: number
  productName: string
  qcResult: number
  failReason?: string
  handleType?: string
  operatorId: number
  operatorName: string
  qcTime: string
  remark?: string
}

// ─────────────────────────────────────────────────────────────────
// 设备相关
// ─────────────────────────────────────────────────────────────────
// 工序 → 设备类型映射
const DEVICE_TYPE_MAP: Record<string, string> = {
  PRINT:       'PRINTER_SLA',
  WASH:        'WASH_CONTAINER',
  CURING:      'UV_CURING',
  ULTRASONIC:  'ULTRASONIC_CLEANER',
  PACK:        'SEALING_MACHINE',
}
const ULTRASONIC_SECONDARY_TYPE = 'AIR_COMPRESSOR'

const deviceCache = reactive<Record<string, CenterDeviceVO[]>>({})

const loadDevicesForStep = async (step: string) => {
  const type = DEVICE_TYPE_MAP[step]
  const types = type ? [type] : []
  if (step === 'ULTRASONIC') types.push(ULTRASONIC_SECONDARY_TYPE)
  await Promise.all(types.map(async t => {
    if (deviceCache[t]) return
    const res = await getDevicesByCenter({ deviceType: t })
    const groups: CenterDeviceGroupVO[] = (res as any).data ?? res
    deviceCache[t] = groups.flatMap(g => g.devices)
  }))
}

// 工序参数配置（从接口加载）
const processParamsConfig = ref<Record<string, any>>({})

const getPrimaryDeviceLabel = (step: string) => {
  const map: Record<string, string> = {
    PRINT: '3D打印机', WASH: '酒精容器', CURING: 'UV固化机',
    ULTRASONIC: '超声清洗机', PACK: '包装设备',
  }
  return map[step] || '设备'
}

const getSecondaryDeviceLabel = (step: string) => {
  return step === 'ULTRASONIC' ? '烘干机（辅助）' : '辅助设备'
}

const getDevicesByType = (deviceType: string): CenterDeviceVO[] =>
  deviceCache[deviceType] || []

const getDeviceById = (id?: number): CenterDeviceVO | undefined => {
  for (const list of Object.values(deviceCache)) {
    const found = list.find(d => d.id === id)
    if (found) return found
  }
}

const getDeviceNameById = (id?: number) => {
  if (!id) return '—'
  return getDeviceById(id)?.deviceName || '—'
}

const getSoakModeName = (mode?: string) => {
  const map: Record<string, string> = { standard: '标准浸泡', strong: '强力浸泡', gentle: '轻柔浸泡' }
  return map[mode || ''] || mode || '—'
}
const getCuringModeName = (mode?: string) => {
  const map: Record<string, string> = { standard: '标准固化', deep: '深度固化', fast: '快速固化' }
  return map[mode || ''] || mode || '—'
}
const getCleanModeName = (mode?: string) => {
  const map: Record<string, string> = { standard: '标准清洗', strong: '强力清洗', fine: '精细清洗' }
  return map[mode || ''] || mode || '—'
}

// ─────────────────────────────────────────────────────────────────
// Props / Emit
// ─────────────────────────────────────────────────────────────────
const props = defineProps<{ modelValue: boolean; id: number | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'success'): void
}>()

const PROCESS_STEPS = computed(() =>
  flowCardData.orderType === 2
    ? ALL_PROCESS_STEPS.filter(s => NON_MEDICAL_STEPS.includes(s.processType))
    : ALL_PROCESS_STEPS
)

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// ─────────────────────────────────────────────────────────────────
// 状态
// ─────────────────────────────────────────────────────────────────
const activeStep = ref('PRINT')

// 流程卡基本信息
const flowCardData = reactive<FlowCardVO>({
  orderId: 0,
  packageCode: '',
  productionNo: '',
  packQuantity: 0,
  productMark: '',
  productCategory: '',
  printStartTime: '',
  printFinishTime: '',
  materialBatchNo: '',
  operatorName: '',
  provideUdi: 0,
  orderType: null,
  orderStatus: 3010,
  productList: [],
})

// 工序配置映射（按 processType 索引）
// status: 0=待执行, 1=执行中, 2=已完成, 3=已跳过, 4=待质检
const processMap = reactive<Record<string, ProcessVO>>({})

const currentStepConfig = computed(() => processMap[activeStep.value])

const isStepDone = (step: string) => processMap[step]?.status === 2

const isStepException = (step: string) => {
  const cfg = processMap[step]
  if (!cfg) return false
  // 异常：有未处理的不合格记录（qcResult=0 且 handleType 有值）
  if (cfg.qcRecords?.some(r => r.qcResult === 0)) return true
  return false
}

const getStepRemark = (step: string) => {
  const cfg = processMap[step]
  if (!cfg) return ''
  if (cfg.status === 3) return '已跳过'
  if (cfg.qcRecords?.some(r => r.qcResult === 0)) {
    const reasons = cfg.qcRecords.filter(r => r.qcResult === 0).map(r => r.failReason).filter(Boolean)
    if (reasons.length > 0) return reasons[0] // 显示第一条原因
    return '不合格'
  }
  return ''
}

const getStepDisplayName = (step: string) => {
  const s = PROCESS_STEPS.value.find(p => p.processType === step)
  return s?.processName || step
}

const getStepStatusTagType = (step: string) => {
  const s = processMap[step]?.status
  const map: Record<number, string> = { 0: 'info', 1: 'warning', 4: 'warning', 2: 'success', 3: 'info' }
  return map[s as number] || 'info'
}

const getStepStatusText = (step: string) => {
  const s = processMap[step]?.status
  const map: Record<number, string> = { 0: '待执行', 1: '执行中', 4: '待质检', 2: '已完成', 3: '已跳过' }
  return map[s as number] || '未知'
}

// 可用主设备
const availablePrimaryDevices = computed(() => {
  const type = DEVICE_TYPE_MAP[activeStep.value]
  return type ? getDevicesByType(type) : []
})

// 可用辅助设备（仅 ULTRASONIC）
const availableSecondaryDevices = computed(() => {
  if (activeStep.value !== 'ULTRASONIC') return []
  return getDevicesByType(ULTRASONIC_SECONDARY_TYPE)
})

// 工序 → 参数配置 key 映射
const STEP_TO_PARAM_KEY: Record<string, string> = {
  WASH: 'wash', CURING: 'cure', ULTRASONIC: 'clean_dry', PACK: 'pack',
}

// 当前工序的参数字段列表（来自接口）
const currentStepParamFields = computed<{ key: string; label: string; type: string; unit?: string; options?: string[]; dependsOn?: string }[]>(() => {
  const paramKey = STEP_TO_PARAM_KEY[activeStep.value]
  if (!paramKey) return []
  let config = processParamsConfig.value[paramKey]
  if (!config) return []

  // pack 分组模式：根据 productCategory 选中对应分组
  if (paramKey === 'pack' && isPackGrouped(config)) {
    const category = flowCardData.productCategory
    config = category ? config[category] : null
    if (!config) return []
  }

  return extractParamFields(config)
})

// ─────────────────────────────────────────────────────────────────
// 设备变更时重置参数
// ─────────────────────────────────────────────────────────────────
const getDefaultParams = (paramKey: string) => {
  let config = processParamsConfig.value[paramKey]
  if (!config) return {}

  // pack 分组模式：根据 productCategory 选中对应分组
  if (paramKey === 'pack' && isPackGrouped(config)) {
    const category = flowCardData.productCategory
    config = category ? config[category] : null
    if (!config) return {}
  }

  return extractParamDefaults(config)
}

/** pack 分组模式下当前匹配的分组标签 */
const currentPackGroupLabel = computed(() => {
  if (activeStep.value !== 'PACK') return ''
  const packConfig = processParamsConfig.value['pack']
  if (!packConfig || !isPackGrouped(packConfig)) return ''
  const category = flowCardData.productCategory
  const group = category ? packConfig[category] : null
  return group?.label || ''
})

const onPrimaryDeviceChange = () => {
  const paramKey = STEP_TO_PARAM_KEY[activeStep.value]
  currentStepConfig.value!.processParams = paramKey ? getDefaultParams(paramKey) : {}
}

// 接口工序类型 → 组件工序类型映射
const API_TO_STEP: Record<string, string> = {
  print: 'PRINT', wash: 'WASH', cure: 'CURING', clean_dry: 'ULTRASONIC', pack: 'PACK',
}
// 接口工序状态 → 组件状态映射
const API_STATUS_TO_NUM: Record<string, ProcessStatus> = {
  pending: 0, in_progress: 1, completed: 2,
}

// ─────────────────────────────────────────────────────────────────
// 加载数据
// ─────────────────────────────────────────────────────────────────
const recordReady = ref(false)
let loadGeneration = 0
const loadData = async () => {
  const generation = ++loadGeneration
  if (!props.id) return
  const id = props.id

  const [detailRes, processRes, paramsRes] = await Promise.all([
    getProductionRecordDetail(id),
    getProcessList(id),
    getProcessParamsConfig(),
  ])

  if (generation !== loadGeneration || !props.modelValue || props.id !== id) return
  const detail = (detailRes as any).data ?? detailRes
  const processes: any[] = (processRes as any).data ?? processRes
  processParamsConfig.value = (paramsRes as any).data ?? paramsRes
  Object.assign(flowCardData, {
    orderId: detail.orderId,
    packageCode: detail.designPackageCode,
    productionNo: detail.productionBatchNo,
    packQuantity: detail.totalProductCount,
    productMark: detail.patientName || '',
    productCategory: detail.productCategory || '',
    printStartTime: detail.printStartTime || '',
    printFinishTime: detail.printFinishTime || '',
    materialBatchNo: detail.materialBatchNo || '',
    operatorName: detail.producerName || '',
    provideUdi: detail.provideUdi ?? 0,
    orderType: detail.orderType,
    orderStatus: detail.status,
    productList: (detail.products || []).map((p: any) => ({
      id: p.id,
      productId: p.id,
      productName: p.productName,
      specName: p.specName,
      certNo: p.certNo,
      materialName: p.materialName,
      quantity: 1,
      productCode: p.productNo,
      udiCode: p.udiCode,
      qcResult: p.qcResult === 'pass' ? 1 : 0,
      failReason: '',
      handleType: '',
      colorName: p.colorName,
      statusName: p.statusName,
      fileName: p.fileName
    })),
  })

  PROCESS_STEPS.value.forEach(s => {
    processMap[s.processType] = {
      processType: s.processType, processName: s.processName, processSeq: s.processSeq,
      status: 0, qcRecords: [], processParams: {},
    }
  })

  processes.forEach((p: any) => {
    const stepType = API_TO_STEP[p.processType]
    if (!stepType || !PROCESS_STEPS.value.find(s => s.processType === stepType)) return
    const stepDef = PROCESS_STEPS.value.find(s => s.processType === stepType)
    processMap[stepType] = {
      processId: p.id,
      processType: stepType,
      processName: stepDef?.processName || p.processName,
      processSeq: stepDef?.processSeq || p.processOrder,
      status: API_STATUS_TO_NUM[p.status] ?? 0,
      primaryDeviceId: p.deviceId,
      primaryDeviceName: p.deviceName,
      startTime: p.startTime,
      finishTime: p.endTime,
      operatorName: p.operatorName,
      processParams: p.processParams ? JSON.parse(p.processParams) : {},
      qcRecords: [],
    }
  })

  if (detail.status >= 3030 && processMap['PRINT']) processMap['PRINT'].status = 2
  if (detail.status >= 6010 && processMap['PACK']) processMap['PACK'].status = 2

  const firstNonDone = PROCESS_STEPS.value.find(s => !isStepDone(s.processType))
  if (firstNonDone?.processType === 'PACK') {
    activeStep.value = (flowCardData.orderType === 2 || detail.status >= 5050) ? 'PACK' : 'ULTRASONIC'
  } else {
    activeStep.value = firstNonDone?.processType || PROCESS_STEPS.value.at(-1)!.processType
  }

  recordReady.value = true
  // 预加载当前激活工序的设备列表
  await loadDevicesForStep(activeStep.value)
}

// ─────────────────────────────────────────────────────────────────
// 切换工序时加载设备
// ─────────────────────────────────────────────────────────────────
watch(activeStep, (step) => {
  if (processMap[step]?.status === 0) {
    loadDevicesForStep(step).catch(() => {})
  }
})

// ─────────────────────────────────────────────────────────────────
// 操作：开始工序
// ─────────────────────────────────────────────────────────────────
const handleProcessStart = async () => {
  const cfg = processMap[activeStep.value]
  if (!cfg || !props.id) return

  if (activeStep.value === 'PACK') {
    await fillPackInfo(props.id, {
      primaryDeviceId: cfg.primaryDeviceId!,
      secondaryDeviceId: cfg.secondaryDeviceId,
      processParams: cfg.processParams ? JSON.stringify(cfg.processParams) : undefined,
    })
  } else {
    const stepKey = Object.entries(API_TO_STEP).find(([, v]) => v === activeStep.value)?.[0] || activeStep.value.toLowerCase()
    await startProcess(props.id, {
      processType: stepKey,
      primaryDeviceId: cfg.primaryDeviceId!,
      secondaryDeviceId: cfg.secondaryDeviceId,
      processParams: cfg.processParams ? JSON.stringify(cfg.processParams) : undefined,
    })
  }

  cfg.status = 1
  cfg.startTime = formatDateTime(new Date())
  cfg.primaryDeviceName = getDeviceNameById(cfg.primaryDeviceId)
  if (activeStep.value === 'ULTRASONIC') cfg.secondaryDeviceName = getDeviceNameById(cfg.secondaryDeviceId)
  if (activeStep.value === 'PRINT') flowCardData.printStartTime = cfg.startTime

  ElMessage.success(`${getStepDisplayName(activeStep.value)} 已开始`)
}

// ─────────────────────────────────────────────────────────────────
// 操作：完成工序
// ─────────────────────────────────────────────────────────────────
const handleProcessFinish = async () => {
  const cfg = processMap[activeStep.value]
  if (!cfg || !props.id) return

  if (activeStep.value === 'PACK') {
    await transferPackToStorage(props.id)
  } else {
    const stepKey = Object.entries(API_TO_STEP).find(([, v]) => v === activeStep.value)?.[0] || activeStep.value.toLowerCase()
    await finishProcess(props.id, stepKey)
  }

  cfg.status = 2
  cfg.finishTime = formatDateTime(new Date())
  if (activeStep.value === 'PRINT') flowCardData.printFinishTime = cfg.finishTime

  if (activeStep.value !== 'ULTRASONIC') {
    const currentIdx = PROCESS_STEPS.value.findIndex(s => s.processType === activeStep.value)
    if (currentIdx < PROCESS_STEPS.value.length - 1) {
      activeStep.value = PROCESS_STEPS.value[currentIdx + 1].processType
    }
  }

  ElMessage.success(`${getStepDisplayName(activeStep.value)} 已完成`)
}


// ─────────────────────────────────────────────────────────────────
// 操作：强制完成打印
// ─────────────────────────────────────────────────────────────────
const forceCompleteLoading = ref(false)

const handleForceCompletePrint = async () => {
  if (!props.id) return
  try {
    await ElMessageBox.confirm(
      '将直接结束当前流转卡的打印工序，请确认打印设备已停止。是否继续？',
      '强制完成打印',
      { confirmButtonText: '确认强制完成', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  forceCompleteLoading.value = true
  try {
    await forceCompletePrint(props.id)
    ElMessage.success('打印已强制完成')
    emit('success') // 刷新列表
    await loadData() // 刷新流转卡详情与打印状态
  } finally {
    forceCompleteLoading.value = false
  }
}


// ─────────────────────────────────────────────────────────────────
// 关闭
// ─────────────────────────────────────────────────────────────────
const handleFlowCardClose = () => {
  Object.keys(processMap).forEach(k => delete processMap[k])
  Object.keys(deviceCache).forEach(k => delete deviceCache[k])
  activeStep.value = 'PRINT'
  emit('success')
}

watch(() => [props.modelValue, props.id], () => {
  ++loadGeneration
  recordReady.value = false
  if (props.modelValue) loadData().catch(() => ElMessage.error('加载流程卡失败'))
}, { immediate: true })
watch(visible, (val) => { if (!val) emit('update:modelValue', false) })
</script>

<style scoped lang="scss">
// ── Flow Card Dialog ────────────────────────────────────────────────────────
.flow-card-dialog {
  :deep(.el-dialog__body) { padding: 0; }
}

.flow-card-body {
  padding: 16px 20px 20px;

  gap: 14px;
  overflow: auto;
  max-height: 550px;
}

// ── Base Info ─────────────────────────────────────────────────────────────
.fc-base-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid #e8edf2;
  border-radius: 10px;
  overflow: hidden;
  background: #fafbfc;
  margin-bottom: 10px;
}

.fbi-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 14px;
  border-right: 1px solid #f0f3f6;
  &:nth-child(4n) { border-right: none; }
  &:last-child { border-right: none; }
}

.fbi-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fbi-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  &.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 11px; }
}

// ── Process Nav ─────────────────────────────────────────────────────────────
.fc-process-nav {
  display: flex;
  align-items: center;
  position: relative;
  background: #fff;
  border: 1px solid #e8edf2;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 10px;
}

.fp-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 80px;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: all 0.2s;

  &::before {
    content: '';
    position: absolute;
    top: 18px;
    left: calc(50% + 16px);
    right: calc(-50% + 16px);
    height: 2px;
    background: #e8edf2;
    z-index: 0;
  }

  &:last-child::before { display: none; }
  &:hover { opacity: 0.8; }

  &.is-done {
    .fp-dot { background: #059669; border-color: #059669; color: #fff; }
    .fp-label { color: #059669; font-weight: 600; }
    &::before { background: #059669; }
  }

  &.is-exception {
    .fp-dot { background: #e11d48; border-color: #e11d48; color: #fff; box-shadow: 0 0 0 5px rgba(225, 29, 72, 0.15); }
    .fp-label { color: #e11d48; font-weight: 700; }
    &::before { background: #e11d48; }
  }

  &.is-active {
    .fp-dot { background: #0ea5e9; border-color: #0ea5e9; color: #fff; box-shadow: 0 0 0 5px rgba(14, 165, 233, 0.15); }
    .fp-label { color: #0ea5e9; font-weight: 700; }
    &::before { background: #e8edf2; }
  }

  &.is-pending {
    .fp-dot { background: #fff; border-color: #e2e8f0; color: #94a3b8; }
    .fp-label { color: #94a3b8; }
  }
}

.fp-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}

.fp-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-align: center;
  white-space: nowrap;
  line-height: 1.3;
}

.fp-remark {
  font-size: 10px;
  color: #ef4444;
  font-weight: 700;
  background: #fef2f2;
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;

  &--exception {
    background: #ffe4e6;
    color: #e11d48;
  }
}

// ── Process Panel ───────────────────────────────────────────────────────────
.fc-process-panel {
  background: #fff;
  border: 1px solid #e8edf2;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 10px;
}

.fcp-header { padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }

.fcp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.fcp-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  &-split { flex-wrap: wrap; }
  &--right { justify-content: flex-end; }
}

.fcp-pack-group-badge {
  width: 100%;
  margin-bottom: 2px;
}

.fcp-field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }
}

// ── Device Card ───────────────────────────────────────────────────────────
.fcp-device-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.fdc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.fdc-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.fdc-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fdc-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.fdc-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fdc-info-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.fdc-info-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  &.fdc-time {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 11px;
  }
}

.fdc-params {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fdc-param-tag {
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

// ── QC Section ─────────────────────────────────────────────────────────────
.fcp-qc-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fcp-qc-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 8px 12px;
}

.fcp-qc-alert {
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &--redo {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }

  &--rework {
    background: #f5f3ff;
    border: 1px solid #ddd6fe;
  }
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.alert-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);

  &:first-of-type { border-top: none; }
}

.alert-product {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.alert-reason {
  display: flex;
  align-items: center;
  gap: 6px;
}

.alert-reason-text {
  font-size: 11px;
  color: #dc2626;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qc-status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.qc-status-reason {
  font-size: 10px;
  color: #dc2626;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.qc-product-list {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.qc-prod-header {
  display: grid;
  grid-template-columns: 160px 140px 80px 70px 100px 140px;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  align-items: center;
}

.qc-prod-row {
  display: grid;
  grid-template-columns: 160px 140px 80px 70px 100px 140px;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
  color: #1e293b;
  align-items: center;
  &:last-child { border-bottom: none; }
}

.qc-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  color: #64748b;
}

.qc-summary {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #64748b;
  padding: 6px 0;
}

// ── Done Info ──────────────────────────────────────────────────────────────
.fcp-done-info {
  background: #f0fdf4;
  border: 1px solid #d1fae5;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fcp-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #065f46;
}

// ── Product Section ─────────────────────────────────────────────────────────
.fc-product-section {
  background: #fff;
  border: 1px solid #e8edf2;
  border-radius: 10px;
  overflow: hidden;
}

.fps-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e8edf2;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.fps-count {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 4px;
}

.fc-product-table {
  :deep(.el-table__header-wrapper th) { background: #f8fafc !important; }
}

// ── Utils ─────────────────────────────────────────────────────────────────
.code-text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  color: #1e3a5f;
  &.small { font-size: 10px; }
  &.purple { color: #6366f1; }
}
.mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
}
.text-gray { color: #94a3b8; }

.device-opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
.opt-name { font-weight: 600; color: #1e293b; font-size: 13px; }
.opt-status {
  font-size: 11px;
  font-weight: 600;
  &.s-0 { color: #94a3b8; }
  &.s-1 { color: #059669; }
  &.s-2 { color: #d97706; }
}
</style>
