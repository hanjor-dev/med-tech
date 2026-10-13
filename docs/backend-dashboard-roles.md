# 数据看板角色配置详情

## 目录

- [super_admin - 超级管理员](#1-super_admin---超级管理员)
- [company_admin - 公司管理员](#2-company_admin---公司管理员)
- [salesman - 业务员](#3-salesman---业务员)
- [area_manager - 区域经理](#4-area_manager---区域经理)
- [designer - 设计师](#5-designer---设计师)
- [design_manager - 设计主管](#6-design_manager---设计主管)
- [production - 生产工人](#7-production---生产工人)
- [production_manager - 生产主管](#8-production_manager---生产主管)
- [quality - 质检员/质检主管](#9-quality---质检员质检主管)
- [warehouse - 仓库管理员](#10-warehouse---仓库管理员)
- [finance - 财务](#11-finance---财务)

---

## 1. super_admin - 超级管理员

### 数据权限
- 查看全公司所有数据
- 唯一可以看到系统监控面板的角色

### KPI 卡片（4 个）

| key | title | 说明 | 数据来源 |
|-----|-------|------|---------|
| totalOrders | 订单总数 | 指定时间范围内的订单总数 | `SELECT COUNT(*) FROM orders WHERE create_time BETWEEN ? AND ?` |
| totalRevenue | 总营收 | 指定时间范围内的总营收（元） | `SELECT SUM(amount) FROM orders WHERE status='completed' AND ...` |
| totalUsers | 用户总数 | 系统用户总数 | `SELECT COUNT(*) FROM users WHERE status='active'` |
| avgOrderCycle | 平均订单周期 | 从接单到交付的平均时长 | `SELECT AVG(TIMESTAMPDIFF(HOUR, create_time, complete_time)) FROM orders WHERE status='completed' AND ...` |

### 图表配置（5 个）

#### 图表 1：同比数据对比（折线图）
```json
{
  "key": "yearComparison",
  "title": "同比数据对比",
  "type": "line",
  "data": {
    "xAxis": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    "series": [
      {
        "name": "今年订单",
        "data": [/* 今年每月订单数 */]
      },
      {
        "name": "去年订单",
        "data": [/* 去年同期每月订单数 */]
      }
    ]
  }
}
```
**SQL 示例：**
```sql
-- 今年数据
SELECT MONTH(create_time) as month, COUNT(*) as count
FROM orders
WHERE YEAR(create_time) = YEAR(CURDATE())
GROUP BY MONTH(create_time);

-- 去年数据
SELECT MONTH(create_time) as month, COUNT(*) as count
FROM orders
WHERE YEAR(create_time) = YEAR(CURDATE()) - 1
GROUP BY MONTH(create_time);
```

#### 图表 2：环比数据对比（折线图）
```json
{
  "key": "monthComparison",
  "title": "环比数据对比",
  "type": "line",
  "data": {
    "xAxis": ["第1周", "第2周", "第3周", "第4周"],
    "series": [
      {
        "name": "本月订单",
        "data": [/* 本月每周订单数 */]
      },
      {
        "name": "上月订单",
        "data": [/* 上月对应周订单数 */]
      }
    ]
  }
}
```

#### 图表 3：订单趋势（折线图）
```json
{
  "key": "orderTrend",
  "title": "订单趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 根据 timeRange 动态生成：today=小时，week=星期，month=日期，year=月份 */],
    "series": [
      {
        "name": "订单数",
        "data": [/* 对应时间段的订单数 */]
      }
    ]
  }
}
```

#### 图表 4：各部门业绩（柱状图）
```json
{
  "key": "deptPerformance",
  "title": "各部门业绩",
  "type": "bar",
  "data": {
    "xAxis": ["设计部", "生产部", "质检部", "仓储部", "财务部"],
    "series": [
      {
        "name": "完成订单",
        "data": [/* 每个部门处理的订单数 */]
      }
    ]
  }
}
```

#### 图表 5：用户活跃热力图（热力图）
```json
{
  "key": "userActivity",
  "title": "用户活跃热力图",
  "type": "heatmap",
  "data": {
    "xAxis": ["0时", "2时", "4时", "6时", "8时", "10时", "12时", "14时", "16时", "18时", "20时", "22时"],
    "yAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "items": [/* [xIndex, yIndex, count] */]
  }
}
```
**SQL 示例：**
```sql
SELECT 
  FLOOR(HOUR(login_time) / 2) * 2 as hour_slot,
  DAYOFWEEK(login_time) - 1 as weekday,
  COUNT(*) as count
FROM user_login_logs
WHERE login_time BETWEEN ? AND ?
GROUP BY hour_slot, weekday;
```

### 系统监控（system 字段）

```json
{
  "healthStatus": "healthy",  // healthy | warning | error
  "avgResponseTime": "120ms",  // API 平均响应时间
  "onlineUsers": 156,          // 当前在线用户数
  "avgOrderCycle": "432h"      // 平均订单周期（小时）
}
```

**数据来源：**
- `healthStatus`: 检查数据库连接、Redis 连接、关键服务状态
- `avgResponseTime`: 从 APM 系统或日志统计
- `onlineUsers`: `SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE last_active_time > NOW() - INTERVAL 30 MINUTE`
- `avgOrderCycle`: 已在 KPI 卡片中计算

---

## 2. company_admin - 公司管理员

### 数据权限
- 与 super_admin 相同
- 但**不显示**系统监控面板（无 `system` 字段）

### 配置
与 `super_admin` 完全相同，只是响应中省略 `system` 字段。

---

## 3. salesman - 业务员

### 数据权限
- 只能查看自己负责的订单数据
- 过滤条件：`WHERE salesman_id = {当前用户ID}`

### KPI 卡片（4 个）

| key | title | 说明 | 数据来源 |
|-----|-------|------|---------|
| myOrders | 我的订单 | 我负责的订单总数 | `SELECT COUNT(*) FROM orders WHERE salesman_id = ? AND ...` |
| pendingOrders | 待处理订单 | 待我处理的订单 | `SELECT COUNT(*) FROM orders WHERE salesman_id = ? AND status='pending' AND ...` |
| completedOrders | 已完成订单 | 我完成的订单数 | `SELECT COUNT(*) FROM orders WHERE salesman_id = ? AND status='completed' AND ...` |
| myRevenue | 我的业绩 | 我负责订单的总金额 | `SELECT SUM(amount) FROM orders WHERE salesman_id = ? AND status='completed' AND ...` |

### 图表配置（2 个）

#### 图表 1：订单趋势（折线图）
```json
{
  "key": "orderTrend",
  "title": "订单趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 根据 timeRange 动态生成 */],
    "series": [
      {
        "name": "订单数",
        "data": [/* 我的订单数趋势 */]
      }
    ]
  }
}
```

#### 图表 2：订单阶段分布（饼图）
```json
{
  "key": "orderPhase",
  "title": "订单阶段分布",
  "type": "pie",
  "data": {
    "items": [
      { "name": "待接单", "value": 10 },
      { "name": "设计中", "value": 15 },
      { "name": "生产中", "value": 12 },
      { "name": "质检中", "value": 8 },
      { "name": "已完成", "value": 20 }
    ]
  }
}
```
**SQL 示例：**
```sql
SELECT 
  CASE 
    WHEN status = 'pending' THEN '待接单'
    WHEN status = 'designing' THEN '设计中'
    WHEN status = 'producing' THEN '生产中'
    WHEN status = 'qc' THEN '质检中'
    WHEN status = 'completed' THEN '已完成'
  END as phase,
  COUNT(*) as value
FROM orders
WHERE salesman_id = ? AND create_time BETWEEN ? AND ?
GROUP BY status;
```

### 待办事项（todos）

```json
[
  {
    "id": 1,
    "title": "待跟进客户",
    "count": 5,
    "link": "/customer?status=follow_up",
    "urgent": true
  },
  {
    "id": 2,
    "title": "待报价订单",
    "count": 3,
    "link": "/order?status=quote_needed"
  }
]
```

---

## 4. area_manager - 区域经理

### 数据权限
- 查看所辖区域内所有业务员的数据
- 过滤条件：`WHERE area_id = {当前用户所属区域}`

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| teamOrders | 团队订单 | 区域内所有订单数 |
| teamRevenue | 团队业绩 | 区域内总营收 |
| avgSalesmanOrders | 人均订单 | 每个业务员平均订单数 |
| topSalesman | 最佳业务员 | 订单数最多的业务员姓名 |

### 图表配置（3 个）

#### 图表 1：订单趋势（折线图）
与 salesman 类似，但聚合区域内所有业务员数据。

#### 图表 2：业务员业绩排行（柱状图）
```json
{
  "key": "salesmanPerformance",
  "title": "业务员业绩排行",
  "type": "bar",
  "data": {
    "xAxis": ["张三", "李四", "王五", "赵六"],
    "series": [
      {
        "name": "订单数",
        "data": [45, 38, 32, 28]
      }
    ]
  }
}
```
**SQL 示例：**
```sql
SELECT u.real_name, COUNT(o.id) as order_count
FROM orders o
JOIN users u ON o.salesman_id = u.id
WHERE u.area_id = ? AND o.create_time BETWEEN ? AND ?
GROUP BY u.id
ORDER BY order_count DESC
LIMIT 10;
```

#### 图表 3：每日提单次数（柱状图）
```json
{
  "key": "dailySubmissions",
  "title": "每日提单次数",
  "type": "bar",
  "data": {
    "xAxis": [/* 日期数组 */],
    "series": [
      {
        "name": "提单数",
        "data": [/* 每日提单数 */]
      }
    ]
  }
}
```

---

## 5. designer - 设计师

### 数据权限
- 只能查看分配给自己的设计工单
- 过滤条件：`WHERE designer_id = {当前用户ID}`

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| myWorkorders | 我的工单 | 分配给我的工单总数 |
| pendingReview | 待审核 | 等待审核的工单 |
| reworkCount | 返工次数 | 被打回修改的次数 |
| completedWorkorders | 已完成 | 完成的工单数 |

### 图表配置（2 个）

#### 图表 1：工单趋势（折线图）
```json
{
  "key": "workorderTrend",
  "title": "工单趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 时间轴 */],
    "series": [
      {
        "name": "工单数",
        "data": [/* 工单数趋势 */]
      }
    ]
  }
}
```

#### 图表 2：工单状态分布（饼图）
```json
{
  "key": "workorderStatus",
  "title": "工单状态分布",
  "type": "pie",
  "data": {
    "items": [
      { "name": "设计中", "value": 15 },
      { "name": "待审核", "value": 8 },
      { "name": "已通过", "value": 25 },
      { "name": "需返工", "value": 3 }
    ]
  }
}
```

### 待办事项

```json
[
  {
    "id": 1,
    "title": "紧急工单",
    "count": 2,
    "link": "/workorder?urgent=true",
    "urgent": true
  },
  {
    "id": 2,
    "title": "待提交审核",
    "count": 5,
    "link": "/workorder?status=pending_submit"
  }
]
```

---

## 6. design_manager - 设计主管

### 数据权限
- 查看设计部所有设计师的数据

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| totalWorkorders | 部门工单 | 设计部总工单数 |
| avgPassRate | 平均通过率 | 一次审核通过率 |
| avgReviewTime | 平均审核时长 | 从提交到审核完成的平均时长 |
| topDesigner | 最佳设计师 | 完成工单最多的设计师 |

### 图表配置（3 个）

#### 图表 1：设计师工作量（横向柱状图）
```json
{
  "key": "designerWorkload",
  "title": "设计师工作量",
  "type": "bar",
  "data": {
    "xAxis": ["张设计", "李设计", "王设计", "赵设计"],
    "series": [
      {
        "name": "工单数",
        "data": [28, 25, 22, 18]
      }
    ]
  }
}
```

#### 图表 2：审核通过率趋势（折线图）
```json
{
  "key": "reviewPassRate",
  "title": "审核通过率趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 时间轴 */],
    "series": [
      {
        "name": "通过率(%)",
        "data": [/* 通过率百分比，如 [85, 88, 90, 87] */]
      }
    ]
  }
}
```

#### 图表 3：设计流转漏斗（漏斗图）
```json
{
  "key": "designFunnel",
  "title": "设计流转漏斗",
  "type": "funnel",
  "data": {
    "items": [
      { "name": "接收工单", "value": 200 },
      { "name": "设计中", "value": 180 },
      { "name": "提交审核", "value": 160 },
      { "name": "审核通过", "value": 140 },
      { "name": "交付生产", "value": 135 }
    ]
  }
}
```

---

## 7. production - 生产工人

### 数据权限
- 只能查看分配给自己的生产任务

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| myTasks | 我的任务 | 分配给我的生产任务数 |
| completedTasks | 已完成 | 完成的任务数 |
| qualityRate | 质检通过率 | 我的产品质检通过率 |
| avgProductionTime | 平均生产时长 | 每个任务平均耗时 |

### 图表配置（4 个）

#### 图表 1：同比生产对比（折线图）
```json
{
  "key": "yearProduction",
  "title": "同比生产对比",
  "type": "line",
  "data": {
    "xAxis": [/* 月份 */],
    "series": [
      { "name": "今年", "data": [/* 今年每月产量 */] },
      { "name": "去年", "data": [/* 去年每月产量 */] }
    ]
  }
}
```

#### 图表 2：环比生产对比（折线图）
类似同比，但对比本月和上月。

#### 图表 3：生产趋势（折线图）
当前时间范围内的生产趋势。

#### 图表 4：返工趋势（折线图）
```json
{
  "key": "reworkTrend",
  "title": "返工趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 时间轴 */],
    "series": [
      {
        "name": "返工数",
        "data": [/* 返工任务数 */]
      }
    ]
  }
}
```

---

## 8. production_manager - 生产主管

### 数据权限
- 查看生产部所有生产工人的数据

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| totalTasks | 部门任务 | 生产部总任务数 |
| avgQualityRate | 平均质检率 | 部门平均质检通过率 |
| totalOutput | 总产出 | 完成的产品数量 |
| topWorker | 最佳员工 | 完成任务最多的工人 |

### 图表配置（3 个）

#### 图表 1：生产工人工作量（柱状图）
与设计主管的设计师工作量类似。

#### 图表 2：质检通过率趋势（折线图）
部门整体的质检通过率趋势。

#### 图表 3：生产流转漏斗（漏斗图）
```json
{
  "key": "productionFunnel",
  "title": "生产流转漏斗",
  "type": "funnel",
  "data": {
    "items": [
      { "name": "接收任务", "value": 200 },
      { "name": "生产中", "value": 180 },
      { "name": "待质检", "value": 160 },
      { "name": "质检通过", "value": 150 },
      { "name": "入库", "value": 145 }
    ]
  }
}
```

---

## 9. quality - 质检员/质检主管

### 数据权限
- 质检员：只能查看分配给自己的质检任务
- 质检主管：查看质检部所有数据

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| totalQC | 质检总数 | 质检任务总数 |
| passCount | 通过数量 | 质检通过的数量 |
| failCount | 不合格数量 | 质检不通过的数量 |
| passRate | 通过率 | 质检通过率百分比 |

### 图表配置（2 个）

#### 图表 1：质检结果趋势（折线图）
```json
{
  "key": "qcResultTrend",
  "title": "质检结果趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 时间轴 */],
    "series": [
      { "name": "通过", "data": [/* 通过数 */] },
      { "name": "不合格", "data": [/* 不合格数 */] }
    ]
  }
}
```

#### 图表 2：产品类型分布（饼图）
```json
{
  "key": "productTypeDistribution",
  "title": "产品类型分布",
  "type": "pie",
  "data": {
    "items": [
      { "name": "医疗器械A", "value": 120 },
      { "name": "医疗器械B", "value": 80 },
      { "name": "医疗器械C", "value": 60 },
      { "name": "其他", "value": 40 }
    ]
  }
}
```

---

## 10. warehouse - 仓库管理员

### 数据权限
- 查看所有库存和出入库数据

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| totalStock | 库存总数 | 当前库存总量 |
| inboundToday | 今日入库 | 今日入库数量 |
| outboundToday | 今日出库 | 今日出库数量 |
| lowStockCount | 低库存预警 | 低于安全库存的物料数 |

### 图表配置（2 个）

#### 图表 1：出入库趋势（折线图）
```json
{
  "key": "stockTrend",
  "title": "出入库趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 时间轴 */],
    "series": [
      { "name": "入库", "data": [/* 入库数 */] },
      { "name": "出库", "data": [/* 出库数 */] }
    ]
  }
}
```

#### 图表 2：库存分布（环形图）
```json
{
  "key": "stockDistribution",
  "title": "库存分布",
  "type": "ring",
  "data": {
    "items": [
      { "name": "原材料", "value": 1200 },
      { "name": "半成品", "value": 800 },
      { "name": "成品", "value": 600 },
      { "name": "包装材料", "value": 300 }
    ]
  }
}
```

### 待办事项

```json
[
  {
    "id": 1,
    "title": "低库存预警",
    "count": 5,
    "link": "/inventory?alert=low",
    "urgent": true
  },
  {
    "id": 2,
    "title": "待入库单据",
    "count": 8,
    "link": "/inbound?status=pending"
  }
]
```

---

## 11. finance - 财务

### 数据权限
- 查看所有财务相关数据

### KPI 卡片（4 个）

| key | title | 说明 |
|-----|-------|------|
| totalRevenue | 总营收 | 指定时间范围内总营收 |
| receivableAmount | 应收账款 | 未收款的订单金额 |
| receivedAmount | 已收账款 | 已收款的金额 |
| overdueAmount | 逾期账款 | 超过账期未收款的金额 |

### 图表配置（3 个）

#### 图表 1：营收趋势（折线图）
```json
{
  "key": "revenueTrend",
  "title": "营收趋势",
  "type": "line",
  "data": {
    "xAxis": [/* 时间轴 */],
    "series": [
      {
        "name": "营收(万元)",
        "data": [/* 营收数据 */]
      }
    ]
  }
}
```

#### 图表 2：回款状态（饼图）
```json
{
  "key": "paymentStatus",
  "title": "回款状态",
  "type": "pie",
  "data": {
    "items": [
      { "name": "已回款", "value": 850000 },
      { "name": "未回款", "value": 320000 },
      { "name": "逾期", "value": 80000 }
    ]
  }
}
```

#### 图表 3：各部门业绩（柱状图）
```json
{
  "key": "deptRevenue",
  "title": "各部门业绩",
  "type": "bar",
  "data": {
    "xAxis": ["华东区", "华北区", "华南区", "西南区"],
    "series": [
      {
        "name": "营收(万元)",
        "data": [450, 380, 320, 180]
      }
    ]
  }
}
```

### 待办事项

```json
[
  {
    "id": 1,
    "title": "逾期账款",
    "count": 12,
    "link": "/receivable?status=overdue",
    "urgent": true
  },
  {
    "id": 2,
    "title": "待开发票",
    "count": 8,
    "link": "/invoice?status=pending"
  }
]
```

---

## 总结

### 开发优先级建议

**第一批（核心角色）：**
1. salesman - 最常用的业务角色
2. designer - 设计环节核心用户
3. super_admin - 管理员查看全局数据

**第二批（管理角色）：**
4. design_manager - 设计团队管理
5. production_manager - 生产团队管理
6. area_manager - 区域管理

**第三批（辅助角色）：**
7. production - 生产工人
8. quality - 质检员
9. warehouse - 仓库管理
10. finance - 财务
11. company_admin - 公司管理员

### 数据查询性能建议

1. **建立索引**：
   - `orders (salesman_id, create_time, status)`
   - `workorders (designer_id, create_time, status)`
   - `production_tasks (worker_id, create_time, status)`

2. **使用物化视图**：
   - 每日聚合统计表（避免实时计算大量历史数据）
   - 部门/区域汇总表

3. **缓存策略**：
   - Redis 缓存 5-10 分钟
   - today 数据缓存 1 分钟
   - week/month/quarter/year 数据缓存 10 分钟

4. **异步计算**：
   - 定时任务（每 10 分钟）预计算常用统计指标
   - 避免用户请求时实时聚合大量数据
