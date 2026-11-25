import http from '@/utils/http'

export const fields = {
  area: '区域',
  org: '机构',
  hospital: '医院',
  hospitalDept: '医院科室',
  doctor: '医生',
  operatorDept: '业务部门',
  orderType: '医疗器械分类',
  businessType: '业务类型',
  isUrgent: '急单属性',
  needsPhysicalDelivery: '实体交付需求',
  project: '项目',
  bodyPart: '部位',
} as const
export type Dimension = keyof typeof fields
export const filterKey = (d: Dimension) =>
  ['orderType', 'businessType', 'isUrgent', 'needsPhysicalDelivery'].includes(d)
    ? d
    : d + 'Id'
export type Query = Record<string, string | number | boolean>
export type Period = 'current' | 'previous'
export interface Option {
  key: string
  name: string
}
export interface Metric {
  current: number | null
  previous: number | null
  delta: number | null
}
export interface Overview {
  currentStart: string
  currentEnd: string
  previousStart: string
  previousEnd: string
  orders: Metric
  hospitals: Metric
  doctors: Metric
  urgent: Metric
  urgentRate: Metric
}
export interface Bucket {
  startDate: string
  endDate: string
  count: number
}
export interface Trend {
  current: Bucket[]
  previous: Bucket[]
}
export interface Group extends Option {
  current: number
  previous: number
  delta: number
  share?: number | null
}
export interface ItemGroup extends Group {
  currentLines: number
  previousLines: number
  deltaLines: number
}
export type Structure = Partial<
  Record<Dimension, (Option & { count: number; share?: number | null })[]>
>
export interface Order {
  id: string
  orderCode: string
  orderTime: string
  hospitalName?: string | null
  hospitalDeptName?: string | null
  doctorName?: string | null
  orderType?: number | null
  isUrgent?: number | null
}
export interface Page<T> {
  records: T[]
  total: number
}
type Validator<T> = (value: unknown) => value is T
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const count = (v: unknown): v is number => finite(v) && Number.isSafeInteger(v) && v >= 0
const delta = (v: unknown) => finite(v) && Number.isSafeInteger(v)
const rate = (v: unknown) => v === null || (finite(v) && v >= 0 && v <= 100)
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
function date(v: unknown): v is string {
  if (!text(v) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const parsed = new Date(v + 'T00:00:00Z')
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v
}
function timestamp(v: unknown): v is string {
  return text(v) && date(v.slice(0, 10)) &&
    /^.{10}[ T](?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?$/.test(v)
}
function list<T>(v: unknown, valid: Validator<T>): v is T[] {
  return Array.isArray(v) && v.every(entry => valid(entry))
}
function metric(v: unknown): v is Metric {
  return object(v) && count(v.current) && count(v.previous) && delta(v.delta)
}
function rateMetric(v: unknown): v is Metric {
  return object(v) && rate(v.current) && rate(v.previous) &&
    (v.delta === null || (finite(v.delta) && Math.abs(v.delta) <= 100))
}
function overview(v: unknown): v is Overview {
  return object(v) && timestamp(v.currentStart) && timestamp(v.currentEnd) &&
    timestamp(v.previousStart) && timestamp(v.previousEnd) &&
    metric(v.orders) && metric(v.hospitals) && metric(v.doctors) && metric(v.urgent) && rateMetric(v.urgentRate)
}
function bucket(v: unknown): v is Bucket {
  return object(v) && date(v.startDate) && date(v.endDate) && v.startDate <= v.endDate && count(v.count)
}
function trend(v: unknown): v is Trend {
  return object(v) && list(v.current, bucket) && list(v.previous, bucket)
}
function option(v: unknown): v is Option {
  return object(v) && text(v.key) && text(v.name)
}
function groupValues(v: Record<string,unknown>) {
  return count(v.current) && count(v.previous) && delta(v.delta) &&
    (v.share === undefined || rate(v.share))
}
function group(v: unknown): v is Group {
  return object(v) && groupValues(v) && option(v)
}
function item(v: unknown, summary = false): v is ItemGroup {
  return object(v) && (summary ? typeof v.key === 'string' && text(v.name) : option(v)) &&
    groupValues(v) && count(v.currentLines) && count(v.previousLines) && delta(v.deltaLines)
}
function page<T>(v: unknown, row: Validator<T>): v is Page<T> {
  return object(v) && count(v.total) && list(v.records, row) && v.total >= v.records.length
}
type Distribution = Option & { count: number; share?: number | null }
function distribution(v: unknown): v is Distribution {
  return object(v) && count(v.count) && (v.share === undefined || rate(v.share)) && option(v)
}
const structureKeys = ['orderType', 'businessType', 'isUrgent', 'needsPhysicalDelivery']
function structure(v: unknown): v is Structure {
  return object(v) && Object.keys(v).length === structureKeys.length &&
    structureKeys.every(k => list(v[k], distribution))
}
function order(v: unknown): v is Order {
  return object(v) && text(v.id) && text(v.orderCode) && timestamp(v.orderTime) &&
    ['hospitalName','hospitalDeptName','doctorName'].every(k => v[k] == null || typeof v[k] === 'string') &&
    ['orderType','isUrgent'].every(k => v[k] == null || delta(v[k]))
}
async function read<T>(path: string, params: Query, valid: Validator<T>): Promise<T> {
  const envelope: unknown = await http.get('/order/statistics/' + path, {
    params, keepResponseEnvelope: true, localErrorHandling: true,
  })
  if (!object(envelope) || (envelope.code !== 200 && envelope.code !== 0) || !valid(envelope.data))
    throw new Error('统计响应格式异常')
  return envelope.data
}
export const stats = {
  overview: (q: Query) => read('overview', q, overview),
  trend: (q: Query) => read('trend', q, trend),
  sources: (q: Query) => read('sources', q, (v): v is Page<Group> => page(v, group)),
  items: (q: Query) => read('items', q, (v): v is Page<ItemGroup> & {summary: ItemGroup} =>
    object(v) && item(v.summary, true) && page(v, item)),
  structure: (q: Query) => read('structure', q, structure),
  orders: (q: Query) => read('orders', q, (v): v is Page<Order> => page(v, order)),
  options: (q: Query) => read('options', q, (v): v is Option[] => list(v, option)),
}

