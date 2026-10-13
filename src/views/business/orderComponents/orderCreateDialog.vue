<template>
  <dialog-modal ref="dialogRef" v-model="visible" :title="dialogTitle" :subtitle="dialogSubtitle" width="960px"
    :show-footer="true" @modal-close="visible = false">
    <el-form ref="orderFormRef" :model="form" class="dlr-root" label-position="top" :rules="orderRules">
      <main class="dlr-main">
        <!-- 01 基础信息 -->
        <section class="form-section" :class="{ 'form-section--disabled': !canEditBasicInfo }">
          <div class="form-section-header">
            <span class="form-section-num">01</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">基础信息</span>
            <span v-if="!canEditBasicInfo" class="form-section-tip">（仅查看）</span>
          </div>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="订单类型" prop="orderType">
                <el-select v-model="form.orderType" placeholder="请选择订单类型" style="width: 100%"
                  :disabled="!canEditOrderTypeInModify">
                  <el-option v-if="qualificationType === 1" label="医疗器械" :value="1" />
                  <el-option label="非医疗器械" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否需要实体交付" prop="needsPhysicalDelivery">
                <el-select v-model="form.needsPhysicalDelivery" placeholder="请选择" style="width: 100%"
                  :disabled="!canEditNeedsPhysicalDelivery" @change="onNeedsPhysicalDeliveryChange">
                  <el-option label="是（需要实体交付）" :value="1" />
                  <el-option label="否（仅设计服务）" :value="0" />
                  <el-option label="否（异地打印）" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="业务类型" prop="businessType">
                <el-select v-model="form.businessType" placeholder="请选择业务类型" style="width: 100%"
                  :disabled="!canEditBusinessTypeInModify">
                  <el-option v-for="item in filteredBusinessTypeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="isTestOrAgent && !isModifyMode">
              <el-form-item label="审批文件" :required="isTestOrAgent">
                <uploadFile ref="approvalUploadRef" :upload-url="'/yi/basic/file/upload-multiple?bizType=10.20'"
                  :file-name="'files'" :multiple="true" :limit="10"
                  accept=".zip,.pdf,.jpg,.jpeg,.png,.rar" :button-text="'上传审批文件'"
                  :show-tips="false" :show-progress="true" @success="handleApprovalSuccess"
                  @remove="handleApprovalRemove" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="医院" prop="hospitalId">
                <el-select v-model="form.hospitalId" placeholder="请选择医院" filterable clearable style="width: 100%"
                  :disabled="!canEditBasicInfo" @change="onHospitalChange">
                  <el-option v-for="item in hospitalOptions" :key="item.id" :label="item.orgName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="科室">
                <el-select v-model="form.hospitalDeptId" placeholder="请选择科室" filterable clearable style="width: 100%"
                  :disabled="!canEditBasicInfo">
                  <el-option v-for="item in deptOptions" :key="item.id" :label="item.hospitalDeptName"
                    :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否邮寄">
                <el-select v-model="form.isPostal" placeholder="是否邮寄" style="width: 100%" @change="onPostalChange"
                  :disabled="!canEditBasicInfo">
                  <el-option label="否" :value="0" />
                  <el-option label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="form.isPostal === 1">
              <el-form-item label="邮寄地址">
                <el-input v-model="form.postalAddress" placeholder="请输入邮寄地址" clearable :disabled="!canEditBasicInfo" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="医生姓名">
                <el-autocomplete v-model="form.doctorName" :fetch-suggestions="queryDoctorSuggestions"
                  placeholder="支持智能联想" clearable :disabled="!canEditBasicInfo" :debounce="300" value-key="doctorName"
                  @select="onDoctorSelect" @input="onDoctorInput">
                  <template #default="{ item }">
                    <div class="doctor-suggestion-item">
                      <span class="doctor-suggestion-name">{{ item.doctorName }}</span>
                      <span class="doctor-suggestion-phone" v-if="item.doctorPhone">{{ item.doctorPhone }}</span>
                    </div>
                  </template>
                </el-autocomplete>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="医生电话">
                <el-input v-model="form.doctorPhone" placeholder="请输入医生电话" clearable :disabled="!canEditBasicInfo" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="期望交付时间">
                <el-date-picker v-model="form.expectedDeliveryDate" type="datetime" placeholder="选择期望交付时间"
                  format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"
                  :disabled="!canEditBasicInfo"
                  :disabled-date="(date: Date) => {
                    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    return d.getTime() < minDeliveryDate.getTime();
                  }"
                  :disabled-hours="disabledHours"
                  :disabled-minutes="disabledMinutes"
                  :disabled-seconds="disabledSeconds" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否加急">
                <el-select v-model="form.isUrgent" placeholder="是否加急" style="width: 100%" :disabled="!canEditBasicInfo">
                  <el-option label="否" :value="0" />
                  <el-option label="是（加急处理）" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <!-- 02 患者信息 -->
        <section class="form-section" :class="{ 'form-section--disabled': !canEditPatientInfo }">
          <div class="form-section-header">
            <span class="form-section-num">02</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">患者信息</span>
            <span v-if="!canEditPatientInfo" class="form-section-tip">（仅查看）</span>
          </div>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="患者姓名" prop="patientName">
                <el-input v-model="form.patientName" placeholder="请输入患者姓名" clearable :disabled="!canEditPatientInfo" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="患者性别">
                <el-select v-model="form.patientGender" placeholder="请选择性别" clearable style="width: 100%"
                  :disabled="!canEditPatientInfo">
                  <el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="患者年龄">
                <el-input-number v-model="form.patientAge" :min="0" :max="150" placeholder="年龄" style="width: 100%"
                  controls-position="right" :disabled="!canEditPatientInfo" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <!-- 03 重建项目 -->
        <section class="form-section" :class="{ 'form-section--disabled': !canEditRebuildItems }">
          <div class="form-section-header">
            <span class="form-section-num">03</span>
            <span class="form-section-line"></span>
            <span class="form-section-title">重建项目</span>
            <span v-if="!canEditRebuildItems" class="form-section-tip">（仅查看）</span>
            <span class="form-section-badge">{{ form.items.length }}</span>

          </div>
          <!-- 已添加的项目卡片（可编辑详情） -->
          <div class="rebuild-items-list" v-if="form.items.length > 0">
            <div v-for="(item, idx) in form.items" :key="idx" class="rebuild-item-card">
              <div class="rebuild-item-card__header">
                <span class="rebuild-item-badge">{{ String(idx + 1).padStart(2, '0') }}</span>
                <span class="rebuild-item-name">{{ item.bodyPartName }} / {{ item.projectName }}</span>
                <span class="rebuild-item-hours" v-if="item.projectEstimatedHours">{{ item.projectEstimatedHours
                }}h</span>
                <el-button v-if="canEditRebuildItems" link type="danger" size="small"
                  @click="removeRebuildItem(idx)">删除</el-button>
              </div>
              <div class="rebuild-item-detail-fields">
                <div class="rebuild-field-display">
                  <span class="field-label" v-if="item.projectDesc">项目说明：</span>
                  <span class="field-value">{{ item.projectDesc || '-' }}</span>
                </div>
                <div class="rebuild-field-display">
                  <span class="field-label" v-if="item.formingRequirement">成形需求：</span>
                  <span class="field-value">{{ item.formingRequirement || '-' }}</span>
                </div>
                <div class="rebuild-field-input">
                  <span class="field-label">其他要求：</span>
                  <el-input v-model="item.otherRequirement" placeholder="填写其他要求（可选）" clearable
                    :disabled="!canEditRebuildItems" />
                </div>
              </div>
            </div>
          </div>
          <!-- 添加项目：选完自动加入列表 -->
          <div class="rebuild-add-form" v-if="canEditRebuildItems">
            <div class="rebuild-add-row">
              <div class="body-part-picker-btn" @click="openImageAreaPicker">
                <span class="picker-btn-label">{{ addForm.bodyPartName || '选择部位' }}</span>
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
              <el-select v-model="addForm.categoryCode" placeholder="选择分类" size="default" style="width:130px" clearable
                @change="onAddCategoryChange">
                <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
              <el-select v-model="addForm.projectId" placeholder="选择项目" size="default" style="flex:1" clearable
                filterable :disabled="!addForm.categoryCode || !addForm.bodyPartId" @change="onAddProjectChange">
                <el-option v-for="p in getProjectOptionsForAdd()" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </div>
            <div class="rebuild-add-info-row" v-if="addForm.projectId && addForm.estimatedHours">
              <span class="rebuild-item-label">预计耗时：</span>
              <span>{{ addForm.estimatedHours }}h</span>
            </div>
          </div>
        </section>
      </main>
    </el-form>

    <template #footer-btn>
      <el-button class="btn btn-ghost" @click="visible = false">取消</el-button>
      <el-button class="btn btn-ghost" v-if="!isModifyMode" @click="handleSaveDraft"
        :loading="savingDraft">保存为草稿</el-button>
      <el-button class="btn btn-primary" v-if="!isModifyMode" type="primary" @click="handleSaveAndUpload"
        :loading="saving">
        下一步，上传附件
      </el-button>
      <el-button class="btn btn-primary" v-if="isModifyMode && canEditFiles && (isPhaseOrder || isPhaseDesign || isAdminOrCompanyAdmin)" type="primary"
        @click="handleModifyNext" :loading="saving">
        下一步，修改附件
      </el-button>
      <el-button class="btn btn-primary" v-if="isModifyMode && canEditFiles && (isPhaseOrder || isPhaseDesign || isAdminOrCompanyAdmin)" type="primary" @click="handleSaveModified"
        :loading="saving">
        确认修改
      </el-button>
    </template>
  </dialog-modal>

  <!-- 部位图形选择器 -->
  <imageAreaPicker v-model="imageAreaPickerVisible" title="选择扫描部位"
    :initial-code="addForm.bodyPartId ? String(addForm.bodyPartId) : null" :append-to-body="true"
    @confirm="onBodyPartConfirm" />
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import dialogModal from '@/components/dialogModal.vue'
import { useUserInfo } from '@/stores/userInfo'
import {
  draftSave,
  orderModifyFullV2,
  orderModifyApply,
  type DraftDTO,
  type DraftDetailVO,
  type OrderModifyFullDTO,
  type OrderVO,
} from '@/api/order'
import { orgDetail } from '@/api/org'
import { doctorList, type DoctorVO } from '@/api/doctor'
import { myHospitals, type HospitalOptionVO } from '@/api/hospital'
import { hospitalDeptList } from '@/api/hospitalDept'
import { bodyPartOptions } from '@/api/bodyPart'
import { rebuildProjectByBodyPart, type RebuildProjectVO } from '@/api/rebuildProject'
import imageAreaPicker from '@/components/imageAreaPicker.vue'
import uploadFile from '@/components/uploadFile.vue'
import { getDictOptions, type DictOption } from '@/utils/dict'

// ============================================================
// Props / Emits
// ============================================================
const props = defineProps<{
  modelValue: boolean
  draft?: DraftDetailVO | null
  orderData?: OrderVO | null
  /** 上一步返回时恢复的表单数据（优先级高于 draft / 新建） */
  restoredFormData?: DraftDTO | null
  reCreate?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
  (e: 'saveAndUpload', draftId: number | null, formData: DraftDTO): void
}>()

// ============================================================
// 弹框控制
// ============================================================
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// ============================================================
// 对话框标题
// ============================================================
const isModifyMode = computed(() => !!props.orderData)
const dialogTitle = computed(() => {
  if (isModifyMode.value) return '修改订单'
  return props.draft ? '编辑草稿' : '新建订单'
})
const dialogSubtitle = computed(() => {
  if (isModifyMode.value) return `订单号：${props.orderData?.orderCode || ''}`
  return props.draft ? `草稿 ${props.draft.id}` : ''
})

// ============================================================
// 修改模式 - 可编辑区域判断（由角色 + 订单阶段决定）
// ====================================
// 角色说明：
// - 管理员/企业管理员（admin/company-admin）：可修改全部字段，无需判断阶段
// - 业务员（salesman/salesman-self/regional-manager）：订单阶段直接修改，设计阶段提交申请，其他阶段不允许
// - 设计师/设计师管理员（designer/designer-manager）：订单阶段不允许，设计阶段提交申请，其他阶段不允许
// - 其他角色：不允许修改

const userRoleCode = computed(() => userInfo.userInfos.roleCode || '')

// 管理员/企业管理员
const isAdminOrCompanyAdmin = computed(() => ['admin', 'company-admin'].includes(userRoleCode.value))

// 业务员
const isSalesman = computed(() => ['salesman', 'salesman-self', 'regional-manager'].includes(userRoleCode.value))

// 设计师/设计师管理员
const isDesigner = computed(() => ['designer', 'designer-manager'].includes(userRoleCode.value))

// 订单阶段（phase === 10）
const isPhaseOrder = computed(() => isModifyMode.value && (props.orderData as any)?.phase === 10)
// 设计阶段（phase === 20）
const isPhaseDesign = computed(() => isModifyMode.value && (props.orderData as any)?.phase === 20)

// 管理员/企业管理员：始终可编辑全部字段
const adminCanEditAll = computed(() => isAdminOrCompanyAdmin.value)

// 业务员/设计师：表单是否可编辑（用于禁用整个表单）
const salesmanOrDesignerCanEdit = computed(() => {
  if (!isModifyMode.value) return true
  if (isSalesman.value) {
    // 业务员：订单阶段可编辑，设计阶段可编辑（提交申请），其他阶段不可编辑
    return isPhaseOrder.value || isPhaseDesign.value
  }
  if (isDesigner.value) {
    // 设计师：订单阶段不可编辑，设计阶段可编辑（提交申请），其他阶段不可编辑
    return isPhaseDesign.value
  }
  return false
})

// 业务员/设计师在设计阶段提交修改时，需要走申请流程
const needSubmitModifyApply = computed(() => {
  if (!isModifyMode.value) return false
  if (isSalesman.value) {
    // 业务员在设计阶段需要提交申请
    return isPhaseDesign.value
  }
  if (isDesigner.value) {
    // 设计师在设计阶段需要提交申请
    return isPhaseDesign.value
  }
  return false
})

const canEditBasicInfo = computed(() => {
  if (!isModifyMode.value) return true
  if (isAdminOrCompanyAdmin.value) return true
  return salesmanOrDesignerCanEdit.value
})
const canEditPatientInfo = computed(() => {
  if (!isModifyMode.value) return true
  if (isAdminOrCompanyAdmin.value) return true
  return salesmanOrDesignerCanEdit.value
})
const canEditRebuildItems = computed(() => {
  if (!isModifyMode.value) return true
  if (isAdminOrCompanyAdmin.value) return true
  return salesmanOrDesignerCanEdit.value
})
const canEditFiles = computed(() => {
  if (!isModifyMode.value) return true
  if (isAdminOrCompanyAdmin.value) return true
  return salesmanOrDesignerCanEdit.value
})

const canEditOrderTypeInModify = computed(() => {
  if (!isModifyMode.value) return canEditOrderType.value
  if (isAdminOrCompanyAdmin.value) return true
  return salesmanOrDesignerCanEdit.value && canEditOrderType.value
})
const canEditNeedsPhysicalDelivery = computed(() => {
  if (!isModifyMode.value) return true
  if (isAdminOrCompanyAdmin.value) return true
  return salesmanOrDesignerCanEdit.value
})
const canEditBusinessTypeInModify = computed(() => {
  if (!isModifyMode.value) return true
  if (isAdminOrCompanyAdmin.value) return true
  return salesmanOrDesignerCanEdit.value
})

// 新建订单时订单类型由机构资质决定：
// - qualificationType === 1：可选医疗器械或非医疗器械，允许编辑
// - qualificationType === 2：只能选非医疗器械，不可编辑
const canEditOrderType = computed(() => qualificationType.value === 1)

// 当前机构资质类型：1=医疗器械，2=非医疗器械
const qualificationType = ref<number | null>(null)

// 当前账户是否为经销商（orgType === '1.2'）
const isDealer = ref(false)
// 当前账户是否为服务商（orgType === '1.4'）
const isServiceProvider = ref(false)

// 经销商不允许选择的业务类型值
const DEALER_FORBIDDEN_BUSINESS_TYPES = ['11.1', '11.2']
// 服务商不允许选择的业务类型值
const SERVICE_PROVIDER_FORBIDDEN_BUSINESS_TYPES = ['11.2']

// 过滤后的业务类型选项（经销商/服务商隐藏对应业务类型）
const filteredBusinessTypeOptions = computed(() => {
  let options = businessTypeOptions.value
  if (isDealer.value) {
    options = options.filter(
      (opt) => !DEALER_FORBIDDEN_BUSINESS_TYPES.includes(opt.value)
    )
  }
  if (isServiceProvider.value) {
    options = options.filter(
      (opt) => !SERVICE_PROVIDER_FORBIDDEN_BUSINESS_TYPES.includes(opt.value)
    )
  }
  return options
})

// ============================================================
// 表单数据
// ============================================================
interface OrderItemForm {
  id?: number
  bodyPartId: number
  bodyPartName: string
  projectId: number
  projectName: string
  projectEstimatedHours: number
  categoryCode: string
  categoryName: string
  projectDesc: string
  formingRequirement: string
  otherRequirement: string
  sortOrder?: number
}

interface OrderFormData {
  orderType: number
  needsPhysicalDelivery: number
  businessType?: string
  orgId: number
  orgName?: string
  operatorName?: string
  operatorPhone?: string
  hospitalId?: number
  hospitalName?: string
  hospitalDeptId?: number
  hospitalDeptName?: string
  doctorId?: number
  doctorName?: string
  doctorPhone?: string
  patientName: string
  patientAge?: number
  patientGender?: string
  isUrgent?: number
  isPostal?: number
  postalAddress?: string
  expectedDeliveryDate?: string
  items: OrderItemForm[]
  approvalFileIds?: string[]
}

const userInfo = useUserInfo()

// 修改模式原始数据快照，用于差量比较
const originalOrderData = ref<any>(null)

const getDefaultForm = (): OrderFormData => ({
  orderType: 1,
  needsPhysicalDelivery: 1,
  businessType: undefined,
  orgId: (userInfo.userInfos.orgId as number) || 0,
  operatorName: userInfo.userInfos.username || '',
  operatorPhone: userInfo.userInfos.phone || '',
  hospitalId: undefined,
  hospitalName: '',
  hospitalDeptId: undefined,
  hospitalDeptName: '',
  doctorId: undefined,
  doctorName: '',
  doctorPhone: '',
  patientName: '',
  patientAge: undefined as unknown as number,
  patientGender: '',
  isUrgent: 0,
  isPostal: 0,
  postalAddress: '',
  expectedDeliveryDate: '',
  items: [],
})

const form = reactive<OrderFormData>(getDefaultForm())

// ── 审批文件上传 ──────────────────────────────────────────────
const isTestOrAgent = computed(() => {
  return form.businessType === '11.2' || form.businessType === '11.3'
})

const approvalUploadRef = ref()
const uploadedApprovalFileIds = ref<string[]>([])
// 暂存每次上传响应的完整 data（批量接口返回数组）
const approvalUploadResponses = ref<any[]>([])

const handleApprovalSuccess = (file: any, response: any) => {
  if (Array.isArray(response?.data)) {
    response.data.forEach((item: any) => {
      const fileId = item?.fileId || item?.file_id || item?.id
      if (fileId) uploadedApprovalFileIds.value.push(String(fileId))
    })
    approvalUploadResponses.value.push(response.data)
  } else {
    const fileId = response?.data?.fileId || response?.data?.file_id || response?.data?.id
    if (fileId) uploadedApprovalFileIds.value.push(String(fileId))
  }
}

const handleApprovalRemove = (file: any) => {
  // 从暂存的响应数据中查找并移除对应的 fileId
  const allIds = [...uploadedApprovalFileIds.value]
  const idsToRemove = new Set<string>()

  if (Array.isArray(file.response?.data)) {
    file.response.data.forEach((item: any) => {
      const id = item?.fileId || item?.file_id || item?.id
      if (id) idsToRemove.add(String(id))
    })
  } else {
    const id = file.response?.data?.fileId || file.response?.data?.file_id || file.response?.data?.id
    if (id) idsToRemove.add(String(id))
  }

  uploadedApprovalFileIds.value = allIds.filter(id => !idsToRemove.has(id))
}

// ============================================================
// 表单校验规则
// ============================================================
const orderRules: FormRules = {
  orderType: [{ required: true, message: '请选择订单类型', trigger: 'change' }],
  needsPhysicalDelivery: [{ required: true, message: '请选择是否需要实体交付', trigger: 'change' }],
  businessType: [{ required: true, message: '请选择订单业务类型', trigger: 'change' }],
  hospitalId: [{ required: true, message: '请选择医院', trigger: 'change' }],
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  items: [{
    validator: (_rule: any, value: any, callback: any) => {
      if (!value || value.length === 0) {
        callback(new Error('请至少添加一个重建项目'))
      } else {
        callback()
      }
    },
    trigger: 'change',
  }],
}

// ============================================================
// 添加项目表单
// ============================================================
const addForm = reactive({
  bodyPartId: undefined as number | undefined,
  bodyPartName: '',
  categoryCode: '',
  projectId: undefined as number | undefined,
  projectName: '',
  estimatedHours: 0,
  formingRequirement: '',
  projectDesc: '',
  otherRequirement: '',
  categoryName: '',
  projectOptions: [] as RebuildProjectVO[],
})

const resetAddForm = () => {
  addForm.bodyPartId = undefined
  addForm.bodyPartName = ''
  addForm.categoryCode = ''
  addForm.projectId = undefined
  addForm.projectName = ''
  addForm.estimatedHours = 0
  addForm.formingRequirement = ''
  addForm.projectDesc = ''
  addForm.otherRequirement = ''
  addForm.categoryName = ''
  addForm.projectOptions = []
}

// ── 部位选择器 ──────────────────────────────────────────────
const imageAreaPickerVisible = ref(false)

const openImageAreaPicker = () => {
  imageAreaPickerVisible.value = true
}

const onBodyPartConfirm = (part: { id: number; name: string; code: string }) => {
  imageAreaPickerVisible.value = false
  addForm.bodyPartId = part.id
  addForm.bodyPartName = part.name
  // 重置项目和分类，同时清除旧缓存（防止部位关联的项目变化后缓存未刷新）
  const oldCategory = addForm.categoryCode
  if (oldCategory) {
    delete projectOptionsMap.value[`${oldCategory}-${part.id}`]
  }
  addForm.categoryCode = ''
  addForm.projectId = undefined
  addForm.projectName = ''
  addForm.projectDesc = ''
  addForm.otherRequirement = ''
}

// ── 医生联想 ──────────────────────────────────────────────────────
const doctorSuggestions = ref<DoctorVO[]>([])
const selectedDoctorName = ref('')

const clearDoctorSelection = (clearName = false) => {
  form.doctorId = undefined
  if (clearName) form.doctorName = ''
  form.doctorPhone = ''
  form.hospitalDeptId = undefined
  form.hospitalDeptName = ''
  selectedDoctorName.value = ''
  doctorSuggestions.value = []
}

const onHospitalChange = () => {
  clearDoctorSelection(true)
}

const onDoctorInput = (value: string) => {
  if (form.doctorId != null && value !== selectedDoctorName.value) {
    clearDoctorSelection(false)
    form.doctorName = value
  }
}

const queryDoctorSuggestions = async (query: string): Promise<DoctorVO[]> => {
  if (!form.hospitalId) return []
  if (!query.trim()) return []
  try {
    const res: any = await doctorList({ doctorName: query.trim(), hospitalId: form.hospitalId })
    doctorSuggestions.value = res || []
    return doctorSuggestions.value
  } catch {
    return []
  }
}

const onDoctorSelect = (item: DoctorVO) => {
  selectedDoctorName.value = item.doctorName
  form.doctorName = item.doctorName
  form.doctorPhone = item.doctorPhone || ''
  form.doctorId = item.id
  if (item.hospitalDeptId) {
    form.hospitalDeptId = item.hospitalDeptId
    form.hospitalDeptName = item.hospitalDeptName || ''
  }
}

// ============================================================
// 重建项目操作
// ============================================================
const newOrderItem = (
  bodyPartId: number,
  bodyPartName: string,
  projectId: number,
  projectName: string,
  estimatedHours: number,
  formingReq: string,
  categoryCode = '',
  categoryName = '',
  projectDesc = '',
  otherRequirement = '',
  id?: number,
): OrderItemForm => ({
  bodyPartId,
  bodyPartName,
  projectId,
  projectName,
  projectEstimatedHours: estimatedHours,
  formingRequirement: formingReq,
  categoryCode,
  categoryName,
  projectDesc,
  otherRequirement,
  id,
})

// resetAddForm 清空添加表单（切换项目时用）
const removeRebuildItem = (idx: number) => {
  form.items.splice(idx, 1)
}

const onAddBodyPartChange = (bodyPartId: number) => {
  addForm.bodyPartId = bodyPartId
  const bp = bodyPartOptionsFlat.value.find(b => Number(b.value) === bodyPartId)
  addForm.bodyPartName = bp?.label || ''
  addForm.projectId = undefined
  addForm.projectName = ''
  addForm.estimatedHours = 0
  addForm.formingRequirement = ''
  addForm.projectDesc = ''
  addForm.otherRequirement = ''
  addForm.categoryCode = ''
  addForm.projectOptions = []
}

const onAddCategoryChange = (categoryCode: string) => {
  const cat = categoryOptions.value.find(c => c.value === categoryCode)
  addForm.categoryCode = categoryCode
  addForm.categoryName = cat?.label || ''
  addForm.projectId = undefined
  addForm.projectName = ''
  addForm.projectDesc = ''
  addForm.otherRequirement = ''
  if (categoryCode && addForm.bodyPartId) {
    loadProjects(categoryCode, addForm.bodyPartId)
  }
}

const onAddProjectChange = (projectId: number) => {
  if (!projectId) {
    addForm.projectId = undefined
    addForm.projectName = ''
    addForm.estimatedHours = 0
    addForm.formingRequirement = ''
    addForm.projectDesc = ''
    addForm.otherRequirement = ''
    return
  }
  const key = `${addForm.categoryCode}-${addForm.bodyPartId}`
  const pj = projectOptionsMap.value[key]?.find(p => p.id === projectId)
  if (pj) {
    form.items.push(newOrderItem(
      addForm.bodyPartId as number,
      addForm.bodyPartName,
      pj.id,
      pj.name,
      pj.estimatedHours || 0,
      pj.formingRequirements || '',
      addForm.categoryCode,
      addForm.categoryName,
      pj.description || '',
      '',
    ))
    // 清空添加表单，准备下一个
    addForm.projectId = undefined
    addForm.projectName = ''
    addForm.estimatedHours = 0
    addForm.formingRequirement = ''
    addForm.projectDesc = ''
    addForm.otherRequirement = ''
  }
}

const getProjectOptionsForAdd = (): RebuildProjectVO[] => {
  if (!addForm.categoryCode || !addForm.bodyPartId) return []
  return projectOptionsMap.value[`${addForm.categoryCode}-${addForm.bodyPartId}`] || []
}

// ============================================================
// 字典 & 下拉数据
// ============================================================
const businessTypeOptions = ref<DictOption[]>([])
const genderOptions = ref<{ label: string; value: string }[]>([
  { label: '男', value: '12.1' },
  { label: '女', value: '12.2' },
])
const hospitalOptions = ref<HospitalOptionVO[]>([])
const deptOptions = ref<any[]>([])
const bodyPartOptionsFlat = ref<DictOption[]>([])
const categoryOptions = ref<DictOption[]>([])
const projectOptionsMap = ref<Record<string, RebuildProjectVO[]>>({})

// ============================================================
// 数据加载
// ============================================================
const loadDictData = async () => {
  const [bizType, bodyParts, categories] = await Promise.all([
    getDictOptions('11'),
    bodyPartOptions(),
    getDictOptions('13'),
  ])
  businessTypeOptions.value = bizType
  categoryOptions.value = categories
  bodyPartOptionsFlat.value = (bodyParts || []).map(bp => ({
    label: bp.name,
    value: String(bp.id),
    id: bp.id,
  }))
}

const loadHospitals = async () => {
  try {
    const res: any = await myHospitals()
    hospitalOptions.value = (res?.data || res || []) as HospitalOptionVO[]
  } catch {
    hospitalOptions.value = []
  }
}

const loadDeptOptions = async () => {
  try {
    const res: any = await hospitalDeptList({ status: 1 })
    deptOptions.value = (res?.data || res || []).filter((d: any) => d.status === 1)
  } catch {
    deptOptions.value = []
  }
}

const loadProjects = async (categoryCode: string, bodyPartId: number) => {
  const key = `${categoryCode}-${bodyPartId}`
  if (projectOptionsMap.value[key]) {
    // 缓存存在但强制刷新（应对后端新增了项目的情况）
    delete projectOptionsMap.value[key]
  }
  try {
    const res = await rebuildProjectByBodyPart(bodyPartId, categoryCode)
    projectOptionsMap.value[key] = res || []
  } catch {
    projectOptionsMap.value[key] = []
  }
}

const onPostalChange = (val: number) => {
  if (val === 0) {
    form.postalAddress = ''
  }
}

// 异地打印(2)等同于否(0)，传给后端时需要转换
const onNeedsPhysicalDeliveryChange = (val: number) => {
  // 仅本地记录用户选择的值，提交时会在 buildSubmitData/buildModifyFullPayload 中转换
}

// ============================================================
// 保存逻辑
// ============================================================
const savingDraft = ref(false)
const saving = ref(false)

const buildSubmitData = (): DraftDTO => {
  const hospital = hospitalOptions.value.find(h => h.id === form.hospitalId)
  if (hospital) {
    form.hospitalName = hospital.orgName || ''
  }
  const dept = deptOptions.value.find(d => d.id === form.hospitalDeptId)
  if (dept) {
    form.hospitalDeptName = dept.hospitalDeptName
  }
  const copy = JSON.parse(JSON.stringify(form)) as DraftDTO
  copy.approvalFileIds = uploadedApprovalFileIds.value
  return copy
}

const handleSaveDraft = async () => {
  if (!(await validateForm())) return
  try {
    savingDraft.value = true
    const data = buildSubmitData()
    await draftSave(data)
    emit('success')
    ElMessage.success('保存草稿成功')
    emit('update:modelValue', false)
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    savingDraft.value = false
  }
}

// ── 保存并上传附件 ─────────────────────────────────────────────
const handleSaveAndUpload = async () => {
  if (!(await validateForm())) return
  saving.value = true
  const data = buildSubmitData()
  // 暂存数据不调用接口，等附件上传完后再一起提交
  console.log(data, 'data')
  emit('saveAndUpload', null, data)
  emit('update:modelValue', false)
  saving.value = false
}

const validateModifyForm = (): boolean => {
  if (form.items.length === 0) {
    ElMessage.warning('请至少添加一个重建项目')
    return false
  }
  return true
}

const buildModifyFullPayload = (): OrderModifyFullDTO => {
  const order = props.orderData!
  console.log(order.imageDataFiles)
  return {
    orderType: form.orderType,
    needsPhysicalDelivery: form.needsPhysicalDelivery,
    businessType: form.businessType,
    hospitalId: form.hospitalId,
    hospitalDeptId: form.hospitalDeptId,
    doctorId: form.doctorId,
    doctorName: form.doctorName,
    doctorPhone: form.doctorPhone,
    patientName: form.patientName,
    patientAge: form.patientAge,
    patientGender: form.patientGender,
    isUrgent: form.isUrgent,
    isPostal: form.isPostal,
    postalAddress: form.postalAddress,
    expectedDeliveryDate: form.expectedDeliveryDate,
    items: form.items.map(item => ({
      id: item.id,
      bodyPartId: item.bodyPartId,
      bodyPartName: item.bodyPartName,
      projectId: item.projectId,
      projectName: item.projectName,
      projectDesc: item.projectDesc,
      formingRequirement: item.formingRequirement,
      otherRequirement: item.otherRequirement,
    })),
    approvalFileIds: uploadedApprovalFileIds.value,
    // 以下字段从 props.orderData 获取
    orgId: order.orgId,
    orderCode: order.orderCode,
    operatorId: order.operatorId,
    designerId: order.designerId,
    phase: order.phase,
    status: order.status,
    estimatedCost: order.estimatedCost,
    version: order.version,
    imageDataFileIds: (order.imageDataFiles || []).map(f => String(f.fileId)),
    imageReportFileIds: (order.imageReportFiles || []).map(f => String(f.fileId)),
  }
}

const handleSaveModified = async () => {
  if (!validateModifyForm()) return
  if (!props.orderData) return

  // 管理员/企业管理员：直接调用 orderModifyFullV2
  if (isAdminOrCompanyAdmin.value) {
    saving.value = true
    try {
      await orderModifyFullV2(props.orderData.id, buildModifyFullPayload())
      ElMessage.success('修改成功')
      emit('success')
      emit('update:modelValue', false)
    } catch {
    } finally {
      saving.value = false
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
    saving.value = true
    try {
      await orderModifyApply(props.orderData.id, buildModifyFullPayload())
      ElMessage.success('已提交修改申请')
      emit('success')
      emit('update:modelValue', false)
    } catch {
    } finally {
      saving.value = false
    }
    return
  }

  // 业务员在订单阶段：调用 orderModifyFullV2，超时时提示提交申请
  saving.value = true
  try {
    const res = await orderModifyFullV2(props.orderData.id, buildModifyFullPayload())
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
      await orderModifyApply(props.orderData.id, buildModifyFullPayload())
      ElMessage.success('已提交至设计部门确认')
      emit('success')
      emit('update:modelValue', false)
      return
    }
    ElMessage.success('修改成功')
    emit('success')
    emit('update:modelValue', false)
  } catch {
  } finally {
    saving.value = false
  }
}

const handleModifyNext = async () => {
  if (!validateModifyForm()) return
  if (!props.orderData) return
  saving.value = true
  try {
    emit('saveAndUpload', props.orderData.id, buildModifyFullPayload() as any)
    emit('update:modelValue', false)
  } finally {
    saving.value = false
  }
}

// ============================================================
// 校验
// ============================================================
const orderFormRef = ref<FormInstance>()

const validateForm = async (): Promise<boolean> => {
  if (isModifyMode.value) return validateModifyForm()
  if (!orderFormRef.value) return false
  const valid = await orderFormRef.value.validate().catch(() => false)
  if (!valid) return false
  if (isTestOrAgent.value && uploadedApprovalFileIds.value.length === 0) {
    ElMessage.warning('请上传审批文件')
    return false
  }
  return true
}

// ============================================================
// 表单初始化
// ============================================================
const initFormFromDraft = (draft: DraftDetailVO) => {
  Object.assign(form, getDefaultForm(), {
    ...draft,
    hospitalDeptId: draft.hospitalDeptId ?? undefined,
    hospitalName: draft.hospitalName || '',
    hospitalDeptName: draft.hospitalDeptName || '',
    doctorName: draft.doctorName || '',
    doctorPhone: draft.doctorPhone || '',
    postalAddress: draft.postalAddress || '',
    expectedDeliveryDate: draft.expectedDeliveryDate || '',
  })
  selectedDoctorName.value = form.doctorId != null ? form.doctorName || '' : ''
  form.items = (draft.items || []).map(item =>
    newOrderItem(
      item.bodyPartId,
      item.bodyPartName,
      item.projectId,
      item.projectName,
      item.projectEstimatedHours,
      item.formingRequirement,
      item.categoryCode,
      item.categoryName,
      item.projectDesc,
      item.otherRequirement,
      item.id,
    )
  )

  // 回显审批文件
  const approvalFiles: any[] = (draft as any).approvalFiles || []
  uploadedApprovalFileIds.value = approvalFiles.map(f => String(f.fileId))
  nextTick(() => {
    const initialFiles = approvalFiles.map((f: any) => ({
      name: f.fileName || 'file',
      url: f.fileUrl || '',
      fileId: f.fileId,
    }))
    approvalUploadRef.value?.setInitialFiles(initialFiles)
  })
}

const initFormFromDraftDTO = (data: DraftDTO) => {
  const raw = data as any
  const deptId = raw.hospitalDeptId ?? raw.deptId
  Object.assign(form, getDefaultForm(), {
    ...data,
    hospitalId: raw.hospitalId != null ? Number(raw.hospitalId) : undefined,
    hospitalDeptId: deptId != null ? Number(deptId) : undefined,
    hospitalDeptName: raw.hospitalDeptName ?? raw.deptName ?? '',
    hospitalName: raw.hospitalName || '',
    doctorName: data.doctorName || '',
    doctorPhone: data.doctorPhone || '',
    postalAddress: data.postalAddress || '',
    expectedDeliveryDate: data.expectedDeliveryDate || '',
    isUrgent: data.isUrgent ?? 0,
    isPostal: data.isPostal ?? 0,
  })
  selectedDoctorName.value = form.doctorId != null ? form.doctorName || '' : ''
  form.items = (data.items || []).map(item => {
    const it = item as any
    return newOrderItem(
      item.bodyPartId ?? 0,
      item.bodyPartName || '',
      item.projectId ?? 0,
      item.projectName || '',
      item.projectEstimatedHours ?? 0,
      item.formingRequirement || '',
      it.categoryCode || '',
      it.categoryName || '',
      item.projectDesc || '',
      item.otherRequirement || '',
      it.id,
    )
  })
}

// 修改模式：从订单详情初始化
const initFormFromOrder = (order: any) => {
  const deptId = order.hospitalDeptId ?? order.deptId
  Object.assign(form, getDefaultForm(), {
    ...order,
    hospitalDeptId: deptId != null ? Number(deptId) : undefined,
    hospitalDeptName: order.hospitalDeptName ?? order.deptName ?? '',
    hospitalId: order.hospitalId != null ? Number(order.hospitalId) : undefined,
    hospitalName: order.hospitalName || '',
    doctorId: order.doctorId ?? undefined,
    doctorName: order.doctorName || '',
    doctorPhone: order.doctorPhone || '',
    postalAddress: order.postalAddress || '',
    expectedDeliveryDate: order.expectedDeliveryDate || '',
  })
  selectedDoctorName.value = form.doctorId != null ? form.doctorName || '' : ''
  form.items = ((order.items as any) || []).map((item: any) =>
    newOrderItem(
      item.bodyPartId,
      item.bodyPartName,
      item.projectId,
      item.projectName,
      item.projectEstimatedHours,
      item.formingRequirement,
      item.categoryCode,
      item.categoryName,
      item.projectDesc,
      item.otherRequirement,
      item.id,
    )
  )

  // 回显审批文件
  const approvalFiles: any[] = order.approvalFiles || []
  uploadedApprovalFileIds.value = approvalFiles.map(f => String(f.fileId))
  nextTick(() => {
    const initialFiles = approvalFiles.map((f: any) => ({
      name: f.fileName || 'file',
      url: f.fileUrl || '',
      fileId: f.fileId,
    }))
    approvalUploadRef.value?.setInitialFiles(initialFiles)
  })

  // 科室已通过 loadDeptOptions() 在弹框打开时统一加载，无需单独请求
}

const resetForm = () => {
  Object.assign(form, getDefaultForm())
  selectedDoctorName.value = ''
  originalOrderData.value = null
  deptOptions.value = []
  resetAddForm()
  isDealer.value = false
  isServiceProvider.value = false
}

// ============================================================
// 监听
// ============================================================
watch(visible, async (val) => {
  if (val) {
    if (props.restoredFormData && !props.reCreate) {
      // 上一步返回：直接用恢复的数据，不走新建/草稿逻辑
      initFormFromDraftDTO(props.restoredFormData)
      await Promise.all([loadDictData(), loadHospitals(), loadDeptOptions()])
    } else if(props.restoredFormData && props.reCreate){
      await Promise.all([loadDictData(), loadHospitals(), loadDeptOptions()])
      qualificationType.value = props.restoredFormData.orderType ?? null
      initFormFromOrder(props.restoredFormData)
    } else if (isModifyMode.value && props.orderData) {
      // 修改模式：先加载字典和医院，再初始化表单
      await Promise.all([loadDictData(), loadHospitals(), loadDeptOptions()])
      qualificationType.value = props.orderData.orderType ?? null
      initFormFromOrder(props.orderData)
    } else if (props.draft) {
      await Promise.all([loadDictData(), loadHospitals(), loadDeptOptions()])
      qualificationType.value = props.draft.orderType ?? null
      initFormFromDraft(props.draft)
    } else {
      resetForm()
      await Promise.all([loadDictData(), loadHospitals(), loadDeptOptions()])
      // 根据机构资质类型自动设置订单类型
      const orgId = userInfo.userInfos.orgId as number
      if (orgId) {
        try {
          const orgRes = await orgDetail(orgId) as any
          qualificationType.value = orgRes?.qualificationType ?? null
          isDealer.value = orgRes?.orgType === '1.2'
          isServiceProvider.value = orgRes?.orgType === '1.4'
          if (qualificationType.value === 1 || qualificationType.value === 2) {
            form.orderType = qualificationType.value
          }
        } catch {
          // ignore
        }
      }
    }
  }
})

// ============================================================
// 期望交付时间 - 最早时间限制（当前时间 + 2小时）
// ============================================================
const minDeliveryDateTime = computed(() => {
  const now = new Date()
  return new Date(now.getTime() + 2 * 60 * 60 * 1000)  // 保留完整的时分秒
})

const minDeliveryDate = computed(() => {
  return new Date(
    minDeliveryDateTime.value.getFullYear(),
    minDeliveryDateTime.value.getMonth(),
    minDeliveryDateTime.value.getDate()
  )
})

const disabledHours = computed(() => {
  return () => {
    const selectedDate = form.expectedDeliveryDate ? new Date(form.expectedDeliveryDate) : null
    if (!selectedDate) return []

    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    const minDay = minDeliveryDate.value

    // 如果选择的日期大于最早日期，则不禁用任何小时
    if (selectedDay.getTime() > minDay.getTime()) return []

    // 如果选择的是最早日期，禁用 0 到 minHour-1 小时
    const minHour = minDeliveryDateTime.value.getHours()
    const disabled: number[] = []
    for (let i = 0; i < minHour; i++) {
      disabled.push(i)
    }
    return disabled
  }
})

const disabledMinutes = computed(() => {
  return (hour: number) => {
    const selectedDate = form.expectedDeliveryDate ? new Date(form.expectedDeliveryDate) : null
    if (!selectedDate) return []

    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    const minDay = minDeliveryDate.value
    const minHour = minDeliveryDateTime.value.getHours()
    const minMinute = minDeliveryDateTime.value.getMinutes()

    // 如果选择的日期大于最早日期，则不禁用任何分钟
    if (selectedDay.getTime() > minDay.getTime()) return []

    // 如果选择的日期小于最早日期，禁用所有分钟
    if (selectedDay.getTime() < minDay.getTime()) {
      const disabled: number[] = []
      for (let i = 0; i < 60; i++) {
        disabled.push(i)
      }
      return disabled
    }

    // 如果选择的是最早日期的同一小时，禁用 0 到 minMinute-1 分钟
    if (hour === minHour) {
      const disabled: number[] = []
      for (let i = 0; i < minMinute; i++) {
        disabled.push(i)
      }
      return disabled
    }

    return []
  }
})

const disabledSeconds = computed(() => {
  return (hour: number, minute: number) => {
    const selectedDate = form.expectedDeliveryDate ? new Date(form.expectedDeliveryDate) : null
    if (!selectedDate) return []

    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    const minDay = minDeliveryDate.value
    const minHour = minDeliveryDateTime.value.getHours()
    const minMinute = minDeliveryDateTime.value.getMinutes()
    const minSecond = minDeliveryDateTime.value.getSeconds()

    // 如果选择的日期大于最早日期，则不禁用任何秒
    if (selectedDay.getTime() > minDay.getTime()) return []

    // 如果选择的日期小于最早日期，禁用所有秒
    if (selectedDay.getTime() < minDay.getTime()) {
      const disabled: number[] = []
      for (let i = 0; i < 60; i++) {
        disabled.push(i)
      }
      return disabled
    }

    // 如果选择的是最早日期的同一小时和分钟，禁用 0 到 minSecond-1 秒
    if (hour === minHour && minute === minMinute) {
      const disabled: number[] = []
      for (let i = 0; i < minSecond; i++) {
        disabled.push(i)
      }
      return disabled
    }

    return []
  }
})

// 监听日期变化，自动调整时间到有效范围
const formatDateStr = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

watch(() => form.expectedDeliveryDate, (newVal) => {
  if (!newVal) return
  const selectedDate = new Date(newVal)
  const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
  const minDay = minDeliveryDate.value
  const minDateTime = minDeliveryDateTime.value

  // 如果选择的日期是禁止的日期，将时间调整为最早时间
  if (selectedDay.getTime() < minDay.getTime()) {
    form.expectedDeliveryDate = formatDateStr(minDateTime)
  } else if (selectedDay.getTime() === minDay.getTime()) {
    // 如果是允许的最早日期，检查时间是否有效
    const isInvalid =
      selectedDate.getHours() < minDateTime.getHours() ||
      (selectedDate.getHours() === minDateTime.getHours() && selectedDate.getMinutes() < minDateTime.getMinutes()) ||
      (selectedDate.getHours() === minDateTime.getHours() && selectedDate.getMinutes() === minDateTime.getMinutes() && selectedDate.getSeconds() < minDateTime.getSeconds())

    if (isInvalid) {
      form.expectedDeliveryDate = formatDateStr(minDateTime)
    }
  }
})

</script>

<style scoped lang="scss">
@use '@/assets/style/dialogLeftRight.scss' as *;

.form-section--disabled {
  opacity: 0.65;
}

// rebuild section
// ============================================================
.rebuild-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.rebuild-item-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: #0891b2;
    box-shadow: 0 4px 16px rgba(8, 145, 178, 0.1);
    transform: translateY(-1px);
  }
}

.rebuild-item-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #ecfeff, #e0f2fe);
  border-bottom: 1px solid #e2e8f0;
}

.rebuild-item-badge {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: #0891b2;
  background: rgba(8, 145, 178, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.rebuild-item-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rebuild-item-hours {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
}

.rebuild-item-form-row {
  padding: 8px 14px;
  font-size: 12px;
  color: #64748b;
  background: #fafbfd;
}

.rebuild-item-detail-fields {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rebuild-field-display {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.rebuild-field-input {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.rebuild-field-display .field-label {
  color: #94a3b8;
  font-weight: 600;
  flex-shrink: 0;
}

.rebuild-field-input .field-label {
  color: #94a3b8;
  font-weight: 600;
  flex-shrink: 0;
  line-height: 32px;
}

.rebuild-field-display .field-value {
  color: #475569;
  word-break: break-all;
}

.rebuild-item-label {
  color: #94a3b8;
  font-weight: 600;
}

// 空状态
.rebuild-items-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  margin-bottom: 16px;
}

.rebuild-items-empty__icon {
  font-size: 28px;
  color: #cbd5e1;
}

.rebuild-items-empty__text {
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
}

// 添加表单
.rebuild-add-form {
  background: #ffffff;
  border: 1px solid #e8ecf2;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
}

.rebuild-add-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.body-part-picker-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 32px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 130px;

  .picker-btn-label {
    font-size: 13px;
    color: #374151;
    flex: 1;
  }

  .el-icon {
    color: #9ca3af;
    font-size: 14px;
    transition: transform 0.2s;
  }

  &:hover {
    border-color: #0891b2;
    background: #f0f9ff;

    .picker-btn-label {
      color: #0891b2;
    }

    .el-icon {
      color: #0891b2;
      transform: translateX(2px);
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.rebuild-add-detail {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

// 医生联想下拉项
.doctor-suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.doctor-suggestion-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.doctor-suggestion-dept {
  font-size: 12px;
  color: #94a3b8;
}

.doctor-suggestion-phone {
  font-size: 12px;
  color: #64748b;
  margin-left: auto;
}
</style>
