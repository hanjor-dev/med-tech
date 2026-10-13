
export interface ModifyFieldDef {
  field: string
  label: string
  type: string
  required?: boolean
  group?: string
  options?: { value: string; label: string }[]
  subFields?: ModifyFieldDef[]
}

export interface ModifyFieldGroup {
  name: string
  fields: ModifyFieldDef[]
}

export type ModifyFieldConfigMap = Record<string, ModifyFieldGroup>

const BASIC_FIELDS = new Set([
  'hospitalId',
  'hospitalDeptId',
  'doctorId',
  'doctorName',
  'doctorPhone',
  'isUrgent',
  'isPostal',
  'postalAddress',
  'expectedDeliveryDate',
])

const PATIENT_FIELDS = new Set(['patientName', 'patientAge', 'patientGender'])

const FILE_FIELDS = new Set(['imageDataFileIds', 'imageReportFileIds'])

export function parseModifyFieldConfig(configValue: unknown): ModifyFieldConfigMap | null {
  if (!configValue) return null
  try {
    const raw = typeof configValue === 'string' ? JSON.parse(configValue) : configValue
    if (!raw || typeof raw !== 'object') return null
    return raw as ModifyFieldConfigMap
  } catch {
    return null
  }
}

export function getEditableFieldSet(config: ModifyFieldConfigMap | null): Set<string> {
  const set = new Set<string>()
  if (!config) return set
  for (const group of Object.values(config)) {
    for (const f of group.fields || []) {
      set.add(f.field)
    }
  }
  return set
}

export function getFieldDefMap(config: ModifyFieldConfigMap | null): Map<string, ModifyFieldDef> {
  const map = new Map<string, ModifyFieldDef>()
  if (!config) return map
  for (const group of Object.values(config)) {
    for (const f of group.fields || []) {
      map.set(f.field, f)
    }
  }
  return map
}

export function isFieldRequired(config: ModifyFieldConfigMap | null, field: string): boolean {
  return getFieldDefMap(config).get(field)?.required === true
}

export function hasEditableBasicFields(set: Set<string>): boolean {
  return [...BASIC_FIELDS].some((f) => set.has(f))
}

export function hasEditablePatientFields(set: Set<string>): boolean {
  return [...PATIENT_FIELDS].some((f) => set.has(f))
}

export function hasEditableItems(set: Set<string>): boolean {
  return set.has('items')
}

export function hasEditableFiles(set: Set<string>): boolean {
  return [...FILE_FIELDS].some((f) => set.has(f))
}

export function canEditImageData(set: Set<string>): boolean {
  return set.has('imageDataFileIds')
}

export function canEditImageReport(set: Set<string>): boolean {
  return set.has('imageReportFileIds')
}

/** 是否仅允许修改影像文件（跳过表单弹窗，直接进入上传） */
export function hasOnlyFileFields(set: Set<string>): boolean {
  if (set.size === 0) return false
  return [...set].every((f) => FILE_FIELDS.has(f))
}

export function orderToModifyFormData(order: Record<string, any>): Record<string, any> {
  return {
    ...order,
    hospitalDeptId: order.deptId ?? order.hospitalDeptId,
    hospitalDeptName: order.deptName ?? order.hospitalDeptName ?? '',
    hospitalName: order.hospitalName || '',
    doctorName: order.doctorName || '',
    doctorPhone: order.doctorPhone || '',
    postalAddress: order.postalAddress || '',
    expectedDeliveryDate: order.expectedDeliveryDate || '',
    items: order.items || [],
  }
}
