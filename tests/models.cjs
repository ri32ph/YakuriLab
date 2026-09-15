const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 async function lab(n){
  const p=await browser.newPage();await p.clock.install({time:new Date('2026-01-01T00:00:00Z')});await p.clock.pauseAt(new Date('2026-01-01T00:00:00Z'));
  const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/js/catalog.js'),'utf8').split('=')[1].trim().replace(/;$/, ''));const file=catalog.find(x=>x.id===n).href;await p.goto('file://'+path.join(root,file));return p;
 }
 async function set(p,id,v){await p.locator(id).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},String(v));}
 async function points(p,id){return p.locator(id).evaluate(el=>(el.getAttribute('points')||'').trim().split(/\s+/).filter(Boolean).map(q=>q.split(',').map(Number)));}
 for(const n of [3,4,5,6,7,8,9,10]){
  const p=await lab(n);await p.locator('#start,#dose').click();await p.clock.runFor(1000);
  const id=({3:'#curLine',4:'#line',5:'#line',6:'#line',7:'#cl',8:'#cl',9:'#curLine',10:'#lt'})[n];
  const a=await points(p,id);await p.clock.runFor(1000);const b=await points(p,id);
  assert.equal(a[0][0],60);assert.deepEqual(b.slice(0,a.length),a,'history changed '+n);
  assert(b.at(-1)[0]>a.at(-1)[0]);assert(b.every((q,i)=>i===0||q[0]>=b[i-1][0]));assert(b.at(-1)[0]<790);
  if([3,7,8,9].includes(n)){
   const standard=await points(p,[3,9].includes(n)?'#stdLine':'#sl');assert.equal(standard.at(-1)[0],b.at(-1)[0]);
  }
  if(await p.locator('#pause').count()){
   await p.locator('#pause').click();await p.clock.runFor(1000);assert.deepEqual(await points(p,id),b);
   await p.locator('#pause').click();
  }
  await p.clock.runFor(30000);assert.equal((await points(p,id)).at(-1)[0],790);
  console.log('PASS history, bounds, pause',n);await p.close();
 }
 for(const n of [5,6]){
  const p=await lab(n);await set(p,'#half',12);await set(p,'#int',2);await set(p,'#dosev',150);
  await p.locator('#start').click();await p.clock.runFor(20000);
  const sum=Array.from({length:31},(_,i)=>150*Math.pow(.5,(60-2*i)/12)).reduce((a,b)=>a+b,0);
  assert.equal(+(await p.locator('#ct').textContent()),Math.round(sum));
  assert.equal(await p.locator('#count').textContent(),'31回');
  const pts=await points(p,'#line');assert(pts.some((q,i)=>i>0&&q[0]===pts[i-1][0]&&q[1]<pts[i-1][1]),'missing instantaneous dose jump');
  if(n===6)assert.equal(await p.locator('#now').textContent(),Math.round((1-Math.pow(.5,62/12))*100)+'%');
  await set(p,'#half',4);assert.equal(await p.locator('#status').textContent(),'待機中');assert.equal((await points(p,'#line')).length,0);
  console.log('PASS analytical repeated dosing',n);await p.close();
 }
 for(const n of [7,8]){
  async function run(change){const p=await lab(n);await p.locator('#start').click();if(change)await p.locator('#inhibit').click();await p.locator('#metToggle').click();await p.clock.runFor(1000);const result=[+(await p.locator('#cur').textContent()).replace('%',''),+(await p.locator('#metText').textContent()).replace(/[^0-9]/g,'')];await p.close();return result;}
  const normal=await run(false),changed=await run(true);
  assert(n===7?changed[0]>normal[0]:changed[0]<normal[0]);assert(n===7?changed[1]<normal[1]:changed[1]>normal[1]);console.log('PASS CYP direction',n);
 }
 {const p=await lab(14);await p.locator('#move').click();const before=+(await p.locator('#resp').textContent()).replace('%','');await set(p,'#antag',100);assert(+(await p.locator('#resp').textContent()).replace('%','')<before);await set(p,'#agonist',0);assert.equal(await p.locator('#on').textContent(),'0 / 8');assert.equal(await p.locator('#resp').textContent(),'0%');await p.close();console.log('PASS antagonist binds without activation');}
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
