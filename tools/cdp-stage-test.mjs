/* Stage test: on the mobile home page, drive the dish-stage scroller
   programmatically and verify index tracking, cup fade and snap geometry.
   Usage: node tools/cdp-stage-test.mjs <url> */
import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'http://localhost:5199/';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=9226',
  '--window-size=390,844', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9226/json/list');
      const page = (await res.json()).find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* retry */ }
    await sleep(250);
  }
  throw new Error('chrome CDP not reachable');
}

const ws = new WebSocket(await getWsUrl());
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 240));
};
const send = (method, params = {}) => new Promise((resolve) => {
  const mid = ++id;
  pending.set(mid, resolve);
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.result && res.result.exceptionDetails) return 'JS ERROR: ' + JSON.stringify(res.result.exceptionDetails).slice(0, 300);
  return res.result && res.result.result ? res.result.result.value : undefined;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: URL });
await sleep(9000);

// Scroll into the pin range and let the page's own auto-snap carry it to
// 95% (the stage's resting state) — same as a real user's scroll.
await evaluate('window.scrollTo(0, window.innerHeight * 1.2)');
await sleep(4500); // smoothScrollTo runs ~2.4s + settle

// Confirm the stage is actually on screen before touching it
console.log('STAGE VIS:', await evaluate(`(() => {
  const r = document.querySelector('.oh4-mstage-scroll').getBoundingClientRect();
  return JSON.stringify({ y: Math.round(r.y), h: Math.round(r.height), vh: window.innerHeight, scrollY: Math.round(window.scrollY) });
})()`));

console.log('GEOMETRY:', await evaluate(`(() => {
  const sc = document.querySelector('.oh4-mstage-scroll');
  const track = document.querySelector('.oh4-mstage-track');
  const slides = document.querySelectorAll('.oh4-mstage-slide');
  if (!sc || !track || !slides.length) return 'STAGE NOT FOUND';
  const stage = document.querySelector('.oh4-mstage');
  const step = stage.clientWidth * 0.76;
  const cs = getComputedStyle(sc);
  return JSON.stringify({
    slideCount: slides.length,
    stageW: stage.clientWidth,
    step: Math.round(step),
    scrollWidth: sc.scrollWidth,
    expectedScrollWidth: Math.round(slides.length * step + stage.clientWidth * 0.24),
    snapType: cs.scrollSnapType,
    overflowX: cs.overflowX,
    slideSnapAlign: getComputedStyle(slides[1]).scrollSnapAlign,
  });
})()`));

// Simulate a REAL touch swipe on the stage (finger drag left).
// With a broken touch-action this leaves scrollLeft at 0; fixed, the
// browser natively scrolls the scroller and snap settles it.
const swipe = async (fromX, toX, y, steps = 12) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fromX, y, id: 1 }] });
  for (let i = 1; i <= steps; i++) {
    const x = fromX + (toX - fromX) * (i / steps);
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] });
    await sleep(16);
  }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};

// Find the stage's on-screen rect, then swipe across it
const rect = await evaluate(`(() => {
  const r = document.querySelector('.oh4-mstage-scroll').getBoundingClientRect();
  return JSON.stringify({ x: r.x, y: r.y, w: r.width, h: r.height });
})()`);
const R = JSON.parse(rect);
const midY = R.y + R.h / 2;

const before = await evaluate('document.querySelector(".oh4-mstage-scroll").scrollLeft');

// ── Diagnostics: what element is under the finger, what's its touch-action,
//    and do touch events reach the scroller (or get preventDefaulted)?
console.log('DIAG:', await evaluate(`(() => {
  const sc = document.querySelector('.oh4-mstage-scroll');
  const r = sc.getBoundingClientRect();
  const el = document.elementFromPoint(r.x + r.width * 0.8, r.y + r.height / 2);
  window.__tlog = [];
  sc.addEventListener('touchstart', e => window.__tlog.push('start x=' + Math.round(e.touches[0].clientX)), { passive: true });
  sc.addEventListener('touchmove', e => window.__tlog.push('move x=' + Math.round(e.touches[0].clientX) + ' defPrev=' + e.defaultPrevented), { passive: true });
  sc.addEventListener('scroll', () => window.__tlog.push('SCROLL ' + Math.round(sc.scrollLeft)), { passive: true });
  const chain = [];
  let n = el;
  while (n && chain.length < 8) { chain.push(n.className && n.className.baseVal === undefined ? String(n.className).split(' ')[0] : n.tagName); n = n.parentElement; }
  return JSON.stringify({
    atPoint: chain,
    scTouchAction: getComputedStyle(sc).touchAction,
    elTouchAction: el ? getComputedStyle(el).touchAction : '?',
    scRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    pageScrollY: Math.round(window.scrollY),
  });
})()`));

await swipe(R.x + R.w * 0.8, R.x + R.w * 0.15, midY);
await sleep(1400); // momentum + snap settle
const afterSwipe1 = await evaluate(`JSON.stringify({
  scrollLeft: Math.round(document.querySelector('.oh4-mstage-scroll').scrollLeft),
  name: (document.querySelector('.oh4-mstage-name')||{}).textContent || '?',
})`);
console.log('TOUCH SWIPE 1 (left): before=', before, 'after=', afterSwipe1);
console.log('TOUCH LOG:', await evaluate('JSON.stringify(window.__tlog ? window.__tlog.slice(0, 12) : "none")'));

// Swipe back right — should return toward coffee (index 0)
await swipe(R.x + R.w * 0.15, R.x + R.w * 0.8, midY);
await sleep(1400);
console.log('TOUCH SWIPE 2 (right):', await evaluate(`JSON.stringify({
  scrollLeft: Math.round(document.querySelector('.oh4-mstage-scroll').scrollLeft),
  name: (document.querySelector('.oh4-mstage-name')||{}).textContent || '?',
})`));

console.log('ERRORS:', errors.length ? errors.slice(0, 4).join('\n') : 'none');

ws.close();
chrome.kill();
process.exit(0);
