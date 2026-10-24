(() => {
  const A=window.AIRWAY_MODEL,R=window.RESPIRATORY_MODEL,B=window.BRONCHODILATOR_MODEL,$=id=>document.getElementById(id);
  let drug='saba',time=0,hasUsed=false,playing=false,motion=!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,lastNow=0,frame=0,comparison='';
  const airwayView=window.AirwaySimulation.mount($('airwayView')),lungView=window.RespiratorySimulation.mount($('lungView'));
  const rate=$('respiratoryRate'),tidal=$('tidalVolume'),deadSpace=$('deadSpace');
  function airwayAt(t,use=true){return A.state(B.airwayInput(use?drug:null,use?t:0));}
  function respiratory(airway){return R.state({respiratoryRate:+rate.value,tidalVolume:+tidal.value,deadSpace:+deadSpace.value,airwayResistance:airway.airwayResistance,pressureGradient:airway.pressureGradient});}
  const format=(v,d=1)=>Number(v).toFixed(d);
  function row(label,before,after){return `<div>${label}</div><div>${before}</div><div>${after}</div>`;}
  function renderTimeline(){
    const max=24,steps=120,visible=Math.max(0,time),effect=[],resistance=[],flow=[];
    for(let i=0;i<=steps;i++){const t=max*i/steps;if(t>visible)break;const a=airwayAt(t,true),e=B.effectAt(drug,t),x=48+t/max*632;effect.push(`${x},${196-e*1.7}`);resistance.push(`${x},${196-Math.min(100,a.airwayResistance/airwayAt(0,false).airwayResistance*100)*1.7}`);flow.push(`${x},${196-Math.min(100,a.airFlow*100)*1.7}`);}
    $('effectLine').setAttribute('points',effect.join(' '));$('resistanceLine').setAttribute('points',resistance.join(' '));$('flowLine').setAttribute('points',flow.join(' '));const x=48+Math.min(24,time)/24*632;$('timeCursor').setAttribute('x1',x);$('timeCursor').setAttribute('x2',x);$('timeLabel').textContent=`${time.toFixed(1)}時間`;
  }
  function render(){
    const d=B.DRUGS[drug],beforeA=airwayAt(0,false),currentA=airwayAt(time,hasUsed),beforeR=respiratory(beforeA),currentR=respiratory(currentA),effect=hasUsed?B.effectAt(drug,time):0;
    airwayView.render(currentA,{motion});lungView.render(currentR,{motion});
    $('respiratoryRateOut').value=`${rate.value}回/分`;$('tidalVolumeOut').value=`${tidal.value} mL`;$('deadSpaceOut').value=`${deadSpace.value} mL`;$('rateMetric').textContent=`${rate.value}回/分`;
    $('resistanceMetric').textContent=`${format(currentA.airwayResistance,2)}倍`;$('flowMetric').textContent=`相対${format(currentA.airFlow*100,0)}`;$('trappingMetric').textContent=`${format(currentR.airTrapping,0)}（${currentR.trappingLabel}）`;$('workMetric').textContent=`相対${format(currentR.respiratoryWork,0)}`;
    $('drugStatus').textContent=hasUsed?`${d.label}作用 ${format(effect,0)}%`:'使用前（気道収縮）';$('beta2Receptor').classList.toggle('active',hasUsed&&d.target==='beta2'&&effect>2);$('beta2Receptor').classList.remove('blocked');$('m3Receptor').classList.toggle('blocked',hasUsed&&d.target==='m3'&&effect>2);$('m3Receptor').classList.remove('active');
    $('mechanismPath').textContent=!hasUsed?'開始時：平滑筋収縮＋粘膜浮腫＋分泌物 → 気道抵抗↑ → 呼気流量↓':d.target==='beta2'?`β₂受容体刺激 → cAMP経路 → 平滑筋弛緩 → 気道抵抗 ${currentA.resistanceLabel} → 呼気流量改善方向`:`M3受容体遮断 → AChによる収縮を抑制 → 気道抵抗 ${currentA.resistanceLabel} → 呼気流量改善方向`;
    $('responseNote').textContent=`呼吸数は ${rate.value}回/分のままです。${hasUsed?`気道抵抗は使用前 ${format(beforeA.airwayResistance,2)}倍から ${format(currentA.airwayResistance,2)}倍、呼吸仕事量は相対${format(beforeR.respiratoryWork,0)}から${format(currentR.respiratoryWork,0)}へ変化する方向です。残る浮腫・分泌物のため、全てのエアトラッピングが消えるとは限りません。`:'気道が狭く、特に呼吸数が多い条件では呼気時間が不足しやすい状態です。'}`;
    const after=hasUsed?{a:currentA,r:currentR}:null;$('beforeAfter').innerHTML='<div class="head">項目</div><div class="head">使用前</div><div class="head">使用後</div>'+row('気道径',`${format(beforeA.diameterPercent,0)}%`,after?`${format(after.a.diameterPercent,0)}%`:'—')+row('気道抵抗',`${format(beforeA.airwayResistance,2)}倍`,after?`${format(after.a.airwayResistance,2)}倍`:'—')+row('呼気流量',`相対${format(beforeA.airFlow*100,0)}`,after?`相対${format(after.a.airFlow*100,0)}`:'—')+row('呼気終末肺気量',`相対${format(beforeR.dynamicHyperinflation,0)}`,after?`相対${format(after.r.dynamicHyperinflation,0)}`:'—')+row('呼吸仕事量',`相対${format(beforeR.respiratoryWork,0)}`,after?`相対${format(after.r.respiratoryWork,0)}`:'—');
    document.querySelectorAll('[data-drug]').forEach(b=>b.classList.toggle('active',b.dataset.drug===drug));document.querySelectorAll('[data-comparison]').forEach(b=>b.classList.toggle('active',b.dataset.comparison===comparison));$('motionToggle').setAttribute('aria-pressed',String(!motion));$('motionToggle').textContent=motion?'動きを止める':'動きを開始';renderTimeline();
  }
  function tick(now){if(!playing)return;if(!lastNow)lastNow=now;time=Math.min(24,time+(now-lastNow)/1000*1.2);lastNow=now;render();if(time<24)frame=requestAnimationFrame(tick);else playing=false;}
  function play(){hasUsed=true;playing=true;lastNow=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);}
  function resetTime(){playing=false;cancelAnimationFrame(frame);time=0;hasUsed=false;lastNow=0;render();lungView.restart();}
  $('drugOptions').addEventListener('click',e=>{const b=e.target.closest('[data-drug]');if(!b)return;drug=b.dataset.drug;comparison='';resetTime();});$('useDrug').addEventListener('click',()=>{time=0;comparison='';play();render();});$('timelinePlay').addEventListener('click',play);$('timelinePause').addEventListener('click',()=>{playing=false;cancelAnimationFrame(frame);});$('timelineReset').addEventListener('click',resetTime);
  [rate,tidal,deadSpace].forEach(input=>input.addEventListener('input',()=>{comparison='';render();}));$('motionToggle').addEventListener('click',()=>{motion=!motion;render();});$('volumeToggle').addEventListener('click',()=>{const hidden=$('lungView').classList.toggle('hide-volume-chart');$('volumeToggle').setAttribute('aria-pressed',String(hidden));$('volumeToggle').textContent=hidden?'肺気量波形を表示':'肺気量波形を隠す';});
  $('comparisonPresets').addEventListener('click',e=>{const b=e.target.closest('[data-comparison]');if(!b)return;comparison=b.dataset.comparison;playing=false;cancelAnimationFrame(frame);if(comparison==='a'){rate.value=12;time=0;hasUsed=false;}if(comparison==='b'){rate.value=30;time=0;hasUsed=false;}if(comparison==='c'){rate.value=30;time=Math.max(.5,B.DRUGS[drug].onset*4);hasUsed=true;}render();lungView.restart();});
  $('reset').addEventListener('click',()=>{drug='saba';rate.value=24;tidal.value=350;deadSpace.value=150;comparison='';motion=!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;resetTime();});
  render();lungView.restart();
})();
