<template>
  <dialog-modal
    v-model="visible"
    :title="dialogTitle"
    :subtitle="dialogSubtitle"
    width="960px"
    @modal-close="handleClose"
  >
    <uploadFileCustom
      ref="uploadRef"
      :types="fileTypes"
      :extra="uploadExtra"
      :initial-file-map="cachedFileMap"
      :on-confirm="handleUploadConfirm"
    />

    <template #footer-btn>
      <el-button class="btn btn-ghost" @click="handleClose">取消</el-button>
      <el-button class="btn btn-ghost" v-if="showPrevButton" @click="handlePrev">上一步</el-button>
      <el-button class="btn btn-ghost" v-if="!isModifyMode" @click="handleSaveDraftNoSubmit" :loading="savingDraft">
        保存为草稿
      </el-button>
      <el-button class="btn btn-primary" @click="handleSubmit" :loading="submitting">
        {{ isModifyMode ? '确认修改' : '提交订单' }}
      </el-button>
    </template>
  </dialog-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dialogModal from '@/components/dialogModal.vue'
import uploadFileCustom from '@/components/uploadFileCustom.vue'
import type { FileTypeConfig, FileMap } from '@/components/uploadFileCustom'
import {
  draftSave,
  draftDetail,
  orderDetail,
  orderCreate,
  orderModifyFullV2,
  orderModifyApply,
  type DraftDTO,
  type CreateOrderDTO,
  type CreateOrderItemDTO,
  type ImageFileVO,
  type OrderModifyFullDTO,
} from '@/api/order'  
import { getConfigDetailByKey } from '@/api/param'
import { useUserInfo } from '@/stores/userInfo'

defineOptions({ name: 'FileUploadDialog' })

// ─────────────────────────────────────────────────────────────────
// Props / Emits
// ─────────────────────────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  draftId?: number | null
  draft?: DraftDTO | null
  orderFormData?: DraftDTO | null
  title?: string
  /** 修改订单 ID（走 orderModifyFullV2） */
  modifyOrderId?: number | null
  /** 订单ID（修改模式需回显已有文件） */
  orderId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success', orderId: number): void
  (e: 'draftSaved', draftId: number): void
  (e: 'prev', payload: { formData: DraftDTO | null; draftId: number | null }): void
}>()

// ─────────────────────────────────────────────────────────────────
// Dialog control
// ─────────────────────────────────────────────────────────────────
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isModifyMode = computed(() => !!props.modifyOrderId)

// ─────────────────────────────────────────────────────────────────
// 角色判断
// ─────────────────────────────────────────────────────────────────
const userRoleCode = computed(() => useUserInfo().userInfos.roleCode || '')
const isAdminOrCompanyAdmin = computed(() => ['admin', 'company-admin'].includes(userRoleCode.value))
const isSalesman = computed(() => ['salesman', 'salesman-self', 'regional-manager'].includes(userRoleCode.value))
const isDesigner = computed(() => ['designer', 'designer-manager'].includes(userRoleCode.value))

// 订单阶段（phase === 10）
const isPhaseOrder = computed(() => isModifyMode.value && (props.orderFormData as any)?.phase === 10)
// 设计阶段（phase === 20）
const isPhaseDesign = computed(() => isModifyMode.value && (props.orderFormData as any)?.phase === 20)

// 业务员/设计师在设计阶段提交修改时，需要走申请流程
const needSubmitModifyApply = computed(() => {
  if (!isModifyMode.value) return false
  if (isSalesman.value || isDesigner.value) {
    return isPhaseDesign.value
  }
  return false
})
const showPrevButton = computed(() => !!props.orderFormData)

const dialogTitle = computed(() => {
  if (props.title) return props.title
  return isModifyMode.value ? '修改影像文件' : '上传影像文件'
})
const dialogSubtitle = computed(() => {
  if (isModifyMode.value && props.modifyOrderId) {
    return props.orderFormData?.patientName
      ? `订单修改 · ${props.orderFormData.patientName}`
      : '订单修改'
  }
  return props.draftId ? `草稿 #${props.draftId}` : ''
})

// ─────────────────────────────────────────────────────────────────
// Upload ref
// ─────────────────────────────────────────────────────────────────
const uploadRef = ref<InstanceType<typeof uploadFileCustom>>()

// 影像数据是否必填（系统配置 order.image.required）
const imageDataRequired = ref(true)
// 影像数据文件格式（系统配置 order.image.data.allowed_extensions）
const imageDataAccept = ref('.zip,.rar,.7z,.tar')
// 影像数据文件大小限制 MB（系统配置 order.image.data.max_size_mb）
const imageDataMaxSizeMb = ref(3072)
// 影像报告文件格式（系统配置 order.image.report.allowed_extensions）
const imageReportAccept = ref('.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx')
// 影像报告文件大小限制 MB（系统配置 order.image.report.max_size_mb）
const imageReportMaxSizeMb = ref(3072)

const parseConfigBoolean = (val: unknown): boolean => {
  if (val === true || val === 1) return true
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase()
    return normalized === 'true' || normalized === '1'
  }
  return false
}

const parseConfigNumber = (val: unknown, fallback: number): number => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const parsed = parseInt(val.trim(), 10)
    return isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

const loadImageRequiredConfig = async () => {
  try {
    const [requiredRes, dataAcceptRes, dataMaxSizeRes, reportAcceptRes, reportMaxSizeRes] = await Promise.all([
      getConfigDetailByKey('order.image.required'),
      getConfigDetailByKey('order.image.data.allowed_extensions'),
      getConfigDetailByKey('order.image.data.max_size_mb'),
      getConfigDetailByKey('order.image.report.allowed_extensions'),
      getConfigDetailByKey('order.image.report.max_size_mb'),
    ])
    imageDataRequired.value = parseConfigBoolean((requiredRes as any)?.configValue)
    imageDataAccept.value = (dataAcceptRes as any)?.configValue || '.zip,.rar,.7z,.tar'
    imageDataMaxSizeMb.value = parseConfigNumber((dataMaxSizeRes as any)?.configValue, 3072)
    imageReportAccept.value = (reportAcceptRes as any)?.configValue || '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
    imageReportMaxSizeMb.value = parseConfigNumber((reportMaxSizeRes as any)?.configValue, 3072)
  } catch {
    // 使用默认值
  }
}

// 返回上一步后再进入时恢复已上传文件
const cachedFileMap = ref<FileMap>({})

const syncFileMapCache = () => {
  const fm = uploadRef.value?.fileMap as FileMap | undefined
  if (!fm) return
  const map: FileMap = {}
  for (const [type, list] of Object.entries(fm)) {
    map[type] = (list || []).map((f) => {
      const { raw, ...rest } = f as any
      return { ...rest }
    })
  }
  cachedFileMap.value = map
}

const clearFileMapCache = () => {
  cachedFileMap.value = {}
}

// ─────────────────────────────────────────────────────────────────
// File type config
// ─────────────────────────────────────────────────────────────────

// 解析 accept 字符串生成 formats 数组
const parseAcceptToFormats = (accept: string): string[] => {
  return accept
    .split(',')
    .map(e => e.trim().toUpperCase().replace(/^\./, ''))
    .filter(Boolean)
}

const fileTypes = computed<FileTypeConfig[]>(() => {
  const types: FileTypeConfig[] = []

  const imageDataFormats = parseAcceptToFormats(imageDataAccept.value)

  types.push({
    type: 'imageData',
    label: '影像数据文件',
    num: '01',
    bizType: '10.1',
    accept: imageDataAccept.value,
    required: isModifyMode.value ? true : imageDataRequired.value,
    dropText: '影像数据文件',
    dropSub: 'CT/MRI等医学影像文件',
    formats: imageDataFormats,
    iconColor: 'pkg',
    uploadApi: '/yi/basic/file/upload-multiple?bizType=10.1',
    uploadBatch: true,
    uploadDebounce: 0,
    maxSizeMb: imageDataMaxSizeMb.value,
    initExisting: async () => {
      if (cachedFileMap.value.imageData?.length) return []
      if (props.orderId) {
        const detail = await orderDetail(props.orderId)
        return (detail.imageDataFiles || []).map(mapImageFileToFileItem)
      }
      if (props.draftId) {
        const detail = await draftDetail(props.draftId)
        return (detail.imageDataFiles || []).map(mapImageFileToFileItem)
      }
      return []
    },
  })

  const imageReportFormats = parseAcceptToFormats(imageReportAccept.value)

  types.push({
    type: 'imageReport',
    label: '影像报告文件',
    num: '02',
    bizType: '10.2',
    accept: imageReportAccept.value,
    required: false,
    dropText: '影像报告文件',
    dropSub: '诊断报告、检查单等',
    formats: imageReportFormats,
    iconColor: 'report',
    uploadApi: '/yi/basic/file/upload-multiple?bizType=10.2',
    uploadBatch: true,
    uploadDebounce: 0,
    maxSizeMb: imageReportMaxSizeMb.value,
    initExisting: async () => {
      if (cachedFileMap.value.imageReport?.length) return []
      if (props.orderId) {
        const detail = await orderDetail(props.orderId)
        return (detail.imageReportFiles || []).map(mapImageFileToFileItem)
      }
      if (props.draftId) {
        const detail = await draftDetail(props.draftId)
        return (detail.imageReportFiles || []).map(mapImageFileToFileItem)
      }
      return []
    },
  })

  return types
})

const uploadExtra = computed(() => ({ orderId: props.orderId }))

// Map API ImageFileVO to uploadFileCustom FileItem
const mapImageFileToFileItem = (f: ImageFileVO) => ({
  uid: Number(f.fileId),
  fileId: f.fileId,
  fileName: f.fileName,
  name: f.fileName,
  status: 'success' as const,
  fileSizeText: f.fileSizeText,
  size: f.fileSize,
  response: { code: 200 } as any,
})

// ─────────────────────────────────────────────────────────────────
// Business state
// ─────────────────────────────────────────────────────────────────
const savingDraft = ref(false)
const submitting = ref(false)

watch(visible, (val) => {
  if (val) {
    loadImageRequiredConfig()
  }
})

// ─────────────────────────────────────────────────────────────────
// Confirm handler (called by uploadFileCustom internally after uploads complete)
// ─────────────────────────────────────────────────────────────────
const handleUploadConfirm = async (_fileMap: Record<string, any[]>) => {
  // fileMap is ready after uploadFileCustom finishes all pending uploads
  // No-op here; actual submit is triggered by handleSubmit button
}

// ─────────────────────────────────────────────────────────────────
// Get uploaded file IDs from uploadFileCustom
// ─────────────────────────────────────────────────────────────────
const getUploadedFileIds = (): {
  imageDataFileIds: string[]
  imageReportFileIds: string[]
} => ({
  imageDataFileIds: uploadRef.value?.getFileIdsByType('imageData') ?? [],
  imageReportFileIds: uploadRef.value?.getFileIdsByType('imageReport') ?? [],
})

// ─────────────────────────────────────────────────────────────────
// Build draft data
// ─────────────────────────────────────────────────────────────────
const buildDraftData = (): DraftDTO => {
  const userInfo = useUserInfo()
  const baseData = props.orderFormData || props.draft || {} as DraftDTO
  return {
    ...baseData,
    orgId: baseData.orgId || userInfo.userInfos.orgId as number,
    orgName: baseData.orgName || userInfo.userInfos.orgName || '',
    operatorName: baseData.operatorName || userInfo.displayName || '',
    operatorPhone: baseData.operatorPhone || userInfo.userInfos.phone || '',
  }
}

// ─────────────────────────────────────────────────────────────────
// Save draft
// ─────────────────────────────────────────────────────────────────
const handleSaveDraft = async () => {
  if (uploadRef.value?.uploading) {
    ElMessage.warning('请等待所有文件上传完成')
    return
  }
  const { imageDataFileIds, imageReportFileIds } = getUploadedFileIds()
  const data = buildDraftData()
  data.imageDataFileIds = imageDataFileIds
  data.imageReportFileIds = imageReportFileIds
  if (props.draftId) {
    data.id = props.draftId
  }
  const id = await draftSave(data)
  syncFileMapCache()
  ElMessage.success('草稿保存成功')
  emit('draftSaved', id)
}

const handleSaveDraftNoSubmit = async () => {
  savingDraft.value = true
  try {
    await handleSaveDraft()
    emit('update:modelValue', false)
  } catch (err: any) {
    ElMessage.error(err.message || '保存草稿失败')
  } finally {
    savingDraft.value = false
  }
}

// ─────────────────────────────────────────────────────────────────
// Submit order
// ─────────────────────────────────────────────────────────────────
const buildModifyFullPayload = (): OrderModifyFullDTO => {
  const base = (props.orderFormData || {}) as OrderModifyFullDTO
  const { imageDataFileIds, imageReportFileIds } = getUploadedFileIds()
  return {
    ...base,
    imageDataFileIds,
    imageReportFileIds,
  }
}

const handleSubmit = async () => {
  if (uploadRef.value?.uploading) {
    ElMessage.warning('请等待所有文件上传完成后再提交')
    return
  }

  const { imageDataFileIds } = getUploadedFileIds()

  // 新建订单：影像数据必填
  if (!isModifyMode.value && imageDataRequired.value && imageDataFileIds.length === 0) {
    ElMessage.warning('请上传至少一个影像数据文件')
    return
  }

  // 修改订单逻辑
  if (isModifyMode.value && props.modifyOrderId) {
    await handleModifySubmit()
    return
  }

  // 新建订单
  try {
    submitting.value = true
    const baseData = buildDraftData()
    const { imageDataFileIds: ids, imageReportFileIds: reportIds } = getUploadedFileIds()
    const orderData: CreateOrderDTO = {
      ...baseData,
      imageDataFileIds: ids,
      imageReportFileIds: reportIds,
      items: (baseData.items ?? []).filter((item): item is CreateOrderItemDTO =>
        item.bodyPartId != null && item.projectId != null,
      ),
    }
    const orderId = await orderCreate(orderData)
    ElMessage.success('订单创建成功')
    emit('success', orderId)

    clearFileMapCache()
    emit('update:modelValue', false)
  } catch (err: any) {
    // ElMessage.error(err.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 修改订单提交逻辑（与 orderCreateDialog.vue handleSaveModified 保持一致）
const handleModifySubmit = async () => {
  // 管理员/企业管理员：直接调用 orderModifyFullV2
  if (isAdminOrCompanyAdmin.value) {
    submitting.value = true
    try {
      await orderModifyFullV2(props.modifyOrderId!, buildModifyFullPayload())
      ElMessage.success('修改成功')
      emit('success', props.modifyOrderId!)
      clearFileMapCache()
      emit('update:modelValue', false)
    } catch {
    } finally {
      submitting.value = false
    }
    return
  }

  // 业务员/设计师在设计阶段：弹框确认后提交修改申请
  if (needSubmitModifyApply.value) {
    try {
      await ElMessageBox.confirm('当前阶段不能直接修改，是否提交至设计部门确认？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }
    submitting.value = true
    try {
      await orderModifyApply(props.modifyOrderId!, buildModifyFullPayload())
      ElMessage.success('已提交修改申请')
      emit('success', props.modifyOrderId!)
      clearFileMapCache()
      emit('update:modelValue', false)
    } catch {
    } finally {
      submitting.value = false
    }
    return
  }

  // 业务员在订单阶段：调用 orderModifyFullV2，超时时提示提交申请
  submitting.value = true
  try {
    const res = await orderModifyFullV2(props.modifyOrderId!, buildModifyFullPayload())
    if (res === -1) {
      try {
        await ElMessageBox.confirm('允许修改时间超限，是否提交至设计部门确认？', '提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        })
      } catch {
        return
      }
      await orderModifyApply(props.modifyOrderId!, buildModifyFullPayload())
      ElMessage.success('已提交至设计部门确认')
      emit('success', props.modifyOrderId!)
      clearFileMapCache()
      emit('update:modelValue', false)
      return
    }
    ElMessage.success('修改成功')
    emit('success', props.modifyOrderId!)
    clearFileMapCache()
    emit('update:modelValue', false)
  } catch {
  } finally {
    submitting.value = false
  }
}

// ─────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────
const handleClose = () => {
  clearFileMapCache()
  emit('update:modelValue', false)
}

const handlePrev = () => {
  if (uploadRef.value?.uploading) {
    ElMessage.warning('请等待所有文件上传完成')
    return
  }
  syncFileMapCache()
  emit('prev', {
    formData: props.orderFormData ?? null,
    draftId: isModifyMode.value ? props.modifyOrderId ?? null : props.draftId ?? null,
  })
  visible.value = false
}
</script>

<style scoped lang="scss">
@use 'sass:math';
</style>
