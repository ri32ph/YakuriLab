(() => {
'use strict';
const $=id=>document.getElementById(id),model=window.HEART_FAILURE_MODEL;
const media=matchMedia('(prefers-reduced-motion: reduce)');
let phase=0,motion=!media.matches,symptom=null;
const map=window.HEART_FAILURE_MAP.mount($('hfMap'));
const raas=window.RAAS_PATHWAY.mount($('hfRaas'),{triggerLabel:'CO低下など → 有効動脈血液量・腎灌流↓方向'});
function render(){
 const s=model.state($('pump').value,phase);phase=s.phase;
 $('pumpOut').textContent=s.low?'低下':'標準';$('pump').setAttribute('aria-valuetext',s.low?'標準より低いポンプ機能（学習用指標）':'標準');
 $('phaseBadge').textContent=s.low?s.phaseName:'標準';$('stageTitle').textContent=s.title;$('stageText').textContent=s.text;
 document.querySelectorAll('.phase-track li').forEach((el,i)=>{if(i===phase)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $('previous').disabled=!s.low||phase===0;$('advance').disabled=!s.low||phase===2;
 $('timeNote').textContent=!s.low?'ポンプ機能を下げると、時間を進められます。':phase===2?'ポンプ機能低下と代償が持続した場合の例です。':'同じポンプ機能のまま、次の段階を観察します。';
 map.render(s,{motion,focus:symptom?model.symptoms[symptom].target:null});
 $('motionToggle').textContent=motion?'拍動・矢印の動きを停止':'拍動・矢印の動きを開始';$('motionToggle').setAttribute('aria-pressed',String(motion));
 $('congestionMeter').value=s.congestion;$('congestionMeter').setAttribute('aria-valuetext',s.congestionLabel);$('congestionText').textContent=s.congestionLabel;
 $('perfusionMeter').value=s.cardiacOutput;$('perfusionMeter').setAttribute('aria-valuetext',s.perfusionLabel);$('perfusionText').textContent=s.perfusionLabel;
 const values=[['1回の拍出量 SV',s.low?'↓':'→'],['心拍出量 CO',s.low?'↓':'→'],['心拍数',s.compensated?'↑':'→'],['血管抵抗 TPR',s.compensated?'↑':'→'],['循環血液量',s.compensated?'↑方向':'→'],['交感神経・RAAS',s.compensated?'↑':'→'],['血圧',s.pressureLabel]];
 $('metrics').replaceChildren();for(const [name,value] of values){const el=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;if(name==='血圧')el.className='bp';el.append(dt,dd);$('metrics').append(el);}
 document.querySelectorAll('[data-symptom]').forEach(b=>{b.disabled=b.dataset.symptom==='perfusion'?!s.low:!s.persistent;b.setAttribute('aria-pressed',String(symptom===b.dataset.symptom));});
 $('symptomDescription').textContent=symptom?model.symptoms[symptom].text:'症状ボタンを押すと、関係する場所と仕組みを確認できます。症状の出現は人によって異なります。';
 raas.render({low:s.compensated,enabled:true,stage:6});
 $('raasContext').textContent=s.persistent?'RAASは本来、循環を守る仕組みです。心機能低下に対する活性化が持続すると、血管収縮・体液貯留が心負荷やうっ血に関与します。':s.compensated?'短期的には、血管収縮とNa⁺・水分保持が循環を支える方向に働きます。':'代償期へ進めると、RAASの経路が表示されます。';
}
function restart(){phase=0;symptom=null;render();}
$('pump').addEventListener('input',restart);
$('reducePump').addEventListener('click',()=>{$('pump').value=40;restart();});
$('advance').addEventListener('click',()=>{phase=Math.min(2,phase+1);symptom=null;render();});
$('previous').addEventListener('click',()=>{phase=Math.max(0,phase-1);symptom=null;render();});
$('reset').addEventListener('click',()=>{$('pump').value=100;motion=!media.matches;$('advanced').open=false;$('raasDetail').open=false;restart();});
$('motionToggle').addEventListener('click',()=>{motion=!motion;render();});
media.addEventListener('change',e=>{if(e.matches)motion=false;render();});
for(const b of document.querySelectorAll('[data-symptom]'))b.addEventListener('click',()=>{symptom=symptom===b.dataset.symptom?null:b.dataset.symptom;render();});
for(const b of document.querySelectorAll('[data-inspect]'))b.addEventListener('click',()=>{symptom=b.dataset.inspect;render();$('hfMap').scrollIntoView({block:'center',behavior:'auto'});});
render();
})();
