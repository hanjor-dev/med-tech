export const STATUS_CONFIG: Record<number, { label: string; bg: string; color: string }> = {
  2030: { label: '设计完成', bg: '#e0e7ff', color: '#4338ca' },
  2050: { label: '设计审核通过', bg: '#e0e7ff', color: '#4338ca' },
  3010: { label: '待打印',       bg: '#fef9c3', color: '#854d0e' },
  3020: { label: '打印中',       bg: '#dbeafe', color: '#1d4ed8' },
  3030: { label: '打印完成',     bg: '#d1fae5', color: '#065f46' },
  3040: { label: '打印失败',     bg: '#fee2e2', color: '#991b1b' },
  4010: { label: '后处理中',     bg: '#ffedd5', color: '#9a3412' },
  5010: { label: '质检中',       bg: '#f3e8ff', color: '#6b21a8' },
  5050: { label: '包装中',       bg: '#fce7f3', color: '#9d174d' },
  6010: { label: '待入库',       bg: '#cffafe', color: '#155e75' },
  6020: { label: '已入库',       bg: '#d1fae5', color: '#065f46' },
  6030: { label: '已出库',       bg: '#e0e7ff', color: '#3730a3' },
  8010: { label: '已完成',       bg: '#dcfce7', color: '#14532d' },
  9010: { label: '已取消',       bg: '#f1f5f9', color: '#475569' },
}

export interface StatusColor {
  bgColor?: string
  bdColor?: string
  color?: string
}

export const statusLabel = (s: number) => STATUS_CONFIG[s]?.label ?? String(s)
export const statusStyle = (s: number, statusColor?: StatusColor | null) => {
  if (statusColor && (statusColor.bgColor || statusColor.color)) {
    return {
      background: statusColor.bgColor,
      color: statusColor.color,
      borderColor: statusColor.bdColor || statusColor.bgColor,
    }
  }
  const c = STATUS_CONFIG[s]
  return c ? { background: c.bg, color: c.color, borderColor: c.bg } : {}
}
