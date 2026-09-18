(() => {
  const M=window.AIRWAY_MODEL,$=id=>document.getElementById(id);
  const inputKeys=['airwayRadius','smoothMuscleTone','mucosalEdema','mucusAmount','pressureGradient','muscarinicActivity','inflammation','lungVolume'];
  const inputs=Object.fromEntries(inputKeys.map(k=>[k,$(k)]));
  let beta2Stimulation=0,m3Block=0,ics=0,direction='expiration',preset='normal',motion=!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,interacted=false;
  const view=window.AirwaySimulation.mount($('airwayView'));
  const word=v=>v<20?'少ない':v<45?'やや少ない':v<70?'中くらい':'多い';
  function raw(){return {...Object.fromEntries(inputKeys.map(k=>[k,+inputs[k].value])),beta2Stimulation,m3Block,ics,direction};}
  function render(){
    const s=M.state(raw());view.render(s,{motion});
    inputKeys.forEach(k=>{$(k+'Out').value=k==='airwayRadius'?`${inputs[k].value}%`:k==='pressureGradient'?`${inputs[k].value}%`:word(+inputs[k].value)});
    $('beta2Toggle').setAttribute('aria-pressed',String(beta2Stimulation>0));$('beta2Toggle').textContent=`β₂刺激 ${beta2Stimulation?'ON':'OFF'}`;
    $('m3Toggle').setAttribute('aria-pressed',String(m3Block>0));$('m3Toggle').textContent=`M3作用を抑える ${m3Block?'ON':'OFF'}`;
    $('icsToggle').setAttribute('aria-pressed',String(ics>0));$('icsToggle').textContent=`ICS ${ics?'ON':'OFF'}`;
    $('motionToggle').setAttribute('aria-pressed',String(!motion));$('motionToggle').textContent=motion?'空気の動きを止める':'空気の動きを開始';
    document.querySelectorAll('[data-direction]').forEach(b=>b.classList.toggle('active',b.dataset.direction===direction));
    document.querySelectorAll('[data-airway-preset]').forEach(b=>b.classList.toggle('active',b.dataset.airwayPreset===preset));
    $('resistanceValue').textContent=`${s.airwayResistance.toFixed(s.airwayResistance<10?2:1)}倍`;$('resistanceLabel').textContent=s.resistanceLabel;$('resistanceBar').style.width=`${Math.min(100,Math.log2(s.airwayResistance+1)/Math.log2(17)*100)}%`;
    $('flowValue').textContent=`相対 ${(s.airFlow*100).toFixed(0)}`;$('workValue').textContent=`相対 ${(s.breathingWork*100).toFixed(0)}`;
    $('causalPath').textContent=`気道の太さ ${s.diameterPercent.toFixed(0)}% ↓　抵抗 ${s.airwayResistance.toFixed(2)}倍 →　同じ圧較差で空気流量 ${s.flowLabel}`;
    $('formulaReveal').hidden=!interacted;
    $('asthmaQuestion').textContent=preset==='asthma'&&beta2Stimulation?`β₂刺激で平滑筋は弛緩方向になりました。一方、粘膜浮腫 ${s.effectiveEdema.toFixed(0)}・分泌物 ${s.mucusAmount.toFixed(0)}は残っています。気道炎症も治ったでしょうか？`:'気管支拡張と気道炎症の改善は、同じ作用ではありません。';
    $('effortNote').textContent=s.pressureGradient>110&&s.airwayResistance>3?'圧較差を増やして流量を保とうとしていますが、呼吸仕事量も増加しています。':'Flow = ΔP / R。狭窄時に呼吸努力を増やすと、仕事量が増える方向です。';
  }
  $('airwayPresets').innerHTML=Object.entries(M.PRESETS).map(([id,p])=>`<button type="button" data-airway-preset="${id}">${p.label}</button>`).join('');
  function apply(id){const p=M.PRESETS[id];preset=id;inputKeys.forEach(k=>inputs[k].value=p[k]);beta2Stimulation=p.beta2Stimulation;m3Block=p.m3Block;ics=p.ics;direction=p.direction;interacted=id!=='normal';render();}
  $('airwayPresets').addEventListener('click',e=>{const b=e.target.closest('[data-airway-preset]');if(b)apply(b.dataset.airwayPreset);});
  Object.values(inputs).forEach(input=>input.addEventListener('input',()=>{preset='custom';interacted=true;render();}));
  $('beta2Toggle').addEventListener('click',()=>{beta2Stimulation=beta2Stimulation?0:100;interacted=true;render();});
  $('m3Toggle').addEventListener('click',()=>{m3Block=m3Block?0:100;interacted=true;render();});
  $('icsToggle').addEventListener('click',()=>{ics=ics?0:100;interacted=true;render();});
  $('effortButton').addEventListener('click',()=>{inputs.pressureGradient.value=Math.min(180,+inputs.pressureGradient.value+35);interacted=true;render();});
  $('motionToggle').addEventListener('click',()=>{motion=!motion;render();});
  $('directionSwitch').addEventListener('click',e=>{const b=e.target.closest('[data-direction]');if(!b)return;direction=b.dataset.direction;render();});
  $('airwayReset').addEventListener('click',()=>apply('normal'));
  apply('normal');
})();
