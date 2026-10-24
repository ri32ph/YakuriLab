((root) => {
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  const BASE=Object.freeze({drugType:'acid',pH:2,pKa:4,site:'stomach',meal:'fasting',ppi:false,solubilityProfile:'general'});
  function unionizedFraction(type,pH,pKa){
    const exponent=type==='base'?pKa-pH:pH-pKa;
    return 1/(1+Math.pow(10,exponent));
  }
  function environment(raw={}){
    const x={...BASE,...raw};let stomachPH={fasting:1.5,immediate:4.5,later:2.4}[x.meal]??1.5;
    if(x.ppi)stomachPH=Math.min(6.2,stomachPH+2.4);
    const gastricEmptying={fasting:1,immediate:3.2,later:2.1}[x.meal]??1;
    const sitePH=x.site==='stomach'?stomachPH:6.5;
    return {...x,stomachPH,gastricEmptying,sitePH,surfaceArea:x.site==='stomach'?12:100,residence:x.site==='stomach'?clamp(100/gastricEmptying):82};
  }
  function state(raw={}){
    const e=environment(raw),pH=clamp(raw.pH??e.sitePH,0,9),pKa=clamp(raw.pKa??BASE.pKa,0,12),unionized=unionizedFraction(e.drugType,pH,pKa),ionized=1-unionized;
    let dissolution;
    if(e.solubilityProfile==='acidDependentBase')dissolution=clamp(96/(1+Math.pow(10,pH-2.7)) + 4)/100;
    else if(e.drugType==='acid')dissolution=clamp(22+ionized*70)/100;
    else dissolution=clamp(25+ionized*68)/100;
    const permeability=clamp(8+unionized*88)/100;
    const siteOpportunity=(e.surfaceArea/100)*.72+(e.residence/100)*.28;
    const absorptionPotential=clamp(Math.sqrt(dissolution*permeability)*siteOpportunity*100);
    return {...e,pH,pKa,unionized,ionized,dissolution,permeability,siteOpportunity,absorptionPotential};
  }
  root.ABSORPTION_EXTENSION_MODEL=Object.freeze({BASE,unionizedFraction,environment,state});
  if(typeof module!=='undefined')module.exports={BASE,unionizedFraction,environment,state};
})(typeof window==='undefined'?globalThis:window);
