#!/usr/bin/env node
// 用法：node qimen-cli.js 2026-09-05            → 印當日十二時辰
//       node qimen-cli.js scan 2026-09-05 2026-10-05 → 掃區間青龍返首／飛鳥跌穴
const Q = require('./qimen-engine.js'); Q.setSolarLunar(require('./solar-lunar.js'));
const P = Q.consts.PALACE_NAME;
const a = process.argv.slice(2);
const d = s => s.split('-').map(Number);
if (a[0] === 'scan') {
  const [y1,m1,d1] = d(a[1]), [y2,m2,d2] = d(a[2]);
  for (const r of Q.scanPatterns(y1,m1,d1,y2,m2,d2,['青龍返首','飛鳥跌穴','玉女守門','乙奇得時遇甲','丙奇得時遇甲']))
    console.log(r.date, r.dayGanZhi, r.hour, r.hourRange, r.ju, r.patterns.join(' '), r.caveats.length ? '（' + r.caveats.join(' ') + '）' : '');
} else {
  const [y,m,dd] = d(a[0] || new Date().toISOString().slice(0,10));
  const day = Q.computeDay(y,m,dd);
  console.log(`${day.date} ${day.dayGanZhi}日 ${day.term}${day.yuanName} ${day.juLabel} ${day.chaoJieLabel}${day.leap?' 閏局':''} 符頭${day.fuTouGanZhi}${day.fuTouDate.slice(5)}`);
  for (const h of day.hours)
    console.log(` ${h.hourGanZhi} ${h.hourRange} 值符${h.zhiFu.star}→${P[h.zhiFu.to]} 值使${h.zhiShi.gate}→${P[h.zhiShi.to]} ` + h.patterns.map(p => p.name + P[p.palace]).join(' '));
  if (a[1]) { const h = day.hours[+a[1]]; for (const row of [[4,9,2],[3,5,7],[8,1,6]]) console.log(row.map(p => { const x = h.palaces[p]; return p===5 ? `[中 ${x.diPan}]`.padEnd(14) : `${x.tianPan}${x.tianPan2||''}/${x.diPan} ${x.star.replace('天','')} ${x.gate[0]} ${x.god}`.padEnd(16); }).join(' | ')); }
}
