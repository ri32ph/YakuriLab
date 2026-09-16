(() => {
  function mount(container){
    container.classList.add('collecting-cell');container.innerHTML=`<div class="cell-zone lumen"><strong>尿細管腔</strong><span class="na-stream">Na⁺ Na⁺ Na⁺</span><span class="k-stream">K⁺ K⁺</span></div><div class="principal-cell"><strong>集合管 主細胞</strong><div class="apical"><b data-role="enac">ENaC</b><b>ROMK</b></div><div class="cell-ions"><i class="na-ion">Na⁺ →</i><i class="k-ion">← K⁺</i></div><div class="basolateral"><b>Na⁺/K⁺-ATPase</b><small>3 Na⁺ →　← 2 K⁺</small></div><span class="mr" data-role="mr">MR</span></div><div class="cell-zone blood"><strong>血液側</strong><span>Na⁺ → 血液</span><span>K⁺ → 細胞</span></div><div class="cell-caption" data-role="caption"></div>`;
    const q=role=>container.querySelector(`[data-role="${role}"]`);
    return {render(s){container.style.setProperty('--na-speed',`${(1.7-s.delivered/100).toFixed(2)}s`);container.style.setProperty('--k-speed',`${(1.8-s.kSecretion/100).toFixed(2)}s`);container.dataset.k=s.kSecretion>44?'high':s.kSecretion<28?'low':'normal';container.dataset.enac=s.enacActivity<.35?'blocked':'open';q('enac').textContent=s.drug.id==='enac'?'ENaC｜BLOCK':'ENaC';q('mr').textContent=['mra','combo'].includes(s.drug.id)?'MR｜BLOCK':`MR｜アルドステロン ${s.aldosterone.toFixed(0)}`;q('caption').textContent=`${s.explanations.enac} → ${s.explanations.pump} → ${s.explanations.romk}`;}};
  }
  window.CollectingDuctCell=Object.freeze({mount});
})();
