(function () {
  'use strict';
  const Q = window.qimenEngine; Q.setSolarLunar(window.solarLunar);
  const $ = id => document.getElementById(id);
  $('ver').textContent = 'v' + Q.VERSION;
  const ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  // 後天八卦方位沿用原盤：南上、北下、東左、西右。
  const RING = [9,2,7,6,1,8,3,4];
  const OUTER = [[29.2893,0],[70.7107,0],[100,29.2893],[100,70.7107],[70.7107,100],[29.2893,100],[0,70.7107],[0,29.2893]];
  const INNER = OUTER.map(([x,y]) => [50+(x-50)*0.38,50+(y-50)*0.38]);
  const BAGUA = {9:['☲',50,16.5],2:['☷',75,25],7:['☱',86.5,50],6:['☰',75,75],1:['☵',50,83.5],8:['☶',25,75],3:['☳',13.5,50],4:['☴',25,25],5:['',50,50]};
  function palaceShape(p) {
    const i = RING.indexOf(p), j = (i+1)%8;
    const points = p === 5 ? INNER : [OUTER[i],OUTER[j],INNER[j],INNER[i]];
    return `<svg class="pal-shape" viewBox="-0.5 -0.5 101 101" aria-hidden="true" focusable="false"><polygon points="${points.map(pair=>pair.join(',')).join(' ')}" /></svg>`;
  }
  function renderPalaceLines() {
    const lines = document.createElementNS('http://www.w3.org/2000/svg','svg');
    lines.setAttribute('class','bagua-lines');
    lines.setAttribute('viewBox','-0.5 -0.5 101 101');
    lines.setAttribute('aria-hidden','true'); lines.setAttribute('focusable','false');
    const loop = points => `M ${points.map(pair=>pair.join(',')).join(' L ')} Z`;
    const spokes = OUTER.map((point,i)=>`M ${point.join(',')} L ${INNER[i].join(',')}`).join(' ');
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`${loop(OUTER)} ${loop(INNER)} ${spokes}`);
    lines.appendChild(path); $('grid').appendChild(lines);
  }
  const ELEM = {休門:'水',生門:'土',傷門:'木',杜門:'木',景門:'火',死門:'土',驚門:'金',開門:'金',天蓬:'水',天芮:'土',天沖:'木',天輔:'木',天禽:'土',天心:'金',天柱:'金',天任:'土',天英:'火',值符:'土',螣蛇:'火',太陰:'金',六合:'木',白虎:'金',玄武:'水',九地:'土',九天:'金'};
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const wx = n => `<span class="e-${ELEM[n.replace('+禽','')] || ''}">${esc(n)}</span>`;
  const palaceName = p => Q.consts.PALACE_NAME[p];
  const patClass = p => p.grade === '忌' ? 'zhu' : p.name === '青龍返首' ? 'qing' : 'jin';
  let cur = null, sel = 0, scanToken = 0, scanRows = [], shownRows = 0;
  let ringMoment = null, boardMode = window.innerWidth < 600 ? 'read' : 'fit';

  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('請選擇完整日期。');
    const [y,m,d] = value.split('-').map(Number), date = new Date(y,m-1,d,12);
    if (iso(date) !== value) throw new Error('日期無效，請重新選擇。');
    if (y < 1931 || y > 2100) throw new Error('請選擇 1931–2100 年之間的日期。');
    return {y,m,d,date};
  }
  function shift(value, n) {
    const date = parseDate(value).date; date.setDate(date.getDate()+n); return iso(date);
  }
  function currentMoment() {
    const time = new Date(), day = new Date(time.getTime());
    if (time.getHours() === 23) day.setDate(day.getDate()+1);
    return {time, day:iso(day), hour:Math.floor((time.getHours()+1)/2)%12};
  }
  function status(message, error = false) {
    $('dateStatus').textContent = message; $('dateStatus').classList.toggle('error',error);
  }
  function period(day, h) {
    if (h === 0) return `${shift(day,-1)} 23:00 → ${day} 01:00`;
    return `${day} ${pad(h*2-1)}:00–${pad(h*2+1)}:00`;
  }
  function clearChart(message) {
    cur = null; $('dayline').textContent = '排盤尚未更新';
    for (const id of ['hours','summary','hourhead','grid','tags','palaceFocus','deityRing','ringInfo']) $(id).replaceChildren();
    $('clearFocus').hidden = true; $('chart').hidden = true;
    $('prevHour').disabled = $('nextHour').disabled = true;
    status(message,true);
  }
  function load(value, selected = sel, message = '', exactMoment = null) {
    try {
      const {y,m,d} = parseDate(value), day = Q.computeDay(y,m,d);
      cur = day; sel = selected; ringMoment = exactMoment; $('date').value = value; $('chart').hidden = false;
      $('prevHour').disabled = $('nextHour').disabled = false;
      $('dayline').innerHTML = `${esc(cur.dayGanZhi)}日　${esc(cur.term+cur.yuanName)}　<span class="ju">${esc(cur.juLabel)}</span><small>${esc(cur.yearGanZhi)}年 ${esc(cur.monthGanZhi)}月　${esc(cur.chaoJieLabel)}${cur.leap?'　閏局':''}　符頭 ${esc(cur.fuTouGanZhi)}（${esc(cur.fuTouDate)}）　節氣 ${esc(cur.termDate)}</small>`;
      status(message || `排盤日 ${value} · 夜子時 23:00 換日`);
      renderHours(); show(); return true;
    } catch (e) { clearChart(e.message); return false; }
  }
  function selectHour(index, focus = false) {
    if (!cur) return;
    sel = index; ringMoment = null; renderHours(); show();
    if (focus) $('hours').children[index].focus();
  }
  function renderHours() {
    const moment = currentMoment(); $('hours').replaceChildren();
    cur.hours.forEach((h,i) => {
      const good = h.patterns.filter(p => p.grade === '吉').length;
      const bad = h.patterns.filter(p => p.grade === '忌').length;
      const current = cur.date === moment.day && i === moment.hour;
      const el = document.createElement('button'); el.type = 'button'; el.id = `hour-${i}`;
      el.className = 'hour' + (h.flags.qingLong?' qing':'') + (!h.flags.qingLong && h.flags.feiNiao?' fei':'') + (i === sel?' sel':'');
      el.setAttribute('role','tab'); el.setAttribute('aria-selected',String(i === sel));
      el.setAttribute('aria-controls','chart'); el.tabIndex = i === sel ? 0 : -1;
      el.setAttribute('aria-label',`${h.hourGanZhi}時 ${h.hourRange}，吉格 ${good} 項，忌象 ${bad} 項${current?'，目前時辰':''}`);
      el.title = h.patterns.map(p => `${p.name}・${palaceName(p.palace)}`).join('\n') || '本時無特殊格局';
      el.innerHTML = `<span class="z">${esc(h.hourGanZhi)}</span><span class="g">${esc(h.hourRange)}</span><span class="counts"><span class="good">吉${good}</span><i>／</i><span class="bad">${bad}</span></span><span class="current">${current?'當下':'　'}</span>`;
      el.onclick = () => selectHour(i,true);
      el.onkeydown = e => {
        let target;
        if (e.key === 'ArrowRight') target = (i+1)%12;
        if (e.key === 'ArrowLeft') target = (i+11)%12;
        if (e.key === 'Home') target = 0;
        if (e.key === 'End') target = 11;
        if (target !== undefined) { e.preventDefault(); selectHour(target,true); }
      };
      $('hours').appendChild(el);
    });
  }
  function clearFocus() {
    document.querySelectorAll('.pal.focused').forEach(el => el.classList.remove('focused'));
    document.querySelectorAll('.tag[aria-pressed]').forEach(el => el.setAttribute('aria-pressed','false'));
    $('clearFocus').hidden = true; $('palaceFocus').textContent = '';
  }
  function show() {
    const h = cur.hours[sel], good = h.patterns.filter(p=>p.grade==='吉'), bad = h.patterns.filter(p=>p.grade==='忌');
    $('chart').setAttribute('aria-labelledby',`hour-${sel}`);
    $('summary').innerHTML = `<div class="metric good"><span>吉格</span><strong>${good.length}</strong><small>項</small></div><div class="metric bad"><span>忌象</span><strong>${bad.length}</strong><small>項</small></div><div class="metric"><span>旬空</span><strong class="word">${esc(h.kong.zhi.join(''))}</strong></div><div class="metric"><span>有吉格宮位</span><strong>${new Set(good.map(p=>p.palace)).size}</strong><small>宮</small></div>`;
    $('hourhead').innerHTML = `<span class="selected-time"><b>${esc(h.hourGanZhi)}時</b>　${esc(h.hourRange)}<span class="period">公曆 ${period(cur.date,sel)}</span></span><span>旬首 <b>${esc(h.xunShou)}</b></span><span>值符 <b>${wx(h.zhiFu.star)}</b> 落${palaceName(h.zhiFu.to)}</span><span>值使 <b>${wx(h.zhiShi.gate)}</b> 落${palaceName(h.zhiShi.to)}</span>`;
    $('grid').replaceChildren();
    ORDER.forEach(p => {
      const x = h.palaces[p], hits = good.filter(q=>q.palace===p);
      const warns = bad.filter(q=>q.palace===p && !q.name.startsWith('符'));
      const short = q => q.name==='門迫'?'迫':q.name==='擊刑'?'刑':q.name.endsWith('入墓')?'墓':q.name;
      const el = document.createElement('div'); el.id = `palace-${p}`;
      el.className = 'pal' + (p===5?' center':'') + (hits.some(q=>q.name==='青龍返首')?' hit-qing':hits.length?' hit-fei':'');
      if (p===5) {
        el.innerHTML = `<div class="nm">中宮</div><div class="gan"><span class="stem"><small>地</small><span class="d">${esc(x.diPan)}</span></span></div><div class="rows">${esc(cur.juLabel)}<br>${esc(cur.dayGanZhi)}日 ${esc(h.hourGanZhi)}時<br>寄坤</div>`;
      } else {
        el.innerHTML = `<div class="nm"><span>${esc(x.name+x.dir)}</span><span class="kong" title="${esc(warns.map(q=>q.name).concat(x.kong?['空亡']:[]).join('、'))}">${[...warns.map(short),...(x.kong?['空']:[])].map(esc).join(' ')}</span></div><div class="gan"><span class="stem"><small>天</small><span class="t">${esc(x.tianPan)}</span>${x.tianPan2?`<span class="t2" title="寄干">${esc(x.tianPan2)}</span>`:''}</span><span class="stem"><small>地</small><span class="d">${esc(x.diPan)}</span></span></div><div class="rows"><div class="datum"><small>星</small>${wx(x.star)}</div><div class="datum"><small>門</small>${wx(x.gate)}</div><div class="datum"><small>神</small>${wx(x.god)}</div></div><div class="pal-count">${hits.length?`吉格 ${hits.length} 項`:'　'}</div>`;
      }
      const [symbol,cx,cy] = BAGUA[p];
      const content = document.createElement('div'); content.className = 'pal-content';
      content.innerHTML = el.innerHTML;
      content.style.left = `${(cx+0.5)/101*100}%`; content.style.top = `${(cy+0.5)/101*100}%`;
      const name = content.querySelector('.nm');
      if (p !== 5) name.firstElementChild.innerHTML = `<span class="trigram" aria-hidden="true">${symbol}</span> ${esc(x.name)}${'一二三四五六七八九'[p-1]} <span class="direction">${esc(x.dir)}</span>`;
      else name.textContent = '中五';
      el.innerHTML = palaceShape(p); el.appendChild(content);
      el.setAttribute('role','group'); el.setAttribute('aria-label',`${x.name}宮 ${x.dir}`);
      $('grid').appendChild(el);
    });
    renderPalaceLines();
    $('tags').replaceChildren();
    h.patterns.forEach(q => {
      const el = document.createElement('button'); el.type = 'button'; el.className = 'tag '+patClass(q);
      el.setAttribute('aria-pressed','false'); el.dataset.palace = q.palace;
      el.textContent = `${q.grade} · ${q.name}・${palaceName(q.palace)}${q.note?'　'+q.note:''}`;
      el.onclick = () => {
        const wasActive = el.getAttribute('aria-pressed') === 'true'; clearFocus();
        if (wasActive) return;
        el.setAttribute('aria-pressed','true'); $(`palace-${q.palace}`).classList.add('focused'); $('clearFocus').hidden = false;
        $('palaceFocus').textContent = `${palaceName(q.palace)}宮｜` + h.patterns.filter(p=>p.palace===q.palace).map(p=>`${p.grade}・${p.name}`).join('　');
      };
      $('tags').appendChild(el);
    });
    if (!h.patterns.length) $('tags').textContent = '本時無特殊格局';
    clearFocus(); renderDeityRing(); updateBoardSize();
  }
  function updateBoardSize() {
    const width = $('boardViewport').clientWidth || 692;
    const scale = boardMode === 'fit' ? Math.min(1,width/900) : 1;
    $('boardStage').style.transform = `scale(${scale})`;
    $('boardStageWrap').style.width = `${900*scale}px`;
    $('boardStageWrap').style.height = `${900*scale}px`;
    $('boardFit').setAttribute('aria-pressed',String(boardMode==='fit'));
    $('boardRead').setAttribute('aria-pressed',String(boardMode==='read'));
  }
  $('boardFit').onclick = () => { boardMode='fit'; updateBoardSize(); $('boardViewport').scrollLeft=0; };
  $('boardRead').onclick = () => { boardMode='read'; updateBoardSize(); };
  if (window.ResizeObserver) new ResizeObserver(updateBoardSize).observe($('boardViewport'));
  else window.addEventListener('resize',updateBoardSize);

  function renderDeityRing() {
    const {y,m,d} = parseDate(cur.date);
    // 手選時辰以中點代表（子 00:00，丑 02:00…）；「現在」採實際公曆分鐘。
    const time = ringMoment || new Date(y,m-1,d,sel*2,0);
    const rules = window.qimenRingRules.compute(window.solarLunar,time.getFullYear(),time.getMonth()+1,time.getDate(),time.getHours(),time.getMinutes(),cur.dayGanZhi[0]);
    const point = (radius,angle) => {
      const a=angle*Math.PI/180; return [450+radius*Math.cos(a),450+radius*Math.sin(a)];
    };
    const ring = $('deityRing'); ring.replaceChildren();
    rules.cells.forEach((cell,i) => {
      const angle=90+i*30, start=angle-15, end=angle+15;
      const a=point(446,start),b=point(446,end),c=point(374,end),d=point(374,start);
      const [tx,ty] = point(410,angle);
      let rotation=(angle+90)%360;
      if (rotation>90 && rotation<270) rotation-=180;
      if (rotation>=270) rotation-=360;
      const group = document.createElementNS('http://www.w3.org/2000/svg','g');
      group.setAttribute('class','deity-sector'+(cell.selected?' is-selected':''));
      group.setAttribute('role','listitem'); group.dataset.branch=cell.branch;
      group.setAttribute('aria-label',`${cell.branch}位，建除：${cell.jianChu}，月將：${cell.yueJiang}，貴人十二神：${cell.guiRen}${cell.selected?'，所選時支':''}`);
      group.innerHTML = `<title>${cell.branch}位｜建除：${cell.jianChu}｜月將：${cell.yueJiang}｜貴人十二神：${cell.guiRen}${cell.selected?'｜所選時支':''}</title><path d="M ${a} A 446 446 0 0 1 ${b} L ${c} A 374 374 0 0 0 ${d} Z"/><g transform="translate(${tx} ${ty}) rotate(${rotation})"><text class="ring-jianchu" x="0" y="-18" text-anchor="middle">${cell.branch}・${cell.jianChu}</text><text class="ring-general" x="0" y="3" text-anchor="middle">${cell.yueJiang}</text><text class="ring-guiren" x="0" y="24" text-anchor="middle">${cell.guiRen}</text></g>`;
      ring.appendChild(group);
    });
    const stamp=`${iso(time)} ${pad(time.getHours())}:${pad(time.getMinutes())}`;
    $('ringInfo').textContent = `月將 ${rules.monthlyGeneral} 加${rules.hourBranch}時 · ${rules.hourBranch}位起建 · ${rules.guiRen.dayGan}日${rules.guiRen.isDay?'晝貴':'夜貴'}落${rules.guiRen.startBranch}（${rules.guiRen.clockwise?'順布':'逆布'}）｜${ringMoment?'當下時間':'時辰代表時間'} ${stamp}`;
    ring.dataset.monthlyGeneral=rules.monthlyGeneral;
    ring.dataset.referenceTime=stamp;
    renderHourWuFu(time);
  }
  function renderHourWuFu(time) {
    const result = window.qimenWuFu.compute(time);
    const palace = {乾:6,坤:2,艮:8,巽:4,中:5}[result.palace];
    const target = $(`palace-${palace}`);
    target.classList.add('has-wufu');
    target.dataset.wufuSlot=result.slot;
    const label = document.createElement('span'); label.className='wufu-badge';
    label.textContent='時五福';
    label.title=`${result.palace}宮・宮內第 ${result.slot}／45 位・時積數 ${result.hourJishu}`;
    label.setAttribute('aria-label',`時五福落${result.palace}宮，宮內第${result.slot}位`);
    let count = target.querySelector('.pal-count');
    if (!count) { count=document.createElement('div');count.className='pal-count';target.querySelector('.pal-content').appendChild(count); }
    const hits = cur.hours[sel].patterns.filter(p=>p.palace===palace && p.grade==='吉').length;
    count.replaceChildren(label);
    if (hits) { const good=document.createElement('span');good.className='wufu-good';good.textContent=`吉${hits}`;good.title=`本宮吉格 ${hits} 項`;count.appendChild(good); }
    const info=document.createElement('span');info.className='wufu-info';
    info.innerHTML=`時五福 <b>${result.palace}宮</b> <small>宮內第 ${result.slot}／45 位</small>`;
    info.title=`太乙時積數 ${result.hourJishu}`;
    $('hourhead').appendChild(info);
  }
  function pdfSnapshot() {
    const {y,m,d}=parseDate(cur.date),time=ringMoment||new Date(y,m-1,d,sel*2,0);
    const focused=$('grid').querySelector('.pal.focused');
    return JSON.parse(JSON.stringify({day:cur,hour:cur.hours[sel],
      period:$('hourhead').querySelector('.period').textContent,ringInfo:$('ringInfo').textContent,
      rings:window.qimenRingRules.compute(window.solarLunar,time.getFullYear(),time.getMonth()+1,time.getDate(),time.getHours(),time.getMinutes(),cur.dayGanZhi[0]),
      wufu:window.qimenWuFu.compute(time),focused:focused?Number(focused.id.replace('palace-','')):null,
      names:Q.consts.PALACE_NAME,elements:ELEM,geometry:{outer:OUTER,inner:INNER,bagua:BAGUA,order:ORDER,ring:RING}
    }));
  }
  $('exportPdf').onclick = async () => {
    const button=$('exportPdf');if(button.disabled)return;
    if(!cur){$('pdfStatus').textContent='請先選擇有效日期完成排盤。';return;}
    button.disabled=true;button.textContent='PDF 製作中…';$('pdfStatus').textContent='正在製作完整盤面 PDF…';
    try{
      const snapshot=pdfSnapshot();
      if(!window.jspdf?.jsPDF||!window.qimenPdf)throw new Error('缺少 PDF 元件，請確認已完整解壓縮更新檔。');
      if(document.fonts?.ready)await document.fonts.ready;
      const canvas=window.qimenPdf.render(document.createElement('canvas'),snapshot);
      const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
      pdf.setProperties({title:`奇門遁甲 ${snapshot.day.date} ${snapshot.hour.hourGanZhi}時`,subject:'八卦盤、十二神及時五福',creator:'小六太乙・奇門遁甲'});
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,210,297,undefined,'FAST');
      await pdf.save(`qimen-${snapshot.day.date}-${snapshot.hour.hourZhi}時.pdf`,{returnPromise:true});
      $('pdfStatus').textContent=`已輸出 ${snapshot.day.date} ${snapshot.hour.hourGanZhi}時盤面 PDF。`;
    }catch(e){$('pdfStatus').textContent=`PDF 輸出失敗：${e.message}`;}
    finally{button.disabled=false;button.textContent='輸出盤面圖PDF';}
  };
  function goNow() {
    const m = currentMoment();
    load(m.day,m.hour,`已定位 ${iso(m.time)} ${pad(m.time.getHours())}:${pad(m.time.getMinutes())}（裝置當地時間） · 排盤日 ${m.day}${m.time.getHours()===23?'，夜子時歸次日':''}`,m.time);
  }
  function stepDay(n) {
    try { load(shift($('date').value,n)); } catch(e) { clearChart(e.message); }
  }
  function stepHour(n) {
    if (!cur) return;
    const next = sel+n;
    try { load(shift(cur.date,next<0?-1:next>11?1:0),(next+12)%12); } catch(e) { clearChart(e.message); }
  }
  $('date').onchange = e => load(e.target.value);
  $('prev').onclick = () => stepDay(-1); $('next').onclick = () => stepDay(1);
  $('today').onclick = () => load(iso(new Date())); $('now').onclick = goNow;
  $('prevHour').onclick = () => stepHour(-1); $('nextHour').onclick = () => stepHour(1);
  $('clearFocus').onclick = clearFocus;

  function scanNames() {
    const names = [];
    if ($('incQing').checked) names.push('青龍返首');
    if ($('incFei').checked) names.push('飛鳥跌穴');
    if ($('incYu').checked) names.push('玉女守門');
    if ($('incQi').checked) names.push('乙奇得時遇甲','丙奇得時遇甲');
    if ($('incAll').checked) names.push('天遁','地遁','人遁','風遁','雲遁','龍遁','虎遁','神遁','鬼遁','真詐','重詐','休詐','天假','地假','人假','神假','鬼假');
    return names;
  }
  function scanBusy(busy) {
    $('run').disabled = busy; $('cancelScan').hidden = !busy;
    $('scanout').setAttribute('aria-busy',String(busy));
  }
  function appendScanRows() {
    const end = Math.min(shownRows+100,scanRows.length), body = $('scanBody');
    for (let i=shownRows;i<end;i++) {
      const r = scanRows[i], tr = document.createElement('tr'); tr.className = 'result-row';
      tr.innerHTML = `<td><button class="open-chart" aria-label="查看 ${r.date} ${r.hour}時命盤">${r.date}<small>${r.dayGanZhi}日 · 查看盤</small></button></td><td>${r.hour}<small>${r.hourRange}</small></td><td>${r.ju}</td><td class="${r.patterns.some(p=>p.startsWith('青龍'))?'q':''}">${r.patterns.map(p=>`<span class="result-tag">${esc(p)}</span>`).join('')}</td><td class="c">${r.caveats.length?r.caveats.map(p=>`<span class="result-tag">${esc(p)}</span>`).join(''):'—'}</td>`;
      tr.onclick = () => {
        const index = '子丑寅卯辰巳午未申酉戌亥'.indexOf(r.hour.slice(-1));
        if (load(r.date,index,`掃描選盤 · ${r.date} ${r.hour}時`)) {
          document.querySelectorAll('.result-row.active').forEach(row=>row.classList.remove('active')); tr.classList.add('active');
          $('chart').focus({preventScroll:true}); $('date').scrollIntoView?.({block:'start'});
        }
      };
      body.appendChild(tr);
    }
    shownRows = end; $('moreResults').hidden = shownRows >= scanRows.length;
    $('moreResults').textContent = `再顯示 ${Math.min(100,scanRows.length-shownRows)} 筆（已顯示 ${shownRows}／${scanRows.length}）`;
  }
  async function runScan() {
    const token = ++scanToken; scanRows = []; shownRows = 0; $('scanout').replaceChildren();
    try {
      const from = $('s1').value, to = $('s2').value; parseDate(from); parseDate(to);
      if (from > to) throw new Error('開始日不能晚於結束日，請調整日期。');
      const names = scanNames(); if (!names.length) throw new Error('請至少選擇一種要掃描的格局。');
      const total = Math.round((parseDate(to).date-parseDate(from).date)/864e5)+1;
      scanBusy(true); let date = from, done = 0;
      $('scanStatus').textContent = `準備掃描 ${from} 至 ${to}，共 ${total} 天…`;
      await new Promise(resolve=>setTimeout(resolve,0));
      while (date <= to) {
        if (token !== scanToken) return;
        const {y,m,d} = parseDate(date);
        scanRows.push(...Q.scanPatterns(y,m,d,y,m,d,names)); done++;
        if (done%4 === 0) {
          $('scanStatus').textContent = `掃描中 ${done}／${total} 天 · 已找到 ${scanRows.length} 個時辰`;
          await new Promise(resolve=>setTimeout(resolve,0));
        }
        if (date === to) break;
        date = shift(date,1);
      }
      if (token !== scanToken) return;
      const days = new Set(scanRows.map(r=>r.date)).size, count = scanRows.reduce((n,r)=>n+r.patterns.length,0);
      $('scanStatus').textContent = `${from} 至 ${to} · 已掃描 ${total} 天｜符合 ${days} 天／${scanRows.length} 個時辰／${count} 筆格局`;
      if (!scanRows.length) { $('scanout').innerHTML = '<p class="empty">這段日期沒有出現指定格局，可調整區間或格局條件。</p>'; return; }
      $('scanout').innerHTML = '<p class="result-hint">點選結果回盤。日期為排盤日；子時自前一日 23:00 起。忌象列出命中宮位之忌與符伏吟／符反吟。</p><div class="table-wrap" tabindex="0" role="region" aria-label="掃描結果，窄螢幕可左右捲動"><table><thead><tr><th scope="col">排盤日</th><th scope="col">時辰</th><th scope="col">局數</th><th scope="col">命中格局・宮位</th><th scope="col">相關忌象</th></tr></thead><tbody id="scanBody"></tbody></table></div><button id="moreResults" class="more"></button>';
      $('moreResults').onclick = appendScanRows; appendScanRows();
    } catch(e) {
      if (token === scanToken) { scanRows = []; $('scanout').replaceChildren(); $('scanStatus').textContent = e.message; }
    } finally { if (token === scanToken) scanBusy(false); }
  }
  $('run').onclick = runScan;
  $('cancelScan').onclick = () => { scanToken++; scanRows = []; scanBusy(false); $('scanStatus').textContent = '已停止掃描，可調整條件後重新掃描。'; };
  for (const id of ['s1','s2','incQing','incFei','incYu','incQi','incAll']) $(id).onchange = () => {
    scanToken++; scanRows = []; scanBusy(false); $('scanout').replaceChildren();
    $('scanStatus').textContent = '條件已變更，請按「掃描」更新結果。';
  };
  const today = iso(new Date()); $('s1').value = today;
  try { $('s2').value = shift(today,29); } catch (_) { $('s2').value = today; }
  goNow();
  // Refresh only the current-time marker; retain the user's selected research chart.
  setInterval(() => { if(cur && !document.hidden && !$('hours').contains(document.activeElement)) renderHours(); },60000);
})();
