<template>
  <dialog-modal v-model="visible" title="上传设计文件" :subtitle="subtitle" :width="width" :show-footer="true"
    @modal-close="handleClose">
    <uploadFileCustom
      ref="uploadRef"
      :types="fileTypes"
      :extra="uploadExtra"
    />

    <template #footer-btn>
      <el-button @click="handleClose" class="btn btn-ghost">取消</el-button>
      <el-button type="primary" class="btn btn-primary" @click="handleConfirm" :loading="submitting"
        :disabled="!canConfirm">
        完成上传
      </el-button>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import uploadFileCustom from '@/components/uploadFileCustom.vue'
import type { FileTypeConfig } from '@/components/uploadFileCustom'
import type { FileItem } from '@/components/uploadFileCustom'
import {
  designPackageList,
  designModelList,
  designModelLink,
  designReportLink,
  designReportGet,
  designPackageDelete,
  designModelDelete,
  designReportDelete,
  designPackageListForBatch,
  designPackageDeleteForBatch,
  type PackageListItem,
  type ModelListItem,
} from '@/api/design'
import { getConfigDetailByKey } from '@/api/param'

defineOptions({ name: 'DesignFileUploadDialog' })

// ─────────────────────────────────────────────────────────────────
// Props / Emits
// ─────────────────────────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  orderId: number | null
  orderCode?: string
  mode?: 'NORMAL' | 'APPEND_BATCH'
  batchId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
  (e: 'next', batchId: number): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const subtitle = computed(() => props.orderId ? `订单号：${props.orderCode}` : '')
const width = '960px'

// ─────────────────────────────────────────────────────────────────
// Upload ref
// ─────────────────────────────────────────────────────────────────
const uploadRef = ref<InstanceType<typeof uploadFileCustom> | null>(null)

// ─────────────────────────────────────────────────────────────────
// Submit state
// ─────────────────────────────────────────────────────────────────
const submitting = ref(false)

// ─────────────────────────────────────────────────────────────────
// 配置加载
// ─────────────────────────────────────────────────────────────────
const parseConfigNumber = (val: unknown, fallback: number): number => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const parsed = parseInt(val.trim(), 10)
    return isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

// 打印文件配置
const packageAccept = ref('.zip,.tar,.rar,.7z')
const packageMaxSizeMb = ref(3072)
// 追加模式下，上传进度卡片需要区分历史数据包和当前追加批次数据包。
const packageHistoryCount = ref(0)

// 可视化模型配置
const modelAccept = ref('.3dpdf,.ply,.stl,.obj,.pdf')
const modelMaxSizeMb = ref(3072)

// 设计报告配置
const reportAccept = ref('.pdf,.doc,.docx')
const reportMaxSizeMb = ref(3072)

const loadDesignConfig = async () => {
  try {
    const [pkgAcceptRes, pkgMaxRes, modelAcceptRes, modelMaxRes, reportAcceptRes, reportMaxRes] = await Promise.all([
      getConfigDetailByKey('design.package.archive_extensions'),
      getConfigDetailByKey('design.package.max_size_mb'),
      getConfigDetailByKey('design.model.allowed_extensions'),
      getConfigDetailByKey('design.model.max_size_mb'),
      getConfigDetailByKey('design.report.allowed_extensions'),
      getConfigDetailByKey('design.report.max_size_mb'),
    ])
    packageAccept.value = (pkgAcceptRes as any)?.configValue || '.zip,.tar,.rar,.7z'
    packageMaxSizeMb.value = parseConfigNumber((pkgMaxRes as any)?.configValue, 3072)
    modelAccept.value = (modelAcceptRes as any)?.configValue || '.3dpdf,.ply,.stl,.obj,.pdf'
    modelMaxSizeMb.value = parseConfigNumber((modelMaxRes as any)?.configValue, 3072)
    reportAccept.value = (reportAcceptRes as any)?.configValue || '.pdf,.doc,.docx'
    reportMaxSizeMb.value = parseConfigNumber((reportMaxRes as any)?.configValue, 3072)
  } catch {
    // 使用默认值
  }
}

// 解析 accept 字符串生成 formats 数组
const parseAcceptToFormats = (accept: string): string[] => {
  return accept
    .split(',')
    .map(e => e.trim().toUpperCase().replace(/^\./, ''))
    .filter(Boolean)
}

// ─────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────
const formatFileSize = (bytes: number): string => {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ─────────────────────────────────────────────────────────────────
// File type config
// ─────────────────────────────────────────────────────────────────
const buildPackageNameRule = (orderCode: string | undefined) => {
  if (!orderCode) return undefined
  const safePrefix = orderCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`^${safePrefix}[-–— ]+\\d+`, 'u')
  return (fileName: string) => {
    const base = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName
    if (!pattern.test(base)) {
      return `文件名格式不正确，需为订单编号+数字的格式`
    }
    return null
  }
}

// 监听弹框打开，加载配置
watch(visible, (val) => {
  if (val) {
    loadDesignConfig()
  }
})

const fileTypes = computed<FileTypeConfig[]>(() => [
  {
    type: 'printPackage',
    label: '打印文件（数据包）',
    num: '01',
    bizType: '20.1',
    accept: packageAccept.value,
    required: false,
    dropText: '打印文件（数据包）',
    dropSub: '每个数据包单独上传',
    formats: parseAcceptToFormats(packageAccept.value),
    iconColor: 'pkg',
    uploadApi: '/yi/design/package/upload',
    uploadBatch: false,
    uploadFileField: 'file',
    uploadExtraParams: { orderId: props.orderId ?? undefined, batchId: props.mode === 'APPEND_BATCH' ? props.batchId ?? undefined : undefined },
    validateFileName: buildPackageNameRule(props.orderCode),
    maxSizeMb: packageMaxSizeMb.value,
    initExisting: async () => {
      if (!props.orderId) return []
      let list: PackageListItem[]
      if (props.mode === 'APPEND_BATCH' && props.batchId) {
        const [allPackages, batchPackages] = await Promise.all([
          designPackageList(props.orderId),
          designPackageListForBatch(props.orderId, props.batchId),
        ])
        packageHistoryCount.value = Math.max(allPackages.length - batchPackages.length, 0)
        // 追加模式下完整展示历史数据包，但历史数据包仅可查看，当前批次才可删除。
        list = allPackages
      } else {
        packageHistoryCount.value = 0
        list = await designPackageList(props.orderId)
      }
      return list.map((pkg: PackageListItem, idx: number): FileItem => ({
        uid: -pkg.id,
        name: pkg.fileName,
        packageId: pkg.id,
        fileName: pkg.fileName,
        status: 'success',
        size: pkg.fileSize,
        url: pkg.fileUrl,
        fileId: pkg.fileId,
        fileSizeText: formatFileSize(pkg.fileSize),
        packageNo: `包 ${pkg.packageSeq ?? idx + 1}`,
        response: { code: 200 },
        isExisting: true,
        isCurrentBatch: props.mode === 'APPEND_BATCH' && props.batchId
          ? pkg.batchId === props.batchId
          : true,
        canDelete: props.mode === 'APPEND_BATCH' && props.batchId
          ? pkg.batchId === props.batchId
          : true,
      }))
    },
    countBreakdown: props.mode === 'APPEND_BATCH'
      ? (files: FileItem[]) => ({
        base: packageHistoryCount.value,
        current: files.filter(file => !file.isExisting || file.isCurrentBatch).length,
      })
      : undefined,
    onDelete: async (file: FileItem) => {
      if (!props.orderId || !file.packageId) return
      if (props.mode === 'APPEND_BATCH' && props.batchId) {
        await designPackageDeleteForBatch(Number(file.packageId), props.orderId, props.batchId)
      } else {
        await designPackageDelete(Number(file.packageId), props.orderId)
      }
    },
  },
  {
    type: 'model',
    label: '可视化模型',
    num: '02',
    bizType: '10.6',
    accept: modelAccept.value,
    required: false,
    dropText: '可视化模型',
    dropSub: '支持多文件批量上传',
    formats: parseAcceptToFormats(modelAccept.value),
    iconColor: 'model',
    uploadApi: '/yi/basic/file/upload-multiple',
    uploadBatch: true,
    uploadDebounce: 150,
    maxSizeMb: modelMaxSizeMb.value,
    initExisting: async () => {
      if (!props.orderId) return []
      const list = await designModelList(props.orderId)
      console.log(list, 'list')
      return list.map((m: ModelListItem): FileItem  => ({
        uid: -m.id,
        id: m.id,
        name: m.fileName,
        fileName: m.fileName,
        status: 'success',
        size: m.fileSize,
        url: m.fileUrl,
        fileId: m.fileId,
        fileSizeText: formatFileSize(m.fileSize),
        response: { code: 200 },
        isExisting: true,
      }))
    },
    onDelete: async (file: FileItem) => {
      if (!props.orderId || !file.id) return
      try {
        await designModelDelete(file.id as string, props.orderId)
        ElMessage.success('删除成功')
      } catch (error) {
        ElMessage.error('删除失败')
        throw error
      }
    },
  },
  {
    type: 'designReport',
    label: '设计报告',
    num: '03',
    bizType: '10.5',
    accept: reportAccept.value,
    required: false,
    dropText: '设计报告',
    dropSub: '支持多文件批量上传',
    formats: parseAcceptToFormats(reportAccept.value),
    iconColor: 'report',
    uploadApi: '/yi/basic/file/upload-multiple',
    uploadBatch: true,
    uploadDebounce: 150,
    maxSizeMb: reportMaxSizeMb.value,
    initExisting: async () => {
      if (!props.orderId) return []
      const reports = await designReportGet(props.orderId)
      return reports.map((report, index) => ({
        uid: -(index + 1),
        id: report.id,
        name: report.fileName,
        fileName: report.fileName,
        status: 'success' as const,
        size: report.fileSize,
        url: report.fileUrl,
        fileId: report.id,
        fileSizeText: formatFileSize(report.fileSize),
        response: { code: 200 },
        isExisting: true,
      }))
    },
    onDelete: async (file: FileItem) => {
      if (!props.orderId || !file.id) return
      try {
        await designReportDelete(file.id as string, props.orderId)
        ElMessage.success('删除成功')
      } catch (error) {
        ElMessage.error('删除失败')
        throw error
      }
    },
  },
])

const uploadExtra = computed(() => ({ orderId: props.orderId }))

const canConfirm = computed(() => {
  const fm = uploadRef.value?.fileMap
  if (!fm) return false
  return true
})

// ─────────────────────────────────────────────────────────────────
// Dialog close
// ─────────────────────────────────────────────────────────────────
const handleClose = () => {
  emit('update:modelValue', false)
}

const hasAnyFile = computed(() => {
  const fm = uploadRef.value?.fileMap
  if (!fm) return false
  return Object.values(fm).some(list => list.length > 0)
})

const handleConfirm = async () => {
  if (!uploadRef.value) return

  if (!hasAnyFile.value) {
    emit('update:modelValue', false)
    return
  }
  if (uploadRef.value.uploading) {
    ElMessage.warning('请等待所有文件上传完成后再提交')
    return
  }
  try {
    submitting.value = true
    await uploadRef.value.handleConfirm()
    const fm = uploadRef.value.fileMap || {}
    // 只有本次真正新增了设计数据包，才需要继续填写该追加批次的打印信息。
    // 追加入口也支持只维护模型/报告，此时不应把用户带到打印信息页面。
    const packageFiles: FileItem[] = fm['printPackage'] || []
    const hasNewPackage = packageFiles.some(f =>
      f.status === 'success' && !f.isExisting && f.fileId,
    )
    // 关联本次新上传的可视化模型
    const modelFiles: FileItem[] = fm['model'] || []
    const newModelFileIds = modelFiles
      .filter(f => f.status === 'success' && !f.isExisting && f.fileId)
      .map(f => String(f.fileId))
    if (props.orderId && newModelFileIds.length > 0) {
      await designModelLink(props.orderId, newModelFileIds)
    }

    // 追加关联本次新上传的设计报告，保留已有报告
    const reportFiles: FileItem[] = fm['designReport'] || []
    const newReportFileIds = reportFiles
      .filter(f => f.status === 'success' && !f.isExisting && f.fileId)
      .map(f => String(f.fileId))
    if (props.orderId && newReportFileIds.length > 0) {
      await designReportLink(props.orderId, newReportFileIds)
    }

    ElMessage.success('设计文件上传成功')
    emit('success')
    if (props.mode === 'APPEND_BATCH' && props.batchId && hasNewPackage) {
      emit('next', props.batchId)
    }
    emit('update:modelValue', false)
  } catch (err: any) {
    ElMessage.error(err.message || '上传失败')
  } finally {
    submitting.value = false
  }
}
</script>
