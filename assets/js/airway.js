(() => {
  const A=window.AIRWAY_MODEL,R=window.RESPIRATORY_MODEL,$=id=>document.getElementById(id);
  const airwayKeys=['airwayRadius','smoothMuscleTone','mucosalEdema','mucusAmount','pressureGradient','muscarinicActivity','inflammation','lungVolume'];
  const respiratoryKeys=['respiratoryRate','tidalVolume','deadSpace'];
  const inputs=Object.fromEntries([...airwayKeys,...respiratoryKeys].map(k=>[k,$(k)]));
  let beta2Stimulation=0,m3Block=0,direction='expiration',preset='normal',breathingPreset='',motion=!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,interacted=false;
  const airwayView=window.AirwaySimulation.mount($('airwayView'));
  const lungView=window.RespiratorySimulation.mount($('lungView'));
  const word=v=>v<20?'少ない':v<45?'やや少ない':v<70?'中くらい':'多い';
  function airwayRaw(){return {...Object.fromEntries(airwayKeys.map(k=>[k,+inputs[k].value])),beta2Stimulation,m3Block,ics:0,direction};}
  function respiratoryRaw(airway){return {respiratoryRate:+inputs.respiratoryRate.value,tidalVolume:+inputs.tidalVolume.value,deadSpace:+inputs.deadSpace.value,airwayResistance:airway.airwayResistance,pressureGradient:airway.pressureGradient};}
  function updateOutputs(){
    airwayKeys.forEach(k=>{$(k+'Out').value=k==='airwayRadius'?`${inputs[k].value}%`:k==='pressureGradient'?`${inputs[k].value}%`:word(+inputs[k].value)});
    $('respiratoryRateOut').value=`${inputs.respiratoryRate.value}回/分`;$('tidalVolumeOut').value=`${inputs.tidalVolume.value} mL`;$('deadSpaceOut').value=`${inputs.deadSpace.value} mL`;
  }
  function render(){
    const a=A.state(airwayRaw()),r=R.state(respiratoryRaw(a));airwayView.render(a,{motion});lungView.render(r,{motion});updateOutputs();
    $('beta2Toggle').setAttribute('aria-pressed',String(beta2Stimulation>0));$('beta2Toggle').textContent=`β₂刺激 ${beta2Stimulation?'ON':'OFF'}`;$('m3Toggle').setAttribute('aria-pressed',String(m3Block>0));$('m3Toggle').textContent=`M3作用を抑える ${m3Block?'ON':'OFF'}`;
    $('motionToggle').setAttribute('aria-pressed',String(!motion));$('motionToggle').textContent=motion?'空気と肺の動きを止める':'空気と肺の動きを開始';
    document.querySelectorAll('[data-direction]').forEach(b=>b.classList.toggle('active',b.dataset.direction===direction));document.querySelectorAll('[data-airway-preset]').forEach(b=>b.classList.toggle('active',b.dataset.airwayPreset===preset));document.querySelectorAll('[data-breathing-preset]').forEach(b=>b.classList.toggle('active',b.dataset.breathingPreset===breathingPreset));
    $('resistanceValue').textContent=`${a.airwayResistance.toFixed(a.airwayResistance<10?2:1)}倍`;$('resistanceLabel').textContent=a.resistanceLabel;$('resistanceBar').style.width=`${Math.min(100,Math.log2(a.airwayResistance+1)/Math.log2(17)*100)}%`;
    $('flowValue').textContent=`相対 ${(a.airFlow*100).toFixed(0)}`;$('workValue').textContent=`相対 ${r.respiratoryWork.toFixed(0)}（${r.workLabel}）`;$('minuteVentilation').textContent=`${r.minuteVentilation.toFixed(1)} L/分`;$('alveolarVentilation').textContent=`${r.alveolarVentilation.toFixed(1)} L/分`;
    $('ventilationFormula').textContent=`${r.tidalVolume} mL × ${r.respiratoryRate}回/分 = ${r.minuteVentilation.toFixed(1)} L/分｜死腔 ${r.deadSpace} mL → 肺胞換気量 ${r.alveolarVentilation.toFixed(1)} L/分`;
    $('trappingPath').textContent=`呼吸周期 ${r.cycleTime.toFixed(1)}秒（吸気 ${r.inspiratoryTime.toFixed(1)}秒＋呼気 ${r.expiratoryTime.toFixed(1)}秒）→ エアトラッピング ${r.trappingLabel}`;$('causalPath').textContent=`気道の太さ ${a.diameterPercent.toFixed(0)}% ↓　抵抗 ${a.airwayResistance.toFixed(2)}倍 →　同じ圧較差で空気流量 ${a.flowLabel}`;
    $('pharmPath').textContent=a.beta2Stimulation?`β₂受容体刺激 → 平滑筋弛緩方向 → 気道抵抗 ${a.resistanceLabel} → 呼気流量が改善する方向（残る狭窄要素は自動的に消えません）`:a.m3Block?`M3作用を抑える → ムスカリン性収縮を抑える方向 → 気道拡張方向`:'薬理操作を選ぶと、作用点から気道・呼吸の変化までを表示します。';
    $('formulaReveal').hidden=!interacted;$('asthmaQuestion').textContent=preset==='asthma'&&beta2Stimulation?`β₂刺激で平滑筋は弛緩方向になりました。一方、粘膜浮腫 ${a.effectiveEdema.toFixed(0)}・分泌物 ${a.mucusAmount.toFixed(0)}は残っています。エアトラッピングも必ず全て解消するとは限りません。`:'気管支拡張と気道炎症の改善は、同じ作用ではありません。';
    $('breathingComparison').textContent=breathingPreset==='d'?`高い抵抗と短い呼気時間が重なり、エアトラッピングが${r.trappingLabel}状態です。呼吸数は気道狭窄の必然的な結果ではなく、ここでは独立した条件です。`:`抵抗 ${a.resistanceLabel}・呼吸数 ${r.respiratoryRate}回/分：呼気時間は ${r.expiratoryTime.toFixed(1)}秒です。`;
    $('effortNote').textContent=a.pressureGradient>110&&a.airwayResistance>3?'圧較差を増やして流量を保とうとしていますが、呼吸仕事量も増加しています。':'気道が狭いと、空気を動かすためにより大きな圧較差が必要になります。呼吸仕事量は呼吸数だけでは決まりません。';
  }
  $('airwayPresets').innerHTML=Object.entries(A.PRESETS).map(([id,p])=>`<button type="button" data-airway-preset="${id}">${p.label}</button>`).join('');
  function applyAirway(id){const p=A.PRESETS[id];preset=id;airwayKeys.forEach(k=>inputs[k].value=p[k]);beta2Stimulation=p.beta2Stimulation;m3Block=p.m3Block;direction=p.direction;interacted=id!=='normal';render();}
  function applyBreathing(id){const x={a:{radius:100,rate:10,volume:500},b:{radius:100,rate:28,volume:300},c:{radius:60,rate:10,volume:500},d:{radius:60,rate:28,volume:300}}[id];breathingPreset=id;preset='custom';inputs.airwayRadius.value=x.radius;inputs.smoothMuscleTone.value=0;inputs.mucosalEdema.value=0;inputs.mucusAmount.value=0;inputs.respiratoryRate.value=x.rate;inputs.tidalVolume.value=x.volume;beta2Stimulation=0;m3Block=0;interacted=true;render();}
  $('airwayPresets').addEventListener('click',e=>{const b=e.target.closest('[data-airway-preset]');if(b)applyAirway(b.dataset.airwayPreset);});$('breathingPresets').addEventListener('click',e=>{const b=e.target.closest('[data-breathing-preset]');if(b)applyBreathing(b.dataset.breathingPreset);});
  Object.values(inputs).forEach(input=>input.addEventListener('input',()=>{preset='custom';breathingPreset='';interacted=true;render();}));$('beta2Toggle').addEventListener('click',()=>{beta2Stimulation=beta2Stimulation?0:100;interacted=true;render();});$('m3Toggle').addEventListener('click',()=>{m3Block=m3Block?0:100;interacted=true;render();});$('effortButton').addEventListener('click',()=>{inputs.pressureGradient.value=Math.min(180,+inputs.pressureGradient.value+35);interacted=true;render();});$('motionToggle').addEventListener('click',()=>{motion=!motion;render();});$('directionSwitch').addEventListener('click',e=>{const b=e.target.closest('[data-direction]');if(!b)return;direction=b.dataset.direction;render();});
  $('airwayReset').addEventListener('click',()=>{inputs.respiratoryRate.value=12;inputs.tidalVolume.value=500;inputs.deadSpace.value=150;breathingPreset='';applyAirway('normal');lungView.restart();});applyAirway('normal');lungView.restart();
})();
