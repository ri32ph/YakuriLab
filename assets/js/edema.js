(() => {
  const M=window.BODY_FLUID_MODEL,$=id=>document.getElementById(id);
  const keys=['sodiumRetention','waterRetention','hydrostaticPressure','plasmaOncoticPressure','vascularPermeability','lymphaticReturn','diuresis'];
  const inputs=Object.fromEntries(keys.map(k=>[k,$(k)]));
  let context='normal',preset='normal';
  const view=window.BodyFluidCompartments.mount($('fluidView'));
  const metric=(v,lo=92,hi=108)=>v<lo?'低下方向':v>hi?'増加方向':'標準付近';
  function current(){return {...Object.fromEntries(keys.map(k=>[k,+inputs[k].value])),context};}
  function render(){
    const s=M.state(current());view.render(s);
    keys.forEach(k=>$(k+'Out').value=inputs[k].value);
    document.querySelectorAll('[data-fluid-preset]').forEach(b=>{b.classList.toggle('active',b.dataset.fluidPreset===preset);b.setAttribute('aria-pressed',String(b.dataset.fluidPreset===preset));});
    $('ivMetric').textContent=`${metric(s.intravascularVolume)} ${s.intravascularVolume.toFixed(0)}`;
    $('interstitialMetric').textContent=`${s.edemaLabel} ${s.interstitialVolume.toFixed(0)}`;
    $('eavMetric').textContent=`${metric(s.effectiveArterialVolume)} ${s.effectiveArterialVolume.toFixed(0)}`;
    $('serumNaFluidMetric').textContent=`${s.serumNaLabel} ${s.serumNaIndex.toFixed(0)}`;
    $('edemaBar').style.width=`${s.edemaIndex}%`;$('edemaValue').textContent=`${s.edemaLabel}（相対 ${s.edemaIndex.toFixed(0)}）`;
    const extra=s.pulmonaryCongestion?'。肺うっ血の方向にも注意します。':'';
    $('fluidPath').textContent=`${M.PRESETS[preset]?.label||'自由設定'}：${s.mainFactor} → 間質液 ${s.edemaLabel}${extra}`;
    $('fluidNote').textContent=s.localized?'全身ではなく、局所に強く現れる場合がある設定です。':s.context==='heart-failure'||s.context==='cirrhosis'?'体液が多くても、有効動脈血液量が低い方向になり得ます。':'血管内・間質・細胞内の分布を同時に観察します。';
  }
  $('fluidPresets').innerHTML=Object.entries(M.PRESETS).map(([id,p])=>`<button type="button" data-fluid-preset="${id}">${p.label}</button>`).join('');
  $('fluidPresets').addEventListener('click',e=>{const b=e.target.closest('[data-fluid-preset]');if(!b)return;preset=b.dataset.fluidPreset;const p=M.PRESETS[preset];context=p.context;keys.forEach(k=>inputs[k].value=p[k]);render();});
  Object.values(inputs).forEach(input=>input.addEventListener('input',()=>{preset='custom';context='custom';render();}));
  $('fluidReset').addEventListener('click',()=>{preset='normal';context='normal';const p=M.PRESETS.normal;keys.forEach(k=>inputs[k].value=p[k]);render();});
  render();
})();
