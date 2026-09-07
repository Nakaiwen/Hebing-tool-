/* 高解析盤面 PDF：以同一份排盤快照繪製，不擷取螢幕或依賴外部服務。 */
(function(root){
  'use strict';
  const FONT='"BiauKaiWeb","cwTeXKai","Noto Serif TC","Kaiti TC",serif';
  const C={paper:'#f7f1e4',ink:'#283a2f',moss:'#516b55',gold:'#b99b62',line:'#e3d9c3',card:'#fffdf6',muted:'#716b5e',fire:'#b3402f',qing:'#2f7d6d',wood:'#3f7d36',earth:'#7d5a44',metal:'#c2683f',water:'#365f78'};
  function render(canvas,s) {
    canvas.width=2520;canvas.height=3564;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('無法建立 PDF 繪圖畫布。');
    ctx.scale(2.52,2.52);ctx.fillStyle=C.paper;ctx.fillRect(0,0,1000,1000*297/210);
    function text(value,x,y,size=16,color=C.ink,align='left',weight=400){ctx.font=`${weight} ${size}px ${FONT}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(String(value),x,y);}
    function wrap(value,x,y,width,size=16,color=C.muted,lineHeight=23){
      let line='';ctx.font=`400 ${size}px ${FONT}`;
      for(const ch of Array.from(value)){if(ch==='\n'||ctx.measureText(line+ch).width>width){text(line,x,y,size,color);y+=lineHeight;line=ch==='\n'?'':ch;}else line+=ch;}
      if(line){text(line,x,y,size,color);y+=lineHeight;}return y;
    }
    function polygon(points,fill,stroke){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.stroke();}}
    function roundedRect(x,y,w,h,r,color){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fillStyle=color;ctx.fill();}
    function wx(name){const key=s.elements[name.replace('+禽','')];return ({木:C.wood,火:C.fire,土:C.earth,金:C.metal,水:C.water})[key]||C.ink;}
    const h=s.hour;
    text('奇門遁甲・盤面圖',50,62,30,C.ink,'left',600);
    text(`${s.day.date}　${h.hourGanZhi}時 ${h.hourRange}　${s.day.juLabel}`,50,99,23);
    text(`${s.day.yearGanZhi}年 ${s.day.monthGanZhi}月 ${s.day.dayGanZhi}日　${s.day.term}${s.day.yuanName}　${s.day.chaoJieLabel}${s.day.leap?'・閏局':''}`,50,130,17,C.moss);
    text(s.period,50,156,16,C.muted);
    text(`旬首 ${h.xunShou}　值符 ${h.zhiFu.star}落${s.names[h.zhiFu.to]}　值使 ${h.zhiShi.gate}落${s.names[h.zhiShi.to]}　旬空 ${h.kong.zhi.join('')}`,50,184,17);
    let top=wrap(s.ringInfo,50,211,900,16,C.muted,23);
    text(`時五福 ${s.wufu.palace}宮・宮內第 ${s.wufu.slot}／45 位　時積數 ${s.wufu.hourJishu}`,50,top,17,'#705324', 'left',600);
    const boardTop=Math.max(290,top+26);
    ctx.save();ctx.translate(50,boardTop);
    // 外圈：十二個地支扇格，保留三列神名與所選時支底色。
    s.rings.cells.forEach((cell,i)=>{
      const angle=(90+i*30)*Math.PI/180,start=angle-Math.PI/12,end=angle+Math.PI/12;
      ctx.beginPath();ctx.arc(450,450,446,start,end);ctx.arc(450,450,374,end,start,true);ctx.closePath();
      ctx.fillStyle=cell.selected?C.ink:i%2?C.card:'#f5eddc';ctx.fill();ctx.strokeStyle=C.gold;ctx.lineWidth=1.2;ctx.stroke();
      let rotation=(90+i*30+90)%360;if(rotation>90&&rotation<270)rotation-=180;if(rotation>=270)rotation-=360;
      ctx.save();ctx.translate(450+410*Math.cos(angle),450+410*Math.sin(angle));ctx.rotate(rotation*Math.PI/180);
      text(`${cell.branch}・${cell.jianChu}`,0,-18,17,cell.selected?C.paper:C.ink,'center');
      text(cell.yueJiang,0,3,16,cell.selected?C.paper:C.moss,'center');
      text(cell.guiRen,0,24,16,cell.selected?C.paper:C.earth,'center');ctx.restore();
    });
    const point=([x,y])=>[110+(x+.5)/101*680,110+(y+.5)/101*680];
    const outer=s.geometry.outer.map(point),inner=s.geometry.inner.map(point);
    const good=h.patterns.filter(p=>p.grade==='吉');
    const wufuPalace={乾:6,坤:2,艮:8,巽:4,中:5}[s.wufu.palace];
    // 先填宮位底色，最後一次描線，維持所有邊線一致。
    s.geometry.order.forEach(p=>{
      const i=s.geometry.ring.indexOf(p),j=(i+1)%8;
      const hits=good.filter(q=>q.palace===p);
      const fill=p===s.focused?'#d4e6d4':hits.some(q=>q.name==='青龍返首')?'#e5f0e6':hits.length?'#faf2dd':p===5?'#eee7d6':C.card;
      polygon(p===5?inner:[outer[i],outer[j],inner[j],inner[i]],fill);
    });
    s.geometry.order.forEach(p=>{
      const x=h.palaces[p],hits=good.filter(q=>q.palace===p),hasWuFu=p===wufuPalace;
      const [symbol,cx,cy]=s.geometry.bagua[p],[px,py]=point([cx,cy]);
      ctx.save();ctx.translate(px,py);
      function badge(y){
        const total=hasWuFu&&hits.length?97:70,left=-total/2;
        roundedRect(left,y-22,70,28,5,'#8a5d21');text('時五福',left+35,y-1,18,'#fffaf0','center',700);
        if(hits.length)text(`吉${hits.length}`,left+75,y-2,12,C.qing);
      }
      if(p===5){
        text('中五',0,-53,16,C.ink,'center');text('地',-21,-10,12,C.muted,'center');text(x.diPan,9,-10,32,C.muted,'center');
        text(s.day.juLabel,0,23,14,C.muted,'center');text(`${s.day.dayGanZhi}日 ${h.hourGanZhi}時`,0,47,14,C.muted,'center');text('寄坤',0,71,14,C.muted,'center');
        if(hasWuFu)badge(103);
      }else{
        text(`${symbol} ${x.name}${'一二三四五六七八九'[p-1]} ${x.dir}`,0,-60,14,C.ink,'center');
        const warnings=h.patterns.filter(q=>q.palace===p&&q.grade==='忌'&&!q.name.startsWith('符')).map(q=>q.name==='門迫'?'迫':q.name==='擊刑'?'刑':q.name.endsWith('入墓')?'墓':q.name);
        if(x.kong)warnings.push('空');text(warnings.join(' '),0,-43,12,C.fire,'center');
        // 固定天／地位置，寄干以小字並列。
        text('天',-45,-17,12,C.muted);text(x.tianPan,-30,-17,24,C.ink);if(x.tianPan2)text(x.tianPan2,-7,-24,14,C.muted);
        text('地',13,-17,12,C.muted);text(x.diPan,27,-17,24,C.muted);
        [['星',x.star],['門',x.gate],['神',x.god]].forEach(([label,name],i)=>{
          const width=12+7+name.length*15;const left=-width/2;
          text(label,left,7+i*21,12,C.muted);text(name,left+19,7+i*21,15,wx(name));
        });
        if(hasWuFu)badge(78);else if(hits.length)text(`吉格 ${hits.length} 項`,0,70,12,C.qing,'center');
      }
      ctx.restore();
    });
    ctx.lineJoin='round';ctx.lineCap='round';polygon(outer,null,C.line);polygon(inner,null,C.line);
    ctx.beginPath();outer.forEach((p,i)=>{ctx.moveTo(...p);ctx.lineTo(...inner[i]);});ctx.strokeStyle=C.line;ctx.lineWidth=1.4;ctx.stroke();
    ctx.restore();
    let footer=boardTop+934;
    const bad=h.patterns.filter(p=>p.grade==='忌').length;
    text(`吉格 ${good.length} 項　忌象 ${bad} 項　有吉格 ${new Set(good.map(p=>p.palace)).size} 宮`,50,footer,18,C.ink);
    footer=wrap('外圈每格：地支・建除神／月將十二神／貴人十二神。深色格為所選時支。',50,footer+28,900,15,C.muted,22);
    wrap('時家轉盤・置閏法・中五寄坤。南上、北下、東左、西右。夜子時 23:00 換日。',50,footer+3,900,15,C.muted,22);
    text(`排盤日 ${s.day.date}・${h.hourGanZhi}時`,950,1375,13,C.muted,'right');
    return canvas;
  }
  root.qimenPdf={render};
})(typeof window!=='undefined'?window:globalThis);
