(() => {
  const M=window.NEPHRON_MODEL;
  const pct=value=>Math.max(0,Math.min(100,value));
  function dots(kind,remaining){
    const count=Math.round(remaining);
    return Array.from({length:100},(_,i)=>`<i class="${i<count?'remaining':'returned'}" title="${i<count?'尿細管内に残る':'体へ戻った'}">${kind==='na'?'Na⁺':'●'}</i>`).join('');
  }
  function segmentCards(){
    return M.SEGMENTS.slice(0,-1).map(s=>`<button type="button" class="nephron-segment" data-segment="${s.id}" aria-pressed="false"><span>${s.short}</span><strong>${s.transporter}</strong><small>${s.permeability}</small><b class="block-label">BLOCK</b></button>`).join('<i class="segment-arrow">→</i>');
  }
  function mount(element,{onSegment}={}){
    element.classList.add('nephron-component');
    element.innerHTML=`
      <div class="nephron-stage-map" aria-label="ネフロン全体図">
        <div class="blood-start"><span>血液</span><b>濾過</b></div>
        <div class="segment-strip">${segmentCards()}<i class="segment-arrow">→</i><div class="urine-end"><span>尿</span><b>排泄</b></div></div>
        <div class="flow-lanes" aria-hidden="true"><div class="tubule-lane"><span>尿細管内を先へ流れる</span><i class="flow-na">Na⁺</i><i class="flow-water">H₂O</i></div><div class="return-lane"><span>血管側へ戻る＝再吸収</span><i>↑ Na⁺</i><i>↑ H₂O</i></div></div>
      </div>
      <div class="nephron-focus">
        <div><span class="focus-kicker">いま見ている場所</span><h3 data-role="stage-name"></h3><p data-role="stage-detail"></p></div>
        <div class="transport-card"><span data-role="transport-input"></span><strong data-role="transport"></strong><b data-role="block">通過</b><small data-role="transport-result"></small></div>
      </div>
      <div class="nephron-gauges">
        <div><span>尿細管内に残るNa⁺</span><strong data-role="na-value">100</strong><div class="gauge"><i data-role="na-bar"></i></div><small>濾過量100を基準</small></div>
        <div><span>尿細管内に残る水</span><strong data-role="water-value">100</strong><div class="gauge water"><i data-role="water-bar"></i></div><small>濾過量100を基準</small></div>
      </div>
      <details class="particle-tracker"><summary><span data-role="tracker-title">100個のNa⁺を追いかける</span></summary><div class="particle-grid" data-role="particles"></div><p data-role="tracker-note"></p></details>`;
    const qs=role=>element.querySelector(`[data-role="${role}"]`);
    element.querySelectorAll('[data-segment]').forEach(button=>button.addEventListener('click',()=>onSegment?.(button.dataset.segment)));
    function render({stage=0,adh=1,drugClass='none',track='na',running=false}={}){
      const state=M.simulate({adh,drugClass}),current=state.stages[Math.max(0,Math.min(stage,state.stages.length-1))];
      element.dataset.stage=current.id;element.dataset.drug=state.drug.id;element.dataset.running=String(running);
      element.querySelectorAll('[data-segment]').forEach(button=>{
        const segment=state.stages.find(s=>s.id===button.dataset.segment);
        const active=button.dataset.segment===current.id;
        button.classList.toggle('active',active);button.classList.toggle('blocked',segment?.blocked||false);button.classList.toggle('passed',segment?.index<current.index);
        button.setAttribute('aria-pressed',String(active));
      });
      qs('stage-name').textContent=current.name;
      qs('stage-detail').textContent=current.detail;
      qs('transport').textContent=current.transporter;
      qs('transport-input').textContent=current.id==='thick-ascending'?'Na⁺・K⁺・2Cl⁻':current.id==='distal'?'Na⁺・Cl⁻':current.id==='collecting'?'Na⁺ / H₂O':current.id==='proximal'?'Na⁺・H₂O・栄養素':'Na⁺・H₂O';
      qs('block').textContent=current.blocked?'BLOCK':'再吸収';qs('block').classList.toggle('blocked',current.blocked);
      qs('transport-result').textContent=current.blocked?`再吸収されなかったNa⁺が下流へ（＋${state.distalNaDelivery.toFixed(1)}）`:`この部位で Na⁺ ${current.naReabs.toFixed(1)}・水 ${current.waterReabs.toFixed(1)} が戻る`;
      qs('na-value').textContent=current.remainingNa.toFixed(1);qs('water-value').textContent=current.remainingWater.toFixed(1);
      qs('na-bar').style.width=`${pct(current.remainingNa)}%`;qs('water-bar').style.width=`${pct(current.remainingWater)}%`;
      qs('tracker-title').textContent=track==='na'?'100個のNa⁺を追いかける':'水100滴を追いかける';
      qs('particles').dataset.kind=track;qs('particles').innerHTML=dots(track,track==='na'?current.remainingNa:current.remainingWater);
      qs('tracker-note').textContent=`${current.name}まで進んだ時点：${track==='na'?'Na⁺':'水'} ${track==='na'?current.remainingNa.toFixed(1):current.remainingWater.toFixed(1)} が尿細管内に残っています。薄い表示は体へ戻った分です。`;
      return state;
    }
    return {render,element};
  }
  window.NephronSimulation=Object.freeze({mount});
})();
