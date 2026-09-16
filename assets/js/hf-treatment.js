(() => {
'use strict';
const $=id=>document.getElementById(id),M=window.HF_TREATMENT_MODEL;
const media=matchMedia('(prefers-reduced-motion: reduce)');
let ids=[],adding=false,after=false,motion=!media.matches,message='まずは右の悪循環を見てみよう。';
const map=window.HF_TREATMENT_MAP.mount($('treatmentMap')),raas=window.RAAS_PATHWAY.mount($('treatmentRaas'),{mode:'drug'});
function node(tag,text){const el=document.createElement(tag);el.textContent=text;return el;}
function render(){
 const s=M.state(ids,after);ids=s.selected;map.render(s,{motion});
 $('viewBadge').textContent=s.after?'治療後：作用の方向':'治療前';
 $('beforeView').setAttribute('aria-pressed',String(!s.after));$('afterView').setAttribute('aria-pressed',String(s.after));$('afterView').disabled=!ids.length;
 $('addTreatment').disabled=!ids.length;$('addTreatment').setAttribute('aria-pressed',String(adding));$('addTreatment').textContent=adding?'追加モード：次の薬効群を選ぶ':'もう1つ追加する';
 $('selectionMessage').textContent=message;
 document.querySelectorAll('[data-drug]').forEach(b=>b.setAttribute('aria-pressed',String(ids.includes(b.dataset.drug))));
 $('activeTreatments').replaceChildren();for(const id of ids){const b=node('button',M.drugs[id].name+' ×');b.setAttribute('aria-label',M.drugs[id].name+'を表示から除外');b.dataset.remove=id;b.addEventListener('click',()=>{ids=ids.filter(x=>x!==id);if(!ids.length){adding=false;after=false;}message='表示から除外しました。実際の中止操作ではありません。';render();});$('activeTreatments').append(b);}
 $('motionToggle').textContent=motion?'拍動・矢印の動きを停止':'拍動・矢印の動きを開始';$('motionToggle').setAttribute('aria-pressed',String(motion));
 $('treatmentSummary').replaceChildren();
 if(!s.after)$('treatmentSummary').append(node('p','治療前：交感神経・RAASの活性化 → 血管収縮・Na⁺/水分保持 → 心負荷・うっ血。'));
 else {
  $('treatmentSummary').append(node('p',ids.map(id=>M.drugs[id].name).join(' ＋ ')));
  $('treatmentSummary').append(node('p',ids.length>1?'異なる作用点へ複数の方法で介入しています。図の薄まり方は薬効の足し算ではありません。':M.drugs[ids[0]].mechanism.join(' ／ ')));
  if(s.changed.sglt2Benefit)$('treatmentSummary').append(node('p','SGLT2阻害薬の心不全への有益性は、単純な利尿作用だけでは説明できません。'));
 }
 const c=s.changed;const metrics=[['心拍数',!s.after?'↑':c.heartRate?'↓方向':'表示は維持'],['血管収縮',!s.after?'↑':c.vessels?'↓方向':'表示は維持'],['Na⁺・水分保持',!s.after?'↑':c.volume?'↓方向':'表示は維持'],['心負荷',!s.after?'↑':c.load?'長期に抑制方向':c.sglt2Benefit?'有益性は多機序':'うっ血を軽減'],['肺うっ血・呼吸困難',!s.after?'増加の例':c.volume?'改善方向':'ここでは未変更'],['下肢浮腫',!s.after?'増加の例':c.volume?'改善方向':'ここでは未変更'],['体重',!s.after?'体液貯留で↑':c.volume?'過剰体液が減れば↓':'ここでは未変更'],['CO・EF','変化量を予測しない']];
 $('treatmentMetrics').replaceChildren();for(const [k,v] of metrics){const el=node('div','');el.append(node('dt',k),node('dd',v));$('treatmentMetrics').append(el);}
 const family=s.active.find(id=>M.family.includes(id));const raasId=family==='arni'?'arb':family|| (s.active.includes('mra')?'mra':'none');
 const targets=[];if(family)targets.push(family==='ace'?'ace':'at1');if(s.active.includes('mra'))targets.push('mr');raas.render({id:raasId,targets});
 if(s.active.includes('mra'))$('treatmentRaas').querySelector('[data-effect="retention"]').textContent='MR遮断 → Na⁺保持↓方向・心血管リモデリング↓方向';
 $('pathwayState').textContent=s.after?'選択中の治療の作用点を表示しています。':'治療前の経路を表示しています。';
 $('npPath').hidden=!s.active.includes('arni');$('proximalPart').classList.toggle('active',s.active.includes('sglt2'));$('loopPart').classList.toggle('active',s.active.includes('loop'));
 $('proximalText').textContent=s.active.includes('sglt2')?'SGLT2 BLOCK → Na⁺・糖再吸収↓ → 尿中排泄↑':'Na⁺・糖を再吸収する部位';
 $('loopText').textContent=s.active.includes('loop')?'NKCC2 BLOCK → Na⁺再吸収↓ → Na⁺・水分排泄↑':'Na⁺などを再吸収する部位';
 $('careHint').textContent=ids.length?'選択した薬効群の作用と、観察する理由です。':'薬効群を選ぶと、作用と「なぜ見るのか」を表示します。';
 $('selectedCare').replaceChildren();for(const id of ids){const d=M.drugs[id],a=node('article','');a.dataset.care=id;a.append(node('h3',d.name),node('p',d.role==='longterm'?'役割：悪循環・長期予後への介入':'役割：主にうっ血・症状を改善'));for(const line of d.mechanism)a.append(node('p',line));a.append(node('p',d.note),node('h4','何を観察する？'));const ul=node('ul','');for(const line of d.observe)ul.append(node('li',line));a.append(ul,node('p',d.caution));$('selectedCare').append(a);}
}
for(const [id,d] of Object.entries(M.drugs)){const b=node('button',d.name);b.dataset.drug=id;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{const old=ids.find(x=>M.family.includes(x));ids=M.choose(ids,id,adding);after=true;message=adding&&old&&M.family.includes(id)&&old!==id?'同じRAAS枠の'+M.drugs[old].name+'を'+d.name+'に入れ替えました。':adding?'作用点を追加しました。さらに追加するか、選択済みの×で除外できます。':d.name+'を単独で表示しています。';render();});$(d.role==='longterm'?'longtermButtons':'loopButton').append(b);}
$('addTreatment').addEventListener('click',()=>{adding=!adding;$('treatmentPicker').open=true;message=adding?'次に重ねる薬効群を選んでください。':'次に選ぶ薬効群を単独で表示します。';render();});
$('beforeView').addEventListener('click',()=>{after=false;render();});$('afterView').addEventListener('click',()=>{after=true;render();});
$('motionToggle').addEventListener('click',()=>{motion=!motion;render();});media.addEventListener('change',e=>{if(e.matches)motion=false;render();});
$('reset').addEventListener('click',()=>{ids=[];adding=false;after=false;motion=!media.matches;$('treatmentPicker').open=false;$('pathwayDetails').open=false;$('advanced').open=false;message='まずは右の悪循環を見てみよう。';render();});
render();
})();
