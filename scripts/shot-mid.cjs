const { chromium } = require('playwright-core');
const path = require('path');
const exe = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
(async () => {
  const browser = await chromium.launch({ executablePath: exe, headless: true });
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await m.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
  await m.waitForTimeout(2500);
  // scroll partway; auto-snap will animate to 95% over ~2.4s — capture mid-flight
  await m.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 1.6 * 0.5)));
  await m.waitForTimeout(900);
  await m.screenshot({ path: 'scripts/reel-mobile-mid.png' });
  await browser.close();
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
