(() => {
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  const TRIGGERS=Object.freeze({none:{label:'刺激なし',tone:0,edema:0,mucus:0},allergen:{label:'アレルゲン',tone:30,edema:12,mucus:10},cold:{label:'冷気',tone:25,edema:2,mucus:2},exercise:{label:'運動',tone:22,edema:1,mucus:1},virus:{label:'ウイルス性気道感染',tone:26,edema:20,mucus:18},smoke:{label:'煙などの刺激物',tone:28,edema:8,mucus:9}});
  const DRUGS=Object.freeze({none:{label:'治療なし'},saba:{label:'SABA'},ics:{label:'ICS'},combo:{label:'ICS/LABA'},lama:{label:'LAMA（追加）'},other:{label:'その他の追加治療'}});
  const BASE=Object.freeze({trigger:'none',triggerIntensity:0,bronchodilator:0,icsExposure:0,treatmentTime:0,continued:true,techniqueFactor:100,respiratoryRate:16,tidalVolume:450,exacerbation:false,symptomQuiet:true});
  function state(raw={}){
    const x={...BASE,...raw},t=TRIGGERS[x.trigger]||TRIGGERS.none,intensity=clamp(x.triggerIntensity)/100,delivery=clamp(x.techniqueFactor)/100,exacerbation=x.exacerbation?1:0;
    const inflammationBase=56+t.edema*intensity+exacerbation*26,hyperBase=66+t.tone*intensity*.25+exacerbation*18,edemaBase=25+t.edema*intensity+exacerbation*22,mucusBase=22+t.mucus*intensity+exacerbation*24,toneBase=12+t.tone*intensity+exacerbation*28;
    const biology=window.AIRWAY_INFLAMMATION_MODEL.state({airwayInflammation:inflammationBase,airwayHyperresponsiveness:hyperBase,epithelialIntegrity:52,inflammatoryCellActivity:inflammationBase,mucosalEdema:edemaBase,mucusAmount:mucusBase,smoothMuscleTone:toneBase,icsExposure:clamp(x.icsExposure)*delivery,beta2Stimulation:clamp(x.bronchodilator)*delivery,treatmentTime:x.treatmentTime,continued:x.continued,trigger:0,maintainedBeta2:x.maintainedBeta2});
    const airway=window.AIRWAY_MODEL.state(biology.airwayInput),breathing=window.RESPIRATORY_MODEL.state({respiratoryRate:x.respiratoryRate,tidalVolume:x.tidalVolume,deadSpace:150,airwayResistance:airway.airwayResistance,pressureGradient:110});
    const symptomBurden=clamp((airway.airwayResistance-1)*11+breathing.respiratoryWork*.18-15),futureRisk=clamp(biology.airwayInflammation*.52+biology.airwayHyperresponsiveness*.35+(x.continued?0:14)+exacerbation*22);
    const narrowing=clamp(100-airway.diameterPercent),pefDirection=clamp(100-(airway.airwayResistance-1)*13);
    return {...x,triggerInfo:t,biology,airway,breathing,symptomBurden,futureRisk,narrowing,pefDirection,delivery};
  }
  function graph(raw={},mode='airway',steps=100){return Array.from({length:steps+1},(_,i)=>{const p=i/steps;if(mode==='long'){const treatmentTime=p<.02?0:p<.15?1:p<.55?2:3,s=state({...raw,treatmentTime});return {x:p,a:s.biology.airwayInflammation,b:s.biology.airwayHyperresponsiveness,c:100-s.futureRisk};}const triggerIntensity=p<.2?p*5*raw.triggerIntensity:raw.triggerIntensity,bronchodilator=p<.38?0:raw.bronchodilator*(1-Math.exp(-(p-.38)*10)),s=state({...raw,triggerIntensity,bronchodilator});return {x:p,a:s.airway.diameterPercent,b:Math.min(100,s.airway.airwayResistance/8*100),c:s.biology.airwayInflammation};});}
  window.ASTHMA_MODEL=Object.freeze({TRIGGERS,DRUGS,BASE,state,graph});
})();
