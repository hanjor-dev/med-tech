// Run after npm run build. Set PLAYWRIGHT_MODULE to an installed Playwright module when it is outside this workspace.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const ExcelJS = require('exceljs')
const { runProcessingRevisionTest } = require('./processing-revision.browser.cjs')
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
      medicalPackageAllowed: true,
      productionTypes: [type],
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
      { ...order(2, 2, 2020), medicalPackageAllowed: false, productionTypes: [2] },
      order(3, 2, 2030),
      order(4, 2, 3010),
      { ...order(5, 1, 2020), needsPhysicalDelivery: 0 },
      { ...order(6, 2, 2020), needsPhysicalDelivery: 2 },
      order(7, 1, 2030),
      order(8, 1, 3010),
      order(9, 1, 2010),
      { ...order(10, 1, 2020), productionTypes: [1, 2], packageCount: 2 },
      { ...order(11, 2, 2020), medicalPackageAllowed: false, productionTypes: [1] },
    ]
    const pkgs = [
      { id: 11, packageCode: 'PK-11', fileName: '历史包.zip', canDelete: false },
      { id: 12, packageCode: 'PK-12' },
    ]
    const packagesByOrder = new Map()
    let nextUploadedId = 22
    const orderPackages = (orderId) => {
      if (!packagesByOrder.has(orderId)) packagesByOrder.set(orderId, pkgs.map(pkg => ({ ...pkg, productionType: rows.find(row => row.id === orderId)?.productionTypes[0] })))
      return packagesByOrder.get(orderId)
    }
    orderPackages(2).push({ id: 299, productionType: 1, batchId: 299, batchStatus: null, packageCode: 'PK-299', fileName: '已删除批次.zip', canDelete: false, files: [] })
    const appendPackages = [
      { id: 81, productionType: 1, batchStatus: 'COMPLETED', packageCode: 'PK-81', batchId: 80, canEditPrintInfo: false, files: [] },
      { id: 82, productionType: 1, batchStatus: 'PRINT_INFO_EDITING', packageCode: 'PK-82', batchId: 88, canEditPrintInfo: true, files: [] },
    ]
    rows[7].packageList = appendPackages
    let firstDesignAppend = false
    const mixedOrder = rows[9]
    mixedOrder.packageList = [
      { id: 102, productionType: 2, packageCode: 'PK-102', files: [] },
      { id: 101, productionType: 1, packageCode: 'PK-101', files: [] },
    ]
    rows[10].packageList = [{ id: 111, productionType: 1, packageCode: 'PK-111', files: [] }]
    rows[1].submitCheck.blockReason = '包 PK-11 缺少材质'
    const docs = (id) => ({
      confirmed: false,
      documentId: 811,
      revision: 3,
      fileName: '加工申请单.xlsx',
      previewUrl: base + '/fake.xlsx',
      downloadUrl: base + '/fake.xlsx',
    })
    const files = [
      { id: 201, fileName: '模型.stl', productionModel: true },
      { id: 202, fileName: '模型.stl', productionModel: true },
      { id: 203, fileName: '无需加工.stl', productionModel: true },
    ]
    const records = new Map()
    let rejectSave = true,
      docCalls = 0,
      lastSave,
      readonly = false,
      packaging = false,
      uploadedBatch = null,
      fetchedBatch = null,
      fetchedOrder = null
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
      if (p.endsWith('/document/811/download') && req.headers().satoken !== 'synthetic')
        return route.fulfill({ json: { code: 401, message: '未登录或登录已过期，请重新登录' } })
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
            { ...pkgs[0], processingStatus: 'ARCHIVED', files: [], processingApplication: docs() },
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
        data = { records: rows.map(({ packageList, ...summary }) => summary), total: rows.length }
      else if (/^\/design\/workorder\/\d+$/.test(p))
        data = rows.find((r) => r.id === Number(p.split('/').at(-1)))
      else if (p.endsWith('/print-info/options')) data = { materials: [], colorGroups: [], products: [], printModels: [] }
      else if (p.endsWith('/instruction/preview-url'))
        data = { id: 31, fileId: '310', version: p.includes('/workorder/10/') ? 'V' + p.split('/').at(-3) : 'V1', templateFileUrl: base + '/fake.xlsx', isConfirmed: 0 }
      else if (p.endsWith('/complete-design')) {
        code = 410
        message = '包 PK-12，第 3 行缺数量'
      } else if (p === '/design/packages' && url.searchParams.get('orderId') === '8')
        data = appendPackages
      else if (p === '/design/packages' && url.searchParams.get('orderId') === '10')
        data = mixedOrder.packageList
      else if (p === '/design/packages' && url.searchParams.get('orderId') === '11')
        data = rows[10].packageList
      else if (p === '/design/packages') {
        const packages = orderPackages(Number(url.searchParams.get('orderId')))
        data = url.searchParams.has('batchId')
          ? packages.filter((pkg) => pkg.batchId === Number(url.searchParams.get('batchId')))
          : packages
      } else if (firstDesignAppend && p === '/design/package-batch' && url.searchParams.get('orderId') === '10')
        data = [{ batchId: 100, sourceOrderStatus: 2020, status: 'PRINT_INFO_EDITING' }]
      else if (p === '/design/package-batch' && url.searchParams.get('orderId') === '8')
        data = [{ batchId: 80, status: 'COMPLETED' }, { batchId: 88, status: 'PRINT_INFO_EDITING' }]
      else if (p === '/design/package-batch')
        data = req.method() === 'POST' ? { batchId: 77, batchNo: 'B77' } : []
      else if (p === '/design/package/upload') {
        uploadedBatch = url.searchParams.get('batchId')
        const orderId = Number(url.searchParams.get('orderId'))
        const mixed = orderId === 10
        const packages = mixed ? mixedOrder.packageList : orderPackages(orderId)
        const id = mixed ? 1000 + packages.length : nextUploadedId++
        data = {
          id,
          packageCode: 'PK-' + id,
          fileName: 'TEST-' + id + '.zip',
          fileSize: 128,
          batchId: url.searchParams.has('batchId') ? 77 : null,
          files: [],
        }
        if (url.searchParams.has('productionType')) data.productionType = Number(url.searchParams.get('productionType'))
        packages.push(data)
      } else if (p.endsWith('/processing-application')) {
        fetchedBatch = url.searchParams.get('batchId')
        fetchedOrder = Number(p.split('/')[3])
        const id = Number(p.split('/').at(-2)),
          key = fetchedOrder + '/' + id,
          archived = p.includes('/workorder/3/')
        if (!records.has(key))
          records.set(key, {
            id: 7,
            orderId: fetchedOrder,
            packageId: id,
            packageCode: 'PK-' + id,
            revision: 2,
            status: 'DRAFT',
            header: { orderCode: 'TEST-' + fetchedOrder, orgName: '合成机构', expectedDeliveryDate: null },
            editable: true,
            files,
            products: [{ category:'17.1', categoryName:'模型类', id:510, productName:'样例模型', specs:[{id:520,specName:'标准号'}] }],
            materials: [{code:'RESIN', name:'树脂', isDefault:true}, {code:'PLA',name:'PLA'}],
            colorGroups: [{categoryCode:null,colors:[{code:'WHITE',name:'白色',isDefault:true},{code:'CLEAR',name:'透明'}]}],
            materialOptions: [{ code: 'WHITE_RESIN', name: '白色树脂' }],
            deliveryTime: null,
            isPostal: 1, postalAddress: '测试地址',
            processingRequirements: '合成草稿',
            items: Array.from({ length: 14 }, (_, i) => ({
              id: 101 + i,
              packageFileId: i ? 201 : 202,
              ...(i === 0 ? { materialCode: 'WHITE_RESIN' } : { productCategory: '17.1', productId: 510, specId: 520, materialCode: 'RESIN', colorCode: 'WHITE' }),
              quantity: 1,
              remark: '样例' + i,
            })),
            document: null,
          })
        if (id === 1003 && req.method() === 'GET') Object.assign(records.get(key), { revision: 0, items: [], processingRequirements: '' })
        if (req.method() === 'POST') {
          lastSave = req.postDataJSON()
          if (rejectSave) {
            records.get(key).revision++
            rejectSave = false
          }
          if (lastSave.expectedRevision !== records.get(key).revision) {
            code = 409
            message = '版本冲突，请刷新后重试\n' + '单据版本已经更新。'.repeat(25)
          } else if (lastSave.confirmedHeader?.hospitalName !== records.get(key).header.hospitalName) {
            code = 409
            message = '主单表头已变化，请刷新并确认后保存加工申请单'
          } else
            records.set(key, {
              ...records.get(key),
              ...lastSave,
              document: { ...docs(), revision: lastSave.expectedRevision + 1 },
              headerNeedsConfirmation: false,
              revision: lastSave.expectedRevision + 1,
            })
        }
        data = {
          ...records.get(key),
          editable: !readonly && !archived,
          status: archived ? 'ARCHIVED' : 'DRAFT',
        }
      } else if (p.endsWith('/processing-application/documents')) data = []
      else if (p.endsWith('/processing-application/document')) {
        docCalls++
        data = records.get(p.split('/')[3] + '/' + p.split('/').at(-3))?.document || docs()
      } else if (/^\/production\/record\/\d+$/.test(p))
        data = record(Number(p.split('/').at(-1)))
      else if (p === '/production/record/scan') data = record(42)
      else if (p === '/production/record/list' || p === '/production/qc/list')
        data = { records: [record(41), record(42)], total: 2 }
      else if (p.endsWith('/statistics') || p.endsWith('/params')) data = {}
      return route.fulfill({ json: { code, data, message } })
    })
    // Pause one response until a second user action has finished.
    const pauseResponse = async (urlPattern) => {
      let release
      const gate = new Promise(resolve => { release = resolve })
      const started = page.waitForRequest(urlPattern)
      await page.route(urlPattern, async route => {
        await gate
        await route.fallback()
      }, { times: 1 })
      return { started, finish: async () => {
        const response = page.waitForResponse(urlPattern)
        release()
        await (await response).finished()
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      } }
    }
    try {
      await page.goto(base + '/#/design')
      const menu = async (id) => {
        await page
          .locator('tr')
          .filter({ has: page.getByText('TEST-' + id, { exact: true }) })
          .getByRole('button')
          .last()
          .click()
      }
      const editEntry = '填写生产信息'
      const viewEntry = '查看生产信息'
      const medical = '医疗器械'
      const nonmedical = '非医疗器械'
      const editPrint = '填写打印信息'
      const viewPrint = '查看打印信息'
      const drawings = '指令单和图纸'
      const applicationAction = '加工申请单'
      const leaves = [editPrint, viewPrint, drawings, applicationAction]
      const dialogTitled = (title) => page.getByRole('dialog').filter({
        has: page.locator('.dialog-header__title').getByText(title, { exact: true }),
      })
      const menuItem = (name) => page.getByRole('menuitem', { name, exact: true })
      const openBranch = async (source, role, entry, branch, expected) => {
        for (const name of leaves) {
          assert.equal(await source.getByRole(role, { name, exact: true }).count(), 0, name)
        }
        const otherEntry = entry === editEntry ? viewEntry : editEntry
        assert.equal(await source.getByRole(role, { name: otherEntry, exact: true }).count(), 0)
        const trigger = source.getByRole(role, { name: entry, exact: true })
        await trigger.hover()
        const chooser = page.getByRole('menu', { name: entry, exact: true })
        await chooser.waitFor()
        await chooser.getByRole('menuitem').first().hover({ trial: true })
        assert.equal(await dialogTitled(branch).count(), 0)
        const anchor = await trigger.boundingBox()
        const child = await chooser.boundingBox()
        assert.ok(child.x + child.width <= anchor.x + 1, `${branch} 应在入口左侧展开`)
        assert.ok(child.y < anchor.y + anchor.height && child.y + child.height > anchor.y, `${branch} 应与入口对齐 ${JSON.stringify({ anchor, child })}`)
        for (const name of leaves) assert.equal(await chooser.getByRole('menuitem', { name, exact: true }).count(), 0)
        const categories = branch === '生产信息' ? [medical, nonmedical] : [branch]
        assert.equal(await chooser.getByRole('menuitem').count(), categories.length)
        for (const name of categories) await chooser.getByRole('menuitem', { name, exact: true }).waitFor()
        if (categories.length === 1) {
          await chooser.getByRole('menuitem', { name: branch, exact: true }).hover()
          const actions = page.getByRole('menu', { name: branch, exact: true })
          await actions.waitFor()
          for (const name of leaves) assert.equal(await actions.getByRole('menuitem', { name, exact: true }).count(), Number(expected.includes(name)))
          return actions
        }
        return chooser
      }
      const listBranch = async (id, entry, branch, expected) => {
        await menu(id)
        await menuItem(entry).waitFor()
        return openBranch(page, 'menuitem', entry, branch, expected)
      }
      const openDetail = async (id) => {
        await menu(id)
        await menuItem('查看详情').click()
        const detail = dialogTitled('工单详情')
        await detail.waitFor()
        return detail
      }
      const close = async (dialog) => {
        await dialog.getByTitle('关闭', { exact: true }).click()
        await dialog.waitFor({ state: 'hidden' })
      }
      const choose = async (chooser, leaf) => {
        const category = leaf === applicationAction ? nonmedical : medical
        const categoryItem = chooser.getByRole('menuitem', { name: category, exact: true })
        if (await categoryItem.count()) {
          await categoryItem.hover()
          chooser = page.getByRole('menu', { name: category, exact: true })
        }
        const item = chooser.getByRole('menuitem', { name: leaf, exact: true })
        await item.hover()
        await item.click()
        await chooser.waitFor({ state: 'hidden' })
        await menuItem('查看详情').waitFor({ state: 'hidden' })
      }
      const mixedMenu = () => listBranch(10, editEntry, '生产信息', [editPrint, drawings, applicationAction])
      const both = await mixedMenu()
      const labelOffset = item => item.evaluate(el => {
        const nodes = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        while (nodes.nextNode()) {
          if (!nodes.currentNode.textContent.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(nodes.currentNode)
          return range.getBoundingClientRect().left - el.getBoundingClientRect().left
        }
        throw new Error('菜单缺少文字')
      })
      const offsets = await Promise.all([menuItem('查看详情'), menuItem(editEntry)].map(labelOffset))
      assert.ok(Math.abs(offsets[0] - offsets[1]) < 1, '列表菜单文字左边缘应对齐：' + offsets)

      await Promise.all([page.waitForResponse('**/workorder/10/package/101/print-info'), choose(both, editPrint)])
      const mixedPrint = dialogTitled(editPrint)
      await mixedPrint.locator('.pkg-item--active').getByText('PK-101').waitFor()
      assert.equal(await mixedPrint.getByText('PK-102', { exact: true }).count(), 0)
      const layoutSignature = async dialog => {
        const rules = [
          ['.dlr-slidebar', 'width'], ['.pkg-item--active', 'borderRadius'],
          ['.dpid2-card__header', 'backgroundImage'], ['.dpid2-card', 'borderRadius'],
          ['.dpid2-add-btn', 'borderStyle'],
        ]
        return Promise.all(rules.map(([selector, property]) => dialog.locator(selector).first()
          .evaluate((el, prop) => getComputedStyle(el)[prop], property)))
      }
      const printLayout = await layoutSignature(mixedPrint)
      await close(mixedPrint)

      const mixedDetail = await openDetail(10)
      assert.equal(await mixedDetail.getByRole('button', { name: editEntry, exact: true }).count(), 0)
      await close(mixedDetail)
      const mixedActions = await mixedMenu()
      await Promise.all([page.waitForResponse('**/workorder/10/package/102/processing-application'), choose(mixedActions, applicationAction)])
      const application = dialogTitled('加工申请单')
      await application.locator('.pkg-item--active .pkg-item__name').filter({ hasText: 'PK-102' }).waitFor()
      assert.equal(await application.locator('.pkg-item').filter({hasText:'PK-101'}).count(), 0)
      await close(application)

      await menu(10)
      await menuItem('上传设计文件').click()
      const mixedUpload = dialogTitled('上传设计文件')
      const routeSelector = mixedUpload.getByRole('radiogroup', { name: '数据包生产类型' })
      assert.equal(await routeSelector.count(), 0)
      for (const idx of [1, 2]) {
        const uploaded = page.waitForResponse('**/design/package/upload?*')
        await mixedUpload.locator('input[type="file"]').first().setInputFiles({
          name: 'TEST-10-' + idx + '.zip', mimeType: 'application/zip', buffer: Buffer.from('fixture'),
        })
        assert.equal(new URL((await uploaded).url()).searchParams.get('productionType'), null)
      }
      await mixedUpload.getByRole('button', { name: '完成上传' }).click()
      await mixedUpload.waitFor({ state: 'hidden' })
      assert.equal(await page.getByRole('dialog').count(), 0)
      const unassignedRequests = []
      const trackUnassigned = req => {
        if (req.url().includes('/package/1003/')) unassignedRequests.push([req.method(), new URL(req.url()).pathname])
      }
      page.on('request', trackUnassigned)
      await choose(await mixedMenu(), editPrint)
      const printRemark = mixedPrint.getByPlaceholder('选填，全局备注说明')
      await printRemark.fill('保留未保存的医疗打印备注')
      const targetPkg = mixedPrint.locator('.pkg-item').getByText('PK-1003', { exact: true })
      await targetPkg.click()
      await page.getByRole('button', { name: '继续填写' }).click()
      assert.equal(await printRemark.inputValue(), '保留未保存的医疗打印备注')
      const printUrl = '**/workorder/10/package/1003/print-info'
      await page.route(printUrl, route => route.fulfill({ json: { code: 500, message: '打印详情暂时不可用' } }), { times: 1 })
      await targetPkg.click()
      await page.getByRole('button', { name: '放弃修改' }).click()
      await mixedPrint.getByRole('button', { name: '重试' }).waitFor()
      assert.equal(await printRemark.count(), 0)
      await page.route(printUrl, route => route.fulfill({ json: { code: 200, data: { items: [], canSave: false } } }), { times: 1 })
      await mixedPrint.getByRole('button', { name: '重试' }).click()
      await printRemark.waitFor()
      assert.ok(await mixedPrint.getByRole('button', { name: '保存打印信息' }).isDisabled())
      await close(mixedPrint)
      await choose(await mixedMenu(), applicationAction)
      await Promise.all([
        page.waitForResponse('**/workorder/10/package/1003/processing-application'),
        application.locator('.pkg-item').filter({hasText:'PK-1003'}).click(),
      ])
      const firstSave = application.getByRole('button', { name: '保存申请单' })
      assert.equal(await application.locator('.dpid2-card').count(), 1, '空申请默认显示第一张产品卡')
      assert.deepEqual(await layoutSignature(application), printLayout)
      const expectValidation = async (button, text) => {
        await button.click()
        await page.locator('.el-message--warning').filter({ hasText: text }).last().waitFor()
      }
      await expectValidation(firstSave, '第 1 个产品')
      await application.getByRole('button', {name:'添加产品'}).click()
      await application.getByRole('button', {name:'移除产品'}).last().click()
      await application.locator('textarea').fill('未保存备注')
      await expectValidation(firstSave, '第 1 个产品')
      assert.equal(await application.getByText('交付时间', { exact: true }).count(), 0)
      const summary = application.locator('.dpid2-orderbar')
      assert.deepEqual(await summary.locator('.dpid2-orderbar__label').allTextContents(),
        ['订单编号', '客户', '联系人', '患者姓名', '医院', '预交货', '是否邮寄', '邮寄地址'])
      await summary.getByText('测试地址', { exact: true }).waitFor()
      assert.equal(await summary.locator('input, textarea').count(), 0)
      assert.equal(await application.getByRole('button', { name: '预览', exact: true }).count(), 0)
      assert.equal(await application.getByRole('button', { name: '下载', exact: true }).count(), 0)
      await application.getByTitle('关闭', { exact: true }).click()
      await page.getByRole('button', { name: '放弃修改' }).click()
      await application.waitFor({ state: 'hidden' })
      const documents = dialogTitled('图纸和指令单')
      const delayedInstruction = await pauseResponse('**/workorder/10/package/101/instruction/preview-url')
      await choose(await mixedMenu(), drawings)
      await delayedInstruction.started
      await documents.locator('.pkg-item').getByText('PK-1003', { exact: true }).click()
      await documents.getByText('该数据包暂无指令单文件').waitFor()
      await delayedInstruction.finish()
      assert.equal(await documents.locator('.ddpd-version-card__badge-version').count(), 0)
      page.off('request', trackUnassigned)
      assert.ok(unassignedRequests.every(([method, pathname]) => method === 'GET' && !pathname.includes('/preview-url')))
      await close(documents)
      firstDesignAppend = true
      Object.assign(mixedOrder.packageList.find(pkg => pkg.id === 101), { editable: true, canEditPrintInfo: true })
      Object.assign(mixedOrder.packageList.find(pkg => pkg.id === 102), { editable: true })
      await choose(await mixedMenu(), editPrint)
      await mixedPrint.locator('.pkg-item--active').getByText('PK-101').waitFor()
      await mixedPrint.getByRole('button', { name: '保存打印信息', disabled: false }).waitFor()
      await close(mixedPrint)
      await choose(await mixedMenu(), applicationAction)
      await application.locator('.pkg-item--active .pkg-item__name').filter({ hasText: 'PK-102' }).waitFor()
      await application.getByRole('button', { name: '添加产品', disabled: false }).waitFor()
      await close(application)
      firstDesignAppend = false
      await menu(11)
      await menuItem('上传设计文件').click()
      const downgraded = dialogTitled('上传设计文件')
      const uploadControls = downgraded.locator('input[type="file"]')
      assert.ok(await uploadControls.first().isEnabled())
      assert.ok(await uploadControls.nth(1).isEnabled())
      await close(downgraded)
      await menu(9)
      await menuItem('查看详情').waitFor()
      for (const name of ['订单取消', '生成二维码', '在线标注', '可视化预览', editEntry, viewEntry]) {
        assert.equal(await menuItem(name).count(), 0, '待设计工单隐藏无权操作 ' + name)
      }
      await page.getByRole('heading', { name: '我的工单' }).click()
      const firstMenu = await listBranch(1, editEntry, medical, [editPrint, drawings])
      await firstMenu.getByRole('menuitem', { name: drawings }).hover()
      // Hold longer than the hover-close and focus transition so a slow selection is covered.
      await page.waitForTimeout(600)
      assert.ok(await firstMenu.isVisible(), '鼠标停在子项时，两级菜单应保持展开')
      await menuItem('查看详情').hover()
      await firstMenu.waitFor({ state: 'hidden' })
      const trigger = menuItem(editEntry)
      await trigger.focus()
      await trigger.press('ArrowLeft')
      await menuItem(medical).press('ArrowLeft')
      await firstMenu.waitFor()
      await page.keyboard.press('Escape')
      await firstMenu.waitFor({ state: 'hidden' })
      assert.ok(await trigger.isVisible(), '收起子菜单后应能继续操作本行')
      const print = await openBranch(page, 'menuitem', editEntry, medical, [editPrint, drawings])
      await Promise.all([
        page.waitForResponse('**/design/workorder/1/package/11/print-info'),
        choose(print, editPrint),
      ])
      const printForm = dialogTitled(editPrint)
      await printForm.locator('.pkg-item--active').getByText('PK-11').waitFor()
      await printForm.getByText('TEST-1', { exact: true }).waitFor()
      await close(printForm)

      const medicalDetail = await openDetail(7)
      assert.equal(await medicalDetail.getByRole('button', { name: viewEntry, exact: true }).count(), 0)
      await close(medicalDetail)
      const archivedMedical = () => listBranch(7, viewEntry, medical, [viewPrint, drawings])
      const archivedPrint = await archivedMedical()
      await Promise.all([
        page.waitForResponse('**/design/workorder/7/package/11/print-info'),
        choose(archivedPrint, viewPrint),
      ])
      const readonlyPrint = dialogTitled(viewPrint)
      await readonlyPrint.locator('.pkg-item--active').getByText('PK-11').waitFor()
      assert.ok(await readonlyPrint.locator('fieldset').evaluate(fieldset => fieldset.disabled))
      assert.ok(await readonlyPrint.getByRole('button', { name: '保存打印信息' }).isDisabled())
      await close(readonlyPrint)

      const archivedDocs = await archivedMedical()
      await Promise.all([
        page.waitForResponse('**/design/workorder/7/package/11/instruction/preview-url'),
        choose(archivedDocs, drawings),
      ])
      const archivedDrawings = dialogTitled('图纸和指令单')
      await archivedDrawings.getByRole('button', { name: '上传修订版', disabled: true }).waitFor()
      await close(archivedDrawings)

      const appended = await listBranch(8, editEntry, medical, [editPrint, drawings])
      await Promise.all([
        page.waitForResponse('**/design/workorder/8/package/82/print-info?batchId=88'),
        choose(appended, editPrint),
      ])
      await printForm.locator('.pkg-item--active').getByText('PK-82').waitFor()
      await printForm.getByRole('button', { name: '保存打印信息', disabled: false }).waitFor()
      await printForm.getByText('PK-81', { exact: true }).click()
      await printForm.getByRole('button', { name: '保存打印信息', disabled: true }).waitFor()
      await close(printForm)

      for (const [id, category] of [[5, '非实体交付'], [6, '异地打印']]) {
        await choose(await listBranch(id, editEntry, category, [editPrint, drawings]), editPrint)
        await close(printForm)
        const detail = await openDetail(id)
        assert.equal(await detail.getByRole('button', { name: editEntry }).count(), 0)
        await close(detail)
        await choose(await listBranch(id, editEntry, category, [editPrint, drawings]), drawings)
        await close(dialogTitled('图纸和指令单'))
      }
      await choose(await listBranch(2, editEntry, nonmedical, [applicationAction]), applicationAction)
      const dialog = page
        .getByRole('dialog')
        .filter({ has: page.locator('.processing-form') })
      await dialog
        .getByText('模型.stl (#202)', { exact: true })
        .first()
        .waitFor()
      await dialog.getByText('TEST-2', { exact: true }).waitFor()
      assert.equal(await dialog.getByText('模型文件', { exact: true }).count(), 0)
      await dialog.locator('.pkg-item--active .pkg-item__name').getByText('PK-11', { exact: true }).waitFor()
      await dialog.locator('textarea').fill('修改说明')
      await dialog.getByRole('button', { name: '保存申请单', exact: true }).click()
      const alert = dialog.locator('.processing-error')
      await alert.waitFor()
      const originalViewport = page.viewportSize()
      await page.setViewportSize({ width: 1100, height: 620 })
      const title = alert.locator('.el-alert__title')
      assert.match(await title.textContent(), /版本冲突，请刷新后重试\n/)
      for (const child of [title, alert.getByRole('button', { name: '重新加载' })]) {
        const box = await child.boundingBox()
        const bounds = await alert.boundingBox()
        assert.ok(box && bounds && box.y >= bounds.y - 1 && box.y + box.height <= bounds.y + bounds.height + 1)
        assert.ok(box.x >= bounds.x - 1 && box.x + box.width <= bounds.x + bounds.width + 1)
      }
      await page.setViewportSize(originalViewport)
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
      await dialog.getByRole('button', {name:'添加产品'}).click()
      const newCard = dialog.locator('.dpid2-card').last()
      const selectField = async (label, option) => {
        await newCard.locator('.dpid2-field').filter({has: page.getByText(label,{exact:true})}).locator('.el-select__wrapper').click()
        await page.getByRole('option',{name:option,exact:true}).click()
      }
      await selectField('产品分类','模型类')
      await selectField('产品名称','样例模型')
      await selectField('型号规格','标准号')
      await expectValidation(dialog.getByRole('button', {name:'保存申请单'}), '请选择本包的打印模型')
      await selectField('打印模型','模型.stl (#201)')
      await page.getByRole('option',{name:'模型.stl (#202)',exact:true}).click()
      await newCard.locator('.dpid2-card__header').click()
      await newCard.getByRole('spinbutton').nth(1).fill('99')
      await dialog.locator('textarea').focus()
      await expectValidation(dialog.getByRole('button', {name:'保存申请单'}), '合计超过 99 件')
      await newCard.getByRole('spinbutton').nth(1).fill('2')
      await dialog.locator('textarea').fill('修改说明')
      await dialog.getByRole('button', { name: '保存申请单', exact: true }).click()
      assert.equal(await dialog.getByRole('tab', { name:'加工申请单文件' }).getAttribute('aria-selected'), 'true')
      const savedRevision = records.get('2/11').revision
      await dialog.getByRole('tab', { name: '填写加工申请单' }).click()
      await dialog.getByRole('button', { name: '保存申请单', exact: true }).click()
      await page.getByText('当前申请单已保存', { exact: true }).waitFor()
      assert.equal(await dialog.getByRole('tab', { name: '加工申请单文件' }).getAttribute('aria-selected'), 'true')
      assert.equal(records.get('2/11').revision, savedRevision)
      await dialog.getByRole('button', { name:/在线预览|预览并确认/ }).click()
      await page
        .getByRole('dialog')
        .filter({ has: page.locator('.xlsx-preview') })
        .getByRole('listitem')
        .filter({ hasText: '第2页' })
        .click()
      assert.equal('postalAddress' in lastSave || 'deliveryTime' in lastSave, false)
      assert.equal(lastSave.items[0].packageFileId, 202)
      assert.ok(lastSave.items.every(row => row.packageFileId !== 203))
      assert.equal(lastSave.items.length, 16)
      const newRows = lastSave.items.slice(-2)
      assert.deepEqual(newRows.map(r => r.packageFileId), [201, 202])
      assert.deepEqual(newRows.map(r => r.quantity), [1, 2])
      assert.ok(newRows[0].groupKey && newRows[0].groupKey === newRows[1].groupKey)
      assert.ok(newRows.every(r => r.productId === 510 && r.specId === 520 && r.materialCode === 'RESIN' && r.colorCode === 'WHITE'))
      await page
        .getByRole('dialog')
        .filter({ has: page.locator('.xlsx-preview') })
        .getByTitle('关闭', { exact: true })
        .click()
      const downloaded = page.waitForEvent('download')
      await dialog.getByRole('button', { name: '下载文件', exact: true }).click()
      const dl = await downloaded
      assert.equal(dl.suggestedFilename(), '加工申请单.xlsx')
      assert.deepEqual(await fs.readFile(await dl.path()), Buffer.from(bytes))
      await runProcessingRevisionTest(page, dialog)
      await dialog
        .getByRole('button', { name: '关闭', exact: true })
        .last()
        .click()
      await choose(await listBranch(3, viewEntry, nonmedical, [applicationAction]), applicationAction)
      await dialog.locator('.pkg-item--active').getByText('已归档', { exact: true }).waitFor()
      await dialog.getByText('TEST-3', { exact: true }).waitFor()
      assert.equal(
        await dialog.getByRole('button', { name: '添加产品' }).count(),
        0,
      )
      await dialog
        .getByRole('button', { name: '关闭', exact: true })
        .last()
        .click()
      const detailDoc = docs()
      rows[1].packageList = [{ ...pkgs[0], productionType: 2, files, editable: true, processingApplication: detailDoc }]
      rows[1].submitCheck.blockReason = '包 PK-11 的加工申请单待确认'
      const detail = await openDetail(2)
      await detail.getByText('包 PK-11 的加工申请单待确认').waitFor()
      const detailFile = detail.getByLabel('加工申请单文件')
      const applicationCard = detailFile.locator('.dwd-pkg-ver--instr')
      await applicationCard.locator('.dwd-pkg-ver__label').filter({ hasText: '加工申请单' }).waitFor()
      await applicationCard.getByText('版本 V' + detailDoc.revision).waitFor()
      assert.ok(await applicationCard.evaluate(card => {
        const grid = card.closest('.dwd-pkg-versions')
        return getComputedStyle(grid).display === 'grid'
          && Math.abs(card.getBoundingClientRect().width * 2 + parseFloat(getComputedStyle(grid).columnGap)
            - grid.getBoundingClientRect().width) < 2
      }), '加工申请单应占文档卡片网格的一列')
      const detailDownload = page.waitForEvent('download')
      await detailFile.getByRole('button', { name: '下载' }).click()
      assert.deepEqual(await fs.readFile(await (await detailDownload).path()), Buffer.from(bytes))
      assert.equal(await detailFile.getByRole('button').count(), 1)
      assert.equal(await detailFile.getByText('待确认', { exact: true }).count(), 0)
      assert.equal(await detailFile.locator('.dwd-confirmed-badge').count(), 0)
      await detail.locator('.dwd-pkg-card__tags').getByText('加工申请单', { exact: true }).waitFor()
      await close(detail)
      detailDoc.confirmed = true
      rows[1].submitCheck.blockReason = '包 PK-11 缺少材质'
      await openDetail(2)
      await detailFile.locator('.dwd-confirmed-badge svg').waitFor()
      await detail.getByText('包 PK-11 缺少材质', { exact: true }).waitFor()
      const remark = detail.getByPlaceholder('请输入设计师备注，最多 2000 字符')
      await remark.fill('尚未保存的设计师备注')
      await detail.getByRole('button', { name: '完成设计' }).click()
      await detail.getByText('包 PK-12，第 3 行缺数量').waitFor()
      records.get('2/11').headerNeedsConfirmation = true
      records.get('2/11').header.hospitalName = '已更正单位'
      assert.equal(await remark.inputValue(), '尚未保存的设计师备注')
      await close(detail)
      await choose(await listBranch(2, editEntry, nonmedical, [applicationAction]), applicationAction)
      await dialog
        .getByText('模型.stl (#202)', { exact: true })
        .first()
        .waitFor()
      await dialog.getByText('已更正单位', { exact: true }).waitFor()
      await dialog.getByRole('tab', { name:'加工申请单文件' }).click()
      assert.ok(await dialog.getByRole('button', { name: /在线预览|预览并确认/ }).isDisabled())
      await dialog.getByRole('tab', { name:'填写加工申请单' }).click()
      await dialog.getByRole('button', { name: '确认表头并保存' }).click()
      await dialog.getByText('版本 5', { exact: true }).waitFor()
      assert.equal(lastSave.confirmedHeader.hospitalName, '已更正单位')
      await dialog.getByRole('tab', {name:'填写加工申请单'}).click()
      records.get('2/11').header.hospitalName = '二次更正单位'
      records.get('2/11').headerNeedsConfirmation = true
      await dialog.locator('textarea').fill('表头冲突时保留此输入')
      await dialog.getByRole('button', { name: '保存申请单', exact: true }).click()
      await dialog.getByText('二次更正单位', { exact: true }).waitFor()
      assert.equal(await dialog.locator('textarea').inputValue(), '表头冲突时保留此输入')
      await dialog.getByRole('tab', { name:'加工申请单文件' }).click()
      assert.ok(await dialog.getByRole('button', { name: /在线预览|预览并确认/ }).isDisabled())
      await dialog.getByRole('tab', { name:'填写加工申请单' }).click()
      await dialog.getByRole('button', { name: '确认表头并保存' }).click()
      await dialog.getByText('版本 6', { exact: true }).waitFor()
      assert.equal(lastSave.confirmedHeader.hospitalName, '二次更正单位')
      await dialog.getByRole('button', { name: '关闭', exact: true }).last().click()
      await openDetail(2)
      await detail.getByText('包 PK-12，第 3 行缺数量').waitFor({ state: 'hidden' })
      await detail.getByText('包 PK-11 缺少材质', { exact: true }).waitFor()
      await detail
        .getByRole('button', { name: '关闭', exact: true })
        .last()
        .click()
      const delayedUpload = await pauseResponse('**/design/package-batch?orderId=1')
      await menu(1)
      await page.getByRole('menuitem', { name: '上传设计文件' }).click()
      await delayedUpload.started
      await page.getByRole('menuitem', { name: '上传设计文件' }).waitFor({ state: 'hidden' })
      for (const [id, expectedPackage] of [
        [2, 22],
        [4, 23],
        [5, null],
        [6, null],
        [1, 26],
        [2, 'missing'],
      ]) {
        await menu(id)
        await page.getByRole('menuitem', { name: '上传设计文件' }).click()
        const upload = page
          .getByRole('dialog')
          .filter({ has: page.getByRole('button', { name: '完成上传' }) })
        await upload.getByText('订单号：TEST-' + id, { exact: true }).waitFor()
        if (expectedPackage === 22) {
          const historical = upload.locator('.fup-file-card').filter({ hasText: '历史包.zip' })
          await historical.waitFor()
          assert.equal(await historical.locator('button.fup-file-card__action').count(), 0)
          const types = upload.getByRole('radiogroup', { name: '数据包生产类型' })
          assert.equal(await types.count(), 0)
          await delayedUpload.finish()
          assert.ok(await upload.getByText('订单号：TEST-2', { exact: true }).isVisible())
        }
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
        const uploadedParams = new URL((await sent).url()).searchParams
        assert.equal(uploadedParams.get('orderId'), String(id))
        assert.equal(uploadedParams.get('productionType'), null)
        assert.equal(uploadedBatch, id === 4 ? '77' : null)
        await upload.getByRole('button', { name: '完成上传' }).click()
        await upload.waitFor({ state: 'hidden' })
        assert.equal(await page.getByRole('dialog').count(), 0)
      }
      await page.goto(base + '/#/manufacture?detailId=41&action=flowcard')
      const flow = page.locator('.flow-card-dialog')
      await flow.getByText('UV固化', { exact: true }).first().waitFor()
      await flow.locator('.el-dialog__headerbtn').click()
      await flow.waitFor({ state: 'hidden' })
      const scan = page.getByPlaceholder('输入流转卡编号回车打开流转卡')
      for (const action of ['list', 'deepLink', 'close']) {
        const delayedScan = await pauseResponse('**/production/record/scan?*')
        if (action === 'close') {
          await page.goto(base + '/#/manufacture?detailId=41&action=flowcard')
          const card = flow.getByText('包-41', { exact: true }).first()
          await card.click()
          await page.keyboard.type('FC-42')
          await page.keyboard.press('Enter')
        } else {
          await scan.fill('FC-42')
          await scan.press('Enter')
        }
        await delayedScan.started
        if (action === 'list') {
          await page.locator('tbody tr').first().getByRole('button').last().click()
          await page.getByRole('menuitem', { name: '流程卡' }).click()
        } else if (action === 'deepLink') {
          await page.goto(base + '/#/manufacture?detailId=41&action=flowcard')
        }
        await flow.getByText('包-41', { exact: true }).first().waitFor()
        if (action !== 'close') {
          await delayedScan.finish()
          assert.ok(await flow.getByText('包-41', { exact: true }).first().isVisible())
        }
        await flow.locator('.el-dialog__headerbtn').click()
        await flow.waitFor({ state: 'hidden' })
        if (action === 'close') {
          await delayedScan.finish()
          assert.ok(await flow.isHidden())
        }
      }
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
        .getByLabel('加工申请单文件')
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
        .getByLabel('加工申请单文件')
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
      await choose(await listBranch(2, viewEntry, nonmedical, [applicationAction]), applicationAction)
      await dialog.getByText('版本 6', { exact: true }).waitFor()
      assert.equal(
        await dialog.getByRole('button', { name: '添加产品' }).count(),
        0,
      )
      await dialog.getByRole('button', { name: '关闭', exact: true }).last().click()
      perms.splice(0, perms.length, 'design:View', 'design:DocumentPreview')
      await page.reload()
      for (const [orderId, entry, revisionDisabled] of [[1, editEntry, false], [7, viewEntry, true]]) {
        const documentsOnly = await listBranch(orderId, entry, medical, [drawings])
        await Promise.all([
          page.waitForResponse('**/design/workorder/' + orderId + '/package/11/instruction/preview-url'),
          choose(documentsOnly, drawings),
        ])
        const documents = dialogTitled('图纸和指令单')
        await documents.locator('.pkg-item--active').getByText('PK-11').waitFor()
        await documents.getByRole('button', { name: '上传修订版', disabled: revisionDisabled }).waitFor()
        await close(documents)
      }
      rows[2].packageList = [{ ...pkgs[0], files: [], processingApplication: docs() }]
      perms.splice(0, perms.length, 'design:View')
      await page.reload()
      for (const id of [1, 3]) {
        await menu(id)
        await menuItem('查看详情').waitFor()
        for (const name of [editEntry, viewEntry, ...leaves]) assert.equal(await menuItem(name).count(), 0)
        await menuItem('查看详情').click()
        const hiddenActions = dialogTitled('工单详情')
        await hiddenActions.waitFor()
        for (const name of [editEntry, viewEntry, ...leaves]) {
          assert.equal(await hiddenActions.getByRole('button', { name, exact: true }).count(), 0)
        }
        if (id === 1) await close(hiddenActions)
      }
      await page.locator('.dwd-pkg-card').first().waitFor()
      assert.equal(await page.getByLabel('加工申请单文件').count(), 0)
      if (process.env.PROCESSING_QA_DIR) {
        await require('./java-processing-contract.cjs')({
          page,
          base,
          directory: process.env.PROCESSING_QA_DIR,
          permissions: perms,
          openBranch: (entry, expected) => openBranch(page, 'menuitem', entry, nonmedical, [expected]),
        })
      }
      assert.equal(errors.length, 0, errors.join('\n'))
      console.log(
        'PASS mixed and single-route design: unassigned uploads, submitting organization qualification, historical batches, left hover menus, form and document isolation, uploads and permissions. PASS production card, archive download and quality transfer.',
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
