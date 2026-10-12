import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const base = process.env.IZMAB_URL || 'http://127.0.0.1:4173/'
const executablePath = process.env.CHROMIUM_PATH
const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { channel: 'chrome', headless: true })
const failures = []
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)

try {
  // Static pass: every language, reduced motion, no leader, nothing hidden.
  for (const language of ['en', 'fa', 'hy', 'ru']) {
    const context = await browser.newContext({
      viewport: { width: language === 'en' ? 1440 : 390, height: language === 'en' ? 900 : 844 },
      reducedMotion: 'reduce', deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    page.on('pageerror', error => failures.push(`${language}: ${error.message}`))
    await page.goto(`${base}?lang=${language}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('html').getAttribute('lang'), language)
    assert.equal(await page.locator('html').getAttribute('dir'), language === 'fa' ? 'rtl' : 'ltr')
    assert.equal(await page.locator('.leader').count(), 0, 'Leader should not run with reduced motion')
    assert.equal(await page.locator('.gift-signature').count(), 0, 'Gift signature should be gone')
    for (const id of ['top', 'manifesto', 'work', 'reel', 'about', 'process', 'pricing', 'journal', 'feed', 'studio', 'contact', 'credits'])
      assert.equal(await page.locator(`#${id}`).count(), 1, `${language}: #${id} missing`)
    assert.equal(await page.locator('.slate').count(), 3)
    assert.match(await page.locator('.price-main').first().innerText(), /\$|US/, `${language}: USD price missing`)
    assert.match(await page.locator('.price-alt').first().innerText(), /֏/, `${language}: AMD conversion missing`)
    await page.locator('.currency button').nth(1).click()
    assert.match(await page.locator('.price-main').first().innerText(), /֏/, `${language}: AMD toggle failed`)
    assert.ok((await page.locator('.studio-fact').count()) >= 5, `${language}: studio facts missing`)
    assert.ok((await overflow(page)) <= 2, `${language}: horizontal overflow`)
    // Reduced motion: the work list switches projects on click.
    await page.locator('.work-index button').nth(3).click()
    assert.equal(await page.locator('.work-index button').nth(3).getAttribute('aria-current'), 'true')
    await page.screenshot({ path: join(tmpdir(), `izmab-qa-${language}-hero.png`) })
    if (language === 'en') {
      await page.locator('.pill-menu').click()
      assert.equal(await page.locator('.pill-menu').getAttribute('aria-expanded'), 'true')
      await page.locator('.menu-item').first().click()
      assert.equal(await page.locator('.pill-menu').getAttribute('aria-expanded'), 'false')
    }
    await context.close()
    process.stdout.write(`${language}: sections, translation, prices, studio OK\n`)
  }

  // Motion pass: leader, viewfinder cursor, WebGL scenes, scroll-driven work cuts, language transition.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  page.on('pageerror', error => failures.push(`motion: ${error.message}`))
  await page.goto(base, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('.leader').count(), 1, 'Leader countdown missing on first visit')
  await page.locator('.leader').waitFor({ state: 'detached', timeout: 12000 })
  await page.mouse.move(400, 400, { steps: 6 })
  await page.waitForTimeout(300)
  assert.ok(await page.locator('.cursor.is-on').count(), 'Cursor did not activate')
  assert.ok(await page.locator('.hero .lens-mark.is-lens canvas').count(), 'Hero lens blur did not initialize')
  const workCounter = async () => page.locator('.work-count').innerText()
  assert.match(await workCounter(), /^01/)
  await page.evaluate(() => { const w = document.getElementById('work'); window.scrollTo(0, w.getBoundingClientRect().top + scrollY + (w.offsetHeight - innerHeight) * .6) })
  await page.waitForTimeout(1600)
  assert.match(await workCounter(), /^04/, 'Scrolling did not cut to the fourth project')
  assert.ok(await page.locator('.work .scene-canvas canvas').count(), 'Work scene canvas did not initialize')
  await page.screenshot({ path: join(tmpdir(), 'izmab-qa-work.png') })
  await page.locator('.pill-lang select').selectOption('hy')
  await page.waitForFunction(() => document.documentElement.lang === 'hy', null, { timeout: 8000 })
  await page.locator('.language-transition').waitFor({ state: 'detached', timeout: 8000 })
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.locator('.leader').count(), 0, 'Leader should run once per session')
  await context.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', deviceScaleFactor: 1 })
  const mobilePage = await mobile.newPage()
  mobilePage.on('pageerror', error => failures.push(`mobile: ${error.message}`))
  await mobilePage.goto(`${base}?lang=fa`, { waitUntil: 'networkidle' })
  await mobilePage.locator('.leader').waitFor({ state: 'detached', timeout: 12000 })
  assert.ok((await overflow(mobilePage)) <= 2, 'Mobile horizontal overflow')
  await mobilePage.screenshot({ path: join(tmpdir(), 'izmab-qa-mobile.png') })
  await mobile.close()
  assert.deepEqual(failures, [])
  process.stdout.write('motion: leader, cursor, lens blur, scenes, work cuts, flag transition, mobile; no page errors\n')
} finally {
  await browser.close()
}
