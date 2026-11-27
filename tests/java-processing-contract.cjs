// The fixture directory is exported by the local Spring integration run.
const { readFile } = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const ExcelJS = require('exceljs')

module.exports = async function verifyJavaContract({
  page,
  base,
  directory,
  permissions,
  openBranch,
}) {
  const json = async (name) =>
    JSON.parse(await readFile(path.join(directory, name), 'utf8'))
  const [
    draft,
    archived,
    doc,
    packages,
    orderDetail,
    card,
    original,
    paginated,
  ] = await Promise.all([
    json('draft.json'),
    json('archived.json'),
    json('document.json'),
    json('packages.json'),
    json('order.json'),
    json('production-record.json'),
    readFile(path.join(directory, 'archived.xlsx')),
    readFile(path.join(directory, 'sample.xlsx')),
  ])
  assert.equal(typeof archived.id, 'number')
  assert.equal(typeof doc.documentId, 'number')
  assert.equal(typeof card.processingApplicationFile.id, 'string')
  assert.equal(card.processingApplicationId, archived.id)
  assert.equal(
    packages.find((pkg) => pkg.id === archived.packageId).processingApplication
      .documentId,
    doc.documentId,
  )
  assert.equal(
    orderDetail.packageList.find((pkg) => pkg.id === archived.packageId)
      .processingApplication.documentId,
    doc.documentId,
  )
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(original)
  const archiveTitle = workbook.worksheets[0].name
  await workbook.xlsx.load(paginated)
  assert.equal(workbook.worksheets.length, 2)
  const lastTitle = workbook.worksheets[1].name
  let sample = false
  const bodies = new Map([
    [draft.orderId, draft],
    [archived.orderId, archived],
  ])
  const summary = (form) => ({
    id: form.orderId,
    orderCode: form.header.orderCode,
    orderType: 2,
    productionTypes: [2],
    needsPhysicalDelivery: 1,
    status: form.status === 'ARCHIVED' ? 2030 : 2020,
  })
  await page.route('**/*', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const book = sample ? paginated : original
    const sendBook = () =>
      route.fulfill({
        status: 200,
        headers: {
          'content-type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'access-control-allow-origin': base,
        },
        body: book,
      })
    if (
      url.href === doc.previewUrl ||
      url.href === doc.downloadUrl ||
      url.href === card.processingApplicationFile.fileUrl ||
      url.href === card.processingApplicationFile.downloadUrl
    )
      return sendBook()
    if (url.origin !== base || !url.pathname.startsWith('/yi/'))
      return route.fallback()
    const api = url.pathname.slice(3)
    let data
    if (api === '/design/workorder/list')
      data = { records: [...bodies.values()].map(summary), total: 2 }
    else if (api === '/design/packages') {
      const form = bodies.get(Number(url.searchParams.get('orderId')))
      data =
        form === archived
          ? packages
          : [{ id: form.packageId, productionType: 2, packageCode: form.packageCode }]
    } else if (api.endsWith('/processing-application'))
      data = bodies.get(Number(api.split('/')[3]))
    else if (api.endsWith('/processing-application/document')) data = doc
    else if (api.endsWith('/document/' + doc.documentId + '/download'))
      return sendBook()
    else if (api === '/order/' + archived.orderId) data = orderDetail
    else if (api === '/production/record/' + card.id) data = card
    else return route.fallback()
    return route.fulfill({ json: { code: 200, data } })
  })
  permissions.splice(
    0,
    permissions.length,
    'design:View',
    'design:ProcessingApplicationEdit',
    'design:ProcessingApplicationView',
    'order:TabOrderList',
    'manufacture:View',
  )
  await page.goto(base + '/#/design')
  await page.reload()
  const form = page
    .getByRole('dialog')
    .filter({ has: page.locator('.processing-form') })
  const xlsx = page
    .getByRole('dialog')
    .filter({ has: page.locator('.xlsx-preview') })
  const open = async (entity, entry, label) => {
    await page
      .locator('tr')
      .filter({ hasText: entity.header.orderCode })
      .getByRole('button')
      .last()
      .click()
    const chooser = await openBranch(entry, label)
    await chooser.getByRole('menuitem', { name: label, exact: true }).click()
  }
  await open(draft, '填写生产信息', '加工申请单')
  const total = draft.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
  await form.getByRole('spinbutton').first().waitFor()
  const quantities = await form.getByRole('spinbutton').evaluateAll(inputs => inputs.map(input => Number(input.value)))
  assert.equal(quantities.length, draft.items.length)
  assert.equal(quantities.reduce((sum, quantity) => sum + quantity, 0), total)
  const models = draft.files.filter((file) => file.productionModel)
  const modelById = new Map(models.map((file) => [file.id, file]))
  const selectedModels = form.locator('.dpid2-card .el-select .el-tag')
  for (const [index, item] of draft.items.entries()) {
    if (item.packageFileId == null) continue
    const file = modelById.get(item.packageFileId)
    assert.ok(file, `第 ${index + 1} 行的文件 ${item.packageFileId} 必须属于当前数据包`)
    const sameName = models.filter((model) => model.fileName === file.fileName)
    const label = sameName.length > 1 ? `${file.fileName} (#${file.id})` : file.fileName
    await selectedModels.getByText(label, { exact: true }).first().waitFor()
  }
  await form.getByRole('button', { name: '关闭', exact: true }).last().click()
  await open(archived, '查看生产信息', '加工申请单')
  await form.locator('.pkg-item--active').getByText('已归档', { exact: true }).waitFor()
  await form.getByRole('tab', { name:'加工申请单文件' }).click()
  await form.getByRole('button', { name: '在线预览', exact: true }).click()
  await xlsx.getByText(doc.fileName, { exact: true }).waitFor()
  await xlsx.locator('canvas').first().waitFor()
  await xlsx.getByTitle('关闭').click()
  const verifyDownload = async (button) => {
    const wait = page.waitForEvent('download')
    await button.click()
    const downloaded = await wait
    assert.equal(downloaded.suggestedFilename(), doc.fileName)
    assert.deepEqual(await readFile(await downloaded.path()), original)
  }
  await verifyDownload(form.getByRole('button', { name: '下载文件', exact: true }))
  for (const [route, detailApi] of [
    ['/#/manufacture?detailId=' + card.id + '&action=preview', '/production/record/' + card.id],
    ['/#/order?detailId=' + archived.orderId, '/order/' + archived.orderId],
  ]) {
    await Promise.all([
      page.waitForResponse(base + '/yi' + detailApi),
      page.goto(base + route),
    ])
    const file = page
      .getByLabel('加工申请单文件')
      .filter({ hasText: doc.fileName })
      .first()
    await file.getByRole('button', { name: '预览', exact: true }).click()
    await xlsx.locator('canvas').first().waitFor()
    await xlsx.getByTitle('关闭').click()
    await verifyDownload(
      file.getByRole('button', { name: '下载', exact: true }),
    )
  }
  // Independently inspect the genuine 14-line POI fixture using the same preview component.
  sample = true
  await page
    .getByLabel('加工申请单文件')
    .filter({ hasText: doc.fileName })
    .first()
    .getByRole('button', { name: '预览', exact: true })
    .click()
  await xlsx.getByRole('listitem').filter({ hasText: lastTitle }).click()
  console.log('PASS Java JSON/Excel replay', {
    orderId: archived.orderId,
    packageId: archived.packageId,
    cardId: card.id,
    documentId: doc.documentId,
    archiveTitle,
    lastTitle,
  })
}
