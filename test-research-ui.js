/* UI regression: ranges/visibility never alter analysis snapshots. Run: node test-research-ui.js */
const {JSDOM,VirtualConsole}=require('jsdom');
const path=require('path');
const assert=require('node:assert/strict');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const errors=[],vc=new VirtualConsole();
 vc.on('jsdomError',e=>{if(/Uncaught/.test(String(e)))errors.push(String(e));});
 const dom=await JSDOM.fromFile(path.join(__dirname,'index.html'),{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document,$=id=>d.getElementById(id);
 w.alert=()=>{};
 try{
  for(let n=0;n<100;n++){await pause(100);if(['fr-bazi','fr-ziwei','fr-taiyi'].every(id=>$(id).contentDocument.readyState==='complete'))break;}
  for(const [id,v] of Object.entries({'f-name':'介面測試','f-year':'1990','f-month':'1','f-day':'15','f-hour':'6'}))$(id).value=v;
  $('f-go').click();
  for(let n=0;n<200;n++){await pause(100);if(d.querySelectorAll('#ovChart polyline').length===3&&!$('f-save').disabled)break;}
  assert.equal(d.querySelectorAll('#ovChart polyline').length,3);
  assert.equal(d.querySelectorAll('.readout').length,3);
  for(const k of ['bazi','ziwei','taiyi'])assert.ok(d.querySelector('.readout.'+k).textContent.includes('分'));
  for(const id of ['fr-bazi','fr-ziwei']){
    const frame=$(id),grid=frame.contentDocument.querySelector('.input-grid');
    assert.ok(grid.hidden,'Embedded birth inputs hidden: '+id);
    assert.equal(frame.contentWindow.getComputedStyle(grid).display,'none');
  }
  const taiyiDoc=$('fr-taiyi').contentDocument;
  assert.equal(taiyiDoc.querySelector('.tool-title-heading'),null);
  for(const id of ['bailiu-liuyue-info','taiyi-xiaoxian-info']){
    const box=taiyiDoc.getElementById(id);assert.ok(box,'Taiyi new section '+id);
    assert.equal(box.querySelectorAll('tr').length,12,'Twelve monthly rows in '+id);
    assert.ok(box.textContent.includes('正月')&&box.textContent.includes('十二月'));
    assert.ok(!/無法定位|無法由/.test(box.textContent));
  }
  const diag=w.__hebingDiagnostics;
  const snapshot=()=>JSON.stringify([diag.buildSyncSnapshot(),diag.buildTurningSnapshot()]);
  const initial=snapshot(),full0=+d.querySelector('#ovChart svg').dataset.x0,full1=+d.querySelector('#ovChart svg').dataset.x1;
  const rangeButton=d.querySelector('[data-range="near"]');rangeButton.click();
  const thisYear=new Date().getFullYear();
  assert.equal(+d.querySelector('#ovChart svg').dataset.x0,Math.max(full0,thisYear-10));
  assert.equal(+d.querySelector('#ovChart svg').dataset.x1,Math.min(full1,thisYear+10));
  assert.equal(snapshot(),initial);
  $('viewFrom').value='2028';$('viewTo').value='2035';$('applyRange').click();
  assert.equal(d.querySelector('#ovChart svg').dataset.x0,'2028');
  assert.equal(d.querySelector('#ovChart svg').dataset.x1,'2035');
  assert.ok([...d.querySelectorAll('#ovChart rect')].every(r=>+r.getAttribute('width')>=0));
  $('viewFrom').value='2035';$('viewTo').value='2028';$('applyRange').click();
  assert.equal(d.querySelector('#ovChart svg').dataset.x0,'2028');
  const checks=[...d.querySelectorAll('[data-method]')];checks[0].click();
  assert.equal(d.querySelectorAll('#ovChart polyline').length,2);
  assert.equal(snapshot(),initial);
  assert.equal(d.querySelectorAll('.readout').length,3);
  checks[1].click();checks[2].click();
  assert.equal(d.querySelectorAll('[data-method]:checked').length,1);
  assert.equal(d.querySelectorAll('#ovChart polyline').length,1);
  checks[0].click();checks[1].click();
  $('viewBounds').click();$('viewMarks').click();
  assert.equal(snapshot(),initial);
  assert.ok(![...d.querySelectorAll('#ovChart text')].some(e=>e.textContent==='26.6歲'));
  $('viewYear').value='2030';$('viewYear').dispatchEvent(new w.Event('change'));
  assert.equal($('ovSelection').getAttribute('visibility'),'visible');
  $('yearNext').click();assert.equal($('viewYear').value,'2031');
  $('yearPrev').click();assert.equal($('viewYear').value,'2030');
  $('yearNow').click();assert.equal($('viewYear').value,String(thisYear));
  assert.equal($('ovSelection').getAttribute('visibility'),'visible');
  const picked=thisYear+1;const hit=d.querySelector('.ov-hit[data-yr="'+picked+'"]');assert.ok(hit);hit.dispatchEvent(new w.MouseEvent('click'));
  assert.equal($('viewYear').value,String(picked));
  $('ovZiweiMode').value='year';$('ovZiweiMode').dispatchEvent(new w.Event('change'));
  assert.match($('ovTitle').textContent,/流年/);
  assert.match(d.querySelector('#ovChart svg').getAttribute('aria-label'),/流年/);
  assert.equal(snapshot(),initial);
  assert.equal(d.querySelectorAll('.metric-grid').length,4);
  assert.equal(d.querySelectorAll('.timing-grid').length,4);
  // Verify PDF captures all curves/full range, then restores current viewing state.
  checks[0].click();
  const beforeSvg=$('ovChart').innerHTML,beforeYear=$('viewYear').value,images=[];
  const ctx={beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},fill(){},stroke(){},fillRect(){},strokeRect(){},fillText(){},drawImage(){},arc(){},measureText(s){return {width:String(s).length*18};}};
  w.HTMLCanvasElement.prototype.getContext=()=>ctx;
  w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  w.Image=function(){const img={};Object.defineProperty(img,'src',{set(v){images.push(decodeURIComponent(v));setTimeout(()=>img.onload&&img.onload(),0);}});return img;};
  function Pdf(){this.pages=1;}Pdf.prototype.addPage=function(){this.pages++;};Pdf.prototype.addImage=function(){};Pdf.prototype.setProperties=function(){};Pdf.prototype.save=function(){};
  w.jspdf={jsPDF:Pdf};
  const result=await $('ovPdf').onclick();assert.ok(result);
  assert.ok(images.length>=2);
  for(const xml of images){assert.equal((xml.match(/<polyline/g)||[]).length,3);assert.ok(!xml.includes('id="ovSelection"'));const parsed=new w.DOMParser().parseFromString(xml.slice(xml.indexOf(',')+1),'image/svg+xml');assert.equal(parsed.getElementsByTagName('parsererror').length,0);}
  assert.equal($('ovChart').innerHTML,beforeSvg);assert.equal($('viewYear').value,beforeYear);
  assert.equal(snapshot(),initial);
  assert.deepEqual(errors,[]);
  console.log('PASS: Taiyi monthly sections (12 rows each), three-method readouts, metric counts, ranges, invalid input, hidden curves, selection, annual title, invariant analysis, PDF restoration and SVG XML.');
 }finally{w.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
