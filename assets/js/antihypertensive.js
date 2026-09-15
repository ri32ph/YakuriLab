(() => {
'use strict';
const $=id=>document.getElementById(id),model=window.ANTIHYPERTENSIVE_MODEL;
let selected='none';
const mainMap=window.CIRCULATION_MAP.mount($('mainMap'));
const mainRaas=window.RAAS_PATHWAY.mount($('mainRaas'),{mode:'drug'});
const raasDrugs=['ace','arb','beta','mra'];
function metrics(el,s){
 el.replaceChildren();
 for(const [key,label] of model.metrics){const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');item.dataset.metric=key;item.classList.toggle('changed',s.directions[key]!==0);dt.textContent=label;dd.textContent=model.label(key,s.directions[key]);item.append(dt,dd);el.append(item);}
}
function lines(el,items){el.replaceChildren();for(const text of items){const p=document.createElement('p');p.textContent=text;el.append(p);}}
function list(el,items){el.replaceChildren();for(const text of items){const li=document.createElement('li');li.textContent=text;el.append(li);}}
function animate(el){el.classList.remove('animate');void el.offsetWidth;el.classList.add('animate');}
function main(){
 const s=model.state(selected,$('compensation').checked);
 mainMap.render(s);mainRaas.render(s);$('mainRaas').hidden=!raasDrugs.includes(s.id);animate($('mainRaas'));
 $('selectionBadge').textContent=s.name;lines($('mainMechanism'),s.paths);metrics($('mainMetrics'),s);
 $('mainDetail').textContent=s.detail;$('mainFeedback').textContent=s.compensation;$('mainFeedback').hidden=!s.compensation;
 $('careDrug').textContent=s.id==='none'?'薬を選ぶと、その作用に関連する注意点・看護観察を表示します。':s.name+'｜'+s.place;
 list($('safetyList'),s.safety);list($('observationList'),s.observe);
 document.querySelectorAll('[data-drug]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.drug===s.id)));
 $('mraSelect').setAttribute('aria-pressed',String(s.id==='mra'));
}
function select(id){selected=id;main();}
for(const id of ['dhp','ace','arb','thiazide','beta']){const b=document.createElement('button');b.dataset.drug=id;b.textContent=model.drugs[id].name;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(id));$('drugButtons').append(b);}
function makeComparison(id){
 const host=$(id);host.innerHTML='<h3></h3><div class="comparison-map"></div><div class="mechanism"></div><div class="drug-pathway"></div><dl class="drug-metrics"></dl><p class="selection-note"></p><div class="feedback" hidden></div><details><summary>この薬の注意点・観察</summary><h4>作用から考える注意点</h4><ul class="compare-safety"></ul><h4>看護観察</h4><ul class="compare-observe"></ul></details>';
 const map=window.CIRCULATION_MAP.mount(host.querySelector('.comparison-map')),raas=window.RAAS_PATHWAY.mount(host.querySelector('.drug-pathway'),{mode:'drug'});
 return s=>{host.querySelector('h3').textContent=s.name;map.render(s);raas.render(s);host.querySelector('.drug-pathway').hidden=!raasDrugs.includes(s.id);animate(host.querySelector('.drug-pathway'));lines(host.querySelector('.mechanism'),s.paths);metrics(host.querySelector('.drug-metrics'),s);host.querySelector('.selection-note').textContent=s.detail;const f=host.querySelector('.feedback');f.hidden=!s.compensation;f.textContent=s.compensation;list(host.querySelector('.compare-safety'),s.safety);list(host.querySelector('.compare-observe'),s.observe);};
}
const left=makeComparison('leftPanel'),right=makeComparison('rightPanel');
for(const selectId of ['compareLeft','compareRight'])for(const [key,d] of Object.entries(model.drugs)){if(key==='none')continue;const option=document.createElement('option');option.value=key;option.textContent=d.name;$(selectId).append(option);}
$('compareLeft').value='dhp';$('compareRight').value='arb';
function compare(){const a=model.state($('compareLeft').value,$('compensation').checked),b=model.state($('compareRight').value,$('compensation').checked);left(a);right(b);$('compareSummary').textContent=a.id===b.id?'同じ薬効群を選んでいます。別の薬効群に切り替えると作用点の違いを比べられます。':a.name+'は「'+a.place+'」、'+b.name+'は「'+b.place+'」に作用します。';}
$('compareLeft').addEventListener('change',compare);$('compareRight').addEventListener('change',compare);
document.querySelectorAll('[data-pair]').forEach(button=>button.addEventListener('click',()=>{const [a,b]=button.dataset.pair.split(',');$('compareLeft').value=a;$('compareRight').value=b;compare();}));
$('compareToggle').addEventListener('click',()=>{const show=$('comparisonSection').hidden;$('comparisonSection').hidden=!show;$('compareToggle').setAttribute('aria-expanded',String(show));$('compareToggle').textContent=show?'比較モードを閉じる':'2つの薬効群を比較する';if(show)compare();});
$('mraSelect').addEventListener('click',()=>select('mra'));
$('compensation').addEventListener('change',()=>{main();compare();});
$('reset').addEventListener('click',()=>{selected='none';$('compensation').checked=false;$('drugPicker').open=false;$('advanced').open=false;$('comparisonSection').hidden=true;$('compareToggle').setAttribute('aria-expanded','false');$('compareToggle').textContent='2つの薬効群を比較する';$('compareLeft').value='dhp';$('compareRight').value='arb';main();compare();});
main();compare();
})();
