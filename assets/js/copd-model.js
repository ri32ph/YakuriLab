(() => {
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  const BASE=Object.freeze({smallAirwayDisease:0,emphysema:0,elasticRecoil:100,inflammation:0,wallThickening:0,mucus:0,lumenNarrowing:0,respiratoryRate:14,tidalVolume:450,exercise:false,pursedLip:false,drug:'none',techniqueFactor:100,smokingExposure:false,rehab:false,exacerbation:false,icsSelected:false});
  const DRUGS=Object.freeze({none:{label:'使用しない',power:0},saba:{label:'SABA',power:44},sama:{label:'SAMA',power:34},laba:{label:'LABA',power:58},lama:{label:'LAMA',power:62},dual:{label:'LABA/LAMA',power:78},ics:{label:'ICSを含む治療',power:0}});
  function state(raw={}){
    const x={...BASE,...raw};
    for(const k of ['smallAirwayDisease','emphysema','elasticRecoil','inflammation','wallThickening','mucus','lumenNarrowing','techniqueFactor'])x[k]=clamp(x[k]);
    x.respiratoryRate=clamp(x.respiratoryRate,8,36);x.tidalVolume=clamp(x.tidalVolume,150,800);
    const airwayAxis=x.smallAirwayDisease/100,emphysema=x.emphysema/100;
    const inflammation=clamp(x.inflammation+airwayAxis*30+(x.exacerbation?28:0));
    const wallThickening=clamp(x.wallThickening+airwayAxis*30);
    const mucus=clamp(x.mucus+airwayAxis*20+(x.exacerbation?25:0));
    const structuralNarrowing=clamp(x.lumenNarrowing+airwayAxis*28);
    const elasticRecoil=clamp(Math.min(x.elasticRecoil,100-emphysema*72));
    const radialTraction=clamp(100-emphysema*78);
    const drug=DRUGS[x.drug]||DRUGS.none,delivery=clamp(x.techniqueFactor)/100;
    const bronchodilation=drug.power*delivery;
    const expiratorySupport=(x.pursedLip?15:0);
    const collapse=clamp((100-elasticRecoil)*.40+(100-radialTraction)*.34+structuralNarrowing*.18-expiratorySupport-bronchodilation*.15,0,82);
    const tone=clamp(10+airwayAxis*25+(x.exacerbation?18:0)-bronchodilation);
    const airway=window.AIRWAY_MODEL.state({airwayRadius:clamp(100-structuralNarrowing*.22-collapse*.22,35,100),smoothMuscleTone:tone,mucosalEdema:inflammation*.36+wallThickening*.22,mucusAmount:mucus,pressureGradient:x.exercise?125:110,beta2Stimulation:0,muscarinicActivity:0,m3Block:0,inflammation:0,lungVolume:100,direction:'expiration'});
    const effectiveResistance=clamp(airway.airwayResistance*(1+collapse/120),1,165);
    const rr=x.exercise?Math.min(36,x.respiratoryRate+8):x.respiratoryRate;
    const vt=x.exercise?Math.min(800,x.tidalVolume+130):x.tidalVolume;
    const breathing=window.RESPIRATORY_MODEL.state({respiratoryRate:rr,tidalVolume:vt,deadSpace:150,airwayResistance:effectiveResistance,pressureGradient:x.exercise?130:105});
    const staticHyperinflation=clamp((100-elasticRecoil)*.62+(100-radialTraction)*.23,0,100);
    const dynamicHyperinflation=clamp(breathing.dynamicHyperinflation*(1-(x.pursedLip?.16:0))*(1-(x.rehab?.07:0)),0,100);
    const totalHyperinflation=clamp(staticHyperinflation*.62+dynamicHyperinflation*.75,0,100);
    const respiratoryWork=clamp((breathing.respiratoryWork-35)*.45+collapse*.32+totalHyperinflation*.34-(x.rehab?8:0),0,100);
    const expiratoryFlow=clamp(100/(1+Math.log2(effectiveResistance+1)*.72)*(1-collapse/170),0,100);
    const inspiratoryReserve=clamp(100-totalHyperinflation*.78-(x.exercise?13:0),0,100);
    const surfaceArea=clamp(100-emphysema*68);
    const smokingMessage=x.smokingExposure?'曝露の継続は病変進行の重要な要因です。':'曝露を避けても、すでに失われた肺胞壁が直ちに元へ戻るわけではありません。';
    return {...x,inflammation,wallThickening,mucus,structuralNarrowing,elasticRecoil,radialTraction,bronchodilation,collapse,airway,effectiveResistance,breathing:{...breathing,dynamicHyperinflation},staticHyperinflation,dynamicHyperinflation,totalHyperinflation,respiratoryWork,expiratoryFlow,inspiratoryReserve,surfaceArea,delivery,smokingMessage};
  }
  function graph(raw={},mode='flow',steps=100){return Array.from({length:steps+1},(_,i)=>{const p=i/steps,s=state(raw);if(mode==='exercise'){const load=p<.18?0:(p-.18)/.82;return{x:p,a:clamp(s.respiratoryRate+load*(s.exercise?15:8),8,36),b:clamp(s.totalHyperinflation+load*s.dynamicHyperinflation*.45),c:clamp(s.respiratoryWork+load*24)};}const normal=Math.max(0,Math.pow(Math.sin(Math.PI*p),.72));const obstructed=Math.max(0,Math.pow(Math.sin(Math.PI*p),1.3)*(s.expiratoryFlow/100));return{x:p,a:normal*100,b:obstructed*100,c:p<.5?p*200:(1-p)*200};});}
  window.COPD_MODEL=Object.freeze({BASE,DRUGS,state,graph});
})();
