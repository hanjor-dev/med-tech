// Run against npm run build output. PLAYWRIGHT_MODULE may point to a local Playwright installation.
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const modules = ['order', 'design', 'manufacture', 'quality', 'storage']
const lists = ['/order/page', '/design/workorder/list', '/production/record/list',
  '/production/qc/list', '/production/warehouse/list', '/production/product/list']
const rows = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1, recordId: i + 1, orderId: i + 1, orderCode: 'ORD-' + i,
  recordNo: 'FC-' + i, productNo: 'PROD-' + i, patientName: '测试患者', items: [],
  orderType: 1, orderTypeName: '医疗器械', status: 2020, isUrgent: 1,
  provideUdi: i === 99 ? 1 : i === 0 ? undefined : 0,
  udiCode: i === 99 ? null : '已有产品码', products: [], packageList: [],
}))

async function run() {
  const { preview } = await import('vite')
  const server = await preview({ preview: { host: '127.0.0.1', port: 0 } })
  const base = 'http://127.0.0.1:' + server.httpServer.address().port
  let browser
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.addCookies([{ name: 'token', value: 'synthetic', url: base }])
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.setDefaultTimeout(8000)
    await page.route('**/yi/**', async route => {
      const api = new URL(route.request().url()).pathname.slice(3)
      let data = []
      if (api === '/system/auth/info') {
        data = {
          user: { id: 1, orgId: 1, roleCode: 'admin', realName: '合成用户' },
          permissions: ['order:Add', 'order:View', 'order:TabOrderList', 'design:View', 'manufacture:View', 'storage:View', 'Quality'],
          menus: modules.map(name => ({ path: '/' + name, resourceType: 2, resourceName: name,
            resourceCode: name, component: 'business/' + name, visible: 1, status: 1 })),
        }
      } else if (api.endsWith('/column-config')) {
        // Users can hide the order number column.
        data = { columns: [{ field: 'action', label: '操作', visible: true, width: 160, sort: 1 }] }
      } else if (lists.includes(api)) {
        data = { records: rows, total: rows.length }
      } else if (/^\/(order|design\/workorder|production\/record|production\/warehouse\/detail)\/\d+$/.test(api)) {
        // These detail IDs do not occur in the current list.
        const id = Number(api.split('/').at(-1))
        data = { ...rows[99], id, recordId: id, patientName: '详情患者' + id,
          orderCode: 'DETAIL-' + id, provideUdi: id === 301 ? 1 : 0 }
      } else if (api.endsWith('/org/1')) {
        data = { id: 1, qualificationType: 1 }
      } else if (api.endsWith('/statistics')) {
        data = {}
      }
      await route.fulfill({ json: { code: 200, data, message: 'ok' } })
    })

    async function verifyCorners(name) {
      const marked = page.locator('.udi-corner:visible')
      await marked.first().waitFor()
      assert.equal(await marked.count(), 1, name + ' should mark only the requested order')
      const cell = marked.locator('xpath=ancestor::td[1]')
      assert.match(await cell.innerText(), /100/)
      const separate = await cell.evaluate(td => {
        const badge = td.querySelector('.udi-corner').getBoundingClientRect()
        const index = td.querySelector('.udi-index--marked')
        const text = document.createRange()
        text.selectNodeContents(index)
        const number = text.getBoundingClientRect()
        const bounds = td.getBoundingClientRect()
        // Only the upper-left triangle contains the ribbon. Its diagonal is x + y = width.
        const outsideCorner = number.left - badge.left + number.top - badge.top > badge.width
        return badge.left >= bounds.left - 1 && badge.top >= bounds.top - 1 &&
          badge.bottom <= bounds.bottom + 1 && outsideCorner && number.right <= bounds.right
      })
      assert.ok(separate, name + ' badge must fit without obscuring the index')
    }

    for (const name of modules) {
      // Start a fresh route so an outgoing table cannot satisfy the badge locator.
      await page.goto('about:blank')
      await page.goto(base + '/#/' + name)
      console.log('Checking', name)
      await verifyCorners(name)
      if (name === 'order') {
        await page.getByRole('button', { name: '新建订单' }).click()
        const form = page.locator('.el-dialog:visible')
        const checkbox = form.getByRole('checkbox', { name: '提供UDI码' })
        await form.getByText('提供UDI码', { exact: true }).waitFor()
        assert.equal(await checkbox.isChecked(), false)
        await form.getByText('提供UDI码', { exact: true }).click()
        assert.equal(await checkbox.isChecked(), true)
        const type = form.locator('.el-form-item').filter({ has: page.getByText('订单类型', { exact: true }) }).locator('.el-select__wrapper')
        await type.click()
        await page.getByRole('option', { name: '非医疗器械', exact: true }).click()
        await checkbox.waitFor({ state: 'detached' })
        await type.click()
        await page.getByRole('option', { name: '医疗器械', exact: true }).click()
        await form.getByText('提供UDI码', { exact: true }).waitFor()
        assert.equal(await checkbox.isChecked(), false)
        await form.getByTitle('关闭', { exact: true }).click()
      }
      if (name === 'manufacture') {
        const scanner = page.getByPlaceholder('输入流转卡编号回车打开流转卡')
        await scanner.fill('301')
        await scanner.press('Enter')
        const card = page.locator('.flow-card-dialog:visible')
        await card.locator('.el-dialog__header .udi-tag').getByText('需提供').waitFor()
        await card.locator('.el-dialog__headerbtn').click()
        await page.getByRole('button', { name: '产品明细', exact: true }).click()
        await page.getByText('PROD-0', { exact: true }).waitFor()
        await verifyCorners('产品明细')
      }
      await page.goto(base + '/#/' + name + '?detailId=301')
      await page.locator('.el-dialog__header .udi-tag:visible').getByText('需提供').waitFor()
      const markedDetail = page.locator('.el-dialog:visible').filter({ has: page.locator('.udi-tag') })
      await markedDetail.getByTitle('关闭', { exact: true }).click()
      await markedDetail.waitFor({ state: 'hidden' })
      await page.goto(base + '/#/' + name + '?detailId=302')
      await page.getByText('详情患者302', { exact: true }).waitFor()
      assert.equal(await page.locator('.udi-tag:visible').count(), 0)
    }
    assert.deepEqual(errors, [])
    console.log('PASS UDI corners in six lists, three-digit index layout and five independent details')
  } finally {
    await browser?.close()
    await server.close()
  }
}

run().catch(error => { console.error(error); process.exitCode = 1 })
