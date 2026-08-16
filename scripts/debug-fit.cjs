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
  const info = await m.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) };
    };
    return {
      viewport: window.innerHeight,
      layer: r('.oh4-mobile-menu-layer'),
      redesign: r('.oh4-mobile-redesign-layer'),
      header: r('.oh4-mstage-header'),
      stage: r('.oh4-mstage'),
      meta: r('.oh4-mstage-meta'),
      progress: r('.oh4-mstage-progress'),
      hint: r('.oh4-mstage-hint'),
      pill: r('.oh4-mreel-full'),
      marquee: r('.oh4-mstage-marquee'),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
