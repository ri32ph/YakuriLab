(() => {
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  const DEVICES=Object.freeze({
    pmdi:{label:'pMDI',name:'加圧式定量噴霧吸入器',flow:'ゆっくり深く',coordination:true,powered:true},
    dpi:{label:'DPI',name:'ドライパウダー吸入器',flow:'十分に強く深く',coordination:false,powered:false},
    smi:{label:'SMI',name:'ソフトミスト吸入器',flow:'ゆっくり深く',coordination:true,powered:true},
    spacer:{label:'pMDI＋スペーサー',name:'吸入補助具を接続',flow:'ゆっくり深く／機器指定',coordination:false,powered:true},
    nebulizer:{label:'ネブライザー',name:'薬液からエアロゾルを発生',flow:'通常の呼吸／機器指定',coordination:false,powered:true}
  });
  const BASE=Object.freeze({device:'pmdi',inspiratoryFlow:38,timing:0,particleSize:3,breathHold:5,spacerDelay:0,interfaceType:'mouthpiece',seal:100,exhaleIntoDevice:false,deviceResistance:55,respiratoryRate:16,tidalVolume:450,prepared:true});
  function state(raw={}){
    const x={...BASE,...raw},d=DEVICES[x.device]||DEVICES.pmdi,flow=clamp(x.inspiratoryFlow,10,100),size=clamp(x.particleSize,.5,8),hold=clamp(x.breathHold,0,12),seal=clamp(x.seal),delay=clamp(x.spacerDelay,0,12),resistance=clamp(x.deviceResistance,20,90);
    let release=92,coordination=100,dispersion=88,deviceLoss=8,oropharynx=18,exhaled=14;
    if(x.device==='pmdi'){
      coordination=x.timing===0?96:x.timing<0?48:18;release=coordination;oropharynx=18+Math.max(0,flow-45)*.55+(x.timing<0?22:0);deviceLoss=8+(x.timing>0?48:0);
    }else if(x.device==='dpi'){
      const deviceNeed=30+resistance*.35;dispersion=clamp(28+(flow-deviceNeed)*1.65);release=dispersion;x.exhaleIntoDevice&&(release*=.62,deviceLoss+=24);oropharynx=16+Math.max(0,flow-72)*.28;
    }else if(x.device==='smi'){
      coordination=x.timing===0?92:x.timing<0?62:30;release=coordination;oropharynx=12+Math.max(0,flow-52)*.34;deviceLoss=7+(x.timing>0?30:0);
    }else if(x.device==='spacer'){
      coordination=94;release=clamp(96-delay*5.4);deviceLoss=12+delay*4.2;oropharynx=10+Math.max(0,flow-55)*.2;
    }else{
      release=86;coordination=100;deviceLoss=14;oropharynx=15;
    }
    if(size>5)oropharynx+=20+(size-5)*4;
    if(size<1.5)exhaled+=24+(1.5-size)*12;
    exhaled+=Math.max(0,5-hold)*4;
    if((x.device==='spacer'||x.device==='nebulizer')&&x.interfaceType==='mask')deviceLoss+=Math.max(0,100-seal)*.5;
    if(x.interfaceType==='mouthpiece')deviceLoss+=Math.max(0,100-seal)*.34;
    if(!x.prepared)deviceLoss+=24;
    const inhaled=release*(.62+.38*seal/100),rawAirway=Math.max(1,inhaled-oropharynx*.62-exhaled*.45),values={airway:rawAirway,oropharynx:Math.max(1,oropharynx),exhaled:Math.max(1,exhaled),device:Math.max(1,deviceLoss+Math.max(0,100-release))};
    const total=Object.values(values).reduce((a,b)=>a+b,0);Object.keys(values).forEach(k=>values[k]=values[k]/total*100);
    const techniqueScore=clamp(values.airway*1.45);
    const label=techniqueScore>70?'届きやすい条件':techniqueScore>48?'改善できる条件':'届きにくい条件';
    const instruction=x.device==='dpi'?'デバイスから離れて息を吐き、機器に合った十分な吸気で深く吸う':x.device==='spacer'?'機器の説明に従って噴霧し、遅れずに吸入する':x.device==='nebulizer'?'適合する薬液・機器を使い、衛生管理と洗浄・乾燥を行う':`${d.label}を準備し、吸入開始と作動を合わせ、${d.flow}吸う`;
    return {...x,deviceInfo:d,flow,size,hold,seal,delay,resistance,release,coordination,dispersion,outcomes:values,techniqueScore,label,instruction};
  }
  window.INHALER_MODEL=Object.freeze({DEVICES,BASE,state});
})();
