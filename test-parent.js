/* 父頁 v0.3 端對端：斜線圖、共振分析卡、模式切換、擴充序列（太乙預演）、破壞測試 */
const { JSDOM, VirtualConsole } = require('jsdom');
const path = require('path');

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function boot() {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const s = String(e); if (!/Could not load link|css/i.test(s)) console.log('  [jsdomError]', s.slice(0, 200)); });
  const dom = await JSDOM.fromFile(path.join(__dirname, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc
  });
  const win = dom.window;
  win.alert = () => {};
  win.__downloads = [];
  win.URL.createObjectURL = (blob) => { win.__downloads.push(blob); return 'blob:test-' + win.__downloads.length; };
  win.URL.revokeObjectURL = () => {};
  // 下載機制 stub：攔截 blob 與檔名
  win.__downloads = [];
  if (!win.URL.createObjectURL) win.URL.createObjectURL = () => 'blob:stub';
  else win.URL.createObjectURL = () => 'blob:stub';
  win.URL.revokeObjectURL = () => {};
  const origClick = win.HTMLAnchorElement.prototype.click;
  win.HTMLAnchorElement.prototype.click = function () {
    if (this.download) { win.__downloads.push({ name: this.download, blob: this.__blob }); return; }
    return origClick.apply(this, arguments);
  };
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    const fb = win.document.getElementById('fr-bazi').contentWindow;
    const fz = win.document.getElementById('fr-ziwei').contentWindow;
    const ft = win.document.getElementById('fr-taiyi').contentWindow;
    if (fb && fz && ft && fb.document && fz.document && ft.document
        && fb.document.readyState === 'complete' && fz.document.readyState === 'complete'
        && ft.document.readyState === 'complete'
        && typeof fb.runChart === 'function' && fz.eval && fz.eval("typeof compute==='function'")
        && ft.document.getElementById('calculate-btn')) break;
  }
  return dom;
}
function fill(win, v) {
  const $ = id => win.document.getElementById(id);
  $('f-name').value = v.name; $('f-gender').value = v.gender;
  $('f-year').value = v.y; $('f-month').value = v.m; $('f-day').value = v.d;
  $('f-hour').value = String(v.h); $('f-latezi').checked = !!v.lateZi;
}
const countPoly = svg => (svg.match(/<polyline/g) || []).length;

(async () => {
  console.log('== 正常流程：1976-10-14 亥時 女（預設：紫微大限）==');
  let dom = await boot();
  let win = dom.window, doc = win.document;
  ok(!!doc.getElementById('ovPdf') && !!doc.getElementById('ovPng') && !!doc.getElementById('ovSvg'), 'PDF／PNG／SVG 輸出鈕常駐於排盤列（未排盤即可見）');
  ok(doc.getElementById('ovPdf').nextElementSibling === doc.getElementById('ovPng'), '「輸出曲線 PDF 報告」位於「輸出 PNG」之前');
  const mw = win.getComputedStyle(doc.getElementById('ovModeWrap'));
  ok(mw.display !== 'none', '合盤層級選單開頁即顯示（未排盤前）');
  ok(/流年合盤/.test(doc.getElementById('ovZiweiMode').textContent), '選單含「流年合盤」選項文字');
  ok(/八字大運 × 紫微大限 × 限例太乙/.test(doc.getElementById('ovZiweiMode').textContent)
     && /八字流年 × 紫微逐年 × 太乙行年趨勢/.test(doc.getElementById('ovZiweiMode').textContent), '選單兩選項皆含太乙字樣');
  ok(doc.getElementById('ovPdf').disabled && doc.getElementById('ovPng').disabled && doc.getElementById('ovSvg').disabled, '未排盤時輸出鈕反灰');
  const syncCard0 = doc.getElementById('syncCard');
  ok(syncCard0 && win.getComputedStyle(syncCard0).display !== 'none' && /太乙錨定可信區段/.test(syncCard0.textContent) && /尚未排盤/.test(syncCard0.textContent), '太乙錨定可信區段卡開頁常駐，未排盤時顯示說明');
  const turnCard0 = doc.getElementById('turnCard');
  ok(turnCard0 && win.getComputedStyle(turnCard0).display !== 'none' && /單盤轉折與領先／落後分析/.test(turnCard0.textContent) && /尚未排盤/.test(turnCard0.textContent), '單盤轉折分析卡開頁常駐並顯示等待說明');
  fill(win, { name: '測試甲', gender: 'F', y: 1976, m: 10, d: 14, h: 11 });
  doc.getElementById('f-go').click();
  ok(/三法排盤中/.test(doc.getElementById('syncGrid').textContent), '排盤等待期間提醒卡仍顯示進度');
  ok(/三法排盤中/.test(doc.getElementById('turnGrid').textContent), '排盤等待期間轉折卡仍顯示進度');
  for (let i = 0; i < 100 && !/svg/.test(doc.getElementById('ovChart').innerHTML); i++) await sleep(100);
  ok(!doc.getElementById('ovPng').disabled && !doc.getElementById('ovSvg').disabled, '排盤後輸出鈕解鎖');

  // 等太乙 ext-curve 與五行主線模組掛上（圖例含限例太乙、共振卡 6 組配對）
  for (let i = 0; i < 100 && !(/限例太乙（十二宮歲段/.test(doc.getElementById('ovLegend').textContent) && /八字＋紫微（五行主線） × 限例太乙/.test(doc.getElementById('resoGrid').textContent)); i++) await sleep(100);
  /* v0.9.34 預設顯示：八字＋紫微（五行主線曲線）與太乙；八字、紫微單線預設關閉 */
  const toggles = [...doc.querySelectorAll('[data-method]')];
  ok(toggles.map(c => c.dataset.method).join(',') === 'bazi,ziwei,hebing,taiyi', '顯示曲線勾選項：八字／紫微／八字＋紫微／太乙');
  ok(toggles.map(c => c.checked).join(',') === 'false,false,true,true', '預設開啟八字＋紫微與太乙、關閉八字與紫微');
  ok(countPoly(doc.getElementById('ovChart').innerHTML) === 2, '預設圖上兩條線（五行主線曲線＋限例太乙）（實得 ' + countPoly(doc.getElementById('ovChart').innerHTML) + '）');
  toggles.forEach(c => { if (!c.checked) c.click(); });
  await sleep(300);
  let svg = doc.getElementById('ovChart').innerHTML;
  ok(!doc.getElementById('ovPdf').disabled, '大限與流年三法核心線齊備後 PDF 報告按鈕解鎖');
  ok(/<svg/.test(svg), '重疊圖 SVG 已產生');
  ok(countPoly(svg) === 4, '大限合盤全開：八字大運＋紫微大限＋五行主線曲線＋限例太乙 四條 polyline（實得 ' + countPoly(svg) + '）');
  ok(/#7d5a44/.test(svg), '限例太乙棕線在圖上');
  ok(/限例太乙（十二宮歲段/.test(doc.getElementById('ovLegend').textContent), '圖例含限例太乙說明與線色');
  ok(!/#46708a/.test(svg), '行年趨勢藍線不在大限層（level 過濾生效）');
  ok(!/<path d="M/.test(svg), '階梯 path 已移除（v0.3 改點連點斜線）');
  ok(/峰|強|轉折|守|谷/.test(svg), '大限質性標記字存在');
  const daX = (svg.match(/stroke-dasharray="2 4"/g) || []).length;
  const dyX = (svg.match(/stroke-dasharray="4 3"/g) || []).length;
  ok(daX >= 10 && dyX === 10, '交界豎線齊全（紫 ' + daX + '、金 ' + dyX + '）');

  // 共振卡
  const resoCard = doc.getElementById('resoCard');
  ok(resoCard.style.display !== 'none', '共振分析卡顯示');
  const resoTxt = doc.getElementById('resoGrid').textContent;
  ok(/同向率/.test(resoTxt) && /形狀相似度/.test(resoTxt), '同向率與形狀相似度存在：' + resoTxt.replace(/\s+/g, ' ').slice(0, 110));
  ok((resoTxt.match(/同向率/g) || []).length === 1 && /八字＋紫微（五行主線） × 限例太乙/.test(resoTxt), '共振卡只顯示核心配對：八字＋紫微 × 限例太乙（v0.9.35）');
  const rMatch = resoTxt.match(/形狀相似度 (-?\d\.\d\d)/);
  ok(!!rMatch && Math.abs(parseFloat(rMatch[1])) <= 1, 'Pearson r 在 [−1,1]（r=' + (rMatch ? rMatch[1] : '?') + '）');
  ok(/共高帶/.test(resoTxt) && /共同功課帶/.test(resoTxt), '共振帶清單存在');
  const bandN = (svg.match(/class="reso-band"/g) || []).length;
  console.log('    圖上共振帶區塊數：' + bandN);
  ok(/非命理結論/.test(doc.getElementById('resoNote').textContent), '共振卡誠實聲明存在');

  // 單盤轉折與領先／落後分析卡
  const turnCard = doc.getElementById('turnCard');
  const turnModes = [...doc.querySelectorAll('#turnGrid .turn-mode')];
  ok(turnCard.style.display !== 'none' && turnModes.length === 2 && /大限轉折關係/.test(turnModes[0].textContent) && /流年轉折關係/.test(turnModes[1].textContent), '轉折卡同時呈現大限與流年兩層級');
  ok((turnCard.textContent.match(/太乙 × 八字＋紫微/g)||[]).length >= 2 && (turnCard.textContent.match(/太乙 × 紫微/g)||[]).length === 0 && (turnCard.textContent.match(/太乙 × 八字[^＋]/g)||[]).length === 0, '大限／流年皆只比較太乙 × 八字＋紫微，不再分列八字、紫微（v0.9.35）');
  ok(/轉折吻合/.test(turnCard.textContent) && /最佳時間差相關/.test(turnCard.textContent) && /方向一致率/.test(turnCard.textContent) && /綜合貼合度/.test(turnCard.textContent), '卡片顯示轉折吻合、最佳時間差、方向一致率與綜合貼合度');
  ok(/三年移動平均/.test(turnModes[1].textContent) && /同方向配對窗 ±2 年/.test(turnModes[1].textContent) && /±1 年視為同期/.test(turnModes[1].textContent), '流年卡明示平滑、配對窗與同期容許值');
  const turnSnapshotActual = win.__hebingDiagnostics.buildTurningSnapshot();
  ok(turnSnapshotActual && turnSnapshotActual.version === 'turning-leadlag/v1' && turnSnapshotActual.daen.rows.length > 0 && turnSnapshotActual.year.rows.length > 0, '溫韻華命例產生大限／流年太乙轉折明細');
  ok(turnSnapshotActual && turnSnapshotActual.daen.comparison === 'hebing' && turnSnapshotActual.year.comparison === 'hebing' && turnSnapshotActual.daen.pairs.hebing && !turnSnapshotActual.daen.pairs.bazi, '轉折快照只含 hebing 配對（v0.9.35）');
  ok([...turnCard.querySelectorAll('.turn-table tbody tr')].every(tr => /轉強|轉弱|未辨識/.test(tr.textContent)), '轉折明細逐筆標示轉強／轉弱與兩法配對');

  // 太乙錨定可信區：大限斜率主判、流年未來位置主判；方向／位置／轉折分級，兩層級上下各最多 6 組。
  const syncCard = doc.getElementById('syncCard');
  ok(syncCard.style.display !== 'none' && /太乙錨定可信區段/.test(syncCard.textContent), '太乙錨定可信區段卡顯示');
  const syncModes = [...doc.querySelectorAll('#syncGrid .sync-mode')];
  ok(syncModes.length === 2 && /大限運勢/.test(syncModes[0].textContent) && /連續流年形成的中期運勢帶/.test(syncModes[1].textContent), '提醒卡同時列出大限與連續流年中期運勢帶');
  if (syncModes.length === 2) {
    const daUp = syncModes[0].querySelectorAll('.sync-col.up li').length;
    const daDown = syncModes[0].querySelectorAll('.sync-col.down li').length;
    const yrUp = syncModes[1].querySelectorAll('.sync-col.up li').length;
    const yrDown = syncModes[1].querySelectorAll('.sync-col.down li').length;
    ok(/運勢上升強旺期（大限/.test(syncModes[0].textContent) && /運勢走弱低潮期（大限/.test(syncModes[0].textContent) && /逐步往上/.test(syncModes[0].textContent) && /逐步走弱/.test(syncModes[0].textContent),
       '大限上下區段以白話顯示強旺期／低潮期及解讀');
    ok(/連續流年形成的強旺帶/.test(syncModes[1].textContent) && /連續流年形成的低潮帶/.test(syncModes[1].textContent) && /較有利/.test(syncModes[1].textContent) && /較需保守/.test(syncModes[1].textContent),
       '流年上下區段顯示連續流年形成的強旺帶／低潮帶及解讀');
    ok(daUp <= 6 && daDown <= 6, '大限可信／風險區段各不超過 6 組（上 '+daUp+'／下 '+daDown+'）');
    ok(yrUp <= 6 && yrDown <= 6, '流年未來可信／風險區段各不超過 6 組（上 '+yrUp+'／下 '+yrDown+'）');
    [...syncModes].forEach((modeEl,modeIndex) => {
      ['up','down'].forEach(kind => {
        const years=[...modeEl.querySelectorAll('.sync-col.'+kind+' li')].map(li => {
          const m=li.textContent.match(/西元 (\d{4})/); return m ? +m[1] : null;
        }).filter(Number.isFinite);
        ok(years.every((year,i) => i === 0 || years[i-1] <= year),
           (modeIndex===0?'大限':'流年')+(kind==='up'?'強旺':'低潮')+'區段依年齡由小到大排列');
      });
    });
    const items = [...doc.querySelectorAll('#syncGrid li')];
    ok(items.length > 0 && items.every(li => /西元/.test(li.textContent) && /約實歲/.test(li.textContent) && /虛歲/.test(li.textContent)), '每組提醒皆標示西元、約實歲與虛歲');
    ok(items.every(li => /A 強共識|B 雙法支持|C 部分支持|衝突區/.test(li.textContent) && /可信度 \d+%/.test(li.textContent)), '每組均標示 A／B／C／衝突等級與可信度比例');
    ok(items.every(li => !/八字 \d+（向|紫微 \d+（向|支持：|斜率主判|位置主判|位置補判/.test(li.textContent)),
       '畫面區段隱藏八字／紫微細項、支持線與判定來源，只保留可信度比例');
    const daDownText = [...syncModes[0].querySelectorAll('.sync-col.down li')].map(li => li.textContent).join(' ');
    ok(/西元 1994–2008/.test(daDownText) && /西元 2013–2017/.test(daDownText),
       '溫韻華命例仍抓出原太乙下行連續區段');
    const daUpText = [...syncModes[0].querySelectorAll('.sync-col.up li')].map(li => li.textContent).join(' ');
    ok(/A 強共識.*西元 1988–1993/.test(daUpText) && !/B 雙法支持/.test(daUpText+daDownText),
       '溫韻華 1988–1993 列為太乙上行 A 強共識（八字＋紫微單一佐證線，無 B 級）');
    const anchorSnap = win.__hebingDiagnostics.buildSyncSnapshot();
    const wenUp = anchorSnap.daen.up.find(b => b.y0 === 2044 && b.y1 === 2052);
    ok(wenUp && wenUp.pairs.hebing && typeof wenUp.pairs.hebing.score === 'number' && !wenUp.pairs.bazi,
       '畫面雖精簡，JSON／診斷快照仍保留八字＋紫微支持分（pairs.hebing），不再有 pairs.bazi');
    const nowYear = new win.Date().getFullYear();
    const yrItems = [...syncModes[1].querySelectorAll('.sync-col li')];
    ok(yrItems.every(li => { const m=li.textContent.match(/西元 (\d{4})/); return m && +m[1] >= nowYear; }),
       '流年提醒只列今年起的未來區段（起始年皆 ≥ '+nowYear+'）');
    const extremaBox = syncModes[1].querySelector('.annual-extrema');
    const peakRows = extremaBox ? [...extremaBox.querySelectorAll('.annual-extrema-col:first-child .annual-extrema-row')] : [];
    const troughRows = extremaBox ? [...extremaBox.querySelectorAll('.annual-extrema-col:last-child .annual-extrema-row')] : [];
    ok(extremaBox && /太乙流年高低點 ±1 年呼應/.test(extremaBox.textContent) && /共同年份/.test(extremaBox.textContent) && /平台只算 1 個點/.test(extremaBox.textContent),
       '流年區顯示太乙高低點 ±1 年呼應，並明示共同範圍及平台去重');
    ok(peakRows.length > 0 && peakRows.length <= 6 && troughRows.length > 0 && troughRows.length <= 6,
       '太乙局部高點／低點各列最多 6 組（高 '+peakRows.length+'／低 '+troughRows.length+'）');
    ok(peakRows.concat(troughRows).every(row => /西元/.test(row.textContent) && /實歲/.test(row.textContent) && /虛歲/.test(row.textContent)),
       '每個太乙高低點皆標示年份、實歲與虛歲');
    const extremaActual = win.__hebingDiagnostics.buildAnnualExtremaSnapshot();
    const actualRows = extremaActual ? extremaActual.peaks.concat(extremaActual.troughs) : [];
    ok(extremaActual && extremaActual.version === 'annual-extrema-echo/v6-hebing' && extremaActual.matchWindow === 1 && extremaActual.limit === 6 &&
       extremaActual.displayRule === 'at-least-one-qualified-support-match' &&
       extremaActual.positionThreshold.peak === .1 && extremaActual.positionThreshold.trough === -.1 && actualRows.length === peakRows.length + troughRows.length,
       '高低點診斷快照使用 ±1 年規則（v6 單一佐證線），筆數與畫面一致');
    ok(actualRows.every(row => !row.hebing || Math.abs(row.hebing.lag) <= 1),
       '八字＋紫微的所有命中年份皆落在太乙點前後 1 年內');
    ok(actualRows.every(row => row.hebing && !row.bazi && !row.ziwei),
       '只保留八字＋紫微有呼應的太乙點；快照不再有 bazi／ziwei 欄位（v0.9.35）');
    const extremaDomRows=peakRows.concat(troughRows);
    ok(extremaDomRows.every(el => el.querySelectorAll('.annual-extrema-method').length === 1 && /^八字＋紫微 /.test(el.querySelector('.annual-extrema-method').textContent.trim())),
       '每個太乙點只有一列「八字＋紫微」呼應資訊');
    ok(!/皆有呼應|無同類高點|無同類低點|兩法/.test(extremaBox.textContent),
       '畫面移除呼應總結及未命中方法的說明文字');
    const peakYears=extremaActual.peaks.map(row => row.year),troughYears=extremaActual.troughs.map(row => row.year);
    ok(peakYears.every((year,i) => i === 0 || peakYears[i-1] <= year) &&
       troughYears.every((year,i) => i === 0 || troughYears[i-1] <= year),
       '入選的太乙高點與低點皆依年份／年齡由小到大排列');
    ok(actualRows.every(row => extremaActual.peaks.includes(row) ? row.hebing.value > .1 : row.hebing.value < -.1),
       '佐證線高點皆在 +0.1 以上，低點皆在 −0.1 以下');
    ok(extremaActual.specialYearRule === 'taiyi-engine-virtual-age-overlap-on-source-and-matched-support-years' &&
       extremaActual.specialYears.luMaThreeWay.includes(62) && extremaActual.specialYears.luMaTwoWay.includes(48) &&
       extremaActual.specialYears.luZhuAndFeiLu.includes(49) && extremaActual.specialYears.luZhuAndFeiMa.includes(46),
       '高低點快照直接帶入太乙引擎的祿馬交馳、祿主＋飛祿與祿主＋飛馬歲數');
    const specialChips=[...extremaBox.querySelectorAll('.extrema-signal')].map(el => el.textContent.trim());
    ok(specialChips.every(text => text === '祿馬交馳' || text === '祿主飛祿'),
       '畫面特殊年份只使用「祿馬交馳／祿主飛祿」兩種簡短標籤');
    ok([...extremaBox.querySelectorAll('.extrema-signal')].every(el =>
       !/太乙|八字|紫微|虛歲|事業財富|三合|雙合|開拓升遷/.test(el.textContent)),
       '標籤正文移除命法、歲數、三合／雙合及長描述，完整資訊只留在提示與 JSON');
  }

  // 獨立規則測試（v0.9.35 兩線）：數值即使仍為正，只要太乙與八字＋紫微同為負斜率就成立；太乙轉上即不成立。
  const syntheticDown = win.__hebingDiagnostics.slopeOverlapBands('daen', [
    { id:'wuxing-line', pts:[{x:2000,v:.8},{x:2002,v:.4},{x:2004,v:.2},{x:2005,v:0}] },
    { id:'taiyi-xianli', pts:[{x:2000,v:.9},{x:2004,v:.5},{x:2005,v:.8}] }
  ], 'lo');
  ok(syntheticDown.length === 1 && syntheticDown[0].y0 === 2000 && syntheticDown[0].y1 === 2004,
     '曲線仍在中線上方也能依負斜率成立；太乙轉上時即使八字＋紫微向下也不成立');
  ok(syntheticDown[0] && syntheticDown[0].companions.join('、') === '八字＋紫微',
     '下行區段搭配線標記為八字＋紫微');
  ok(syntheticDown[0] && syntheticDown[0].strength > 0 && syntheticDown[0].slopeStrength > 0 && syntheticDown[0].trendStart === 2000 && syntheticDown[0].trendEnd === 2004,
     '下行資料保留共同下降總幅度、平均斜率與精確趨勢起訖');
  const syntheticSnapshot = win.__hebingDiagnostics.syncSnapshotRows(syntheticDown, 1980);
  ok(syntheticSnapshot[0] && syntheticSnapshot[0].companions.length === 1,
     '同步區段快照保留太乙搭配線 companions');
  const syntheticUp = win.__hebingDiagnostics.slopeOverlapBands('daen', [
    { id:'wuxing-line', pts:[{x:2000,v:.1},{x:2004,v:.5}] },
    { id:'taiyi-xianli', pts:[{x:2000,v:.3},{x:2004,v:.7}] }
  ], 'hi');
  ok(syntheticUp.length === 1 && syntheticUp[0].kind === 'hi' && syntheticUp[0].basis === 'slope',
     '大限兩線皆為正斜率時形成同步往上區段');

  const syntheticFallbackUp = win.__hebingDiagnostics.daenPositionFallbackBands([
    { id:'wuxing-line', pts:[{x:2000,v:.8},{x:2004,v:.4}] },
    { id:'taiyi-xianli', pts:[{x:2000,v:.5},{x:2004,v:.9}] }
  ], 'hi');
  ok(syntheticFallbackUp.length === 1 && syntheticFallbackUp[0].basis === 'position-fallback' && syntheticFallbackUp[0].nearSlopeCount === 1,
     '大限上升只有太乙上行時，兩線位置皆高可列為位置補判');
  const syntheticFallbackDown = win.__hebingDiagnostics.daenPositionFallbackBands([
    { id:'wuxing-line', pts:[{x:2000,v:-.8},{x:2004,v:-.6}] },
    { id:'taiyi-xianli', pts:[{x:2000,v:-.5},{x:2004,v:-.9}] }
  ], 'lo');
  ok(syntheticFallbackDown.length === 1 && syntheticFallbackDown[0].basis === 'position-fallback' && syntheticFallbackDown[0].companions.includes('八字＋紫微'),
     '大限下降斜率未符時，太乙與八字＋紫微同在低檔可列為位置補判');

  // 流年位置測試：負值即使逐年回升，仍屬同一個下方區段；過去年份須排除。
  const syntheticFuture = win.__hebingDiagnostics.futurePositionBands('year', [
    { id:'wuxing-year', pts:[{x:2029,v:-.8},{x:2030,v:-.7},{x:2031,v:-.6},{x:2032,v:-.5},{x:2033,v:-.4}] },
    { id:'taiyi-xingnian', pts:[{x:2029,v:-.9},{x:2030,v:-.8},{x:2031,v:-.7},{x:2032,v:-.6},{x:2033,v:-.5}] }
  ], 2030);
  ok(syntheticFuture.length === 1 && syntheticFuture[0].kind === 'lo' && syntheticFuture[0].y0 === 2030 && syntheticFuture[0].y1 === 2033,
     '流年依位置把連續下方年份合併成一組，不拆成多個單年點，並排除未來起點之前');

  // 太乙錨定分級（v0.9.35 單一佐證線）：A／C／衝突門檻，以及流年連續至少兩年。
  const grade = win.__hebingDiagnostics.anchorBandGrade;
  ok(grade({score:80,opposition:0}) === 'A' &&
     grade({score:75,opposition:40}) === 'C' &&
     grade({score:55,opposition:10}) === 'C' &&
     grade({score:20,opposition:50}) === 'conflict' &&
     grade({score:20,opposition:10}) === null,
     '太乙錨定 A／C／衝突分級門檻成立（無 B 級）');
  const anchorSynthetic = win.__hebingDiagnostics.buildAnchoredBands('year', [
    {id:'wuxing-year',pts:[{x:2029,v:.4},{x:2030,v:.5},{x:2031,v:.6},{x:2032,v:.7},{x:2033,v:.8}]},
    {id:'taiyi-xingnian',pts:[{x:2029,v:.5},{x:2030,v:.6},{x:2031,v:.7},{x:2032,v:.8},{x:2033,v:.9}]}
  ],2030);
  ok(anchorSynthetic.length === 1 && anchorSynthetic[0].y0 === 2030 && anchorSynthetic[0].y1 === 2033 && anchorSynthetic[0].grade === 'A' &&
     anchorSynthetic[0].pairs.hebing.score >= 70 && !anchorSynthetic[0].pairs.bazi,
     '流年太乙高檔連續區合併，八字＋紫微完整支持時列 A 級');
  const rankedThenChronological=win.__hebingDiagnostics.pickAnchoredBands([
    {kind:'up',grade:'C',confidence:99,y0:1990,y1:1995},
    {kind:'up',grade:'A',confidence:80,y0:2030,y1:2035},
    {kind:'up',grade:'A',confidence:90,y0:2010,y1:2015}
  ],'up',2);
  ok(rankedThenChronological.length === 2 && rankedThenChronological[0].y0 === 2010 && rankedThenChronological[1].y0 === 2030,
     '同步區段先依等級／可信度選出名單，再依年齡排序，不讓較早但低等級區段取代入選者');

  // 流年高低點規則：同值平台只算一點，同類極值前後 1 年可呼應，超過不成立。
  const plateauSeries={id:'t',pts:[
    {x:2000,v:0},{x:2001,v:1},{x:2002,v:1},{x:2003,v:0},
    {x:2004,v:-1},{x:2005,v:-1},{x:2006,v:0}
  ]};
  const plateauPeaks=win.__hebingDiagnostics.localExtremaPoints(plateauSeries,'peak',2000,2006);
  const plateauTroughs=win.__hebingDiagnostics.localExtremaPoints(plateauSeries,'trough',2000,2006);
  ok(plateauPeaks.length === 1 && plateauPeaks[0].plateauStart === 2001 && plateauPeaks[0].plateauEnd === 2002 &&
     plateauTroughs.length === 1 && plateauTroughs[0].plateauStart === 2004 && plateauTroughs[0].plateauEnd === 2005,
     '連續同值高原／低谷各合併為一個局部極值，不重複占用名額');
  const echo1=win.__hebingDiagnostics.matchLocalExtreme(
    {year:2001,plateauStart:2001,plateauEnd:2001},
    [{year:2002,value:1,plateauStart:2002,plateauEnd:2002}],1,'peak');
  const echo2=win.__hebingDiagnostics.matchLocalExtreme(
    {year:2001,plateauStart:2001,plateauEnd:2001},
    [{year:2003,value:1,plateauStart:2003,plateauEnd:2003}],1,'peak');
  ok(echo1 && echo1.lag === 1 && echo2 === null, '同類高低點差 1 年成立，差 2 年不成立');
  const lowRebound=win.__hebingDiagnostics.matchLocalExtreme(
    {year:2001,plateauStart:2001,plateauEnd:2001},
    [{year:2001,value:-.05,plateauStart:2001,plateauEnd:2001}],2,'peak');
  const highPullback=win.__hebingDiagnostics.matchLocalExtreme(
    {year:2001,plateauStart:2001,plateauEnd:2001},
    [{year:2001,value:.05,plateauStart:2001,plateauEnd:2001}],2,'trough');
  ok(lowRebound === null && highPullback === null,
     '低檔局部反彈不算高點、高檔局部回落不算低點');
  const syntheticSignals=win.__hebingDiagnostics.taiyiSpecialSignalsForSpan({
    luMaTwoWay:[20],luZhuAndFeiLu:[21],luZhuAndFeiMa:[18]
  },1999,2000,1980);
  ok(syntheticSignals.some(s => s.key === 'luMaTwoWay' && s.year === 1999 && s.age === 20) &&
     syntheticSignals.some(s => s.key === 'luZhuAndFeiLu' && s.year === 2000 && s.age === 21) &&
     !syntheticSignals.some(s => s.key === 'luZhuAndFeiMa'),
     '特殊年份依虛歲換算西元年，並只標記落在太乙點或配對平台內的訊號');

  // 轉折規則：有效幅度、同方向一對一配對，以及最佳時間差正負號。
  const syntheticTurns = win.__hebingDiagnostics.turningPoints({id:'t',pts:[
    {x:2000,v:0},{x:2010,v:.6},{x:2020,v:0},{x:2030,v:.7}
  ]},'daen');
  ok(syntheticTurns.length === 2 && syntheticTurns[0].year === 2010 && syntheticTurns[0].type === 'down' && syntheticTurns[1].year === 2020 && syntheticTurns[1].type === 'up',
     '大限轉折以有效節點辨識 2010 轉弱與 2020 轉強');
  const syntheticMatch = win.__hebingDiagnostics.matchTurningPoints([
    {year:2000,type:'up'},{year:2010,type:'down'},{year:2020,type:'up'}
  ],[
    {year:2002,type:'up'},{year:2009,type:'down'}
  ],2);
  ok(syntheticMatch.matched === 2 && syntheticMatch.lead === 1 && syntheticMatch.same === 1 && syntheticMatch.matchRate === 67 && syntheticMatch.matches[2].relation === 'none',
     '太乙同方向轉折採一對一配對：領先 1、同期 1、未配對 1');
  const shiftedTaiyi={id:'taiyi-xianli',label:'太乙',pts:[{x:2000,v:0},{x:2010,v:1},{x:2020,v:0},{x:2030,v:-1}]};
  const shiftedOther={id:'bazi',label:'八字',pts:shiftedTaiyi.pts.map(p=>({x:p.x+2,v:p.v}))};
  const shiftedPair=win.__hebingDiagnostics.turningPairAnalysis(shiftedTaiyi,shiftedOther,'daen',
    [{year:2010,type:'down'},{year:2020,type:'down'}],[{year:2012,type:'down'},{year:2022,type:'down'}]);
  ok(shiftedPair.bestLag === 2 && shiftedPair.bestR > .99, '最佳時間差相關正確辨識太乙領先 2 年');

  // 明細
  const hit = [...doc.querySelectorAll('.ov-hit')].find(r => r.getAttribute('data-yr') === '2026');
  ok(!!hit, '2026 年點擊層存在');
  if (hit) {
    hit.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
    const det = doc.getElementById('ovDetail').textContent;
    ok(/西元 2026/.test(det) && /紫微大限｜/.test(det) && /紫微流年｜/.test(det) && /八字大運｜/.test(det), '明細三讀數並列');
    ok(/虛歲 51/.test(det), '虛歲換算正確');
  }

  // 層級切換：大限合盤 → 流年合盤
  doc.getElementById('ovZiweiMode').value = 'year';
  doc.getElementById('ovZiweiMode').onchange();
  await sleep(100);
  svg = doc.getElementById('ovChart').innerHTML;
  ok(countPoly(svg) === 4, '流年合盤（全開）：八字流年＋紫微逐年＋八字＋紫微流年曲線＋太乙行年 四條 polyline（實得 ' + countPoly(svg) + '）');
  ok(/#46708a/.test(svg) && !/#7d5a44/.test(svg), '行年藍線進場、限例棕線退場（level 過濾生效）');
  ok(/太乙行年趨勢（虛歲逐歲/.test(doc.getElementById('ovLegend').textContent)
     && !/限例太乙（十二宮歲段/.test(doc.getElementById('ovLegend').textContent), '圖例隨層級切換太乙線說明');
  const resoTxtY = doc.getElementById('resoGrid').textContent;
  ok(!/八字流年 × 紫微逐年能量/.test(resoTxtY), '共振卡不再顯示 八字流年 × 紫微逐年（v0.9.35）');
  ok(/八字＋紫微（五行主線・流年） × 太乙行年趨勢/.test(resoTxtY) && (resoTxtY.match(/同向率/g) || []).length === 1, '流年共振卡只顯示核心配對：八字＋紫微流年 × 太乙行年');
  // 流年合盤明細：同年並列八字流年讀數
  const hitY = [...doc.querySelectorAll('.ov-hit')].find(r => r.getAttribute('data-yr') === '2026');
  if (hitY) hitY.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  const detY = doc.getElementById('ovDetail').textContent;
  ok(/八字流年｜丙午年/.test(detY), '明細含八字流年讀數（2026 丙午）');
  ok(/v2 綜合分/.test(detY) && /所處大運/.test(detY) && /流年分項/.test(detY), '八字流年明細含 v2 總分、大運半分背景與逐項分解');
  ok(/太乙行年趨勢｜原始分/.test(detY), '明細含太乙行年讀數');
  // v0.9.29 曆書延至 2100：2060 不再是超界年，明細應有八字流年讀數（庚辰）而非截斷說明
  const hit60 = [...doc.querySelectorAll('.ov-hit')].find(r => r.getAttribute('data-yr') === '2060');
  if (hit60) hit60.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  const det60 = doc.getElementById('ovDetail').textContent;
  ok(/八字流年｜庚辰年/.test(det60) && !/超出節氣資料範圍/.test(det60), '2060 年明細含八字流年讀數（曆書已延至 2100，不再截斷）');
  doc.getElementById('ovZiweiMode').value = 'daen';
  doc.getElementById('ovZiweiMode').onchange();
  await sleep(100);

  // 擴充契約回歸：無 level 標記的合成序列應在兩層級皆顯示（backward compatible）
  console.log('== 擴充契約 ext-curve（無層級標記，合成資料）==');
  const synth = [];
  for (let y = 1980, i = 0; y <= 2090; y += 10, i++) synth.push({ year: y, value: Math.round(Math.sin(i / 2) * 40) });
  win.postMessage({ xl: 'xl-merge-bridge', from: 'synth', type: 'ext-curve', ok: true,
    data: { series: [{ id: 'synth-x', label: '合成序列', color: '#888888', points: synth }] } }, '*');
  await sleep(300);
  svg = doc.getElementById('ovChart').innerHTML;
  ok(countPoly(svg) === 5, '無層級合成序列於大限層顯示：4 條＋五行主線曲線＝5 條（實得 ' + countPoly(svg) + '）');
  doc.getElementById('ovZiweiMode').value = 'year';
  doc.getElementById('ovZiweiMode').onchange();
  await sleep(100);
  ok(countPoly(doc.getElementById('ovChart').innerHTML) === 5, '無層級合成序列於流年層亦顯示：4 條＋八字＋紫微流年曲線＝5 條');
  doc.getElementById('ovZiweiMode').value = 'daen';
  doc.getElementById('ovZiweiMode').onchange();
  await sleep(100);
  const pairN = ((doc.getElementById('resoGrid').textContent).match(/同向率/g) || []).length;
  ok(pairN === 1, '共振卡只顯示核心配對 1 組（其餘配對仍在存檔 resonance.pairs）（實得 ' + pairN + '）');

  console.log('== 存檔／讀取／輸出圖檔 ==');
  // 存檔：攔 Blob 內容驗契約
  let savedJson = null;
  const OrigBlob = win.Blob;
  win.Blob = function (parts, opts) {
    const b = new OrigBlob(parts, opts);
    if (opts && opts.type === 'application/json') savedJson = parts.join('');
    b.__parts = parts; return b;
  };
  ok(!doc.getElementById('f-save').disabled, '排盤後存檔按鈕已解鎖');
  doc.getElementById('f-save').click();
  await sleep(100);
  ok(!!savedJson, '存檔產生 JSON');
  let saveObj = null;
  try { saveObj = JSON.parse(savedJson); } catch (e) {}
  ok(!!saveObj && saveObj.schema === 'xiaoliu.hebing-save/v3', '契約 schema 升為 v3');
  /* v0.9.30 五行主線：v3 新欄位齊備 */
  const zd0 = saveObj && saveObj.curves && saveObj.curves.ziwei && saveObj.curves.ziwei.daen;
  ok(Array.isArray(zd0) && zd0.length === 12 && zd0.every(d => d.zhiElement && Array.isArray(d.stars) && d.hua), '存檔 daen[] 含 zhiElement／stars／hua（v3）');
  ok(!!(saveObj.curves.ziwei.palaces && saveObj.curves.ziwei.palaces.length === 12), '存檔 ziwei.palaces 十二宮（v3）');
  ok(!!(saveObj.curves.bazi && saveObj.curves.bazi.dayMaster && saveObj.curves.bazi.dayMaster.gan === '己'), '存檔 bazi.dayMaster 為己（v3）');
  const wei = zd0 && zd0.find(d => d.zhi === '未'), wu = zd0 && zd0.find(d => d.zhi === '午');
  ok(!!(wei && wei.stars[0] && wei.stars[0].name === '天機' && wei.stars[0].daHua === '祿'), '未宮主星天機化祿');
  ok(!!(wu && wu.stars[0] && wu.stars[0].name === '破軍' && wu.stars[0].daHua === '權'), '午宮主星破軍化權');
  const wxRows = dom.window.document.querySelectorAll('#wuxingGrid .wx-block');
  ok(wxRows.length === 12, '推象七層卡列出十二大限（實得 ' + wxRows.length + '）');
  const wxTxt = dom.window.document.querySelector('#wuxingGrid').textContent;
  ok(/巳為帝旺/.test(wxTxt) && /午為臨官（祿）/.test(wxTxt), '十二長生位：己在巳帝旺、午臨官（祿）');
  ok(/辛卯運：辛金我生（食傷・喜・洩口）/.test(wxTxt), '大運兩面：辛金標為洩口');
  ok(/出口在外（宜）/.test(wxTxt), '對宮規則：出口在外標籤出現');
  ok(/題目 遷移＝外・出門/.test(wxTxt), '宮名題目層顯示');
  ok(/求學（虛歲 13–22）：財＝零用錢/.test(wxTxt) && /初入職場（虛歲 23–32）：財＝薪水/.test(wxTxt), '年齡段貨幣換算顯示（求學／初入職場）');
  ok(/被管得財/.test(dom.window.document.querySelector('#wuxingGrid').textContent), '五行主線判詞含已回測格「被管得財」');
  /* v0.9.31 五行主線曲線 */
  const wl = saveObj.resonance && saveObj.resonance.pairs && saveObj.resonance.pairs.filter(p => p.a === '八字＋紫微（五行主線）' || p.b === '八字＋紫微（五行主線）');
  ok(!!(wl && wl.length >= 3), '共振 pairs 含五行主線曲線 × 其餘各線（實得 ' + (wl ? wl.length : 0) + '）');
  const wxT = wl && wl.find(p => p.a === '限例太乙' || p.b === '限例太乙');
  ok(!!(wxT && wxT.sameRate !== null), '五行主線曲線 × 限例太乙 有方向一致率（' + (wxT ? wxT.sameRate + '%' : '—') + '）');
  ok(!!dom.window.document.querySelector('#ovChart polyline[stroke-dasharray="6 4"]'), '曲線圖畫出五行主線虛線');
  ok(/五行主線曲線（假說級）/.test(dom.window.document.querySelector('#wuxingGrid').textContent), '五行主線卡顯示曲線說明與配對統計');
  ok(saveObj && saveObj.input.y === 1976 && saveObj.input.h === 11 && saveObj.input.gender === 'F', '存檔輸入欄位正確');
  ok(saveObj && saveObj.curves.bazi && saveObj.curves.bazi.pillars.length === 10, '存檔含八字曲線資料');
  ok(saveObj && saveObj.curves.bazi.specialScoring &&
     saveObj.curves.bazi.specialScoring.version === 'special-pattern-element-weight/v1' &&
     saveObj.curves.bazi.pillars.every(p=>p.specialScoring && p.specialScoring.multiplier===saveObj.curves.bazi.specialScoring.multiplier) &&
     saveObj.curves.bazi.annual.every(a=>a.specialScoring && a.specialScoring.multiplier===saveObj.curves.bazi.specialScoring.multiplier),
    '存檔含特殊格干支喜忌加權版本，並與大運／流年各點一致');
  ok(saveObj && saveObj.curves.bazi.strength && saveObj.curves.bazi.yongShen &&
     saveObj.curves.bazi.strength.baseScore && saveObj.curves.bazi.strength.congGe &&
     /^(正格|疑似從格|明確從格)$/.test(saveObj.curves.bazi.strength.congGe.status) &&
     saveObj.curves.bazi.strength.zhuanWang && saveObj.curves.bazi.strength.huaQi &&
     saveObj.curves.bazi.strength.monthPattern && saveObj.curves.bazi.strength.regularMonthPattern &&
     Array.isArray(saveObj.curves.bazi.strength.classicalOuterPatterns) && saveObj.curves.bazi.strength.specialPatternDecision &&
     Array.isArray(saveObj.curves.bazi.yongShen.favorable) && Array.isArray(saveObj.curves.bazi.yongShen.alternatives) && saveObj.curves.bazi.yongShen.decision,
    '存檔含八字旺衰、特殊格局、月令八格成敗救應、古法外格標籤與喜用神依據');
  ok(saveObj && saveObj.curves.bazi.annual && saveObj.curves.bazi.annual.every(a => Array.isArray(a.parts) && a.luckGz), '存檔含八字流年 v2 分項與大運背景');
  ok(saveObj && saveObj.curves.ziwei && saveObj.curves.ziwei.daen.length === 12, '存檔含紫微大限資料');
  ok(saveObj && saveObj.curves.ext.length === 3, '存檔含擴充序列（太乙限例＋行年＋合成，實得 ' + (saveObj ? saveObj.curves.ext.length : 0) + '）');
  const savedTaiyiAnnual=saveObj && saveObj.curves.ext.find(s => s.id === 'taiyi-xingnian');
  ok(savedTaiyiAnnual && savedTaiyiAnnual.specialYears && savedTaiyiAnnual.specialYears.luMaThreeWay.includes(62) &&
     savedTaiyiAnnual.specialYears.luZhuAndFeiLu.includes(49),
     '太乙行年曲線存檔保留引擎計算的祿馬交馳與科甲年份分類');
  ok(saveObj && saveObj.resonance && Array.isArray(saveObj.resonance.pairs), '存檔含共振快照');
  ok(saveObj && saveObj.resonance && saveObj.resonance.syncAlerts &&
     saveObj.resonance.syncAlerts.daen.up.length <= 6 && saveObj.resonance.syncAlerts.daen.down.length <= 6 &&
     saveObj.resonance.syncAlerts.year.up.length <= 6 && saveObj.resonance.syncAlerts.year.down.length <= 6,
     '存檔含大限／流年上下各最多 6 組的太乙錨定快照');
  const savedDown = saveObj && saveObj.resonance && saveObj.resonance.syncAlerts
    ? saveObj.resonance.syncAlerts.daen.down.concat(saveObj.resonance.syncAlerts.year.down) : [];
  ok(savedDown.every(b => ['A','C','conflict'].includes(b.grade) && Number.isFinite(b.confidence) && b.pairs && b.pairs.hebing && !b.pairs.bazi),
     '存檔每個區段保留可信等級、可信度及八字＋紫微證據（無 B 級、無 bazi／ziwei 欄位）');
  const syncSave = saveObj && saveObj.resonance && saveObj.resonance.syncAlerts;
  ok(syncSave && syncSave.version === 'taiyi-anchored-zones/v2-hebing' && syncSave.companion && syncSave.daenRule === 'taiyi-anchor-slope-primary' &&
     syncSave.yearRule === 'taiyi-anchor-future-position-primary-3y-smooth' && Number.isFinite(syncSave.futureFromYear) &&
     syncSave.weights.daen.direction === 40 && syncSave.weights.year.position === 50 &&
     syncSave.displayOrder === 'chronological-after-grade-confidence-selection',
     '存檔標明太乙錨定版本、大限斜率主判、流年位置主判與權重');
  ok(saveObj && saveObj.resonance.taiyiAnchoredZones && saveObj.resonance.taiyiAnchoredZones.version === 'taiyi-anchored-zones/v2-hebing',
     '存檔新增 taiyiAnchoredZones，並保留 syncAlerts 相容欄位');
  const savedDaen = syncSave ? syncSave.daen.up.concat(syncSave.daen.down) : [];
  ok(savedDaen.length > 0 && savedDaen.every(b => b.basis === 'slope' || b.basis === 'position-fallback') &&
     savedDaen.every(b => Array.isArray(b.supporters) && b.pairs.hebing.directionRate >= 0 && b.pairs.hebing.positionRate >= 0),
     '大限快照保留斜率／位置來源、支持線與方向／位置證據');
  ok(syncSave && syncSave.year.up.concat(syncSave.year.down).every(b => b.basis === 'position' && b.y0 >= syncSave.futureFromYear),
     '流年快照採 position basis，且只含今年起的未來區段');
  ok([syncSave.daen.up,syncSave.daen.down,syncSave.year.up,syncSave.year.down]
     .every(rows => rows.every((b,i) => i === 0 || rows[i-1].y0 <= b.y0)),
     '大限／流年強旺與低潮快照皆依起始年齡由小到大排列');
  const turnSave = saveObj && saveObj.resonance && saveObj.resonance.turningAnalysis;
  ok(turnSave && turnSave.version === 'turning-leadlag/v1' && turnSave.daen && turnSave.year,
     '存檔含大限／流年單盤轉折與領先／落後分析快照');
  ok(turnSave && turnSave.daen.comparison === 'hebing' &&
     [turnSave.daen.pairs.hebing,turnSave.year.pairs.hebing]
       .every(p => p && Number.isFinite(p.fitScore) && p.fitScore >= 0 && p.fitScore <= 100 && Array.isArray(p.match.matches)),
     '轉折快照保存比較結論、0–100 貼合度與逐筆配對');
  const extremaSave = saveObj && saveObj.resonance && saveObj.resonance.annualExtrema;
  const extremaSaveRows = extremaSave ? extremaSave.peaks.concat(extremaSave.troughs) : [];
  ok(extremaSave && extremaSave.version === 'annual-extrema-echo/v6-hebing' && extremaSave.matchWindow === 1 && extremaSave.limit === 6 &&
     extremaSave.peaks.length <= 6 && extremaSave.troughs.length <= 6,
     '存檔含太乙最高／最低各最多 6 點及 ±1 年呼應規則');
  ok(extremaSaveRows.every(r => Number.isFinite(r.realAge) && Number.isFinite(r.virtualAge) &&
     [r.hebing].every(m => !m || Math.abs(m.lag) <= 1)),
     '高低點存檔保留實歲／虛歲，所有八字＋紫微命中差值均在 ±1 年內');
  ok(extremaSaveRows.every(r => r.hebing),
     '高低點存檔只保留八字＋紫微有合格呼應的太乙點');
  ok([extremaSave.peaks,extremaSave.troughs].every(rows => rows.every((r,i) => i === 0 || rows[i-1].year <= r.year)),
     '高低點存檔依年份／年齡由小到大排列');
  ok(extremaSaveRows.every(r => Array.isArray(r.specialSignals) &&
     [r.bazi,r.ziwei].every(m => !m || Array.isArray(m.specialSignals))) &&
     extremaSaveRows.some(r => r.specialSignals.length || (r.hebing&&r.hebing.specialSignals.length)),
     '高低點存檔保留太乙本點與八字／紫微配對年的特殊年份標籤');
  win.Blob = OrigBlob;

  // 讀取：改造輸入為另一命例存檔，驗回填＋自動重算
  const altSave = JSON.parse(JSON.stringify(saveObj));
  altSave.input = { name: '讀檔乙', gender: 'M', y: 1988, m: 8, d: 8, h: 4, lateZi: false, leapRule: 'split15' };
  altSave.zmode = 'year';
  const loadInput = doc.getElementById('f-load-file');
  const fakeFile = new win.File([JSON.stringify(altSave)], 'hebing-test.json', { type: 'application/json' });
  Object.defineProperty(loadInput, 'files', { value: [fakeFile], configurable: true });
  loadInput.onchange({ target: loadInput });
  for (let i = 0; i < 100 && !/1988/.test(doc.getElementById('f-year').value); i++) await sleep(100);
  ok(doc.getElementById('f-year').value === '1988' && doc.getElementById('f-gender').value === 'M', '讀檔回填表單');
  ok(doc.getElementById('ovZiweiMode').value === 'year', '讀檔還原紫微模式');
  for (let i = 0; i < 100 && !/排盤完成/.test(doc.getElementById('f-status').textContent); i++) await sleep(100);
  ok(/排盤完成/.test(doc.getElementById('f-status').textContent), '讀檔後自動以引擎重算完成');
  const det88 = doc.getElementById('ovDetail');
  const hit88 = [...doc.querySelectorAll('.ov-hit')].find(r => r.getAttribute('data-yr') === '2000');
  if (hit88) { hit88.dispatchEvent(new win.MouseEvent('click', { bubbles: true })); }
  ok(/虛歲 13/.test(det88.textContent), '重算後命盤已切換為讀檔命例（1988→2000 虛歲 13）');

  // 讀檔防呆：錯誤 schema
  const badFile = new win.File(['{"schema":"other/v9"}'], 'bad.json', { type: 'application/json' });
  Object.defineProperty(loadInput, 'files', { value: [badFile], configurable: true });
  loadInput.onchange({ target: loadInput });
  await sleep(300);
  ok(/schema 不符/.test(doc.getElementById('f-status').textContent), '錯誤 schema 被擋下');

  // 輸出 SVG
  win.__downloads.length = 0;
  let svgBlobText = null;
  win.Blob = function (parts, opts) {
    const b = new OrigBlob(parts, opts);
    if (opts && opts.type === 'image/svg+xml') svgBlobText = parts.join('');
    return b;
  };
  doc.getElementById('ovSvg').onclick();
  await sleep(100);
  ok(!!svgBlobText && /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svgBlobText), 'SVG 輸出含 xmlns（可獨立開檔）');
  ok(/fill="#f7f1e4"/.test(svgBlobText), 'SVG 輸出鋪宣紙底色');
  ok(/font-family/.test(svgBlobText), 'SVG 輸出帶字體設定');
  // PNG 標題正名驗證（exportTitle 在閉包內不可 eval，改驗源碼字串）
  const srcHtml = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf-8');
  ok(/八字 × 紫微 × 太乙 合盤　·　'\+nowStamp/.test(srcHtml), 'PNG 輸出標題（exportTitle）含三法字樣');
  ok(!/八字×紫微合盤/.test(srcHtml), '舊雙法標題字樣已清除');
  win.Blob = OrigBlob;

  // 輸出 PNG（node-canvas 光柵化）
  win.__downloads.length = 0;
  let pngBlob = null;
  const origToBlob = win.HTMLCanvasElement.prototype.toBlob;
  win.HTMLCanvasElement.prototype.toBlob = function (cb, type) {
    origToBlob.call(this, (b) => { pngBlob = b; cb(b); }, type);
  };
  doc.getElementById('ovPng').onclick();
  for (let i = 0; i < 60 && !pngBlob && !/PNG 產生失敗/.test(doc.getElementById('f-status').textContent); i++) await sleep(100);
  if (pngBlob) {
    const buf = Buffer.from(await pngBlob.arrayBuffer());
    ok(buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50, 'PNG 輸出為有效 PNG 檔頭（' + buf.length + ' bytes）');
  } else {
    console.log('  ⚠ PNG 光柵化在 jsdom 未完成（img 載入路徑限制），退回訊息機制：' + doc.getElementById('f-status').textContent.slice(0, 60));
    let canvasAvailable = false;
    try { canvasAvailable = !!doc.createElement('canvas').getContext('2d'); } catch (e) {}
    ok(/PNG 產生失敗/.test(doc.getElementById('f-status').textContent) || !canvasAvailable,
      canvasAvailable ? 'PNG 失敗時有明確退路提示' : 'jsdom 無 canvas，PNG 保留真瀏覽器人工驗證');
  }
  win.HTMLCanvasElement.prototype.toBlob = origToBlob;

  // 輸出 5 頁曲線 PDF（不含轉折分析；新增太乙流年高低點 ±1 年呼應頁）
  for (let i = 0; i < 100 && doc.getElementById('ovPdf').disabled; i++) await sleep(100);
  const oldImage = win.Image;
  const oldGetContext = win.HTMLCanvasElement.prototype.getContext;
  const oldToDataURL = win.HTMLCanvasElement.prototype.toDataURL;
  const oldJspdf = win.jspdf;
  const fakeDrawnText = [];
  const fakeCtx = {
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textBaseline: 'top', textAlign: 'left',
    beginPath(){}, moveTo(){}, lineTo(){}, quadraticCurveTo(){}, closePath(){}, fill(){}, stroke(){},
    fillRect(){}, strokeRect(){}, fillText(s){ fakeDrawnText.push(String(s)); }, drawImage(){}, arc(){},
    measureText(s){ return { width: String(s).length * 18 }; }
  };
  win.HTMLCanvasElement.prototype.getContext = function(){ return fakeCtx; };
  win.HTMLCanvasElement.prototype.toDataURL = function(){ return 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='; };
  win.Image = function(){
    const img = {};
    Object.defineProperty(img, 'src', { set(){ setTimeout(() => { if (img.onload) img.onload(); }, 0); } });
    return img;
  };
  let fakePdf = null;
  function FakePdf(opts){ fakePdf = this; this.opts = opts; this.pages = 1; this.images = 0; this.saved = ''; }
  FakePdf.prototype.addPage = function(){ this.pages++; };
  FakePdf.prototype.addImage = function(){ this.images++; };
  FakePdf.prototype.setProperties = function(p){ this.properties = p; };
  FakePdf.prototype.save = function(name){ this.saved = name; };
  win.jspdf = { jsPDF: FakePdf };
  const modeBeforePdf = doc.getElementById('ovZiweiMode').value;
  const pdfResult = await doc.getElementById('ovPdf').onclick();
  ok(!!pdfResult && fakePdf && fakePdf.pages === 5 && fakePdf.images === 5, 'PDF 報告固定輸出 5 頁（兩張曲線＋兩層太乙錨定區＋高低點呼應）');
  ok(fakePdf && /^hebing-curve-report-.*\.pdf$/.test(fakePdf.saved), 'PDF 報告以命主與日期命名並呼叫儲存');
  ok(fakePdf && /大限曲線、流年曲線、太乙錨定可信區段與太乙流年高低點 ±1 年呼應/.test(fakePdf.properties.subject) && !/轉折/.test(fakePdf.properties.subject), 'PDF metadata 明示兩張曲線、太乙錨定區與高低點呼應');
  ok(pdfResult && pdfResult.annualExtrema && pdfResult.annualExtrema.version === 'annual-extrema-echo/v6-hebing' &&
     fakeDrawnText.some(t=>/太乙流年高低點 ±1 年呼應/.test(t)) &&
     fakeDrawnText.some(t=>/太乙最高 6 個局部高點/.test(t)) && fakeDrawnText.some(t=>/太乙最低 6 個局部低點/.test(t)),
     'PDF 第 5 頁使用 annual-extrema-echo/v6-hebing 快照並列出高低點雙欄');
  ok(fakeDrawnText.some(t=>/^八字＋紫微 /.test(t)) && !fakeDrawnText.some(t=>/^紫微 /.test(t)), 'PDF 高低點頁只繪出八字＋紫微呼應資料行');
  ok(doc.getElementById('ovZiweiMode').value === modeBeforePdf && doc.getElementById('ovPdf').textContent === '輸出曲線 PDF 報告', 'PDF 擷取完成後還原原合盤模式與按鈕文字');
  const srcPdfHtml = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf-8');
  ok(/太乙錨定可信區段｜/.test(srcPdfHtml) && /reportBandReading/.test(srcPdfHtml), 'PDF 原始碼包含太乙錨定區段逐組解讀內容');
  ok(/drawReportExtremaPage\(annualExtrema,5\)/.test(srcPdfHtml) && /reportExtremaSignalText/.test(srcPdfHtml), 'PDF 頁面編排加入太乙高低點 ±1 年呼應及精簡特殊年份標籤');
  ok(!/drawReportTurningPage\('daen',turning\.daen/.test(srcPdfHtml) && !/drawReportTurningPage\('year',turning\.year/.test(srcPdfHtml), 'PDF 頁面編排不再加入大限／流年轉折分析');
  ok(require('fs').statSync(require('path').join(__dirname, 'vendor/jspdf.umd.min.js')).size > 300000, 'jsPDF 元件已隨工具封裝，可離線使用');
  win.Image = oldImage;
  win.HTMLCanvasElement.prototype.getContext = oldGetContext;
  win.HTMLCanvasElement.prototype.toDataURL = oldToDataURL;
  win.jspdf = oldJspdf;

  console.log('== 破壞測試：年份超界 ==');
  fill(win, { name: 'x', gender: 'M', y: 1900, m: 1, d: 1, h: 0 });
  doc.getElementById('f-go').click();
  await sleep(200);
  ok(/1930–2100/.test(doc.getElementById('f-status').textContent), '超界年份顯示驗證訊息（1930–2100）');
  // 合法輸入按下排盤的瞬間，存檔鈕應立即回停用（硬化驗證）
  fill(win, { name: '測試甲', gender: 'F', y: 1976, m: 10, d: 14, h: 11 });
  doc.getElementById('f-go').click();
  ok(doc.getElementById('f-save').disabled === true && doc.getElementById('ovPdf').disabled === true, '重排啟動瞬間存檔與 PDF 報告鈕回停用');
  for (let i = 0; i < 100 && doc.getElementById('f-save').disabled; i++) await sleep(100);
  ok(!doc.getElementById('f-save').disabled, '重排完成後存檔鈕再啟用');

  console.log('== v0.9.28 可信度公式（純函式斷言）==');
  {
    /* v0.9.35 單一佐證線 */
    const conf = (grade,h) => grade==='conflict'?h.opposition:Math.max(0,h.score-h.opposition);
    // 上列公式須與 index.html 的 anchorBandConfidence 完全一致；下方以實跑快照交叉驗證。
    ok(conf('A',{score:80,opposition:10})===70, 'A 級可信度＝支持減反向（80/10 → 70）');
    ok(conf('C',{score:40,opposition:50})===0,  'C 級淨值為負時歸零，不得出現負可信度');
    ok(conf('conflict',{score:10,opposition:60})===60, '衝突區可信度＝反向分');
    const bandsAll = [syncSave.daen.up,syncSave.daen.down,syncSave.year.up,syncSave.year.down]
      .reduce((a,r)=>a.concat(r),[]);
    ok(bandsAll.length>0 && bandsAll.every(b=>b.confidence===conf(b.grade,b.pairs.hebing)),
      '實跑快照每一區段的可信度皆等於新公式重算值');
    ok(bandsAll.every(b=>b.confidence>=0 && b.confidence<=100), '可信度恆落在 0–100');
  }

  console.log('== v0.9.28 八字可靠度傳遞 ==');
  {
    const bandsAll = [syncSave.daen.up,syncSave.daen.down,syncSave.year.up,syncSave.year.down]
      .reduce((a,r)=>a.concat(r),[]);
    ok(bandsAll.every(b=>b.pairs.hebing.reliability!==undefined &&
        Number.isFinite(b.pairs.hebing.scoreRaw) && Number.isFinite(b.pairs.hebing.oppositionRaw)),
      '每個區段保留八字可靠度係數與折扣前原始分數（套在八字＋紫微線上）');
    ok(bandsAll.every(b=>b.pairs.hebing.score===Math.round(b.pairs.hebing.scoreRaw*b.pairs.hebing.reliability) &&
        b.pairs.hebing.opposition===Math.round(b.pairs.hebing.oppositionRaw*b.pairs.hebing.reliability)),
      '支持與反向同時套用可靠度係數，不只折扣支持');
    const conf1976 = saveObj.curves.bazi.strength.confidence;
    ok(conf1976==='明顯' && bandsAll.every(b=>b.pairs.hebing.reliability===1),
      '本盤旺衰判定為「明顯」且無疑似格備選，係數維持 1（回歸不變）');
  }

  console.log('== v0.9.28 可靠度折扣：臨界盤 1970-01-05 寅時 女 ==');
  {
    const d2 = await boot(); const w2 = d2.window, c2 = w2.document;
    let saved2=null; const OB2=w2.Blob;
    w2.Blob=function(parts,opts){const b=new OB2(parts,opts);
      if(opts&&opts.type==='application/json')saved2=parts.join(''); return b;};
    fill(w2, { name:'臨界測試', gender:'F', y:1970, m:1, d:5, h:2 });
    c2.getElementById('f-go').click();
    for (let i=0;i<160 && c2.getElementById('f-save').disabled;i++) await sleep(100);
    await sleep(800);
    c2.getElementById('f-save').click(); await sleep(200);
    const o2 = JSON.parse(saved2);
    ok(o2.curves.bazi.strength.confidence==='臨界', '此盤旺衰判定確為「臨界」（折扣路徑的前提）');
    const b2 = [o2.resonance.syncAlerts.daen.up,o2.resonance.syncAlerts.daen.down,
                o2.resonance.syncAlerts.year.up,o2.resonance.syncAlerts.year.down].reduce((a,r)=>a.concat(r),[]);
    ok(b2.length>0 && b2.every(b=>b.pairs.hebing.reliability===0.6), '臨界盤的八字可靠度係數為 0.6');
    ok(b2.some(b=>b.pairs.hebing.score<b.pairs.hebing.scoreRaw), '臨界盤實際發生折扣（折扣後分數低於原始分數）');
    ok(/八字可靠度 60%/.test(c2.getElementById('syncGrid').textContent), '畫面顯示「八字可靠度 60%」，折扣不隱形');
    d2.window.close();
  }

  console.log('== v0.9.28 財運訊號 ==');
  {
    const bw = saveObj.curves.bazi.wealthSignals, zw = saveObj.curves.ziwei.wealthSignals;
    ok(bw && bw.schema==='xiaoliu.wealth-signal/v1' && bw.affectsCurve===false &&
       zw && zw.schema==='xiaoliu.wealth-signal/v1' && zw.affectsCurve===false,
      '八字與紫微財運訊號皆標明契約版本且不參與曲線計分');
    ok(bw.luShen && bw.luShen.yearStem==='丙' && bw.luShen.yearLu==='巳' &&
       bw.luShen.dayStem==='己' && bw.luShen.dayLu==='午',
      '祿神由十二長生臨官位推得（丙祿在巳、己祿在午）');
    const favSet = saveObj.curves.bazi.favorable;
    ok(bw.daen.concat(bw.annual).every(r =>
        favSet.includes(r.ganElement) &&
        (r.zhi===bw.luShen.yearLu || r.zhi===bw.luShen.dayLu)),
      '每筆八字財運訊號皆同時滿足「天干喜用」與「地支為年干或日干祿神」');
    ok(bw.daen.some(r=>r.gz==='甲午' && r.y0===2008 && r.y1===2017 && r.luFrom==='日干'),
      '本盤命中甲午大限（2008–2017，木為喜用＋日干祿神午）');
    ok(bw.annual.map(r=>r.year).includes(2014) && bw.annual.map(r=>r.year).includes(2025),
      '本盤流年命中 2014 甲午與 2025 乙巳');
    ok(bw.daen.concat(bw.annual).every(r=>r.strengthLevel==='身強'||r.strengthLevel==='身弱'),
      '每筆八字財運訊號記錄當時旺衰（身強／身弱共用同一條件，差異由喜用神承載）');
    const WSTAR=['武曲','太陰','天府'], WPAL=['命宮','財帛','田宅'];
    ok(zw.daen.concat(zw.annual).every(r => r.hits.length>0 &&
        r.hits.every(h => WSTAR.includes(h.star) && WPAL.includes(h.palace))),
      '每筆紫微財運訊號皆為武曲／太陰／天府化祿落於命宮、財帛或田宅');
    ok(zw.daen.some(r=>r.y0===1998 && r.y1===2007 && r.hits.some(h=>h.star==='太陰'&&h.palace==='命宮')),
      '本盤命中丁酉大限（1998–2007，太陰化祿入大限命宮）');
    ok(zw.annual.map(r=>r.year).includes(2009) && zw.annual.map(r=>r.year).includes(2017),
      '本盤流年命中 2009 武曲化祿→田宅與 2017 太陰化祿→命宮');
    const wr = saveObj.resonance.wealthResonance;
    ok(wr && wr.schema==='xiaoliu.wealth-resonance/v1' && wr.affectsCurve===false &&
       Array.isArray(wr.daen) && Array.isArray(wr.annual),
      '存檔含雙法財運共振快照且不參與計分');
    ok(wr.daen.every(r => r.y0<=r.y1 &&
        r.y0>=Math.max(r.bazi.y0,r.ziwei.y0) && r.y1<=Math.min(r.bazi.y1,r.ziwei.y1)),
      '大限共振區間確為兩法西元年區間的交集');
    ok(wr.annual.every(r => r.bazi.year===r.year && r.ziwei.year===r.year),
      '流年共振每筆的兩法年份一致');
    ok(wr.daen.length===0 && wr.annual.length===0,
      '本盤兩法財運訊號無重疊，共振為空（負例：不得無中生有）');
    ok(/雙法財運共振/.test(doc.getElementById('wealthGrid').textContent) &&
       /甲午/.test(doc.getElementById('wealthGrid').textContent) &&
       /太陰化祿/.test(doc.getElementById('wealthGrid').textContent),
      '財運訊號卡摺疊區仍保留雙法共振、八字與紫微三區（舊口徑）');
    /* v0.9.36 推象財路 */
    const wt = saveObj.resonance.wealthTuixiang, wgTxt = doc.getElementById('wealthGrid').textContent;
    ok(wt && wt.schema==='xiaoliu.wealth-tuixiang/v1' && wt.affectsCurve===false && wt.dayMaster.gan==='己', '存檔含推象財路快照（schema v1、不參與計分、日主己）');
    ok(wt.daen.some(d=>d.y0===2018&&d.grade==='強'&&/被管得財/.test(d.reasons.join())) && wt.daen.some(d=>d.y0===2028&&/自己主導財/.test(d.reasons.join())) && !wt.daen.some(d=>d.y0===2008),
      '推象財路：2018 未宮被管得財（強）、2028 午宮自己主導財；2008 申宮紫府不列');
    ok(wt.annual.some(a=>a.year===2032&&a.grade==='強') && wt.annual.some(a=>a.year===2033&&/破軍化祿/.test(a.reasons.join())),
      '推象財路流年：2032 壬子（干支皆財）強、2033 破軍化祿入大限命宮');
    ok(/推象財路（日主 己土，財＝水）/.test(wgTxt) && /財路・大限/.test(wgTxt) && /財路・流年/.test(wgTxt) && /財＝資產與現金流/.test(wgTxt),
      '財運卡以推象財路為主區，附年齡段貨幣');
    ok(!/財運/.test(doc.getElementById('syncGrid').textContent),
      '財運訊號自成一卡，未混入太乙錨定可信區段');
  }

  console.log('== v0.9.28 雙法財運共振正例：1974-10-08 子時 女 ==');
  {
    const d3 = await boot(); const w3 = d3.window, c3 = w3.document;
    let saved3=null; const OB3=w3.Blob;
    w3.Blob=function(parts,opts){const b=new OB3(parts,opts);
      if(opts&&opts.type==='application/json')saved3=parts.join(''); return b;};
    fill(w3, { name:'共振測試', gender:'F', y:1974, m:10, d:8, h:0 });
    c3.getElementById('f-go').click();
    for (let i=0;i<160 && c3.getElementById('f-save').disabled;i++) await sleep(100);
    await sleep(800);
    c3.getElementById('f-save').click(); await sleep(200);
    const o3 = JSON.parse(saved3);
    const wr3 = o3.resonance.wealthResonance;
    ok(wr3.daen.length===1 && wr3.daen[0].y0===2044 && wr3.daen[0].y1===2046,
      '大限共振命中 2044–2046（八字丙寅 2044–2053 ∩ 紫微丁卯 2037–2046）');
    ok(wr3.daen[0].bazi.gz==='丙寅' && wr3.daen[0].ziwei.ganZhi==='丁卯' &&
       wr3.daen[0].ziwei.hits.some(h=>h.star==='太陰'&&h.palace==='財帛'),
      '大限共振保留兩法各自的成立依據');
    const hit2007=wr3.annual.find(a=>a.year===2007), hit2067=wr3.annual.find(a=>a.year===2067);
    ok(hit2007 && hit2007.bazi.gz==='丁亥' && hit2007.ziwei.hits.some(h=>h.star==='太陰'&&h.palace==='命宮'),
      '流年共振命中 2007（八字丁亥火為喜用＋日干祿神；紫微太陰化祿入流年命宮）');
    ok(hit2067 && hit2067.bazi.gz==='丁亥' && wr3.annual.length===2,
      '流年共振另命中 2067 丁亥（六十甲子一輪同訊號；v0.9.29 曆書延長後可見）');
    const t3 = c3.getElementById('wealthGrid').textContent;
    ok(/雙法共振西元 2044–2046/.test(t3.replace(/\s+/g,'')) || /2044–2046/.test(t3),
      '畫面顯示大限共振區間');
    ok(/雙法共振2007/.test(t3.replace(/\s+/g,'')), '畫面顯示流年共振年份');
    d3.window.close();
  }

  console.log('== 破壞測試：單邊失敗仍畫單線、共振卡收起 ==');
  dom = await boot();
  win = dom.window; doc = win.document;
  doc.getElementById('fr-bazi').contentWindow.runChart = () => { throw new Error('人為破壞'); };
  fill(win, { name: '測試甲', gender: 'F', y: 1976, m: 10, d: 14, h: 11 });
  doc.getElementById('f-go').click();
  for (let i = 0; i < 100 && !/svg/.test(doc.getElementById('ovChart').innerHTML); i++) await sleep(100);
  const svg2 = doc.getElementById('ovChart').innerHTML;
  ok(/八字：/.test(doc.getElementById('f-status').textContent), '狀態列標出八字端錯誤');
  for (let i = 0; i < 50 && !/限例太乙（十二宮歲段/.test(doc.getElementById('ovLegend').textContent); i++) await sleep(100);
  ok(countPoly(doc.getElementById('ovChart').innerHTML) === 1, '八字壞掉＋預設勾選時只剩限例太乙一條（五行主線曲線需八字）（實得 ' + countPoly(doc.getElementById('ovChart').innerHTML) + '）');
  [...doc.querySelectorAll('[data-method]')].forEach(c => { if (!c.checked) c.click(); });
  await sleep(300);
  const svg2b = doc.getElementById('ovChart').innerHTML;
  ok(countPoly(svg2b) === 2, '八字壞掉時全開仍只有紫微大限＋限例太乙兩條（實得 ' + countPoly(svg2b) + '）');
  ok(((doc.getElementById('resoGrid').textContent).match(/同向率/g) || []).length === 1, '八字壞掉時共振卡剩 1 組配對（紫微×限例）');
  ok(win.getComputedStyle(doc.getElementById('syncCard')).display !== 'none' && /等待：八字＋紫微大限曲線/.test(doc.getElementById('syncGrid').textContent), '兩線未齊時提醒卡不消失，明示缺少八字＋紫微曲線');
  ok(win.getComputedStyle(doc.getElementById('turnCard')).display !== 'none' && /三線資料尚未齊備/.test(doc.getElementById('turnGrid').textContent), '三線未齊時轉折卡不消失並顯示等待說明');
  ok(win.getComputedStyle(doc.getElementById('wealthCard')).display !== 'none' &&
     /紫微財運/.test(doc.getElementById('wealthGrid').textContent) &&
     /八字尚未排盤/.test(doc.getElementById('wealthGrid').textContent) &&
     /需八字與紫微（v3 主星欄位）皆排盤完成/.test(doc.getElementById('wealthGrid').textContent),
     '八字壞掉時財運卡不消失：推象財路標明缺件，舊口徑紫微訊號照列並標明八字缺席');

  console.log(fails === 0 ? '\nALL PASS' : '\nFAILED: ' + fails);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('測試框架錯誤：', e); process.exit(1); });
