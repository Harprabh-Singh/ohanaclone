/* Verify: load a page headless, capture console/page errors, optionally
   click a button by its text content, then screenshot.
   Usage: node tools/cdp-verify.mjs <url> <w> <h> <shot.png> [clickText] */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'http://localhost:5199/';
const WIDTH = Number(process.argv[3] || 390);
const HEIGHT = Number(process.argv[4] || 844);
const SHOT = process.argv[5] || 'debug-verify.png';
const CLICK_TEXT = process.argv[6] || '';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=9225',
  `--window-size=${WIDTH},${HEIGHT}`, '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9225/json/list');
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === 'page');
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
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push('EXC: ' + JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push('CONSOLE: ' + msg.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 300));
  }
};
const send = (method, params = {}) => new Promise((resolve) => {
  const mid = ++id;
  pending.set(mid, resolve);
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return res.result && res.result.result ? res.result.result.value : undefined;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, mobile: WIDTH < 500 });
await send('Page.navigate', { url: URL });
await sleep(9000);

if (CLICK_TEXT) {
  const clicked = await evaluate(`(() => {
    const btns = [...document.querySelectorAll('button, a')];
    const b = btns.find((x) => (x.textContent || '').trim().toLowerCase().includes(${JSON.stringify(CLICK_TEXT.toLowerCase())}));
    if (b) { b.click(); return 'clicked: ' + b.textContent.trim().slice(0, 40); }
    return 'NOT FOUND: ' + ${JSON.stringify(CLICK_TEXT)};
  })()`);
  console.log('CLICK:', clicked);
  await sleep(2500);
}

console.log('ERRORS:', errors.length ? errors.slice(0, 6).join('\n') : 'none');

const shot = await send('Page.captureScreenshot', { format: 'png' });
if (shot.result && shot.result.data) writeFileSync(SHOT, Buffer.from(shot.result.data, 'base64'));

ws.close();
chrome.kill();
process.exit(0);
