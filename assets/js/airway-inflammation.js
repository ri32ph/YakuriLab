(() => {
  const A=window.AIRWAY_MODEL,R=window.RESPIRATORY_MODEL,I=window.AIRWAY_INFLAMMATION_MODEL,$=id=>document.getElementById(id);
  let beta2=0,ics=0,stage=0,continued=true,motion=!matchMedia?.('(prefers-reduced-motion: reduce)').matches,preset='inflammation',historyEnd=0,playing=false,frame=0,last=0;
  const airwayView=window.AirwaySimulation.mount($('airwayView')),lungView=window.RespiratorySimulation.mount($('lungView'));
  const rate=$('respiratoryRate'),tidal=$('tidalVolume'),dead=$('deadSpace');
  const f=(v,d=0)=>Number(v).toFixed(d),bar=(id,v)=>$(id).style.width=`${clamp(v)}%`,clamp=v=>Math.min(100,Math.max(0,v));
  function state(){
    const biology=I.state({icsExposure:ics,beta2Stimulation:beta2,treatmentTime:stage,continued,maintainedBeta2:preset==='combo'});
    const airway=A.state(biology.airwayInput);
    const respiratory=R.state({respiratoryRate:+rate.value,tidalVolume:+tidal.value,deadSpace:+dead.value,airwayResistance:airway.airwayResistance,pressureGradient:airway.pressureGradient});
    return {biology,airway,respiratory};
  }
  function graph(){
    const lines={broncho:[],inflammation:[],hyper:[]},points=I.timeline({icsExposure:ics,beta2Stimulation:beta2,continued});
    for(const p of points){if(p.day>historyEnd)break;const x=45+p.day/28*625;lines.broncho.push(`${x},${190-p.bronchodilation*1.6}`);lines.inflammation.push(`${x},${190-p.inflammation*1.6}`);lines.hyper.push(`${x},${190-p.hyperresponsiveness*1.6}`);}
    $('bronchoLine').setAttribute('points',lines.broncho.join(' '));$('inflammationLine').setAttribute('points',lines.inflammation.join(' '));$('hyperLine').setAttribute('points',lines.hyper.join(' '));const x=45+historyEnd/28*625;$('timelineCursor').setAttribute('x1',x);$('timelineCursor').setAttribute('x2',x);
  }
  function render(){
    const {biology:b,airway:a,respiratory:r}=state();airwayView.render(a,{motion});lungView.render(r,{motion});
    $('respiratoryRateOut').value=`${rate.value}回/分`;$('tidalVolumeOut').value=`${tidal.value} mL`;$('deadSpaceOut').value=`${dead.value} mL`;
    $('stageLabel').textContent=b.stage.label;$('therapyStatus').textContent=ics?`ICS：${b.stage.label}`:beta2?'β₂刺激後':'気道炎症あり';
    $('inflammationMetric').textContent=`相対${f(b.airwayInflammation)}`;$('resistanceMetric').textContent=`${f(a.airwayResistance,2)}倍`;$('flowMetric').textContent=`相対${f(a.airFlow*100)}`;$('trappingMetric').textContent=`相対${f(r.airTrapping)}`;$('workMetric').textContent=`相対${f(r.respiratoryWork)}`;
    bar('inflammationBar',b.airwayInflammation);bar('cellBar',b.inflammatoryCellActivity);bar('edemaBar',b.mucosalEdema);bar('mucusBar',b.mucusAmount);bar('hyperBar',b.airwayHyperresponsiveness);$('inflammationMap').style.setProperty('--epithelium',String(.25+b.epithelialIntegrity/130));$('inflammationMap').style.opacity=String(.55+b.inflammatoryCellActivity/220);
    $('mechanism').textContent=ics?`ICS → 細胞内GR → 炎症関連遺伝子発現を調節 → 炎症・浮腫・過敏性が${b.stage.label}の時間軸で改善する方向` : beta2?`β₂刺激 → 平滑筋弛緩 → 気道径拡大。炎症は相対${f(b.airwayInflammation)}のまま残ります。`:`気道炎症 → 浮腫・粘液・過敏性 → 気流制限が起こりやすい状態`;
    $('responseNote').textContent=`呼吸数は ${rate.value}回/分の独立した設定です。${r.airTrapping>12?'この呼吸条件では呼気時間が不足し、空気が残りやすい方向です。':'呼気時間は比較的保たれています。'} ICSは呼吸数や1回換気量を直接設定しません。`;
    $('useIcs').disabled=!beta2;$('sequence1').classList.toggle('active',beta2>0);$('sequence2').classList.toggle('active',ics>0);document.querySelectorAll('[data-stage]').forEach(x=>x.classList.toggle('active',+x.dataset.stage===stage));document.querySelectorAll('[data-preset]').forEach(x=>x.classList.toggle('active',x.dataset.preset===preset));$('continueToggle').textContent=continued?'継続中｜中断して比べる':'中断中｜継続に戻す';$('continueToggle').setAttribute('aria-pressed',String(!continued));$('motionToggle').textContent=motion?'動きを止める':'動きを開始';$('motionToggle').setAttribute('aria-pressed',String(!motion));graph();
  }
  function setPreset(id){preset=id;beta2=0;ics=0;stage=0;continued=true;rate.value=24;tidal.value=350;
    if(id==='trigger'){rate.value=30;}
    if(id==='beta2'){beta2=88;}
    if(id==='residual'){beta2=88;}
    if(id==='ics'){beta2=88;ics=100;stage=3;historyEnd=28;}
    if(id==='combo'){beta2=72;ics=100;stage=3;historyEnd=28;}
    if(id==='quiet'){ics=100;stage=2;historyEnd=4;}
    if(id==='interrupt'){ics=100;stage=3;continued=false;historyEnd=28;}
    render();lungView.restart();
  }
  function tick(now){if(!playing)return;if(!last)last=now;historyEnd=Math.min(28,historyEnd+(now-last)/1000*2.8);last=now;if(historyEnd<.25)stage=1;else if(historyEnd<4)stage=2;else stage=3;render();if(historyEnd<28)frame=requestAnimationFrame(tick);else playing=false;}
  $('useBeta2').onclick=()=>{beta2=88;preset='beta2';historyEnd=Math.max(historyEnd,.08);render();};$('useIcs').onclick=()=>{ics=100;preset='ics';stage=0;historyEnd=0;render();};
  $('stageButtons').onclick=e=>{const b=e.target.closest('[data-stage]');if(!b)return;stage=+b.dataset.stage;historyEnd=I.STAGES[stage].days;render();};$('presets').onclick=e=>{const b=e.target.closest('[data-preset]');if(b)setPreset(b.dataset.preset);};
  [rate,tidal,dead].forEach(x=>x.oninput=()=>{preset='custom';render();});$('continueToggle').onclick=()=>{continued=!continued;render();};$('motionToggle').onclick=()=>{motion=!motion;render();};$('playTimeline').onclick=()=>{ics=100;playing=true;last=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);};$('pauseTimeline').onclick=()=>{playing=false;cancelAnimationFrame(frame);};$('reset').onclick=()=>setPreset('inflammation');
  render();lungView.restart();
})();
