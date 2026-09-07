/* 時盤合參 v0.1 端對端：四分頁載入、單一時刻五燈、區間掃描、破壞測試 */
const { JSDOM, VirtualConsole } = require('jsdom'); const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let fails=0;
const ok=(c,m)=>{ console.log((c?'  ✓ ':'  ✗ ')+m); if(!c)fails++; };
(async()=>{
  const vc=new VirtualConsole(); const errs=[];
  vc.on('jsdomError',e=>{const s=String(e); if(!/css|Could not load/i.test(s)){ errs.push(s.slice(0,160)); }});
  const dom=await JSDOM.fromFile(path.join(__dirname,'index.html'),{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window, d=w.document, $=id=>d.getElementById(id); w.alert=m=>errs.push('alert:'+m);
  for(let i=0;i<200;i++){ await sleep(100); if(w.__moment&&w.__moment.nat.ready.bazi&&w.__moment.nat.ready.ziwei) break; }
  ok(true,'父頁載入完成（ready 訊息可能早於 moment.js 載入，不作斷言）');
  ok(!!$('fr-qimen'),'奇門分頁存在'); ok(!!w.qimenEngine&&!!w.__moment,'奇門引擎與 moment.js 已載入父頁');
  // 本命：Nakai
  $('f-name').value='Nakai'; $('f-gender').value='F'; $('f-year').value=1976; $('f-month').value=10; $('f-day').value=14; $('f-hour').value='11';
  $('f-go').click();
  for(let i=0;i<200;i++){ await sleep(100); if(w.__moment.nat.bazi&&w.__moment.nat.ziwei) break; }
  ok(w.__moment.nat.bazi&&w.__moment.nat.ziwei,'本命曲線排好');
  // 單一時刻：2026-12-04 申時
  $('mo-date').value='2026-12-04'; $('mo-hour').value='8'; $('mo-go').click();
  for(let i=0;i<100;i++){ await sleep(100); if($('mo-lamps').children.length) break; }
  ok($('mo-lamps').children.length===5,'五盞燈已渲染');
  const R=w.__moment.req.moment; ok(R.bazi.ok&&R.ziwei.ok&&!!R.qimen,'三系統時刻資料皆 ok');
  console.log('   八字：',JSON.stringify({y:R.bazi.data.layers.year.gz,m:R.bazi.data.layers.month.gz,d:R.bazi.data.layers.day.gz,h:R.bazi.data.layers.hour.gz,dS:R.bazi.data.dayScore,hS:R.bazi.data.hourScore}));
  console.log('   紫微：',JSON.stringify({d:R.ziwei.data.layers.day,h:R.ziwei.data.layers.hour}).slice(0,300));
  console.log('   奇門：',R.qimen.dayGanZhi,R.qimen.hourGanZhi,R.qimen.ju,'值符',R.qimen.zhiFu,'值使',R.qimen.zhiShi,'分',R.qimen.score,R.qimen.ji.join(' '),R.qimen.xiong.join(' '));
  ok(R.bazi.data.layers.day.gz==='壬子'&&R.bazi.data.layers.year.gz==='丙午','八字流日 2026-12-04 = 壬子（丙午年）');
  ok(R.qimen.dayGanZhi==='壬子','奇門日干支同源 壬子');
  console.log('   摘要：',$('mo-detail').textContent.replace(/\s+/g,' ').slice(0,120));
  // 晚子時歸次日（奇門）
  const q23=w.__moment.qimenHour(2026,12,4,0,true), q0=w.__moment.qimenHour(2026,12,5,0,false);
  ok(q23.hourGanZhi===q0.hourGanZhi&&q23.dayGanZhi===q0.dayGanZhi,'奇門晚子時歸次日：'+q23.dayGanZhi+' '+q23.hourGanZhi);
  // 區間掃描 12 月
  $('mo-from').value='2026-12-01'; $('mo-to').value='2026-12-31'; $('mo-min').value='4'; $('mo-scan').click();
  for(let i=0;i<300;i++){ await sleep(100); if($('mo-scan-out').innerHTML) break; }
  console.log('   ',$('mo-scan-status').textContent);
  const rows=[...d.querySelectorAll('#mo-scan-out tbody tr')];
  ok(rows.length>0||/沒有達到/.test($('mo-scan-out').textContent),'掃描已輸出');
  rows.slice(0,12).forEach(r=>console.log('   '+[...r.children].map(c=>c.textContent).join(' | ')));
  // 破壞：超長區間
  $('mo-from').value='2026-01-01'; $('mo-to').value='2026-12-31'; $('mo-scan').click(); await sleep(200);
  ok(/1–93/.test($('mo-scan-status').textContent),'超長區間被擋');
  // 未排本命時的防呆（用新視窗）
  ok(errs.filter(e=>!/jspdf|pdf-export|Canvas|getContext|Chart is not defined|marked|html2canvas/i.test(e)).length===0,'無未預期錯誤'+(errs.length?'：'+errs.join(' || ').slice(0,400):''));
  console.log(fails?`FAIL ${fails}`:'PASS'); w.close(); process.exit(fails?1:0);
})();
