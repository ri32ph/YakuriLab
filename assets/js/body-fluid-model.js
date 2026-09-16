(() => {
  const clamp=(v,min=0,max=200)=>Math.min(max,Math.max(min,Number(v)||0));
  const PRESETS=Object.freeze({
    normal:{label:'正常',sodiumRetention:50,waterRetention:50,hydrostaticPressure:50,plasmaOncoticPressure:50,vascularPermeability:50,lymphaticReturn:50,diuresis:0,context:'normal'},
    retention:{label:'Na⁺・水貯留',sodiumRetention:82,waterRetention:80,hydrostaticPressure:65,plasmaOncoticPressure:50,vascularPermeability:50,lymphaticReturn:50,diuresis:0,context:'retention'},
    venous:{label:'静脈圧上昇',sodiumRetention:55,waterRetention:58,hydrostaticPressure:86,plasmaOncoticPressure:50,vascularPermeability:50,lymphaticReturn:50,diuresis:0,context:'venous'},
    albumin:{label:'低アルブミン',sodiumRetention:55,waterRetention:60,hydrostaticPressure:52,plasmaOncoticPressure:18,vascularPermeability:50,lymphaticReturn:50,diuresis:0,context:'albumin'},
    inflammation:{label:'炎症',sodiumRetention:50,waterRetention:50,hydrostaticPressure:58,plasmaOncoticPressure:50,vascularPermeability:90,lymphaticReturn:50,diuresis:0,context:'inflammation'},
    lymph:{label:'リンパ還流低下',sodiumRetention:50,waterRetention:52,hydrostaticPressure:52,plasmaOncoticPressure:50,vascularPermeability:50,lymphaticReturn:12,diuresis:0,context:'lymph'},
    heartFailure:{label:'心不全',sodiumRetention:78,waterRetention:78,hydrostaticPressure:88,plasmaOncoticPressure:48,vascularPermeability:50,lymphaticReturn:45,diuresis:0,context:'heart-failure'},
    cirrhosis:{label:'肝硬変',sodiumRetention:76,waterRetention:82,hydrostaticPressure:68,plasmaOncoticPressure:28,vascularPermeability:50,lymphaticReturn:42,diuresis:0,context:'cirrhosis'},
    diuretic:{label:'利尿薬',sodiumRetention:38,waterRetention:38,hydrostaticPressure:38,plasmaOncoticPressure:50,vascularPermeability:50,lymphaticReturn:50,diuresis:52,context:'diuretic'}
  });
  function state(raw={}){
    const x={...PRESETS.normal,...raw};
    ['sodiumRetention','waterRetention','hydrostaticPressure','plasmaOncoticPressure','vascularPermeability','lymphaticReturn','diuresis'].forEach(k=>x[k]=clamp(x[k],0,100));
    const totalBodyNa=clamp(100+(x.sodiumRetention-50)*.55-x.diuresis*.28,60,145);
    const totalBodyWater=clamp(100+(x.waterRetention-50)*.5-x.diuresis*.3,60,145);
    const serumNaIndex=clamp(totalBodyNa/totalBodyWater*100,75,125);
    const extracellularVolume=clamp(100+(totalBodyNa-100)*.65+(totalBodyWater-100)*.25,60,150);
    const intracellularVolume=clamp(100+(totalBodyWater-100)*.48-(totalBodyNa-100)*.12,65,140);
    const filtrationDrive=(x.hydrostaticPressure-50)*.72+(50-x.plasmaOncoticPressure)*.72+(x.vascularPermeability-50)*.7+(50-x.lymphaticReturn)*.65+(extracellularVolume-100)*.28;
    const interstitialVolume=clamp(100+(extracellularVolume-100)*.58+filtrationDrive*.62,65,180);
    const intravascularVolume=clamp(100+(extracellularVolume-100)*.42-filtrationDrive*.13,60,150);
    const contextPenalty=x.context==='heart-failure'?28:x.context==='cirrhosis'?25:x.context==='albumin'?10:0;
    const effectiveArterialVolume=clamp(intravascularVolume-contextPenalty-x.diuresis*.12,45,145);
    const edemaIndex=clamp((interstitialVolume-80)/.8,0,100);
    const edemaLabel=edemaIndex>72?'強い':edemaIndex>48?'増加':edemaIndex>30?'やや増加':'少ない';
    const serumNaLabel=serumNaIndex<94?'低下方向':serumNaIndex>106?'上昇方向':'標準付近';
    const mainFactor=[['毛細血管内圧',x.hydrostaticPressure-50],['血漿膠質浸透圧',50-x.plasmaOncoticPressure],['血管透過性',x.vascularPermeability-50],['リンパ還流',50-x.lymphaticReturn]].sort((a,b)=>b[1]-a[1])[0];
    return {...x,totalBodyNa,totalBodyWater,serumNaIndex,serumNaLabel,extracellularVolume,intracellularVolume,intravascularVolume,interstitialVolume,effectiveArterialVolume,filtrationDrive,edemaIndex,edemaLabel,mainFactor:mainFactor[1]>8?mainFactor[0]:'大きな偏りなし',pulmonaryCongestion:x.context==='heart-failure'&&edemaIndex>45,localized:x.context==='inflammation'||x.context==='lymph'};
  }
  window.BODY_FLUID_MODEL=Object.freeze({PRESETS,state});
})();
