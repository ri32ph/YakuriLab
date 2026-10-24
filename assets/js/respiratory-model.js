(() => {
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));

  function state(raw={}){
    const respiratoryRate=clamp(raw.respiratoryRate ?? 12,8,36);
    const tidalVolume=clamp(raw.tidalVolume ?? 500,150,800);
    const deadSpace=clamp(raw.deadSpace ?? 150,80,250);
    const airwayResistance=clamp(raw.airwayResistance ?? 1,1,165);
    const pressureGradient=clamp(raw.pressureGradient ?? 100,40,180);
    const cycleTime=60/respiratoryRate;
    const inspiratoryTime=cycleTime/3;
    const expiratoryTime=cycleTime-inspiratoryTime;
    const expiratoryFlowLimitation=clamp(Math.log2(airwayResistance)*22,0,100);
    const timeConstant=Math.min(6,.55*(1+.22*Math.max(0,airwayResistance-1)));
    const remainingAtEnd=Math.exp(-expiratoryTime/timeConstant);
    const airTrapping=clamp((remainingAtEnd-.06)/.94*100,0,100);
    const dynamicHyperinflation=clamp(airTrapping*(.62+.38*expiratoryFlowLimitation/100),0,100);
    const minuteVentilation=tidalVolume*respiratoryRate/1000;
    const alveolarVentilation=Math.max(0,tidalVolume-deadSpace)*respiratoryRate/1000;
    const respiratoryWork=Math.max(35,100*(1+Math.log2(airwayResistance)*.2)*(pressureGradient/100)+Math.max(0,respiratoryRate-12)*1.1+Math.max(0,tidalVolume-500)*.035);
    const trappingLabel=airTrapping<8?'起こりにくい':airTrapping<28?'起こりうる':airTrapping<55?'起こりやすい':'強く起こりやすい';
    const workLabel=respiratoryWork<115?'基準付近':respiratoryWork<180?'増加方向':respiratoryWork<280?'高い方向':'非常に高い方向';
    return {respiratoryRate,tidalVolume,deadSpace,airwayResistance,pressureGradient,cycleTime,inspiratoryTime,expiratoryTime,expiratoryFlowLimitation,timeConstant,remainingAtEnd,airTrapping,dynamicHyperinflation,minuteVentilation,alveolarVentilation,respiratoryWork,trappingLabel,workLabel};
  }

  function lungLevel(s,elapsedSeconds){
    const phase=elapsedSeconds%s.cycleTime;
    const low=.16+s.dynamicHyperinflation/100*.32;
    const amplitude=.22+(s.tidalVolume-150)/650*.25;
    if(phase<=s.inspiratoryTime)return low+amplitude*(phase/s.inspiratoryTime);
    const t=phase-s.inspiratoryTime;
    const endFactor=Math.exp(-s.expiratoryTime/s.timeConstant);
    const factor=Math.exp(-t/s.timeConstant);
    const normalized=(factor-endFactor)/Math.max(.001,1-endFactor);
    return low+amplitude*Math.max(0,normalized);
  }

  window.RESPIRATORY_MODEL=Object.freeze({state,lungLevel});
})();
