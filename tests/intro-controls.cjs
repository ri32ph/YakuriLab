const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const [id,slug]of [['01','absorption'],['02','distribution']]){
 const html=fs.readFileSync(path.join(root,`pharmacology_lab_${id}_${slug}.html`),'utf8');
 const elements=new Map();const element=()=>({attrs:{},children:[],textContent:'',value:'',setAttribute(k,v){this.attrs[k]=String(v)},replaceChildren(){this.children=[]},append(x){this.children.push(x)},addEventListener(event,fn){this[event]=fn}});
 for(const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){const e=element();e.value=(match[0].match(/value="([^"]+)"/)||[])[1]||'';elements.set('#'+match[1],e);}
 let now=0,frame;const context={document:{body:{dataset:{lab:id}},querySelector(s){return elements.get(s)},createElementNS(){return element()}},performance:{now:()=>now},requestAnimationFrame(fn){frame=fn},console};context.window=context;vm.createContext(context);
 for(const f of ['intro-models.js','intro.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',f),'utf8'),context);
 const $=s=>elements.get(s),advance=n=>{for(let i=0;i<n;i++){now+=16;frame(now)}};
 assert.equal($('#status').textContent,'待機中');$('#start').onclick();assert($('#curLine').attrs.points.startsWith('60,'));advance(10);
 const history=$('#curLine').attrs.points;advance(10);assert($('#curLine').attrs.points.startsWith(history+' '));assert.equal($('#curLine').attrs.points.split(' ').at(-1).split(',')[0],$('#stdLine').attrs.points.split(' ').at(-1).split(',')[0]);
 $('#pause').onclick();const frozen=$('#curLine').attrs.points;advance(20);assert.equal($('#curLine').attrs.points,frozen);$('#pause').onclick();advance(800);assert.equal($('#status').textContent,'終了');assert.equal($('#curLine').attrs.points.split(' ').at(-1).split(',')[0],'790');assert($('#pause').disabled);
 $('#speed').value='0.2';$('#speed').input();assert.equal($('#curLine').attrs.points,'');assert.equal($('#status').textContent,'待機中');$('#start').onclick();advance(5);$('#reset').onclick();assert.equal($('#curLine').attrs.points,'');assert.equal($('#pause').textContent,'一時停止');assert.equal($('#leftParticles').children.length,0);
 console.log('PASS intro controller',id,'start / history / pause / end / parameter reset / reset');
}
