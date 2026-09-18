(() => {
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  const PRESETS=Object.freeze({
    normal:{label:'正常',airwayRadius:100,smoothMuscleTone:0,mucosalEdema:0,mucusAmount:0,pressureGradient:100,beta2Stimulation:0,muscarinicActivity:0,m3Block:0,inflammation:0,ics:0,lungVolume:100,direction:'expiration'},
    half:{label:'実験1｜半径を半分',airwayRadius:50,smoothMuscleTone:0,mucosalEdema:0,mucusAmount:0,pressureGradient:100,beta2Stimulation:0,muscarinicActivity:0,m3Block:0,inflammation:0,ics:0,lungVolume:100,direction:'expiration'},
    muscle:{label:'実験2｜平滑筋収縮',airwayRadius:100,smoothMuscleTone:72,mucosalEdema:0,mucusAmount:0,pressureGradient:100,beta2Stimulation:0,muscarinicActivity:20,m3Block:0,inflammation:0,ics:0,lungVolume:100,direction:'expiration'},
    beta2:{label:'実験3｜β₂刺激',airwayRadius:100,smoothMuscleTone:62,mucosalEdema:0,mucusAmount:0,pressureGradient:100,beta2Stimulation:100,muscarinicActivity:20,m3Block:0,inflammation:0,ics:0,lungVolume:100,direction:'expiration'},
    edema:{label:'実験4｜粘膜浮腫',airwayRadius:100,smoothMuscleTone:0,mucosalEdema:72,mucusAmount:0,pressureGradient:100,beta2Stimulation:0,muscarinicActivity:0,m3Block:0,inflammation:65,ics:0,lungVolume:100,direction:'expiration'},
    mucus:{label:'実験5｜分泌物増加',airwayRadius:100,smoothMuscleTone:0,mucosalEdema:0,mucusAmount:78,pressureGradient:100,beta2Stimulation:0,muscarinicActivity:0,m3Block:0,inflammation:20,ics:0,lungVolume:100,direction:'expiration'},
    asthma:{label:'実験6｜喘息モデル',airwayRadius:100,smoothMuscleTone:65,mucosalEdema:58,mucusAmount:58,pressureGradient:100,beta2Stimulation:0,muscarinicActivity:25,m3Block:0,inflammation:76,ics:0,lungVolume:90,direction:'expiration'}
  });
  function state(raw={}){
    const x={...PRESETS.normal,...raw};
    ['airwayRadius','smoothMuscleTone','mucosalEdema','mucusAmount','pressureGradient','beta2Stimulation','muscarinicActivity','m3Block','inflammation','ics','lungVolume'].forEach(k=>x[k]=clamp(x[k],k==='airwayRadius'?35:0,k==='pressureGradient'?180:100));
    const betaRelaxation=x.beta2Stimulation*.62;
    const muscarinicDrive=x.muscarinicActivity*(1-x.m3Block/100)*.45;
    const effectiveTone=clamp(x.smoothMuscleTone+muscarinicDrive-betaRelaxation);
    const effectiveInflammation=x.inflammation*(1-x.ics*.0065);
    const effectiveEdema=clamp(x.mucosalEdema*(1-x.ics*.0045)+effectiveInflammation*.22);
    const lowVolumePenalty=Math.max(0,100-x.lungVolume)*.0012;
    const radiusFraction=Math.max(.28,(x.airwayRadius/100)*(1-effectiveTone*.0026-effectiveEdema*.0025-x.mucusAmount*.00155-lowVolumePenalty));
    const airwayResistance=Math.min(165,1/Math.pow(radiusFraction,4));
    const expiratoryPenalty=x.direction==='expiration'?1-Math.max(0,1-radiusFraction)*.28:1;
    const airFlow=Math.max(0,(x.pressureGradient/100)/airwayResistance*expiratoryPenalty);
    const breathingWork=(x.pressureGradient/100)*(1+Math.max(0,airwayResistance-1)*.22);
    const diameterPercent=radiusFraction*100;
    const resistanceLabel=airwayResistance<1.3?'低い':airwayResistance<3?'やや高い':airwayResistance<8?'高い':'非常に高い';
    const flowLabel=airFlow>.8?'保たれる':airFlow>.45?'低下方向':'大きく低下する方向';
    const causes=[];if(effectiveTone>15)causes.push('平滑筋収縮');if(effectiveEdema>15)causes.push('粘膜浮腫');if(x.mucusAmount>15)causes.push('分泌物');if(x.lungVolume<70)causes.push('低い肺気量');
    return {...x,betaRelaxation,muscarinicDrive,effectiveTone,effectiveInflammation,effectiveEdema,radiusFraction,diameterPercent,airwayResistance,airFlow,breathingWork,resistanceLabel,flowLabel,causes};
  }
  window.AIRWAY_MODEL=Object.freeze({PRESETS,state});
})();
