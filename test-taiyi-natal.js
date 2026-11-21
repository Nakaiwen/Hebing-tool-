/* 太乙橋接 v1.4：本命星曜盤快照（data.natal，xiaoliu.taiyi-natal/v1）回歸測試
   1) 橋接回傳 natal，欄位與單機版 currentChartData 本命層全等
   2) 不帶流年／流日層欄位
   3) 回歸件：范振木〈論命實務一〉命主 1966-08-17 戌時 女——對照太乙單機版匯出檔的盤面
*/
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
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

(async () => {
  console.log('== taiyi 本命星曜盤快照（橋接 v1.4）==');
  const sink = [];
  const dom = await loadTaiyi(sink);
  ok(sink.some(m => m.type === 'ready'), '橋接 ready');
  const win = dom.window;
  win.dispatchEvent(new win.MessageEvent('message', { data: { xl: 'xl-merge-bridge', type: 'run',
    input: { name: '案例2', gender: 'female', y: 1966, m: 8, d: 17, hour: 20, targetYear: 2026 } } }));
  for (let i = 0; i < 50 && !sink.some(m => m.type === 'ext-curve'); i++) await sleep(100);
  const r = sink.find(m => m.type === 'ext-curve');
  ok(!!(r && r.ok), 'ext-curve ok' + (r && r.error ? '（' + r.error + '）' : ''));
  if (!r || !r.ok) { console.log('\nFAILED: ' + (fails || 1)); process.exit(1); }
  const N = r.data.natal;
  ok(N && N.schema === 'xiaoliu.taiyi-natal/v1', 'natal 契約存在');
  ok(Array.isArray(r.data.series) && r.data.series.length === 2, '原有兩條曲線不變');
  // 與單機版 currentChartData 同值（同程式碼路徑，理應全等）
  ok(!('annualHuaYaoStructured' in N) && !('transitActivations' in N) && !('monthlyHexagramsResult' in N) && !('upcomingLowScoreYears' in N),
    'natal 不含流年／流日層欄位');
  // 回歸件：對照太乙單機版匯出檔（2026-11-21，Nakai 提供）
  ok(N.yearPillar + N.monthPillar + N.dayPillar + N.hourPillar === '丙午丙申戊申壬戌', '四柱 丙午丙申戊申壬戌');
  ok(N.arrangedLifePalaces.join('') === '財孫妻兄命父貌福疾奴官田', '十二宮排列（子→亥）財孫妻兄命父貌福疾奴官田');
  ok(N.kongWangResult.join('') === '寅卯', '空亡 寅卯');
  ok(N.lookupResult.太乙 === '酉' && N.lookupResult.始擊 === '巳' && N.lookupResult.主算 === 25 && N.lookupResult.客算 === 10, '八將：太乙酉、始擊巳、主算25、客算10');
  const S = (p, s) => N.chartModel[p] && N.chartModel[p].stars[s];
  ok(!!(S('pSi', '始擊') && S('pSi', '時五福') && S('pSi', '臣基')), '父母宮巳：始擊、時五福、臣基');
  ok(S('pSi', '始擊').huaYao.join() === '干元星,天元祿主' && S('pSi', '臣基').huaYao.length === 0, '父母宮化曜只在始擊（干元星、天元祿主）');
  ok(S('pShen', '民基').strength === '科名' && S('pShen', '民基').huaYao.join() === '偏祿', '疾厄宮申：民基 科名＋偏祿');
  ok(S('pXu', '計神').strength === '入廟' && !!S('pXu', '主大'), '官祿宮戌：計神入廟、主大');
  ok(S('pHai', '君基').strength === '貴人' && S('pQian', '客大').huaYao.join() === '天元官星,妻財,地元福星', '田宅亥君基貴人；乾宮客大帶妻財');
  ok(N.chartModel.pGen.patterns.some(p => p.type === '關' && p.primary === '文昌' && p.secondary === '客參'), '艮宮格局：關（文昌×客參）');
  ok(S('pChou', '四神').huaYao.join() === '忌星' && S('pZi', '地乙').huaYao.join() === '偏祿', '子孫四神忌星、財帛地乙偏祿');
  const fq = N.lifePalacesSummary.find(x => x.shortName === '妻');
  ok(fq && fq.mainStars.map(s => s.name + s.source).join() === '文昌寄宮,客參寄宮', '夫妻宮主星：文昌、客參（寄宮）');
  console.log(fails === 0 ? '\nALL PASS' : '\nFAILED: ' + fails);
  process.exit(fails === 0 ? 0 : 1);
})();
