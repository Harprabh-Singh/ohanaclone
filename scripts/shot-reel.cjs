const { chromium } = require('playwright-core');
const path = require('path');

const exe = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');

(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true });

  // Mobile — hero pin range is +=160% on <=700px
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await m.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
  await m.waitForTimeout(2500);
  await m.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 1.6)));
  await m.waitForTimeout(3500);
  await m.screenshot({ path: 'scripts/reel-mobile.png' });

  // Simulate a left swipe on the dish stage -> should page to BURGERS
  await m.evaluate(() => {
    const stage = document.querySelector('.oh4-mstage');
    const r = stage.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const opts = (x) => ({ bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true });
    stage.dispatchEvent(new PointerEvent('pointerdown', opts(r.left + r.width * 0.8)));
    stage.dispatchEvent(new PointerEvent('pointermove', opts(r.left + r.width * 0.2)));
    stage.dispatchEvent(new PointerEvent('pointerup', opts(r.left + r.width * 0.2)));
  });
  await m.waitForTimeout(1200);
  await m.screenshot({ path: 'scripts/reel-mobile-swiped.png' });

  await browser.close();
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
