/* moment.js — 時盤合參 v0.1（2026-09-07）
   八字／紫微走子頁 moment-bridge v1；奇門以 qimen/qimen-engine.js 在父頁本地計算。
   燈的門檻與奇門局分為 v0.1 假設，等 Nakai 依實證定案；本檔不動任何既有曲線邏輯。 */
(function(){
  var NS='xl-merge-bridge';
  var $=function(id){ return document.getElementById(id); };
  var Q=window.qimenEngine; if(Q&&window.solarLunar) Q.setSolarLunar(window.solarLunar);
  var PN=Q?Q.consts.PALACE_NAME:{};
  var ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var MAX_SCAN_DAYS=93;

  /* ---------- 奇門局分（v0.1 假設） ---------- */
  var QW={ '青龍返首':3,'飛鳥跌穴':3,'玉女守門':2,'真詐':2,'重詐':2,'休詐':2,'乙奇得時遇甲':1,'丙奇得時遇甲':1 };
  function qimenScore(h){
    var s=0, ji=[], xiong=[];
    h.patterns.forEach(function(p){
      if(p.grade==='吉'){
        var w=QW[p.name]!==undefined?QW[p.name]:(/遁$/.test(p.name)?2:0);   // 九遁 +2、五假 0
        s+=w; ji.push(p.name+'@'+PN[p.palace]+(w?'':'（不計分）'));
      }else{
        var hitWing=(p.palace===h.zhiFu.to||p.palace===h.zhiShi.to);
        if(p.name==='符伏吟'||p.name==='符反吟'){ s-=2; xiong.push(p.name); }
        else if(hitWing){ s-=1; xiong.push(p.name+'@'+PN[p.palace]); }
      }
    });
    return { score:s, ji:ji, xiong:xiong };
  }
  function qimenHour(y,m,d,h,lateZi){
    if(!Q) return null;
    var dt=new Date(Date.UTC(y,m-1,d));
    if(lateZi){ dt=new Date(dt.getTime()+86400000); h=0; }
    var day=Q.computeDay(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate());
    var hr=day.hours[h], sc=qimenScore(hr), zs=hr.palaces[hr.zhiShi.to], zf=hr.palaces[hr.zhiFu.to];
    return { date:day.date, dayGanZhi:day.dayGanZhi, ju:day.juLabel, term:day.term+day.yuanName, leap:day.leap,
      hourGanZhi:hr.hourGanZhi, hourRange:hr.hourRange, xunShou:hr.xunShou,
      zhiFu:hr.zhiFu.star+'→'+PN[hr.zhiFu.to], zhiShi:hr.zhiShi.gate+'→'+PN[hr.zhiShi.to],
      zhiShiPalace:{ name:PN[hr.zhiShi.to], tian:zs.tianPan+(zs.tianPan2||''), di:zs.diPan, star:zs.star, god:zs.god },
      zhiFuPalace:{ name:PN[hr.zhiFu.to], tian:zf.tianPan+(zf.tianPan2||''), di:zf.diPan, gate:zf.gate, god:zf.god },
      kong:hr.kong.palaces.map(function(p){return PN[p];}).join(''), score:sc.score, ji:sc.ji, xiong:sc.xiong };
  }

  /* ---------- 燈 ---------- */
  function lampB(x){ return x&&x.score>0; }
  function lampZ(x){ return x&&x.score>0&&x.label!=='caution'; }
  function lampQ(x){ return x&&x.score>0; }

  /* ---------- 橋接 ---------- */
  var REQ={ moment:null, scan:null }, NAT={ bazi:false, ziwei:false, ready:{bazi:false,ziwei:false} };
  function send(id,msg){ try{ $(id).contentWindow.postMessage(Object.assign({xl:NS},msg),'*'); }catch(e){} }
  function natalReady(){ return NAT.bazi&&NAT.ziwei; }
  window.addEventListener('message',function(ev){
    var d=ev.data; if(!d||d.xl!==NS) return;
    if(d.type==='ready'&&NAT.ready[d.from]!==undefined) NAT.ready[d.from]=true;
    if(d.type==='bazi-curve') NAT.bazi=!!d.ok;
    if(d.type==='ziwei-curve') NAT.ziwei=!!d.ok;
    if(d.type==='bazi-moment'||d.type==='ziwei-moment'){
      if(!REQ.moment) return; REQ.moment[d.from]=d;
      if(REQ.moment.bazi&&REQ.moment.ziwei) renderMoment();
    }
    if(d.type==='bazi-moment-scan'||d.type==='ziwei-moment-scan'){
      if(!REQ.scan) return; REQ.scan[d.from]=d;
      if(REQ.scan.bazi&&REQ.scan.ziwei) renderScan();
    }
  });

  function parseDate(v){ if(!v) return null; var p=v.split('-').map(Number); return p.length===3&&p[0]?{y:p[0],m:p[1],d:p[2]}:null; }
  function fmtD(o){ return o.y+'-'+('0'+o.m).slice(-2)+'-'+('0'+o.d).slice(-2); }
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }
  function todayLocal(){ var n=new Date(); return {y:n.getFullYear(),m:n.getMonth()+1,d:n.getDate()}; }
  function setNow(){
    var n=new Date(), hr=n.getHours();
    $('mo-date').value=fmtD(todayLocal());
    $('mo-hour').value= hr===23?'lateZi':String(Math.floor((hr+1)/2)%12);
  }

  /* ---------- 單一時刻 ---------- */
  $('mo-go').onclick=function(){
    if(!natalReady()){ $('mo-status').innerHTML='<span class="err">請先在首頁排好本命（八字與紫微）。</span>'; return; }
    var dt=parseDate($('mo-date').value); if(!dt){ $('mo-status').innerHTML='<span class="err">請選日期</span>'; return; }
    var hv=$('mo-hour').value, lateZi=hv==='lateZi', h=lateZi?0:+hv;
    var input={y:dt.y,m:dt.m,d:dt.d,h:h,lateZi:lateZi};
    REQ.moment={ input:input, bazi:null, ziwei:null, qimen:null };
    try{ REQ.moment.qimen=qimenHour(dt.y,dt.m,dt.d,h,lateZi); }catch(e){ REQ.moment.qimen=null; REQ.moment.qimenErr=String(e.message||e); }
    $('mo-status').textContent='計算中…'; $('mo-lamps').innerHTML=''; $('mo-detail').innerHTML='';
    send('fr-bazi',{type:'moment',input:input}); send('fr-ziwei',{type:'moment',input:input});
  };
  $('mo-now').onclick=function(){ setNow(); $('mo-go').click(); };

  function lampHtml(name,on,score,gz){
    return '<div class="mo-lamp '+(on?'on':'off')+'"><div class="nm">'+name+'</div><div class="sc">'+(on?'●':'○')+' '+(score>0?'+':'')+score+'</div><div class="gz">'+esc(gz||'')+'</div></div>';
  }
  function renderMoment(){
    var R=REQ.moment, B=R.bazi.ok?R.bazi.data:null, Z=R.ziwei.ok?R.ziwei.data:null, Qh=R.qimen;
    var errs=[]; if(!B) errs.push('八字：'+R.bazi.error); if(!Z) errs.push('紫微：'+R.ziwei.error); if(!Qh) errs.push('奇門：'+(R.qimenErr||'未載入'));
    $('mo-status').innerHTML=errs.length?'<span class="err">'+esc(errs.join('；'))+'</span>':'';
    var lamps=[
      {n:'八字流日', on:B&&lampB(B.layers.day), s:B?B.layers.day.score:0, gz:B?B.layers.day.gz:''},
      {n:'八字流時', on:B&&lampB(B.layers.hour), s:B?B.layers.hour.score:0, gz:B?B.layers.hour.gz:''},
      {n:'紫微流日', on:Z&&lampZ(Z.layers.day), s:Z?Z.layers.day.score:0, gz:Z?Z.layers.day.zhi+'宮·'+Z.layers.day.palace:''},
      {n:'紫微流時', on:Z&&lampZ(Z.layers.hour), s:Z?Z.layers.hour.score:0, gz:Z?Z.layers.hour.zhi+'宮·'+Z.layers.hour.palace:''},
      {n:'奇門時局', on:Qh&&lampQ(Qh), s:Qh?Qh.score:0, gz:Qh?Qh.ju:''}
    ];
    var n=lamps.filter(function(l){return l.on;}).length;
    $('mo-lamps').innerHTML=lamps.map(function(l){return lampHtml(l.n,!!l.on,l.s,l.gz);}).join('');
    var html='<div class="mo-sum">一致度 '+n+' / 5　<span class="mu" style="color:var(--muted);font-size:.85rem">'+(n>=4?'四套系統多數同向，值得記進實驗簿對照。':n>=3?'過半亮燈，作為候選時段。':'燈不齊，各有各的功課，不必勉強。')+'</span></div>';
    $('mo-detail').innerHTML=html.replace('<div class="mo-sum">','<div class="mo-sum" style="grid-column:1/-1">')+boxBazi(B)+boxZiwei(Z)+boxQimen(Qh);
  }
  function layerLineB(L){
    var v=L.verdict||{ji:0,xiong:0,net:'—'};
    return '<div><b>'+L.layer+' '+esc(L.gz)+'</b>　'+esc(L.tenGod)+'　干'+L.stemEl+L.stemHit+'／支'+L.branchEl+L.branchHit+'　引動 <span class="ji">吉'+v.ji+'</span> <span class="xiong">凶'+v.xiong+'</span>（'+v.net+'）　分 '+L.score+
      (L.relations&&L.relations.length?'<div class="mu">'+esc(L.relations.join('；'))+'</div>':'')+(L.clashes&&L.clashes.length?'<div class="mu">'+esc(L.clashes.join('；'))+'</div>':'')+'</div>';
  }
  function boxBazi(B){
    if(!B) return '<div class="mo-box"><h4>八字 · 氣</h4><span class="mu">無資料</span></div>';
    return '<div class="mo-box"><h4>八字 · 氣</h4><div class="mu">日主 '+B.dayMaster+'　喜 '+B.favorable.join('')+'　忌 '+B.unfavorable.join('')+'</div>'+
      ['year','month','day','hour'].map(function(k){return layerLineB(B.layers[k]);}).join('')+'</div>';
  }
  function layerLineZ(L,label){
    return '<div><b>'+label+' '+esc(L.gz||'')+'</b>　命宮在'+L.zhi+'（本命'+esc(L.palace)+'）　分 '+L.score+'　'+({auspicious:'<span class="ji">祿權科齊</span>',caution:'<span class="xiong">疊忌</span>',mixed:'混局',normal:'平'})[L.label]+
      (L.triggers.length?'<div class="mu">'+esc(L.triggers.join('；'))+'</div>':'')+'</div>';
  }
  function boxZiwei(Z){
    if(!Z) return '<div class="mo-box"><h4>紫微 · 場</h4><span class="mu">無資料</span></div>';
    return '<div class="mo-box"><h4>紫微 · 場</h4><div class="mu">農曆 '+Z.lunar.year+'年'+(Z.lunar.isLeap?'閏':'')+Z.lunar.month+'月'+Z.lunar.day+'日　虛歲 '+Z.virtualAge+(Z.daen?'　'+Z.daen.ganZhi+'大限（'+Z.daen.palaceName+'）':'')+'</div>'+
      layerLineZ(Z.layers.year,'流年')+layerLineZ(Z.layers.month,'流月')+layerLineZ(Z.layers.day,'流日')+layerLineZ(Z.layers.hour,'流時')+'</div>';
  }
  function boxQimen(Qh){
    if(!Qh) return '<div class="mo-box" style="grid-column:1/-1"><h4>奇門 · 局</h4><span class="mu">無資料</span></div>';
    return '<div class="mo-box" style="grid-column:1/-1"><h4>奇門 · 局</h4><div>'+esc(Qh.date)+' '+esc(Qh.dayGanZhi)+'日 '+esc(Qh.hourGanZhi)+'時（'+esc(Qh.hourRange)+'）　'+esc(Qh.term)+' '+esc(Qh.ju)+(Qh.leap?' 閏局':'')+'　旬首 '+esc(Qh.xunShou)+'　空亡 '+esc(Qh.kong)+'</div>'+
      '<div>值符 '+esc(Qh.zhiFu)+'（天'+esc(Qh.zhiFuPalace.tian)+'／地'+esc(Qh.zhiFuPalace.di)+'　'+esc(Qh.zhiFuPalace.gate)+'　'+esc(Qh.zhiFuPalace.god)+'）</div>'+
      '<div>值使 '+esc(Qh.zhiShi)+'（天'+esc(Qh.zhiShiPalace.tian)+'／地'+esc(Qh.zhiShiPalace.di)+'　'+esc(Qh.zhiShiPalace.star)+'　'+esc(Qh.zhiShiPalace.god)+'）</div>'+
      '<div>局分 '+Qh.score+'　<span class="ji">'+esc(Qh.ji.join('　')||'無吉格')+'</span>　<span class="xiong">'+esc(Qh.xiong.join('　'))+'</span></div></div>';
  }

  /* ---------- 區間掃描 ---------- */
  $('mo-scan').onclick=function(){
    if(!natalReady()){ $('mo-scan-status').innerHTML='<span class="err">請先在首頁排好本命。</span>'; return; }
    var a=parseDate($('mo-from').value), b=parseDate($('mo-to').value);
    if(!a||!b){ $('mo-scan-status').innerHTML='<span class="err">請選起迄日期</span>'; return; }
    var days=(Date.UTC(b.y,b.m-1,b.d)-Date.UTC(a.y,a.m-1,a.d))/86400000+1;
    if(days<1||days>MAX_SCAN_DAYS){ $('mo-scan-status').innerHTML='<span class="err">區間需為 1–'+MAX_SCAN_DAYS+' 天</span>'; return; }
    REQ.scan={ from:a, to:b, min:+$('mo-min').value, bazi:null, ziwei:null };
    $('mo-scan-status').textContent='掃描中…'; $('mo-scan-out').innerHTML='';
    send('fr-bazi',{type:'moment-scan',input:{from:a,to:b}}); send('fr-ziwei',{type:'moment-scan',input:{from:a,to:b}});
  };
  function renderScan(){
    var R=REQ.scan;
    if(!R.bazi.ok||!R.ziwei.ok){ $('mo-scan-status').innerHTML='<span class="err">'+esc((R.bazi.error||'')+' '+(R.ziwei.error||''))+'</span>'; return; }
    var B=R.bazi.data.days, Z=R.ziwei.data.days, rows=[], dist=[0,0,0,0,0,0];
    var qCache={};
    function qOf(y,m,d){ var k=y+'-'+m+'-'+d; if(!qCache[k]) qCache[k]=Q.computeDay(y,m,d); return qCache[k]; }
    for(var i=0;i<B.length;i++){
      var bd=B[i], zd=Z[i]; if(!zd||zd.d!==bd.d) continue;
      var qd=qOf(bd.y,bd.m,bd.d);
      for(var h=0;h<12;h++){
        var qh=qd.hours[h], qs=qimenScore(qh);
        var lamps=[ lampB({score:bd.dayScore}), lampB(bd.hours[h]), lampZ({score:zd.dayScore,label:zd.dayLabel}), lampZ(zd.hours[h]), qs.score>0 ];
        var n=lamps.filter(Boolean).length; dist[n]++;
        if(n>=R.min) rows.push({ date:fmtD(bd), dayGZ:bd.dayGZ, h:h, hourGZ:bd.hours[h].gz, n:n, lamps:lamps,
          b:bd.dayScore+'/'+bd.hours[h].score, z:zd.dayScore+'/'+zd.hours[h].score+'（'+zd.hours[h].zhi+'·'+zd.hours[h].palace+'）', q:qs.score+' '+(qs.ji.slice(0,3).join(' ')), ju:qd.juLabel });
      }
    }
    var total=B.length*12;
    $('mo-scan-status').textContent='共 '+B.length+' 天 '+total+' 個時辰；亮燈分布 5燈 '+dist[5]+'、4燈 '+dist[4]+'、3燈 '+dist[3]+'、2燈 '+dist[2]+'、1燈 '+dist[1]+'、0燈 '+dist[0]+'。';
    if(!rows.length){ $('mo-scan-out').innerHTML='<p class="note">此區間沒有達到門檻的時辰。</p>'; return; }
    var dot=function(b){ return b?'●':'○'; };
    $('mo-scan-out').innerHTML='<table><thead><tr><th>日期</th><th>日</th><th>時辰</th><th>燈</th><th>八日/時</th><th>紫日/時</th><th>奇門</th><th>局</th></tr></thead><tbody>'+
      rows.map(function(r){ return '<tr><td>'+r.date+'</td><td>'+esc(r.dayGZ)+'</td><td>'+esc(r.hourGZ)+' '+ZHI[r.h]+'</td><td class="n">'+r.n+' '+r.lamps.map(dot).join('')+'</td><td>'+r.b+'</td><td>'+esc(r.z)+'</td><td>'+esc(r.q)+'</td><td>'+esc(r.ju)+'</td></tr>'; }).join('')+'</tbody></table>';
  }

  /* ---------- 初始 ---------- */
  setNow();
  var t=todayLocal(), e=new Date(Date.UTC(t.y,t.m-1,t.d+30));
  $('mo-from').value=fmtD(t); $('mo-to').value=fmtD({y:e.getUTCFullYear(),m:e.getUTCMonth()+1,d:e.getUTCDate()});
  window.__moment={ qimenHour:qimenHour, qimenScore:qimenScore, req:REQ, nat:NAT };
})();
