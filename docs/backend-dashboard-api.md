# 数据看板 API 实现文档

## 目录

1. [接口概述](#接口概述)
2. [请求规范](#请求规范)
3. [响应数据结构](#响应数据结构)
4. [角色配置清单](#角色配置清单)
5. [图表数据格式](#图表数据格式)
6. [完整示例](#完整示例)

---

## 接口概述

### 端点定义

```
GET /yi/dashboard/{roleCode}
```

### 功能说明

根据用户角色和时间范围返回个性化的数据看板，包括：
- **KPI 卡片**：关键指标（数值、趋势、变化率）
- **可视化图表**：趋势图、饼图、柱状图、漏斗图、热力图
- **待办事项**：需要处理的任务列表
- **系统监控**（仅超级管理员）：系统健康状态和性能指标

### 支持的角色

| roleCode | 角色名称 | 看板内容 |
|----------|---------|---------|
| `super_admin` | 超级管理员 | 全局数据 + 系统监控 |
| `company_admin` | 公司管理员 | 全局数据 |
| `salesman` | 业务员 | 订单相关数据 |
| `area_manager` | 区域经理 | 团队业绩数据 |
| `designer` | 设计师 | 设计工单数据 |
| `design_manager` | 设计主管 | 设计团队管理 |
| `production` | 生产工人 | 生产任务数据 |
| `production_manager` | 生产主管 | 生产团队管理 |
| `quality` | 质检员/质检主管 | 质检数据 |
| `warehouse` | 仓库管理员 | 库存出入库数据 |
| `finance` | 财务 | 财务数据 |

---

## 请求规范

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleCode | string | 是 | 用户角色代码（见上表） |

### 查询参数

| 参数 | 类型 | 必填 | 可选值 | 说明 |
|------|------|------|--------|------|
| timeRange | string | 是 | `today` / `week` / `month` / `quarter` / `year` | 时间范围 |
| startTime | string | 否 | ISO 8601 格式 | 自定义起始时间（timeRange=custom 时使用） |
| endTime | string | 否 | ISO 8601 格式 | 自定义结束时间（timeRange=custom 时使用） |

### 时间范围计算规则

| timeRange | 时间范围定义 | 示例（假设今天是 2026-06-22） |
|-----------|------------|------------------------------|
| `today` | 今日 00:00:00 ~ 23:59:59 | 2026-06-22 00:00:00 ~ 2026-06-22 23:59:59 |
| `week` | 本周一 00:00:00 ~ 本周日 23:59:59 | 2026-06-22（周一）~ 2026-06-28（周日） |
| `month` | 本月 1 号 00:00:00 ~ 月末 23:59:59 | 2026-06-01 ~ 2026-06-30 |
| `quarter` | 本季度首日 00:00:00 ~ 季度末日 23:59:59 | 2026-04-01 ~ 2026-06-30（Q2） |
| `year` | 本年 1 月 1 日 ~ 12 月 31 日 | 2026-01-01 ~ 2026-12-31 |

### 请求头

```
Authorization: Bearer {token}
Content-Type: application/json
```

### 请求示例

```bash
# 获取业务员今日数据
GET /yi/dashboard/salesman?timeRange=today

# 获取设计主管本月数据
GET /yi/dashboard/design_manager?timeRange=month

# 获取超级管理员本年数据
GET /yi/dashboard/super_admin?timeRange=year
```

---

## 响应数据结构

### 标准响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "cards": [...],      // KPI 卡片数组
    "charts": [...],     // 图表配置数组
    "todos": [...],      // 待办事项数组
    "system": {...}      // 系统监控（仅 super_admin）
  }
}
```

### 数据类型定义

#### 1. CardVO（KPI 卡片）

```typescript
interface CardVO {
  key: string          // 唯一标识，如 "totalOrders"
  title: string        // 卡片标题，如 "订单总数"
  value: number | string  // 主要数值，如 156 或 "156"
  unit?: string        // 单位，如 "单"、"元"、"个"
  change?: string      // 变化率，如 "+12.5%"、"-3.2%"
  trend?: 'up' | 'down' | 'flat'  // 趋势：up=上升红色 down=下降绿色 flat=持平灰色
  link?: string        // 点击跳转路径，如 "/order"
}
```

**示例：**
```json
{
  "key": "totalOrders",
  "title": "订单总数",
  "value": 156,
  "unit": "单",
  "change": "+12.5%",
  "trend": "up",
  "link": "/order"
}
```

#### 2. ChartVO（图表配置）

```typescript
interface ChartVO {
  key: string          // 唯一标识，如 "orderTrend"
  title: string        // 图表标题，如 "订单趋势"
  type: 'line' | 'bar' | 'pie' | 'ring' | 'funnel' | 'heatmap'  // 图表类型
  data: any           // 图表数据（格式见下文各图表类型）
}
```

#### 3. TodoVO（待办事项）

```typescript
interface TodoVO {
  id: number          // 待办 ID
  title: string       // 待办标题，如 "待审核订单"
  count?: number      // 数量，如 15
  link?: string       // 点击跳转路径，如 "/order?status=pending"
  urgent?: boolean    // 是否紧急（true 显示红点）
}
```

**示例：**
```json
{
  "id": 1,
  "title": "待审核订单",
  "count": 15,
  "link": "/order?status=pending",
  "urgent": true
}
```

#### 4. SystemVO（系统监控，仅 super_admin）

```typescript
interface SystemVO {
  healthStatus: 'healthy' | 'warning' | 'error'  // 健康状态
  avgResponseTime: string     // 平均响应时间，如 "120ms"
  onlineUsers: number         // 在线用户数
  avgOrderCycle: string       // 平均订单周期，如 "432h"
}
```

**示例：**
```json
{
  "healthStatus": "healthy",
  "avgResponseTime": "120ms",
  "onlineUsers": 156,
  "avgOrderCycle": "432h"
}
```

---

## 图表数据格式

### 1. 折线图（line）

**适用场景：** 趋势分析（订单趋势、工单趋势、金额趋势等）

**数据格式：**
```typescript
{
  xAxis: string[],           // X 轴标签数组
  series: Array<{
    name: string,            // 系列名称
    data: number[]           // 数据点数组（长度需与 xAxis 一致）
  }>
}
```

**示例：单条折线**
```json
{
  "key": "orderTrend",
  "title": "订单趋势",
  "type": "line",
  "data": {
    "xAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "series": [
      {
        "name": "订单数",
        "data": [120, 132, 101, 134, 90, 130, 110]
      }
    ]
  }
}
```

**示例：多条折线（对比）**
```json
{
  "key": "yearComparison",
  "title": "同比数据对比",
  "type": "line",
  "data": {
    "xAxis": ["1月", "2月", "3月", "4月", "5月", "6月"],
    "series": [
      {
        "name": "今年",
        "data": [820, 932, 901, 934, 1290, 1330]
      },
      {
        "name": "去年",
        "data": [620, 732, 701, 734, 1090, 1130]
      }
    ]
  }
}
```

---

### 2. 柱状图（bar）

**适用场景：** 对比分析（部门业绩、设计师工作量、生产工人产出等）

**数据格式：** 与折线图相同
```typescript
{
  xAxis: string[],
  series: Array<{
    name: string,
    data: number[]
  }>
}
```

**示例：单组柱状图**
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
        "data": [120, 200, 150, 80, 70]
      }
    ]
  }
}
```

**示例：多组柱状图（分组对比）**
```json
{
  "key": "monthComparison",
  "title": "环比数据对比",
  "type": "bar",
  "data": {
    "xAxis": ["设计", "生产", "质检"],
    "series": [
      {
        "name": "本月",
        "data": [320, 302, 301]
      },
      {
        "name": "上月",
        "data": [220, 182, 191]
      }
    ]
  }
}
```

---

### 3. 饼图（pie）

**适用场景：** 占比分析（订单阶段分布、产品类型分布、回款状态等）

**数据格式：**
```typescript
{
  items: Array<{
    name: string,    // 分类名称
    value: number    // 数值
  }>
}
```

**示例：**
```json
{
  "key": "orderPhase",
  "title": "订单阶段分布",
  "type": "pie",
  "data": {
    "items": [
      { "name": "设计中", "value": 45 },
      { "name": "生产中", "value": 30 },
      { "name": "质检中", "value": 15 },
      { "name": "已完成", "value": 80 }
    ]
  }
}
```

---

### 4. 环形图（ring）

**适用场景：** 与饼图相同，但中心留空显得更现代化

**数据格式：** 与饼图完全相同
```typescript
{
  items: Array<{
    name: string,
    value: number
  }>
}
```

**示例：**
```json
{
  "key": "stockDistribution",
  "title": "库存分布",
  "type": "ring",
  "data": {
    "items": [
      { "name": "原材料", "value": 1200 },
      { "name": "半成品", "value": 800 },
      { "name": "成品", "value": 600 }
    ]
  }
}
```

---

### 5. 漏斗图（funnel）

**适用场景：** 流程转化分析（订单流转、设计审核流程、生产流程等）

**数据格式：**
```typescript
{
  items: Array<{
    name: string,    // 阶段名称
    value: number    // 该阶段数量（从大到小排列）
  }>
}
```

**示例：**
```json
{
  "key": "orderFunnel",
  "title": "订单流转漏斗",
  "type": "funnel",
  "data": {
    "items": [
      { "name": "接单", "value": 200 },
      { "name": "设计", "value": 180 },
      { "name": "生产", "value": 150 },
      { "name": "质检", "value": 140 },
      { "name": "交付", "value": 135 }
    ]
  }
}
```

---

### 6. 热力图（heatmap）

**适用场景：** 时间模式分析（用户活跃时段、提单高峰时间等）

**数据格式：**
```typescript
{
  xAxis: string[],        // X 轴标签（如小时）
  yAxis: string[],        // Y 轴标签（如星期）
  items: Array<[number, number, number]>  // [x索引, y索引, 数值]
}
```

**示例：**
```json
{
  "key": "userActivity",
  "title": "用户活跃热力图",
  "type": "heatmap",
  "data": {
    "xAxis": ["0时", "2时", "4时", "6时", "8时", "10时", "12时", "14时", "16时", "18时", "20时", "22时"],
    "yAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "items": [
      [0, 0, 5], [1, 0, 8], [2, 0, 3], [3, 0, 2], [4, 0, 12],
      [0, 1, 7], [1, 1, 10], [2, 1, 5], [3, 1, 3], [4, 1, 15],
      // ... 更多数据点
      [10, 6, 20], [11, 6, 18]
    ]
  }
}
```

**说明：**
- `items` 中的每个元素 `[x, y, value]` 表示：
  - `x`: xAxis 的索引（如 0 = "0时"）
  - `y`: yAxis 的索引（如 0 = "周一"）
  - `value`: 该位置的数值（会映射到颜色深浅）

---

## 角色配置清单

详细的角色配置请查看：[角色配置详情文档](./backend-dashboard-roles.md)

---

## 完整响应示例

详细的完整示例请查看：[完整响应示例文档](./backend-dashboard-examples.md)

---

## 注意事项

### 1. 数据一致性

- `xAxis` 和 `series[].data` 的长度必须一致
- 饼图/环形图/漏斗图的 `items` 数组建议 3-8 项（过多影响可读性）
- 热力图的 `items` 中的索引必须在 `xAxis` 和 `yAxis` 范围内

### 2. 性能优化

- 建议后端缓存 5-10 分钟（前端每 5 分钟自动刷新）
- `today` 数据可以缓存 1 分钟
- `week/month/quarter/year` 数据可以缓存 10 分钟

### 3. 错误处理

**401 未授权：**
```json
{
  "code": 401,
  "message": "未授权访问"
}
```

**403 无权限：**
```json
{
  "code": 403,
  "message": "无权访问该角色数据"
}
```

**500 服务错误：**
```json
{
  "code": 500,
  "message": "服务器内部错误"
}
```

### 4. 字段说明

- 所有 `link` 字段都是可选的，不需要跳转功能可以省略
- `trend` 字段规则：
  - `up`：数值上升，显示红色上箭头（正面指标如订单数、营收）
  - `down`：数值下降，显示绿色下箭头（负面指标如返工率）
  - `flat`：无变化，显示灰色横线
- `system` 字段仅在 `roleCode === 'super_admin'` 时返回，其他角色省略

---

## 开发建议

1. **复用 mock 数据结构**：前端 `/src/views/home/mock.ts` 文件包含所有角色的完整示例，可以直接参考
2. **分角色开发**：建议先实现 `salesman` 和 `designer` 两个基础角色，验证通过后再扩展其他角色
3. **渐进式上线**：可以先返回简化版数据（只有 cards，charts 为空数组），逐步完善图表
4. **SQL 优化**：建议使用物化视图或定时任务预计算统计数据，避免实时查询影响性能

---

## 联系方式

如有疑问，请联系前端开发团队或查看详细示例文档。
