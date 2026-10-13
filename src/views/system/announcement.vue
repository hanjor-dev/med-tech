<template>
  <list-template page-class="announcement" hero-eyebrow="系统管理" hero-title="公告发布" hero-desc="发布需要强制确认的系统公告，独立于站内消息通知。">
    <template #filter-bar-custom>
      <div class="filter-bar announcement-filter">
        <el-input v-model="query.title" clearable placeholder="搜索公告标题" @keyup.enter="load" />
        <el-select v-model="query.status" clearable placeholder="全部状态" @change="load">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已发布" value="PUBLISHED" />
          <el-option label="已撤回" value="REVOKED" />
        </el-select>
        <el-button type="primary" @click="openCreate" v-permission="'notification:announcement:create'">新建公告</el-button>
      </div>
    </template>
    <div class="page-body-panel">
      <el-card shadow="never" class="list-card">
        <el-table v-loading="loading" :data="rows" stripe>
          <el-table-column prop="title" label="标题" min-width="260" show-overflow-tooltip />
          <el-table-column label="目标" width="120">
            <template #default="{ row }">{{ targetLabel(row.targetType || row.target?.targetType) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag></template>
          </el-table-column>
          <el-table-column label="目标人数" width="100"><template #default="{ row }">{{ row.targetCount ? row.targetCount : '—' }}</template></el-table-column>
          <el-table-column label="确认率" width="100">
            <template #default="{ row }">{{ row.status === 'DRAFT' || !row.targetCount ? '—' : `${Math.round(row.acknowledgedCount / row.targetCount * 100)}%` }}</template>
          </el-table-column>
          <el-table-column label="发布时间" width="180"><template #default="{ row }">{{ formatDateTime(row.publishedAt) }}</template></el-table-column>
          <el-table-column label="操作" width="190" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="row.status === 'DRAFT' ? openEdit(row) : openView(row)" v-permission="row.status === 'DRAFT' ? 'notification:announcement:update' : 'notification:announcement:view'">{{ row.status === 'DRAFT' ? '编辑' : '查看' }}</el-button>
              <el-button v-if="row.status !== 'DRAFT'" link type="primary" @click="openStatistics(row)" v-permission="'notification:announcement:statistics'">统计</el-button>
              <el-button v-if="row.status === 'DRAFT'" link type="success" @click="handlePublish(row)" v-permission="'notification:announcement:publish'">发布</el-button>
              <el-button v-if="row.status === 'PUBLISHED'" link type="danger" @click="handleRevoke(row)" v-permission="'notification:announcement:revoke'">撤回</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" class="pager" layout="total, sizes, prev, pager, next" :total="total" @change="load" />
      </el-card>
    </div>
  </list-template>

  <el-dialog v-model="editorVisible" class="announcement-editor-dialog" :title="editingId ? '编辑公告' : '新建公告'" width="780px" top="5vh" destroy-on-close>
    <el-scrollbar class="announcement-dialog-scrollbar">
      <el-form class="announcement-form" label-position="top">
        <el-alert class="editor-tip" title="公告发布后不可修改，只能撤回；接收人需要点击“我已知晓”完成确认。" type="warning" :closable="false" show-icon />

        <el-card shadow="never" class="form-section">
          <el-form-item label="公告标题" required>
            <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="请输入公告标题" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="form-section">
          <el-form-item label="推送范围" required>
            <el-radio-group v-model="form.target.targetType" class="target-radio-group" @change="refreshTargetEstimate">
              <el-radio-button value="ALL">全员</el-radio-button>
              <el-radio-button value="ROLE">按角色</el-radio-button>
              <el-radio-button value="USER">指定账户</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.target.targetType === 'ALL'" class="target-summary-item">
            <el-alert title="将推送给所有未禁用、未删除的账户，包括超级管理员。" type="info" :closable="false" show-icon />
          </el-form-item>
          <el-form-item v-if="form.target.targetType === 'ROLE'" label="选择角色" required>
            <el-select v-model="form.target.roleIds" class="full-control" multiple filterable collapse-tags collapse-tags-tooltip placeholder="请选择一个或多个角色" @change="refreshTargetEstimate">
              <el-option v-for="item in roleOptions" :key="item.id" :label="item.roleName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.target.targetType === 'USER'" label="选择账户" required>
            <el-select v-model="form.target.userIds" class="full-control" multiple filterable remote :remote-method="searchUsers" :loading="userLoading" collapse-tags collapse-tags-tooltip placeholder="搜索并选择一个或多个账户" @change="refreshTargetEstimate">
              <el-option v-for="item in userOptions" :key="item.id" :label="`${item.realName || item.username}（${item.username}）`" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-alert
            class="target-estimate-alert"
            :title="targetEstimateLoading ? '正在计算预计接收人数…' : `预计接收人数：${targetEstimate === null ? '—' : targetEstimate}`"
            type="success"
            :closable="false"
            show-icon
          />
        </el-card>

        <el-card shadow="never" class="form-section">
          <el-form-item label="正文" required>
            <div class="editor-shell">
              <el-button-group class="editor-toolbar">
                <el-button size="small" :type="toolbarState.bold ? 'primary' : 'default'" @mousedown.prevent @click="formatText('bold')"><strong>B</strong></el-button>
                <el-button size="small" :type="toolbarState.unorderedList ? 'primary' : 'default'" @mousedown.prevent @click="formatText('insertUnorderedList')">列表</el-button>
                <el-button size="small" @mousedown.prevent @click="formatText('createLink')">链接</el-button>
              </el-button-group>
              <div ref="editorRef" class="rich-editor" contenteditable="true" aria-label="公告正文" data-placeholder="请输入公告正文，建议先写清楚事项、影响范围和处理方式" @input="syncEditor" @paste="onPaste" />
            </div>
            <div class="field-hint">正文发布后不可修改，请在预览确认排版后再发布。</div>
          </el-form-item>
          <el-form-item label="附件与链接">
            <div class="attachment-panel">
              <div class="attachment-actions">
                <el-upload :show-file-list="false" :multiple="true" :http-request="uploadAttachmentRequest">
                  <el-button type="default">上传附件</el-button>
                </el-upload>
              </div>
              <el-table v-if="form.attachments.length" :data="form.attachments" size="small" border>
                <el-table-column label="文件名" min-width="260"><template #default="{ row }"><span class="attachment-file-name">{{ row.fileName || '未命名文件' }}</span></template></el-table-column>
                <el-table-column label="大小" width="110" align="right"><template #default="{ row }">{{ formatFileSize(row.fileSize) }}</template></el-table-column>
                <el-table-column label="操作" width="70" align="center"><template #default="{ $index }"><el-button link type="danger" @click="form.attachments.splice($index, 1)">删除</el-button></template></el-table-column>
              </el-table>
              <el-empty v-else :image-size="48" description="暂无附件" />
            </div>
          </el-form-item>
        </el-card>
      </el-form>
    </el-scrollbar>
    <template #footer><el-button @click="editorVisible = false">取消</el-button><el-button @click="previewCurrent">预览</el-button><el-button type="primary" :loading="saving" @click="saveDraft">保存草稿</el-button></template>
  </el-dialog>

  <el-dialog v-model="viewVisible" class="announcement-preview-dialog" title="查看公告" width="700px" top="7vh" destroy-on-close>
    <el-scrollbar class="preview-dialog-scrollbar">
      <div v-if="viewDetail" class="preview-paper">
        <h2 class="preview-title">{{ viewDetail.title }}</h2>
        <el-divider />
        <div class="preview-content" v-html="sanitizeAnnouncementHtml(viewDetail.contentHtml || '')" />
        <div v-if="viewDetail.attachments?.length" class="preview-attachments">
          <div class="preview-block-title">相关附件</div>
          <div v-for="(attachment, index) in viewDetail.attachments" :key="index" class="preview-attachment-row">
            <el-link :href="attachment.fileUrl" target="_blank" type="primary">{{ attachment.fileName || '未命名附件' }}</el-link>
            <span>{{ formatFileSize(attachment.fileSize) }}</span>
          </div>
        </div>
        <div class="preview-confirm-action"><el-button type="primary">我已知晓</el-button></div>
      </div>
    </el-scrollbar>
    <template #footer><el-button type="primary" @click="viewVisible = false">关闭</el-button></template>
  </el-dialog>

  <el-dialog v-model="previewVisible" class="announcement-preview-dialog" title="公告预览" width="700px" top="7vh" destroy-on-close>
    <el-scrollbar class="preview-dialog-scrollbar">
      <div class="preview-paper">
        <h2 class="preview-title">{{ form.title || '未填写公告标题' }}</h2>
        <el-divider />
        <div class="preview-content" v-html="sanitizeAnnouncementHtml(previewHtml)" />
        <div v-if="form.attachments?.length" class="preview-attachments">
          <div class="preview-block-title">相关附件</div>
          <div v-for="(attachment, index) in form.attachments" :key="index" class="preview-attachment-row">
            <span>{{ attachment.fileName || '未命名附件' }}</span><el-link :href="attachment.fileUrl" target="_blank" type="primary">下载</el-link>
          </div>
        </div>
        <div class="preview-confirm-action"><el-button type="primary">我已知晓</el-button></div>
      </div>
    </el-scrollbar>
    <template #footer><el-button @click="previewVisible = false">返回编辑</el-button><el-button type="primary" @click="previewVisible = false">关闭预览</el-button></template>
  </el-dialog>

  <el-dialog v-model="statisticsVisible" class="announcement-statistics-dialog" body-class="announcement-statistics-dialog__body" title="公告确认统计" width="860px" top="5vh" destroy-on-close @opened="relayoutStatisticsTables">
    <div class="statistics-dialog-scroll">
      <el-row v-if="statistics" :gutter="18" justify="center" class="statistics-summary">
        <el-col :span="5"><el-card shadow="never" class="statistics-summary-card statistics-summary-card--target"><el-statistic title="目标人数" :value="statistics.targetCount" /></el-card></el-col>
        <el-col :span="5"><el-card shadow="never" class="statistics-summary-card statistics-summary-card--acknowledged"><el-statistic title="已确认" :value="statistics.acknowledgedCount" /></el-card></el-col>
        <el-col :span="5"><el-card shadow="never" class="statistics-summary-card statistics-summary-card--pending"><el-statistic title="待确认" :value="statistics.pendingCount" /></el-card></el-col>
        <el-col :span="5"><el-card shadow="never" class="statistics-summary-card statistics-summary-card--rate"><el-statistic title="确认率" :value="statistics.acknowledgeRate" suffix="%" /></el-card></el-col>
      </el-row>
      <el-card shadow="never" class="statistics-card">
        <template #header>接收人确认明细</template>
        <div v-loading="statisticsLoading" class="recipient-table-shell">
          <el-table ref="recipientTableRef" :data="recipients" size="small" stripe border>
          <el-table-column label="姓名" prop="realName" min-width="120" align="center" header-align="center"><template #default="{ row }">{{ row.realName || '—' }}</template></el-table-column>
          <el-table-column label="账号" prop="userNameSnapshot" min-width="150" align="center" header-align="center"><template #default="{ row }">{{ row.userNameSnapshot || '—' }}</template></el-table-column>
          <el-table-column label="角色" min-width="140" align="center" header-align="center"><template #default="{ row }">{{ recipientRole(row) || '—' }}</template></el-table-column>
          <el-table-column label="状态" width="100" align="center" header-align="center"><template #default="{ row }"><el-tag :type="recipientStatusType(row.deliveryStatus)" effect="light">{{ recipientStatusLabel(row.deliveryStatus) }}</el-tag></template></el-table-column>
          <el-table-column label="确认时间" width="180" align="center" header-align="center"><template #default="{ row }">{{ formatDateTime(row.acknowledgedAt) }}</template></el-table-column>
          </el-table>
        </div>
        <div class="statistics-pagination">
          <el-pagination v-model:current-page="recipientPage" v-model:page-size="recipientPageSize" :hide-on-single-page="false" background layout="total, prev, pager, next" :total="recipientTotal" @current-change="loadRecipients" />
        </div>
      </el-card>
      <el-card shadow="never" class="statistics-card statistics-card--audit">
        <template #header>发布 / 撤回日志</template>
        <el-table v-if="auditLogs.length" ref="auditTableRef" :data="auditLogs" size="small" stripe border>
          <el-table-column label="操作" width="90" align="center" header-align="center"><template #default="{ row }"><el-tag :type="row.operationType === 'PUBLISH' ? 'success' : 'danger'" effect="light">{{ row.operationType === 'PUBLISH' ? '发布' : '撤回' }}</el-tag></template></el-table-column>
          <el-table-column prop="operatorName" label="操作人" min-width="140" align="center" header-align="center" />
          <el-table-column prop="targetCount" label="目标人数" width="100" align="center" header-align="center" />
          <el-table-column label="操作时间" width="180" align="center" header-align="center"><template #default="{ row }">{{ formatDateTime(row.operationTime) }}</template></el-table-column>
        </el-table>
        <el-empty v-else :image-size="56" description="暂无发布或撤回日志" />
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import listTemplate from '@/components/listTemplate.vue'
import { announcementPage, announcementDetail, createAnnouncementDraft, updateAnnouncementDraft, publishAnnouncement, revokeAnnouncement, announcementStatistics, announcementRecipients, announcementAuditLogs, previewAnnouncement, estimateAnnouncementTarget, type AnnouncementRecord, type AnnouncementStatistics, type AnnouncementRecipient } from '@/api/announcement'
import { fileUpload } from '@/api/file'
import { roleAll } from '@/api/role'
import { userDetail, userList, type UserVO } from '@/api/user'
import { sanitizeAnnouncementHtml } from '@/utils/announcementHtml'

const loading = ref(false)
const saving = ref(false)
const rows = ref<AnnouncementRecord[]>([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 20, title: '', status: '' })
const editorVisible = ref(false)
const editingId = ref<number | null>(null)
const roleInput = ref('')
const userInput = ref('')
const statisticsVisible = ref(false)
const statisticsLoading = ref(false)
const statistics = ref<AnnouncementStatistics | null>(null)
const recipients = ref<AnnouncementRecipient[]>([])
const recipientAnnouncementId = ref<number | null>(null)
const recipientPage = ref(1)
const recipientPageSize = ref(10)
const recipientTotal = ref(0)
const auditLogs = ref<any[]>([])
const recipientTableRef = ref<any>()
const auditTableRef = ref<any>()
const form = reactive<any>({ title: '', contentHtml: '', target: { targetType: 'ALL', roleIds: [], userIds: [] } })
const editorRef = ref<HTMLElement>()
const toolbarState = reactive({ bold: false, unorderedList: false })
const previewVisible = ref(false)
const previewHtml = ref('')
const viewVisible = ref(false)
const viewDetail = ref<any>(null)
const roleOptions = ref<any[]>([])
const userOptions = ref<UserVO[]>([])
const userLoading = ref(false)
const targetEstimate = ref<number | null>(null)
const targetEstimateLoading = ref(false)

const load = async () => { loading.value = true; try { const res: any = await announcementPage(query); rows.value = res.records || []; total.value = res.total || 0 } finally { loading.value = false } }
const resetForm = () => { form.title = ''; form.contentHtml = ''; form.attachments = []; form.target = { targetType: 'ALL', roleIds: [], userIds: [] }; roleInput.value = ''; userInput.value = ''; targetEstimate.value = null; requestAnimationFrame(() => { if (editorRef.value) editorRef.value.innerHTML = '' }) }
const targetPayload = () => ({ targetType: form.target.targetType, roleIds: form.target.roleIds || roleInput.value.split(',').map(Number).filter(Boolean), userIds: form.target.userIds || userInput.value.split(',').map(Number).filter(Boolean) })
const refreshTargetEstimate = async () => {
  const target = targetPayload()
  if ((target.targetType === 'ROLE' && !target.roleIds.length) || (target.targetType === 'USER' && !target.userIds.length)) {
    targetEstimate.value = null
    return
  }
  targetEstimateLoading.value = true
  try { targetEstimate.value = await estimateAnnouncementTarget(target) } catch { targetEstimate.value = null } finally { targetEstimateLoading.value = false }
}
const openCreate = () => { editingId.value = null; resetForm(); editorVisible.value = true; refreshTargetEstimate() }
const loadEditTargetOptions = async () => {
  if (!roleOptions.value.length) roleOptions.value = await roleAll()
  const selectedIds = form.target.userIds || []
  if (!selectedIds.length) return
  const existing = userOptions.value.filter(item => selectedIds.includes(item.id))
  const missingIds = selectedIds.filter((id: number) => !existing.some(item => item.id === id))
  if (!missingIds.length) return
  const selectedUsers = await Promise.all(missingIds.map((id: number) => userDetail(id).catch(() => null)))
  userOptions.value = [...existing, ...selectedUsers.filter(Boolean) as UserVO[]]
}
const parseTargetIds = (value: string | undefined) => { try { const parsed = value ? JSON.parse(value) : []; return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [] } catch { return [] } }
const openEdit = async (row: AnnouncementRecord) => { if (row.status !== 'DRAFT') return; const detail: any = await announcementDetail(row.id); editingId.value = row.id; form.title = detail.title; form.contentHtml = detail.contentHtml; form.attachments = detail.attachments || []; form.target = { targetType: detail.targetType || 'ALL', roleIds: parseTargetIds(detail.targetRoleIds), userIds: parseTargetIds(detail.targetUserIds) }; roleInput.value = (form.target.roleIds || []).join(','); userInput.value = (form.target.userIds || []).join(','); targetEstimate.value = detail.targetCount ?? null; await loadEditTargetOptions(); editorVisible.value = true; requestAnimationFrame(() => { if (editorRef.value) editorRef.value.innerHTML = form.contentHtml }); refreshTargetEstimate() }
const openView = async (row: AnnouncementRecord) => { viewDetail.value = await announcementDetail(row.id); viewVisible.value = true }
const toPayload = () => ({ title: form.title.trim(), contentHtml: form.contentHtml, attachments: form.attachments.filter((item: any) => item.fileName && item.fileUrl), target: targetPayload() })
const saveDraft = async () => { if (!form.title.trim() || !form.contentHtml.trim()) return ElMessage.warning('请填写标题和公告内容'); saving.value = true; try { const payload = toPayload(); if (editingId.value) await updateAnnouncementDraft(editingId.value, payload); else await createAnnouncementDraft(payload); ElMessage.success('草稿已保存'); editorVisible.value = false; await load() } finally { saving.value = false } }
const handlePublish = async (row: AnnouncementRecord) => { await ElMessageBox.confirm('发布后不可修改，确认立即发布？', '发布确认'); await publishAnnouncement(row.id); ElMessage.success('公告已发布'); await load() }
const updateToolbarState = () => {
  const selection = window.getSelection()
  const inEditor = Boolean(editorRef.value && selection?.anchorNode && editorRef.value.contains(selection.anchorNode))
  if (!inEditor) {
    toolbarState.bold = false
    toolbarState.unorderedList = false
    return
  }
  toolbarState.bold = document.queryCommandState('bold')
  toolbarState.unorderedList = document.queryCommandState('insertUnorderedList')
}
const syncEditor = () => { form.contentHtml = editorRef.value?.innerHTML || ''; updateToolbarState() }
const onPaste = (event: ClipboardEvent) => { event.preventDefault(); const text = event.clipboardData?.getData('text/plain') || ''; document.execCommand('insertText', false, text) }
const formatText = (command: string) => { if (command === 'createLink') { const url = window.prompt('请输入链接地址'); if (!url) return; document.execCommand(command, false, url) } else document.execCommand(command); syncEditor(); updateToolbarState() }
const previewCurrent = async () => { syncEditor(); const result: any = await previewAnnouncement(toPayload()); previewHtml.value = result.contentHtml; previewVisible.value = true }
const handleRevoke = async (row: AnnouncementRecord) => { await ElMessageBox.confirm('撤回后已打开的弹窗会被关闭，确认撤回？', '撤回确认'); await revokeAnnouncement(row.id); ElMessage.success('公告已撤回'); await load() }
const normalizeRecipient = (row: any) => ({
  ...row,
  realName: row.realName || row.userNameSnapshot || row.user_name_snapshot || row.real_name || row.userName || row.user_name || row.name || '',
  userNameSnapshot: row.userNameSnapshot || row.user_name_snapshot || row.realName || row.real_name || row.userName || row.user_name || row.name || '',
  usernameSnapshot: row.username || row.usernameSnapshot || row.username_snapshot || row.loginName || row.login_name || row.account || '',
  roleSnapshot: row.roleName || row.role_name || row.roleSnapshot || row.role_snapshot || row.role || ''
})
const recipientPageData = (page: any) => { const result = page?.records ? page : page?.data?.records ? page.data : { records: [], total: 0 }; return { records: result.records || [], total: result.total ?? result.totalCount ?? result.records?.length ?? 0 } }
const auditLogRecords = (result: any) => { if (Array.isArray(result)) return result; if (Array.isArray(result?.records)) return result.records; if (Array.isArray(result?.data?.records)) return result.data.records; if (Array.isArray(result?.data)) return result.data; return [] }
const relayoutStatisticsTables = async () => {
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  recipientTableRef.value?.doLayout?.()
  auditTableRef.value?.doLayout?.()
}
const openStatistics = async (row: AnnouncementRecord) => { recipientAnnouncementId.value = row.id; recipientPage.value = 1; statisticsVisible.value = true; statisticsLoading.value = true; try { const [stats, pageResult, logs]: any[] = await Promise.all([announcementStatistics(row.id), announcementRecipients(row.id, { pageNum: 1, pageSize: recipientPageSize.value }), announcementAuditLogs(row.id)]); const page = recipientPageData(pageResult); statistics.value = stats; recipients.value = page.records.map(normalizeRecipient); recipientTotal.value = page.total || stats?.targetCount || 0; auditLogs.value = auditLogRecords(logs); await relayoutStatisticsTables() } finally { statisticsLoading.value = false } }
const loadRecipients = async () => { if (!recipientAnnouncementId.value) return; statisticsLoading.value = true; try { const pageResult: any = await announcementRecipients(recipientAnnouncementId.value, { pageNum: recipientPage.value, pageSize: recipientPageSize.value }); const page = recipientPageData(pageResult); recipients.value = page.records.map(normalizeRecipient); recipientTotal.value = page.total || 0; await relayoutStatisticsTables() } finally { statisticsLoading.value = false } }
const uploadAttachmentRequest = async (options: any) => { try { const uploaded = await fileUpload({ file: options.file, bizType: '10.17' }); form.attachments.push({ fileId: uploaded.id, fileName: uploaded.fileName, fileUrl: uploaded.fileUrl, fileType: uploaded.fileType, fileSize: uploaded.fileSize, sort: form.attachments.length }); options.onSuccess(uploaded); ElMessage.success('附件上传成功') } catch (error: any) { options.onError(error); ElMessage.error(error?.message || '附件上传失败') } }
const formatFileSize = (size?: number) => { if (!size || size < 0) return '—'; if (size < 1024) return `${size} B`; if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`; if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`; return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB` }
const searchUsers = async (keyword: string) => { userLoading.value = true; try { const result: any = await userList({ pageNum: 1, pageSize: 100, status: 1, keyword: keyword || undefined }); const selectedIds = new Set(form.target.userIds || []); const selectedOptions = userOptions.value.filter(item => selectedIds.has(item.id)); const fetchedOptions = result.records || []; userOptions.value = [...selectedOptions, ...fetchedOptions.filter(item => !selectedIds.has(item.id))] } finally { userLoading.value = false } }
const statusLabel = (v: string) => ({ DRAFT: '草稿', PUBLISHED: '已发布', REVOKED: '已撤回' } as any)[v] || v
const statusType = (v: string) => ({ DRAFT: 'info', PUBLISHED: 'success', REVOKED: 'danger' } as any)[v] || 'info'
const targetLabel = (v: string) => ({ ALL: '全员', ROLE: '按角色', USER: '指定账户' } as any)[v] || '—'
const recipientStatusLabel = (v: string) => ({ PENDING: '待确认', ACKNOWLEDGED: '已确认', REVOKED: '已撤回' } as any)[v] || v
const recipientStatusType = (v: string) => ({ PENDING: 'warning', ACKNOWLEDGED: 'success', REVOKED: 'danger' } as any)[v] || 'info'
const formatDateTime = (value?: string) => value ? value.replace('T', ' ') : '—'
const recipientRole = (row: any) => row.roleSnapshot || row.role_snapshot || row.roleName || row.role_name || row.role || ''
onMounted(async () => { document.addEventListener('selectionchange', updateToolbarState); await load(); const [roles, users]: any[] = await Promise.all([roleAll(), userList({ pageNum: 1, pageSize: 100, status: 1 })]); roleOptions.value = roles || []; userOptions.value = users.records || [] })
onBeforeUnmount(() => { document.removeEventListener('selectionchange', updateToolbarState) })
</script>

<style scoped>
.announcement-filter { display: flex; gap: 12px; align-items: center; }
.announcement-filter .el-input { max-width: 300px; }
.announcement-filter .el-select { width: 150px; }
.pager { justify-content: flex-end; margin-top: 18px; }
.announcement-editor-dialog :deep(.el-dialog), .announcement-preview-dialog :deep(.el-dialog) { overflow: hidden; }
.announcement-editor-dialog :deep(.el-dialog__header), .announcement-preview-dialog :deep(.el-dialog__header) { margin-right: 0; padding: 20px 24px 16px; border-bottom: 1px solid var(--el-border-color-lighter); }
.announcement-editor-dialog :deep(.el-dialog__body), .announcement-preview-dialog :deep(.el-dialog__body) { padding: 0; }
.announcement-editor-dialog :deep(.el-dialog__footer), .announcement-preview-dialog :deep(.el-dialog__footer) { padding: 14px 24px 18px; border-top: 1px solid var(--el-border-color-lighter); }
.announcement-dialog-scrollbar { height: min(720px, calc(100vh - 210px)); padding: 20px 24px 72px; box-sizing: border-box; }
.announcement-form { display: grid; gap: 16px; }
.editor-tip { margin-bottom: 0; }
.form-section { border-color: var(--el-border-color-lighter); }
.form-section :deep(.el-card__header) { padding: 16px 18px; }
.form-section :deep(.el-card__body) { padding: 18px; }
.section-heading { display: flex; align-items: flex-start; gap: 10px; }
.section-index { display: inline-flex; flex: 0 0 24px; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-size: 13px; font-weight: 600; }
.section-title { color: var(--el-text-color-primary); font-size: 15px; font-weight: 600; line-height: 24px; }
.section-description { margin-top: 2px; color: var(--el-text-color-secondary); font-size: 12px; font-weight: 400; line-height: 18px; }
.announcement-form :deep(.el-form-item) { margin-bottom: 18px; }
.announcement-form :deep(.el-form-item:last-child) { margin-bottom: 0; }
.announcement-form :deep(.el-form-item__label) { height: auto; padding: 0; margin-bottom: 8px; color: var(--el-text-color-regular); font-size: 13px; line-height: 20px; }
.announcement-form :deep(.el-form-item__content) { display: block; line-height: normal; }
.full-control { width: 100%; }
.target-radio-group { display: inline-flex; }
.target-summary-item { margin-top: -2px; }
.target-summary-item :deep(.el-form-item__content) { line-height: normal; }
.target-estimate-alert { margin-top: 14px; }
.target-estimate-alert :deep(.el-alert__title) { font-size: 13px; font-weight: 500; }
.editor-shell { width: 100%; overflow: hidden; border: 1px solid var(--el-border-color); border-radius: var(--el-border-radius-base); background: var(--el-bg-color); }
.editor-toolbar { display: flex; width: 100%; padding: 8px; border-bottom: 1px solid var(--el-border-color-lighter); background: var(--el-fill-color-light); box-sizing: border-box; }
.editor-toolbar :deep(.el-button) { min-width: 42px; }
.rich-editor { width: 100%; min-height: 230px; padding: 14px 16px; box-sizing: border-box; outline: none; color: var(--el-text-color-primary); font-size: 14px; line-height: 1.8; overflow-y: auto; }
.rich-editor:focus { box-shadow: inset 0 0 0 1px var(--el-color-primary); }
.rich-editor:empty::before { color: var(--el-text-color-placeholder); content: attr(data-placeholder); pointer-events: none; }
.rich-editor :deep(p), .rich-editor :deep(div) { margin: 0 0 10px; }
.rich-editor :deep(ul), .rich-editor :deep(ol) { padding-left: 22px; margin: 8px 0 12px; }
.rich-editor :deep(a) { color: var(--el-color-primary); text-decoration: underline; text-underline-offset: 2px; }
.field-hint { margin-top: 8px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 18px; }
.attachment-panel { width: 100%; }
.attachment-panel :deep(.el-table) { width: 100%; }
.attachment-panel :deep(.el-table .cell) { padding: 0 8px; }
.attachment-panel :deep(.el-empty) { padding: 16px 0; }
.attachment-actions { display: flex; gap: 8px; margin-bottom: 12px; }
.attachment-file-name { display: block; color: var(--el-text-color-regular); line-height: 20px; overflow-wrap: anywhere; }
.preview-dialog-scrollbar { height: min(650px, calc(100vh - 250px)); padding: 22px 24px 24px; box-sizing: border-box; }
.preview-paper { max-width: 620px; margin: 0 auto; padding: 22px 26px 26px; border: 1px solid var(--el-border-color-lighter); border-radius: var(--el-border-radius-base); background: var(--el-bg-color); }
.preview-title { margin: 22px 0 8px; color: var(--el-text-color-primary); font-size: 24px; font-weight: 600; line-height: 1.45; text-align: center; word-break: break-word; }
.preview-content { min-height: 220px; box-sizing: border-box; color: var(--el-text-color-regular); font-size: 14px; line-height: 1.9; word-break: break-word; }
.preview-content :deep(p), .preview-content :deep(div) { margin: 0 0 12px; }
.preview-content :deep(img) { display: block; max-width: 100%; height: auto; margin: 12px auto; }
.preview-content :deep(ul), .preview-content :deep(ol) { padding-left: 24px; }
.preview-content :deep(a) { color: var(--el-color-primary); }
.preview-attachments { margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--el-border-color-lighter); }
.preview-block-title { margin-bottom: 10px; color: var(--el-text-color-primary); font-size: 14px; font-weight: 600; }
.preview-attachment-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 36px; padding: 0 10px; border-radius: var(--el-border-radius-base); background: var(--el-fill-color-light); color: var(--el-text-color-regular); font-size: 13px; }
.preview-attachment-row + .preview-attachment-row { margin-top: 6px; }
.preview-attachment-row span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-confirm-action { display: flex; justify-content: center; margin-top: 28px; }
@media (max-width: 768px) {
  .announcement-editor-dialog :deep(.el-dialog), .announcement-preview-dialog :deep(.el-dialog) { width: calc(100vw - 24px) !important; margin: 12px auto; }
  .announcement-dialog-scrollbar, .preview-dialog-scrollbar { padding: 14px 12px 54px; }
  .announcement-dialog-scrollbar { height: calc(100vh - 176px); }
  .preview-dialog-scrollbar { height: calc(100vh - 210px); }
  .form-section :deep(.el-card__header), .form-section :deep(.el-card__body) { padding: 14px; }
  .section-description { max-width: 260px; }
  .target-radio-group { display: flex; width: 100%; }
  .target-radio-group :deep(.el-radio-button) { flex: 1; }
  .target-radio-group :deep(.el-radio-button__inner) { width: 100%; padding-right: 8px; padding-left: 8px; }
  .preview-paper { padding: 18px 16px 20px; }
  .preview-title { font-size: 21px; }
  .statistics-summary :deep(.el-col) { flex: 0 0 50%; max-width: 50%; margin-bottom: 12px; }
}
.statistics-dialog-scroll { padding: 2px 4px 16px 2px; box-sizing: border-box; }
:global(.el-dialog.announcement-statistics-dialog) { display: flex; height: auto; max-height: 90vh; margin: 5vh auto 0; flex-direction: column; overflow: hidden; }
:global(.announcement-statistics-dialog .el-dialog__header) { flex: 0 0 auto; }
:global(.announcement-statistics-dialog__body.el-dialog__body) { min-height: 0; flex: 0 1 auto; padding: 0 20px 20px; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
.statistics-summary { margin-bottom: 12px; }
.statistics-summary-card { min-height: 76px; border-width: 1px; border-style: solid; transition: box-shadow 0.2s ease, transform 0.2s ease; }
.statistics-summary-card:hover { transform: translateY(-1px); box-shadow: var(--el-box-shadow-light); }
.statistics-summary-card :deep(.el-card__body) { display: flex; min-height: 76px; padding: 10px 12px; box-sizing: border-box; align-items: center; justify-content: center; text-align: center; }
.statistics-summary-card :deep(.el-statistic) { width: 100%; }
.statistics-summary-card :deep(.el-statistic__head) { margin-bottom: 5px; font-size: 12px; font-weight: 500; }
.statistics-summary-card :deep(.el-statistic__content) { justify-content: center; font-size: 22px; font-weight: 700; }
.statistics-summary-card--target { border-color: #bfdbfe; background: #eff6ff; }
.statistics-summary-card--target :deep(.el-statistic__head), .statistics-summary-card--target :deep(.el-statistic__content) { color: #2563eb; }
.statistics-summary-card--acknowledged { border-color: #bbf7d0; background: #f0fdf4; }
.statistics-summary-card--acknowledged :deep(.el-statistic__head), .statistics-summary-card--acknowledged :deep(.el-statistic__content) { color: #16a34a; }
.statistics-summary-card--pending { border-color: #fed7aa; background: #fff7ed; }
.statistics-summary-card--pending :deep(.el-statistic__head), .statistics-summary-card--pending :deep(.el-statistic__content) { color: #ea580c; }
.statistics-summary-card--rate { border-color: #ddd6fe; background: #f5f3ff; }
.statistics-summary-card--rate :deep(.el-statistic__head), .statistics-summary-card--rate :deep(.el-statistic__content) { color: #7c3aed; }
.statistics-card + .statistics-card { margin-top: 12px; }
.statistics-card :deep(.el-card__header) { padding: 12px 16px; font-weight: 600; }
.statistics-card :deep(.el-card__body) { padding: 12px 16px 16px; }
.statistics-card--audit :deep(.el-card__body) { min-height: 112px; }
.statistics-card--audit :deep(.el-table) { width: 100%; min-height: 80px; }
.statistics-card--audit :deep(.el-empty) { padding: 8px 0; }
.recipient-table-shell { min-height: 280px; }
.recipient-table-shell :deep(.el-table) { min-height: 244px; }
.recipient-table-shell :deep(.el-table__inner-wrapper) { min-height: 244px; }
.statistics-pagination { display: flex; justify-content: center; margin-top: 16px; }
.preview-attachment-row .el-link { min-width: 0; overflow: hidden; color: var(--el-color-primary); text-decoration: underline; text-overflow: ellipsis; white-space: nowrap; }
.preview-attachment-row > span { flex: 0 0 auto; color: var(--el-text-color-secondary); font-size: 12px; }
</style>
