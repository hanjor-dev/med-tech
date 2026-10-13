import type { DashboardVO } from '@/api/dashboard'

export function getMockDashboard(roleCode: string, timeRange = 'today'): DashboardVO {
  const BUILDERS: Record<string, () => DashboardVO> = {
    salesman: () => ({
      cards: [
        { key: 'myOrders',         title: '我的订单',     value: 45,  unit: '单', link: '/order' },
        { key: 'pendingOrders',    title: '待处理订单',   value: 3,   unit: '单', link: '/order?status=pending' },
        { key: 'inProgressOrders', title: '进行中订单',   value: 28,  unit: '单', link: '/order?status=in_progress' },
        { key: 'completedOrders',  title: '已完成订单',   value: 14,  unit: '单', link: '/order?status=completed' },
      ],
      charts: [
        { key: 'orderTrend', title: '订单趋势', type: 'line', data: { xAxis: ['周一','周二','周三','周四','周五','周六','周日'], series: [
          { name: '订单数', data: [5,8,6,9,7,4,6] },
        ]}},
        { key: 'orderPhase', title: '订单阶段分布', type: 'pie', data: { items: [
          { name: '订单阶段', value: 3 }, { name: '设计阶段', value: 15 },
          { name: '打印阶段', value: 8 }, { name: '后处理阶段', value: 5 },
          { name: '质检阶段', value: 3 }, { name: '仓储阶段', value: 2 },
          { name: '已完成', value: 9 },
        ]}},
      ],
      todos: [],
    }),

    designer: () => ({
      cards: [
        { key: 'myWorkorders',       title: '我的工单',     value: 32, unit: '单', link: '/workorder' },
        { key: 'pendingStart',       title: '待开始工单',   value: 5,  unit: '单', link: '/workorder?status=pending_start' },
        { key: 'inProgress',         title: '设计中工单',   value: 12, unit: '单', link: '/workorder?status=in_progress' },
        { key: 'completedWorkorders',title: '已完成',       value: 15, unit: '单', link: '/workorder?status=completed' },
      ],
      charts: [
        { key: 'workorderTrend', title: '工单趋势', type: 'line', data: { xAxis: ['周一','周二','周三','周四','周五','周六','周日'], series: [
          { name: '新接订单', data: [3,5,4,6,5,2,4] },
          { name: '完成设计', data: [2,4,3,5,4,3,3] },
        ]}},
        { key: 'workorderPhase', title: '工单阶段分布', type: 'pie', data: { items: [
          { name: '设计阶段', value: 17 }, { name: '打印阶段', value: 8 },
          { name: '后处理阶段', value: 4 }, { name: '质检阶段', value: 2 },
          { name: '已完成', value: 1 },
        ]}},
      ],
      todos: [],
    }),

    production: () => ({
      cards: [
        { key: 'pendingProductionTasks', title: '待生产',   value: 6,  unit: '单', link: '/manufacture?status=3010' },
        { key: 'inProductionTasks',      title: '生产中',   value: 14, unit: '单', link: '/manufacture?status=3020' },
        { key: 'reworkTasks',            title: '返工数',   value: 3,  unit: '单', link: '/manufacture?status=rework' },
        { key: 'totalTasks',             title: '生产总数', value: 78, unit: '单', change: '+5.4%', trend: 'up', link: '/manufacture' },
      ],
      charts: [
        { key: 'totalYoy', title: '生产总数同比', type: 'bar', data: {
          xAxis: ['1月','2月','3月','4月','5月','6月'],
          series: [
            { name: '今年', data: [62,70,75,80,78,85] },
            { name: '去年', data: [55,62,68,72,70,78] },
          ],
        }},
        { key: 'totalMom', title: '生产总数环比', type: 'line', data: {
          xAxis: ['1月','2月','3月','4月','5月','6月'],
          series: [{ name: '环比增长率', data: [5.2,12.9,7.1,6.7,-2.5,9.0] }],
        }},
        { key: 'reworkYoy', title: '返工数同比', type: 'bar', data: {
          xAxis: ['1月','2月','3月','4月','5月','6月'],
          series: [
            { name: '今年', data: [4,3,5,2,3,2] },
            { name: '去年', data: [5,4,6,4,5,3] },
          ],
        }},
        { key: 'reworkMom', title: '返工数环比', type: 'line', data: {
          xAxis: ['1月','2月','3月','4月','5月','6月'],
          series: [{ name: '环比增长率', data: [-10.0,-25.0,66.7,-60.0,50.0,-33.3] }],
        }},
      ],
      todos: [
        { id: 1, title: '加急任务待处理', count: 3, urgent: true },
        { id: 2, title: '待开始任务', count: 6 },
      ],
    }),

    quality: () => ({
      cards: [
        { key: 'productCount', title: '总产品数量', value: 142, unit: '单', link: '/quality' },
        { key: 'pendingQc',    title: '总待检数量', value: 45,  unit: '单', link: '/quality?status=5010' },
        { key: 'reworkCount',  title: '总返工数量', value: 8,   unit: '单', link: '/quality?status=rework' },
      ],
      charts: [
        { key: 'qcResultTrend', title: '质检结果趋势', type: 'line', data: { xAxis: ['5/12','5/13','5/14','5/15','5/16','5/17','5/18'], series: [
          { name: '质检通过', data: [24,26,25,28,27,29,26] },
          { name: '质检不通过', data: [2,1,2,1,2,1,2] },
        ]}},
        { key: 'productTypeQcDistribution', title: '产品类型质检分布', type: 'pie', data: { items: [
          { name: '膝关节假体', value: 45 }, { name: '髋关节假体', value: 38 },
          { name: '脊柱植入物', value: 32 }, { name: '其他产品', value: 27 },
        ]}},
      ],
      todos: [
        { id: 1, title: '待质检任务', count: 45, urgent: true },
        { id: 2, title: '返工任务跟进', count: 8 },
      ],
    }),

    finance: () => ({
      cards: [
        { key: 'totalOrderAmount',    title: '订单总金额',   value: '¥ 2,800,000', change: '+8%', trend: 'up', link: '/order' },
        { key: 'paidAmount',          title: '已收款金额',   value: '¥ 2,156,000', change: '收款率 77%', trend: 'up', link: '/order?paymentStatus=paid' },
        { key: 'unpaidAmount',        title: '待收款金额',   value: '¥ 644,000', link: '/order?paymentStatus=unpaid' },
        { key: 'overdueAmount',       title: '逾期未收款',   value: '¥ 84,000', trend: 'down', link: '/order?paymentStatus=overdue' },
        { key: 'monthNewOrderAmount', title: '新增订单额',   value: '¥ 700,000', change: '+6%', trend: 'up', link: '/order?timeRange=month' },
        { key: 'avgOrderAmount',      title: '平均订单金额', value: '¥ 233,333', link: '/order' },
      ],
      charts: [
        { key: 'amountTrend', title: '订单金额趋势（万元）', type: 'line', data: { xAxis: ['5/12','5/13','5/14','5/15','5/16','5/17','5/18'], series: [
          { name: '订单总额', data: [12,15,10,18,14,20,16] },
          { name: '已收款',   data: [10,12,8,15,12,18,14] },
          { name: '待收款',   data: [2,3,2,4,3,5,4] },
        ]}},
        { key: 'paymentStatusDistribution', title: '收款状态分布', type: 'pie', data: { items: [
          { name: '已收款', value: 14 }, { name: '部分收款', value: 6 }, { name: '未收款', value: 5 },
        ]}},
        { key: 'deptPerformance', title: '部门业绩对比（万元）', type: 'bar', data: {
          xAxis: ['华东区','华南区','华北区','西南区'],
          series: [{ name: '订单金额', data: [120,100,90,70] }],
        }},
      ],
      todos: [
        { id: 1, title: '逾期未收款订单', count: 5, urgent: true },
        { id: 2, title: '本周到期应收款', count: 8 },
      ],
    }),

    area_manager: () => ({
      cards: [
        { key: 'deptOrders',     title: '部门订单',     value: 156,  unit: '单', link: null },
        { key: 'pendingAudit',   title: '待审核订单',   value: 8,    unit: '单', link: null },
        { key: 'inProgress',     title: '进行中订单',   value: 89,   unit: '单', link: null },
        { key: 'completedOrders',title: '已完成',       value: 59,   unit: '单', link: null },
        { key: 'avgOrders',      title: '人均订单数',   value: '15.6', unit: '单', link: null },
      ],
      charts: [
        { key: 'orderTrend', title: '部门订单趋势', type: 'line' as const, data: { xAxis: ['周一','周二','周三','周四','周五','周六','周日'], series: [
          { name: '新提订单', data: [18,25,22,28,24,15,20] },
          { name: '完成订单', data: [12,18,16,20,19,14,16] },
        ]}},
        { key: 'salesmanTop10', title: '业务员TOP10', type: 'bar' as const, data: {
          xAxis: ['张三','李四','王五','赵六','钱七','孙八','周九','吴十','郑十一','王十二'],
          series: [
            { name: '进行中', data: [12,11,10,9,8,8,7,6,6,5] },
            { name: '已完成', data: [8,7,6,6,5,5,4,4,3,3] },
          ],
        }},
        { key: 'dailySubmissions', title: '提单时间分布', type: 'bar' as const, data: {
          xAxis: ['1日','2日','3日','4日','5日','6日','7日'],
          series: [{ name: '提单数', data: [15,18,22,20,25,19,17] }],
        }},
      ],
      todos: [],
    }),

    design_manager: () => ({
      cards: [
        { key: 'teamTotal',      title: '团队工单总数', value: 128, unit: '单', link: null },
        { key: 'unassigned',     title: '待分配工单',   value: 12,  unit: '单', link: null },
        { key: 'designing',      title: '设计中订单',   value: 45,  unit: '单', link: null },
        { key: 'designCompleted',title: '设计完成订单', value: 71,  unit: '单', link: null },
        { key: 'pendingAudit',   title: '待审核订单',   value: 8,   unit: '单', link: null },
      ],
      charts: [
        { key: 'designerWorkload', title: '设计师工作负载', type: 'bar' as const, data: {
          xAxis: ['李设计','王设计','张设计','赵设计','钱设计','孙设计','周设计','吴设计','郑设计','陈设计'],
          series: [
            { name: '待设计', data: [3,2,2,1,1,1,1,0,0,0] },
            { name: '设计中', data: [8,7,6,5,4,4,3,3,3,2] },
            { name: '设计完成', data: [12,10,9,8,7,6,5,5,4,5] },
          ],
        }},
        { key: 'workflowFunnel', title: '工单流转漏斗图', type: 'funnel' as const, data: { items: [
          { name: '待设计', value: 11 },
          { name: '设计中', value: 45 },
          { name: '设计完成', value: 71 },
        ]}},
      ],
      todos: [],
    }),

    production_manager: () => ({
      cards: [
        { key: 'teamTotalTasks',        title: '团队任务总数', value: 385,   unit: '单', change: '+8.5%', trend: 'up' as const, link: '/manufacture' },
        { key: 'unassignedTasks',       title: '待分配任务',   value: 12,    unit: '单', link: '/manufacture?status=3010' },
        { key: 'inProductionTasks',     title: '生产中任务',   value: 118,   unit: '单', change: '12 名生产员', link: '/manufacture?status=3020' },
        { key: 'pendingQcTasks',        title: '待质检任务',   value: 45,    unit: '单', change: '平均等待 3.8h', link: '/manufacture?status=3030' },
        { key: 'qcPassRate',            title: '质检通过率',   value: '94%', change: '+1.8%', trend: 'up' as const, link: '/manufacture' },
        { key: 'avgProductionDuration', title: '平均生产时长', value: 28.5,  unit: '小时', change: '-2.3h 环比', trend: 'down' as const, link: '/manufacture' },
      ],
      charts: [
        { key: 'workerWorkload', title: '生产员工作负载对比', type: 'bar' as const, data: {
          xAxis: ['张三','李四','王五','赵六','钱七','孙八','周九','吴十','郑十一','王十二'],
          series: [
            { name: '生产中', data: [10,12,11,13,9,11,12,10,14,11] },
            { name: '已完成', data: [32,28,35,30,33,31,29,34,27,36] },
          ],
        }},
        { key: 'qcPassRateTrend', title: '质检通过率趋势', type: 'line' as const, data: { xAxis: ['第1周','第2周','第3周','第4周'], series: [
          { name: '通过率', data: [92,93,93,94] },
        ]}},
        { key: 'productionFlowFunnel', title: '生产流转漏斗', type: 'funnel' as const, data: { items: [
          { name: '生产中', value: 118 }, { name: '待质检', value: 45 }, { name: '已完成', value: 200 },
        ]}},
      ],
      todos: [
        { id: 1, title: '待质检任务', count: 45 },
        { id: 2, title: '超时未完成任务', count: 4, urgent: true },
      ],
    }),

    warehouse: () => ({
      cards: [
        { key: 'pendingInboundTasks', title: '待入库任务',   value: 38,  unit: '单', link: '/storage?status=6010' },
        { key: 'todayInbound',        title: '今日入库数',   value: 26,  unit: '单', change: '+4.2%', trend: 'up' as const, link: '/storage' },
        { key: 'currentStock',        title: '当前库存总量', value: 142, unit: '单', link: '/storage' },
        { key: 'todayOutbound',       title: '今日出库数',   value: 31,  unit: '单', change: '+6.8%', trend: 'up' as const, link: '/storage' },
      ],
      charts: [
        { key: 'inOutboundTrend', title: '出入库趋势', type: 'line' as const, data: { xAxis: ['5/12','5/13','5/14','5/15','5/16','5/17','5/18'], series: [
          { name: '入库数量', data: [22,25,24,28,26,29,26] },
          { name: '出库数量', data: [26,28,27,30,29,32,31] },
        ]}},
        { key: 'stockDistribution', title: '库存产品分布', type: 'pie' as const, data: { items: [
          { name: '膝关节假体', value: 45 }, { name: '髋关节假体', value: 38 },
          { name: '脊柱植入物', value: 32 }, { name: '其他产品',   value: 27 },
        ]}},
      ],
      todos: [
        { id: 1, title: '待入库任务', count: 38 },
        { id: 2, title: '待出库任务', count: 12 },
        { id: 3, title: '库存预警（超30天未出库）', count: 5, urgent: true },
      ],
    }),

    company_admin: () => ({
      cards: [
        { key: 'totalOrders',          title: '订单总量', value: 1285, unit: '单', change: '+9.2%', trend: 'up', link: '/order' },
        { key: 'canceledOrders',       title: '已取消',   value: 65,   unit: '单', link: '/order?status=9010' },
        { key: 'printingOrders',       title: '打印中',   value: 118,  unit: '单', link: '/manufacture?status=3020' },
        { key: 'designCompletedOrders',title: '设计完成', value: 197,  unit: '单', link: '/design?status=2050' },
        { key: 'printCompletedOrders', title: '打印完成', value: 200,  unit: '单', link: '/manufacture?status=3030' },
        { key: 'designingOrders',      title: '设计中',   value: 95,   unit: '单', link: '/design?status=2020' },
      ],
      charts: [
        { key: 'yoyComparison', title: '同比分析', type: 'bar', data: {
          xAxis: ['1月','2月','3月','4月','5月','6月'],
          series: [
            { name: '今年', data: [285,310,325,365,380,420] },
            { name: '去年', data: [245,268,290,315,330,358] },
          ],
        }},
        { key: 'momComparison', title: '环比分析', type: 'line', data: { xAxis: ['1月','2月','3月','4月','5月','6月'], series: [
          { name: '环比增长率', data: [8.5,8.8,4.8,12.3,4.1,10.5] },
        ]}},
        { key: 'dailyOrderTimeDist', title: '每日提单时间段分析', type: 'bar', data: {
          xAxis: ['00-02','02-04','04-06','06-08','08-10','10-12','12-14','14-16','16-18','18-20','20-22','22-24'],
          series: [{ name: '提单数', data: [2,1,1,5,38,65,42,72,58,28,18,8] }],
        }},
        { key: 'deptPerformance', title: '各部门业绩对比', type: 'bar', data: {
          xAxis: ['华南区','华东区','华北区','西南区','华中区'],
          series: [{ name: '订单数', data: [428,385,342,298,256] }],
        }},
      ],
      todos: [
        { id: 1, title: '当前异常订单', count: 5, urgent: true },
        { id: 2, title: '今日新增订单', count: 12 },
        { id: 3, title: '各阶段待处理任务', count: 38 },
      ],
    }),

    super_admin: () => ({
      cards: [
        { key: 'totalOrders',          title: '订单总量', value: 1285, unit: '单', change: '+9.2%', trend: 'up' as const, link: '/order' },
        { key: 'canceledOrders',       title: '已取消',   value: 65,   unit: '单', link: '/order?status=9010' },
        { key: 'printingOrders',       title: '打印中',   value: 118,  unit: '单', link: '/manufacture?status=3020' },
        { key: 'designCompletedOrders',title: '设计完成', value: 197,  unit: '单', link: '/design?status=2050' },
        { key: 'printCompletedOrders', title: '打印完成', value: 200,  unit: '单', link: '/manufacture?status=3030' },
        { key: 'designingOrders',      title: '设计中',   value: 95,   unit: '单', link: '/design?status=2020' },
        { key: 'activeUsers',          title: '系统活跃用户', value: 156, unit: '人', change: '+5.8%', trend: 'up' as const },
        { key: 'dataGrowth',           title: '数据增长', value: '12.5%', change: '本月新增数据', trend: 'up' as const },
      ],
      charts: [
        { key: 'yoyComparison', title: '同比分析', type: 'bar' as const, data: {
          xAxis: ['1月','2月','3月','4月','5月','6月'],
          series: [
            { name: '今年', data: [285,310,325,365,380,420] },
            { name: '去年', data: [245,268,290,315,330,358] },
          ],
        }},
        { key: 'momComparison', title: '环比分析', type: 'line' as const, data: { xAxis: ['1月','2月','3月','4月','5月','6月'], series: [
          { name: '环比增长率', data: [8.5,8.8,4.8,12.3,4.1,10.5] },
        ]}},
        { key: 'orderTrend', title: '订单趋势分析', type: 'line' as const, data: { xAxis: ['第1周','第2周','第3周','第4周'], series: [
          { name: '新建订单', data: [285,310,325,365] },
          { name: '完成订单', data: [195,210,225,243] },
          { name: '取消订单', data: [8,10,9,11] },
        ]}},
        { key: 'deptPerformance', title: '部门业绩对比', type: 'bar' as const, data: {
          xAxis: ['华南区','华东区','华北区','西南区','华中区'],
          series: [{ name: '订单数', data: [428,385,342,298,256] }],
        }},
        { key: 'userActivityHeatmap', title: '用户活跃度分析', type: 'heatmap' as const, data: {
          xAxis: ['00:00','04:00','08:00','12:00','16:00','20:00'],
          yAxis: ['周日','周六','周五','周四','周三','周二','周一'],
          items: [
            [0,0,15],[1,0,22],[2,0,45],[3,0,68],[4,0,52],[5,0,28],
            [0,1,12],[1,1,18],[2,1,38],[3,1,55],[4,1,45],[5,1,22],
            [0,2,18],[1,2,28],[2,2,52],[3,2,78],[4,2,62],[5,2,35],
            [0,3,22],[1,3,32],[2,3,58],[3,3,85],[4,3,68],[5,3,38],
            [0,4,20],[1,4,30],[2,4,55],[3,4,82],[4,4,65],[5,4,36],
            [0,5,16],[1,5,25],[2,5,48],[3,5,72],[4,5,58],[5,5,32],
            [0,6,10],[1,6,15],[2,6,32],[3,6,48],[4,6,38],[5,6,20],
          ],
        }},
      ],
      todos: [],
      system: {
        healthStatus: 'healthy' as const,
        avgResponseTime: '120ms',
        onlineUsers: 156,
        avgOrderCycle: '432h',
      },
    }),
  }

  const builder = BUILDERS[roleCode]
  if (builder) return builder()

  return {
    cards: [
      { key: 'total',      title: '订单总数', value: 12 },
      { key: 'inProgress', title: '进行中',   value: 8 },
      { key: 'done',       title: '已完成',   value: 10 },
      { key: 'week',       title: '新增订单', value: 6, change: '+5', trend: 'up' },
    ],
    charts: [
      { key: 'trend', title: '订单趋势', type: 'line', data: { xAxis: ['5/12','5/13','5/14','5/15','5/16','5/17','5/18'], series: [
        { name: '新增订单', data: [12,15,10,18,14,20,16] },
      ]}},
      { key: 'phase', title: '订单阶段分布', type: 'pie', data: { items: [
        { name: '进行中', value: 8 }, { name: '已完成', value: 10 },
      ]}},
    ],
    todos: [{ id: 1, title: '待处理订单', count: 5 }],
  }
}
