/**
 * 通用文件上传弹窗共享类型定义
 * 由 FileUploadDialog.vue 和其包装组件共同引用
 */
import type { UploadFile } from 'element-plus'

export interface FileUploadResponse {
  code?: number
  message?: string
  data?: { id?: number | string; fileId?: number | string } | Array<{ id?: number | string; fileId?: number | string }>
}

export type FileMap = Record<string, FileItem[]>

export interface FileItem extends UploadFile {
  id?: number | string
  packageId?: number | string
  fileId?: number | string
  fileName?: string
  fileSizeText?: string
  response?: FileUploadResponse
  packageNo?: string
  isExisting?: boolean
  url?: string
  deleting?: boolean
  /** 是否属于当前追加批次 */
  isCurrentBatch?: boolean
  /** 是否允许在文件列表中删除 */
  canDelete?: boolean
  /** 上传进度 0-100，上传完成后设为 100 */
  uploadProgress?: number
}

export interface UploadConfig {
  /** 上传接口路径，默认 /yi/basic/file/upload-multiple?bizType=xxx */
  api?: string
  /** 是否批量上传，默认 true */
  batch?: boolean
  /** 防抖毫秒数，默认 150 */
  debounce?: number
}

export interface FileTypeConfig {
  /** 类型标识，内部使用 */
  type: string
  /** 显示名称 */
  label: string
  /** 序号 */
  num: string
  /** 业务类型编码 */
  bizType: string
  /** el-upload accept 属性 */
  accept: string
  /** 是否必填 */
  required: boolean
  /** 拖拽提示主文字 */
  dropText: string
  /** 拖拽提示副文字 */
  dropSub: string
  /** 支持格式标签 */
  formats: string[]
  /** 统计卡片颜色主题 */
  iconColor: 'pkg' | 'report' | 'model'
  /** 上传接口（默认 /yi/basic/file/upload-multiple） */
  uploadApi?: string
  /** 是否批量上传（默认 true） */
  uploadBatch?: boolean
  /** 防抖毫秒数（批量时生效，默认 150） */
  uploadDebounce?: number
  /** FormData 字段名（默认 'files'），非批量接口传 'file' */
  uploadFileField?: string
  /** 上传 URL 额外查询参数（如 { orderId }），会自动拼入 URL */
  uploadExtraParams?: Record<string, string | number | undefined>
  /** 批量上传成功后自动调用的钩子（如关联操作） */
  onBatchUploadDone?: (fileIds: string[], extra?: Record<string, any>) => Promise<void>
  /** 初始化已有文件（返回文件列表，自动标记 isExisting=true） */
  initExisting?: (extra?: Record<string, any>) => Promise<FileItem[]>
  /** 删除已有文件 */
  onDelete?: (file: FileItem, extra?: Record<string, any>) => Promise<void>
  /** 上传前文件名校验，返回 null 通过，返回字符串作为错误提示 */
  validateFileName?: (fileName: string) => string | null
  /** 最大文件大小（MB），默认 3072（3GB） */
  maxSizeMb?: number
  /**
   * 上传进度卡片的拆分数量展示。返回历史数量和当前操作数量，未配置时保持单一数量展示。
   */
  countBreakdown?: (files: FileItem[]) => { base: number; current: number }
}

/** 从上传响应项中解析文件 ID */
export function resolveUploadFileId(item: { id?: number | string; fileId?: number | string } | undefined): string | null {
  if (!item) return null
  const id = item.id ?? item.fileId
  return id != null && id !== '' ? String(id) : null
}
