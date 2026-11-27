<template>
  <div class="page-body-panel">
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">我的草稿</div>
        </div>
      </template>
      <div class="roles-list-wrap">
        <el-table :data="draftList" v-loading="loading" highlight-current-row stripe
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 600 }" height="100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="hospitalName" label="医院" min-width="150" show-overflow-tooltip />
          <el-table-column prop="patientName" label="患者信息" min-width="100" align="center">
            <template #default="{ row }">
              <span>
                {{ row.patientName }}
                <span style="margin-left: 4px;" v-if="row.patientGender">
                  {{ row.patientGenderName || '' }}
                </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="提单机构" min-width="170" show-overflow-tooltip />
          <el-table-column prop="orderTypeName" label="订单类型" width="110" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.orderType === 1 ? 'primary' : 'warning'" effect="plain">
                {{ row.orderTypeName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="businessType" label="业务类型" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="primary" effect="plain">{{ row.businessTypeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="itemCount" label="重建项目" width="90" align="center">
            <template #default="{ row }">
              <span>{{ row.itemCount }} 项</span>
            </template>
          </el-table-column>
          <el-table-column prop="needsPhysicalDeliveryName" label="实体交付" min-width="125" />
          <el-table-column prop="expiresAt" label="过期时间" min-width="165">
            <template #default="{ row }">
              <span :class="{ 'text-danger': isExpiringSoon(row.expiresAt) }">
                {{ dayjs(row.expiresAt).format('YYYY-MM-DD HH:mm:ss') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="165">
            <template #default="{ row }">
              <span>{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="statusName" label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">
                {{ row.statusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-button text class="action-btn" @click="handleEdit(row)" v-permission="'draft:Edit'"><span
                  class="iconfont icon-bianji"></span></el-button>
              <el-button text class="action-btn" @click="handleView(row)" v-permission="'draft:View'"><span
                    class="iconfont icon-chakan2"></span></el-button>
              <el-button text class="action-btn action-btn--danger" @click="handleDelete(row)" v-permission="'draft:Delete'"><span
                  class="iconfont icon-shanchu"></span></el-button>
            </template>
          </el-table-column>
        </el-table>
        <page-box :current-page="pager.currentPage" :page-size="pager.pageSize" :total-count="pager.totalCount"
          @current-change="handlePageChange" />
      </div>
    </el-card>
  </div>

  <!-- 草稿编辑弹窗：复用 OrderCreateDialog -->
  <order-create-dialog v-model="showEditDialog" :draft="editingDraftDetail" :restored-form-data="uploadingFormData" @success="onEditSuccess"
    @save-and-upload="onSaveAndUpload" />

  <!-- 草稿文件上传弹窗 -->
  <file-upload-dialog v-model="showFileUploadDialog" :draft-id="editingDraftDetail?.id"
    :order-form-data="uploadingFormData" :draft="editingDraftDetail" @success="onUploadSuccess"
    @prev="onUploadPrev" />

  <!-- 草稿查看弹窗：复用 OrderDetailDialog -->
  <order-detail-dialog v-model="showViewDialog" :order="viewData" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import pageBox from '@/components/pageBox.vue'
import orderCreateDialog from './orderCreateDialog.vue'
import fileUploadDialog from './fileDialog.vue'
import orderDetailDialog from './orderDetailDialog.vue'
import {
  draftPageQuery,
  draftDelete,
  draftDetail,
  type DraftVO,
  type DraftPageQuery,
  type DraftDetailVO,
  type DraftDTO,
} from '@/api/order'
import type { DraftEmits } from './types'
import dayjs from 'dayjs'

defineOptions({ name: 'OrderDraftList' })

const emit = defineEmits<DraftEmits>()

// ── 列表 ─────────────────────────────────────────────────────────────

const loading = ref(false)
const draftList = ref<DraftVO[]>([])

const pager = reactive({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
})

const fetchList = async () => {
  loading.value = true
  try {
    const params: DraftPageQuery = {
      pageNum: pager.currentPage,
      pageSize: pager.pageSize,
    }
    const res = await draftPageQuery(params)
    draftList.value = res.records
    pager.totalCount = res.total
  } catch {
    ElMessage.error('加载草稿列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pager.currentPage = page
  fetchList()
}

const handleDelete = async (row: DraftVO) => {
  try {
    await ElMessageBox.confirm('确定要删除该草稿吗？', '提示', { type: 'warning' })
    await draftDelete(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    // user cancel or request error
  }
}

// ── 查看弹窗 ─────────────────────────────────────────────────────────

const showViewDialog = ref(false)
const viewData = ref<DraftDetailVO | null>(null)

const handleView = async (row: DraftVO) => {
  showViewDialog.value = true
  viewData.value = null
  try {
    viewData.value = await draftDetail(row.id)
  } catch {
    ElMessage.error('加载草稿详情失败')
    showViewDialog.value = false
  }
}

// ── 编辑弹窗 ─────────────────────────────────────────────────────────

const showEditDialog = ref(false)
const editingDraftDetail = ref<DraftDetailVO | null>(null)

// ── 文件上传弹窗 ─────────────────────────────────────────────────
const showFileUploadDialog = ref(false)
const uploadingFormData = ref<DraftDTO | null>(null)

const handleEdit = async (row: DraftVO) => {
  try {
    uploadingFormData.value = null
    editingDraftDetail.value = await draftDetail(row.id)
    showEditDialog.value = true
  } catch {
    ElMessage.error('加载草稿详情失败')
  }
}

const onEditSuccess = () => {
  showEditDialog.value = false
  editingDraftDetail.value = null
  fetchList()
}

const onSaveAndUpload = (draftId: number | null, formData: DraftDTO) => {
  uploadingFormData.value = formData
  showFileUploadDialog.value = true
  // 延迟关闭编辑弹窗，确保 FileUploadDialog 完全挂载后再关闭
  nextTick(() => {
    showEditDialog.value = false
  })
}

const onUploadSuccess = () => {
  showFileUploadDialog.value = false
  showEditDialog.value = false
  editingDraftDetail.value = null
  uploadingFormData.value = null
  fetchList()
}

const onUploadPrev = (payload: { formData: DraftDTO | null; draftId: number | null }) => {
  showFileUploadDialog.value = false
  uploadingFormData.value = payload.formData
  showEditDialog.value = true
}

// ── 辅助 ─────────────────────────────────────────────────────────────

const isExpiringSoon = (expiresAt: string) => {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
}

// ── 暴露 ──────────────────────────────────────────────────────────────

defineExpose({ fetchList })

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.text-danger {
  color: #f56c6c;
}
</style>
