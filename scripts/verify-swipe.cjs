const { chromium } = require('playwright-core');
const path = require('path');
const exe = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true });
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await m.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
  await m.waitForTimeout(2000);
  await m.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 1.6)));
  await m.waitForTimeout(3000);

  // swipe gesture including a pointercancel mid-way (worst case)
  await m.evaluate(() => {
    const stage = document.querySelector('.oh4-mstage');
    const r = stage.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const opts = (x) => ({ bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true });
    stage.dispatchEvent(new PointerEvent('pointerdown', opts(r.left + r.width * 0.8)));
    stage.dispatchEvent(new PointerEvent('pointermove', opts(r.left + r.width * 0.5)));
    stage.dispatchEvent(new PointerEvent('pointermove', opts(r.left + r.width * 0.2)));
    stage.dispatchEvent(new PointerEvent('pointerup', opts(r.left + r.width * 0.2)));
    // browser then fires a synthetic click on the slide link
    const link = stage.querySelectorAll('.oh4-mstage-slide')[1];
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await m.waitForTimeout(1200);
  console.log('URL after swipe+click:', m.url());

  // and a genuine tap SHOULD navigate
  await m.evaluate(() => {
    const stage = document.querySelector('.oh4-mstage');
    const r = stage.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const opts = (x) => ({ bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true });
    stage.dispatchEvent(new PointerEvent('pointerdown', opts(r.left + r.width * 0.5)));
    stage.dispatchEvent(new PointerEvent('pointerup', opts(r.left + r.width * 0.5)));
  });
  await m.waitForTimeout(200);
  await m.evaluate(() => {
    document.querySelectorAll('.oh4-mstage-slide')[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await m.waitForTimeout(1200);
  console.log('URL after tap:', m.url());
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
