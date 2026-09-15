const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const root=path.resolve(__dirname,'..'),url='file://'+path.join(root,'pharmacology_lab_30_antihypertensives.html');
 const metric=(name,scope='#mainMetrics')=>page.locator(`${scope} [data-metric="${name}"] dd`).textContent();
 for(const width of [1440,1280,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(url);
  assert(!(await page.locator('#drugPicker').getAttribute('open')));assert(await page.locator('#mainRaas').isHidden());assert.equal(await metric('bp'),'標準付近');
  await page.locator('#drugPicker summary').click();
  for(const id of ['dhp','ace','arb','thiazide','beta']){
   await page.locator(`[data-drug="${id}"]`).click();assert.equal(await metric('bp'),'↓方向');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width} ${id}`);
   if(id==='dhp'){assert(Number(await page.locator('#mainMap [data-lumen]').getAttribute('height'))>18);assert.equal(await metric('hr'),'→');}
   if(id==='ace'){assert.equal(await page.locator('#mainRaas .blocked').count(),1);assert.match(await page.locator('#mainRaas [data-target="ace"]').textContent(),/BLOCK/);assert.match(await page.locator('#mainRaas [data-target="angiotensin-ii"]').textContent(),/生成↓/);}
   if(id==='arb'){assert.equal(await page.locator('#mainRaas .blocked').count(),1);assert.match(await page.locator('#mainRaas [data-target="at1"]').textContent(),/BLOCK/);assert.match(await page.locator('#mainRaas [data-target="angiotensin-ii"]').textContent(),/生成を止めない/);assert.doesNotMatch(await page.locator('#mainRaas [data-target="ace"]').textContent(),/BLOCK/);}
   if(id==='thiazide'){assert.equal(await metric('volume'),'↓');assert.match(await page.locator('#observationList').textContent(),/Na⁺・K⁺/);assert.doesNotMatch(await page.locator('#observationList').textContent(),/空咳/);}
   if(id==='beta'){assert.equal(await metric('hr'),'↓');assert.equal(await page.locator('#mainMap [data-organ].active').count(),2);}
  }
  await page.locator('[data-drug="arb"]').click();
  console.log('PASS single',width,'main height',await page.locator('#experiment').evaluate(el=>el.getBoundingClientRect().height));
  if(width===1440||width===390)await page.screenshot({path:path.join(__dirname,`antihypertensive-${width}.png`),fullPage:true});
  await page.locator('#compareToggle').click();assert(await page.locator('#comparisonSection').isVisible());
  await page.locator('[data-pair="ace,arb"]').click();assert.match(await page.locator('#leftPanel [data-target="ace"]').textContent(),/BLOCK/);assert.match(await page.locator('#rightPanel [data-target="at1"]').textContent(),/BLOCK/);
  await page.locator('#compareLeft').selectOption('thiazide');assert.equal(await metric('volume','#leftPanel'),'↓');assert.equal(await metric('diameter','#leftPanel'),'→');assert.equal(await metric('diameter','#rightPanel'),'広い');
  await page.locator('#compareLeft').selectOption('ace');
  if(width===1440)await page.locator('#comparisonSection').screenshot({path:path.join(__dirname,'antihypertensive-comparison.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`comparison overflow ${width}`);
  await page.locator('#advanced summary').click();await page.locator('#mraSelect').click();assert.match(await page.locator('#mainRaas [data-target="mr"]').textContent(),/BLOCK/);assert.match(await page.locator('#safetyList').textContent(),/高K血症/);
  await page.locator('#compensation').check();await page.locator('[data-drug="dhp"]').click();assert.equal(await metric('hr'),'↑');assert(await page.locator('#mainFeedback').isVisible());
  await page.locator('[data-drug="thiazide"]').click();assert.equal(await metric('raas'),'↑');await page.locator('#compensation').uncheck();assert.equal(await metric('raas'),'→');
  await page.locator('#reset').click();assert.equal(await metric('bp'),'標準付近');assert(await page.locator('#comparisonSection').isHidden());assert(await page.locator('#mainRaas').isHidden());assert.equal(await page.locator('#safetyList li').count(),0);assert.equal(await page.locator('#mainMap [data-organ].active').count(),0);
  assert.equal(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.length===new Set(ids).size}),true);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.locator('#drugPicker summary').click();await page.locator('[data-drug="ace"]').click();assert.equal(await page.locator('#mainRaas .blocked').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.goto('file://'+path.join(root,'pharmacology_lab_29_raas.html'));assert.equal(await page.locator('.lab-navigation a[href="pharmacology_lab_30_antihypertensives.html"]').count(),1);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS LAB 30 browser: drugs, comparisons, reset, reduced motion, unique IDs, navigation, zero page errors');
})().catch(e=>{console.error(e);process.exit(1)});
