/* PWA 測試：manifest、index.html 標記、Service Worker 快取行為（Node 模擬 SW 環境）
   執行：node test-pwa.js
   1) manifest 必填欄位齊全、圖示檔存在且尺寸相符
   2) index.html 有 manifest 連結、Apple 圖示、註冊程式碼
   3) 安裝：CORE_ASSETS 每一個檔案都存在（任何一個 404 會讓整個 PWA 安裝失敗）
   4) 離線：網頁與子頁從快取讀出；未快取的導覽回首頁殼
   5) 字型：第一次下載後存入 RUNTIME，之後不再連網
   6) CDN：函式庫存入 RUNTIME，離線可用
   7) 升版：舊 CORE 快取被清除，RUNTIME（字型）保留
*/
const fs = require('fs'), path = require('path'), vm = require('vm');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const ROOT = __dirname, ORIGIN = 'https://nakaiwen.github.io', BASE = ORIGIN + '/Hebing-tool-/';

function pngSize(file) { const b = fs.readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }

console.log('== manifest ==');
const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf-8'));
ok(['name', 'short_name', 'start_url', 'scope', 'display', 'icons', 'theme_color', 'background_color'].every(k => mf[k]), '必填欄位齊全');
ok(mf.display === 'standalone' && mf.start_url === './' && mf.scope === './', '獨立視窗模式，起始與範圍皆為相對路徑（適用 GitHub Pages 子路徑）');
ok(mf.icons.every(i => { const f = path.join(ROOT, i.src); if (!fs.existsSync(f)) return false; const [w, h] = pngSize(f); return i.sizes === w + 'x' + h; }), '圖示檔皆存在，宣告尺寸與實際尺寸相符');
ok(mf.icons.some(i => i.sizes === '192x192') && mf.icons.some(i => i.sizes === '512x512' && i.purpose === 'any') && mf.icons.some(i => i.purpose === 'maskable'), '具備 192、512 與可遮罩圖示');

console.log('== index.html ==');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
ok(/<link rel="manifest" href="manifest.webmanifest">/.test(idx), '有 manifest 連結');
ok(/<link rel="apple-touch-icon" href="icons\/apple-touch-icon.png">/.test(idx) && fs.existsSync(path.join(ROOT, 'icons/apple-touch-icon.png')), '有 Apple 主畫面圖示');
ok(/navigator\.serviceWorker\.register\('\.\/sw\.js'\)/.test(idx) && /location\.protocol !== 'file:'/.test(idx), '有 SW 註冊，且本機 file:// 開啟時略過');

// ---------- 模擬 SW 環境 ----------
function makeEnv({ online = true } = {}) {
  const store = new Map(); // cacheName -> Map(url -> Response)
  const net = { online, hits: [] };
  class Resp {
    constructor(body, init = {}) { this.body = body; this.status = init.status || 200; this.ok = this.status >= 200 && this.status < 300; this.type = init.type || 'basic'; this.statusText = init.statusText || ''; }
    clone() { return new Resp(this.body, { status: this.status, type: this.type }); }
  }
  class Req {
    constructor(u, init = {}) {
      if (u instanceof Req) { Object.assign(this, u); return; }
      this.url = new URL(u, BASE).href; this.method = init.method || 'GET';
      this.mode = init.mode || 'cors'; this.destination = init.destination || '';
    }
  }
  const key = r => (typeof r === 'string' ? new URL(r, BASE).href : r.url);
  const cacheObj = name => {
    if (!store.has(name)) store.set(name, new Map());
    const m = store.get(name);
    return {
      async put(r, res) { m.set(key(r), res); },
      async match(r, o = {}) { const k = key(r); if (m.has(k)) return m.get(k).clone(); if (o.ignoreSearch) { const b = k.split('?')[0]; for (const [kk, v] of m) if (kk.split('?')[0] === b) return v.clone(); } return undefined; },
      async addAll(list) { for (const r of list) { const res = await fetchImpl(r); if (!res.ok) throw new Error('addAll 失敗：' + key(r) + ' ' + res.status); m.set(key(r), res); } },
    };
  };
  const caches = {
    async open(n) { return cacheObj(n); },
    async keys() { return [...store.keys()]; },
    async delete(n) { return store.delete(n); },
    async match(r, o) { for (const n of store.keys()) { const hit = await cacheObj(n).match(r, o); if (hit) return hit; } return undefined; },
  };
  async function fetchImpl(r) {
    const u = new URL(typeof r === 'string' ? r : r.url, BASE);
    net.hits.push(u.href);
    if (!net.online) throw new TypeError('Failed to fetch (offline)');
    if (u.origin !== ORIGIN) return new Resp('cdn:' + u.href, { status: 200, type: 'opaque' });
    let p = decodeURIComponent(u.pathname.replace('/Hebing-tool-/', ''));
    if (p === '' || p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    return fs.existsSync(f) ? new Resp(f) : new Resp('', { status: 404 });
  }
  const listeners = {};
  const self = { location: new URL(BASE + 'sw.js'), addEventListener: (t, fn) => { listeners[t] = fn; }, skipWaiting: async () => {}, clients: { claim: async () => {} } };
  const ctx = { self, caches, fetch: fetchImpl, Request: Req, Response: Resp, URL, console, Promise };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf-8'), ctx);
  async function fire(type, extra = {}) {
    let p = null, resp = null;
    const ev = Object.assign({ waitUntil: x => { p = x; }, respondWith: x => { resp = x; } }, extra);
    listeners[type](ev);
    if (p) await p;
    return resp ? await resp : null;
  }
  return { ctx, store, net, fire, Req, run: src => vm.runInContext(src, ctx) };
}

(async () => {
  console.log('== 安裝 ==');
  const env = makeEnv();
  const core = env.run('CORE_ASSETS');
  const missing = core.filter(u => { let p = u === './' ? 'index.html' : u; return !fs.existsSync(path.join(ROOT, p)); });
  ok(missing.length === 0, 'CORE_ASSETS 共 ' + core.length + ' 項，全部存在' + (missing.length ? '（缺：' + missing.join('、') + '）' : ''));
  const bytes = core.reduce((n, u) => { const f = path.join(ROOT, u === './' ? 'index.html' : u); return n + (fs.existsSync(f) ? fs.statSync(f).size : 0); }, 0);
  ok(bytes < 8 * 1024 * 1024, '預先快取總量 ' + (bytes / 1048576).toFixed(1) + ' MB（上限 8 MB，不含標楷體）');
  ok(!core.some(u => /\.(ttf|otf|woff2?)$/i.test(u)), '預先快取不含字型檔（標楷體改為第一次用到才存）');
  let installErr = null;
  try { await env.fire('install'); } catch (e) { installErr = e; }
  ok(!installErr, '安裝成功' + (installErr ? '：' + installErr.message : ''));
  await env.fire('activate');
  const coreName = env.run('CORE'), runtimeName = env.run('RUNTIME');
  ok(env.store.get(coreName) && env.store.get(coreName).size === core.length, 'CORE 快取寫入 ' + core.length + ' 項');

  console.log('== 離線 ==');
  env.net.online = false;
  const nav = (u, dest = 'document') => env.fire('fetch', { request: new env.Req(BASE + u, { mode: 'navigate', destination: dest }) });
  ok(!!(await nav('')), '離線開首頁：從快取讀出');
  const kids = ['bazi.html', 'ziwei.html', 'taiyi/index.html', 'qimen/index.html'];
  const kidRes = await Promise.all(kids.map(k => nav(k, 'iframe')));
  ok(kidRes.every(Boolean), '離線開四個 iframe 子頁（八字、紫微、太乙、奇門）：全部從快取讀出');
  ok(!!(await nav('taiyi/taiyi-national/tn_index.html')), '離線開太乙國運頁：從快取讀出');
  const shell = await nav('some/unknown/page.html');
  ok(shell && /index\.html$/.test(shell.body), '離線開未快取的頁面：回首頁殼');
  const js = await env.fire('fetch', { request: new env.Req(BASE + 'wuxing-mainline.js') });
  ok(js && js.ok, '離線讀程式檔：從快取讀出');

  console.log('== 字型（標楷體 36.8 MB）==');
  env.net.online = true; env.net.hits.length = 0;
  const font = 'taiyi/fonts/biaukai.ttf';
  const f1 = await env.fire('fetch', { request: new env.Req(BASE + font) });
  await new Promise(r => setTimeout(r, 0));
  ok(f1 && f1.ok && env.net.hits.length === 1, '第一次：從網路下載');
  ok(env.store.get(runtimeName) && env.store.get(runtimeName).has(BASE + font), '下載後存入 RUNTIME 快取');
  env.net.hits.length = 0;
  const f2 = await env.fire('fetch', { request: new env.Req(BASE + font) });
  await new Promise(r => setTimeout(r, 0));
  ok(f2 && f2.ok && env.net.hits.length === 0, '第二次：直接讀快取，完全不連網（不背景重抓）');

  console.log('== CDN ==');
  const cdn = 'https://cdn.jsdelivr.net/npm/chart.js';
  await env.fire('fetch', { request: new env.Req(cdn) });
  await new Promise(r => setTimeout(r, 0));
  env.net.online = false;
  const c2 = await env.fire('fetch', { request: new env.Req(cdn) });
  ok(c2 && c2.type === 'opaque', 'chart.js 第一次存入快取，離線可用');

  console.log('== 升版 ==');
  env.net.online = true;
  const oldCore = coreName;
  env.store.set('hebing-v0.0.0-old-core', new Map([['x', null]]));
  await env.fire('activate');
  const keys = [...env.store.keys()];
  ok(!keys.includes('hebing-v0.0.0-old-core') && keys.includes(oldCore), '舊版 CORE 快取被清除，現行 CORE 保留');
  ok(keys.includes(runtimeName), 'RUNTIME 快取（標楷體）跨版本保留，升版不必重下 36.8 MB');

  console.log(fails ? '\n' + fails + ' FAIL' : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('  ✗ 測試中斷：' + e.message + '\n\n' + (fails + 1) + ' FAIL'); process.exit(1); });
