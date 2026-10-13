# 数据看板 API 完整响应示例

## 目录

1. [super_admin 完整示例](#1-super_admin---超级管理员完整示例)
2. [salesman 完整示例](#2-salesman---业务员完整示例)
3. [designer 完整示例](#3-designer---设计师完整示例)
4. [design_manager 完整示例](#4-design_manager---设计主管完整示例)
5. [finance 完整示例](#5-finance---财务完整示例)
6. [时间范围示例对比](#6-时间范围示例对比)

---

## 1. super_admin - 超级管理员完整示例

### 请求
```http
GET /yi/dashboard/super_admin?timeRange=today
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "cards": [
      {
        "key": "totalOrders",
        "title": "订单总数",
        "value": 156,
        "unit": "单",
        "change": "+12.5%",
        "trend": "up",
        "link": "/order"
      },
      {
        "key": "totalRevenue",
        "title": "总营收",
        "value": "328.5",
        "unit": "万元",
        "change": "+8.3%",
        "trend": "up",
        "link": "/finance/revenue"
      },
      {
        "key": "totalUsers",
        "title": "用户总数",
        "value": 248,
        "unit": "人",
        "change": "+5",
        "trend": "up",
        "link": "/system/user"
      },
      {
        "key": "avgOrderCycle",
        "title": "平均订单周期",
        "value": "432",
        "unit": "小时",
        "change": "-15h",
        "trend": "down",
        "link": "/report/cycle"
      }
    ],
    "charts": [
      {
        "key": "yearComparison",
        "title": "同比数据对比",
        "type": "line",
        "data": {
          "xAxis": ["1月", "2月", "3月", "4月", "5月", "6月"],
          "series": [
            {
              "name": "今年订单",
              "data": [820, 932, 901, 934, 1290, 1330]
            },
            {
              "name": "去年订单",
              "data": [620, 732, 701, 734, 1090, 1130]
            }
          ]
        }
      },
      {
        "key": "monthComparison",
        "title": "环比数据对比",
        "type": "line",
        "data": {
          "xAxis": ["第1周", "第2周", "第3周", "第4周"],
          "series": [
            {
              "name": "本月订单",
              "data": [320, 302, 341, 374]
            },
            {
              "name": "上月订单",
              "data": [280, 260, 290, 310]
            }
          ]
        }
      },
      {
        "key": "orderTrend",
        "title": "订单趋势",
        "type": "line",
        "data": {
          "xAxis": ["0时", "4时", "8时", "12时", "16时", "20时", "23时"],
          "series": [
            {
              "name": "订单数",
              "data": [12, 8, 25, 38, 45, 32, 15]
            }
          ]
        }
      },
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
      },
      {
        "key": "userActivity",
        "title": "用户活跃热力图",
        "type": "heatmap",
        "data": {
          "xAxis": ["0时", "2时", "4时", "6时", "8时", "10时", "12时", "14时", "16时", "18时", "20时", "22时"],
          "yAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
          "items": [
            [0, 0, 5], [1, 0, 8], [2, 0, 3], [3, 0, 2], [4, 0, 12], [5, 0, 25], [6, 0, 35], [7, 0, 28], [8, 0, 30], [9, 0, 20], [10, 0, 15], [11, 0, 10],
            [0, 1, 7], [1, 1, 10], [2, 1, 5], [3, 1, 3], [4, 1, 15], [5, 1, 28], [6, 1, 38], [7, 1, 32], [8, 1, 35], [9, 1, 22], [10, 1, 18], [11, 1, 12],
            [0, 2, 6], [1, 2, 9], [2, 2, 4], [3, 2, 3], [4, 2, 14], [5, 2, 26], [6, 2, 36], [7, 2, 30], [8, 2, 33], [9, 2, 21], [10, 2, 16], [11, 2, 11],
            [0, 3, 8], [1, 3, 11], [2, 3, 6], [3, 3, 4], [4, 3, 16], [5, 3, 30], [6, 3, 40], [7, 3, 34], [8, 3, 37], [9, 3, 24], [10, 3, 19], [11, 3, 13],
            [0, 4, 7], [1, 4, 10], [2, 4, 5], [3, 4, 3], [4, 4, 15], [5, 4, 28], [6, 4, 38], [7, 4, 32], [8, 4, 35], [9, 4, 22], [10, 4, 17], [11, 4, 12],
            [0, 5, 3], [1, 5, 5], [2, 5, 2], [3, 5, 1], [4, 5, 8], [5, 5, 15], [6, 5, 20], [7, 5, 18], [8, 5, 22], [9, 5, 12], [10, 5, 10], [11, 5, 6],
            [0, 6, 2], [1, 6, 4], [2, 6, 1], [3, 6, 1], [4, 6, 6], [5, 6, 12], [6, 6, 18], [7, 6, 15], [8, 6, 20], [9, 6, 10], [10, 6, 8], [11, 6, 5]
          ]
        }
      }
    ],
    "todos": [
      {
        "id": 1,
        "title": "待审批申请",
        "count": 8,
        "link": "/approval?status=pending",
        "urgent": true
      },
      {
        "id": 2,
        "title": "系统异常警告",
        "count": 2,
        "link": "/system/monitor",
        "urgent": true
      },
      {
        "id": 3,
        "title": "待处理工单",
        "count": 15,
        "link": "/workorder?status=pending"
      }
    ],
    "system": {
      "healthStatus": "healthy",
      "avgResponseTime": "120ms",
      "onlineUsers": 156,
      "avgOrderCycle": "432h"
    }
  }
}
```

---

## 2. salesman - 业务员完整示例

### 请求
```http
GET /yi/dashboard/salesman?timeRange=week
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "cards": [
      {
        "key": "myOrders",
        "title": "我的订单",
        "value": 45,
        "unit": "单",
        "change": "+8",
        "trend": "up",
        "link": "/order"
      },
      {
        "key": "pendingOrders",
        "title": "待处理订单",
        "value": 12,
        "unit": "单",
        "link": "/order?status=pending"
      },
      {
        "key": "completedOrders",
        "title": "已完成订单",
        "value": 28,
        "unit": "单",
        "change": "+5",
        "trend": "up",
        "link": "/order?status=completed"
      },
      {
        "key": "myRevenue",
        "title": "我的业绩",
        "value": "68.5",
        "unit": "万元",
        "change": "+12.3%",
        "trend": "up",
        "link": "/report/my-performance"
      }
    ],
    "charts": [
      {
        "key": "orderTrend",
        "title": "订单趋势",
        "type": "line",
        "data": {
          "xAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
          "series": [
            {
              "name": "订单数",
              "data": [5, 8, 6, 9, 7, 5, 5]
            }
          ]
        }
      },
      {
        "key": "orderPhase",
        "title": "订单阶段分布",
        "type": "pie",
        "data": {
          "items": [
            { "name": "待接单", "value": 5 },
            { "name": "设计中", "value": 8 },
            { "name": "生产中", "value": 12 },
            { "name": "质检中", "value": 6 },
            { "name": "已完成", "value": 14 }
          ]
        }
      }
    ],
    "todos": [
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
      },
      {
        "id": 3,
        "title": "客户催单",
        "count": 2,
        "link": "/order?status=urgent",
        "urgent": true
      }
    ]
  }
}
```

---

## 3. designer - 设计师完整示例

### 请求
```http
GET /yi/dashboard/designer?timeRange=month
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "cards": [
      {
        "key": "myWorkorders",
        "title": "我的工单",
        "value": 68,
        "unit": "单",
        "change": "+12",
        "trend": "up",
        "link": "/workorder"
      },
      {
        "key": "pendingReview",
        "title": "待审核",
        "value": 8,
        "unit": "单",
        "link": "/workorder?status=pending_review"
      },
      {
        "key": "reworkCount",
        "title": "返工次数",
        "value": 5,
        "unit": "次",
        "change": "-2",
        "trend": "down"
      },
      {
        "key": "completedWorkorders",
        "title": "已完成",
        "value": 52,
        "unit": "单",
        "change": "+10",
        "trend": "up",
        "link": "/workorder?status=completed"
      }
    ],
    "charts": [
      {
        "key": "workorderTrend",
        "title": "工单趋势",
        "type": "line",
        "data": {
          "xAxis": ["6月1日", "6月5日", "6月10日", "6月15日", "6月20日", "6月25日", "6月30日"],
          "series": [
            {
              "name": "工单数",
              "data": [8, 12, 10, 15, 11, 14, 10]
            }
          ]
        }
      },
      {
        "key": "workorderStatus",
        "title": "工单状态分布",
        "type": "pie",
        "data": {
          "items": [
            { "name": "设计中", "value": 15 },
            { "name": "待审核", "value": 8 },
            { "name": "已通过", "value": 40 },
            { "name": "需返工", "value": 5 }
          ]
        }
      }
    ],
    "todos": [
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
      },
      {
        "id": 3,
        "title": "返工修改",
        "count": 3,
        "link": "/workorder?status=rework",
        "urgent": true
      }
    ]
  }
}
```

---

## 4. design_manager - 设计主管完整示例

### 请求
```http
GET /yi/dashboard/design_manager?timeRange=quarter
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "cards": [
      {
        "key": "totalWorkorders",
        "title": "部门工单",
        "value": 856,
        "unit": "单",
        "change": "+125",
        "trend": "up",
        "link": "/workorder"
      },
      {
        "key": "avgPassRate",
        "title": "平均通过率",
        "value": "87.5",
        "unit": "%",
        "change": "+3.2%",
        "trend": "up"
      },
      {
        "key": "avgReviewTime",
        "title": "平均审核时长",
        "value": "24",
        "unit": "小时",
        "change": "-4h",
        "trend": "down"
      },
      {
        "key": "topDesigner",
        "title": "最佳设计师",
        "value": "张小明",
        "change": "95单"
      }
    ],
    "charts": [
      {
        "key": "designerWorkload",
        "title": "设计师工作量",
        "type": "bar",
        "data": {
          "xAxis": ["张小明", "李红", "王强", "赵敏", "孙涛"],
          "series": [
            {
              "name": "工单数",
              "data": [95, 88, 82, 78, 72]
            }
          ]
        }
      },
      {
        "key": "reviewPassRate",
        "title": "审核通过率趋势",
        "type": "line",
        "data": {
          "xAxis": ["4月", "5月", "6月"],
          "series": [
            {
              "name": "通过率(%)",
              "data": [82, 85, 87.5]
            }
          ]
        }
      },
      {
        "key": "designFunnel",
        "title": "设计流转漏斗",
        "type": "funnel",
        "data": {
          "items": [
            { "name": "接收工单", "value": 900 },
            { "name": "设计中", "value": 850 },
            { "name": "提交审核", "value": 820 },
            { "name": "审核通过", "value": 750 },
            { "name": "交付生产", "value": 740 }
          ]
        }
      }
    ],
    "todos": [
      {
        "id": 1,
        "title": "待分配工单",
        "count": 12,
        "link": "/workorder?status=unassigned",
        "urgent": true
      },
      {
        "id": 2,
        "title": "待审核工单",
        "count": 25,
        "link": "/workorder?status=pending_review"
      },
      {
        "id": 3,
        "title": "超期工单",
        "count": 5,
        "link": "/workorder?status=overdue",
        "urgent": true
      }
    ]
  }
}
```

---

## 5. finance - 财务完整示例

### 请求
```http
GET /yi/dashboard/finance?timeRange=year
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "cards": [
      {
        "key": "totalRevenue",
        "title": "总营收",
        "value": "3280",
        "unit": "万元",
        "change": "+18.5%",
        "trend": "up",
        "link": "/finance/revenue"
      },
      {
        "key": "receivableAmount",
        "title": "应收账款",
        "value": "850",
        "unit": "万元",
        "link": "/finance/receivable"
      },
      {
        "key": "receivedAmount",
        "title": "已收账款",
        "value": "2100",
        "unit": "万元",
        "change": "+320万",
        "trend": "up"
      },
      {
        "key": "overdueAmount",
        "title": "逾期账款",
        "value": "180",
        "unit": "万元",
        "change": "-30万",
        "trend": "down",
        "link": "/finance/receivable?status=overdue"
      }
    ],
    "charts": [
      {
        "key": "revenueTrend",
        "title": "营收趋势",
        "type": "line",
        "data": {
          "xAxis": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
          "series": [
            {
              "name": "营收(万元)",
              "data": [220, 180, 250, 280, 290, 310, 320, 300, 280, 290, 310, 350]
            }
          ]
        }
      },
      {
        "key": "paymentStatus",
        "title": "回款状态",
        "type": "pie",
        "data": {
          "items": [
            { "name": "已回款", "value": 2100 },
            { "name": "未回款", "value": 850 },
            { "name": "逾期", "value": 180 }
          ]
        }
      },
      {
        "key": "deptRevenue",
        "title": "各部门业绩",
        "type": "bar",
        "data": {
          "xAxis": ["华东区", "华北区", "华南区", "西南区", "西北区"],
          "series": [
            {
              "name": "营收(万元)",
              "data": [850, 680, 520, 380, 280]
            }
          ]
        }
      }
    ],
    "todos": [
      {
        "id": 1,
        "title": "逾期账款",
        "count": 12,
        "link": "/finance/receivable?status=overdue",
        "urgent": true
      },
      {
        "id": 2,
        "title": "待开发票",
        "count": 28,
        "link": "/finance/invoice?status=pending"
      },
      {
        "id": 3,
        "title": "待审核报销",
        "count": 15,
        "link": "/finance/reimbursement?status=pending"
      }
    ]
  }
}
```

---

## 6. 时间范围示例对比

### today（今日）- X 轴按小时
```json
{
  "xAxis": ["0时", "2时", "4时", "6时", "8时", "10时", "12时", "14时", "16时", "18时", "20时", "22时"],
  "series": [{ "name": "订单数", "data": [2, 1, 0, 3, 8, 15, 20, 18, 22, 15, 10, 5] }]
}
```

### week（本周）- X 轴按星期
```json
{
  "xAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  "series": [{ "name": "订单数", "data": [45, 52, 48, 58, 50, 35, 28] }]
}
```

### month（本月）- X 轴按日期
```json
{
  "xAxis": ["6月1日", "6月5日", "6月10日", "6月15日", "6月20日", "6月25日", "6月30日"],
  "series": [{ "name": "订单数", "data": [120, 135, 128, 145, 138, 150, 142] }]
}
```

### quarter（本季度）- X 轴按月
```json
{
  "xAxis": ["4月", "5月", "6月"],
  "series": [{ "name": "订单数", "data": [850, 920, 980] }]
}
```

### year（本年）- X 轴按月
```json
{
  "xAxis": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  "series": [{ "name": "订单数", "data": [820, 780, 900, 850, 920, 980, 0, 0, 0, 0, 0, 0] }]
}
```
_注：未到的月份填充 0 或省略数据点_

---

## 7. 错误响应示例

### 401 未授权
```json
{
  "code": 401,
  "message": "未授权访问，请先登录"
}
```

### 403 无权限
```json
{
  "code": 403,
  "message": "无权访问该角色数据"
}
```

### 404 角色不存在
```json
{
  "code": 404,
  "message": "角色代码不存在: invalid_role"
}
```

### 400 参数错误
```json
{
  "code": 400,
  "message": "无效的时间范围参数: invalid_range"
}
```

### 500 服务器错误
```json
{
  "code": 500,
  "message": "服务器内部错误，请稍后重试"
}
```

---

## 8. 开发测试建议

### 测试用例清单

**基础功能测试：**
- [ ] 每个角色返回正确的卡片数量和字段
- [ ] 每个角色返回正确的图表类型和数量
- [ ] super_admin 有 system 字段，其他角色没有
- [ ] 所有 link 字段都是有效的路由路径
- [ ] 数值字段类型正确（number 或 string）

**时间范围测试：**
- [ ] today: X 轴为小时（0-23 时）
- [ ] week: X 轴为星期（周一到周日）
- [ ] month: X 轴为日期（1-30/31 号）
- [ ] quarter: X 轴为月份（3 个月）
- [ ] year: X 轴为月份（1-12 月）

**数据一致性测试：**
- [ ] xAxis 长度 = series[0].data 长度
- [ ] 饼图 items 数组有 3-8 项
- [ ] 漏斗图 items 数组按 value 降序排列
- [ ] 热力图 items 中的索引在 xAxis/yAxis 范围内

**权限测试：**
- [ ] salesman 只能看到自己的数据（WHERE salesman_id = ?）
- [ ] designer 只能看到自己的工单（WHERE designer_id = ?）
- [ ] area_manager 只能看到本区域数据（WHERE area_id = ?）

### Postman 测试集

```javascript
// 测试所有角色端点
const roles = ['super_admin', 'salesman', 'designer', 'production', 'quality', 
               'finance', 'area_manager', 'design_manager', 'production_manager', 
               'warehouse', 'company_admin'];
const timeRanges = ['today', 'week', 'month', 'quarter', 'year'];

roles.forEach(role => {
  timeRanges.forEach(range => {
    pm.sendRequest({
      url: `http://localhost:8080/yi/dashboard/${role}?timeRange=${range}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + pm.environment.get('token') }
    }, (err, res) => {
      pm.test(`${role} - ${range}`, () => {
        pm.expect(res.code).to.equal(200);
        pm.expect(res.json().code).to.equal(0);
        pm.expect(res.json().data.cards).to.be.an('array');
        pm.expect(res.json().data.charts).to.be.an('array');
      });
    });
  });
});
```

---

## 9. 性能基准

### 响应时间目标

| 时间范围 | 数据量 | 目标响应时间 |
|---------|--------|-------------|
| today | 小 | < 200ms |
| week | 小 | < 300ms |
| month | 中 | < 500ms |
| quarter | 中 | < 800ms |
| year | 大 | < 1000ms |

### 优化建议

1. **数据库索引**：
   ```sql
   CREATE INDEX idx_orders_salesman_time ON orders(salesman_id, create_time);
   CREATE INDEX idx_orders_status_time ON orders(status, create_time);
   ```

2. **Redis 缓存键设计**：
   ```
   dashboard:{roleCode}:{userId}:{timeRange} -> JSON
   TTL: today=60s, week/month=300s, quarter/year=600s
   ```

3. **异步预计算**：
   - 每 10 分钟定时任务计算常用统计指标
   - 存储到 `dashboard_cache` 表

---

## 总结

所有示例响应都严格遵循 `DashboardVO` 接口定义，前端可以零修改直接使用。建议后端开发时：

1. **先实现 salesman 角色**：最简单，只需过滤 `salesman_id`
2. **复用 SQL 逻辑**：不同角色的 SQL 大同小异，提取公共方法
3. **分批上线**：每完成 2-3 个角色就部署测试，避免一次性开发太多
4. **监控性能**：上线后观察响应时间，超过 500ms 的端点需优化

如有疑问，请参考前端 mock 数据文件：`/src/views/home/mock.ts`
