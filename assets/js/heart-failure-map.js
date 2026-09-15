/* Reusable bad-cycle/anatomy view for LAB 31/32.
   mount(container) -> render(state, {motion, focus, emphasis}).
   emphasis accepts independent heart/kidneys/sympathetic/raas/volume/vessels/congestion/load keys.
   data-target hooks allow LAB 32 to add drug overlays without changing the graph topology. */
(function(root){
'use strict';
function mount(container){
 const scratch=document.createElement('div');root.CIRCULATION_MAP.mount(scratch);
 const anatomy=scratch.querySelector('.map-anatomy svg').cloneNode(true);
 anatomy.setAttribute('aria-label','心臓・肺・血管・腎臓・下肢の模式図。青色はうっ血の例。');
 anatomy.querySelector('title').textContent='心不全の循環・うっ血模式図';
 anatomy.querySelector('desc').textContent='ポンプ機能低下に対する代償と、その持続に伴う肺・下肢のうっ血を示します。';
 anatomy.querySelector('[data-organ="liver"]').remove();
 anatomy.querySelector('[data-organ="adrenals"]').remove();
 const svgNS='http://www.w3.org/2000/svg',lungs=document.createElementNS(svgNS,'g');
 lungs.setAttribute('data-organ','lungs');lungs.setAttribute('class','organ lungs');
 lungs.innerHTML='<path d="M151 95 C132 95 119 120 118 145 Q135 152 153 143Z M180 95 C201 95 214 120 214 145 Q198 152 181 143Z" fill="#d9e4ee" stroke="#97adbf" stroke-width="2"/><g data-lung-water fill="#63a7d1"><ellipse cx="136" cy="137" rx="15" ry="10"/><ellipse cx="197" cy="137" rx="15" ry="10"/><circle cx="137" cy="117" r="4"/><circle cx="198" cy="116" r="4"/></g><path d="M118 113 H72" stroke="#667085"/><text x="44" y="118">肺</text>';
 anatomy.insertBefore(lungs,anatomy.querySelector('[data-organ="vessels"]'));
 const legs=document.createElementNS(svgNS,'g');legs.setAttribute('data-organ','legs');legs.setAttribute('class','organ legs');
 legs.innerHTML='<g data-leg-water fill="#63a7d1"><ellipse cx="139" cy="324" rx="19" ry="30"/><ellipse cx="191" cy="324" rx="19" ry="30"/></g><path d="M211 326 H244" stroke="#667085"/><text x="246" y="331">下肢</text>';
 anatomy.append(legs);
 const heart=anatomy.querySelector('[data-organ="heart"]');const pulse=document.createElementNS(svgNS,'g');pulse.setAttribute('class','hf-heart-pulse');pulse.append(heart.firstElementChild);heart.prepend(pulse);
 container.innerHTML='<div class="hf-cycle"><svg class="cycle-return-edge" viewBox="0 0 30 400" preserveAspectRatio="none" aria-hidden="true"><path class="loop-track" d="M29 395 H5 V10 H24"/><path class="loop-flow" d="M29 395 H5 V10 H24"/><path d="M19 4 L27 10 L19 16" fill="none" stroke="#bd704e" stroke-width="2"/></svg><div class="hf-node node-heart" data-target="heart"><strong>心臓のポンプ機能</strong><span data-copy="heart"></span><span class="node-arrow">↓ 全身に送る血液</span></div><div class="hf-anatomy"></div><div class="hf-node node-kidneys" data-target="kidneys"><strong>腎臓への血流</strong><span data-copy="kidneys"></span><span class="node-arrow">↓ 感知する</span></div><div class="hf-node node-sympathetic" data-target="sympathetic"><strong>交感神経</strong><span data-copy="sympathetic"></span></div><div class="hf-node node-raas" data-target="raas"><strong>RAAS</strong><span data-copy="raas"></span></div><div class="hf-node node-vessels" data-target="vessels"><strong>血管抵抗 TPR</strong><span data-copy="vessels"></span><svg viewBox="0 0 180 32" role="img" aria-label="血管の内腔"><rect x="5" y="1" width="170" height="30" rx="13" fill="#d9919c"/><rect data-lumen x="8" y="7" width="164" height="18" rx="8" fill="white"/></svg></div><div class="hf-node node-volume" data-target="volume"><strong>Na⁺・水分保持</strong><span data-copy="volume"></span><div class="hf-volume"><i data-volume></i></div></div><div class="cycle-result" data-target="congestion"><strong data-copy="result"></strong><span data-copy="congestion"></span></div><div class="return-loop" data-target="load"><svg viewBox="0 0 700 32" preserveAspectRatio="none" aria-hidden="true"><path class="loop-track" d="M680 6 V23 H20 V6"/><path class="loop-flow" d="M680 6 V23 H20 V6"/><path d="M12 14 L20 5 L28 14" fill="none" stroke="#bd704e" stroke-width="3"/></svg><span>↶ 心臓の負担・うっ血 → 悪化する方向 → ポンプ機能へ</span></div></div>';
 container.querySelector('.hf-anatomy').append(anatomy);
 return {render(s,options={}){
  container.dataset.phase=String(s.phase);container.dataset.motion=options.motion?'running':'paused';
  const copy=(key,text)=>container.querySelector(`[data-copy="${key}"]`).textContent=text;
  copy('heart',s.low?'低下 → SV↓ → CO↓':'標準 → SV・COを保つ');
  copy('kidneys',s.low?'有効動脈血液量・腎灌流↓方向':'灌流を保つ');
  copy('sympathetic',s.compensated?'↑ 心拍数↑・収縮力↑方向・血管収縮':'追加の活性化は未表示');
  copy('raas',s.compensated?'↑ Ang II・アルドステロン↑':'追加の活性化は未表示');
  copy('vessels',s.compensated?'血管収縮 → TPR↑':'基準の太さ');
  copy('volume',s.compensated?'Na⁺再吸収↑ → 水分保持↑ → 血液量↑方向':'基準の保持');
  copy('result',s.persistent?'心負荷↑ ＋ うっ血↑':s.compensated?'短期的には：循環を維持する方向':'血流・血圧を保つ身体の仕組み');
  copy('congestion',s.persistent?'戻る血液↑ → 充満圧・静脈圧↑方向 → 肺・体静脈うっ血':s.compensated?'心拍数・血管抵抗・体液量で低下を補おうとする':'ポンプ機能を下げて、時間を進めてみよう');
  for(const el of container.querySelectorAll('[data-target]')){const key=el.dataset.target;el.classList.toggle('engaged',(s.nodes[key]||0)>0);el.classList.toggle('focused',options.focus===key||Boolean(options.emphasis?.[key]));}
  for(const el of anatomy.querySelectorAll('[data-organ]')){
    const key=el.dataset.organ;el.classList.toggle('active',key==='heart'?s.low:key==='lungs'||key==='legs'?s.persistent:key==='vessels'?s.compensated:s.low);
    el.classList.toggle('symptom-focus',options.focus==='congestion'&&key==='lungs'||options.focus==='volume'&&key==='legs'||options.focus==='heart'&&key==='heart');
  }
  anatomy.querySelector('[data-lung-water]').style.opacity=String(s.congestion);
  anatomy.querySelector('[data-leg-water]').style.opacity=String(s.congestion);
  const h=18-12*(s.resistance-1);container.querySelector('[data-lumen]').setAttribute('height',h);container.querySelector('[data-lumen]').setAttribute('y',(32-h)/2);
  container.querySelector('[data-volume]').style.width=(45+40*(s.volume-1))+'%';
  container.style.setProperty('--beat-duration',(.86/s.heartRate)+'s');container.style.setProperty('--heart-scale',String(1+.17*s.strokeVolume));
  container.querySelector('.return-loop').hidden=!s.persistent;container.querySelector('.cycle-return-edge').hidden=!s.persistent;
 }};
}
root.HEART_FAILURE_MAP={mount};
})(typeof window==='undefined'?globalThis:window);
