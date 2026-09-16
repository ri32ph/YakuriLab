/* Instance-scoped reusable heart / coronary / oxygen balance view for LAB 33 onward. */
(() => {
 const outline='M170 93 C111 27 23 94 91 184 Q120 226 169 262 Q233 219 267 161 C315 72 220 28 170 93';
 function mount(container){
 container.innerHTML=`<div class="coronary-layout"><svg class="coronary-heart" viewBox="0 0 340 300" role="img" aria-label="心筋と表面の冠動脈。右下は冠動脈の拡大図">
 <g class="heart-beat" data-target="heart"><path d="${outline}" fill="#d95c67" stroke="#c24d5b" stroke-width="3"/>
 <path d="M177 84 C182 54 196 34 214 29 M155 78 L145 32" fill="none" stroke="#d9919c" stroke-width="22"/>
 <path d="M173 88 Q140 125 160 170 T178 239 M157 120 Q112 111 82 135 M160 163 Q214 143 254 111 M171 206 L213 195" fill="none" stroke="#fbe8cf" stroke-width="12" stroke-linecap="round"/>
 <path class="coronary-flow" d="M173 88 Q140 125 160 170 T178 239 M157 120 Q112 111 82 135 M160 163 Q214 143 254 111" fill="none" stroke="#bd394e" stroke-width="5" stroke-dasharray="5 10"/>
 <path data-ischemia d="M198 170 Q237 151 258 156 Q239 217 179 251 Q204 214 198 170" fill="#8154a0" opacity="0"/>
 <circle data-clot cx="155" cy="138" r="11" fill="#773654" stroke="#fff" stroke-width="2"/>
 </g><text x="8" y="28">心筋</text><path d="M43 32 L90 79" stroke="#667085"/><text x="235" y="45">冠動脈</text><path d="M256 51 L223 126" stroke="#667085"/><text x="12" y="282" class="ischemia-label">紫：酸素不足の領域（模式）</text></svg>
 <div class="coronary-detail"><strong>冠動脈の内腔</strong><svg viewBox="0 0 240 78" role="img" aria-label="冠動脈の内腔と血流"><rect x="8" y="12" width="224" height="54" rx="24" fill="#d9919c"/><path data-lumen d="M12 25 H80 Q120 25 160 25 H228 V53 H160 Q120 53 80 53 H12Z" fill="#fff"/><path class="coronary-flow" d="M16 39 H224" stroke="#315b9a" stroke-width="3" stroke-dasharray="6 10"/><g data-clot><circle cx="117" cy="36" r="12" fill="#773654"/><circle cx="132" cy="43" r="10" fill="#914366"/></g></svg><p data-flow></p><div class="diastole"><span data-diastole></span></div><p class="small" data-perfusion></p><div class="heart-target" data-target="wall">壁応力：<strong data-wall></strong></div><p class="small">28の心臓・血管と同じ配色。内腔幅は狭窄率ではありません。</p></div></div>
 <div class="oxygen-gauges"><div class="oxygen-demand"><strong>心筋酸素需要 <small>MVO₂ DEMAND</small></strong><div class="oxygen-track"><i data-demand></i></div></div><div class="oxygen-supply"><strong>心筋酸素供給 <small>O₂ SUPPLY</small></strong><div class="oxygen-track"><i data-supply></i></div></div></div><p class="small">同じ目盛りの相対表示。供給は冠血流と血液の酸素含量で変わります。</p><div class="balance-message" role="status" data-balance></div><div class="platelet-path" data-target="thrombus">血小板活性化 → 凝集 <b data-block hidden>BLOCK</b> → 血栓形成<span data-platelet-note></span></div>`;
 const q=s=>container.querySelector(s);
 return {render(s,{motion=true}={}){
 container.dataset.motion=motion?'running':'paused';container.style.setProperty('--beat',s.beatSeconds+'s');container.style.setProperty('--strength',1.015+s.force*.035);container.style.setProperty('--flow-speed',Math.max(.35,1.4/Math.max(.1,s.flow))+'s');
 q('[data-demand]').style.width=Math.min(100,s.demand/4.4*100)+'%';q('[data-supply]').style.width=Math.min(100,s.supply/4.4*100)+'%';
 const y=39-s.lumen/2,z=39+s.lumen/2;q('[data-lumen]').setAttribute('d',`M12 24 H60 Q105 24 112 ${y} H135 Q158 24 180 24 H228 V54 H180 Q158 54 135 ${z} H112 Q105 54 60 54 H12Z`);
 container.querySelectorAll('[data-clot]').forEach(e=>e.style.display=s.thrombus?'':'none');q('[data-ischemia]').style.opacity=Math.min(.85,s.deficit*1.3);q('[data-flow]').textContent='冠血流：'+(s.flow<.9?'低下方向':s.flow>1.2?'増加方向':'安静時付近');
 q('[data-diastole]').style.width=(.65*s.diastole/s.rate)*100+'%';q('[data-perfusion]').textContent=s.diastole<1?'速い心拍 → 拡張期が短縮 → 供給にも不利':'青：拡張期の灌流時間（相対イメージ）';q('[data-wall]').textContent=s.stress<.98?'低下方向':s.stress>1.02?'増加方向':'標準付近';
 q('[data-balance]').classList.toggle('is-ischemia',s.ischemia);q('[data-balance]').innerHTML=s.ischemia?'<strong>必要な酸素に、供給が追いつかない</strong><br>この状態を心筋虚血といいます。':'<strong>需要 ≤ 供給：バランスが保たれている</strong><br>冠血流を増やせると、仕事量の増加にも対応できます。';
 q('[data-block]').hidden=!s.block;q('[data-platelet-note]').textContent=s.block?'血栓形成を抑える作用。既存の血栓は消えません。':'';
 container.querySelectorAll('[data-target]').forEach(e=>e.classList.toggle('drug-focus',e.dataset.target===s.target));
 }};
 }
 window.CORONARY_HEART={mount,outline};
})();
