// Smoke journeys against the static export. Usage: npm start (serves ./out with clean URLs on :4173) && node tests/e2e/journeys.mjs
import { chromium } from 'playwright';
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => { if (!/index.txt|icon.svg/.test(r.url())) errors.push(`[requestfailed] ${r.url()}`); });
const step = async (name, fn) => { try { await fn(); console.log('✔', name); } catch (e) { console.log('✘', name, '-', e.message.split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); errors.push(`[step] ${name}: ${e.message.split('\n').slice(0, 4).join(' | ')}`); } };
const go = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); };
const switchTo = async (role, urlGlob) => { await go('/'); const lo = page.locator('button[aria-label="خروج"]').first(); if (await lo.count()) { await lo.click(); await page.waitForURL('**/login'); await page.waitForTimeout(300); } await go('/login'); await page.getByRole('button', { name: role }).first().click(); await page.waitForURL(urlGlob); };

await step('home renders', async () => { await go('/'); await page.getByRole('heading', { level: 1 }).first().waitFor(); });
for (const p of ['/about', '/classes', '/coaches', '/coaches/sara-mohammadi', '/pricing', '/blog', '/blog/core-not-abs', '/faq', '/contact']) await step(`page ${p}`, async () => { await go(p); await page.locator('h1').first().waitFor(); });
await step('login as student via demo card', async () => { await go('/login'); await page.getByRole('button', { name: /هنرجو/ }).first().click(); await page.waitForURL('**/portal'); await page.getByText('جلسات پیش رو').waitFor(); });
await step('portal shows membership and bookings', async () => { await page.getByText('عضویت ماهانه ۱۲ جلسه').first().waitFor(); const n = await page.locator('text=جابه‌جایی').count(); if (n < 1) throw new Error('no reschedulable booking'); });
await step('reschedule a booking', async () => {
  await page.getByRole('button', { name: /جابه‌جایی/ }).first().click();
  await page.getByRole('dialog').waitFor();
  const chip = page.getByRole('dialog').locator('button[aria-pressed]:not([disabled])').filter({ hasText: /صندلی/ }).first();
  await chip.click();
  await page.getByRole('button', { name: 'تأیید جابه‌جایی' }).click();
  await page.getByText('جابه‌جایی انجام شد').first().waitFor({ timeout: 5000 });
});
await step('cancel a booking', async () => { await page.getByRole('button', { name: /^لغو$/ }).first().click(); await page.getByRole('button', { name: 'بله، لغو شود' }).click(); await page.getByText('جلسه لغو شد').first().waitFor({ timeout: 5000 }); });
await step('locked booking shows cutoff copy', async () => { await page.getByText(/مهلت تغییر این جلسه/).first().waitFor(); });
await step('book new session from portal', async () => { await page.getByRole('button', { name: /رزرو جلسه جدید/ }).click(); const chip = page.getByRole('dialog').locator('button[aria-pressed]:not([disabled])').filter({ hasText: /صندلی/ }).first(); await chip.click(); await page.getByRole('button', { name: 'تأیید رزرو' }).click(); await page.getByText('رزرو شما تأیید شد').first().waitFor({ timeout: 5000 }); });
await step('funnel: assessment (existing) → schedule', async () => { await go('/join/monthly-8/assessment'); await page.getByRole('button', { name: /ادامه با همین ارزیابی/ }).click(); await page.waitForURL('**/schedule'); });
await step('funnel: pick slot → checkout', async () => { await page.locator('button[aria-pressed]:not([disabled])').filter({ hasText: /صندلی/ }).first().click(); await page.getByRole('button', { name: /ادامه به پرداخت/ }).click(); await page.waitForURL('**/checkout'); });
await step('funnel: IPG success', async () => { await page.getByRole('button', { name: /انتقال به درگاه/ }).click(); await page.waitForURL('**/pay/ipg**'); await page.getByText('درگاه پرداخت زرین‌پال').waitFor(); await page.getByRole('button', { name: 'پرداخت', exact: true }).click(); await page.waitForURL('**/done', { timeout: 8000 }); await page.getByText('عضویت شما فعال شد').waitFor(); });
await step('funnel: card-to-card with receipt upload', async () => {
  await go('/join/drop-in/assessment'); await page.getByRole('button', { name: /ادامه با همین ارزیابی/ }).click(); await page.waitForURL('**/schedule');
  await page.locator('button[aria-pressed]:not([disabled])').filter({ hasText: /صندلی/ }).first().click(); await page.getByRole('button', { name: /ادامه به پرداخت/ }).click();
  await page.getByRole('button', { name: /کارت به کارت/ }).first().click(); await page.getByRole('button', { name: /ادامه با کارت به کارت/ }).click(); await page.waitForURL('**/pay/card**');
  await page.getByPlaceholder(/734120/).fill('991234');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQz0AEYBxVSF8FAP5FDvcfRYWgAAAAAElFTkSuQmCC', 'base64');
  await page.locator('input[type=file]').setInputFiles({ name: 'receipt.png', mimeType: 'image/png', buffer: png });
  await page.getByText(/receipt.png/).waitFor();
  await page.getByRole('button', { name: /ثبت رسید/ }).click(); await page.waitForURL('**/done', { timeout: 8000 }); await page.getByText('رسید شما در صف بررسی است').waitFor();
});
await step('intake form fresh (new answers)', async () => {
  await go('/join/monthly-12/assessment'); await page.getByRole('button', { name: /به‌روزرسانی پاسخ‌ها/ }).click();
  await page.getByRole('button', { name: 'متوسط' }).click(); await page.getByRole('button', { name: 'ادامه' }).click();
  await page.getByRole('button', { name: /اصلاح وضعیت بدنی/ }).click(); await page.getByRole('button', { name: 'ادامه' }).click();
  await page.getByRole('button', { name: 'ادامه' }).click(); await page.getByRole('button', { name: 'ادامه' }).click(); await page.getByRole('button', { name: 'ادامه' }).click();
  await page.locator('input[type=checkbox]').check(); await page.getByRole('button', { name: /ثبت و ادامه/ }).click(); await page.waitForURL('**/schedule');
});
await step('switch to admin and approve receipt', async () => {
  await switchTo(/مدیر ارشد/, '**/executive');
  await go('/executive/queue'); const before = await page.getByRole('button', { name: /^تأیید$/ }).count(); if (before < 1) throw new Error('queue empty');
  await page.getByRole('button', { name: /^تأیید$/ }).first().click(); await page.getByText('پیامک ارسال شد').first().waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: /^رد$/ }).first().click(); await page.getByRole('button', { name: 'ثبت رد' }).click(); await page.getByText('پیامک ارسال شد').first().waitFor({ timeout: 5000 });
});
for (const p of ['/executive', '/executive/ledger', '/executive/users', '/executive/health', '/executive/settings', '/executive/audit']) await step(`admin page ${p}`, async () => { await go(p); await page.locator('h1').first().waitFor(); await page.locator('table, [role=img], .card').first().waitFor(); });
await step('health record review', async () => { await go('/executive/health'); await page.getByRole('button', { name: /مشاهده/ }).first().click(); await page.getByRole('button', { name: 'ثبت بررسی' }).click(); });
await step('fast-forward triggers reminder', async () => { await go('/executive'); await page.getByRole('button', { name: /۱ روز/ }).click(); await page.getByText('ساعت نمایشی جلو رفت').waitFor(); });
await step('student blocked from executive', async () => { await switchTo(/هنرجو/, '**/portal'); await go('/executive'); await page.getByText('دسترسی غیرمجاز').waitFor(); });
await step('coach portal', async () => { await switchTo(/^مربی/, '**/coach'); await page.getByText('لیست حاضرین').waitFor(); });
await step('numerals toggle', async () => { await go('/pricing'); await page.getByRole('button', { name: 'تغییر نمایش اعداد' }).click(); await page.getByText('18,000,000').first().waitFor(); });
await step('mobile viewport home + portal', async () => { await page.setViewportSize({ width: 390, height: 844 }); for (const p of ['/', '/pricing', '/coaches', '/blog', '/about']) { await go(p); const w = await page.evaluate(() => document.documentElement.scrollWidth); if (w > 390) throw new Error('horizontal overflow on ' + p + ': ' + w); } await go('/login'); await page.getByRole('button', { name: /هنرجو/ }).first().click().catch(() => {}); await go('/portal'); const w2 = await page.evaluate(() => document.documentElement.scrollWidth); if (w2 > 390) throw new Error('portal overflow ' + w2); await page.screenshot({ path: 'tests/e2e/mobile-portal.png', fullPage: false }); });
await page.setViewportSize({ width: 1280, height: 900 }); await go('/'); await page.screenshot({ path: 'tests/e2e/home.png' });
await go('/portal'); await page.screenshot({ path: 'tests/e2e/portal.png' });
console.log('\nERRORS:', errors.length); for (const e of [...new Set(errors)]) console.log('  ', e);
await browser.close();
process.exit(errors.length ? 1 : 0);
