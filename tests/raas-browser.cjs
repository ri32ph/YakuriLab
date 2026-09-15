const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url='file://'+path.resolve(__dirname,'../pharmacology_lab_29_raas.html');
 await page.clock.install();
 for(const width of [1440,1280,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(url);
  assert(await page.locator('#raasPathway').isHidden());
  await page.locator('#reduceVolume').click();
  assert.equal(await page.locator('#reninMetric').textContent(),'→');
  await page.clock.runFor(2600);assert.equal(await page.locator('#reninMetric').textContent(),'↑');
  assert.match(await page.locator('#kidneys').getAttribute('class'),/active/);
  await page.locator('#pause').click();await page.clock.runFor(10000);assert.equal(await page.locator('#stageCount').textContent(),'2 / 8');
  await page.locator('#next').click();assert.match(await page.locator('#liver').getAttribute('class'),/active/);
  await page.locator('#pause').click();await page.clock.runFor(7800);
  assert.equal(await page.locator('#stageCount').textContent(),'6 / 8');assert.equal(await page.locator('#retentionMetric').textContent(),'→');
  assert(Number(await page.locator('#lumen').getAttribute('height'))<18);
  await page.clock.runFor(5200);assert.equal(await page.locator('#stageCount').textContent(),'8 / 8');
  assert.equal(await page.locator('#retentionMetric').textContent(),'↑');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);
  if(width===1440||width===390)await page.screenshot({path:path.resolve(__dirname,`raas-${width}.png`),fullPage:true});
  console.log('PASS viewport',width,'main bottom',await page.locator('#experiment').evaluate(el=>el.getBoundingClientRect().bottom));
  await page.getByText('発展モード｜同じ血液量でRAAS ON／OFFを比べる',{exact:true}).click();
  await page.locator('#raasEnabled').uncheck();await page.clock.runFor(30000);
  assert.equal(await page.locator('#bloodVolume').inputValue(),'20');assert.equal(await page.locator('#reninMetric').textContent(),'→');assert(await page.locator('#raasPathway').isHidden());assert.equal(await page.locator('#pressureMetric').textContent(),'低下方向');
  await page.locator('#raasEnabled').check();await page.clock.runFor(18200);assert.equal(await page.locator('#stageCount').textContent(),'8 / 8');
  await page.locator('#replay').click();await page.locator('#reset').click();await page.clock.runFor(30000);
  assert.equal(await page.locator('#bloodVolume').inputValue(),'50');assert.equal(await page.locator('#reninMetric').textContent(),'→');
  await page.locator('#bloodVolume').fill('80');assert.equal(await page.locator('#reninMetric').textContent(),'↓');
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.locator('#reduceVolume').click();await page.clock.runFor(30000);assert.equal(await page.locator('#stageCount').textContent(),'1 / 8');await page.locator('#next').click();assert.equal(await page.locator('#stageCount').textContent(),'2 / 8');
 await page.goto('file://'+path.resolve(__dirname,'../pharmacology_lab_28_blood_pressure.html'));assert(await page.locator('.lab-navigation a[href="pharmacology_lab_29_raas.html"]').count());
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS controls, timers, OFF comparison, reduced motion, navigation and no JS errors');
})().catch(e=>{console.error(e);process.exit(1)});
