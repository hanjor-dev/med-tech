<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LocalRequestError } from '@/utils/http'
import dayjs from 'dayjs'
import TrendChart from './TrendChart.vue'
import OrderDetailDialog from '@/views/business/orderComponents/orderDetailDialog.vue'
import { orderDetail } from '@/api/order'
import {
  stats,
  fields,
  filterKey,
  type Dimension,
  type Group,
  type ItemGroup,
  type Option,
  type Period,
  type Query,
} from '@/api/orderStatistics'
const router = useRouter()
const today = () =>
  dayjs(
    new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(
      new Date(),
    ),
  )
const cut = (d: dayjs.Dayjs) => d.format('YYYY-MM-DD')
const preset = ref('本月')
const dates = ref<[string, string]>([
  cut(today().startOf('month')),
  cut(today()),
])
function setPreset(p: string, filters: Query = applied.value) {
  if (p === '自定义') return
  const d = today()
  dates.value =
    p === '上月'
      ? [
          cut(d.subtract(1, 'month').startOf('month')),
          cut(d.startOf('month').subtract(1, 'day')),
        ]
      : [
          cut(
            d
              .startOf('month')
              .subtract(p === '本季度' ? d.month() % 3 : 0, 'month'),
          ),
          cut(d),
        ]
  apply(filters)
}
const defaultFilters = { excludeCancelled: false, includeTest: false }
const draft = ref<Query>({ ...defaultFilters })
const applied = ref<Query>({
  startDate: dates.value[0],
  endDate: dates.value[1],
  ...draft.value,
})
const more = ref(false)
const dims = Object.keys(fields) as Dimension[]
const sourceDims: Dimension[] = [
  'hospital',
  'hospitalDept',
  'doctor',
  'area',
  'org',
  'operatorDept',
]
const tab = ref('sources')
const dim = ref<Dimension>('hospital')
const item = ref<Dimension>('project')
const crumbs = ref<{ d: Dimension; row: Option }[]>([])
const page = ref(1),
  sortBy = ref('delta'),
  sortOrder = ref('desc'),
  grain = ref('day')
const detail = ref<{ label: string; period: Period; q: Query }>()
const detailPage = ref(1)
const opts = ref<Partial<Record<Dimension, Option[]>>>({})
const optionError = ref<Partial<Record<Dimension,string>>>({})
function localMessage(cause: unknown) {
  if (cause instanceof LocalRequestError) {
    if (cause.code === 403 || cause.code === 612) return '无访问权限'
    if (cause.code === 410) return '请检查查询条件'
  }
  return '加载失败'
}
const optionVersions: Partial<Record<Dimension, number>> = {}
async function loadOptions(d: Dimension) {
  const version = (optionVersions[d] ?? 0) + 1
  optionVersions[d] = version
  const q: Query = {
    ...draft.value,
    startDate: dates.value?.[0] ?? '',
    endDate: dates.value?.[1] ?? '',
    dimension: d,
  }
  delete q[filterKey(d)]
  if (q.startDate === applied.value.startDate && q.endDate === applied.value.endDate && baseOverview.data.value)
    q.cutoff = baseOverview.data.value.currentEnd
  if (d === 'hospital') delete q.hospitalDeptId
  if (d === 'hospital' || d === 'hospitalDept') delete q.doctorId
  delete optionError.value[d]
  opts.value[d] = []
  try {
    const list = await stats.options(q)
    if (optionVersions[d] === version) opts.value[d] = list
  } catch (cause) {
    if (optionVersions[d] === version) optionError.value[d] = localMessage(cause)
  }
}
const labels = ref<Record<string, string>>({})
function choose(d: Dimension, value: string) {
  const k = filterKey(d)
  if (value === undefined || value === '') delete draft.value[k]
  else
    labels.value[k + ':' + value] =
      opts.value[d]?.find((o) => o.key === value)?.name ?? value
  if (d === 'hospital' || d === 'hospitalDept') {
    delete draft.value.doctorId
    if (d === 'hospital') delete draft.value.hospitalDeptId
  }
}
const filterLabels = computed(() =>
  [
    ...dims
      .filter((d) => applied.value[filterKey(d)] != null)
      .map(
        (d) =>
          fields[d] +
          ' · ' +
          (labels.value[filterKey(d) + ':' + applied.value[filterKey(d)]] ??
            applied.value[filterKey(d)]),
      ),
    applied.value.includeTest || applied.value.businessType === '11.2'
      ? '包含测试单'
      : '排除测试单',
    applied.value.excludeCancelled ? '排除取消单' : '包含取消单',
    ...crumbs.value.map((c) => fields[c.d] + ' · ' + c.row.name),
  ],
)
const description = computed(() => filterLabels.value.join('　'))
const detailDimension = computed(() => dims.find(d => detail.value?.q[filterKey(d)] != null))
function resetFilters() {
  draft.value = { ...defaultFilters }
  preset.value = '本月'
  setPreset('本月', draft.value)
}
function apply(filters: Query) {
  if (!dates.value?.[1]) return
  crumbs.value = []
  page.value = 1
  detail.value = undefined
  applied.value = {
    ...filters,
    startDate: dates.value[0],
    endDate: dates.value[1],
  }
}
function resource<T>(
  params: () => Query | undefined,
  read: (q: Query) => Promise<T>,
) {
  const data = ref<T>(),
    loading = ref(false),
    error = ref(''),
    retry = ref(0)
  watch(
    () => [params(), retry.value] as const,
    async ([q], _, cleanup) => {
      let active = true
      cleanup(() => {
        active = false
      })
      data.value = undefined
      error.value = ''
      loading.value = !!q
      if (!q) return
      try {
        const result = await read(q)
        if (active) data.value = result
      } catch (cause) {
        if (active) error.value = localMessage(cause)
      } finally {
        if (active) loading.value = false
      }
    },
    { immediate: true },
  )
  return { data, loading, error, again: () => retry.value++ }
}
// 每次查询由概览确定截止时间，切换维度、下钻和翻页沿用同一边界。
const baseOverview = resource(() => applied.value, async (query) => ({
  ...await stats.overview(query),
  query,
}))
const filters = computed<Query | undefined>(() => {
  const snapshot = baseOverview.data.value
  if (!snapshot || snapshot.query !== applied.value) return undefined
  return {
    ...snapshot.query,
    cutoff: snapshot.currentEnd,
    ...Object.fromEntries(crumbs.value.map((c) => [filterKey(c.d), c.row.key])),
  }
})
const drillOverview = resource(() => crumbs.value.length ? filters.value : undefined, stats.overview)
const overview = computed(() => crumbs.value.length && baseOverview.data.value ? drillOverview : baseOverview)
const trend = resource(
  () => filters.value && ({ ...filters.value, granularity: grain.value }),
  stats.trend,
)
const groups = resource(
  () =>
    tab.value === 'structure' || !filters.value
      ? undefined
      : {
          ...filters.value,
          dimension: tab.value === 'items' ? item.value : dim.value,
          pageNum: page.value,
          pageSize: 20,
          sortBy: sortBy.value,
          sortOrder: sortOrder.value,
        },
  (q) => (tab.value === 'items' ? stats.items(q) : stats.sources(q)),
)
const structure = resource(
  () => (tab.value === 'structure' ? filters.value : undefined),
  stats.structure,
)
const orders = resource(
  () =>
    detail.value && filters.value
      ? {
          ...filters.value,
          ...detail.value.q,
          period: detail.value.period,
          pageNum: detailPage.value,
          pageSize: 20,
        }
      : undefined,
  stats.orders,
)
const orderTypes: Record<string, string> = { 1: '医疗器械', 2: '非医疗器械' }
const urgency: Record<string, string> = { 0: '普通', 1: '加急' }
const metrics = {
  orders: '新增订单',
  hospitals: '下单医院',
  doctors: '下单医生',
  urgent: '急单数',
  urgentRate: '急单占比',
} as const
const fmt = (v: number | null | undefined, suffix = '') =>
  v == null ? '—' : v + suffix
function range(p: Period) {
  const v = baseOverview.data.value
  if (!v) return '—'
  const end = dayjs(v[(p + 'End') as 'currentEnd' | 'previousEnd']).subtract(
    1,
    'millisecond',
  )
  return (
    String(v[(p + 'Start') as 'currentStart' | 'previousStart']).slice(0, 10) +
    ' 至 ' +
    end.format(
      end.endOf('day').isSame(end) ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
    )
  )
}
function inspect(label: string, p: Period, q: Query = {}) {
  detailPage.value = 1
  detail.value = { label, period: p, q }
}
function cell(row: Group, p: Period) {
  const d = tab.value === 'items' ? item.value : dim.value
  inspect(row.name, p, { [filterKey(d)]: row.key })
}
function drill(row: Group) {
  crumbs.value.push({ d: dim.value, row: { key: row.key, name: row.name } })
  dim.value = dim.value === 'hospital' ? 'hospitalDept' : 'doctor'
  page.value = 1
}
function back(i: number) {
  dim.value =
    crumbs.value[i]?.d ??
    (crumbs.value[i - 1]?.d === 'hospital' ? 'hospitalDept' : 'doctor')
  crumbs.value = crumbs.value.slice(0, i)
  page.value = 1
}
function showItems() {
  tab.value = 'items'
  page.value = 1
}
function resetSort({ prop, order }: { prop: string; order: string }) {
  sortBy.value = order ? prop : 'delta'
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  page.value = 1
}
const summary = computed(
  () => (groups.data.value as { summary?: ItemGroup })?.summary,
)
const selectedOrder = ref<{ id: string; orderCode: string }>()
const fullDetail = resource(
  () => detail.value && selectedOrder.value ? { id: selectedOrder.value.id } : undefined,
  async (q) => {
    const order = await orderDetail(String(q.id), true)
    if (!order?.id || !order.orderCode) throw new Error('订单详情数据缺失')
    return order
  },
)
</script>
<template>
  <main class="analysis">
    <header>
      <h2>订单分析</h2>
      <span>
        本期 {{ range('current') }}
      </span>
      <span>上期 {{ range('previous') }}</span>
    </header>
    <section class="panel">
      <div class="filters">
        <el-radio-group v-model="preset" @change="setPreset(String($event))">
          <el-radio-button
            v-for="p in ['本月', '上月', '本季度', '自定义']"
            :key="p"
            :value="p"
          >
            {{ p }}
          </el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="dates"
          type="daterange"
          value-format="YYYY-MM-DD"
          :clearable="false"
          :disabled-date="(d: Date) => cut(dayjs(d)) > cut(today())"
          @change="preset = '自定义'"
        />
        <el-button link @click="more = !more">
          {{ more ? '收起条件' : '更多条件' }}
        </el-button>
      </div>
      <div class="filters">
        <label
          v-for="d in more
            ? dims
            : (['area', 'hospital', 'businessType'] as Dimension[])"
          :key="d"
        >
          {{ fields[d] }}
          <el-select
            v-model="draft[filterKey(d)]"
            clearable
            filterable
            style="width: 150px"
            @visible-change="$event && loadOptions(d)"
            @change="choose(d, $event)"
          >
            <el-option
              v-for="o in opts[d]"
              :key="o.key"
              :label="o.name"
              :value="o.key"
            />
          </el-select>
          <el-button v-if="optionError[d]" link type="danger" @click.prevent="loadOptions(d)">选项{{ optionError[d] }}，重试</el-button>
        </label>
        <el-checkbox v-if="more" v-model="draft.includeTest">
          包含测试单
        </el-checkbox>
        <el-checkbox v-model="draft.excludeCancelled">排除取消单</el-checkbox>
        <el-button type="primary" @click="apply(draft)">查询</el-button>
        <el-button @click="resetFilters">重置条件</el-button>
      </div>
      <small>已应用　{{ description }}</small>
    </section>
    <div v-if="overview.error.value">
      <el-button @click="overview.again">概览{{ overview.error.value }}，重试</el-button>
    </div>
    <section class="metrics" v-loading="overview.loading.value">
      <article v-for="(name, key) in metrics" :key="key">
        <small>{{ name }}</small>
        <strong>
          {{
            fmt(
              overview.data.value?.[key].current,
              key === 'urgentRate' ? '%' : '',
            )
          }}
        </strong>
        <small>
          上期
          {{
            fmt(
              overview.data.value?.[key].previous,
              key === 'urgentRate' ? '%' : '',
            )
          }}　增减
          {{
            fmt(
              overview.data.value?.[key].delta,
              key === 'urgentRate' ? ' 个百分点' : '',
            )
          }}
        </small>
      </article>
    </section>
    <section v-if="filters" class="panel" v-loading="trend.loading.value">
      <div class="heading">
        <h3>订单趋势</h3>
        <small>每期最多 366 段。日期跨度较长时，可切换为周或月，或缩短查询范围。</small>
        <el-radio-group v-model="grain">
          <el-radio-button
            v-for="(n, k) in { day: '日', week: '周', month: '月' }"
            :key="k"
            :value="k"
          >
            {{ n }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <el-button v-if="trend.error.value" @click="trend.again">
        趋势{{ trend.error.value }}，重试
      </el-button>
      <TrendChart v-else :trend="trend.data.value" />
    </section>
    <section v-if="filters" class="panel">
      <el-tabs v-model="tab" @tab-change="page = 1">
        <el-tab-pane label="订单来源" name="sources" />
        <el-tab-pane label="订单结构" name="structure" />
        <el-tab-pane label="项目与部位" name="items" />
      </el-tabs>
      <div v-if="crumbs.length" class="filters">
        <el-button link @click="back(0)">全部来源</el-button>
        <el-button
          v-for="(c, i) in crumbs"
          :key="c.d"
          link
          @click="back(i + 1)"
        >
          / {{ c.row.name }}
        </el-button>
        <el-button
          v-if="tab === 'sources'"
          link
          type="primary"
          @click="showItems"
        >
          查看项目
        </el-button>
      </div>
      <template v-if="tab !== 'structure'">
        <el-radio-group
          v-if="tab === 'sources'"
          v-model="dim"
          @change="page = 1"
        >
          <el-radio-button v-for="d in sourceDims" :key="d" :value="d">
            {{ fields[d] }}
          </el-radio-button>
        </el-radio-group>
        <el-radio-group v-else v-model="item" @change="page = 1">
          <el-radio-button value="project">项目</el-radio-button>
          <el-radio-button value="bodyPart">部位</el-radio-button>
        </el-radio-group>
        <el-button v-if="groups.error.value" @click="groups.again">
          列表{{ groups.error.value }}，重试
        </el-button>
        <el-table
          v-else
          v-loading="groups.loading.value"
          :data="groups.data.value?.records ?? []"
          @sort-change="resetSort"
        >
          <el-table-column
            :label="fields[tab === 'items' ? item : dim]"
            min-width="145"
          >
            <template #default="{ row }">
              <el-button
                v-if="
                  tab === 'sources' &&
                  ['hospital', 'hospitalDept'].includes(dim)
                "
                link
                type="primary"
                @click="drill(row)"
              >
                {{ row.name }}
              </el-button>
              <span v-else>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-for="p in ['current', 'previous'] as const"
            :key="p"
            :prop="p"
            sortable="custom"
            :label="
              (p === 'current' ? '本期' : '上期') +
              (tab === 'items' ? '涉及订单数' : '订单数')
            "
          >
            <template #default="{ row }">
              <el-button link type="primary" @click="cell(row, p)">
                {{ row[p] }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="delta" label="订单增减" sortable="custom" />
          <el-table-column v-if="tab === 'sources'" label="本期占比">
            <template #default="{ row }">{{ fmt(row.share, '%') }}</template>
          </el-table-column>
          <template v-else>
            <el-table-column prop="currentLines" label="本期明细条数" />
            <el-table-column prop="previousLines" label="上期明细条数" />
            <el-table-column prop="deltaLines" label="明细增减" />
          </template>
        </el-table>
        <p v-if="tab === 'items' && summary">
          本期合计　{{ summary.current }} 个涉及订单 ·
          {{ summary.currentLines }} 条明细　｜　上期合计　{{
            summary.previous
          }}
          个涉及订单 · {{ summary.previousLines }} 条明细
        </p>
        <el-pagination
          v-if="groups.data.value"
          v-model:current-page="page"
          :total="groups.data.value?.total ?? 0"
          :page-size="20"
          layout="total, prev, pager, next"
        />
      </template>
      <div v-else v-loading="structure.loading.value">
        <el-button v-if="structure.error.value" @click="structure.again">
          结构{{ structure.error.value }}，重试
        </el-button>
        <div class="structures">
          <div v-for="(rows, d) in structure.data.value" :key="d">
            <h3>{{ fields[d] }}</h3>
            <el-table :data="rows">
              <el-table-column prop="name" label="分类" />
              <el-table-column label="订单数">
                <template #default="{ row }">
                  <el-button
                    link
                    type="primary"
                    @click="
                      inspect(row.name, 'current', { [filterKey(d)]: row.key })
                    "
                  >
                    {{ row.count }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column label="占比">
                <template #default="{ row }">
                  {{ fmt(row.share, '%') }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </section>
    <el-drawer v-if="filters"
      :model-value="!!detail"
      size="min(980px, 94vw)"
      title="订单明细"
      @close="detail = undefined; selectedOrder = undefined"
    >
      <div class="detail-body">
      <dl class="detail-context">
        <dt>{{ detailDimension ? fields[detailDimension] : '统计对象' }}</dt>
        <dd class="detail-subject">{{ detail?.label }}</dd>
        <dt>统计周期</dt>
        <dd><strong>{{ detail?.period === 'current' ? '本期' : '上期' }}</strong> {{ range(detail?.period ?? 'current') }}</dd>
        <dt>筛选条件</dt>
        <dd class="detail-tags"><span v-for="(label, i) in filterLabels" :key="i">{{ label }}</span></dd>
      </dl>
      <el-button v-if="fullDetail.error.value" @click="fullDetail.again">
        {{ selectedOrder?.orderCode }} 详情{{ fullDetail.error.value }}，重试
      </el-button>
      <el-button v-if="orders.error.value" @click="orders.again">
        明细{{ orders.error.value }}，重试
      </el-button>
      <el-table
        v-else
        v-loading="orders.loading.value"
        :data="orders.data.value?.records ?? []"
      >
        <el-table-column label="单号" min-width="150">
          <template #default="{ row }">
            <el-button
              v-if="router.hasRoute('Order')"
              link
              type="primary"
              :loading="fullDetail.loading.value && selectedOrder?.id === row.id"
              @click="selectedOrder = { id: row.id, orderCode: row.orderCode }"
            >
              {{ row.orderCode }}
            </el-button>
            <span v-else>{{ row.orderCode }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="120">
          <template #default="{ row }">
            {{ row.orderTime.slice(0, 10) }}
            <span class="cell-secondary">{{ row.orderTime.slice(11, 19) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="医院 / 科室" min-width="155">
          <template #default="{ row }">
            {{ row.hospitalName || '未登记医院' }}
            <span class="cell-secondary">{{ row.hospitalDeptName || '未登记科室' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="医生" min-width="80">
          <template #default="{ row }">{{ row.doctorName || '未登记' }}</template>
        </el-table-column>
        <el-table-column label="订单类型" min-width="105">
          <template #default="{ row }">
            {{ orderTypes[row.orderType] ?? row.orderType ?? '未登记' }}
          </template>
        </el-table-column>
        <el-table-column label="急单" width="72">
          <template #default="{ row }">
            <span :class="{ 'urgent-value': row.isUrgent === 1 }">{{ urgency[row.isUrgent] ?? row.isUrgent ?? '未登记' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="orders.data.value"
        v-model:current-page="detailPage"
        :total="orders.data.value?.total ?? 0"
        :page-size="20"
        layout="total, prev, pager, next"
      />
      </div>
    </el-drawer>
    <OrderDetailDialog
      v-if="selectedOrder && fullDetail.data.value"
      :model-value="true"
      :order="fullDetail.data.value"
      @update:model-value="!$event && (selectedOrder = undefined)"
    />
  </main>
</template>
<style scoped>
.detail-body {
  padding: 20px clamp(16px, 2vw, 28px) 24px;
}
.detail-context {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 10px 20px;
  align-items: baseline;
  margin: 0 0 18px;
  padding: 16px 20px;
  background: #f6f8fb;
  border-radius: 8px;
  font-size: 13px;
}
.detail-context dt, .cell-secondary { color: #637486; }
.detail-context dd { margin: 0; overflow-wrap: anywhere; }
.detail-subject { font-size: 16px; font-weight: 600; }
.detail-context strong { margin-right: 6px; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.detail-tags span { padding: 2px 8px; background: white; border: 1px solid #dce3ea; border-radius: 4px; }
.cell-secondary { display: block; font-size: 12px; }
.urgent-value { color: #ab4024; font-weight: 600; }
.detail-body :deep(.el-table th.el-table__cell) { background: #f6f8fb; }
.detail-body .el-pagination { justify-content: flex-end; margin-top: 16px; }
.analysis {
  height: 100%;
  overflow: auto;
  background: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
  color: #203341;
}
.analysis header,
.heading,
.filters {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.analysis header {
  margin-bottom: 16px;
}
.analysis header span,
small {
  font-size: 13px;
  color: #596b76;
}
h2,
h3 {
  margin: 0;
}
h3 {
  font-size: 16px;
}
.panel,
.metrics article {
  background: white;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 14px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 10px;
}
.metrics strong {
  display: block;
  font-size: 27px;
  margin: 8px 0;
}
.heading {
  justify-content: space-between;
}
.filters {
  margin-bottom: 12px;
}
.filters label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
}
.structures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 20px;
}
.el-pagination,
.el-table {
  margin-top: 12px;
}
a {
  color: var(--el-color-primary);
}
</style>


