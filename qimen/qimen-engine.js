/**
 * qimen-engine.js — 奇門遁甲・時家・轉盤 排盤引擎  v0.1.0
 * 小六太乙工作室
 *
 * 依賴：solar-lunar.js（節氣 1930–2100、日柱、時柱）
 *   Node   : const Q = require('./qimen-engine.js'); Q.setSolarLunar(require('./solar-lunar.js'));
 *   Browser: <script src="solar-lunar.js"></script><script src="qimen-engine.js"></script>（自動接 window.solarLunar）
 *
 * 方法（v0.1 定案）：
 *   定局＝置閏法（超神接氣；芒種／大雪 超神 ≥ LEAP_THRESHOLD 日 置閏，閏局重排該節氣上中下三元）
 *   盤式＝轉盤（九星、八門、八神繞八宮轉；中五寄坤二）
 *   日界＝夜子時（23:00）起算次日（與 bazi-tool 時柱規則一致）
 *
 * 輸出契約：xiaoliu.qimen-chart/v1（見 computeDay 回傳）
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  (global.qimenEngine = factory());
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  let SL = (typeof window !== 'undefined' && window.solarLunar) ? window.solarLunar : null;
  function setSolarLunar(lib) { SL = lib; }
  function needSL() { if (!SL) throw new Error('qimen-engine: 請先 setSolarLunar(solarLunar)'); }

  const VERSION = '0.3.0';
  const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const TERMS = ['小寒','大寒','立春','雨水','驚蟄','春分','清明','穀雨','立夏','小滿','芒種','夏至',
                 '小暑','大暑','立秋','處暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
  const DAY_MS = 86400000;
  const LEAP_THRESHOLD = 10;   // 超神達 10 日（含）於芒種／大雪置閏；「超過九日」之通行解讀，待對帳

  // 節氣 → [上元局, 中元局, 下元局], 陽遁 / 陰遁
  const JU_TABLE = {
    冬至:[1,7,4], 小寒:[2,8,5], 大寒:[3,9,6], 立春:[8,5,2], 雨水:[9,6,3], 驚蟄:[1,7,4],
    春分:[3,9,6], 清明:[4,1,7], 穀雨:[5,2,8], 立夏:[4,1,7], 小滿:[5,2,8], 芒種:[6,3,9],
    夏至:[9,3,6], 小暑:[8,2,5], 大暑:[7,1,4], 立秋:[2,5,8], 處暑:[1,4,7], 白露:[9,3,6],
    秋分:[7,1,4], 寒露:[6,9,3], 霜降:[5,8,2], 立冬:[6,9,3], 小雪:[5,8,2], 大雪:[4,7,1]
  };
  const YANG_TERMS = new Set(['冬至','小寒','大寒','立春','雨水','驚蟄','春分','清明','穀雨','立夏','小滿','芒種']);

  // 洛書九宮
  const PALACE_NAME = {1:'坎',2:'坤',3:'震',4:'巽',5:'中',6:'乾',7:'兌',8:'艮',9:'離'};
  const PALACE_DIR  = {1:'北',2:'西南',3:'東',4:'東南',5:'中',6:'西北',7:'西',8:'東北',9:'南'};
  const CLOCKWISE   = [1,8,3,4,9,2,7,6];           // 轉盤八宮順序
  const STAR_HOME   = {1:'天蓬',2:'天芮',3:'天沖',4:'天輔',5:'天禽',6:'天心',7:'天柱',8:'天任',9:'天英'};
  const GATE_HOME   = {1:'休門',2:'死門',3:'傷門',4:'杜門',5:'死門',6:'開門',7:'驚門',8:'生門',9:'景門'};
  const GODS        = ['值符','螣蛇','太陰','六合','白虎','玄武','九地','九天'];
  const YI_SEQ      = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];   // 地盤三奇六儀佈局順序
  const XUN_YI      = ['戊','己','庚','辛','壬','癸'];                  // 甲子戊 甲戌己 甲申庚 甲午辛 甲辰壬 甲寅癸
  const ZHI_PALACE  = {子:1,丑:8,寅:8,卯:3,辰:4,巳:4,午:9,未:2,申:2,酉:7,戌:6,亥:6};
  const OPPOSITE    = {1:9,9:1,2:8,8:2,3:7,7:3,4:6,6:4};
  const GATE_ELEM   = {休門:'水',生門:'土',傷門:'木',杜門:'木',景門:'火',死門:'土',驚門:'金',開門:'金'};
  const PALACE_ELEM = {1:'水',8:'土',3:'木',4:'木',9:'火',2:'土',7:'金',6:'金'};
  const KE          = {水:'火',火:'金',金:'木',木:'土',土:'水'};          // 克
  const JIXING      = {戊:3, 己:2, 庚:8, 辛:9, 壬:4, 癸:4};              // 六儀擊刑（天盤干落宮）
  const RUMU        = {甲:2, 乙:2, 丙:6, 丁:8, 戊:6, 己:8, 庚:8, 辛:4, 壬:4, 癸:2};   // 十干入墓（天盤干落宮）
  const HOUR_RANGE  = ['23–01','01–03','03–05','05–07','07–09','09–11','11–13','13–15','15–17','17–19','19–21','21–23'];

  // ---------- 日期工具 ----------
  const dayIndex = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
  const idxToDate = (i) => { const t = new Date(i * DAY_MS); return {y:t.getUTCFullYear(), m:t.getUTCMonth()+1, d:t.getUTCDate()}; };
  const pad = n => String(n).padStart(2,'0');
  const fmt = o => `${o.y}-${pad(o.m)}-${pad(o.d)}`;
  // 六十甲子序（甲子=0）。1900-01-31 為甲辰（=40）
  const REF_IDX = Math.floor(Date.UTC(1900, 0, 31) / DAY_MS);
  const sexIdxOfDay = (i) => (((i - REF_IDX + 40) % 60) + 60) % 60;
  const ganzhiOf = (s) => GAN[s % 10] + ZHI[s % 12];
  const sexIdxOfGZ = (gz) => { const g = GAN.indexOf(gz[0]), z = ZHI.indexOf(gz[1]); for (let i = 0; i < 60; i++) if (i % 10 === g && i % 12 === z) return i; return -1; };
  const mod = (a, n) => ((a % n) + n) % n;

  // ---------- 置閏法：節氣→符頭 對照表（模擬累積） ----------
  let leapCache = null;
  function buildLeapTable(startYear, endYear) {
    needSL();
    const events = [];
    for (let y = startYear; y <= endYear; y++) for (let n = 1; n <= 24; n++) {
      const t = SL.getTerm(y, n); if (!t) continue;
      events.push({ name: TERMS[n - 1], time: t, dayIdx: Math.floor(t / DAY_MS), year: y });
    }
    // 初始：第一個節氣取「其日或其前最近的上元符頭」（超神 0–14 日）；模擬在第一次芒種/大雪檢核後即收斂
    let f = events[0].dayIdx - mod(sexIdxOfDay(events[0].dayIdx), 15);
    const blocks = [];  // {start, term, leap, chao(超神日數，負為接氣), termDayIdx}
    for (let k = 0; k < events.length; k++) {
      const e = events[k];
      const u = e.dayIdx - f;
      blocks.push({ start: f, term: e.name, leap: false, chao: u, termDayIdx: e.dayIdx, termTime: e.time });
      let leap = false;
      if ((e.name === '芒種' || e.name === '大雪') && u >= LEAP_THRESHOLD) {
        leap = true;
        blocks.push({ start: f + 15, term: e.name, leap: true, chao: u, termDayIdx: e.dayIdx, termTime: e.time });
      }
      f += leap ? 30 : 15;
    }
    return blocks;
  }
  function getLeapTable() {
    if (!leapCache) leapCache = buildLeapTable(1931, 2100);
    return leapCache;
  }

  /** 定局：回傳 {term, yuan(0上1中2下), ju, dun('陽'|'陰'), leap, chao, fuTouDate, termDate} */
  function locateJu(y, m, d) {
    const di = dayIndex(y, m, d);
    const blocks = getLeapTable();
    // 二分找 start <= di 的最後一塊
    let lo = 0, hi = blocks.length - 1, b = null;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (blocks[mid].start <= di) { b = blocks[mid]; lo = mid + 1; } else hi = mid - 1; }
    if (!b || di >= b.start + 15) throw new Error('qimen-engine: 日期超出置閏表範圍（1931–2100）');
    const yuan = Math.floor((di - b.start) / 5);
    const dun = YANG_TERMS.has(b.term) ? '陽' : '陰';
    return {
      term: b.term, yuan, yuanName: ['上元','中元','下元'][yuan], ju: JU_TABLE[b.term][yuan], dun,
      leap: b.leap, chao: b.chao,
      chaoJieLabel: b.chao > 0 ? `超神${b.chao}日` : b.chao < 0 ? `接氣${-b.chao}日` : '正授',
      fuTouDate: fmt(idxToDate(b.start)), fuTouGanZhi: ganzhiOf(sexIdxOfDay(b.start)),
      termDate: fmt(idxToDate(b.termDayIdx))
    };
  }

  // ---------- 地盤 ----------
  function diPan(ju, dun) {
    const map = {};
    for (let i = 0; i < 9; i++) {
      const p = dun === '陽' ? mod(ju - 1 + i, 9) + 1 : mod(ju - 1 - i, 9) + 1;
      map[p] = YI_SEQ[i];
    }
    return map; // palace -> 干
  }
  const palaceOfGan = (dp, g) => +Object.keys(dp).find(p => dp[p] === g);
  const outer = p => p === 5 ? 2 : p;                 // 中五寄坤二
  const rotateMap = (homeMap, fromP, toP) => {        // 把 CLOCKWISE 環上的東西整體轉動
    const off = mod(CLOCKWISE.indexOf(toP) - CLOCKWISE.indexOf(fromP), 8);
    const out = {};
    CLOCKWISE.forEach((p, i) => { out[CLOCKWISE[(i + off) % 8]] = homeMap[p]; });
    return out;
  };

  // ---------- 單一時辰排盤 ----------
  function computeHour(juInfo, hourGZ) {
    const { ju, dun } = juInfo;
    const dp = diPan(ju, dun);
    const hIdx = sexIdxOfGZ(hourGZ);
    const xun = Math.floor(hIdx / 10);
    const xunYi = XUN_YI[xun];
    const xunShou = GAN[0] + ZHI[mod(-2 * xun, 12)];  // 甲子 甲戌 甲申 甲午 甲辰 甲寅
    const stepsFromXun = hIdx % 10;
    const hourGan = hourGZ[0], hourZhi = hourGZ[1];

    // 值符 / 值使 本宮
    const p0 = palaceOfGan(dp, xunYi);
    const zhiFuStar = STAR_HOME[p0];                     // 天禽 若在中
    const zhiShiGate = GATE_HOME[p0];
    // 值符隨時干：時干甲 → 隨旬首儀
    const hourGanEff = hourGan === '甲' ? xunYi : hourGan;
    const zhiFuTargetRaw = palaceOfGan(dp, hourGanEff);   // 真實加臨之宮（可為中五）
    const zhiFuTarget = outer(zhiFuTargetRaw);
    const zhiFuFrom = outer(p0);

    // 天盤星
    const starHomeOuter = {}; CLOCKWISE.forEach(p => starHomeOuter[p] = STAR_HOME[p]);
    const stars = rotateMap(starHomeOuter, zhiFuFrom, zhiFuTarget);
    // 天盤干：星帶其本宮地盤干；天禽隨天芮，帶中五干
    const ganHomeOuter = {}; CLOCKWISE.forEach(p => ganHomeOuter[p] = dp[p]);
    const tianGan = rotateMap(ganHomeOuter, zhiFuFrom, zhiFuTarget);
    const tianGan2 = {};
    const ruiAt = +Object.keys(stars).find(p => stars[p] === '天芮');
    tianGan2[ruiAt] = dp[5];

    // 值使門：自值符本宮起，順（陽）／逆（陰）飛九宮數至時支
    const zhiShiTargetRaw = dun === '陽' ? mod(p0 - 1 + stepsFromXun, 9) + 1 : mod(p0 - 1 - stepsFromXun, 9) + 1;
    const zhiShiTarget = outer(zhiShiTargetRaw);
    const gateHomeOuter = {}; CLOCKWISE.forEach(p => gateHomeOuter[p] = GATE_HOME[p]);
    const gates = rotateMap(gateHomeOuter, outer(p0), zhiShiTarget);

    // 八神：值符神隨值符星，陽順陰逆
    const gods = {};
    const startI = CLOCKWISE.indexOf(zhiFuTarget);
    for (let i = 0; i < 8; i++) gods[CLOCKWISE[mod(startI + (dun === '陽' ? i : -i), 8)]] = GODS[i];

    // 旬空
    const kongZhi = [ZHI[mod(10 - 2 * xun, 12)], ZHI[mod(11 - 2 * xun, 12)]];
    const kongPalaces = [...new Set(kongZhi.map(z => ZHI_PALACE[z]))];

    // 組九宮
    const palaces = {};
    for (let p = 1; p <= 9; p++) {
      palaces[p] = {
        name: PALACE_NAME[p], dir: PALACE_DIR[p], diPan: dp[p],
        tianPan: p === 5 ? null : tianGan[p], tianPan2: tianGan2[p] || null,
        star: p === 5 ? null : stars[p] + (stars[p] === '天芮' ? '+禽' : ''),
        gate: p === 5 ? null : gates[p], god: p === 5 ? null : gods[p],
        kong: kongPalaces.includes(p)
      };
    }

    // 格局（寄坤僅為顯示，判格一律看真實加臨的地盤；中宮寄來的干不參與判格）
    const patterns = [];
    const zfGround = dp[zhiFuTargetRaw];
    if (zfGround === '丙') patterns.push({ name: '青龍返首', palace: zhiFuTarget, grade: '吉',
      note: '值符' + xunShou + xunYi + '加丙' + (zhiFuTargetRaw === 5 ? '（丙在中宮，待驗）' : '') });
    const SAN_JI = ['乙','丙','丁'], JI_MEN = ['開門','休門','生門'], DJG = ['丁','己','癸'];
    const add = (name, palace, note) => patterns.push({ name, palace, grade: '吉', note });
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const t = tianGan[p], ground = dp[p], gate = gates[p], god = gods[p];
      // 旬首儀在中宮 → 寄坤，坤地盤兼有之；但時干亦在中宮（值符入中）時不判，只標符伏吟
      const groundIsJia = ground === xunYi || (p === 2 && dp[5] === xunYi && zhiFuTargetRaw !== 5);
      if (t === '丙' && groundIsJia) add('飛鳥跌穴', p, '丙加' + xunShou + xunYi + (ground !== xunYi ? '（甲在中宮寄坤）' : ''));
      if (t === '乙' && (ground === '戊' || ground === '己')) add('乙奇得時遇甲', p, '乙加' + ground + '（乙奇得使）');
      if (t === '丙' && (ground === '庚' || ground === '辛')) add('丙奇得時遇甲', p, '丙加' + ground + '（丙奇得使）');
      // 九遁
      if (gate === '生門' && t === '丙' && (ground === '丁' || god === '九天')) add('天遁', p, '生門＋丙奇＋' + (ground === '丁' ? '地盤丁' : '九天'));
      if (gate === '開門' && t === '乙' && (ground === '己' || god === '九地')) add('地遁', p, '開門＋乙奇＋' + (ground === '己' ? '地盤己' : '九地'));
      if (gate === '休門' && t === '丁' && god === '太陰') add('人遁', p, '休門＋丁奇＋太陰');
      if (JI_MEN.includes(gate) && t === '乙' && p === 4) add('風遁', p, gate + '＋乙奇落巽');
      if (JI_MEN.includes(gate) && t === '乙' && ground !== '辛' && p !== 1) add('雲遁', p, gate + '＋乙奇');   // 加辛歸虎遁、坎宮歸龍遁
      if (gate === '休門' && t === '乙' && p === 1) add('龍遁', p, '休門＋乙奇臨坎');
      if (t === '乙' && ground === '辛' && (gate === '生門' || (gate === '休門' && p === 8))) add('虎遁', p, gate + (p === 8 ? '臨艮' : '') + '＋乙加辛');
      if (gate === '生門' && t === '丙' && god === '九天') add('神遁', p, '生門＋丙奇＋九天');
      if (gate === '杜門' && t === '丁' && (god === '九地' || ground === '癸')) add('鬼遁', p, '杜門＋丁奇＋' + (god === '九地' ? '九地' : '地盤癸'));
      // 三詐
      // 三詐：三吉門＋陰神＋三奇，缺一不可
      if (SAN_JI.includes(t) && JI_MEN.includes(gate) && god === '太陰') add('真詐', p, gate + '＋太陰＋' + t + '奇');
      if (SAN_JI.includes(t) && JI_MEN.includes(gate) && god === '九地') add('重詐', p, gate + '＋九地＋' + t + '奇');
      if (SAN_JI.includes(t) && JI_MEN.includes(gate) && god === '六合') add('休詐', p, gate + '＋六合＋' + t + '奇');
      // 五假（以御定奇門寶鑑實際標註為準，定義為輔；衝突處見 README）
      if (gate === '景門' && god === '九天' && (t === '丙' || t === '丁')) add('天假', p, '景門＋' + t + '＋九天（乙依寶鑑案例暫排除）');
      if (gate === '杜門' && (t === '丁' || t === '癸') && ['九天','太陰','六合'].includes(god)) add('地假', p, '杜門＋' + t + '＋' + god + '（己依寶鑑案例暫排除）');
      if (gate === '驚門' && (t === '壬' || t === '癸')) add('人假', p, '驚門＋' + t + '＋' + god + '（八神不限，依寶鑑案例）');
      if (gate === '傷門' && DJG.includes(t) && ['九地','六合'].includes(god)) add('神假', p, '傷門＋' + t + '＋' + god);
      if (gate === '死門' && DJG.includes(t) && ['九地','六合'].includes(god)) add('鬼假', p, '死門＋' + t + '＋' + god + (god === '六合' ? '（六合依寶鑑案例）' : ''));
    }
    if (hourGan === '丙' && palaceOfGan(dp, '丙') === 5 && p0 !== 5)   // 時干丙入中宮 → 視為加臨值符本宮（旬首儀所在宮）
      add('飛鳥跌穴', p0, '時干丙在中宮，加' + xunShou + xunYi + '於值符本宮');
    {  // 玉女守門：值使門所落之宮，地盤為丁
      const p = zhiShiTarget;
      if (dp[p] === '丁') add('玉女守門', p, zhiShiGate + '臨地盤丁');
    }
    // 減力標記（忌）：門迫、六儀擊刑、入墓
    const warn = (name, palace, note) => patterns.push({ name, palace, grade: '忌', note });
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const g = gates[p], t = tianGan[p];
      if (KE[GATE_ELEM[g]] === PALACE_ELEM[p]) warn('門迫', p, g + '（' + GATE_ELEM[g] + '）克' + PALACE_NAME[p] + '宮（' + PALACE_ELEM[p] + '）');
      if (JIXING[t] === p) warn('擊刑', p, '天盤' + t + '落' + PALACE_NAME[p]);
      if (RUMU[t] === p) warn((['乙','丙','丁'].includes(t) ? '三奇' : '六儀') + '入墓', p, '天盤' + t + '落' + PALACE_NAME[p]);
    }
    const fuYin = zhiFuTarget === zhiFuFrom;
    const fanYin = OPPOSITE[zhiFuTarget] === zhiFuFrom;
    if (fuYin) patterns.push({ name: '符伏吟', palace: zhiFuTarget, grade: '忌', note: '值符落本宮，宜靜不宜動' });
    if (fanYin) patterns.push({ name: '符反吟', palace: zhiFuTarget, grade: '忌', note: '值符落對宮，事多反覆' });

    return {
      hourGanZhi: hourGZ, hourZhi, hourRange: HOUR_RANGE[ZHI.indexOf(hourZhi)],
      xunShou: xunShou + xunYi, xunYi,
      zhiFu: { star: zhiFuStar, from: p0, to: zhiFuTarget, raw: zhiFuTargetRaw },
      zhiShi: { gate: zhiShiGate, from: p0, to: zhiShiTarget, raw: zhiShiTargetRaw },
      kong: { zhi: kongZhi, palaces: kongPalaces },
      palaces, patterns,
      flags: { fuYin, fanYin, qingLong: patterns.some(x => x.name === '青龍返首'), feiNiao: patterns.some(x => x.name === '飛鳥跌穴'),
               yuNv: patterns.some(x => x.name === '玉女守門'), warnPalaces: [...new Set(patterns.filter(x => x.grade === '忌' && x.name !== '符伏吟' && x.name !== '符反吟').map(x => x.palace))], yiDeShi: patterns.some(x => x.name === '乙奇得時遇甲'), bingDeShi: patterns.some(x => x.name === '丙奇得時遇甲') }
    };
  }

  // ---------- 一日十二時辰 ----------
  function computeDay(y, m, d) {
    needSL();
    const juInfo = locateJu(y, m, d);
    const lunar = SL.solar2lunar(y, m, d, 12, 0);
    const dayGZ = lunar.getDayInGanZhi();
    const hours = [];
    for (let h = 0; h < 12; h++) {
      const hourGZ = lunar.getTimeInGanZhi(h === 0 ? 0 : 2 * h);   // 子時用 00 時（歸本日），其餘用偶數整點
      hours.push(computeHour(juInfo, hourGZ));
    }
    return {
      schema: 'xiaoliu.qimen-chart/v1', engine: 'qimen-engine ' + VERSION,
      method: { ju: '置閏法', pan: '轉盤', leapThreshold: LEAP_THRESHOLD, dayBoundary: '夜子時23:00起算次日' },
      date: fmt({y, m, d}), dayGanZhi: dayGZ,
      yearGanZhi: lunar.getYearInGanZhi(), monthGanZhi: lunar.getMonthInGanZhi(),
      ...juInfo,
      juLabel: `${juInfo.dun}遁${'一二三四五六七八九'[juInfo.ju - 1]}局`,
      hours
    };
  }

  /** 掃描日期區間，列出出現指定格局的時辰 */
  function scanPatterns(y1, m1, d1, y2, m2, d2, names = ['青龍返首']) {
    const out = [];
    for (let i = dayIndex(y1, m1, d1); i <= dayIndex(y2, m2, d2); i++) {
      const o = idxToDate(i);
      const day = computeDay(o.y, o.m, o.d);
      day.hours.forEach(h => {
        const hit = h.patterns.filter(p => names.includes(p.name));
        if (hit.length) out.push({ date: day.date, dayGanZhi: day.dayGanZhi, ju: day.juLabel, term: day.term, yuan: day.yuanName,
          hour: h.hourGanZhi, hourRange: h.hourRange, patterns: hit.map(p => p.name + '@' + PALACE_NAME[p.palace]),
          caveats: h.patterns.filter(p => p.grade === '忌' && (p.name === '符伏吟' || p.name === '符反吟' || hit.some(q => q.palace === p.palace))).map(p => p.name + (p.name.startsWith('符') ? '' : '@' + PALACE_NAME[p.palace])) });
      });
    }
    return out;
  }

  return { VERSION, setSolarLunar, locateJu, computeHour, computeDay, scanPatterns, getLeapTable, buildLeapTable,
           consts: { PALACE_NAME, PALACE_DIR, CLOCKWISE, STAR_HOME, GATE_HOME, GODS, TERMS, JU_TABLE, LEAP_THRESHOLD } };
}));
