export interface ProductionOrder {
  id: number
  orderCode: string
  orderType: number
  needsPhysicalDelivery: number | null
  status: number
}

export function usesProcessingApplication(order: { orderType: number; needsPhysicalDelivery: number | null }) {
  return order.orderType === 2 && (order.needsPhysicalDelivery == null || order.needsPhysicalDelivery === 1)
}

export function processingAction(status: number, canEdit: boolean, canView: boolean) {
  if (status === 2020 && canEdit) return 'edit'
  if (status >= 2020 && canView) return 'view'
  return null
}
