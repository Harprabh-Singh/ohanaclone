/* Route-change scroll reset test: open home, scroll deep, click the About
   nav link, then assert the new page starts at scrollY 0.
   Usage: node tools/cdp-scrolltop-test.mjs <url> */
import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'http://localhost:5199/';
const PORT = 9228;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  '--window-size=390,844', '--hide-scrollbars', 'about:blank',
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
  if (res.result && res.result.exceptionDetails) return 'JS ERROR: ' + JSON.stringify(res.result.exceptionDetails).slice(0, 300);
  return res.result && res.result.result ? res.result.result.value : undefined;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: URL });
await sleep(8000);

console.log('HOME SCROLLED:', await evaluate(`(async () => {
  window.scrollTo(0, 4000);
  await new Promise(r => setTimeout(r, 600));
  return window.scrollY;
})()`));

// Click the About link in the navbar
console.log('CLICK ABOUT:', await evaluate(`(() => {
  const link = [...document.querySelectorAll('a')].find(a => a.getAttribute('href') === '/about');
  if (!link) return 'link not found';
  link.click();
  return 'clicked';
})()`));
await sleep(2500);

console.log('AFTER NAV:', await evaluate(`JSON.stringify({
  path: location.pathname,
  scrollY: Math.round(window.scrollY),
})`));

// And one more hop: About → Contact
console.log('CLICK CONTACT:', await evaluate(`(() => {
  const link = [...document.querySelectorAll('a')].find(a => a.getAttribute('href') === '/contact');
  if (!link) return 'link not found';
  link.click();
  return 'clicked';
})()`));
await sleep(2500);
console.log('AFTER NAV 2:', await evaluate(`JSON.stringify({
  path: location.pathname,
  scrollY: Math.round(window.scrollY),
})`));

ws.close();
chrome.kill();
process.exit(0);
