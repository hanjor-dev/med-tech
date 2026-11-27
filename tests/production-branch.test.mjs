import { test } from 'node:test'
import assert from 'node:assert/strict'
import { usesProcessingApplication, processingAction, productionMenu } from '../src/views/business/productionBranch.ts'
import * as branch from '../src/views/business/productionBranch.ts'

test('加工申请只用于本地实体非医疗订单，历史空值按实体处理', () => {
  for (const flag of [1, null]) assert.equal(usesProcessingApplication({ orderType: 2, needsPhysicalDelivery: flag }, { productionType: 2 }), true)
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

test('实体生产入口按订单类型、状态和权限收拢操作', () => {
  const medical = { orderType: 1, needsPhysicalDelivery: null, status: 2020, productionTypes: [1] }
  const nonMedical = { ...medical, orderType: 2, productionTypes: [2] }
  const all = () => true
  const only = permission => name => name === permission
  const group = (row, permission = all, batch) => productionMenu(row, permission, batch)
  assert.equal(group(medical).title, '医疗器械')
  assert.deepEqual(group(medical).actions.map(a => a.label), ['填写打印信息', '指令单和图纸'])
  assert.equal(group(medical).label, '填写生产信息')
  const completed = { ...medical, status: 3010 }
  assert.equal(group(completed).actions[0].label, '查看打印信息')
  assert.equal(group(completed, all, {batchId: 8, status: 'PRINT_INFO_EDITING'}).label, '填写生产信息')
  assert.equal(group(nonMedical).title, '非医疗器械')
  assert.deepEqual(group(nonMedical).actions.map(a => a.label), ['加工申请单'])
  assert.equal(group(nonMedical, only('design:ProcessingApplicationView')).label, '查看生产信息')
  assert.equal(group({ ...nonMedical, status: 2030 }, only('design:ProcessingApplicationEdit')).actions.length, 0)
  assert.equal(group(medical, only('design:ProcessingApplicationEdit')).actions.length, 0)
  assert.equal(group({ ...medical, status: 2010 }).actions.length, 0)
  const digital = group({ ...nonMedical, needsPhysicalDelivery: 0 })
  assert.equal(digital.title, '非实体交付')
  assert.deepEqual(digital.actions.map(a => a.label), ['填写打印信息', '指令单和图纸'])
})

test('医疗文档可独立修订，入口反映当前批次中相应数据包的编辑能力', () => {
  const documentsOnly = permission => permission === 'design:DocumentPreview'
  const printOnly = permission => permission === 'design:PrintInfo'
  const design = { productionTypes: [1], orderType: 1, needsPhysicalDelivery: 1, status: 2020 }
  assert.equal(productionMenu(design, documentsOnly).label, '填写生产信息')
  assert.deepEqual(productionMenu(design, documentsOnly).actions.map(a => a.label), ['指令单和图纸'])
  const completed = { ...design, status: 2030 }
  assert.equal(productionMenu(completed, documentsOnly).label, '查看生产信息')
  const open = { batchId: 2, status: 'PRINT_INFO_EDITING' }
  assert.equal(productionMenu(completed, documentsOnly, open).label, '填写生产信息')
  const details = { ...completed, packageList: [
    {productionType: 1, batchStatus: "COMPLETED", batchId: 1, canEditPrintInfo: false, canEditDocuments: false},
    {productionType: 1, batchStatus: "OPEN", batchId: 2, canEditPrintInfo: false, canEditDocuments: true},
  ] }
  for (const batch of [undefined, open]) {
    assert.equal(productionMenu(details, documentsOnly, batch).label, '填写生产信息')
    assert.equal(productionMenu(details, printOnly, batch).label, '查看生产信息')
    assert.equal(productionMenu(details, () => true, batch).actions[0].label, '查看打印信息')
  }
  assert.equal(productionMenu(details, documentsOnly, { ...open, status: 'COMPLETED' }).label, '查看生产信息')
  assert.equal(productionMenu({ ...design, packageList: [{ productionType: 1, canEditDocuments: false }] }, documentsOnly).label, '查看生产信息')
})

test('列表和详情按实际包类型分组，空包由资质决定入口，单一反向包只显示自己的工艺', () => {
  const row = { orderType: 1, needsPhysicalDelivery: null, status: 2020, medicalPackageAllowed: true }
  const all = () => true
  for (const source of [
    { productionTypes: [1, 2] },
    { packageList: [{ productionType: 1 }, { productionType: null }] },
  ]) {
    const menu = productionMenu({ ...row, ...source }, all)
    assert.deepEqual(menu.groups?.map(group => [group.title, group.actions.map(item => item.command)]), [
      ['医疗器械', ['printInfo', 'printInfoView']],
      ['非医疗器械', ['processing']],
    ])
  }
  assert.equal(productionMenu({ ...row, packageList: [{ productionType: 1 }] }, all).title, '医疗器械')
  assert.equal(productionMenu({ ...row, productionTypes: [] }, all).title, null)
  assert.equal(usesProcessingApplication(row, { productionType: 1 }), false)
  assert.equal(usesProcessingApplication({ ...row, orderType: 1 }, { productionType: 2 }), true)
})

test('取消批次不产生新工艺入口，详情与有效包类型摘要一致', () => {
  const row = { orderType: 2, status: 2020, needsPhysicalDelivery: 1,
    packageList: [{ productionType: 1, batchId: 8, batchStatus: 'CANCELLED' }, { productionType: 2 }] }
  for (const order of [row, { ...row, productionTypes: [2] }]) {
    assert.deepEqual(productionMenu(order, () => true).actions.map(action => action.command), ['processing'])
  }
})

test('混合包的编辑能力、历史状态和查看权限只影响所属组', () => {
  const row = { orderType: 1, needsPhysicalDelivery: 1, status: 2020, packageList: [
    { productionType: 1, batchStatus: 'COMPLETED', batchId: 8 },
    { productionType: 2, batchStatus: 'OPEN', batchId: 11, editable: true },
  ] }
  const batch = { batchId: 11, status: 'PRINT_INFO_EDITING' }
  const all = productionMenu(row, () => true, batch)
  assert.deepEqual(all.actions.map(action => action.label), ['查看打印信息', '指令单和图纸', '加工申请单'])
  const viewProcessing = productionMenu(row, permission => permission === 'design:ProcessingApplicationView', batch)
  assert.deepEqual(viewProcessing.groups?.map(group => group.title), ['非医疗器械'])
  assert.deepEqual(viewProcessing.actions.map(action => action.label), ['加工申请单'])
  const history = { ...row, packageList: [
    { productionType: 1, batchStatus: 'OPEN', batchId: 11, canEditDocuments: true },
    { productionType: 2, batchStatus: 'COMPLETED', batchId: 8, editable: false },
  ] }
  assert.deepEqual(productionMenu(history, () => true, batch).actions.map(action => action.label),
    ['填写打印信息', '指令单和图纸', '加工申请单'])
  assert.equal(productionMenu(history, permission => permission === 'design:ProcessingApplicationEdit', batch).actions.length, 0)
})

test('非实体和异地订单即使返回包级类型也保留原设计操作', () => {
  for (const flag of [0, 2]) {
    const row = { orderType: 2, needsPhysicalDelivery: flag, status: 2020, productionTypes: [1, 2] }
    const menu = productionMenu(row, () => true)
    assert.deepEqual(menu.groups.map(group => group.title), [flag === 0 ? '非实体交付' : '异地打印'])
    assert.equal(productionMenu({ ...row, status: 2030 }, () => true).actions[0].label, '查看打印信息')
    assert.deepEqual(productionMenu(row, () => false).groups, [])
    assert.deepEqual(menu.actions.map(action => action.command), ['printInfo', 'printInfoView'])
    assert.equal(usesProcessingApplication(row, { productionType: 2 }), false)
  }
})

test('表单只接收本工单同类型数据包，保留可查历史，打开时优先选中当前批次', () => {
  const order = { medicalPackageAllowed: true, id: 10, orderType: 1, needsPhysicalDelivery: 1 }
  const packages = [
    { id: 7, orderId: 11, productionType: 2, batchId: 3 },
    { id: 8, orderId: 10, productionType: null },
    { id: 9, orderId: 10, productionType: 2, batchId: 1 },
    { id: 10, orderId: 10, productionType: 2, batchId: 3, filled: true },
    { id: 11, orderId: 10, productionType: 2, batchId: 3 },
  ]
  const list = branch.packagesForProduction(order, packages, 2)
  assert.deepEqual(list.map(pkg => pkg.id), [8, 9, 10, 11])
  assert.deepEqual(branch.packagesForProduction(order, packages, 1).map(pkg => pkg.id), [8])
  const select = id => branch.initialProductionPackage(list, 3, id, pkg => !pkg.filled)
  assert.equal(select(null)?.id, 11)
  assert.equal(select(10)?.id, 10)
  assert.equal(select(8), undefined)
  assert.equal(select(9), undefined)
  assert.equal(branch.packageEditable(list[0], 3, 'editable'), false)
})

test('未占用包的首次办理取决于资质和现有资料，冲突包排除在两个入口外', () => {
  const row = { orderType: 1, needsPhysicalDelivery: 1, hasUnassignedPackage: true }
  const nonMedical = { ...row, orderType: 2, medicalPackageAllowed: true }
  assert.deepEqual(branch.productionTypesForOrder(nonMedical), [2])
  assert.deepEqual(branch.packagesForProduction(nonMedical, [{ productionType: null }, { productionType: 1 }], 1), [])
  assert.deepEqual(branch.productionTypesForOrder({ ...nonMedical, productionTypes: [1, 2] }), [2])
  const pkg = { id: 1, productionType: null }
  for (const [qualified, recorded, routes] of [
    [true, 2, [1, 2]], [false, 2, [2]], [false, 1, [1]], [false, 3, []],
  ]) {
    const order = { ...row, medicalPackageAllowed: qualified, productionTypes: [recorded] }
    assert.deepEqual(branch.productionTypesForOrder(order), routes)
    for (const type of [1, 2]) {
      const list = branch.packagesForProduction(order, [pkg, { id: 2, productionType: recorded }], type)
      assert.deepEqual(list.map(p => p.id), [
        ...(qualified || (type === 2 && recorded === 2) ? [1] : []), ...(recorded === type ? [2] : []),
      ])
    }
  }
})

test('首次追加时以服务端原包能力决定能否办理，历史原包保持只读', () => {
  for (const key of ['editable', 'canEditPrintInfo', 'canEditDocuments']) {
    assert.equal(branch.packageEditable({ editable: true, [key]: true }, 31, key), true)
    assert.equal(branch.packageEditable({ editable: false }, 31, key), false)
    assert.equal(branch.packageEditable({ batchId: 30, editable: true, [key]: true }, 31, key), false)
  }
})

test('当前追加包已填优先打开可编辑待填原包，指定追加包时保留精确定位', () => {
  const current = { id: 9, batchId: 71, filled: true }
  const original = { id: 8, editable: true }
  const list = [{ id: 7, batchId: 4 }, current, original]
  assert.equal(branch.initialProductionPackage(list, 71, null, pkg => !pkg.filled), original)
  assert.equal(branch.initialProductionPackage(list, 71, 9, pkg => !pkg.filled), current)
  assert.equal(branch.initialProductionPackage(list, 71, 8, pkg => !pkg.filled), undefined)
})
