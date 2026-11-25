<!--
 * FileUploadDialog.vue — 通用文件上传内容组件（不含弹窗外层）
 * 由父组件包 el-dialog / dialog-modal 提供弹窗容器
 *
 * Props:
 *   types       FileTypeConfig[]  — 上传类型配置
 *   extra       Record<string, any> | undefined — 额外透传数据
 *   onConfirm   Function — 确认回调 (fileMap, extra?) => Promise<void>
 *
 * Exposes:
 *   fileMap       — 当前所有文件列表
 *   getFileIdsByType(type) — 获取指定类型的已上传文件ID数组
 *   uploading     — 是否正在上传
 *
 * Emits:
 *   success — 上传流程成功完成
 *
 * UploadConfig（内嵌在 FileTypeConfig 中）:
 *   api       string — 上传接口路径
 *   batch     boolean — 是否批量上传（默认 true）
 *   debounce  number  — 防抖毫秒数（默认 150）
 -->

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadRawFile } from 'element-plus'
import type { FileTypeConfig, FileItem, FileMap } from './uploadFileCustom'
import { resolveUploadFileId } from './uploadFileCustom'

// ─────────────────────────────────────────────────────────────────
// Props / Emits
// ─────────────────────────────────────────────────────────────────
const props = defineProps<{
  types: FileTypeConfig[]
  extra?: Record<string, any>
  /** 父组件缓存的上传列表（如返回上一步后再进入时恢复） */
  initialFileMap?: FileMap
  onConfirm?: (fileMap: Record<string, FileItem[]>, extra?: Record<string, any>) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

// ─────────────────────────────────────────────────────────────────
// Upload refs & state
// ─────────────────────────────────────────────────────────────────
const maxFileSize = 3* 1024 * 1024 * 1024
const submitting = ref(false)
const uploading = ref(false)

const uploadHeaders = ref<Record<string, string>>({})

const initHeaders = () => {
  try {
    const token = (window as any).__TOKEN__ || ''
    uploadHeaders.value = { satoken: token }
  } catch {
    uploadHeaders.value = {}
  }
}

// ─────────────────────────────────────────────────────────────────
// File lists: 一个 Map，key=type
// ─────────────────────────────────────────────────────────────────
const fileMap = ref<FileMap>({})
const uploadRefs = ref<Record<string, any>>({})
const uploadTimers = ref<Record<string, ReturnType<typeof setTimeout>>>({})
const uploadPending = ref<Record<string, FileItem[]>>({})

const initFileMap = () => {
  for (const t of props.types) {
    if (!fileMap.value[t.type]) {
      fileMap.value[t.type] = []
    }
    if (!uploadPending.value[t.type]) {
      uploadPending.value[t.type] = []
    }
    uploadRefs.value[t.type] = undefined
    if (uploadTimers.value[t.type]) {
      clearTimeout(uploadTimers.value[t.type])
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Stats computed
// ─────────────────────────────────────────────────────────────────
const totalFileCount = computed(() =>
  Object.values(fileMap.value).reduce((sum, list) => sum + list.length, 0)
)

const isAnyUploading = computed(() =>
  Object.values(fileMap.value).some(list => list.some(f => f.status === 'uploading'))
)

watch(isAnyUploading, (val) => {
  uploading.value = val
})

const allFilesUploaded = computed(() => {
  if (totalFileCount.value === 0) return false
  return props.types.every(t => {
    const list = fileMap.value[t.type] || []
    if (t.required && list.length === 0) return false
    return list.every(f => f.status === 'success' || f.response?.code === 200)
  })
})

const isTypeDone = (type: string) => {
  const list = fileMap.value[type] || []
  return list.length > 0 && list.every(f => f.status === 'success' || f.response?.code === 200)
}

const isTypeActive = (type: string) => (fileMap.value[type] || []).length > 0

// ─────────────────────────────────────────────────────────────────
// Upload logic
// ─────────────────────────────────────────────────────────────────
const beforeUpload = (file: UploadRawFile, config: FileTypeConfig): boolean => {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  const allowedExts = config.accept.split(',').map(e => e.trim().toLowerCase())
  if (!allowedExts.includes(ext)) {
    return false
  }
  if (file.size > maxFileSize) {
    return false
  }
  if (typeof config.validateFileName === 'function') {
    const msg = config.validateFileName(file.name)
    if (msg) {
      return false
    }
  }
  return true
}

const validateUploadFile = (file: UploadRawFile, config: FileTypeConfig): string | null => {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  const allowedExts = config.accept.split(',').map(e => e.trim().toLowerCase())
  if (!allowedExts.includes(ext)) {
    return `不支持的文件格式，请上传 ${config.accept} 格式`
  }
  if (file.size > maxFileSize) {
    return '文件大小不能超过 3GB'
  }
  if (typeof config.validateFileName === 'function') {
    const pureName = file.name.split('/').pop()?.split('\\').pop() || file.name
    const msg = config.validateFileName(pureName)
    if (msg) {
      return msg
    }
  }
  return null
}

const handleFileChange = (file: FileItem, files: FileItem[], config: FileTypeConfig) => {
  ensureInitialized(config.type)

  // 增量合并：保留已有文件（成功/失败），只追加本次新来的 raw 文件
  const existingUids = new Set((fileMap.value[config.type] || []).map(f => f.uid))
  const seenRawKeys = new Set(
    (fileMap.value[config.type] || [])
      .filter(f => f.raw)
      .map(f => {
        const raw = f.raw as UploadRawFile
        return `${raw.name}|${raw.size}|${raw.lastModified}`
      })
  )

  const newRawFiles: FileItem[] = []
  const seenNewKeys = new Set<string>()
  for (const f of files || []) {
    if (!f.raw) continue
    if (existingUids.has(f.uid)) continue
    const raw = f.raw as UploadRawFile
    const rawKey = `${raw.name}|${raw.size}|${raw.lastModified}`
    if (seenRawKeys.has(rawKey) || seenNewKeys.has(rawKey)) continue
    seenNewKeys.add(rawKey)
    newRawFiles.push(f)
  }

  const validRawFiles: FileItem[] = []
  const firstInvalidMsg = newRawFiles.find(f => {
    const raw = f.raw as UploadRawFile
    const err = validateUploadFile(raw, config)
    if (err) {
      ElMessage.warning(err)
      return true
    }
    validRawFiles.push(f)
    return false
  })

  if (firstInvalidMsg) {
    uploadRefs.value[config.type]?.clearFiles?.()
    return
  }

  if (validRawFiles.length > 0) {
    fileMap.value[config.type] = [
      ...(fileMap.value[config.type] || []),
      ...validRawFiles,
    ]
    uploadRefs.value[config.type]?.clearFiles?.()
  }

  if (validRawFiles.length === 0) {
    return
  }

  if (config.uploadBatch !== false) {
    const debounceMs = config.uploadDebounce ?? 150
    for (const f of newRawFiles) {
      if (!uploadPending.value[config.type].some(p => p.uid === f.uid)) {
        uploadPending.value[config.type].push(f)
      }
    }
    if (uploadTimers.value[config.type]) {
      clearTimeout(uploadTimers.value[config.type])
    }
    uploadTimers.value[config.type] = setTimeout(() => {
      if (uploadPending.value[config.type].length > 0) {
        uploadBatch([...uploadPending.value[config.type]], config)
        uploadPending.value[config.type] = []
      }
    }, debounceMs)
  } else {
    for (const f of newRawFiles) {
      uploadSingle(f, config)
    }
  }
}

/** 根据 config 拼装完整的上传 URL */
const buildUploadUrl = (config: FileTypeConfig): string => {
  const api = config.uploadApi || '/yi/basic/file/upload-multiple'
  const params: string[] = []

  // 已有查询参数
  const existingParams = api.includes('?') ? api.split('?')[1].split('&').filter(Boolean) : []
  existingParams.forEach(p => {
    const [k] = p.split('=')
    if (k && !params.some(ex => ex.startsWith(k + '='))) params.push(p)
  })

  // bizType 参数（不在已有参数中时追加）
  if (!existingParams.some(p => p.startsWith('bizType=')) && config.bizType) {
    params.push(`bizType=${config.bizType}`)
  }

  // 额外的查询参数
  if (config.uploadExtraParams) {
    Object.entries(config.uploadExtraParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        params.push(`${k}=${encodeURIComponent(String(v))}`)
      }
    })
  }

  return params.length > 0 ? `${api.split('?')[0]}?${params.join('&')}` : api
}

const uploadSingle = (file: FileItem, config: FileTypeConfig) => {
  if (!file.raw) return
  const list = fileMap.value[config.type]
  const fileUid = file.uid

  const updateFile = (patch: Partial<FileItem>) => {
    const idx = list.findIndex(f => f.uid === fileUid)
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch }
    }
  }
  updateFile({ status: 'uploading', uploadProgress: 0 })

  const formData = new FormData()
  const fileField = config.uploadFileField || 'files'
  formData.append(fileField, file.raw)

  const url = buildUploadUrl(config)

  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      updateFile({ uploadProgress: Math.min(99, Math.round((e.loaded / e.total) * 100)) })
    }
  })

  xhr.addEventListener('load', () => {
    try {
      const data = JSON.parse(xhr.responseText)
      if (data.code === 200) {
        const id = resolveUploadFileId(data.data as any)
        updateFile({ status: 'success', response: data, fileId: id ?? undefined, uploadProgress: 100 })
        onUploadDone()
      } else {
        updateFile({ status: 'fail', response: data, uploadProgress: undefined })
        ElMessage.error(`${file.name} 上传失败: ${data.message || ''}`)
        removeFailedFile(fileUid, config.type)
        onUploadDone()
      }
    } catch {
      let errMsg = `${file.name} 上传失败`
      try {
        const data = JSON.parse(xhr.responseText)
        if (data.message) errMsg = `${file.name} 上传失败: ${data.message}`
      } catch { /* 响应非 JSON，保留默认消息 */ }
      updateFile({ status: 'fail', uploadProgress: undefined })
      ElMessage.error(errMsg)
      removeFailedFile(fileUid, config.type)
      onUploadDone()
    }
  })

  xhr.addEventListener('error', () => {
    updateFile({ status: 'fail', uploadProgress: undefined })
    ElMessage.error(`${file.name} 上传失败`)
    removeFailedFile(fileUid, config.type)
    onUploadDone()
  })

  xhr.addEventListener('abort', () => {
    updateFile({ status: 'fail', uploadProgress: undefined })
    ElMessage.error(`${file.name} 上传被中断`)
    removeFailedFile(fileUid, config.type)
    onUploadDone()
  })

  xhr.addEventListener('timeout', () => {
    updateFile({ status: 'fail', uploadProgress: undefined })
    ElMessage.error(`${file.name} 上传超时`)
    removeFailedFile(fileUid, config.type)
    onUploadDone()
  })

  xhr.open('POST', url)
  Object.entries(uploadHeaders.value).forEach(([k, v]) => xhr.setRequestHeader(k, v))
  xhr.send(formData)

  function onUploadDone() {
    uploading.value = Object.values(fileMap.value).some(l => l.some(f => f.status === 'uploading'))
  }
}

const uploadBatch = async (files: FileItem[], config: FileTypeConfig) => {
  if (files.length === 0) return
  const list = fileMap.value[config.type]
  const fileUids = new Set(files.map(f => f.uid))

  const markProgress = (pct: number) => {
    for (const uid of fileUids) {
      const idx = list.findIndex(f => f.uid === uid)
      if (idx !== -1) {
        list[idx] = { ...list[idx], uploadProgress: pct }
      }
    }
  }

  const markStatus = (status: FileItem['status'], extra: Partial<FileItem> = {}) => {
    for (const uid of fileUids) {
      const idx = list.findIndex(f => f.uid === uid)
      if (idx !== -1) {
        list[idx] = { ...list[idx], status, uploadProgress: undefined, ...extra }
      }
    }
  }

  for (const f of files) {
    const idx = list.findIndex(p => p.uid === f.uid)
    if (idx !== -1) {
      list[idx] = { ...list[idx], status: 'uploading', uploadProgress: 0 }
    }
  }

  const formData = new FormData()
  const fileField = config.uploadFileField || 'files'
  for (const f of files) {
    if (f.raw) formData.append(fileField, f.raw)
  }

  const url = buildUploadUrl(config)

  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      markProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)))
    }
  })

  xhr.addEventListener('load', async () => {
    try {
      const data = JSON.parse(xhr.responseText)
      if (data.code === 200) {
        const fileItems: any[] = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : [])
        const fileIds: string[] = []
        for (let i = 0; i < files.length; i++) {
          const f = files[i]
          const idx = list.findIndex(p => p.uid === f.uid)
          const resolvedId = resolveUploadFileId(fileItems[i]) ?? resolveUploadFileId(fileItems[0])
          if (resolvedId) fileIds.push(resolvedId)
          if (idx !== -1) {
            list[idx] = {
              ...list[idx],
              status: 'success',
              response: data,
              fileId: resolvedId ?? undefined,
              uploadProgress: 100,
            }
          }
        }
        // 批量上传成功后调用钩子
        if (config.onBatchUploadDone && fileIds.length > 0) {
          await config.onBatchUploadDone(fileIds, props.extra)
        }
      } else {
        markStatus('fail')
        for (const f of files) {
          removeFailedFile(f.uid, config.type)
        }
      }
    } catch {
      markStatus('fail')
      for (const f of files) {
        removeFailedFile(f.uid, config.type)
      }
    }
    uploading.value = Object.values(fileMap.value).some(l => l.some(f => f.status === 'uploading'))
  })

  xhr.addEventListener('error', () => {
    markStatus('fail')
    for (const f of files) {
      removeFailedFile(f.uid, config.type)
    }
    uploading.value = Object.values(fileMap.value).some(l => l.some(f => f.status === 'uploading'))
  })

  xhr.addEventListener('abort', () => {
    markStatus('fail')
    ElMessage.error('批量上传被中断')
    for (const f of files) {
      removeFailedFile(f.uid, config.type)
    }
    uploading.value = Object.values(fileMap.value).some(l => l.some(f => f.status === 'uploading'))
  })

  xhr.addEventListener('timeout', () => {
    markStatus('fail')
    ElMessage.error('批量上传超时')
    for (const f of files) {
      removeFailedFile(f.uid, config.type)
    }
    uploading.value = Object.values(fileMap.value).some(l => l.some(f => f.status === 'uploading'))
  })

  xhr.open('POST', url)
  Object.entries(uploadHeaders.value).forEach(([k, v]) => xhr.setRequestHeader(k, v))
  xhr.send(formData)
}

const ensureInitialized = (type?: string) => {
  if (type && !uploadPending.value[type]) {
    initHeaders()
    initFileMap()
  }
}

const handleRemove = async (config: FileTypeConfig, file: FileItem) => {
  if (file.canDelete === false) return
  ensureInitialized(config.type)
  const list = fileMap.value[config.type]
  // 已有文件调用 onDelete 钩子
  if (file.isExisting && config.onDelete) {
    try {
      await config.onDelete(file, props.extra)
    } catch {
      return // 用户取消则不删除
    }
  }
  fileMap.value[config.type] = list.filter(f => f.uid !== file.uid)
}

const handleClear = async (config: FileTypeConfig) => {
  ensureInitialized(config.type)
  const list = fileMap.value[config.type] || []

  // 对已有文件逐个调用删除接口，失败的文件保留在列表中，避免界面与后端状态不一致
  if (config.onDelete) {
    const existingFiles = list.filter(f => f.isExisting && f.canDelete !== false)
    if (existingFiles.length > 0) {
      const failedFileUids = new Set<number>()
      await Promise.all(existingFiles.map(async (file) => {
        try {
          await config.onDelete!(file, props.extra)
        } catch {
          failedFileUids.add(file.uid)
        }
      }))
      fileMap.value[config.type] = list.filter(file =>
        file.canDelete === false || (file.isExisting && failedFileUids.has(file.uid))
      )
      uploadRefs.value[config.type]?.clearFiles()
      return
    }
  }

  fileMap.value[config.type] = []
  uploadRefs.value[config.type]?.clearFiles()
}

const removeFailedFile = (uid: number, type: string) => {
  fileMap.value[type] = (fileMap.value[type] || []).filter(f => f.uid !== uid)
  uploadRefs.value[type]?.clearFiles?.()
}


const formatFileSize = (bytes: number): string => {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ─────────────────────────────────────────────────────────────────
// Confirm
// ─────────────────────────────────────────────────────────────────
const getFileIdsByType = (type: string): string[] => {
  const list = fileMap.value[type] || []
  const ids: string[] = []
  for (const f of list) {
    if (f.status !== 'success' && f.response?.code !== 200) continue
    const fileId = resolveUploadFileId({ id: f.fileId, fileId: f.fileId })
    if (fileId) {
      ids.push(fileId)
      continue
    }
    const data = f.response?.data
    if (Array.isArray(data)) {
      for (const item of data) {
        const id = resolveUploadFileId(item)
        if (id) ids.push(id)
      }
    } else {
      const id = resolveUploadFileId(data as any)
      if (id) ids.push(id)
    }
  }
  return [...new Set(ids)]
}

const handleConfirm = async () => {
  for (const config of props.types) {
    const list = fileMap.value[config.type] || []
    if (config.required && list.length === 0) {
      ElMessage.warning(`请上传「${config.label}」`)
      return
    }
    if (list.some(f => f.status === 'uploading')) {
      ElMessage.warning('请等待所有文件上传完成后再提交')
      return
    }
  }

  try {
    submitting.value = true
    if (props.onConfirm) {
      await props.onConfirm(fileMap.value, props.extra)
    }
    emit('success')
  } catch {
    // 错误已在 onConfirm 内处理
  } finally {
    submitting.value = false
  }
}

// ─────────────────────────────────────────────────────────────────
// Watch: load existing files on open (controlled by parent).
// Runs once on mount to fill in any type that has no files yet.
// Uses `initDone` flag so it does NOT re-run when fileMap changes
// (e.g. after a file upload), which would otherwise wipe other types'
// loaded files by calling initExisting() again.
// ─────────────────────────────────────────────────────────────────
const initDone = ref(false)
watch(() => [props.types, props.initialFileMap] as const, async () => {
  if (initDone.value) return
  initDone.value = true
  initHeaders()
  initFileMap()
  await nextTick()

  const initial = props.initialFileMap
  const hasInitial = initial && Object.values(initial).some((list) => (list?.length ?? 0) > 0)
  if (hasInitial) {
    for (const config of props.types) {
      fileMap.value[config.type] = (initial![config.type] || []).map((f) => ({ ...f }))
    }
    return
  }

  for (const config of props.types) {
    if (!config.initExisting) continue
    try {
      const existing = await config.initExisting(props.extra)
      if (existing?.length) {
        fileMap.value[config.type] = existing
      }
    } catch { /* ignore */ }
  }
}, { immediate: true })

// ─────────────────────────────────────────────────────────────────
// Icon SVG helpers
// ─────────────────────────────────────────────────────────────────
const iconSvgMap: Record<string, string> = {
  pkg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>`,
  report: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>`,
  model: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>`,
}

const dropIconSvgMap: Record<string, string> = {
  pkg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>`,
  report: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>`,
  model: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>`,
}

const fileCardIconSvg = (color: string) => {
  if (color === 'pkg') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>`
  if (color === 'model') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>`
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>`
}

defineExpose({ fileMap, getFileIdsByType, uploading, handleConfirm, submitting })
</script>

<template>
  <div class="fup-root">
    <!-- 左侧统计面板 -->
    <aside class="fup-sidebar">
      <div class="fup-sidebar__header">
        <div class="fup-sidebar__eyebrow">UPLOAD</div>
        <div class="fup-sidebar__sub">支持多类型文件同时上传</div>
      </div>

      <div class="fup-sidebar__bar">
        <div class="fup-sidebar__field">
          <span class="fup-sidebar__field-label">文件状态</span>
          <div class="fup-sidebar__tags">
            <span v-if="allFilesUploaded && totalFileCount > 0" class="fup-tag fup-tag--teal">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              全部上传成功
            </span>
            <span v-else-if="totalFileCount > 0" class="fup-tag fup-tag--amber">上传中</span>
            <span v-else class="fup-tag fup-tag--gray">等待上传</span>
          </div>
        </div>
      </div>

      <div class="fup-sidebar__stats">
        <div class="fup-sidebar__stats-header">
          <span class="fup-sidebar__stats-title">上传进度</span>
          <span class="fup-sidebar__stats-total" :class="{ 'fup-sidebar__stats-total--done': allFilesUploaded && totalFileCount > 0 }">
            {{ totalFileCount }} 个文件
          </span>
        </div>
        <div class="fup-stat-card"
          v-for="config in types"
          :key="config.type"
          :class="{
            'fup-stat-card--active': isTypeActive(config.type),
            'fup-stat-card--done': isTypeDone(config.type)
          }">
          <div class="fup-stat-card__top">
            <div class="fup-stat-card__icon" :class="`fup-stat-card__icon--${config.iconColor}`">
              <span v-html="iconSvgMap[config.iconColor]"></span>
            </div>
            <span v-if="config.countBreakdown" class="fup-stat-card__count fup-stat-card__count--split">
              <span class="fup-stat-card__count-base">{{ config.countBreakdown(fileMap[config.type] || []).base }}</span>
              <span class="fup-stat-card__count-separator"> + </span>
              <span class="fup-stat-card__count-current">{{ config.countBreakdown(fileMap[config.type] || []).current }}</span>
            </span>
            <span v-else class="fup-stat-card__count">{{ (fileMap[config.type] || []).length }}</span>
          </div>
          <span class="fup-stat-card__name">{{ config.label }}</span>
          <div class="fup-stat-card__bar">
            <div class="fup-stat-card__bar-fill" :class="`fup-stat-card__bar-fill--${config.iconColor}`"
              :style="{ width: isTypeActive(config.type) ? '100%' : '0%' }"></div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧上传面板 -->
    <main class="fup-main">
      <div class="fup-panel">
        <div
          class="fup-section"
          v-for="config in types"
          :key="config.type"
        >
          <!-- Section Header -->
          <div class="fup-section__header">
            <div class="fup-section__title">
              <span class="fup-section__num">{{ config.num }}</span>
              <span class="fup-section__name">{{ config.label }}</span>
            </div>
            <div class="fup-section__meta">
              <span v-if="config.required" class="fup-badge fup-badge--required">必填</span>
              <span v-else class="fup-badge fup-badge--optional">选填</span>
              <span class="fup-badge fup-badge--count">{{ (fileMap[config.type] || []).length }}</span>
              <el-button
                v-if="(fileMap[config.type] || []).some(file => file.canDelete !== false)"
                link type="primary" size="small"
                class="fup-clear-btn"
                @click="handleClear(config)">
                清空
              </el-button>
            </div>
          </div>

          <!-- Upload Area -->
          <div class="fup-section__content">
            <el-upload
              :ref="(el: any) => { uploadRefs[config.type] = el }"
              :headers="uploadHeaders"
              :multiple="true"
              :accept="config.accept"
              :auto-upload="false"
              :on-change="(file: any, files: any[]) => handleFileChange(file, files, config)"
              :on-remove="() => {}"
              :show-file-list="false"
              drag
              class="fup-dragger-wrap"
            >
              <div class="fup-drop-zone">
                <div class="fup-drop-zone__icon" :class="`fup-drop-zone__icon--${config.iconColor}`">
                  <span v-html="dropIconSvgMap[config.iconColor]"></span>
                </div>
                <div class="fup-drop-zone__text">
                  <span class="fup-drop-zone__main">点击或拖拽上传 {{ config.dropText }}</span>
                  <span class="fup-drop-zone__sub">{{ config.dropSub }}</span>
                </div>
                <div class="fup-drop-zone__formats">
                  <span
                    v-for="fmt in config.formats"
                    :key="fmt"
                    class="fup-drop-zone__format"
                    :class="`fup-drop-zone__format--${config.iconColor}`">
                    {{ fmt }}
                  </span>
                </div>
              </div>
            </el-upload>

            <!-- File List -->
            <div class="fup-file-list" v-if="(fileMap[config.type] || []).length > 0">
              <div
                v-for="file in (fileMap[config.type] || [])"
                :key="file.uid || file.fileId"
                class="fup-file-card"
                :class="[
                  `fup-file-card--${config.iconColor}`,
                  {
                    'fup-file-card--current-batch': config.type === 'printPackage'
                      && Boolean(config.countBreakdown)
                      && (file.isCurrentBatch || !file.isExisting),
                  },
                ]"
              >
                <!-- 上传进度遮罩 -->
                <div class="fup-file-card__overlay" v-if="file.status === 'uploading'">
                  <div class="fup-card-overlay__content">
                    <div class="fup-card-overlay__bar-track">
                      <div class="fup-card-overlay__bar-fill" :style="{ width: (file.uploadProgress ?? 0) + '%' }"></div>
                    </div>
                    <span class="fup-card-overlay__pct">
                      {{ (file.uploadProgress ?? 0) >= 99 ? '文件处理中...' : `${file.uploadProgress ?? 0}%` }}
                    </span>
                  </div>
                </div>
                <div class="fup-file-card__icon-wrap" :class="`fup-file-card__icon-wrap--${config.iconColor}`">
                  <span v-html="fileCardIconSvg(config.iconColor)"></span>
                </div>
                  <div class="fup-file-card__info">
                    <span class="fup-file-card__name">{{ file.name || file.fileName }}</span>
                    <div class="fup-file-card__meta">
                      <span class="fup-file-card__size" v-if="file.size">{{ formatFileSize(file.size) }}</span>
                      <span class="fup-file-card__size" v-else-if="file.fileSizeText">{{ file.fileSizeText }}</span>
                      <span class="fup-file-card__pkg-tag" v-if="file.packageNo">{{ file.packageNo }}</span>
                    </div>
                  </div>
                  <template v-if="file.status !== 'uploading'">
                    <div class="fup-file-card__status fup-file-card__status--done"
                      v-if="file.status === 'success' || file.response?.code === 200">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <div class="fup-file-card__status fup-file-card__status--fail"
                      v-else-if="file.status === 'fail' || (file.response?.code && file.response.code !== 200)">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    </div>
                  </template>
                  <a v-if="file.isExisting && file.url" :href="file.url" target="_blank" download
                    class="fup-file-card__action" title="下载">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                  <button v-if="file.canDelete !== false" class="fup-file-card__action" @click="handleRemove(config, file)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <slot :name="config.type + '-footer'" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
// ─── Per-File Upload Overlay ─────────────────────────────────
.fup-file-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(238, 243, 249, 0.88);
  backdrop-filter: blur(3px);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.fup-card-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 75%;
}

.fup-card-overlay__bar-track {
  width: 100%;
  height: 5px;
  background: rgba(200, 218, 238, 0.7);
  border-radius: 9999px;
  overflow: hidden;
}

.fup-card-overlay__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1e6fd9, #60a5fa);
  border-radius: 9999px;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%);
    animation: fup-shimmer 1.4s ease-in-out infinite;
  }
}

@keyframes fup-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.fup-card-overlay__pct {
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #1e6fd9;
  letter-spacing: 0.5px;
}

// ─── Root layout ─────────────────────────────────────────────────
.fup-root {
  display: flex;
  flex: 1;
  overflow: hidden;
  max-height: 600px;
}

// ─── Sidebar ─────────────────────────────────────────────────────
.fup-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #f4f8fd;
  border-right: 1.5px solid #d0dfe9;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.fup-sidebar__header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid #d0dfe9;
}

.fup-sidebar__eyebrow {
  font-size: 10px;
  font-weight: 700;
  color: #1e6fd9;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;

  &::before {
    content: '';
    width: 10px;
    height: 2px;
    background: #1e6fd9;
    border-radius: 1px;
  }
}

.fup-sidebar__sub {
  font-size: 12px;
  color: #4a6a8a;
  line-height: 1.5;
}

.fup-sidebar__bar {
  padding: 14px 18px;
  border-bottom: 1px solid #d0dfe9;
}

.fup-sidebar__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fup-sidebar__field-label {
  font-size: 10px;
  font-weight: 600;
  color: #7a9ab8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fup-sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.fup-tag {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.fup-tag--teal { background: #e0f5f3; color: #0f766e; }
.fup-tag--amber { background: #dbeeff; color: #1557b0; }
.fup-tag--gray { background: #d0dfe9; color: #4a6a8a; }

.fup-sidebar__stats {
  padding: 14px 18px;
  flex: 1;
}

.fup-sidebar__stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.fup-sidebar__stats-title {
  font-size: 10px;
  font-weight: 700;
  color: #7a9ab8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.fup-sidebar__stats-total {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: #7a9ab8;
  background: #d0dfe9;
  padding: 1px 7px;
  border-radius: 9999px;
  transition: all 0.3s ease;

  &--done { background: #d1fae5; color: #059669; }
}

.fup-stat-card {
  background: #ffffff;
  border: 1.5px solid #d0dfe9;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: #d0dfe9;
    border-radius: 0 2px 2px 0;
    transition: background 0.25s ease;
  }

  &--active {
    border-color: #aec5db;
    background: #f8faff;
    &::before { background: #1e6fd9; }
  }

  &--done {
    border-color: #a3d9a5;
    background: #f0faf2;
    &::before { background: #059669; }
  }
}

.fup-stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fup-stat-card__icon {
  width: 24px; height: 24px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  background: #d0dfe9; color: #4a6a8a;

  &--pkg { .fup-stat-card--active & { background: #dbeeff; color: #1557b0; } .fup-stat-card--done & { background: #d1fae5; color: #059669; } }
  &--report { .fup-stat-card--active & { background: #fef3c7; color: #b45309; } .fup-stat-card--done & { background: #d1fae5; color: #059669; } }
  &--model { .fup-stat-card--active & { background: #d1fae5; color: #059669; } .fup-stat-card--done & { background: #d1fae5; color: #059669; } }
}

.fup-stat-card__count {
  font-family: 'DM Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #d0dfe9;
  line-height: 1;
  transition: color 0.25s ease;
  .fup-stat-card--active & { color: #1e6fd9; }
  .fup-stat-card--done & { color: #059669; }
}

.fup-stat-card__count--split {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.fup-stat-card__count-base {
  color: #059669;
}

.fup-stat-card__count-separator {
  color: #8aa0b5;
  font-size: 13px;
}

.fup-stat-card__count-current {
  color: #d97706;
}

.fup-stat-card__name {
  font-size: 11px;
  color: #4a6a8a;
  font-weight: 500;
  margin-top: -2px;
}

.fup-stat-card__bar {
  height: 3px;
  background: #e8eef5;
  border-radius: 9999px;
  overflow: hidden;
}

.fup-stat-card__bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  width: 0;

  &--pkg { background: linear-gradient(90deg, #1e6fd9, #3b8af5); .fup-stat-card--done & { background: linear-gradient(90deg, #059669, #10b981); } }
  &--report { background: linear-gradient(90deg, #d97706, #f59e0b); .fup-stat-card--done & { background: linear-gradient(90deg, #059669, #10b981); } }
  &--model { background: linear-gradient(90deg, #059669, #10b981); }
}

// ─── Main panel ──────────────────────────────────────────────────
.fup-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.fup-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ─── Upload section ─────────────────────────────────────────────
.fup-section {
  background: #ffffff;
  border: 1.5px solid #e8eef5;
  border-radius: 12px;
  padding: 16px 18px;
  animation: fup-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;

  &:nth-child(1) { animation-delay: 0.05s; }
  &:nth-child(2) { animation-delay: 0.12s; }
  &:nth-child(3) { animation-delay: 0.19s; }
}

@keyframes fup-slide-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fup-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.fup-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fup-section__num {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: #1557b0;
  background: #dbeeff;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.fup-section__name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.fup-section__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fup-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}

.fup-badge--required { background: #fee2e2; color: #dc2626; }
.fup-badge--optional { background: #d0dfe9; color: #4a6a8a; }
.fup-badge--count { background: #dbeeff; color: #1557b0; font-family: 'DM Mono', monospace; }

.fup-clear-btn {
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 2px 6px !important;
  color: #78716c !important;
  &:hover { color: #dc2626 !important; }
}

.fup-section__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

// ─── Drop zone ──────────────────────────────────────────────────
.fup-dragger-wrap { width: 100%; }

.fup-drop-zone {
  border: 2px dashed #aec5db;
  border-radius: 12px;
  background: #f4f8fd;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.fup-drop-zone:hover {
  border-color: #1e6fd9;
  background: #f4f8fd;
  box-shadow: 0 0 0 4px rgba(30, 111, 217, 0.06), 0 2px 8px rgba(28, 25, 23, 0.06);
  transform: translateY(-1px);
}

.fup-drop-zone__icon {
  width: 48px; height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dbeeff, #f0f8ff);
  display: flex; align-items: center; justify-content: center;
  color: #1e6fd9;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &--report { background: linear-gradient(135deg, #fef3c7, #fffbeb); color: #d97706; }
  &--model { background: linear-gradient(135deg, #d1fae5, #f0fdf4); color: #059669; }
}

.fup-drop-zone:hover .fup-drop-zone__icon {
  background: linear-gradient(135deg, #1e6fd9, #1557b0);
  color: white;
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 4px 16px rgba(30, 111, 217, 0.3);
  &--report { background: linear-gradient(135deg, #d97706, #b45309); box-shadow: 0 4px 16px rgba(217, 119, 6, 0.3); }
  &--model { background: linear-gradient(135deg, #059669, #047857); box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3); }
}

.fup-drop-zone__text { text-align: center; }

.fup-drop-zone__main {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 3px;
  display: block;
}

.fup-drop-zone__sub {
  font-size: 11.5px;
  color: #7a9ab8;
  display: block;
}

.fup-drop-zone__formats {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.fup-drop-zone__format {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: #1557b0;
  background: #f0f8ff;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(30, 111, 217, 0.2);

  &--report { color: #d97706; background: #fef3c7; }
  &--model { color: #059669; background: #d1fae5; }
}

// ─── File list ─────────────────────────────────────────────────
.fup-file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fup-file-card {
  background: #ffffff;
  border: 1.5px solid #d0dfe9;
  border-radius: 10px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  animation: fup-file-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  position: relative;

  &--pkg { border-left: 3px solid #1e6fd9; }
  &--report { border-left: 3px solid #d97706; }
  &--model { border-left: 3px solid #059669; }

  &:hover { transform: translateX(2px); }
  &--pkg:hover { border-color: #1e6fd9; box-shadow: 0 2px 8px rgba(30, 111, 217, 0.08); }
  &--report:hover { border-color: #d97706; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1); }
  &--model:hover { border-color: #059669; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.08); }

  &--current-batch {
    border-color: #f0b429;
    box-shadow: 0 2px 8px rgba(240, 180, 41, 0.2);
    &:hover {
      border-color: #d97706;
      box-shadow: 0 3px 10px rgba(217, 119, 6, 0.22);
    }
  }
}

@keyframes fup-file-in {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

.fup-file-card__icon-wrap {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #dbeeff, #f0f8ff);
  color: #1e6fd9;

  &--report { background: linear-gradient(135deg, #fef3c7, #fffbeb); color: #d97706; }
  &--model { background: linear-gradient(135deg, #d1fae5, #f0fdf4); color: #059669; }
}

.fup-file-card__info {
  flex: 1;
  min-width: 0;
}

.fup-file-card__name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1e3a5f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 3px;
  display: block;
}

.fup-file-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fup-file-card__size {
  font-family: 'DM Mono', monospace;
  font-size: 10.5px;
  color: #7a9ab8;
}

.fup-file-card__pkg-tag {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: #1557b0;
  background: #f0f8ff;
  padding: 1px 6px;
  border-radius: 3px;
}

.fup-file-card__status {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.fup-file-card__status--done { color: #0d9488; }
.fup-file-card__status--fail { color: #dc2626; }

.fup-file-card__action {
  width: 26px; height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #7a9ab8;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover { background: #fee2e2; color: #dc2626; }
}

// ─── Element Plus overrides ─────────────────────────────────────
:deep(.el-upload) { width: 100%; }
:deep(.el-upload__input) { display: none !important; width: 0 !important; height: 0 !important; opacity: 0; pointer-events: none; }
:deep(.el-upload-list) { display: none; }
:deep(.el-upload-dragger) { border: 0 !important; padding: 0 !important; }
</style>
