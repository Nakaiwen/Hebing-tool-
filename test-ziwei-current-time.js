/* Verify local-time refresh on pane change, hour boundaries and manual input. */
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs'),assert=require('node:assert/strict');
const RealDate=Date;
let clock=new RealDate(2026,8,6,14,35).getTime();
const errors=[];const vc=new VirtualConsole();
vc.on('jsdomError',e=>{if(/Uncaught/.test(String(e)))errors.push(String(e));});
const dom=new JSDOM(fs.readFileSync(__dirname+'/ziwei.html','utf8'),{
 runScripts:'dangerously',pretendToBeVisual:true,url:'https://localhost/ziwei.html',virtualConsole:vc,
 beforeParse(w){
  w.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}};
  w.alert=m=>errors.push(String(m));
 }
});
const w=dom.window,d=w.document,$=id=>d.getElementById(id);
function switchTo(mode){$('panType').value=mode;$('panType').dispatchEvent(new w.Event('change',{bubbles:true}));}
function expected(){const n=new RealDate(clock);return [n.getFullYear(),n.getMonth()+1,n.getDate(),Math.floor((n.getHours()+1)/2)%12];}
function values(){return ['flYear','flMonth','flDay','flHour'].map(id=>+$(id).value);}
try{
 assert.deepEqual(values(),expected());
 for(const [mode,date] of [
  ['流月盤',new RealDate(2026,8,6,14,35)],
  ['流日盤',new RealDate(2028,1,29,0,5)],
  ['流時盤',new RealDate(2029,0,1,1,0)]
 ]){
  clock=date.getTime();$('flYear').value='2001';$('flMonth').value='6';$('flDay').value='11';$('flHour').value='11';
  switchTo(mode);assert.deepEqual(values(),expected());assert.equal(+$('refYear').value,date.getFullYear());
  assert.ok($('board').textContent.includes(mode));
  assert.equal($('flHour').nextElementSibling.querySelector('.cs-btn').textContent,$('flHour').selectedOptions[0].textContent);
 }
 for(const [hour,minute,branch] of [[0,0,0],[0,59,0],[1,0,1],[2,59,1],[3,0,2],[21,0,11],[22,59,11],[23,0,0],[23,59,0]]){
  switchTo('本命盤');clock=new RealDate(2026,8,6,hour,minute).getTime();switchTo('流時盤');assert.equal(+$('flHour').value,branch);
  assert.equal(+$('flDay').value,6); // Existing engine retains calendar date at 23:00.
 }
 $('flYear').value='2025';$('flYear').dispatchEvent(new w.Event('input'));
 $('flMonth').value='4';$('flMonth').dispatchEvent(new w.Event('input'));
 $('flDay').value='12';$('flDay').dispatchEvent(new w.Event('input'));
 $('flHour').value='5';$('flHour').dispatchEvent(new w.Event('change'));
 assert.deepEqual(values(),[2025,4,12,5]);
 switchTo('流年盤');assert.deepEqual(values(),[2025,4,12,5]);
 // Exercise the custom dropdown's actual option-click event path.
 clock=new RealDate(2027,4,20,18,20).getTime();
 const wrap=$('panType').nextElementSibling;wrap.querySelector('.cs-btn').click();
 [...wrap.querySelectorAll('.cs-item')].find(e=>e.textContent==='流月盤').click();
 assert.deepEqual(values(),expected());
 assert.deepEqual(errors,[]);
 console.log('PASS: all three modes refresh local date/time, custom selector, year rollover, leap day, hour boundaries, manual date preservation, chart update.');
}finally{w.close();}
