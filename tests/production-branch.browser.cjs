// Run after npm run build. Set PLAYWRIGHT_MODULE to an installed Playwright module when it is outside this workspace.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const ExcelJS = require('exceljs')
const http = require('node:http')
const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
;(async () => {
  const mime = {
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.woff2': 'font/woff2',
  }
  const server = http.createServer(async (req, res) => {
    const relative =
      new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'
    const file = path.resolve('dist', relative)
    if (!file.startsWith(path.resolve('dist') + path.sep)) {
      res.writeHead(404).end()
      return
    }
    try {
      res.setHeader(
        'Content-Type',
        mime[path.extname(file)] || 'application/octet-stream',
      )
      res.end(await fs.readFile(file))
    } catch {
      res.writeHead(404).end()
    }
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const base = 'http://127.0.0.1:' + server.address().port
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      acceptDownloads: true,
    })
    await context.addCookies([{ name: 'token', value: 'synthetic', url: base }])
    const page = await context.newPage()
    page.setDefaultTimeout(5500)
    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))
    const workbook = new ExcelJS.Workbook()
    for (const [name, count] of [
      ['第1页', 13],
      ['第2页', 1],
    ]) {
      const sheet = workbook.addWorksheet(name)
      for (let i = 0; i < count; i++) sheet.addRow([name, '模型' + i, i + 1])
    }
    const bytes = await workbook.xlsx.writeBuffer()
    const order = (id, type, status) => ({
      id,
      orderType: type,
      status,
      orderCode: 'TEST-' + id,
      version: 4,
      needsPhysicalDelivery: 1,
      packageCount: 1,
      packageList: [],
      items: [],
      submitCheck: {},
      patientName: '测试',
      orgName: '合成机构',
      statusName: '设计中',
    })
    const rows = [
      order(1, 1, 2020),
      order(2, 2, 2020),
      order(3, 2, 2030),
      order(4, 2, 3010),
    ]
    const pkgs = [
      { id: 11, packageCode: 'PK-11' },
      { id: 12, packageCode: 'PK-12' },
    ]
    const docs = (id) => ({
      documentId: 811,
      revision: 3,
      fileName: '加工申请单.xlsx',
      previewUrl: base + '/fake.xlsx',
      downloadUrl: base + '/fake.xlsx',
    })
    const files = [
      { id: 201, fileName: '模型.stl', productionModel: true },
      { id: 202, fileName: '模型.stl', productionModel: true },
    ]
    const records = new Map()
    let rejectSave = true,
      docCalls = 0,
      lastSave,
      readonly = false,
      packaging = false,
      uploadedBatch = null,
      fetchedBatch = null
    const perms = [
      'design:View',
      'design:Upload',
      'design:PrintInfo',
      'design:DocumentPreview',
      'design:Complete',
      'design:ProcessingApplicationEdit',
      'design:ProcessingApplicationView',
      'manufacture:Flow',
      'manufacture:View',
      'quality:Start',
      'quality:ToPackaging',
      'order:TabOrderList',
    ]
    const record = (id) => ({
      id,
      orderId: id,
      orderType: id === 41 ? 1 : 2,
      status: id === 41 ? 3030 : packaging ? 5050 : 5010,
      recordNo: 'FC-' + id,
      designPackageCode: '包-' + id,
      totalProductCount: 3,
      products: [],
      processingApplicationId: id === 41 ? null : 17,
      processingApplicationFile:
        id === 41
          ? null
          : {
              fileName: '加工申请单.xlsx',
              fileUrl: base + '/fake.xlsx',
              downloadUrl: base + '/fake.xlsx',
            },
      processingPostalAddress: '合成邮寄地址',
      processingDeliveryTime: '2026-12-01 16:00:00',
    })
    await page.route('**/*', async (route) => {
      const req = route.request(),
        url = new URL(req.url())
      if (url.origin !== base) return route.abort()
      let p = url.pathname
      if (p === '/fake.xlsx' || p.endsWith('/document/811/download'))
        return route.fulfill({
          status: 200,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          body: Buffer.from(bytes),
        })
      if (!p.startsWith('/yi/')) return route.continue()
      p = p.slice(3)
      let data = []
      let code = 200,
        message = 'ok'
      if (p === '/order/3')
        data = {
          ...rows[2],
          packageList: [
            { ...pkgs[0], files: [], processingApplication: docs() },
          ],
        }
      else if (p === '/production/qc/42/products')
        data = [
          {
            id: 51,
            productNo: 'QC-001',
            productName: '测试模型',
            qcResult: 'pass',
          },
        ]
      else if (p === '/production/qc/42/transfer-to-pack') {
        packaging = true
        data = null
      } else if (p === '/system/auth/info')
        data = {
          user: { id: 8, roleCode: 'designer', realName: '合成用户' },
          permissions: perms,
          menus: ['design', 'manufacture', 'quality', 'order'].map((name) => ({
            resourceType: 2,
            path: '/' + name,
            resourceName: name,
            resourceCode: name,
            component: 'business/' + name,
            visible: 1,
            status: 1,
          })),
        }
      else if (p.endsWith('/column-config'))
        data = {
          columns: ['orderCode', 'action'].map((field, i) => ({
            field,
            label: field,
            visible: true,
            sort: i + 1,
            width: 200,
          })),
        }
      else if (p === '/design/workorder/list')
        data = { records: rows, total: rows.length }
      else if (/^\/design\/workorder\/\d+$/.test(p))
        data = rows.find((r) => r.id === Number(p.split('/').at(-1)))
      else if (p.endsWith('/complete-design')) {
        code = 410
        message = '包 PK-12，第 3 行缺数量'
      } else if (p === '/design/packages')
        data = url.searchParams.has('batchId')
          ? pkgs.filter((pkg) => pkg.batchId === 77)
          : pkgs
      else if (p === '/design/package-batch')
        data = req.method() === 'POST' ? { batchId: 77, batchNo: 'B77' } : []
      else if (p === '/design/package/upload') {
        uploadedBatch = url.searchParams.get('batchId')
        const id = pkgs.length + 20
        data = {
          id,
          packageCode: 'PK-' + id,
          fileName: 'TEST-' + id + '.zip',
          fileSize: 128,
          batchId: url.searchParams.has('batchId') ? 77 : null,
          files: [],
        }
        pkgs.push(data)
      } else if (p.endsWith('/processing-application')) {
        fetchedBatch = url.searchParams.get('batchId')
        const id = Number(p.split('/').at(-2)),
          archived = p.includes('/workorder/3/')
        if (!records.has(id))
          records.set(id, {
            id: 7,
            packageId: id,
            packageCode: 'PK-' + id,
            revision: 2,
            status: 'DRAFT',
            header: { orderCode: 'TEST-2', orgName: '合成机构' },
            editable: true,
            files,
            materialOptions: [{ code: 'WHITE_RESIN', name: '白色树脂' }],
            deliveryTime: '2026-12-01 16:00:00',
            postalAddress: '测试地址',
            processingRequirements: '合成草稿',
            items: Array.from({ length: 14 }, (_, i) => ({
              id: 101 + i,
              packageFileId: i ? 201 : 202,
              materialCode: 'WHITE_RESIN',
              quantity: 1,
              remark: '样例' + i,
            })),
            document: null,
          })
        if (req.method() === 'POST') {
          lastSave = req.postDataJSON()
          if (rejectSave) {
            records.get(id).revision++
            rejectSave = false
          }
          if (lastSave.expectedRevision !== records.get(id).revision) {
            code = 409
            message = '版本冲突，请刷新后重试'
          } else
            records.set(id, {
              ...records.get(id),
              ...lastSave,
              revision: lastSave.expectedRevision + 1,
            })
        }
        data = {
          ...records.get(id),
          editable: !readonly && !archived,
          status: archived ? 'ARCHIVED' : 'DRAFT',
        }
      } else if (p.endsWith('/processing-application/document')) {
        docCalls++
        data = docs()
      } else if (/^\/production\/record\/\d+$/.test(p))
        data = record(Number(p.split('/').at(-1)))
      else if (p === '/production/record/scan') data = record(42)
      else if (p === '/production/record/list' || p === '/production/qc/list')
        data = { records: [record(41), record(42)], total: 2 }
      else if (p.endsWith('/statistics') || p.endsWith('/params')) data = {}
      return route.fulfill({ json: { code, data, message } })
    })
    try {
      await page.goto(base + '/#/design')
      const menu = async (id) => {
        await page
          .locator('tr')
          .filter({ hasText: 'TEST-' + id })
          .getByRole('button')
          .last()
          .click()
      }
      await menu(1)
      await page.getByRole('menuitem', { name: '填写打印信息' }).waitFor()
      assert.equal(
        await page.getByRole('menuitem', { name: '填写加工申请单' }).count(),
        0,
      )
      await page.getByText('我的工单', { exact: true }).first().click()
      await menu(2)
      await page.getByRole('menuitem', { name: '填写加工申请单' }).click()
      const dialog = page
        .getByRole('dialog')
        .filter({ has: page.locator('.processing-form') })
      await dialog
        .getByText('模型.stl (#202)', { exact: true })
        .first()
        .waitFor()
      await dialog.locator('textarea').fill('修改说明')
      await dialog.getByRole('button', { name: '预览', exact: true }).click()
      await dialog.getByText('版本冲突，请刷新后重试').first().waitFor()
      assert.equal(await dialog.locator('textarea').inputValue(), '修改说明')
      assert.equal(docCalls, 0)
      await dialog.getByRole('button', { name: '重新加载' }).click()
      await page.getByRole('button', { name: '保留输入' }).click()
      assert.equal(await dialog.locator('textarea').inputValue(), '修改说明')
      await dialog.getByRole('button', { name: '重新加载' }).click()
      await page
        .getByRole('button', { name: '重新加载', exact: true })
        .last()
        .click()
      await dialog.getByText('版本 3', { exact: true }).waitFor()
      assert.equal(await dialog.locator('textarea').inputValue(), '合成草稿')
      await dialog.locator('textarea').fill('修改说明')
      await dialog.getByRole('button', { name: '预览', exact: true }).click()
      await page
        .getByRole('dialog')
        .filter({ has: page.locator('.xlsx-preview') })
        .getByRole('listitem')
        .filter({ hasText: '第2页' })
        .click()
      assert.equal(lastSave.items[0].packageFileId, 202)
      assert.equal(lastSave.items.length, 14)
      await page
        .getByRole('dialog')
        .filter({ has: page.locator('.xlsx-preview') })
        .getByTitle('关闭', { exact: true })
        .click()
      const downloaded = page.waitForEvent('download')
      await dialog.getByRole('button', { name: '下载', exact: true }).click()
      const dl = await downloaded
      assert.equal(dl.suggestedFilename(), '加工申请单.xlsx')
      assert.deepEqual(await fs.readFile(await dl.path()), Buffer.from(bytes))
      await dialog
        .getByRole('button', { name: '关闭', exact: true })
        .last()
        .click()
      await menu(3)
      await page.getByRole('menuitem', { name: '查看加工申请单' }).click()
      await dialog.getByText('已归档', { exact: true }).waitFor()
      assert.equal(
        await dialog.getByRole('button', { name: '添加明细' }).count(),
        0,
      )
      await dialog
        .getByRole('button', { name: '关闭', exact: true })
        .last()
        .click()
      await menu(2)
      await page.getByRole('menuitem', { name: '查看详情' }).click()
      const detail = page
        .getByRole('dialog')
        .filter({ has: page.getByRole('button', { name: '完成设计' }) })
      await detail.getByRole('button', { name: '完成设计' }).click()
      await detail.getByText('包 PK-12，第 3 行缺数量').waitFor()
      await detail.getByRole('button', { name: '填写加工申请单' }).click()
      await dialog
        .getByText('模型.stl (#202)', { exact: true })
        .first()
        .waitFor()
      await dialog
        .getByRole('button', { name: '关闭', exact: true })
        .last()
        .click()
      await detail
        .getByRole('button', { name: '关闭', exact: true })
        .last()
        .click()
      for (const [id, expectedPackage] of [
        [2, 22],
        [4, 23],
      ]) {
        await menu(id)
        await page.getByRole('menuitem', { name: '上传设计文件' }).click()
        const upload = page
          .getByRole('dialog')
          .filter({ has: page.getByRole('button', { name: '完成上传' }) })
        const sent = page.waitForResponse((res) =>
          new URL(res.url()).pathname.endsWith('/design/package/upload'),
        )
        await upload
          .locator('input[type="file"]')
          .first()
          .setInputFiles({
            name: 'TEST-' + id + '-1.zip',
            mimeType: 'application/zip',
            buffer: Buffer.from('fixture'),
          })
        await sent
        await upload.getByRole('button', { name: '完成上传' }).click()
        await dialog
          .locator('.form-heading strong')
          .filter({ hasText: 'PK-' + expectedPackage })
          .waitFor()
        assert.equal(uploadedBatch, id === 4 ? '77' : null)
        assert.equal(fetchedBatch, uploadedBatch)
        await dialog
          .getByRole('button', { name: '关闭', exact: true })
          .last()
          .click()
      }
      await page.goto(base + '/#/manufacture?detailId=41&action=flowcard')
      const flow = page.locator('.flow-card-dialog')
      await flow.getByText('UV固化', { exact: true }).first().waitFor()
      await flow.locator('.el-dialog__headerbtn').click()
      await flow.waitFor({ state: 'hidden' })
      const scan = page.getByPlaceholder('输入流转卡编号回车打开流转卡')
      await scan.fill('FC-42')
      await scan.press('Enter')
      await flow.getByText('包-42', { exact: true }).first().waitFor()
      assert.equal(await flow.getByText('UV固化', { exact: true }).count(), 0)
      await flow.getByText('质检处理中，完成后可开始包装').waitFor()
      await flow.locator('.el-dialog__headerbtn').click()
      await flow.waitFor({ state: 'hidden' })
      packaging = true
      await page.goto(base + '/#/manufacture?detailId=42&action=flowcard')
      await flow.getByText('包-42', { exact: true }).first().waitFor()
      await flow.getByRole('button', { name: '开始', exact: true }).waitFor()
      assert.equal(await flow.getByText('UV固化', { exact: true }).count(), 0)
      await flow.locator('.el-dialog__headerbtn').click()
      await flow.waitFor({ state: 'hidden' })
      await page.goto(base + '/#/manufacture?detailId=42&action=preview')
      await page.getByText('合成邮寄地址', { exact: true }).waitFor()
      await page
        .getByLabel('已归档加工申请单')
        .getByRole('button', { name: '预览', exact: true })
        .click()
      await page
        .getByRole('dialog')
        .filter({ has: page.locator('.xlsx-preview') })
        .getByRole('listitem')
        .filter({ hasText: '第2页' })
        .waitFor()
      await page.goto(base + '/#/order?detailId=3')
      await page
        .getByLabel('已归档加工申请单')
        .getByRole('button', { name: '预览', exact: true })
        .click()
      await page
        .getByRole('dialog')
        .filter({ has: page.locator('.xlsx-preview') })
        .getByRole('listitem')
        .filter({ hasText: '第2页' })
        .waitFor()
      readonly = true
      packaging = false
      perms.splice(0, perms.length, 'quality:Start', 'quality:ToPackaging')
      await page.goto(base + '/#/quality')
      await page.reload()
      await page
        .getByRole('button', { name: '质检', exact: true })
        .first()
        .click()
      await page.getByText('QC-001', { exact: true }).waitFor()
      await page.getByRole('button', { name: '质检完成，流转到包装' }).click()
      await page.getByRole('button', { name: '确认流转' }).click()
      await page.getByText('已流转到包装', { exact: true }).waitFor()
      assert.equal(packaging, true)
      perms.splice(
        0,
        perms.length,
        'design:View',
        'design:ProcessingApplicationView',
      )
      await page.goto(base + '/#/design')
      await page.reload()
      await menu(2)
      await page.getByRole('menuitem', { name: '查看加工申请单' }).click()
      await dialog.getByText('版本 4', { exact: true }).waitFor()
      assert.equal(
        await dialog.getByRole('button', { name: '添加明细' }).count(),
        0,
      )
      if (process.env.PROCESSING_QA_DIR) {
        await require('./java-processing-contract.cjs')({
          page,
          base,
          directory: process.env.PROCESSING_QA_DIR,
          permissions: perms,
        })
      }
      assert.equal(errors.length, 0, errors.join('\n'))
      console.log(
        'PASS real PC routes: type-specific menus/detail, failed save preserves draft, version and file IDs, 14-row two-sheet preview, byte-identical download, archived view, new/append uploads with batch and exact package, scan after medical card, nonmedical deep link, 5010/5050 controls, production/order archived files, QC transfer under QC-only permissions, designer read-only role',
      )
    } catch (e) {
      console.log(
        'URL',
        page.url(),
        'ERRORS',
        errors,
        'VIEW',
        (await page.locator('body').innerText()).slice(-3500),
      )
      throw e
    }
  } finally {
    await browser.close()
    server.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
