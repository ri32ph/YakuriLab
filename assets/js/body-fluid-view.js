(() => {
  function mount(container){
    container.classList.add('fluid-view');
    container.innerHTML=`<div class="fluid-overview"><div class="kidney-node">腎臓<small>Na⁺・水</small></div><span class="flow-arrow">→</span><div class="body-node"><div class="body-head"></div><div class="body-core"><span class="iv-label">血管内</span><span class="is-label">間質</span><span class="ic-label">細胞内</span><i class="body-fluid" data-role="fluid"></i></div></div><div class="fluid-legend"><span><i class="iv"></i>血管内</span><span><i class="is"></i>間質</span><span><i class="ic"></i>細胞内</span></div></div><div class="capillary-scene"><div class="capillary" data-role="capillary"><b>毛細血管内</b><div class="rbc">●　●</div><div class="albumin">Alb　Alb</div><i class="water-out" data-role="water-out">H₂O →</i></div><div class="wall" data-role="wall">毛細血管壁</div><div class="interstitium" data-role="interstitium"><b>間質</b><span class="tissue-cell">細胞</span><i class="protein-leak" data-role="protein">Alb →</i></div><div class="lymph" data-role="lymph">リンパ管<br><span>回収 ↑</span></div></div><p class="fluid-caption" data-role="caption"></p>`;
    const q=r=>container.querySelector(`[data-role="${r}"]`);
    return {render(s){
      const total=s.intravascularVolume+s.interstitialVolume+s.intracellularVolume,iv=s.intravascularVolume/total*100,is=s.interstitialVolume/total*100;
      container.style.setProperty('--iv',`${iv.toFixed(1)}%`);container.style.setProperty('--is',`${is.toFixed(1)}%`);container.style.setProperty('--ic',`${(100-iv-is).toFixed(1)}%`);
      container.dataset.edema=s.edemaIndex>55?'high':s.edemaIndex>32?'mid':'low';container.dataset.permeability=s.vascularPermeability>70?'high':'normal';
      q('water-out').style.setProperty('--flow',Math.max(.25,Math.min(1.8,1+s.filtrationDrive/55)));q('water-out').textContent=s.filtrationDrive>8?'H₂O →→':s.filtrationDrive<-8?'← H₂O':'H₂O ⇄';
      q('protein').hidden=s.vascularPermeability<68;q('lymph').classList.toggle('weak',s.lymphaticReturn<35);
      q('caption').textContent=`間質液 ${s.interstitialVolume.toFixed(0)}・浮腫 ${s.edemaLabel}｜主な変化：${s.mainFactor}${s.localized?'（局所性を含む）':''}`;
    }};
  }
  window.BodyFluidCompartments=Object.freeze({mount});
  window.CapillaryExchange=window.BodyFluidCompartments;
  window.InterstitialFluid=window.BodyFluidCompartments;
  window.LymphaticReturn=window.BodyFluidCompartments;
})();
