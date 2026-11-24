/* 太乙橋接 v1.5：行年點附行年宮（流年雙宮判法 2026-11-23）回歸測試
   1) taiyi-xingnian 每點附 age／palaceId／palaceShortName，且 year＝出生年＋age−1
   2) 女命行年起申逆行、男命起寅順行（與單機版 calculateXingNian 同路徑）
   3) 回歸件一：1966-08-17 戌時 女（范〈論命實務一〉）——
      十二宮（子→亥）＝財孫妻兄命父貌福疾奴官田；age 1→申＝疾、age 61（2026）→申＝疾
   4) 回歸件二：1976-10-14 亥時 女（Nakai）——age 51（2026 丙午）行年落午，
      與流年地支宮重合（流年雙宮判法原文例）
   5) 既有契約不變：兩條曲線、natal 快照仍在
*/
const { JSDOM, VirtualConsole } = require('jsdom');
const path = require('path');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function loadTaiyi(sink) {
  const file = path.join(__dirname, 'taiyi', 'index.html');
  const vc = new VirtualConsole();
  const dom = await JSDOM.fromFile(file, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(win) {
      win.alert = () => {};
      Object.defineProperty(win, 'parent', { value: { postMessage: m => sink.push(m) }, configurable: true });
    }
  });
  for (let i = 0; i < 100 && !sink.some(m => m.type === 'ready'); i++) await sleep(100);
  return dom;
}

async function runCase(dom, sink, input) {
  const before = sink.filter(m => m.type === 'ext-curve').length;
  const win = dom.window;
  win.dispatchEvent(new win.MessageEvent('message', { data: { xl: 'xl-merge-bridge', type: 'run', input } }));
  for (let i = 0; i < 50 && sink.filter(m => m.type === 'ext-curve').length <= before; i++) await sleep(100);
  return sink.filter(m => m.type === 'ext-curve')[before];
}

(async () => {
  console.log('== taiyi 行年宮欄位（橋接 v1.5）==');
  const sink = [];
  const dom = await loadTaiyi(sink);
  ok(sink.some(m => m.type === 'ready'), '橋接 ready');

  /* --- 回歸件一：1966-08-17 戌時 女 --- */
  const r1 = await runCase(dom, sink, { name: '案例2', gender: 'female', y: 1966, m: 8, d: 17, hour: 20, targetYear: 2026 });
  ok(!!(r1 && r1.ok), 'ext-curve ok' + (r1 && r1.error ? '（' + r1.error + '）' : ''));
  if (!r1 || !r1.ok) { console.log('\nFAILED: ' + (fails || 1)); process.exit(1); }
  ok(Array.isArray(r1.data.series) && r1.data.series.length === 2, '既有兩條曲線不變');
  ok(r1.data.natal && r1.data.natal.schema === 'xiaoliu.taiyi-natal/v1', 'natal 快照仍在');
  const xn1 = r1.data.series.find(s => s.id === 'taiyi-xingnian');
  ok(!!xn1 && xn1.points.length > 0, '行年序列存在');
  ok(xn1.points.every(p => typeof p.age === 'number' && typeof p.palaceId === 'string' && typeof p.palaceShortName === 'string'),
    '每點都有 age／palaceId／palaceShortName');
  ok(xn1.points.every(p => p.year === 1966 + p.age - 1), 'year＝出生年＋age−1（虛歲慣例）');
  const at1 = a => xn1.points.find(p => p.age === a);
  ok(at1(1) && at1(1).palaceId === 'pShen' && at1(1).palaceShortName === '疾', '女命 age 1 行年起申＝疾厄宮');
  ok(at1(2) && at1(2).palaceId === 'pWei', '女命逆行：age 2 在未');
  const y2026 = xn1.points.find(p => p.year === 2026);
  ok(y2026 && y2026.age === 61 && y2026.palaceId === 'pShen' && y2026.palaceShortName === '疾',
    '2026＝虛歲 61，行年宮申＝疾（61＝1+60，回到起宮）');
  /* 限例曲線的點不受影響（仍只有 year/value 必要欄位，不要求新欄位） */
  const xl1 = r1.data.series.find(s => s.id === 'taiyi-xianli');
  ok(!!xl1 && xl1.points.every(p => typeof p.year === 'number' && typeof p.value === 'number'), '限例曲線點格式不變');

  /* --- 回歸件二：1976-10-14 亥時 女（Nakai；流年雙宮判法原文例）--- */
  const r2 = await runCase(dom, sink, { name: '案例N', gender: 'female', y: 1976, m: 10, d: 14, hour: 22, targetYear: 2026 });
  ok(!!(r2 && r2.ok), '第二盤 ext-curve ok' + (r2 && r2.error ? '（' + r2.error + '）' : ''));
  if (r2 && r2.ok) {
    const xn2 = r2.data.series.find(s => s.id === 'taiyi-xingnian');
    const p51 = xn2 && xn2.points.find(p => p.age === 51);
    ok(p51 && p51.year === 2026 && p51.palaceId === 'pWu', '2026 丙午年虛歲 51，行年宮落午（與流年地支宮重合）');
  }

  /* --- 回歸件三：男命起寅順行（1967-03-25 亥時 男，范〈論命實務十一〉）--- */
  const r3 = await runCase(dom, sink, { name: '案例1', gender: 'male', y: 1967, m: 3, d: 25, hour: 22, targetYear: 2026 });
  ok(!!(r3 && r3.ok), '第三盤 ext-curve ok' + (r3 && r3.error ? '（' + r3.error + '）' : ''));
  if (r3 && r3.ok) {
    const xn3 = r3.data.series.find(s => s.id === 'taiyi-xingnian');
    const at3 = a => xn3 && xn3.points.find(p => p.age === a);
    ok(at3(1) && at3(1).palaceId === 'pYin', '男命 age 1 行年起寅');
    ok(at3(2) && at3(2).palaceId === 'pMao', '男命順行：age 2 在卯');
  }

  console.log(fails === 0 ? '\nALL PASS' : '\nFAILED: ' + fails);
  process.exit(fails === 0 ? 0 : 1);
})();
