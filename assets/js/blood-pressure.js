(() => {
  'use strict';
  const $=id=>document.getElementById(id),model=window.BLOOD_PRESSURE_MODEL;
  const inputs={heartRate:$('heartRate'),strokeVolume:$('strokeVolume'),vesselControl:$('vesselControl'),bloodVolume:$('bloodVolume'),contractility:$('contractility')};
  const preference=window.matchMedia?.('(prefers-reduced-motion: reduce)');let motionPaused=Boolean(preference?.matches);
  const word=(value,base,margin,low,mid,high)=>value<base-margin?low:value>base+margin?high:mid;
  function current(){return model.state({heartRate:inputs.heartRate.value,strokeVolume:inputs.strokeVolume.value,vesselControl:inputs.vesselControl.value,bloodVolume:inputs.bloodVolume.value,contractility:inputs.contractility.value,advanced:$('advanced').open});}
  function node(label,value,key,state){return `<div class="cause-node ${state.directions[key]!=='same'?'changed':''}"><div><strong>${label}</strong><small>${value}</small></div></div>`}
  function arrow(){return '<div class="cause-arrow" aria-hidden="true">→</div>'}
  function renderCause(s){
    const d=x=>x==='up'?'↑':x==='down'?'↓':'→';
    const cardiac=node('心拍数',d(s.directions.heartRate),'heartRate',s)+arrow()+node('心拍出量',d(s.directions.cardiacOutput),'cardiacOutput',s)+arrow()+node('血圧',d(s.directions.pressure),'pressure',s);
    const vessel=node(s.directions.vessel==='down'?'血管収縮':s.directions.vessel==='up'?'血管拡張':'血管径','', 'vessel',s)+arrow()+node('末梢血管抵抗',d(s.directions.resistance),'resistance',s)+arrow()+node('血圧',d(s.directions.pressure),'pressure',s);
    const stroke=node('一回拍出量',d(s.directions.strokeVolume),'strokeVolume',s)+arrow()+node('心拍出量',d(s.directions.cardiacOutput),'cardiacOutput',s)+arrow()+node('血圧',d(s.directions.pressure),'pressure',s);
    let advanced='';
    if($('advanced').open){
      advanced=node('循環血液量',d(s.directions.bloodVolume),'bloodVolume',s)+arrow()+node('前負荷',d(s.directions.preload),'preload',s)+arrow()+node('一回拍出量',d(s.directions.strokeVolume),'strokeVolume',s);
      advanced+=node('心収縮力',d(s.directions.contractility),'contractility',s)+arrow()+node('一回拍出量',d(s.directions.strokeVolume),'strokeVolume',s)+arrow()+node('心拍出量',d(s.directions.cardiacOutput),'cardiacOutput',s);
    }
    $('causeMap').innerHTML=cardiac+stroke+vessel+advanced;
    $('causeMap').setAttribute('aria-label',`心拍数${d(s.directions.heartRate)}、一回拍出量${d(s.directions.strokeVolume)}、心拍出量${d(s.directions.cardiacOutput)}、末梢血管抵抗${d(s.directions.resistance)}、血圧${d(s.directions.pressure)}`);
  }
  function renderParticles(s){
    const count=Math.max(3,Math.min(8,Math.round(s.strokeVolume/14))),radius=(3.8+s.strokeVolume/70).toFixed(1),duration=(60/s.heartRate*3.4).toFixed(2);
    $('particles').innerHTML=Array.from({length:8},(_,i)=>`<circle class="${i%3===2?'venous-particle':'blood-particle'}" r="${radius}" opacity="${i<count?1:0}"><animateMotion dur="${duration}s" begin="-${(i*duration/Math.max(count,1)).toFixed(2)}s" repeatCount="indefinite"><mpath href="#flowPath"/></animateMotion></circle>`).join('');
    if(motionPaused)$('circulationSvg').pauseAnimations?.();else $('circulationSvg').unpauseAnimations?.();
  }
  function renderMotion(){
    const box=$('circulation'),button=$('motionToggle');box.dataset.motion=motionPaused?'paused':'running';$('heart').dataset.motion=motionPaused?'paused':'running';button.setAttribute('aria-pressed',String(motionPaused));button.textContent=motionPaused?'模式図の動きを開始':'模式図の動きを停止';$('motionStatus').textContent=motionPaused?(preference?.matches?'端末の「動きを減らす」設定に合わせて停止中です。ボタンで開始できます。':'拍動と血流は停止中です。'):'拍動と血流の模式表示：動作中';if(motionPaused)$('circulationSvg').pauseAnimations?.();else $('circulationSvg').unpauseAnimations?.();
  }
  function render(){
    const s=current();$('heartRateOut').textContent=`${s.heartRate} /min`;$('strokeVolumeOut').textContent=`${Math.round(s.strokeVolume)} mL/beat`;$('vesselOut').textContent=word(s.vesselControl,50,4,'広い','標準','狭い');$('bloodVolumeOut').textContent=word(s.bloodVolume,50,4,'少ない','標準','多い');$('contractilityOut').textContent=word(s.contractility,50,4,'弱い','標準','強い');
    $('hrMetric').textContent=`${s.heartRate} /min`;$('svMetric').textContent=`${Math.round(s.strokeVolume)} mL/beat`;$('coMetric').textContent=`${s.cardiacOutput.toFixed(1)} L/min`;$('tprMetric').textContent=s.resistanceLabel;$('tprRelative').textContent=`相対値 ${s.resistance.toFixed(2)}`;$('pressureMetric').textContent=s.pressureDirection;$('status').textContent=s.pressureDirection.replace(/^[↑↓→]+\s*/, '');
    $('circulation').style.setProperty('--beat-duration',(60/s.heartRate).toFixed(3)+'s');$('circulation').style.setProperty('--heart-scale',(1.12+s.strokeVolume/700).toFixed(3));const lumenHeight=Math.max(12,s.vesselDiameter*.32);$('vesselLumen').setAttribute('height',lumenHeight.toFixed(1));$('vesselLumen').setAttribute('y',(-lumenHeight/2).toFixed(1));renderParticles(s);renderCause(s);renderMotion();
  }
  Object.values(inputs).forEach(input=>input.addEventListener('input',render));$('advanced').addEventListener('toggle',render);$('motionToggle').addEventListener('click',()=>{motionPaused=!motionPaused;renderMotion()});preference?.addEventListener('change',event=>{motionPaused=event.matches;renderMotion()});
  const presets={heart:{heartRate:100,strokeVolume:70,vesselControl:50},vessel:{heartRate:70,strokeVolume:70,vesselControl:72},balance:{heartRate:50,strokeVolume:70,vesselControl:65}};
  document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{Object.entries(presets[button.dataset.preset]).forEach(([key,value])=>inputs[key].value=value);inputs.bloodVolume.value=50;inputs.contractility.value=50;render()}));
  $('reset').addEventListener('click',()=>{inputs.heartRate.value=70;inputs.strokeVolume.value=70;inputs.vesselControl.value=50;inputs.bloodVolume.value=50;inputs.contractility.value=50;$('advanced').open=false;motionPaused=Boolean(preference?.matches);render()});
  const links=$('receptorLinks');[{key:'beta1',text:'β1受容体',detail:'心拍数↑・収縮力↑ → CO↑ → 血圧↑方向'},{key:'alpha1',text:'α1受容体',detail:'血管収縮 → TPR↑ → 血圧↑方向'}].forEach(item=>{const lab=window.LAB_CATALOG.find(entry=>entry.key===item.key);if(!lab)return;const a=document.createElement('a');a.href=lab.href;const strong=document.createElement('strong');strong.textContent=`LAB ${lab.label}｜${item.text} →`;const span=document.createElement('span');span.textContent=item.detail;a.append(strong,span);links.append(a)});
  render();
})();
