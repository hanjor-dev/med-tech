// Run with Node against the Vite preview build, using PLAYWRIGHT_MODULE for an external installation.
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

async function run() {
  const { preview } = await import('vite')
  const server = await preview({ preview: { host: '127.0.0.1', port: 0 } })
  const base = 'http://127.0.0.1:' + server.httpServer.address().port
  let browser
  try {
    browser = await chromium.launch({ channel: 'chrome' })
    const context = await browser.newContext()
    await context.addCookies([{ name: 'token', value: 'synthetic', url: base }])
    const page = await context.newPage()
    page.setDefaultTimeout(10000)
    const draft = { id: 7, patientName: '测试患者', orderType: 1, hospitalId: 2,
      businessType: '11.1', needsPhysicalDelivery: 1, items: [{ bodyPartId: 1, projectId: 2 }] }
    const writes = []
    await page.route('**/yi/**', async route => {
      const api = new URL(route.request().url()).pathname.slice(3)
      let data = []
      if (api === '/system/auth/info') data = {
        user: { id: 1, orgId: 1, roleCode: 'admin' },
        permissions: ['order:TabDraft', 'order:View', 'draft:Edit', 'order:TabOrderList'],
        menus: [{ path: '/order', resourceType: 2, resourceName: '订单', resourceCode: 'order',
          component: 'business/order', visible: 1, status: 1 }],
      }
      if (api === '/order/draft/list') data = { records: [draft], total: 1 }
      if (api === '/order/draft/7') data = draft
      if (api === '/order/page') data = { records: [], total: 0 }
      if (api === '/system/config/key') data = { configValue: '0' }
      if (api === '/order/draft' || api === '/order') {
        const payload = route.request().postDataJSON()
        writes.push([api, payload.provideUdi])
        if (api === '/order/draft') Object.assign(draft, payload)
        data = 7
      }
      await route.fulfill({ json: { code: 200, data, message: 'ok' } })
    })
    await page.goto(base + '/#/order')
    await page.getByRole('button', { name: '我的草稿' }).click()
    const edit = page.locator('.icon-bianji:visible')
    const dialog = page.locator('.el-dialog:visible')
    const box = dialog.getByRole('checkbox', { name: '提供UDI码' })
    const button = name => dialog.getByRole('button', { name })
    await edit.click()
    await box.waitFor({ state: 'attached' })
    assert.equal(await box.isChecked(), false)
    await dialog.getByText('提供UDI码', { exact: true }).click()
    await button('下一步，上传附件').click()
    await button('上一步').click()
    await box.waitFor({ state: 'attached' })
    assert.equal(await box.isChecked(), true)
    await button('上一步').waitFor({ state: 'hidden' })
    await button('保存为草稿').click()
    await dialog.waitFor({ state: 'hidden' })
    assert.deepEqual(writes, [['/order/draft', 1]])
    await edit.click()
    await box.waitFor({ state: 'attached' })
    assert.equal(await box.isChecked(), true)
    await dialog.getByText('提供UDI码', { exact: true }).click()
    await button('下一步，上传附件').click()
    await button('提交订单').click()
    await dialog.waitFor({ state: 'hidden' })
    assert.deepEqual(writes, [['/order/draft', 1], ['/order', 0]])
    console.log('PASS legacy draft, next/back, save, reopen and submit numeric UDI')
  } finally {
    await browser?.close()
    await server.close()
  }
}
run().catch(error => { console.error(error); process.exitCode = 1 })
