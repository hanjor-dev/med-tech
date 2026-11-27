const assert = require('node:assert/strict')
const ExcelJS = require('exceljs')

/** Run in the file tab of a saved, editable application after its first file has been generated. */
async function runProcessingRevisionTest(page, dialog) {
  const panel = dialog.locator('.application-files')
  const model = new ExcelJS.Workbook()
  model.addWorksheet('人工修订').getCell('A1').value = '人工填写，内容独立于生产明细'
  const bytes = Buffer.from(await model.xlsx.writeBuffer())
  const filename = '人工修订.xlsx'
  let uploaded = false
  let refreshedRevision
  let generated
  let manual
  const calls = []
  const api = '**/workorder/*/package/*/processing-application**'
  const binary = '**/manual-revision-fixture.xlsx'
  const serveFile = route => route.fulfill({ contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', body: bytes })
  const respond = (route, data) => route.fulfill({ json: { code: 200, data, message: '成功' } })
  const handler = async route => {
    const req = route.request()
    const p = new URL(req.url()).pathname
    if (!uploaded && p.endsWith('/document')) {
      refreshedRevision = req.postDataJSON().expectedRevision + 1
      generated = { confirmed: false, documentId: 9800, revision: refreshedRevision, fileName: '重新生成.xlsx',
        previewUrl: new URL('/manual-revision-fixture.xlsx', req.url()).href, source: 'GENERATED' }
      return respond(route, generated)
    }
    if (p.endsWith('/9800/confirm')) {
      assert.equal(req.method(), 'POST')
      assert.deepEqual(req.postDataJSON(), { expectedRevision: generated.revision })
      generated.confirmed = true
      return respond(route, generated)
    }
    if (p.endsWith('/document/revision')) {
      assert.equal(req.method(), 'POST')
      const body = req.postDataBuffer()
      assert.ok(body.includes(bytes))
      const revision = body.toString('latin1').match(/name="expectedRevision"\r\n\r\n(\d+)/)
      assert.ok(revision)
      assert.equal(Number(revision[1]), refreshedRevision)
      manual = { confirmed: false, documentId: 9801, revision: Number(revision[1]) + 1, fileName: filename,
        previewUrl: new URL('/manual-revision-fixture.xlsx', req.url()).href, source: 'MANUAL', operatorName: '设计师D' }
      uploaded = true
      return respond(route, manual)
    }
    if (uploaded && p.endsWith('/documents')) return respond(route, [manual, generated])
    if (uploaded && p.endsWith('/document')) return respond(route, manual)
    if (uploaded && p.endsWith('/9801/download')) return serveFile(route)
    if (uploaded && p.endsWith('/processing-application') && req.method() === 'GET') {
      await route.fallback()
      return
    }
    if (req.method() === 'POST' && p.endsWith('/processing-application')) calls.push('saved')
    return route.fallback()
  }
  await page.route(binary, serveFile)
  await page.route(api, handler)
  try {
    await panel.getByRole('button', { name: '预览并确认' }).click()
    const refreshedPreview = page.getByRole('dialog').filter({ has: page.locator('.xlsx-preview') })
    await refreshedPreview.getByRole('listitem').filter({ hasText: '人工修订' }).waitFor()
    await refreshedPreview.getByRole('button', { name: '确认加工申请单' }).click()
    await panel.locator('.ddpd-version-card__status').filter({ hasText: '已确认' }).waitFor()
    const fileChooser = page.waitForEvent('filechooser')
    await panel.getByRole('button', { name: '上传修订版' }).click()
    await (await fileChooser).setFiles({ name: filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: bytes })
    const toggle = panel.locator('.ddpd-history__toggle')
    if (!(await panel.locator('.ddpd-history__list').isVisible())) await toggle.click()
    const manualRow = panel.locator('.ddpd-history-item').filter({ hasText: filename })
    await manualRow.getByText(/手工修订/).waitFor()
    await panel.locator('.ddpd-version-card__status').filter({ hasText: '待确认' }).waitFor()
    const oldRow = panel.locator('.ddpd-history-item').filter({ hasText: '重新生成.xlsx' })
    await oldRow.getByRole('button', { name: '预览' }).click()
    const historical = page.getByRole('dialog').filter({ has: page.locator('.xlsx-preview') })
    await historical.getByRole('listitem').filter({ hasText: '人工修订' }).waitFor()
    assert.equal(await historical.getByRole('button', { name: '确认加工申请单' }).count(), 0)
    await historical.getByTitle('关闭', { exact: true }).click()
    await manualRow.getByRole('button', { name: '预览' }).click()
    const preview = page.getByRole('dialog').filter({ has: page.locator('.xlsx-preview') })
    await preview.getByRole('listitem').filter({ hasText: '人工修订' }).waitFor()
    await preview.getByTitle('关闭', { exact: true }).click()
    const done = page.waitForEvent('download')
    await manualRow.getByRole('button', { name: '下载' }).click()
    const file = await done
    assert.equal(file.suggestedFilename(), filename)
    assert.deepEqual(await require('node:fs/promises').readFile(await file.path()), bytes)
    assert.deepEqual(calls, [])
  } finally {
    await page.unroute(api, handler)
    await page.unroute(binary, serveFile)
  }
}
module.exports = { runProcessingRevisionTest }
