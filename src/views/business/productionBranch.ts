import type { ProductionType } from '@/api/design'

interface ProductionPackage {
  orderId?: number
  productionType?: ProductionType | 3 | null
  batchId?: number | null
  batchStatus?: string | null
  editable?: boolean
  canEditPrintInfo?: boolean
  canEditDocuments?: boolean
}

export interface ProductionOrder {
  id: number
  orderCode: string
  orderType: number
  needsPhysicalDelivery: number | null
  status: number
  hasUnassignedPackage?: boolean
  productionTypes?: (ProductionType | 3)[]
  medicalPackageAllowed?: boolean
  packageList?: ProductionPackage[]
}

type OrderKind = Pick<ProductionOrder, 'orderType' | 'needsPhysicalDelivery'>

export function isLocalPhysical(order: OrderKind) {
  return order.needsPhysicalDelivery == null || order.needsPhysicalDelivery === 1
}

export const productionTypeNames = { 1: '医疗器械', 2: '非医疗器械' } as const

export function packageProductionType(order: OrderKind, pkg?: Pick<ProductionPackage, 'productionType'>): ProductionType | null {
  if (!isLocalPhysical(order)) return null
  const type = pkg?.productionType
  return type === 1 || type === 2 ? type : null
}

export function usesProcessingApplication(order: OrderKind, pkg?: Pick<ProductionPackage, 'productionType'>) {
  return packageProductionType(order, pkg) === 2
}

type RouteOrder = OrderKind & Pick<ProductionOrder, 'productionTypes' | 'medicalPackageAllowed' | 'hasUnassignedPackage'>

function allowsUnassigned(order: RouteOrder, type: ProductionType, hasMedical: boolean) {
  return (order.orderType === 1 && order.medicalPackageAllowed === true) || (type === 2 && !hasMedical)
}

export function packagesForProduction<T extends ProductionPackage>(order: RouteOrder & { id?: number }, packages: T[], type: ProductionType): T[] {
  const own = packages.filter(pkg => order.id == null || pkg.orderId == null || pkg.orderId === order.id)
  if (!isLocalPhysical(order)) return type === 1 ? own : []
  if (type === 1 && order.orderType !== 1) return []
  const hasMedical = order.productionTypes?.some(t => t === 1 || t === 3)
    || own.some(pkg => pkg.batchStatus !== 'CANCELLED' && (pkg.batchId == null || pkg.batchStatus != null)
      && (pkg.productionType === 1 || pkg.productionType === 3))
  return own.filter(pkg => pkg.productionType === type || (pkg.productionType == null
    && pkg.batchStatus !== 'CANCELLED' && allowsUnassigned(order, type, hasMedical)))
}

export function initialProductionPackage<T extends ProductionPackage & { id: number }>(
  packages: T[], batchId: number | null, initialId: number | null | undefined, isPending: (pkg: T) => boolean,
): T | undefined {
  const current = packages.filter(pkg => (pkg.batchId ?? null) === batchId)
  if (initialId != null) return current.find(pkg => pkg.id === initialId)
  const pendingOriginal = () => packages.find(pkg => pkg.batchId == null && packageEditable(pkg, batchId, 'editable') && isPending(pkg))
  return current.find(isPending) ?? pendingOriginal() ?? current[0] ?? packages[0]
}

export function processingAction(status: number, canEdit: boolean, canView: boolean) {
  if (status === 2020 && canEdit) return 'edit'
  if (status >= 2020 && canView) return 'view'
  return null
}

export const appendDesignStatuses = new Set([2020, 2030, 3010, 3020, 3030, 3040, 4010, 5010, 5020, 5030, 5040, 5050, 6010, 6020, 6030, 8010])

type ProductionLeaf = { command: 'processing' | 'printInfo' | 'printInfoView'; label: string }
interface ProductionGroup {
  title: string
  actions: ProductionLeaf[]
}
export interface ProductionSubmenu {
  title: string
  groups: ProductionGroup[]
}
export type ProductionBatch = { batchId: number; status: string }
type MenuOrder = Pick<ProductionOrder, 'orderType' | 'needsPhysicalDelivery' | 'status' | 'packageList' | 'productionTypes' | 'medicalPackageAllowed' | 'hasUnassignedPackage'>

export const isOpenBatch = (batch: { status: string }) => !['CANCELLED', 'COMPLETED'].includes(batch.status)

export function productionTypesForOrder(row: MenuOrder): ProductionType[] {
  if (!isLocalPhysical(row)) return []
  const active = row.packageList?.filter(pkg => pkg.batchStatus !== 'CANCELLED' && (pkg.batchId == null || pkg.batchStatus != null))
  const types = active?.length ? active.map(pkg => pkg.productionType) : row.productionTypes ?? []
  const unassigned = active?.some(pkg => pkg.productionType == null) || row.hasUnassignedPackage === true
  const candidates: ProductionType[] = row.orderType === 1 ? [1, 2] : [2]
  return candidates.filter(type => types.includes(type) || (unassigned
    && allowsUnassigned(row, type, types.includes(1) || types.includes(3))))

}

export function packageEditable(pkg: ProductionPackage, batchId: number | null, capability: 'editable' | 'canEditPrintInfo' | 'canEditDocuments') {
  const inScope = (pkg.batchId ?? null) === batchId
    || (pkg.batchId == null && pkg.editable === true && pkg[capability] === true)
  return inScope && pkg.editable !== false && pkg[capability] !== false
    && (!pkg.batchStatus || isOpenBatch({ status: pkg.batchStatus }))
}

function canEditPackages(row: MenuOrder, type: ProductionType, capability: 'editable' | 'canEditPrintInfo' | 'canEditDocuments', batch?: ProductionBatch | null) {
  const designStage = row.status === 1030 || row.status === 2020
  if (batch && !isOpenBatch(batch)) return false
  if (!designStage && batch === null) return false
  if (!row.packageList?.length) return designStage || !!batch
  return packagesForProduction(row, row.packageList, type).some(pkg => {
    if (!packageEditable(pkg, batch === undefined ? pkg.batchId ?? null : batch?.batchId ?? null, capability)) return false
    if (batch) return true
    return designStage || (pkg.batchId != null && (pkg[capability] === true || !!pkg.batchStatus))
  })
}

export function productionMenu(
  row: MenuOrder,
  hasPermission: (permission: string) => boolean,
  batch?: ProductionBatch | null,
) {
  const types = productionTypesForOrder(row)
  const groups: ProductionGroup[] = []
  const medical: ProductionLeaf[] = []
  let editable = false
  if ((!isLocalPhysical(row) || types.includes(1)) && (row.status === 1030 || appendDesignStatuses.has(row.status))) {
    if (hasPermission('design:PrintInfo')) {
      editable = canEditPackages(row, 1, 'canEditPrintInfo', batch)
      medical.push({ command: 'printInfo', label: editable ? '填写打印信息' : '查看打印信息' })
    }
    if (hasPermission('design:DocumentPreview')) {
      editable ||= canEditPackages(row, 1, 'canEditDocuments', batch)
      medical.push({ command: 'printInfoView', label: '指令单和图纸' })
    }
    if (medical.length) {
      const title = isLocalPhysical(row) ? productionTypeNames[1] : row.needsPhysicalDelivery === 2 ? '异地打印' : '非实体交付'
      groups.push({ title, actions: medical })
    }
  }
  if (types.includes(2)) {
    const mode = processingAction(row.status, hasPermission('design:ProcessingApplicationEdit') && canEditPackages(row, 2, 'editable', batch),
      hasPermission('design:ProcessingApplicationView'))
    if (mode) {
      editable ||= mode === 'edit'
      groups.push({ title: productionTypeNames[2], actions: [{ command: 'processing', label: '加工申请单' }] })
    }
  }
  const title = groups.length > 1 ? '生产信息' : groups[0]?.title ?? null
  return { title, label: editable ? '填写生产信息' : '查看生产信息', groups, actions: groups.flatMap(group => group.actions) }
}
