const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const root=path.resolve(__dirname,'..'),url='file://'+path.join(root,'pharmacology_lab_32_heart_failure_drugs.html');
 const water=()=>p.locator('#treatmentMap [data-lung-water]').evaluate(el=>Number(el.style.opacity));
 const choose=id=>p.locator(`[data-drug="${id}"]`).click();
 for(const width of [1440,1280,390,320]){
 await p.setViewportSize({width,height:900});await p.goto(url);
 assert(await p.locator('#afterView').isDisabled());assert.equal(await p.locator('#treatmentMap .hf-anatomy').count(),1);assert.equal(await p.locator('#treatmentMap [data-organ]').count(),5);assert.equal(await p.locator('#treatmentMap .treatment-block').count(),0);
 const baseline=await water();await p.locator('#treatmentPicker summary').click();
 for(const id of ['arni','ace','arb','beta','mra','sglt2','loop']){
  await choose(id);assert.equal(await p.locator('#activeTreatments button').count(),1);assert.equal(await p.locator('#selectedCare article').count(),1);assert.equal(await p.locator('#treatmentMap .focused').count(),1);assert.equal(await p.locator('#viewBadge').textContent(),'治療後：作用の方向');
  if(id==='beta'){assert.match(await p.locator('#treatmentMap [data-target="sympathetic"]').textContent(),/β1 BLOCK/);assert.equal(await water(),baseline);assert.match(await p.locator('#selectedCare').textContent(),/心収縮力を下げる薬なのに/);}
  if(id==='loop'){assert(await water()<baseline);assert.match(await p.locator('#treatmentMap [data-target="kidneys"]').textContent(),/NKCC2/);}
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width} ${id}`);
 }
 await choose('arni');await p.locator('#addTreatment').click();for(const id of ['beta','mra','sglt2'])await choose(id);
 assert.equal(await p.locator('#activeTreatments button').count(),4);assert.equal(await p.locator('#treatmentMap .focused').count(),4);
 console.log('PASS LAB 32 viewport',width,'main bottom',await p.locator('#experiment').evaluate(el=>el.getBoundingClientRect().bottom+scrollY));
 if(width===1440||width===390){await p.screenshot({path:path.join(__dirname,`hf-treatment-${width}.png`),fullPage:true});if(width===390)await p.locator('.hf-observe').screenshot({path:path.join(__dirname,'hf-treatment-mobile-observe.png')});}
 await p.locator('#beforeView').click();assert.equal(await water(),baseline);assert.equal(await p.locator('#treatmentMap .treatment-block').count(),0);assert.match(await p.locator('#treatmentMap .return-loop>span').textContent(),/心不全|悪化する方向/);assert.equal(await p.locator('#activeTreatments button').count(),4);
 await p.locator('#afterView').click();assert(await water()<baseline);assert.equal(await p.locator('#treatmentMap .focused').count(),4);
 await p.locator('#pathwayDetails summary').click();assert(await p.locator('#npPath').isVisible());assert.match(await p.locator('#treatmentRaas [data-target="at1"]').textContent(),/BLOCK/);assert.match(await p.locator('#treatmentRaas [data-target="mr"]').textContent(),/BLOCK/);assert.match(await p.locator('#treatmentRaas [data-target="angiotensin-ii"]').textContent(),/生成を止めない/);assert.match(await p.locator('#proximalPart').getAttribute('class'),/active/);
 await choose('ace');assert.equal(await p.locator('[data-remove="arni"]').count(),0);assert.equal(await p.locator('[data-remove="ace"]').count(),1);assert.equal(await p.locator('#activeTreatments button').count(),4);assert(await p.locator('#npPath').isHidden());assert.match(await p.locator('#treatmentRaas [data-target="ace"]').textContent(),/BLOCK/);assert.doesNotMatch(await p.locator('#treatmentRaas [data-target="at1"]').textContent(),/BLOCK/);
 await choose('loop');assert.equal(await p.locator('#activeTreatments button').count(),5);assert.match(await p.locator('#loopPart').getAttribute('class'),/active/);await p.locator('[data-remove="mra"]').click();assert.doesNotMatch(await p.locator('#treatmentRaas [data-target="mr"]').textContent(),/BLOCK/);
 await p.locator('#motionToggle').click();assert.equal(await p.locator('#treatmentMap').getAttribute('data-motion'),'paused');assert.equal(await p.locator('#treatmentMap .loop-flow').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
 await p.locator('#reset').click();assert.equal(await p.locator('#activeTreatments button').count(),0);assert.equal(await p.locator('#selectedCare article').count(),0);assert.equal(await water(),baseline);assert(await p.locator('#afterView').isDisabled());assert.equal(await p.locator('#treatmentMap .focused').count(),0);
 assert.equal(await p.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.length===new Set(ids).size}),true);
 }
 await p.emulateMedia({reducedMotion:'reduce'});await p.goto(url);assert.equal(await p.locator('#treatmentMap').getAttribute('data-motion'),'paused');await p.locator('#treatmentPicker summary').click();await choose('arni');assert.equal(await p.locator('.treatment-block').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await p.goto('file://'+path.join(root,'pharmacology_lab_31_heart_failure.html'));assert.equal(await p.locator('.lab-navigation a[href="pharmacology_lab_32_heart_failure_drugs.html"]').count(),1);
 assert.deepEqual(errors,[]);await b.close();console.log('PASS LAB 32 browser: all drugs, combined layers, exclusivity, removal, restored baseline, RAAS/NP/renal detail, motion, reset, reduced motion and navigation');
})().catch(e=>{console.error(e);process.exit(1)});
