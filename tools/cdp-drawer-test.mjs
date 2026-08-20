/* Drawer test: open /admin at mobile width, click the hamburger, verify the
   sidebar slides in, then close via backdrop. No deps (Node >=22 WebSocket). */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'http://localhost:5199/dev-admin-bypass.html';
const WIDTH = Number(process.argv[3] || 390);
const HEIGHT = Number(process.argv[4] || 844);
const SHOT = process.argv[5] || 'debug-drawer.png';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=9224',
  `--window-size=${WIDTH},${HEIGHT}`, '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9224/json/list');
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
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
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
await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: URL });
await sleep(9000);

// 1. Closed state: sidebar should be off-screen
const before = await evaluate(`(() => {
  const s = document.querySelector('aside.oh-sidebar');
  if (!s) return 'NO SIDEBAR (url=' + location.pathname + ')';
  const r = s.getBoundingClientRect();
  return JSON.stringify({ left: Math.round(r.left), cls: s.className });
})()`);
console.log('BEFORE CLICK:', before);

// 2. Click the hamburger
await evaluate(`document.querySelector('.oh-burger') && document.querySelector('.oh-burger').click()`);
await sleep(900);
const after = await evaluate(`(() => {
  const s = document.querySelector('aside.oh-sidebar');
  if (!s) return 'NO SIDEBAR';
  const r = s.getBoundingClientRect();
  const closeBtn = getComputedStyle(s.querySelector('.oh-sideclose')).display;
  return JSON.stringify({ left: Math.round(r.left), cls: s.className, closeBtn });
})()`);
console.log('AFTER CLICK:', after);

const shot = await send('Page.captureScreenshot', { format: 'png' });
if (shot.result && shot.result.data) writeFileSync(SHOT, Buffer.from(shot.result.data, 'base64'));

// 3. Click backdrop to close
await evaluate(`document.querySelector('.oh-backdrop') && document.querySelector('.oh-backdrop').click()`);
await sleep(900);
const closed = await evaluate(`(() => {
  const s = document.querySelector('aside.oh-sidebar');
  const r = s.getBoundingClientRect();
  return JSON.stringify({ left: Math.round(r.left), cls: s.className });
})()`);
console.log('AFTER BACKDROP:', closed);

ws.close();
chrome.kill();
process.exit(0);
