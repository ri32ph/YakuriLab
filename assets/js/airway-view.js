(() => {
  function mount(container){
    container.classList.add('airway-component');
    container.innerHTML=`<div class="airway-visuals"><div class="airway-section" role="img" aria-label="気管支断面"><div class="airway-outer"><div class="smooth-muscle" data-role="muscle"><div class="mucosa" data-role="mucosa"><div class="airway-lumen" data-role="lumen"><span>気道内腔</span><i class="mucus m1"></i><i class="mucus m2"></i><i class="mucus m3"></i></div></div></div></div><div class="layer-labels"><span>外側</span><span>平滑筋</span><span>粘膜</span><span>内腔</span></div></div><div class="airway-tube" data-role="tube"><div class="tube-wall top"></div><div class="air-stream" data-role="stream"></div><div class="tube-wall bottom"></div><b data-role="direction">呼気 ←</b></div></div><div class="airway-readout"><div><span>有効な気道の太さ</span><strong data-role="radius">100%</strong></div><div><span>気道抵抗</span><strong data-role="resistance">1.00倍</strong></div><div><span>空気流量</span><strong data-role="flow">基準</strong></div></div><p class="airway-caption" data-role="caption"></p>`;
    const q=r=>container.querySelector(`[data-role="${r}"]`);
    function particles(count){return Array.from({length:count},(_,i)=>`<i style="--i:${i};--row:${i%3}"></i>`).join('');}
    return {render(s,{motion=true}={}){
      container.style.setProperty('--lumen-scale',String(Math.max(.28,s.radiusFraction)));
      container.style.setProperty('--muscle-tone',String(s.effectiveTone/100));
      container.style.setProperty('--edema',String(s.effectiveEdema/100));
      container.style.setProperty('--mucus',String(s.mucusAmount/100));
      container.style.setProperty('--muscle-shadow',`${(9+s.effectiveTone*.18).toFixed(1)}px`);
      container.style.setProperty('--edema-shadow',`${(8+s.effectiveEdema*.28).toFixed(1)}px`);
      container.style.setProperty('--mucus-width',`${(10+s.mucusAmount*.28).toFixed(1)}px`);
      container.style.setProperty('--mucus-height',`${(6+s.mucusAmount*.13).toFixed(1)}px`);
      container.style.setProperty('--flow-speed',`${Math.max(.55,3.2-s.airFlow*2).toFixed(2)}s`);
      container.dataset.motion=motion?'running':'paused';container.dataset.direction=s.direction;
      q('stream').innerHTML=particles(Math.max(2,Math.round(3+s.airFlow*13)));
      q('direction').textContent=s.direction==='expiration'?'呼気 ←':'吸気 →';
      q('radius').textContent=`${s.diameterPercent.toFixed(0)}%`;
      q('resistance').textContent=`${s.airwayResistance.toFixed(s.airwayResistance<10?2:1)}倍`;
      q('flow').textContent=`${s.flowLabel}（相対${(s.airFlow*100).toFixed(0)}）`;
      q('caption').textContent=s.causes.length?`${s.causes.join('＋')} → 有効内腔↓ → 抵抗 ${s.resistanceLabel}`:'正常な1本の管モデル：空気は滑らかに流れます。';
      q('lumen').setAttribute('aria-label',`有効な気道の太さ ${s.diameterPercent.toFixed(0)}%、抵抗 ${s.airwayResistance.toFixed(2)}倍`);
    }};
  }
  window.AirwaySimulation=Object.freeze({mount});
})();
