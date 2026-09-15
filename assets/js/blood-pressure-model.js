(() => {
  'use strict';
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function state(input){
    const heartRate=clamp(Number(input.heartRate),40,120);
    const strokeSetting=clamp(Number(input.strokeVolume),40,100);
    const vesselControl=clamp(Number(input.vesselControl),0,100);
    const bloodVolume=clamp(Number(input.bloodVolume ?? 50),0,100);
    const contractility=clamp(Number(input.contractility ?? 50),0,100);
    const advanced=Boolean(input.advanced);
    const preloadFactor=advanced ? 1+(bloodVolume-50)*0.004 : 1;
    const contractilityFactor=advanced ? 1+(contractility-50)*0.004 : 1;
    const strokeVolume=strokeSetting*preloadFactor*contractilityFactor;
    const cardiacOutput=heartRate*strokeVolume/1000;
    // Slider runs from wide to narrow. TPR follows the radius relationship, then is bounded for a readable teaching model.
    const vesselDiameter=130-vesselControl*0.6;
    const resistance=clamp(Math.pow(100/vesselDiameter,4),0.4,2.5);
    const pressureIndex=cardiacOutput/4.9*resistance;
    const pressureDirection=pressureIndex<0.72?'↓↓ 低下方向':pressureIndex<0.91?'↓ やや低下方向':pressureIndex<=1.10?'→ 標準付近':pressureIndex<=1.38?'↑ やや上昇方向':'↑↑ 上昇方向';
    const resistanceLabel=resistance<0.78?'低い':resistance>1.28?'高い':'標準';
    const direction=(value,base,margin)=>value<base-margin?'down':value>base+margin?'up':'same';
    return {heartRate,strokeSetting,strokeVolume,cardiacOutput,vesselControl,vesselDiameter,resistance,resistanceLabel,pressureIndex,pressureDirection,bloodVolume,contractility,preloadFactor,contractilityFactor,directions:{heartRate:direction(heartRate,70,2),strokeVolume:direction(strokeVolume,70,2),cardiacOutput:direction(cardiacOutput,4.9,.15),vessel:direction(vesselDiameter,100,2),resistance:direction(resistance,1,.06),pressure:direction(pressureIndex,1,.10),bloodVolume:direction(bloodVolume,50,4),preload:direction(preloadFactor,1,.02),contractility:direction(contractility,50,4)}};
  }
  window.BLOOD_PRESSURE_MODEL={state};
})();
