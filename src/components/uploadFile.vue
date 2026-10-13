
<template>
  <div class="file-upload-container">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="headers"
      :data="uploadData"
      :name="fileName"
      :multiple="multiple"
      :limit="limit"
      :disabled="disabled"
      :show-file-list="showFileList"
      :drag="draggable"
      :accept="accept"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :file-list="fileList"
      :auto-upload="autoUpload"
      :http-request="customUpload"
      class="upload-wrapper"
    >
      <template v-if="draggable">
        <el-icon class="el-icon--upload">
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
      </template>
      
      <el-button 
        v-else 
        :type="buttonType" 
        :size="buttonSize"
        :disabled="disabled"
        :icon="buttonIcon"
      >
        {{ buttonText }}
      </el-button>
      
      <template #tip>
        <div v-if="showTips" class="el-upload__tip">
          {{ tipsText }}
        </div>
      </template>
    </el-upload>
    
    <!-- 上传进度显示 -->
    <div v-if="showProgress && uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
      <el-progress :percentage="uploadProgress" :status="progressStatus" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps, UploadFile, UploadRawFile } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

interface FileUploadProps {
  // 基本配置
  uploadUrl?: string
  headers?: Record<string, string>
  uploadData?: Record<string, any>
  fileName?: string
  multiple?: boolean
  limit?: number
  disabled?: boolean
  showFileList?: boolean
  draggable?: boolean
  accept?: string
  autoUpload?: boolean
  /** 最大文件大小（MB），默认不限制 */
  maxSizeMb?: number
  
  // 按钮配置
  buttonText?: string
  buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  buttonSize?: 'large' | 'default' | 'small'
  buttonIcon?: any
  
  // 提示配置
  showTips?: boolean
  tipsText?: string
  
  // 进度显示
  showProgress?: boolean
  
  // 初始文件列表
  initialFiles?: UploadFile[]
}

const props = withDefaults(defineProps<FileUploadProps>(), {
  uploadUrl: '/yi/basic/file/upload',
  headers: () => ({}),
  uploadData: () => ({}),
  fileName: 'file',
  multiple: false,
  limit: 10,
  disabled: false,
  showFileList: true,
  draggable: false,
  accept: '',
  autoUpload: true,
  buttonText: '点击上传',
  buttonType: 'primary',
  buttonSize: 'default',
  showTips: true,
  tipsText: '只能上传jpg/png文件，且不超过500kb',
  showProgress: true,
  initialFiles: () => []
})

const emit = defineEmits<{
  (e: 'success', file: UploadFile, response: any): void
  (e: 'error', file: UploadFile, error: any): void
  (e: 'progress', file: UploadFile, percentage: number): void
  (e: 'remove', file: UploadFile): void
  (e: 'preview', file: UploadFile): void
  (e: 'exceed', files: File[], fileList: UploadFile[]): void
  (e: 'change', fileList: UploadFile[]): void
}>()

// 响应式数据
const uploadRef = ref()
const fileList = ref<UploadFile[]>([...props.initialFiles])
const uploadProgress = ref(0)
const progressStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const isUploading = ref(false)

// 监听 initialFiles 变化，同步更新 fileList
watch(() => props.initialFiles, (newFiles) => {
  fileList.value = [...newFiles]
}, { deep: true })

// 计算属性
const tipsText = computed(() => {
  if (props.tipsText) return props.tipsText
  return `只能上传${props.accept || 'jpg/png'}文件，且不超过${props.limit || 10}个`
})

// 上传前检查
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (props.accept) {
    const acceptedTypes = props.accept.split(',').map(type => type.trim())
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return rawFile.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return rawFile.type.includes(type)
    })
    if (!isValidType) {
      ElMessage.error(`只能上传 ${props.accept} 格式的文件!`)
      return false
    }
  }

  // 文件大小检查
  if (props.maxSizeMb) {
    const maxSizeBytes = props.maxSizeMb * 1024 * 1024
    if (rawFile.size > maxSizeBytes) {
      ElMessage.error(`文件大小不能超过 ${props.maxSizeMb}MB!`)
      return false
    }
  }

  return true
}

// 上传成功处理
const handleSuccess: UploadProps['onSuccess'] = (response, uploadFile, uploadFiles) => {
  isUploading.value = false
  uploadProgress.value = 100
  progressStatus.value = 'success'

  // 保留原始文件名：优先用后端返回的 originalFilename，其次用前端上传时的原始文件名
  if (response.code != 200) {
    ElMessage.error(response.message)
    progressStatus.value = 'exception'
    const failedUid = uploadFile.uid
    fileList.value = fileList.value.filter(f => f.uid !== failedUid)
    setTimeout(() => {
      progressStatus.value = ''
    }, 3000)
    return
  }
  const originalFilename = response?.data?.originalFilename
  if (originalFilename && uploadFile.raw) {
    uploadFile.name = originalFilename
  }

  // 更新文件列表
  fileList.value = [...uploadFiles as UploadFile[]]

  // 延迟重置进度条
  setTimeout(() => {
    uploadProgress.value = 0
    progressStatus.value = ''
  }, 1000)

  emit('success', uploadFile, response)
  emit('change', fileList.value)
}

// 上传失败处理
const handleError: UploadProps['onError'] = (error, uploadFile, uploadFiles) => {
  isUploading.value = false
  uploadProgress.value = 0
  progressStatus.value = 'exception'
  
  ElMessage.error('上传失败，请重试!')
  emit('error', uploadFile, error)
}

// 上传进度处理
const handleProgress: UploadProps['onProgress'] = (event, uploadFile, uploadFiles) => {
  isUploading.value = true
  uploadProgress.value = Math.floor(event.percent || 0)
  
  if (uploadProgress.value >= 100) {
    progressStatus.value = 'success'
  }
  
  emit('progress', uploadFile, uploadProgress.value)
}

// 超出限制处理
const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(`当前限制选择 ${props.limit} 个文件，本次选择了 ${files.length} 个文件`)
  // emit('exceed', files, uploadFiles)
}

// 文件移除处理
const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  fileList.value = [...uploadFiles]
  emit('remove', uploadFile)
  emit('change', fileList.value)
}

// 文件预览处理
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  emit('preview', uploadFile)
}

// 自定义上传实现（可选）
const customUpload: UploadProps['httpRequest'] = (options) => {
  const { action, file, onProgress, onSuccess, onError } = options

  const formData = new FormData()
  formData.append(props.fileName, file)

  // 添加额外数据
  Object.keys(props.uploadData).forEach(key => {
    formData.append(key, props.uploadData[key])
  })

  const xhr = new XMLHttpRequest()

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      onProgress({
        percent: (e.loaded / e.total) * 100,
        lengthComputable: e.lengthComputable,
        loaded: e.loaded,
        total: e.total,
        target: xhr
      } as any)
    }
  }

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const response = JSON.parse(xhr.responseText)
      // 将原始文件名注入到响应数据中，Element Plus 会用它设置 uploadFile.name
      if (response?.data) {
        response.data.originalFilename = (file as File).name
      }
      onSuccess(response)
    } else {
      onError(new Error(`上传失败: ${xhr.status}`) as any)
    }
  }

  xhr.onerror = () => {
    onError(new Error('网络错误') as any)
  }

  xhr.open('POST', action, true)

  // 添加请求头
  Object.keys(props.headers).forEach(key => {
    xhr.setRequestHeader(key, props.headers[key])
  })

  xhr.send(formData)

  return xhr
}

// 手动上传方法
const submitUpload = () => {
  uploadRef.value?.submit()
}

// 清空文件列表
const clearFiles = () => {
  uploadRef.value?.clearFiles()
}

// 获取文件列表
const getFiles = () => {
  return fileList.value
}

// 添加文件到列表
const addFile = (file: UploadFile) => {
  fileList.value.push(file)
}

// 暴露方法给父组件
defineExpose({
  submitUpload,
  clearFiles,
  getFiles,
  addFile,
  setInitialFiles: (files: UploadFile[]) => {
    fileList.value = files
  }
})

// 监听初始文件变化
watch(() => props.initialFiles, (newFiles) => {
  fileList.value = [...newFiles]
}, { deep: true })
</script>

<style scoped>
.file-upload-container {
  width: 100%;
}

.upload-wrapper {
  width: 100%;
}

.upload-progress {
  margin-top: 15px;
}

.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload-list__item) {
  transition: all 0.3s;
}

:deep(.el-upload-list__item:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
