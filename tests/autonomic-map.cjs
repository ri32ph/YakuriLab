const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function element(){return {dataset:{},style:{setProperty(k,v){this[k]=v}},attrs:{},children:[],textContent:'',checked:false,hidden:false,setAttribute(k,v){this.attrs[k]=String(v)},append(...v){this.children.push(...v)},replaceChildren(){this.children=[]},addEventListener(k,fn){this['on'+k]=fn},click(){this.onclick?.()},focus(){this.focused=true},scrollIntoView(){}}}
function setup(reduced=false){
 const html=fs.readFileSync(path.join(root,'pharmacology_lab_autonomic_map.html'),'utf8');
 const els=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],element()]));
 const modeButtons=['sym-up','sym-down','para-up','para-down'].map(mode=>Object.assign(element(),{dataset:{mode}}));
 const pupils=[element(),element()];const preference={matches:reduced,addEventListener(k,fn){this.changed=fn}};
 const ctx={console,Map,document:{getElementById:id=>els[id],querySelectorAll:s=>s==='[data-mode]'?modeButtons:s==='.map-pupil'?pupils:[],createElement:()=>element()},matchMedia:()=>preference};ctx.window=ctx;
 vm.createContext(ctx);for(const file of ['catalog.js','autonomic-map-model.js','autonomic-map.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',file),'utf8'),ctx);
 return{ctx,els,modeButtons,pupils,preference};
}
for(const reduced of [false,true]){
 const {ctx,els,modeButtons,pupils,preference}=setup(reduced);
 const m=ctx.AUTONOMIC_MAP;
 assert.equal(m.organs.length,7);assert.equal(Object.keys(m.modes).length,5);
 assert.equal(els.bodyMap.dataset.motion,reduced?'paused':'running');
 assert.equal(els.organButtons.children.length,14);
 for(const button of modeButtons){
  button.click();const state=m.modes[button.dataset.mode];
  assert.equal(els.mapStatus.textContent,state.title);assert.equal(pupils[0].attrs.r,String(state.visual.pupil));
  assert.equal(modeButtons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
  for(const organ of m.organs){
   const b=els.organButtons.children.find(b=>b.dataset.organ===organ.id);b.click();
   assert.equal(els.detailTitle.textContent,organ.title);assert.equal(els.detailEffect.textContent,state.labels[organ.id]);
   assert.equal(els.detailNote.textContent,state.notes[organ.id]);
   for(const link of els.detailLinks.children)assert(fs.existsSync(path.join(root,link.href)),link.href);
  }
 }
 els.showReceptors.checked=true;els.showReceptors.onchange();
 assert(els.organButtons.children.slice(0,7).every(b=>b.children[2].hidden===false));
 els.mapReset.click();assert.equal(els.mapStatus.textContent,'基準の状態');assert.equal(els.showReceptors.checked,false);assert.equal(els.detailTitle.textContent,'心臓');
 assert.equal(els.bodyMap.style['--beat'],'1.1s');
 els.mapMotion.click();assert.equal(els.bodyMap.dataset.motion,reduced?'running':'paused');
 preference.changed({matches:true});assert.equal(els.bodyMap.dataset.motion,'paused');
 els.mapMotion.click();assert.equal(els.bodyMap.dataset.motion,'running');
 const base=m.modes.baseline.visual;
 for(const mode of ['para-up','para-down'])assert.equal(m.modes[mode].visual.vessel,base.vessel);
 assert.equal(m.modes['sym-down'].visual.airway,base.airway);
 assert.notDeepEqual(m.modes['sym-down'],m.modes['para-up']);assert.notDeepEqual(m.modes['para-down'],m.modes['sym-up']);
 assert.equal(m.modes['para-down'].visual.strength,base.strength);assert(m.modes['sym-up'].visual.strength>base.strength);
 assert(m.modes['sym-up'].visual.beat<base.beat);assert(m.modes['para-up'].visual.beat>base.beat);
 assert(m.modes['para-up'].visual.voiding);assert(!m.modes['sym-down'].visual.voiding);
 // Verify actual common navigation for every catalog entry, including INTRO.
 for(let i=0;i<ctx.LAB_CATALOG.length;i++){
  const entry=ctx.LAB_CATALOG[i],wrap=element();
  const nctx={window:ctx,document:{body:{dataset:{lab:String(entry.id)}},createElement:()=>element(),querySelector:s=>s==='.wrap'?wrap:null,querySelectorAll:()=>[]}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/navigation.js'),'utf8'),nctx);
  const links=wrap.children[0].children;
  assert(links.some(l=>l.href==='index.html'));
  if(i>0)assert.equal(links[0].href,ctx.LAB_CATALOG[i-1].href);
  if(i<ctx.LAB_CATALOG.length-1)assert.equal(links.at(-1).href,ctx.LAB_CATALOG[i+1].href);
  assert(!links.some(l=>l.textContent.includes('NaN')));
 }
}
console.log('PASS: 4 independent modes, 7 organs, labels/links, receptor toggle, reset, motion preferences and all navigation entries. DOM mocks; no browser rendering.');
