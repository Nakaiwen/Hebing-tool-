/* =============================================================================
 * 五行主線  wuxing-mainline.js  (v0.9.36)
 * 小六太乙 · 三盤合參
 *
 * 目的：把「八字命局（體質）× 紫微大限宮位（環境五行供給）」相乘，
 *       為每一個紫微大限產出一條「五行生剋主線」＋判詞。
 *
 * 方法（Nakai 2026-09-08 五行基底法，三段大限回測三中）：
 *   宮支五行 → 對日主的生剋關係 → 產出形態（做什麼）
 *   主星五行 → 對日主的生剋關係 → 分配結果（成果歸誰）
 *   大限四化落在主星上      → 方向（給／自主／名／收）
 *   四化定形狀不定尺度；尺度由分數層（八字大運分、紫微能量分）與當期現實決定。
 *
 * 口徑固定：宮支＋主星，不取宮干、不取納音。雙五行主星以主五行判讀、次五行併列顯示。
 * 純函式、零相依；瀏覽器（window.WuxingMainline）與 node 皆可用。
 * 判詞表（VERDICT）是 Nakai 的口徑，改字只改表、不動邏輯。
 * ============================================================================= */
(function (global, factory) {
  typeof module !== 'undefined' && module.exports ? (module.exports = factory())
    : (global.WuxingMainline = factory());
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };   // 我生
  const KE  = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };   // 我剋
  const GAN_ELEMENT = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  const ZHI_ELEMENT = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const STAGES = ['長生', '沐浴', '冠帶', '臨官', '帝旺', '衰', '病', '死', '墓', '絕', '胎', '養'];
  const BIRTH_ZHI = { 甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅', 己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯' };
  const YANG = { 甲: 1, 丙: 1, 戊: 1, 庚: 1, 壬: 1 };
  // 日主在某地支的十二長生位（陽干順行、陰干逆行）；己土：酉長生、午臨官（祿）、巳帝旺
  function stageOf(gan, zhi) {
    const b = ZHI.indexOf(BIRTH_ZHI[gan]), z = ZHI.indexOf(zhi);
    if (b < 0 || z < 0) return '';
    const k = YANG[gan] ? ((z - b) % 12 + 12) % 12 : ((b - z) % 12 + 12) % 12;
    return STAGES[k] + (STAGES[k] === '臨官' ? '（祿）' : '');
  }

  // 環境五行 el 相對日主 dm 的關係 → 十神類
  function relation(el, dm) {
    if (!el || !dm) return null;
    if (el === dm) return '比劫';
    if (GEN[dm] === el) return '食傷';   // 我生
    if (KE[dm] === el) return '財';      // 我剋
    if (KE[el] === dm) return '官殺';    // 剋我
    if (GEN[el] === dm) return '印';     // 生我
    return null;
  }
  const REL_VERB = { 比劫: '同我', 食傷: '我生', 財: '我剋', 官殺: '剋我', 印: '生我' };

  /* ---------------- 判詞表（Nakai 口徑；可逐格修改） ---------------- */
  const VERDICT = {
    // 宮支 → 產出形態（環境讓你「做什麼」）
    form: {
      食傷: '洩：把體內多餘的力氣做成東西——作品、案子、技能',
      官殺: '管：被框架、規矩、責任框著做出成果',
      財:   '取：環境本身就是可取之物，主動去拿',
      印:   '補：環境往裡補氣——資源、靠山、學習進來，動作偏靜',
      比劫: '聚：環境送來同類，人多勢眾，力量疊加也互相分'
    },
    // 宮支對日主是喜／忌（由八字喜用神表決定）
    formFav: {
      喜: '（喜神地，這個形態對你是順的）',
      忌: '（忌神地，會加重你原本過旺或過弱的那一行）',
      中: '（中性地，形態成立、不加不減）'
    },
    // 主星 → 分配結果（成果「歸誰」）
    share: {
      財:   '主星是你的財，錢的形態就是這顆星',
      比劫: '主星與你同類，成果由眾人共分',
      官殺: '主星管你，成果由管你的人或制度定價',
      食傷: '主星是你的產出，成果以作品、名聲的形式回來',
      印:   '主星是你的靠山，成果以資源、庇護的形式回來'
    },
    // 大限四化落在主星 → 方向
    dir: {
      祿: '給——這條線給你，入袋',
      權: '自主——這條線由你主導、握方向盤',
      科: '名——這條線給名、給口碑，不直接給錢',
      忌: '收——這條線收你的、綁你的；給形狀不給尺度',
      無: '無明確方向——順著宮支形態走，尺度看分數層'
    },
    // 已回測的格子（主星關係 × 四化）— 覆蓋上面兩段的組合句
    verified: {
      '官殺|祿': '被管得財：管你的那條線帶糧來',
      '比劫|無': '產出多、入袋少：作品是你的，錢是大家的',
      '財|祿':   '穩定給：財慢慢來、留得住，尺度看當期現實',
      '財|權':   '自己主導財：由你決定拆什麼、拿什麼，力道猛'
    }
  };

  /* ---------------- 年齡段對照表（v0.9.33；象的貨幣隨年齡換，形狀不變）----------------
   * 以大限中點虛歲取段。每段給四個貨幣：財（我剋）、管（剋我）、眾（比劫）、出口（往外走的形式）；可逐段修改。 */
  const AGE_STAGES = [
    { from: 1,  name: '童年',     cai: '家裡給的照顧與玩具', guan: '父母與長輩',         zhong: '玩伴與手足',     out: '寄居親戚家、外地生活' },
    { from: 13, name: '求學',     cai: '零用錢、學業成果',   guan: '學校與家規',         zhong: '同學',           out: '外地求學、住校' },
    { from: 23, name: '初入職場', cai: '薪水',               guan: '主管與公司制度',     zhong: '同事、同期競爭', out: '外派、換城市工作' },
    { from: 33, name: '成家立業', cai: '收入與資產起步',     guan: '老闆、客戶、家庭責任', zhong: '合夥人、同行',   out: '創業、開拓外地市場' },
    { from: 43, name: '中年主事', cai: '資產與現金流',       guan: '制度、責任、合約',   zhong: '同業分利者',     out: '跨領域、跨市場' },
    { from: 53, name: '盛年轉向', cai: '資產配置與變現',     guan: '健康與時間',         zhong: '同輩競合',       out: '退居第二線、旅居' },
    { from: 63, name: '退休初期', cai: '退休金、被動收入',   guan: '身體與家人安排',     zhong: '同輩往來',       out: '旅行、移居' },
    { from: 73, name: '晚年',     cai: '照顧資源',           guan: '子女安排與醫療節奏', zhong: '老友',           out: '環境轉換' }
  ];
  function ageStageOf(start, end) {
    const mid = (start + end) / 2;
    let st = AGE_STAGES[0];
    AGE_STAGES.forEach(a => { if (mid >= a.from) st = a; });
    return st;
  }
  function favOf(el, favorable, unfavorable) {
    if ((favorable || []).indexOf(el) >= 0) return '喜';
    if ((unfavorable || []).indexOf(el) >= 0) return '忌';
    return '中';
  }

  // 取日主：優先 bazi.dayMaster（v3 欄位），退而用 wealthSignals.luShen.dayStem（v2）
  function dayMasterOf(B) {
    if (!B) return null;
    if (B.dayMaster && B.dayMaster.gan) {
      return { gan: B.dayMaster.gan, element: B.dayMaster.element || GAN_ELEMENT[B.dayMaster.gan] };
    }
    const g = B.wealthSignals && B.wealthSignals.luShen && B.wealthSignals.luShen.dayStem;
    return g ? { gan: g, element: GAN_ELEMENT[g] } : null;
  }

  // 主要方向：多顆主星時，祿＞權＞科＞忌；全無 → 無
  function pickDir(stars) {
    const order = ['祿', '權', '科', '忌'];
    for (const h of order) if (stars.some(s => s.daHua === h)) return h;
    return '無';
  }

  /**
   * buildMainline(B, Z)
   * B = curves.bazi（需 favorable/unfavorable；日主見 dayMasterOf）
   * Z = curves.ziwei（需 daen[]，每列含 zhi/zhiElement/stars[]/hua；缺則回 []）
   * 回傳每一大限一列。
   */
  function buildMainline(B, Z) {
    const dm = dayMasterOf(B);
    if (!dm || !Z || !Z.daen || !Z.daen.length) return [];
    const fav = (B.favorable || []), unfav = (B.unfavorable || []);
    const birth = Z.lunarBirthYear;
    const luckByYear = {};
    (B.annual || []).forEach(a => { if (a.luckGz) luckByYear[a.year] = a.luckGz; });
    const favWord = el => favOf(el, fav, unfav);
    // 對日主「有利」：喜神；或中性但成財／成洩口（食傷）
    const helpful = (el, rel) => favWord(el) === '喜' ? true : favWord(el) === '忌' ? false : (rel === '財' || rel === '食傷');
    return Z.daen.map(d => {
      const zhiEl = d.zhiElement || ZHI_ELEMENT[d.zhi] || '';
      if (!zhiEl || !d.stars) return null;
      const zhiRel = relation(zhiEl, dm.element);
      const zhiFav = favOf(zhiEl, fav, unfav);
      const stars = (d.stars || []).map(s => ({
        name: s.name, element: s.element, element2: s.element2 || '',
        rel: relation(s.element, dm.element),
        rel2: s.element2 ? relation(s.element2, dm.element) : null,
        daHua: s.daHua || '', natalHua: s.natalHua || '', borrowed: !!s.borrowed
      }));
      const dir = pickDir(stars);
      const rels = Array.from(new Set(stars.map(s => s.rel).filter(Boolean)));
      const shareRel = rels.length === 1 ? rels[0] : null;
      const key = shareRel ? shareRel + '|' + dir : null;
      const verifiedText = key && VERDICT.verified[key] ? VERDICT.verified[key] : null;
      const shareText = rels.map(r => VERDICT.share[r]).join('；');
      /* --- 年齡段 --- */
      const ageStage = ageStageOf(d.start, d.end);
      const ageNote = ageStage.name + '（虛歲 ' + d.start + '–' + d.end + '）：財＝' + ageStage.cai + '、管＝' + ageStage.guan + '、眾＝' + ageStage.zhong + '、出口＝' + ageStage.out;
      const verdict = {
        form: VERDICT.form[zhiRel] + VERDICT.formFav[zhiFav],
        share: shareText,
        dir: VERDICT.dir[dir],
        text: verifiedText || (shareText + '。' + VERDICT.dir[dir]),
        verified: !!verifiedText,
        ageNote: ageNote
      };
      /* --- 第 2 層補：日主在宮支的十二長生位 --- */
      const stage = stageOf(dm.gan, d.zhi);
      /* --- 第 5 層：大運兩面（對日主／對環境） --- */
      const y0 = birth + d.start - 1, y1 = birth + d.end - 1;
      const envEls = [zhiEl].concat(stars.map(s => s.element));
      const luckMap = {};
      for (let y = y0; y <= y1; y++) { const gz = luckByYear[y]; if (gz) luckMap[gz] = (luckMap[gz] || 0) + 1; }
      const lucks = Object.keys(luckMap).map(gz => {
        const g = gz.charAt(0), z = gz.charAt(1), ge = GAN_ELEMENT[g], ze = ZHI_ELEMENT[z];
        const gr = relation(ge, dm.element), zr = relation(ze, dm.element);
        let m = 0; envEls.forEach(E => { m += assist(ge, E) + 2 * assist(ze, E); }); m /= (envEls.length * 3);
        const outlet = (gr === '食傷' && favWord(ge) !== '忌') || (zr === '食傷' && favWord(ze) !== '忌');
        return { gz, years: luckMap[gz], gan: g, ganElement: ge, ganRel: gr, ganFav: favWord(ge),
                 zhi: z, zhiElement: ze, zhiRel: zr, zhiFav: favWord(ze), outlet, m: Math.round(m * 100) / 100,
                 text: gz + '運：' + g + ge + REL_VERB[gr] + '（' + gr + '・' + favWord(ge) + (gr === '食傷' ? '・洩口' : '') + '）／' +
                       z + ze + REL_VERB[zr] + '（' + zr + '・' + favWord(ze) + '）；對環境' + (m > 0.1 ? '助' : m < -0.1 ? '拆' : '平') + ' m=' + (m > 0 ? '+' : '') + (Math.round(m * 100) / 100) };
      });
      /* --- 第 6 層：對宮主星 --- */
      const opp = (d.frameStars && d.frameStars[0]) || null;
      const oppStars = opp ? (opp.stars || []).map(s => ({ name: s.name, element: s.element, element2: s.element2 || '', rel: relation(s.element, dm.element), fav: favWord(s.element) })) : [];
      const oppHelpful = oppStars.length ? oppStars.some(s => helpful(s.element, s.rel)) && !oppStars.some(s => s.fav === '忌') : false;
      /* --- 空宮借對宮規則 → 標籤 --- */
      let tag = '';
      const borrowedPalace = !!d.starsBorrowed || (!!(d.stars && d.stars.length) && d.stars.every(x => x.borrowed));
      if (borrowedPalace) {
        const bh = stars.some(s => helpful(s.element, s.rel)) && !stars.some(s => favWord(s.element) === '忌');
        tag = bh ? '機會在外（強制）' : '守本位・不外求';
      } else if (oppHelpful) tag = '出口在外（宜）';
      /* --- 第 7 層：宮名題目 --- */
      const TOPIC = { 命宮: '自己', 兄弟: '手足同儕', 夫妻: '伴侶', 子女: '晚輩合夥', 財帛: '錢', 疾厄: '身', 遷移: '外・出門', 交友: '人脈眾人', 官祿: '事業', 田宅: '家與不動產', 福德: '心與福分', 父母: '長輩貴人' };
      const topic = TOPIC[d.palaceName] || d.palaceName;
      const line = zhiEl + '宮' + REL_VERB[zhiRel] + '（' + zhiRel + '・' + zhiFav + '）× ' + (borrowedPalace ? '借對宮 ' : '') +
        stars.map(s => s.name + s.element + (s.element2 ? '(' + s.element2 + ')' : '') + REL_VERB[s.rel] + '（' + s.rel + (s.daHua ? '・' + s.daHua : '') + '）').join('＋');
      return {
        start: d.start, end: d.end, y0: birth + d.start - 1, y1: birth + d.end - 1,
        ganZhi: d.ganZhi, palaceName: d.palaceName, zhi: d.zhi, zhiElement: zhiEl, zhiRel, zhiFav,
        dayMaster: dm, stars, starsBorrowed: borrowedPalace, dir, stage, ageStage: ageStage.name, lucks, oppStars, oppZhi: opp ? opp.zhi : '', oppPalace: opp ? opp.palaceName : '', oppHelpful, tag, topic, huaText: d.huaText || '', line, verdict,
        score: d.score, clsWord: d.clsWord || ''
      };
    }).filter(Boolean);
  }

  /* ---------------- 五行主線曲線（v0.9.31；假說級，供與太乙比對） ----------------
   * 環境層：宮支喜忌 ±W.zhi、主星五行喜忌 ±W.star（每顆，借對宮 ×0.5，取平均）、大限四化落主星（祿權科忌）
   * 大運層（B 案：大運對大限環境的生剋）：大運干（×1）支（×2）五行對「宮支＋主星」——
   *   生環境 +1、同環境 +0.5、被環境洩（環境生大運）−0.5、剋環境 −1、被環境剋 −0.25 → 助拆指數 m∈[−1,1]
   *   大運分 = m × W.luck × sign(環境分)：助喜環境為正、助忌環境為負、拆忌環境為正。逐年取 annual[].luckGz 對齊後平均。
   * 權重皆為草案（待 Nakai 裁定）；此線不參與既有三線的任何計分，只多一條可被否定的曲線。 */
  const W = { zhi: 10, star: 15, lu: 15, quan: 10, ke: 5, ji: -15, luck: 20, ganW: 1, zhiW: 2 };
  function assist(D, E) {            // 大運五行 D 對環境五行 E
    if (!D || !E) return 0;
    if (GEN[D] === E) return 1;      // D 生 E
    if (D === E) return 0.5;         // 同氣
    if (GEN[E] === D) return -0.5;   // E 生 D＝洩環境
    if (KE[D] === E) return -1;      // D 剋 E＝拆環境
    if (KE[E] === D) return -0.25;   // E 剋 D＝大運無力
    return 0;
  }
  /* 環境正負：環境分≠0 取其正負；環境分為 0（中性環境）時退而取主星關係：身強以食傷／財為正、印／比劫為負，身弱反之；再退宮支喜忌。 */
  function envSignOf(B, r, envScore) {
    if (envScore > 0) return 1; if (envScore < 0) return -1;
    const strong = !(B.strength && /弱/.test(B.strength.level || ''));
    const rels = r.stars.map(x => x.rel).filter(Boolean);
    let v = 0; rels.forEach(x => { if (x === '財' || x === '食傷' || x === '官殺') v += strong ? 1 : -1; else if (x === '印' || x === '比劫') v += strong ? -1 : 1; });
    if (v) return v > 0 ? 1 : -1;
    return r.zhiFav === '喜' ? 1 : r.zhiFav === '忌' ? -1 : 0;
  }
  function favSign(el, fav, unfav) { return (fav || []).indexOf(el) >= 0 ? 1 : ((unfav || []).indexOf(el) >= 0 ? -1 : 0); }
  function scoreMainline(B, Z, rows) {
    rows = rows || buildMainline(B, Z);
    const fav = B.favorable || [], unfav = B.unfavorable || [];
    const luckByYear = {};
    (B.annual || []).forEach(a => { if (a.luckGz) luckByYear[a.year] = a.luckGz; });
    return rows.map(r => {
      const parts = [];
      const zhiS = favSign(r.zhiElement, fav, unfav) * W.zhi; parts.push({ label: '宮支' + r.zhi + r.zhiElement + r.zhiFav, delta: zhiS });
      let starS = 0, huaS = 0;
      r.stars.forEach(s => {
        const v = favSign(s.element, fav, unfav) * W.star * (s.borrowed ? 0.5 : 1) / r.stars.length;
        starS += v; parts.push({ label: '主星' + s.name + s.element + (s.borrowed ? '(借)' : ''), delta: Math.round(v * 10) / 10 });
        const h = s.daHua === '祿' ? W.lu : s.daHua === '權' ? W.quan : s.daHua === '科' ? W.ke : s.daHua === '忌' ? W.ji : 0;
        if (h) { huaS += h; parts.push({ label: '大限' + s.name + '化' + s.daHua, delta: h }); }
      });
      const envScore = zhiS + starS + huaS;
      const sign = envSignOf(B, r, envScore);
      const envEls = [r.zhiElement].concat(r.stars.map(s => s.element));
      let mSum = 0, n = 0; const luckSeen = {};
      for (let y = r.y0; y <= r.y1; y++) {
        const gz = luckByYear[y]; if (!gz) continue;
        const dg = GAN_ELEMENT[gz.charAt(0)], dz = ZHI_ELEMENT[gz.charAt(1)];
        let m = 0;
        envEls.forEach(E => { m += W.ganW * assist(dg, E) + W.zhiW * assist(dz, E); });
        m /= (envEls.length * (W.ganW + W.zhiW));
        mSum += m; n++; luckSeen[gz] = (luckSeen[gz] || 0) + 1;
      }
      const mAvg = n ? mSum / n : 0;
      const luckS = Math.round(mAvg * W.luck * sign * 10) / 10;
      parts.push({ label: '大運' + Object.keys(luckSeen).join('/') + (sign >= 0 ? '助' : '拆') + '環境 m=' + (Math.round(mAvg * 100) / 100), delta: luckS });
      const total = Math.round((envScore + luckS) * 10) / 10;
      return { y0: r.y0, y1: r.y1, start: r.start, end: r.end, ganZhi: r.ganZhi, palaceName: r.palaceName, envSign: sign,
               envScore: Math.round(envScore * 10) / 10, luckScore: luckS, m: Math.round(mAvg * 100) / 100, score: total, parts, luckGz: Object.keys(luckSeen) };
    });
  }

  /* ---------------- 流年五行主線曲線（v0.9.35）----------------
   * 逐年分 = 所在大限的環境分（宮支＋主星＋大限四化）
   *        ＋ 大運層（同 scoreMainline，該年 luckGz）
   *        ＋ 流年層：流年干支對「宮支＋主星」的助拆指數 × W.year × sign(環境分)
   *        ＋ 流年干飛四化落在大限命宮主星（祿+W.yLu／權/科/忌）
   * 流年干支取八字 annual[].gz；流年四化採與 ziwei-engine 相同的中州派十干表。 */
  const SI_HUA = {
    甲: { 廉貞: '祿', 破軍: '權', 武曲: '科', 太陽: '忌' }, 乙: { 天機: '祿', 天梁: '權', 紫微: '科', 太陰: '忌' },
    丙: { 天同: '祿', 天機: '權', 文昌: '科', 廉貞: '忌' }, 丁: { 太陰: '祿', 天同: '權', 天機: '科', 巨門: '忌' },
    戊: { 貪狼: '祿', 太陰: '權', 右弼: '科', 天機: '忌' }, 己: { 武曲: '祿', 貪狼: '權', 天梁: '科', 文曲: '忌' },
    庚: { 太陽: '祿', 武曲: '權', 太陰: '科', 天同: '忌' }, 辛: { 巨門: '祿', 太陽: '權', 文曲: '科', 文昌: '忌' },
    壬: { 天梁: '祿', 紫微: '權', 左輔: '科', 武曲: '忌' }, 癸: { 破軍: '祿', 巨門: '權', 太陰: '科', 貪狼: '忌' }
  };
  W.year = 15; W.yLu = 10; W.yQuan = 7; W.yKe = 3; W.yJi = -10;
  function scoreAnnual(B, Z, rows, daScores) {
    rows = rows || buildMainline(B, Z);
    daScores = daScores || scoreMainline(B, Z, rows);
    const fav = B.favorable || [], unfav = B.unfavorable || [];
    const luckByYear = {}, gzByYear = {};
    (B.annual || []).forEach(a => { if (a.luckGz) luckByYear[a.year] = a.luckGz; if (a.gz) gzByYear[a.year] = a.gz; });
    const out = [];
    rows.forEach((r, i) => {
      const ds = daScores[i]; if (!ds) return;
      const envEls = [r.zhiElement].concat(r.stars.map(s => s.element));
      const sign = envSignOf(B, r, ds.envScore);
      for (let y = r.y0; y <= r.y1; y++) {
        const gz = gzByYear[y]; if (!gz) continue;               // 流年干支只取八字逐年範圍
        const parts = [{ label: '大限環境', delta: ds.envScore }];
        // 大運層（該年）
        let luckS = 0; const lgz = luckByYear[y];
        if (lgz) {
          const dg = GAN_ELEMENT[lgz.charAt(0)], dz = ZHI_ELEMENT[lgz.charAt(1)];
          let m = 0; envEls.forEach(E => { m += W.ganW * assist(dg, E) + W.zhiW * assist(dz, E); }); m /= (envEls.length * (W.ganW + W.zhiW));
          luckS = Math.round(m * W.luck * sign * 10) / 10; parts.push({ label: '大運' + lgz + (sign >= 0 ? '助' : '拆') + '環境', delta: luckS });
        }
        // 流年層：干支對環境
        const yg = gz.charAt(0), yz = gz.charAt(1), ye = GAN_ELEMENT[yg], yze = ZHI_ELEMENT[yz];
        let my = 0; envEls.forEach(E => { my += W.ganW * assist(ye, E) + W.zhiW * assist(yze, E); }); my /= (envEls.length * (W.ganW + W.zhiW));
        const yearS = Math.round(my * W.year * sign * 10) / 10; parts.push({ label: '流年' + gz + (sign >= 0 ? '助' : '拆') + '環境 m=' + (Math.round(my * 100) / 100), delta: yearS });
        // 流年四化落大限命宮主星
        let huaS = 0; const hm = SI_HUA[yg] || {};
        r.stars.forEach(s => { const h = hm[s.name]; if (!h) return; const v = h === '祿' ? W.yLu : h === '權' ? W.yQuan : h === '科' ? W.yKe : W.yJi; huaS += v; parts.push({ label: '流年' + s.name + '化' + h, delta: v }); });
        const total = Math.round((ds.envScore + luckS + yearS + huaS) * 10) / 10;
        out.push({ year: y, gz, daGanZhi: r.ganZhi, palaceName: r.palaceName, score: total, envScore: ds.envScore, luckScore: luckS, yearScore: yearS, huaScore: huaS, parts });
      }
    });
    return out.sort((a, b) => a.year - b.year);
  }

  /* ---------------- 財運訊號（v0.9.36；推象七層口徑）----------------
   * 財＝日主所剋之五行。訊號不是「某顆星化祿」，而是「體質 × 環境 × 四化」推出來的財路：
   *   大限層：主星為財（我剋）帶祿／權、官殺帶祿（被管得財）、食傷帶祿（作品變現）、宮支為財且喜、
   *           對宮主星為財（財在外）、宮名財帛／田宅；負向：主星比劫（分財）、主星化忌（收）。
   *   流年層：流年干／支對日主為財、流年祿落大限命宮主星（主星為財加倍）、流年忌落主星（減）。
   * 每筆帶 reasons 與分數；強≥3、中 2、弱 1；≤0 不列。不參與任何曲線計分。 */
  function wealthSignals(B, Z, rows) {
    rows = rows || buildMainline(B, Z);
    const fav = B.favorable || [], unfav = B.unfavorable || [];
    const gzByYear = {}; (B.annual || []).forEach(a => { if (a.gz) gzByYear[a.year] = a.gz; });
    const dm = rows.length ? rows[0].dayMaster : null; if (!dm) return { daen: [], annual: [] };
    const grade = n => n >= 3 ? '強' : n === 2 ? '中' : '弱';
    const daen = [], annual = [];
    rows.forEach(r => {
      let n = 0; const why = [];
      r.stars.forEach(s => {
        if (s.rel === '財') { if (s.daHua === '祿') { n += 3; why.push(s.name + '為財・大限化祿（財給你）'); } else if (s.daHua === '權') { n += 2; why.push(s.name + '為財・大限化權（自己主導財）'); } else if (s.daHua === '忌') { n -= 2; why.push(s.name + '為財・大限化忌（財被收）'); } else { n += 1; why.push(s.name + '為財'); } }
        else if (s.rel === '官殺' && s.daHua === '祿') { n += 2; why.push(s.name + '官殺化祿（被管得財）'); }
        else if (s.rel === '食傷' && s.daHua === '祿') { n += 2; why.push(s.name + '食傷化祿（作品變現）'); }
        else if (s.rel === '比劫') { n -= 1; why.push(s.name + '比劫（成果共分）'); }
        else if (s.daHua === '忌') { n -= 1; why.push(s.name + '大限化忌'); }
      });
      if (r.zhiRel === '財' && r.zhiFav !== '忌') { n += 1; why.push(r.zhi + '宮為財（環境本身可取）'); }
      if (r.oppStars.some(x => x.rel === '財' && x.fav !== '忌')) { n += 1; why.push('對宮' + r.oppStars.filter(x => x.rel === '財').map(x => x.name).join('') + '為財（財在外）'); }
      if (r.palaceName === '財帛' || r.palaceName === '田宅') { n += 1; why.push('題目在' + r.palaceName); }
      const ageStage = ageStageOf(r.start, r.end);
      if (n > 0) daen.push({ y0: r.y0, y1: r.y1, start: r.start, end: r.end, ganZhi: r.ganZhi, palaceName: r.palaceName, score: n, grade: grade(n), reasons: why, tag: r.tag, currency: ageStage.cai, ageStage: ageStage.name });
      /* 流年層 */
      for (let y = r.y0; y <= r.y1; y++) {
        const gz = gzByYear[y]; if (!gz) continue;
        let m = 0; const w2 = [];
        const g = gz.charAt(0), z = gz.charAt(1), ge = GAN_ELEMENT[g], ze = ZHI_ELEMENT[z];
        if (relation(ge, dm.element) === '財') { m += 1 + (favOf(ge, fav, unfav) === '喜' ? 1 : 0); w2.push('流年干' + g + ge + '為財' + (favOf(ge, fav, unfav) === '喜' ? '・喜' : '')); }
        if (relation(ze, dm.element) === '財') { m += 1; w2.push('流年支' + z + ze + '為財'); }
        const hm = SI_HUA[g] || {};
        r.stars.forEach(s => { const h = hm[s.name]; if (!h) return;
          if (h === '祿') { m += 2 + (s.rel === '財' ? 1 : 0); w2.push('流年' + s.name + '化祿入大限命宮' + (s.rel === '財' ? '（主星為財）' : '')); }
          else if (h === '權' && s.rel === '財') { m += 1; w2.push('流年' + s.name + '化權（財星主導）'); }
          else if (h === '忌') { m -= 2; w2.push('流年' + s.name + '化忌入大限命宮'); } });
        if (n >= 2) { m += 1; w2.push('大限財路成立（' + grade(n) + '）'); }
        if (m >= 2) annual.push({ year: y, gz, daGanZhi: r.ganZhi, palaceName: r.palaceName, score: m, grade: grade(m), reasons: w2, currency: ageStage.cai });
      }
    });
    return { schema: 'xiaoliu.wealth-tuixiang/v1', method: 'bazi-body x ziwei-daen-environment x sihua', affectsCurve: false, dayMaster: dm, daen, annual };
  }

  return { buildMainline, scoreMainline, scoreAnnual, wealthSignals, relation, dayMasterOf, ageStageOf, AGE_STAGES, VERDICT, W, GAN_ELEMENT, ZHI_ELEMENT, version: '0.9.36' };
}));
