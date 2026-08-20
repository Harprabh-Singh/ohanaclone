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
await send('Page.navigate', { url: URL });
await sleep(9000);

// Scroll the page so the pinned menu (and the stage) is fully open
await evaluate('window.scrollTo(0, document.documentElement.scrollHeight * 0.9)');
await sleep(2500);

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

// Simulate a swipe to slide index 2 (instant), then read state
console.log('SCROLL TO 2:', await evaluate(`(async () => {
  const sc = document.querySelector('.oh4-mstage-scroll');
  const stage = document.querySelector('.oh4-mstage');
  const step = stage.clientWidth * 0.76;
  sc.scrollTo({ left: 2 * step, behavior: 'auto' });
  await new Promise(r => setTimeout(r, 900));
  const ledger = document.querySelector('.oh4-mstage-ledger');
  const name = document.querySelector('.oh4-mstage-name');
  const cup = document.querySelector('[class*="mobilecup"], .oh4-mobile-cup, img');
  return JSON.stringify({
    scrollLeft: Math.round(sc.scrollLeft),
    snappedTo2: Math.abs(sc.scrollLeft - 2 * step) < 4,
    ledger: ledger ? ledger.textContent.trim() : '?',
    name: name ? name.textContent.trim() : '?',
  });
})()`));

// Back to 0 — coffee cup should be fully visible again
console.log('BACK TO 0:', await evaluate(`(async () => {
  const sc = document.querySelector('.oh4-mstage-scroll');
  sc.scrollTo({ left: 0, behavior: 'auto' });
  await new Promise(r => setTimeout(r, 900));
  const ledger = document.querySelector('.oh4-mstage-ledger');
  return JSON.stringify({
    scrollLeft: Math.round(sc.scrollLeft),
    ledger: ledger ? ledger.textContent.trim() : '?',
  });
})()`));

console.log('ERRORS:', errors.length ? errors.slice(0, 4).join('\n') : 'none');

ws.close();
chrome.kill();
process.exit(0);
