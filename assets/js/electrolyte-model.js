(() => {
  const DRUGS=Object.freeze({
    none:{id:'none',label:'薬なし',nephron:'none',distalBoost:0,enac:.92,mr:1,k:'基準',na:'基準'},
    loop:{id:'loop',label:'ループ利尿薬',nephron:'loop',distalBoost:48,enac:1,mr:1,k:'排泄↑方向',na:'排泄↑方向'},
    thiazide:{id:'thiazide',label:'サイアザイド系',nephron:'thiazide',distalBoost:30,enac:1,mr:1,k:'排泄↑方向',na:'排泄↑方向'},
    mra:{id:'mra',label:'MRA',nephron:'mra',distalBoost:12,enac:.58,mr:.22,k:'排泄↓方向',na:'排泄↑方向'},
    enac:{id:'enac',label:'ENaC阻害薬',nephron:'enac',distalBoost:12,enac:.18,mr:1,k:'排泄↓方向',na:'排泄↑方向'},
    combo:{id:'combo',label:'ループ＋MRA',nephron:'loop',distalBoost:52,enac:.62,mr:.3,k:'一律に相殺されない',na:'排泄↑方向'}
  });
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,Number(v)||0));
  function state({drugClass='none',distalNa=50,aldosterone=50,waterBalance=50}={}){
    const drug=DRUGS[drugClass]||DRUGS.none;
    distalNa=clamp(distalNa);aldosterone=clamp(aldosterone);waterBalance=clamp(waterBalance);
    const delivered=clamp(distalNa+drug.distalBoost);
    const mrActivity=clamp((.35+.65*aldosterone/100)*drug.mr,0,1.4);
    const enacActivity=clamp((.35+.65*aldosterone/100)*drug.enac,0,1.4);
    const pumpActivity=clamp(.45+.55*aldosterone/100,0,1.2);
    const urineFlow=clamp(35+delivered*.55,10,100);
    let kSecretion=clamp(18+delivered*.42*enacActivity+urineFlow*.12*mrActivity,5,100);
    if(drug.id==='mra')kSecretion*=.52;if(drug.id==='enac')kSecretion*=.42;if(drug.id==='combo')kSecretion*=.72;
    const urineNa=clamp(12+delivered*(1-enacActivity*.42)+drug.distalBoost*.35,4,100);
    const totalBodyNa=100-(urineNa-35)*.08;
    const totalBodyWater=100+(waterBalance-50)*.45-(urineFlow-50)*.09;
    const serumNaIndex=clamp(totalBodyNa/Math.max(45,totalBodyWater)*100,70,130);
    const serumNaLabel=serumNaIndex<94?'低下方向':serumNaIndex>106?'上昇方向':'標準付近';
    const kLabel=kSecretion>44?'K⁺喪失↑方向':kSecretion<28?'K⁺保持方向':'基準付近';
    return {drug,distalNa,delivered,aldosterone,waterBalance,mrActivity,enacActivity,pumpActivity,urineFlow,kSecretion,urineNa,totalBodyNa,totalBodyWater,serumNaIndex,serumNaLabel,kLabel,
      explanations:{distal:`集合管へのNa⁺送達 ${delivered.toFixed(0)}`,enac:drug.id==='enac'?'ENaCを直接BLOCK':drug.id==='mra'||drug.id==='combo'?'MRをBLOCK → ENaCなどの活性↓方向':'ENaCからNa⁺が主細胞内へ',pump:'Na⁺/K⁺-ATPaseがNa⁺を血液側へ、K⁺を細胞内へ',romk:kSecretion>44?'ROMKなどからK⁺分泌↑方向':kSecretion<28?'尿中K⁺排泄↓方向':'K⁺分泌は基準付近'}};
  }
  window.ELECTROLYTE_MODEL=Object.freeze({DRUGS,state});
})();
