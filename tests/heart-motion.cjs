const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');const root=path.resolve(__dirname,'..');
for(const [kind,slug]of [['16','beta1'],['18','parasympathetic']])for(const reduced of [false,true]){
 const html=fs.readFileSync(path.join(root,`pharmacology_lab_${kind}_${slug}.html`),'utf8'),els=new Map();const element=()=>({attrs:{},children:[],value:'',textContent:'',style:{setProperty(k,v){this[k]=v}},setAttribute(k,v){this.attrs[k]=String(v)},append(...e){this.children.push(...e)}});
 for(const m of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){const e=element();e.value=(m[0].match(/value="([^"]+)"/)||[])[1]||'';els.set('#'+m[1],e);}
 const $=s=>els.get(s);let changed;const preference={matches:reduced,addEventListener(event,fn){changed=fn}};const ctx={document:{body:{dataset:{lab:kind}},querySelector:$,createElement:element},matchMedia:()=>preference};ctx.window=ctx;vm.createContext(ctx);
 for(const name of ['autonomic-models.js','autonomic.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',name),'utf8'),ctx);
 assert.equal($('#heart').attrs['data-motion'],reduced?'paused':'running');assert.equal($('#motionToggle').textContent,reduced?'心臓の拍動を開始':'心臓の拍動を止める');
 if(reduced){$('#motionToggle').onclick();assert.equal($('#heart').attrs['data-motion'],'running');assert.equal($('#heart').style.animationPlayState,'running');}
 $('#move').onclick();const duration=parseFloat($('#heart').style['--beat-duration']);assert(kind==='16'?duration<1.2:duration>1.2);
 $('#motionToggle').onclick();assert.equal($('#heart').attrs['data-motion'],'paused');$('#motionToggle').onclick();assert.equal($('#heart').attrs['data-motion'],'running');$('#reset').onclick();assert.equal($('#heart').attrs['data-motion'],reduced?'paused':'running');
 preference.matches=true;changed();assert.equal($('#heart').attrs['data-motion'],'paused');console.log('PASS heart motion',kind,'reduced=',reduced);
}
const css=fs.readFileSync(path.join(root,'assets/css/autonomic.css'),'utf8');assert(css.includes('.heart-beat:not([data-motion="running"]){animation:none}'));
