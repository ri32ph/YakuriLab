(() => {
  const M=window.NEPHRON_MODEL,$=id=>document.getElementById(id),ids=['loop','thiazide','mra','enac','ca','osmotic','sglt2'];
  let selected='none',stage=0,timer=null,running=false;
  const view=window.NephronSimulation.mount($('drugNephronView'),{onSegment:id=>{stop();stage=M.SEGMENTS.findIndex(s=>s.id===id);render();}});
  function button(id){const d=M.DRUGS[id],b=document.createElement('button');b.type='button';b.dataset.drug=id;b.innerHTML=`<strong>${d.label}</strong><small>${d.target}</small>`;b.addEventListener('click',()=>select(id));return b}
  ['loop','thiazide','mra','enac'].forEach(id=>$('basicDrugs').append(button(id)));['ca','osmotic','sglt2'].forEach(id=>$('advancedDrugs').append(button(id)));
  for(const select of [$('compareA'),$('compareB')])ids.slice(0,6).forEach(id=>{const o=document.createElement('option');o.value=id;o.textContent=M.DRUGS[id].label;select.append(o)});$('compareA').value='loop';$('compareB').value='thiazide';
  function select(id){selected=id;const target=M.DRUGS[id].segment;stage=target?M.SEGMENTS.findIndex(s=>s.id===target):0;document.querySelectorAll('[data-drug]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.drug===id)));render()}
  function render(){const s=M.simulate({adh:1,drugClass:selected}),d=s.drug,current=s.stages[stage];view.render({stage,adh:1,drugClass:selected,track:'na',running});$('drugTitle').textContent=d.label;$('drugEffect').textContent=d.effect;$('drugTarget').textContent=`作用点：${d.segment?M.SEGMENTS.find(x=>x.id===d.segment).name:'—'}／${d.target}`;$('drugStatus').textContent=running?`${current.short}を観察中`:d.label;
    const targetIndex=M.SEGMENTS.findIndex(x=>x.id===d.segment);$('drugPrompt').textContent=d.id==='none'?'薬なしの正常な流れです。':current.blocked?`${d.target}をBLOCK。再吸収されなかったNa⁺は消えず、下流へ流れます。`:`${current.name}：作用部位${current.index<targetIndex?'より前':'より後'}。Na⁺の残り方を比べよう。`;
    $('urineNa').textContent=d.id==='none'?'基準':s.urineNa>8?'増加方向':'やや増加方向';$('urineWater').textContent=d.id==='none'?'基準':s.urineWater>13?'増加方向':'やや増加方向';$('urineNaBar').style.width=`${s.sodiumExcretionIndex}%`;$('urineWaterBar').style.width=`${s.waterExcretionIndex}%`;
    $('drugDetails').innerHTML=`<p><strong>${d.label}</strong>｜標的：${d.target}</p><p>${d.effect}</p><p>代表例：${d.examples}</p><p>下流Na⁺送達：${d.distalNa}／K⁺：${d.kDirection}</p>`;
    $('observationList').innerHTML=['尿量','体重','浮腫','血圧','脱水徴候','Na⁺','K⁺','腎機能','酸塩基平衡','尿糖'].map(x=>`<span class="${d.observation.includes(x)?'emphasis':''}">${x}</span>`).join('');
  }
  function stop(){if(timer)clearInterval(timer);timer=null;running=false;render()}
  function run(id=selected){selected=id;if(timer)clearInterval(timer);stage=0;running=true;render();timer=setInterval(()=>{if(stage>=M.SEGMENTS.length-1){stop();return}stage++;render()},820)}
  function comparison(){const a=M.DRUGS[$('compareA').value],b=M.DRUGS[$('compareB').value],card=d=>`<div><h3>${d.label}</h3><dl><dt>作用部位</dt><dd>${M.SEGMENTS.find(s=>s.id===d.segment)?.name||'複数部位'}</dd><dt>標的</dt><dd>${d.target}</dd><dt>Na⁺再吸収</dt><dd>低下方向</dd><dt>下流Na⁺</dt><dd>${d.distalNa}</dd><dt>水排泄</dt><dd>増加方向</dd><dt>K⁺</dt><dd>${d.kDirection}</dd></dl></div>`;$('comparisonTable').hidden=false;$('comparisonTable').innerHTML=card(a)+card(b)}
  $('normalRun').addEventListener('click',()=>{select('none');run('none')});$('drugRun').addEventListener('click',()=>run(selected));$('drugPause').addEventListener('click',stop);$('compareButton').addEventListener('click',comparison);$('drugReset').addEventListener('click',()=>{stop();selected='none';stage=0;$('comparisonTable').hidden=true;document.querySelectorAll('[data-drug]').forEach(b=>b.setAttribute('aria-pressed','false'));render()});
  render();
})();
