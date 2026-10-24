(() => {
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  const DRUGS=Object.freeze({
    saba:{label:'SABA',name:'短時間作用性β₂刺激薬',target:'beta2',onset:.15,duration:4,maxEffect:96,color:'#d95c5c'},
    laba:{label:'LABA',name:'長時間作用性β₂刺激薬',target:'beta2',onset:.55,duration:12,maxEffect:90,color:'#bd4679'},
    sama:{label:'SAMA',name:'短時間作用性抗コリン薬',target:'m3',onset:.35,duration:6,maxEffect:86,color:'#356ca5'},
    lama:{label:'LAMA',name:'長時間作用性抗コリン薬',target:'m3',onset:1.1,duration:24,maxEffect:92,color:'#4d7891'}
  });
  const BASE=Object.freeze({airwayRadius:100,smoothMuscleTone:62,mucosalEdema:34,mucusAmount:28,pressureGradient:120,muscarinicActivity:65,inflammation:55,lungVolume:86,direction:'expiration'});
  function effectAt(drugId,time){
    const d=DRUGS[drugId];if(!d)return 0;
    const t=Math.max(0,Number(time)||0),rise=1-Math.exp(-t/d.onset),decay=t<=d.duration?1:Math.exp(-(t-d.duration)/Math.max(.35,d.duration*.22));
    return clamp(d.maxEffect*rise*decay);
  }
  function airwayInput(drugId,time){
    const d=DRUGS[drugId],effect=effectAt(drugId,time),input={...BASE,beta2Stimulation:0,m3Block:0,ics:0};
    if(d?.target==='beta2')input.beta2Stimulation=effect;
    if(d?.target==='m3')input.m3Block=effect;
    return {...input,drugEffect:effect};
  }
  function timeline(drugId,maxTime=24,steps=120){return Array.from({length:steps+1},(_,i)=>{const time=maxTime*i/steps;return {time,effect:effectAt(drugId,time)};});}
  window.BRONCHODILATOR_MODEL=Object.freeze({DRUGS,BASE,effectAt,airwayInput,timeline});
})();
