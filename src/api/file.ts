import $axios from '@/utils/http'

// ============================================================
// 数据结构
// ============================================================

/** 文件视图对象 */
export interface FileVO {
  id: string
  bizType: string
  bizId: number | null
  fileName: string
  filePath: string
  fileUrl: string
  fileSize: number
  fileSizeText: string
  fileType: string
  fileExt: string
  platform: string
  thUrl: string | null
  thSize: number | null
  fileHash: string
  createTime: string
}

/** 文件列表查询请求 */
export interface FileListDTO {
  bizType: string
  bizId: number
}

// ============================================================
// API 方法
// ============================================================

/**
 * 16.1 上传文件（不关联业务）
 * POST /basic/file/upload
 * 使用 fetch + FormData，绕过 axios 对 multipart 的 Content-Type 处理问题
 */
export async function fileUpload(data: { file: File; bizType: string }): Promise<FileVO> {
  const formData = new FormData()
  formData.append('file', data.file as any)
  formData.append('bizType', data.bizType)
  const res = await fetch('/yi/basic/file/upload', {
    method: 'POST',
    body: formData,
  })
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.message || '上传失败')
  return json.data as FileVO
}

/**
 * 16.2 上传并关联业务
 * POST /basic/file/upload-and-link
 */
export function fileUploadAndLink(data: { file: File; bizType: string; bizId: number }) {
  const formData = new FormData()
  formData.append('file', data.file as any)
  formData.append('bizType', data.bizType)
  formData.append('bizId', String(data.bizId))
  return $axios('/basic/file/upload-and-link', { method: 'post', data: formData })
}

/**
 * 16.3 批量上传（不关联业务）
 * POST /basic/file/upload-multiple
 */
export function fileUploadMultiple(data: { files: File[]; bizType: string }) {
  const formData = new FormData()
  data.files.forEach((f) => formData.append('files', f as any))
  formData.append('bizType', data.bizType)
  return $axios('/basic/file/upload-multiple', { method: 'post', data: formData })
}

/**
 * 16.4 批量上传并关联业务
 * POST /basic/file/upload-multiple-with-biz
 */
export function fileUploadMultipleWithBiz(data: { files: File[]; bizType: string; bizId: number }) {
  const formData = new FormData()
  data.files.forEach((f) => formData.append('files', f as any))
  formData.append('bizType', data.bizType)
  formData.append('bizId', String(data.bizId))
  return $axios('/basic/file/upload-multiple-with-biz', { method: 'post', data: formData })
}

/**
 * 16.5 查询文件列表
 * POST /basic/file/list
 */
export function fileList(data: FileListDTO) {
  return $axios('/basic/file/list', { method: 'post', data })
}

/**
 * 16.6 查询文件详情
 * GET /basic/file/{id}
 */
export async function fileDetail(id: string): Promise<FileVO> {
  const res: any = await $axios(`/basic/file/${id}`, { method: 'get' })
  return res as FileVO
}

/**
 * 16.7 下载文件
 * GET /basic/file/download/{id}
 */
export function fileDownload(id: string) {
  return $axios(`/basic/file/download/${id}`, { method: 'get' })
}

/**
 * 16.8 删除文件
 * DELETE /basic/file/{id}
 */
export function fileDelete(id: string) {
  return $axios(`/basic/file/${id}`, { method: 'delete' })
}
