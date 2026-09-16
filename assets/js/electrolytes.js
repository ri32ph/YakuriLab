(() => {
  const M=window.ELECTROLYTE_MODEL;
  const $=id=>document.getElementById(id);
  const inputs={distalNa:$('distalNa'),aldosterone:$('aldosterone'),waterBalance:$('waterBalance')};
  let drugClass='none';
  const nephron=window.NephronSimulation.mount($('electrolyteNephron'));
  const cell=window.CollectingDuctCell.mount($('collectingCell'));
  const scale=v=>v>67?'高い':v<37?'低い':'基準付近';
  const presets={loop:['ループ利尿薬',75,65,50],thiazide:['サイアザイド系',68,60,60],mra:['MRA',58,65,50],combo:['ループ＋MRA',78,68,50]};
  function values(){return {drugClass,distalNa:+inputs.distalNa.value,aldosterone:+inputs.aldosterone.value,waterBalance:+inputs.waterBalance.value};}
  function render(){
    const s=M.state(values());
    Object.entries(inputs).forEach(([key,input])=>$(key+'Out').value=input.value);
    document.querySelectorAll('#electrolyteDrugs button').forEach(b=>{b.classList.toggle('active',b.dataset.drug===drugClass);b.setAttribute('aria-pressed',String(b.dataset.drug===drugClass));});
    nephron.render({stage:5,adh:.8,drugClass:s.drug.nephron,track:'na'});cell.render(s);
    $('electrolytePrompt').textContent=`${s.drug.label}：${s.explanations.distal}`;
    $('electrolyteStatus').textContent=s.kLabel;
    $('urineNaMetric').textContent=`${s.drug.na}（${s.urineNa.toFixed(0)}）`;
    $('urineKMetric').textContent=`${s.drug.k}（${s.kSecretion.toFixed(0)}）`;
    $('serumNaMetric').textContent=`${s.serumNaLabel}（相対${s.serumNaIndex.toFixed(0)}）`;
    $('urineFlowMetric').textContent=scale(s.urineFlow);
    $('electrolytePath').innerHTML=`<b>遠位Na⁺ ${s.delivered.toFixed(0)}</b><span>→</span><b>ENaC ${Math.round(s.enacActivity*100)}</b><span>→</span><b>K⁺分泌 ${s.kSecretion.toFixed(0)}</b><span>→</span><strong>${s.kLabel}</strong>`;
  }
  $('electrolyteDrugs').innerHTML=Object.values(M.DRUGS).filter(d=>d.id!=='combo').map(d=>`<button type="button" data-drug="${d.id}">${d.label}</button>`).join('');
  $('electrolytePresets').innerHTML=Object.entries(presets).map(([id,p])=>`<button type="button" data-preset="${id}">${p[0]}</button>`).join('');
  $('electrolyteDrugs').addEventListener('click',e=>{const b=e.target.closest('[data-drug]');if(!b)return;drugClass=b.dataset.drug;render();});
  $('electrolytePresets').addEventListener('click',e=>{const b=e.target.closest('[data-preset]');if(!b)return;const [label,na,aldo,water]=presets[b.dataset.preset];drugClass=b.dataset.preset;inputs.distalNa.value=na;inputs.aldosterone.value=aldo;inputs.waterBalance.value=water;render();});
  Object.values(inputs).forEach(input=>input.addEventListener('input',render));
  $('electrolyteReset').addEventListener('click',()=>{drugClass='none';inputs.distalNa.value=50;inputs.aldosterone.value=50;inputs.waterBalance.value=50;render();});
  render();
})();
