/* About pillars counter test (desktop + mobile): scroll through the
   "What we believe" section and record the sticky counter value as each
   row crosses the 40% reading line.
   Usage: node tools/cdp-pillars-test.mjs <url> */
import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'http://localhost:5199/about';
const PORT = 9227;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  '--window-size=1440,900', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
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
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: URL });
await sleep(7000);

// For each pillar row: scroll so the row's top sits just above the 40% line
// (i.e. row becomes the active one), then read the counter.
for (let i = 0; i < 4; i++) {
  console.log(`ROW ${i + 1}:`, await evaluate(`(async () => {
    const rows = document.querySelectorAll('.ab-pillar-row');
    const row = rows[${i}];
    if (!row) return 'row not found';
    const target = window.scrollY + row.getBoundingClientRect().top - window.innerHeight * 0.4 + 30;
    window.scrollTo(0, target);
    await new Promise(r => setTimeout(r, 1200));
    const counter = document.querySelector('.ab-pillars-side span');
    return JSON.stringify({
      counter: counter ? counter.textContent.trim() : '?',
      rowTop: Math.round(row.getBoundingClientRect().top),
      line: Math.round(window.innerHeight * 0.4),
    });
  })()`));
}

console.log('ERRORS:', errors.length ? errors.slice(0, 4).join('\n') : 'none');

ws.close();
chrome.kill();
process.exit(0);
