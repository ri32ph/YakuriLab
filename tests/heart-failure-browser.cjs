const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const root=path.resolve(__dirname,'..'),url='file://'+path.join(root,'pharmacology_lab_31_heart_failure.html');
 for(const width of [1440,1280,390,320]){
 await p.setViewportSize({width,height:900});await p.goto(url);
 assert(await p.locator('#advance').isDisabled());assert.equal(await p.locator('#hfMap [data-organ]').count(),5);assert(await p.locator('.return-loop').isHidden());
 await p.locator('#reducePump').click();assert.equal(await p.locator('#pump').inputValue(),'40');assert.match(await p.locator('#stageTitle').textContent(),/CO低下/);assert.equal(await p.locator('#hfMap [data-lung-water]').evaluate(el=>el.style.opacity),'0');
 const perfFirst=await p.locator('#perfusionMeter').evaluate(el=>el.value);
 await p.locator('#advance').click();assert.match(await p.locator('#stageTitle').textContent(),/短期的/);assert(await p.locator('#perfusionMeter').evaluate(el=>el.value)>perfFirst);assert(await p.locator('.return-loop').isHidden());
 await p.locator('#raasDetail summary').click();assert(await p.locator('#hfRaas').isVisible());assert.match(await p.locator('#hfRaas [data-target="trigger"]').textContent(),/有効動脈血液量/);assert.doesNotMatch(await p.locator('#hfRaas [data-target="trigger"]').textContent(),/^循環血液量↓/);await p.locator('#raasDetail summary').click();
 await p.locator('#advance').click();assert.match(await p.locator('#stageTitle').textContent(),/持続/);assert(await p.locator('#advance').isDisabled());assert(await p.locator('.return-loop').isVisible());assert(Number(await p.locator('#hfMap [data-lung-water]').evaluate(el=>el.style.opacity))>0);assert(Number(await p.locator('#hfMap [data-leg-water]').evaluate(el=>el.style.opacity))>0);
 await p.locator('[data-symptom="lungs"]').click();assert.match(await p.locator('[data-organ="lungs"]').getAttribute('class'),/symptom-focus/);assert.match(await p.locator('#symptomDescription').textContent(),/肺静脈/);
 await p.locator('[data-symptom="legs"]').click();assert.match(await p.locator('[data-organ="legs"]').getAttribute('class'),/symptom-focus/);
 await p.locator('#motionToggle').click();assert.equal(await p.locator('#hfMap').getAttribute('data-motion'),'paused');assert.equal(await p.locator('.loop-flow').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');await p.locator('#motionToggle').click();
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);
 if(width===1440||width===390){await p.screenshot({path:path.join(__dirname,`heart-failure-${width}.png`),fullPage:true});if(width===390)await p.locator('.hf-observe').screenshot({path:path.join(__dirname,'heart-failure-mobile-observe.png')});}
 console.log('PASS HF viewport',width,'main bottom',await p.locator('#experiment').evaluate(el=>el.getBoundingClientRect().bottom+scrollY));
 await p.locator('#previous').click();assert.equal(await p.locator('#congestionMeter').evaluate(el=>el.value),0);assert(await p.locator('.return-loop').isHidden());
 await p.locator('#pump').fill('70');assert.equal(await p.locator('#phaseBadge').textContent(),'初期');
 await p.locator('#reset').click();assert.equal(await p.locator('#pump').inputValue(),'100');assert.equal(await p.locator('#perfusionMeter').evaluate(el=>el.value),1);assert(await p.locator('#advance').isDisabled());assert(await p.locator('[data-symptom="lungs"]').isDisabled());assert.equal(await p.locator('#hfMap [data-lung-water]').evaluate(el=>el.style.opacity),'0');
 assert.equal(await p.evaluate(()=>{const x=[...document.querySelectorAll('[id]')].map(e=>e.id);return x.length===new Set(x).size}),true);
 }
 await p.emulateMedia({reducedMotion:'reduce'});await p.goto(url);assert.equal(await p.locator('#hfMap').getAttribute('data-motion'),'paused');assert.equal(await p.locator('.hf-heart-pulse').evaluate(el=>getComputedStyle(el).animationName),'none');
 await p.goto('file://'+path.join(root,'pharmacology_lab_30_antihypertensives.html'));assert.equal(await p.locator('.lab-navigation a[href="pharmacology_lab_31_heart_failure.html"]').count(),1);
 assert.deepEqual(errors,[]);await b.close();console.log('PASS HF controls, symptom links, motion, reset, reduced motion, RAAS trigger, navigation and no JS errors');
})().catch(e=>{console.error(e);process.exit(1)});
