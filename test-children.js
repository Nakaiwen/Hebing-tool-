/* 子頁測試：jsdom 實跑 bazi.html / ziwei.html
   1) 排盤成功、橋接回傳 ok
   2) 八字：橋接計分 vs 原版 luckCurveHtml SVG 反解分數，逐步比對（交叉驗證，防鏡射漂移）
   3) 紫微：橋接 years vs 原版 lifeData() 直接比對（同程式碼路徑，理應全等）
   測試命主：1976-10-14 亥時 女（紫微工具預設值）＋ 1988-08-08 辰時 男
*/
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const NodeBaziEngine = require('./bazi-engine.js');

function loadPage(file, { parentSink }) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf-8');
  const { VirtualConsole } = require('jsdom');
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => errors.push(String(e)));
  vc.on('error', (...a) => errors.push(a.map(String).join(' ')));
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://localhost/' + file,
    virtualConsole: vc,
    beforeParse(win) {
      win.alert = (m) => { win.__lastAlert = m; };
      Object.defineProperty(win, 'parent', {
        value: { postMessage: (msg) => parentSink.push(msg) }, configurable: true
      });
    }
  });
  dom.__errors = errors;
  return dom;
}

function sendRun(dom, input) {
  const win = dom.window;
  win.dispatchEvent(new win.MessageEvent('message', { data: { xl: 'xl-merge-bridge', type: 'run', input } }));
}

const CASES = [
  { label: '1976-10-14 亥時 女',
    bazi: { name: '測試甲', gender: '女', year: 1976, month: 10, day: 14, hour: 22 },
    ziwei: { name: '測試甲', gender: 'F', y: 1976, m: 10, d: 14, h: 11, lateZi: false, leapRule: 'split15' } },
  { label: '1988-08-08 辰時 男',
    bazi: { name: '測試乙', gender: '男', year: 1988, month: 8, day: 8, hour: 8 },
    ziwei: { name: '測試乙', gender: 'M', y: 1988, m: 8, d: 8, h: 4, lateZi: false, leapRule: 'split15' } },
];

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fails++; };

/* ---------- 八字 ---------- */
console.log('== bazi.html ==');
for (const c of CASES) {
  const sink = [];
  const dom = loadPage('bazi.html', { parentSink: sink });
  const win = dom.window;
  ok(sink.some(m => m.type === 'ready'), c.label + '：橋接 ready 訊號');
  sendRun(dom, c.bazi);
  const resp = sink.find(m => m.type === 'bazi-curve');
  ok(!!resp, c.label + '：收到 bazi-curve 回應');
  if (!resp) continue;
  ok(resp.ok === true, c.label + '：ok=true' + (resp.ok ? '' : '（error: ' + resp.error + '）'));
  if (!resp.ok) continue;
  const d = resp.data;
  ok(d.pillars.length === 10, c.label + '：十步大運（實得 ' + d.pillars.length + '）');
  ok(d.pillars.every(p => isFinite(p.score)), c.label + '：v2 分數皆為有限數');
  ok(d.pillars.every(p => Array.isArray(p.parts) && p.parts.reduce((a, x) => a + x.delta, 0) === p.score), c.label + '：橋接 parts 分項總和===score');
  ok(d.birthYear === c.bazi.year, c.label + '：birthYear 正確');
  ok(d.specialScoring && d.specialScoring.version === 'special-pattern-element-weight/v1' &&
     d.pillars.every(p=>p.specialScoring && p.specialScoring.multiplier === d.specialScoring.multiplier) &&
     d.annual.every(a=>a.specialScoring && a.specialScoring.multiplier === d.specialScoring.multiplier),
    c.label + '：橋接大運、流年均保存同一特殊格加權方案');

  // 交叉驗證（v2）：曲線 SVG 反解（動態 maxAbs 尺）vs 橋接分數（同走 luckPillarScoreV2）
  const chart = win.eval('currentChart');
  const resultText = win.document.getElementById('result').textContent;
  const specialDetails = chart.strength.details || {};
  const hasSpecialPattern = [specialDetails.huaQi, specialDetails.zhuanWang, specialDetails.congGe]
    .some(x=>x && x.status && x.status !== '正格') ||
    !!(specialDetails.monthPattern && specialDetails.monthPattern.status === '成立' && specialDetails.monthPattern.type);
  ok(resultText.includes('特殊格局裁定') === hasSpecialPattern,
    c.label + '：特殊格局裁定只在明確／疑似特殊格、建祿或月刃命中時顯示');
  const hasOuterPattern = ((specialDetails.classicalOuterPatterns || []).length > 0);
  ok(resultText.includes('古法外格標籤（不影響曲線）') === hasOuterPattern,
    c.label + '：古法外格區只在實際命中標籤時顯示');
  ok(resultText.includes('月令八種正格・成敗救應'),
    c.label + '：正常月令八格解讀仍保留');
  const svgHtml = win.luckCurveHtml(chart);
  const m = svgHtml.match(/<polyline points="([^"]+)"/);
  ok(!!m, c.label + '：原版曲線 SVG 可解析');
  if (m) {
    const bridgeScores = d.pillars.map(p => p.score);
    const maxAbs = Math.max(30, ...bridgeScores.map(Math.abs));
    const ys2 = m[1].split(' ').map(pt => parseFloat(pt.split(',')[1]));
    const decoded = ys2.map(y => Math.round(((150 - y) / 104) * maxAbs));
    ok(decoded.length === bridgeScores.length && decoded.every((v, i) => Math.abs(v - bridgeScores[i]) <= 1),
      c.label + '：橋接 v2 計分 === 曲線 SVG 反解（±1 容差）\n      反解 ' + JSON.stringify(decoded) + '\n      橋接 ' + JSON.stringify(bridgeScores));
  }
  // v2 逐構面固化驗證（獨立迷你表，防抄寫漂移）
  {
    const T_LU = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
    const T_REN = {甲:'卯',乙:'寅',丙:'午',丁:'巳',戊:'午',己:'巳',庚:'酉',辛:'申',壬:'子',癸:'亥'};
    const dayStem = chart.pillars.dayPillar.charAt(0);
    let stageOk = true, purgeOk = true, xingOk = true;
    d.pillars.forEach(p => {
      const br = p.gz.charAt(1);
      const lp = p.parts.filter(x => ['日主祿', '長生', '羊刃', '絕'].includes(x.label));
      let exp = 0;
      if (T_LU[dayStem] === br) exp = 20;
      else if (T_REN[dayStem] === br) exp = -10;
      else { const st = win.BaziEngine.getTwelveStage(dayStem, br); exp = st === '絕' ? -15 : st === '長生' ? 10 : 0; }
      if (lp.reduce((a, x) => a + x.delta, 0) !== exp) stageOk = false;
      if (p.parts.some(x => /祿神|飛刃/.test(x.label))) purgeOk = false;
      p.parts.filter(x => x.label.startsWith('刑')).forEach(x => { if (x.delta !== -5) xingOk = false; });
    });
    ok(stageOk, c.label + '：構面⑤長生配分（祿+20/長生+10/羊刃−10/絕−15）獨立表全等');
    ok(purgeOk, c.label + '：構面③祿神/飛刃已剔除於分項');
    ok(xingOk, c.label + '：刑分項一律 −5');
  }
  // 流年資料 v2：大運半分基礎、分項可驗算，並與 annualCurveHtml SVG 反解逐年全等
  ok(Array.isArray(d.annual) && d.annual.length >= 50, c.label + '：流年資料存在（' + (d.annual ? d.annual.length : 0) + ' 年）');
  ok(d.annual[d.annual.length - 1].year <= 2050, c.label + '：流年截斷不超過 2050（末年 ' + d.annual[d.annual.length - 1].year + '）');
  ok(d.annual.every(a => a.luckGz && isFinite(a.luckScore)), c.label + '：每年皆帶所處大運干支與大運分');
  ok(d.annual.every(a => Array.isArray(a.parts) && a.parts.reduce((n, x) => n + x.delta, 0) === a.score), c.label + '：流年 parts 分項總和===score');
  ok(d.annual.every(a => a.parts[0] && /大運.*半分基礎/.test(a.parts[0].label) && a.parts[0].delta === a.luckScore / 2), c.label + '：流年基礎分===當年大運分 × 1/2');
  ok(d.annual.some(a => a.parts.some(x => /流年納音/.test(x.label))), c.label + '：流年納音喜忌已入分');
  ok(d.annual.some(a => a.parts.some(x => /流年吉神|流年凶煞/.test(x.label))), c.label + '：流年神煞已入分');
  ok(d.annual.some(a => a.parts.some(x => /剋.*[吉凶]/.test(x.label))), c.label + '：流年與日支／大運支的本氣相剋已入分');
  ok(d.annual.every(a => !a.parts.some(x => /祿神|飛刃/.test(x.label))), c.label + '：流年神煞層未重複計祿神／飛刃');
  const annHtml = win.annualCurveHtml(chart);
  const am = annHtml.match(/<polyline points="([^"]+)"/);
  ok(!!am, c.label + '：原版流年曲線 SVG 可解析');
  if (am) {
    // v2 動態座標：H=320,mT=34,mB=42→plotH=244,baseY=156, y=156−(s/maxAbs)*122
    const ys2 = am[1].split(' ').map(pt => parseFloat(pt.split(',')[1]));
    const bsc = d.annual.map(a => a.score);
    const maxAbsA = Math.max(30, ...bsc.map(Math.abs));
    const dec = ys2.map(y => Math.round((((156 - y) / 122) * maxAbsA) * 2) / 2);
    ok(dec.length === bsc.length && dec.every((v, i) => Math.abs(v - bsc[i]) <= 0.1),
      c.label + '：橋接流年 v2 === annualCurveHtml SVG 反解（' + dec.length + ' 年）');
  }
  // 大運干支與引擎直取比對（雙路徑一致）
  const cyc = win.BaziEngine.getLuckCycle(chart.meta.solarBirth, chart.meta.gender,
    chart.pillars.yearPillar.charAt(0), chart.pillars.monthPillar);
  ok(cyc.pillars.every((p, i) => p.pillar === d.pillars[i].gz && p.startAge === d.pillars[i].startAge),
    c.label + '：大運干支/起歲 與引擎直取一致（首步 ' + d.pillars[0].gz + ' ' + d.pillars[0].startAge.toFixed(2) + ' 歲起）');
}

/* ---------- 郭芳菱：合化洩氣與喜用神衝突回歸 ---------- */
{
  const sink = [];
  const dom = loadPage('bazi.html', { parentSink: sink });
  sendRun(dom, { name: '郭芳菱', gender: '女', year: 1989, month: 8, day: 9, hour: 8 });
  const win = dom.window;
  const chart = win.eval('currentChart');
  const resp = sink.find(m => m.type === 'bazi-curve');
  ok(chart.pillars.yearPillar === '己巳' && chart.pillars.monthPillar === '壬申' &&
     chart.pillars.dayPillar === '辛丑' && chart.pillars.hourPillar === '壬辰',
    '郭芳菱：四柱為己巳／壬申／辛丑／壬辰');
  ok(chart.strength.details.baseScore.self === 6 && chart.strength.details.baseScore.foe === 3,
    '郭芳菱：原始八分法仍保留 6：3，可追溯未校正判定');
  ok(chart.strength.details.settlement.some(x => x.type === '合化根氣' && x.sourceBranch === '申' && x.transformsTo === '水' && x.delta === -2),
    '郭芳菱：巳申化水且兩壬透干，申月令根氣全轉水');
  ok(chart.strength.details.settlement.some(x => x.type === '拱局' && /申辰/.test(x.note) && x.element === '水' && x.delta === 0.5),
    '郭芳菱：申辰無旺神半合在水透干時，以拱水 +0.5 納入');
  ok(chart.strength.level === '身弱' && chart.strength.confidence === '臨界' &&
     chart.strength.score.self === 4.5 && chart.strength.score.foe === 5.5,
    '郭芳菱：合化洩耗校正後 4.5：5.5，判為臨界身弱');
  ok(JSON.stringify(chart.yongShen.favorable) === JSON.stringify(['金', '土']) &&
     JSON.stringify(chart.yongShen.unfavorable) === JSON.stringify(['木', '火', '水']),
    '郭芳菱：臨界身弱取金土為喜、木火水為忌');
  ok(chart.yongShen.favorable.every(e => !chart.yongShen.unfavorable.includes(e)),
    '郭芳菱：喜忌不再因病藥與扶抑衝突而重疊');
  ok(resp && resp.ok && resp.data.strength && resp.data.yongShen &&
     resp.data.strength.level === '身弱' && resp.data.strength.congGe && resp.data.strength.congGe.status === '正格' &&
     resp.data.yongShen.method === '合化洩氣校正＋身弱扶' && resp.data.yongShen.decision.activeRule === '正格',
    '郭芳菱：合盤橋接保存旺衰、正格／從格三級與喜用神判定依據');
  ok(resp && resp.ok && JSON.stringify(resp.data.pillars.map(p => p.score)) === JSON.stringify([90, 5, -50, -30, 10, -15, -25, 25, 5, -30]),
    '郭芳菱：新版喜用神已重算十步大運曲線');
}

/* ---------- 從格三級：正格／疑似從格／明確從格 ---------- */
{
  const dom = loadPage('bazi.html', { parentSink: [] });
  const HtmlEngine = dom.window.BaziEngine;
  const samples = {
    clearWeak: {yearPillar:'丙午',monthPillar:'戊巳',dayPillar:'甲戌',hourPillar:'庚酉'},
    maybeWeak: {yearPillar:'丙午',monthPillar:'戊巳',dayPillar:'甲戌',hourPillar:'癸酉'},
    clearStrong: {yearPillar:'壬子',monthPillar:'癸亥',dayPillar:'甲寅',hourPillar:'乙卯'},
    maybeStrong: {yearPillar:'壬子',monthPillar:'癸亥',dayPillar:'甲寅',hourPillar:'丙卯'},
    regular: {yearPillar:'甲子',monthPillar:'丙寅',dayPillar:'甲辰',hourPillar:'庚午'},
    plain: {yearPillar:'己丑',monthPillar:'辛酉',dayPillar:'甲辰',hourPillar:'癸亥'},
    curve: {yearPillar:'甲寅',monthPillar:'乙卯',dayPillar:'甲寅',hourPillar:'乙卯'},
    flame: {yearPillar:'丙午',monthPillar:'丁巳',dayPillar:'丙午',hourPillar:'丁巳'},
    earth: {yearPillar:'戊辰',monthPillar:'己辰',dayPillar:'戊辰',hourPillar:'己辰'},
    metal: {yearPillar:'庚申',monthPillar:'辛酉',dayPillar:'庚申',hourPillar:'辛酉'},
    water: {yearPillar:'壬子',monthPillar:'癸亥',dayPillar:'壬子',hourPillar:'癸亥'},
    maybeCurve: {yearPillar:'甲寅',monthPillar:'乙卯',dayPillar:'甲寅',hourPillar:'庚卯'},
    huaEarth: {yearPillar:'戊戌',monthPillar:'戊丑',dayPillar:'甲戌',hourPillar:'己丑'},
    huaMetal: {yearPillar:'辛酉',monthPillar:'辛申',dayPillar:'乙酉',hourPillar:'庚申'},
    huaWater: {yearPillar:'壬子',monthPillar:'癸亥',dayPillar:'丙子',hourPillar:'辛亥'},
    huaWood: {yearPillar:'甲卯',monthPillar:'乙亥',dayPillar:'丁卯',hourPillar:'壬亥'},
    huaFire: {yearPillar:'丙午',monthPillar:'丁午',dayPillar:'戊巳',hourPillar:'癸巳'},
    reverseHuaEarth: {yearPillar:'戊戌',monthPillar:'戊丑',dayPillar:'己戌',hourPillar:'甲丑'},
    reverseHuaMetal: {yearPillar:'辛酉',monthPillar:'辛申',dayPillar:'庚酉',hourPillar:'乙申'},
    reverseHuaWater: {yearPillar:'壬子',monthPillar:'癸亥',dayPillar:'辛子',hourPillar:'丙亥'},
    reverseHuaWood: {yearPillar:'甲卯',monthPillar:'乙亥',dayPillar:'壬卯',hourPillar:'丁亥'},
    reverseHuaFire: {yearPillar:'丙午',monthPillar:'丁午',dayPillar:'癸巳',hourPillar:'戊巳'},
    maybeHua: {yearPillar:'己戌',monthPillar:'戊丑',dayPillar:'甲戌',hourPillar:'戊丑'},
    jianLu: {yearPillar:'壬子',monthPillar:'丙寅',dayPillar:'甲辰',hourPillar:'庚午'},
    yueRen: {yearPillar:'壬子',monthPillar:'丁卯',dayPillar:'甲辰',hourPillar:'庚午'}
  };
  function assess(E,p){ const s=E.analyzeStrength(p),y=E.selectYongShen(p,s); return {s,y}; }
  const h={},n={};
  Object.keys(samples).forEach(k => { h[k]=assess(HtmlEngine,samples[k]); n[k]=assess(NodeBaziEngine,samples[k]); });
  ok(Object.keys(samples).every(k => JSON.stringify(h[k]) === JSON.stringify(n[k])),
    'HTML 內嵌引擎與 bazi-engine.js 的從格三級判定完全同源');
  ok(h.clearWeak.s.details.congGe.status === '明確從格' && h.clearWeak.s.level === '從弱' &&
     h.clearWeak.y.decision.activeRule === '明確從格' && !h.clearWeak.y.alternative,
    '孤弱無根且主勢成立時判明確從弱，正式採順勢喜忌');
  ok(h.maybeWeak.s.details.congGe.status === '疑似從格' && h.maybeWeak.s.level === '身弱' &&
     h.maybeWeak.y.decision.activeRule === '正格' && h.maybeWeak.y.alternative && h.maybeWeak.y.alternative.decision.affectsCurve === false,
    '極弱但仍有一處孤援時列疑似從弱，主曲線維持正格並保存順勢備選');
  ok(h.clearStrong.s.details.congGe.status === '明確從格' && h.clearStrong.s.level === '從強' &&
     h.clearStrong.y.method === '從強格順勢',
    '滿盤生扶、敵方為零時判明確從強');
  ok(h.maybeStrong.s.details.congGe.status === '疑似從格' && h.maybeStrong.s.level === '身強' &&
     h.maybeStrong.y.alternatives.some(x => /疑似從強格/.test(x.method)),
    '生扶成勢但尚有一處逆勢時列疑似從強，不直接翻轉曲線');
  ok(h.regular.s.details.congGe.status === '正格' && !h.regular.y.alternative,
    '未達極端失衡、月令與孤援門檻時維持正格');
  const weakAlt=h.maybeWeak.y.alternatives.find(x=>/從兒格/.test(x.method));
  const strongAlt=h.maybeStrong.y.alternatives.find(x=>/從強格/.test(x.method));
  ok(weakAlt && strongAlt && h.maybeWeak.y.favorable.join() !== weakAlt.favorable.join() &&
     h.maybeStrong.y.favorable.join() !== strongAlt.favorable.join(),
    '疑似從格同時保留正格與順勢兩套不同喜忌，只有正格組參與目前計分');

  const zwNames={curve:'曲直格',flame:'炎上格',earth:'稼穡格',metal:'從革格',water:'潤下格'};
  ok(Object.keys(zwNames).every(k => h[k].s.details.zhuanWang.status === '明確專旺' &&
     h[k].s.details.zhuanWang.pattern === zwNames[k] && h[k].s.details.zhuanWang.selected &&
     h[k].y.decision.activeRule === '明確專旺格'),
    '木火土金水五種專旺格皆能明確成立並正式採順勢喜忌');
  ok(h.maybeCurve.s.details.zhuanWang.status === '疑似專旺' && !h.maybeCurve.s.details.zhuanWang.selected &&
     h.maybeCurve.y.decision.activeRule === '正格' && h.maybeCurve.y.alternatives.some(x=>x.decision.activeRule === '專旺備選'),
    '專旺仍見孤立官殺時列疑似，主曲線維持正格並保存專旺備選');

  const hqNames={huaEarth:'甲己化土格',huaMetal:'乙庚化金格',huaWater:'丙辛化水格',huaWood:'丁壬化木格',huaFire:'戊癸化火格'};
  ok(Object.keys(hqNames).every(k => h[k].s.details.huaQi.status === '明確化氣' &&
     h[k].s.details.huaQi.pattern === hqNames[k] && h[k].s.details.huaQi.selected &&
     h[k].s.details.specialPatternDecision.active.family === '化氣格' && h[k].y.decision.activeRule === '明確化氣格'),
    '五種天干化氣格皆能明確成立，且依優先序正式採化神喜忌');
  const reverseHqNames={reverseHuaEarth:'甲己化土格',reverseHuaMetal:'乙庚化金格',reverseHuaWater:'丙辛化水格',reverseHuaWood:'丁壬化木格',reverseHuaFire:'戊癸化火格'};
  ok(Object.keys(reverseHqNames).every(k => h[k].s.details.huaQi.status === '明確化氣' && h[k].s.details.huaQi.pattern === reverseHqNames[k]),
    '五組天干合的另一端作日主時，也能成立相同化氣格（含己日化土、庚日化金同氣例外）');
  ok(h.maybeHua.s.details.huaQi.status === '疑似化氣' && !h.maybeHua.s.details.huaQi.selected &&
     h.maybeHua.y.decision.activeRule === '正格' && h.maybeHua.y.alternatives.some(x=>x.decision.activeRule === '化氣備選'),
    '合伴不鄰日主時列疑似化氣，主曲線維持正格並保存化氣備選');
  ok(Object.keys(hqNames).every(k => h[k].s.details.specialPatternDecision.active.family === '化氣格'),
    '明確化氣優先於同盤可能成立的從格或其他特殊格局');

  ok(h.jianLu.s.details.monthPattern.status === '成立' && h.jianLu.s.details.monthPattern.type === '建祿格' &&
     h.yueRen.s.details.monthPattern.status === '成立' && h.yueRen.s.details.monthPattern.type === '月刃格',
    '日主祿位／陽刃落月令時分別成立建祿格與月刃格');
  ok(h.jianLu.s.details.monthPattern.affectsCurve === false && h.yueRen.s.details.monthPattern.affectsCurve === false &&
     h.jianLu.y.decision.monthPattern === '建祿格' && h.yueRen.y.decision.monthPattern === '月刃格',
    '建祿／月刃完整記錄但不單獨翻轉喜用神曲線');

  function scoringChart(assessed,pillars){
    return {pillars:pillars,strength:assessed.s,yongShen:assessed.y,kongWang:[],meta:{gender:'男'}};
  }
  const gzByElement={'木':'甲寅','火':'丙午','土':'戊辰','金':'庚申','水':'壬子'};
  function directDeltas(result,gz,annual){
    const sp=(annual?'流年干':'干')+gz.charAt(0),bp=(annual?'流年支':'支')+gz.charAt(1);
    const s=result.parts.find(x=>x.label.indexOf(sp)===0),b=result.parts.find(x=>x.label.indexOf(bp)===0);
    return [s&&s.delta,b&&b.delta];
  }
  function assertWeight(key,expected,label){
    const a=h[key],chart=scoringChart(a,samples[key]);
    const profile=dom.window.specialPatternScoreProfile(chart);
    const favGz=gzByElement[a.y.favorable[0]],unfavGz=gzByElement[a.y.unfavorable[0]];
    const favLuck=dom.window.luckPillarScoreV2(chart,favGz),unfavLuck=dom.window.luckPillarScoreV2(chart,unfavGz);
    const favAnnual=dom.window.annualPillarScoreV2(chart,favGz,null),unfavAnnual=dom.window.annualPillarScoreV2(chart,unfavGz,null);
    ok(profile.multiplier===expected &&
       JSON.stringify(directDeltas(favLuck,favGz,false))===JSON.stringify([10*expected,20*expected]) &&
       JSON.stringify(directDeltas(unfavLuck,unfavGz,false))===JSON.stringify([-10*expected,-20*expected]) &&
       JSON.stringify(directDeltas(favAnnual,favGz,true))===JSON.stringify([10*expected,20*expected]) &&
       JSON.stringify(directDeltas(unfavAnnual,unfavGz,true))===JSON.stringify([-10*expected,-20*expected]),label);
  }
  assertWeight('clearWeak',1.5,'明確從格：大運／流年干支喜忌對稱放大為 ±15／±30');
  assertWeight('curve',1.5,'明確專旺格：大運／流年干支喜忌使用 1.5 倍');
  assertWeight('huaEarth',1.5,'明確化氣格：大運／流年干支喜忌使用 1.5 倍');
  assertWeight('jianLu',1.25,'建祿格：大運／流年干支喜忌對稱放大為 ±12.5／±25');
  assertWeight('yueRen',1.25,'月刃格：大運／流年干支喜忌使用 1.25 倍');
  assertWeight('maybeWeak',1,'疑似從格不加權，維持普通 ±10／±20');
  assertWeight('maybeCurve',1.25,'疑似專旺格本身不取 1.5 倍；同盤月刃僅依月令特殊格取 1.25 倍');
  assertWeight('maybeHua',1,'疑似化氣格不加權');
  assertWeight('plain',1,'普通正格不加權');
  const maybeCurveNoMonth=JSON.parse(JSON.stringify(scoringChart(h.maybeCurve,samples.maybeCurve)));
  maybeCurveNoMonth.strength.details.monthPattern={status:'未成立',type:null};
  ok(dom.window.specialPatternScoreProfile(maybeCurveNoMonth).multiplier===1,
    '移除同盤月刃後，疑似專旺格不會單獨觸發加權');

  const clearChart=scoringChart(h.clearWeak,samples.clearWeak);
  const favGz=gzByElement[h.clearWeak.y.favorable[0]];
  const weightedLuck=dom.window.luckPillarScoreV2(clearChart,favGz);
  const weightedAnnual=dom.window.annualPillarScoreV2(clearChart,favGz,null);
  const ordinaryClone=JSON.parse(JSON.stringify(clearChart));
  ordinaryClone.strength.details.specialPatternDecision.active=null;
  const ordinaryLuck=dom.window.luckPillarScoreV2(ordinaryClone,favGz);
  const ordinaryAnnual=dom.window.annualPillarScoreV2(ordinaryClone,favGz,null);
  function withoutDirect(parts,gz,annual){
    const sp=(annual?'流年干':'干')+gz.charAt(0),bp=(annual?'流年支':'支')+gz.charAt(1);
    return parts.filter(x=>x.label.indexOf(sp)!==0&&x.label.indexOf(bp)!==0);
  }
  ok(JSON.stringify(withoutDirect(weightedLuck.parts,favGz,false))===JSON.stringify(withoutDirect(ordinaryLuck.parts,favGz,false)) &&
     JSON.stringify(withoutDirect(weightedAnnual.parts,favGz,true))===JSON.stringify(withoutDirect(ordinaryAnnual.parts,favGz,true)),
    '特殊格只放大本柱干支喜忌，納音、神煞、刑沖合與十二長生分項不變');
  const outerOnlyClone=JSON.parse(JSON.stringify(scoringChart(h.plain,samples.plain)));
  outerOnlyClone.strength.details.classicalOuterPatterns=[{name:'測試外格',affectsCurve:false}];
  ok(dom.window.specialPatternScoreProfile(outerOnlyClone).multiplier===1,
    '古法外格即使命中標籤仍不加權曲線');

  const regularSamples={
    officer:{yearPillar:'己丑',monthPillar:'辛酉',dayPillar:'甲辰',hourPillar:'癸亥'},
    kill:{yearPillar:'壬子',monthPillar:'庚申',dayPillar:'甲辰',hourPillar:'丙寅'},
    wealth:{yearPillar:'丙寅',monthPillar:'己未',dayPillar:'甲辰',hourPillar:'辛酉'},
    partialWealth:{yearPillar:'丙寅',monthPillar:'戊辰',dayPillar:'甲子',hourPillar:'辛酉'},
    seal:{yearPillar:'庚申',monthPillar:'癸子',dayPillar:'甲辰',hourPillar:'丙寅'},
    partialSeal:{yearPillar:'庚申',monthPillar:'壬亥',dayPillar:'甲辰',hourPillar:'丙寅'},
    food:{yearPillar:'戊辰',monthPillar:'丙巳',dayPillar:'甲寅',hourPillar:'庚申'},
    hurt:{yearPillar:'戊辰',monthPillar:'丁午',dayPillar:'甲寅',hourPillar:'庚申'}
  };
  const regularNames={officer:'正官格',kill:'七殺格',wealth:'正財格',partialWealth:'偏財格',
    seal:'正印格',partialSeal:'偏印格',food:'食神格',hurt:'傷官格'};
  const hr={},nr={};
  Object.keys(regularSamples).forEach(k=>{hr[k]=assess(HtmlEngine,regularSamples[k]);nr[k]=assess(NodeBaziEngine,regularSamples[k]);});
  ok(Object.keys(regularSamples).every(k=>JSON.stringify(hr[k])===JSON.stringify(nr[k])),
    '月令八格在 HTML 內嵌引擎與獨立引擎完全同源');
  ok(Object.keys(regularNames).every(k=>hr[k].s.details.regularMonthPattern.status==='已取格' &&
     hr[k].s.details.regularMonthPattern.pattern===regularNames[k]),
    '正官、七殺、正偏財、正偏印、食神、傷官八種月令正格均可取格');
  ok(Object.keys(hr).every(k=>hr[k].s.details.regularMonthPattern.affectsCurve===false &&
     Array.isArray(hr[k].s.details.regularMonthPattern.activeSuccess) &&
     Array.isArray(hr[k].s.details.regularMonthPattern.activeFailures) &&
     Array.isArray(hr[k].s.details.regularMonthPattern.activeRescues) &&
     hr[k].y.decision.regularMonthPattern===regularNames[k] && hr[k].y.decision.interpretivePatternsAffectCurve===false),
    '八格保留成格、破格、救應證據，並明示不參與目前曲線');
  const officerRescued=assess(HtmlEngine,{yearPillar:'丁巳',monthPillar:'辛酉',dayPillar:'甲辰',hourPillar:'癸亥'});
  ok(officerRescued.s.details.regularMonthPattern.verdict==='敗中有救' &&
     officerRescued.s.details.regularMonthPattern.activeFailures.some(x=>x.key==='hurt_officer') &&
     officerRescued.s.details.regularMonthPattern.activeRescues.some(x=>x.key==='seal_control_hurt'),
    '正官格遇傷官為敗，有印制傷時能判「敗中有救」並指出救應');
  const legacyStrength=JSON.parse(JSON.stringify(hr.officer.s));
  delete legacyStrength.details.regularMonthPattern;
  delete legacyStrength.details.classicalOuterPatterns;
  const legacyYong=HtmlEngine.selectYongShen(regularSamples.officer,legacyStrength);
  ok(JSON.stringify(legacyYong.favorable)===JSON.stringify(hr.officer.y.favorable) &&
     JSON.stringify(legacyYong.unfavorable)===JSON.stringify(hr.officer.y.unfavorable) && legacyYong.method===hr.officer.y.method,
    '關閉解讀欄位後喜用神不變，證明月令八格尚未暗中改分');

  const outerSamples={
    one:{yearPillar:'甲子',monthPillar:'甲子',dayPillar:'甲子',hourPillar:'甲子'},
    jing:{yearPillar:'庚申',monthPillar:'戊辰',dayPillar:'庚子',hourPillar:'庚辰'},
    mouse:{yearPillar:'壬寅',monthPillar:'癸卯',dayPillar:'乙亥',hourPillar:'丙子'},
    yin:{yearPillar:'甲辰',monthPillar:'乙亥',dayPillar:'辛丑',hourPillar:'戊子'},
    fly:{yearPillar:'甲子',monthPillar:'丙子',dayPillar:'庚子',hourPillar:'丙戌'},
    gongLu:{yearPillar:'甲子',monthPillar:'乙丑',dayPillar:'丁巳',hourPillar:'丁未'},
    gongGui:{yearPillar:'丙午',monthPillar:'戊辰',dayPillar:'甲子',hourPillar:'甲寅'}
  };
  const outerExpected={one:['天元一氣','地支一氣'],jing:['井欄叉格'],mouse:['六乙鼠貴'],yin:['六陰朝陽'],
    fly:['飛天祿馬'],gongLu:['拱祿格'],gongGui:['拱貴格']};
  const outerAssessed={};
  Object.keys(outerSamples).forEach(k=>outerAssessed[k]=assess(HtmlEngine,outerSamples[k]));
  ok(Object.keys(outerExpected).every(k=>outerExpected[k].every(name=>
     outerAssessed[k].s.details.classicalOuterPatterns.some(x=>x.name===name&&x.affectsCurve===false))),
    '古法外格可保守檢出一氣、井欄叉、鼠貴、朝陽、飛天、拱祿與拱貴標籤');
  ok(Object.values(outerAssessed).every(a=>a.s.details.classicalOuterPatterns.every(x=>x.affectsCurve===false) &&
     a.y.decision.interpretivePatternsAffectCurve===false),
    '所有古法外格只是標籤，不影響喜用神與曲線');
}

/* ---------- 疑似從格實盤：畫面與橋接資料 ---------- */
{
  const sink = [];
  const dom = loadPage('bazi.html', { parentSink: sink });
  sendRun(dom, { name:'從格測試', gender:'男', year:1970, month:1, day:7, hour:0 });
  const win=dom.window, chart=win.eval('currentChart');
  const resp=sink.find(m => m.type === 'bazi-curve');
  const text=win.document.getElementById('result').textContent;
  ok(chart.strength.details.congGe.status === '疑似從格' && /從格判定：疑似從格/.test(text),
    '八字畫面顯示疑似從格及其成立依據');
  ok(chart.yongShen.alternatives && /疑似特殊格局備選喜忌（不參與目前曲線）/.test(text),
    '八字畫面列出疑似特殊格局備選喜忌，明示不參與目前曲線');
  ok(/特殊格局裁定/.test(text) && /月令八種正格・成敗救應/.test(text) &&
     !/古法外格標籤（不影響曲線）/.test(text),
    '疑似從格畫面顯示特殊格與月令八格，未命中外格時隱藏外格區');
  ok(resp && resp.data.strength.congGe.status === '疑似從格' && resp.data.yongShen.alternative &&
     resp.data.yongShen.alternatives.every(x=>x.decision.affectsCurve === false) && resp.data.strength.zhuanWang &&
     resp.data.strength.huaQi && resp.data.strength.monthPattern && resp.data.strength.regularMonthPattern &&
     Array.isArray(resp.data.strength.classicalOuterPatterns) && resp.data.strength.specialPatternDecision,
    '合盤 JSON 完整保存特殊格局、月令八格成敗救應、古法外格標籤與備選喜忌');
}

/* ---------- 紫微 ---------- */
console.log('== ziwei.html ==');
for (const c of CASES) {
  const sink = [];
  const dom = loadPage('ziwei.html', { parentSink: sink });
  const win = dom.window;
  ok(sink.some(m => m.type === 'ready'), c.label + '：橋接 ready 訊號');
  sendRun(dom, c.ziwei);
  const resp = sink.find(m => m.type === 'ziwei-curve');
  ok(!!resp, c.label + '：收到 ziwei-curve 回應');
  if (!resp) continue;
  ok(resp.ok === true, c.label + '：ok=true' + (resp.ok ? '' : '（error: ' + resp.error + '）'));
  if (!resp.ok) continue;
  const d = resp.data;
  ok(d.daList.length === 12, c.label + '：十二大限（實得 ' + d.daList.length + '）');
  ok(d.years.length >= 90, c.label + '：逐年點數合理（' + d.years.length + ' 年）');
  // 同路徑重跑 lifeData 比對（防橋接映射欄位錯置）
  const ref = win.lifeData();
  const same = ref.years.length === d.years.length && ref.years.every((y, i) =>
    y.age === d.years[i].age && y.year === d.years[i].year &&
    y.score === d.years[i].score && y.label === d.years[i].label);
  ok(same, c.label + '：橋接 years === 原版 lifeData() 全等');
  // 年份換算抽查：year = lunarBirthYear + age − 1
  ok(d.years.every(y => y.year === d.lunarBirthYear + y.age - 1), c.label + '：西元年換算式成立');
  // 大限能量（v1.1）：與原版 daenData()+daenClass() 全等
  ok(Array.isArray(d.daen) && d.daen.length === 12, c.label + '：大限能量 12 筆（實得 ' + (d.daen ? d.daen.length : 0) + '）');
  const refD = win.daenData();
  const sc = refD.map(r => r.score), pk = Math.max(...sc), vl = Math.min(...sc);
  const sameD = refD.every((r, i) => {
    const cls = win.daenClass(r, pk, vl);
    const b = d.daen[i];
    return b.start === r.d.start && b.end === r.d.end && b.ganZhi === r.ganZhi &&
           b.score === r.score && b.clsKey === cls.key && b.clsWord === cls.word &&
           b.isCur === r.isCur && b.isShen === r.isShen && typeof b.advice === 'string' && b.advice.length > 0;
  });
  ok(sameD, c.label + '：橋接 daen === 原版 daenData/daenClass 全等');
  console.log('    大限質性序列：' + d.daen.map(r => r.clsWord).join(' '));
  const labels = {};
  d.years.forEach(y => labels[y.label] = (labels[y.label] || 0) + 1);
  console.log('    年標籤分布：' + JSON.stringify(labels) + '　lunarBirthYear=' + d.lunarBirthYear);
}

console.log(fails === 0 ? '\nALL PASS' : '\nFAILED: ' + fails);
process.exit(fails === 0 ? 0 : 1);
