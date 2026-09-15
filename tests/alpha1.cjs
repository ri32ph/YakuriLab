const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),{alpha1}=require('../assets/js/receptor-models.js');
for(let a=0;a<=100;a+=5)for(let b=0;b<=100;b+=5){const s=alpha1(a,b);assert(Math.abs(s.on+s.blocked+s.free-1)<1e-12);assert(s.on>=0&&s.blocked>=0&&s.free>=-1e-12);assert(s.diameter>=.55&&s.diameter<=1);assert(alpha1(a+1,b).contraction>=s.contraction);assert(alpha1(a,b+1).contraction<=s.contraction);}
assert.equal(alpha1(0,100).contraction,0);assert(alpha1(0,100).blocked>0);assert.equal(alpha1(0,100).diameter,1);assert(alpha1(100000000,100).contraction>.9999);
const html=fs.readFileSync(path.join(root,'pharmacology_lab_15_alpha1.html'),'utf8');
const element=()=>({attrs:{},children:[],value:'',textContent:'',className:'',setAttribute(k,v){this.attrs[k]=String(v)},append(...els){this.children.push(...els)}}),els=new Map();
for(const m of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){const e=element();e.value=(m[0].match(/value="([^"]+)"/)||[])[1]||'';els.set('#'+m[1],e);}
const $=s=>els.get(s),ctx={document:{querySelector:$,createElement:element},console};ctx.window=ctx;vm.createContext(ctx);for(const f of ['receptor-models.js','lab-15.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',f),'utf8'),ctx);
assert.equal($('#receptors').children.length,8);assert.equal($('#status').textContent,'結合前');assert.equal($('#dot').attrs.visibility,'hidden');assert.equal($('#resp').textContent,'0%');
$('#move').onclick();assert.equal($('#dot').attrs.visibility,'visible');const originalRadius=+$('#lumen').attrs.r,originalResponse=parseInt($('#resp').textContent);assert(originalRadius<72);assert(originalResponse>0);assert.equal($('#curve').attrs.points,$('#baseCurve').attrs.points);
$('#antag').value='100';$('#antag').oninput();assert(+$('#lumen').attrs.r>originalRadius);assert(parseInt($('#resp').textContent)<originalResponse);assert.notEqual($('#curve').attrs.points,$('#baseCurve').attrs.points);assert(parseInt($('#blocked').textContent)>0);
$('#agonist').value='0';$('#agonist').oninput();assert.equal($('#on').textContent,'0 / 8');assert.equal($('#resp').textContent,'0%');assert.equal($('#lumen').attrs.r,'72');assert($('#receptors').children.some(e=>e.className.includes('blocked')));
$('#reset').onclick();assert.equal($('#agonist').value,'55');assert.equal($('#antag').value,'0');assert.equal($('#dot').attrs.visibility,'hidden');assert.equal($('#on').textContent,'0 / 8');assert.equal($('#lumen').attrs.r,'72');
for(const id of ['#curve','#baseCurve']){assert(!$('#curve').attrs.points.includes('NaN'));assert.equal($('#curve').attrs.points.split(' ').length,101);}
console.log('PASS alpha1: mass fractions, monotonic dose/competition, zero-agonist state, surmountability, controller binding, vessel radius, curves and reset');
