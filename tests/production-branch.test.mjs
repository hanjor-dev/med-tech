import { test } from 'node:test'
import assert from 'node:assert/strict'
import { usesProcessingApplication, processingAction } from '../src/views/business/productionBranch.ts'

test('加工申请只用于本地实体非医疗订单，历史空值按实体处理', () => {
  for (const flag of [1, null]) assert.equal(usesProcessingApplication({ orderType: 2, needsPhysicalDelivery: flag }), true)
  for (const flag of [0, 2]) assert.equal(usesProcessingApplication({ orderType: 2, needsPhysicalDelivery: flag }), false)
  assert.equal(usesProcessingApplication({ orderType: 1, needsPhysicalDelivery: 1 }), false)
})

test('设计中可填或查看，设计完成仅查看，权限分别校验', () => {
  assert.equal(processingAction(2020, true, false), 'edit')
  assert.equal(processingAction(2020, false, true), 'view')
  assert.equal(processingAction(2030, true, true), 'view')
  assert.equal(processingAction(8010, true, false), null)
  assert.equal(processingAction(2010, true, true), null)
})
