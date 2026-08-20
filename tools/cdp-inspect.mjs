/* Debug helper: drive headless Chrome over CDP (no deps, Node ≥22 WebSocket).
   Usage: node tools/cdp-inspect.mjs <url> <width> <height> <shot.png>
   Prints which elements overflow the viewport + what's topmost at center. */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'http://localhost:5199/';
const WIDTH = Number(process.argv[3] || 390);
const HEIGHT = Number(process.argv[4] || 844);
const SHOT = process.argv[5] || 'debug-cdp.png';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=9223',
  `--window-size=${WIDTH},${HEIGHT}`, '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9223/json/list');
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

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, mobile: WIDTH < 500 });
await send('Page.navigate', { url: URL });
await sleep(9000);

const expr = `(() => {
  const bad = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > window.innerWidth + 1) bad.push(el.tagName + '|' + String(el.className).slice(0,60) + '|w=' + Math.round(r.width));
  });
  const mid = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
  const chain = [];
  let el = mid;
  while (el && chain.length < 10) { chain.push(el.tagName + '|' + String(el.className).slice(0,50)); el = el.parentElement; }
  return JSON.stringify({ vw: innerWidth, sw: document.documentElement.scrollWidth, bad: bad.slice(0, 25), midChain: chain });
})()`;

const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
console.log('INSPECT:', (res.result && res.result.result && res.result.result.value) || JSON.stringify(res).slice(0, 500));

const shot = await send('Page.captureScreenshot', { format: 'png' });
if (shot.result && shot.result.data) writeFileSync(SHOT, Buffer.from(shot.result.data, 'base64'));

ws.close();
chrome.kill();
process.exit(0);
