const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const root=path.resolve(__dirname,'..'),url='file://'+path.join(root,'pharmacology_lab_40_airway_resistance.html');
  for(const width of [1440,1280,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto(url);
    assert.equal(await page.locator('#resistanceValue').textContent(),'1.00倍');
    assert.equal(await page.locator('[data-airway-preset]').count(),8);
    await page.locator('#airwayRadius').evaluate(input=>{input.value=80;input.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('#resistanceValue').textContent(),'2.44倍');
    await page.locator('[data-airway-preset="half"]').click();assert.equal(await page.locator('#resistanceValue').textContent(),'16.0倍');
    await page.locator('[data-airway-preset="asthma"]').click();
    const before=Number((await page.locator('#resistanceValue').textContent()).replace('倍',''));
    const edema=await page.locator('#airwayView').evaluate(e=>getComputedStyle(e).getPropertyValue('--edema'));
    const mucus=await page.locator('#airwayView').evaluate(e=>getComputedStyle(e).getPropertyValue('--mucus'));
    await page.locator('#beta2Toggle').click();
    const after=Number((await page.locator('#resistanceValue').textContent()).replace('倍',''));
    assert(after<before);assert.equal(await page.locator('#airwayView').evaluate(e=>getComputedStyle(e).getPropertyValue('--edema')),edema);assert.equal(await page.locator('#airwayView').evaluate(e=>getComputedStyle(e).getPropertyValue('--mucus')),mucus);
    await page.locator('[data-airway-preset="m3"]').click();const blocked=Number((await page.locator('#resistanceValue').textContent()).replace('倍',''));await page.locator('#m3Toggle').click();const unblocked=Number((await page.locator('#resistanceValue').textContent()).replace('倍',''));assert(unblocked>blocked);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`horizontal overflow at ${width}`);
    assert.equal(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);return ids.length===new Set(ids).size}),true);
    if(width===1440||width===390)await page.locator('#experiment').screenshot({path:path.join(__dirname,`airway-${width}.png`)});
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);assert.equal(await page.locator('#motionToggle').getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]);await browser.close();console.log('PASS: LAB 40 browser interactions, 8 presets, asthma residual edema/mucus, M3 block, responsive widths and reduced motion.');
})().catch(error=>{console.error(error);process.exit(1)});
