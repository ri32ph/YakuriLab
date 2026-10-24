(() => {
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  const BASE=Object.freeze({airwayInflammation:82,airwayHyperresponsiveness:76,epithelialIntegrity:38,inflammatoryCellActivity:84,mucosalEdema:58,mucusAmount:48,smoothMuscleTone:54,icsExposure:0,beta2Stimulation:0,treatmentTime:0,trigger:18,continued:true});
  const STAGES=Object.freeze([
    {id:'now',label:'投与直後',days:0,icsFactor:0},
    {id:'hours',label:'数時間',days:.25,icsFactor:.08},
    {id:'days',label:'数日',days:4,icsFactor:.43},
    {id:'weeks',label:'数週間',days:28,icsFactor:.78}
  ]);
  function state(raw={}){
    const x={...BASE,...raw},stage=STAGES[clamp(Math.round(x.treatmentTime),0,STAGES.length-1)];
    const exposure=clamp(x.icsExposure),continuity=x.continued===false?.58:1;
    const antiInflammatory=clamp(exposure*stage.icsFactor*continuity);
    const inflammation=clamp(x.airwayInflammation-antiInflammatory*.64);
    const cells=clamp(x.inflammatoryCellActivity-antiInflammatory*.68);
    const integrity=clamp(x.epithelialIntegrity+antiInflammatory*.54);
    const hyperresponsiveness=clamp(x.airwayHyperresponsiveness-antiInflammatory*.52);
    const edema=clamp(x.mucosalEdema-antiInflammatory*.43);
    const mucus=clamp(x.mucusAmount-antiInflammatory*.28);
    const triggerTone=clamp(x.trigger)*hyperresponsiveness/100*.28;
    const beta2Raw=clamp(x.beta2Stimulation),beta2=clamp(beta2Raw*(x.maintainedBeta2?1:[1,.35,0,0][STAGES.indexOf(stage)]));
    const smoothTone=clamp(x.smoothMuscleTone+triggerTone-beta2*.58);
    return {stage,antiInflammatory,airwayInflammation:inflammation,airwayHyperresponsiveness:hyperresponsiveness,epithelialIntegrity:integrity,inflammatoryCellActivity:cells,mucosalEdema:edema,mucusAmount:mucus,smoothMuscleTone:smoothTone,icsExposure:exposure,beta2Stimulation:beta2,treatmentTime:stage.id,continued:x.continued!==false,airwayInput:{airwayRadius:100,smoothMuscleTone:smoothTone,mucosalEdema:edema,mucusAmount:mucus,pressureGradient:120,beta2Stimulation:0,muscarinicActivity:0,m3Block:0,inflammation:inflammation,ics:0,lungVolume:86,direction:'expiration'}};
  }
  function timeline(raw={},steps=96){
    return Array.from({length:steps+1},(_,i)=>{const p=i/steps,t=p*28,icsFactor=t<.25?(t/.25)*.08:.08+(1-Math.exp(-(t-.25)/8))*.70;const x={...BASE,...raw};const anti=clamp(clamp(x.icsExposure)*icsFactor*(x.continued===false?.58:1));return {day:t,bronchodilation:clamp(x.beta2Stimulation*Math.exp(-t*7)),inflammation:clamp(x.airwayInflammation-anti*.64),hyperresponsiveness:clamp(x.airwayHyperresponsiveness-anti*.52)};});
  }
  window.AIRWAY_INFLAMMATION_MODEL=Object.freeze({BASE,STAGES,state,timeline});
})();
