/* ============================================================
   小六太乙 · 合盤曲線 Service Worker（PWA 離線快取）
   ------------------------------------------------------------
   ★ 每次發布新版請把 VERSION 加一，舊的核心快取會在啟用時自動清掉。
   快取分兩層：
   ① CORE（跟著版本走）：安裝時預先存好的頁面、程式、樣式、圖示。
   ② RUNTIME（不隨版本清除）：第一次用到才存——標楷體（每份 36.8 MB）與 CDN 函式庫。
   策略：
   - 網頁（導覽，含四個 iframe 子頁）：網路優先，離線時讀快取。
   - 同源程式／樣式／圖片：先回快取，背景更新（stale-while-revalidate）。
   - 字型（.ttf／.otf／.woff*）：只讀快取，第一次才下載，永不背景重抓。
   - CDN（jsdelivr、cdnjs）：先回快取，背景更新。
   ============================================================ */
const VERSION = 'hebing-v0.9.37-pwa1';
const CORE = VERSION + '-core';
const RUNTIME = 'hebing-runtime-v1';

const CORE_ASSETS = [
  './',
  'index.html',
  'bazi.html',
  'ziwei.html',
  'manifest.webmanifest',
  'research-ui.css',
  'solar-lunar.js',
  'moment.js',
  'wuxing-mainline.js',
  'vendor/jspdf.umd.min.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'qimen/index.html',
  'qimen/interface.css',
  'qimen/interface.js',
  'qimen/pdf-export.js',
  'qimen/qimen-engine.js',
  'qimen/ring-rules.js',
  'qimen/solar-lunar.js',
  'qimen/taiyi-wufu.js',
  'qimen/vendor/jspdf.umd.min.js',
  'taiyi/index.html',
  'taiyi/style.css',
  'taiyi/script.js',
  'taiyi/lib/solar-lunar.js',
  'taiyi/fonts/biaukai-plate-subset.js',
  'taiyi/assets/favicon.png',
  'taiyi/assets/xiaoliu-logo-final-transparent.png',
  'taiyi/taiyi-national/tn_index.html',
  'taiyi/taiyi-national/tn_script.js',
  'taiyi/taiyi-national/tn_style.css',
  'taiyi/taiyi-national/lib/solar-lunar.js',
  'taiyi/taiyi-national/assets/favicon.png',
  'taiyi/taiyi-national/assets/xiaoliu-logo-final-transparent.png'
];

const CDN_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
const FONT_RE = /\.(ttf|otf|woff2?)$/i;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CORE)
      .then(cache => cache.addAll(CORE_ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k.endsWith('-core') && k !== CORE)
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isOk(res) {
  return res && (res.ok || res.type === 'opaque');
}

async function putIn(cacheName, request, response) {
  if (!isOk(response)) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
}

// 網頁：網路優先，離線時讀快取；都沒有則回首頁殼
async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (isOk(res)) putIn(CORE, request, res.clone());
    return res;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate' && request.destination !== 'iframe') {
      const shell = await caches.match('index.html');
      if (shell) return shell;
    }
    throw err;
  }
}

// 程式／樣式／CDN：先回快取，背景更新
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const update = fetch(request)
    .then(res => { putIn(cacheName, request, res.clone()); return res; })
    .catch(() => null);
  if (cached) return cached;
  const res = await update;
  if (res) return res;
  return new Response('', { status: 504, statusText: 'offline' });
}

// 字型：只讀快取，第一次才下載，永不背景重抓
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  putIn(RUNTIME, request, res.clone());
  return res;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    if (request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
      event.respondWith(networkFirst(request));
    } else if (FONT_RE.test(url.pathname)) {
      event.respondWith(cacheFirst(request));
    } else {
      event.respondWith(staleWhileRevalidate(request, CORE));
    }
    return;
  }
  if (CDN_HOSTS.indexOf(url.hostname) !== -1) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME));
  }
});
