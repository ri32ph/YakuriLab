const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
 const files=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
 for(const width of [1440,390,320])for(const file of files){
  await page.setViewportSize({width,height:900});await page.goto('file://'+path.join(root,file));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${file}: overflow at ${width}`);
  if(file.includes('_index')||file==='index.html')continue;
  await page.clock.install();
  const button=page.locator('#start,#dose,#move');await button.click();await page.clock.runFor(1000);
  const toggle=page.locator('#metToggle');if(await toggle.count()){await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'true');}
  const inhibit=page.locator('#inhibit');if(await inhibit.count()){await inhibit.click();await page.clock.runFor(1000);}
  const points=await page.locator('polyline').evaluateAll(els=>els.map(e=>e.getAttribute('points')).filter(Boolean));
  assert(points.length,`${file}: no curves`);assert(points.every(p=>!p.includes('NaN')),`${file}: NaN`);
  if(width===390&&file.includes('_06_'))await page.screenshot({path:path.join(root,'tests/mobile-06.png'),fullPage:true});
  if(width===1440&&file.includes('_03_'))await page.screenshot({path:path.join(root,'tests/desktop-03.png'),fullPage:true});
  await page.locator('#reset').click();
  if(await page.locator('#pause').count()){assert.equal(await page.locator('#pause').textContent(),'一時停止');assert(await page.locator('#pause').isDisabled());}
  await page.clock.runFor(100);
  console.log('PASS',width,file);
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
