/* Relative teaching indices only: no stenosis %, clinical thresholds, doses or real time. */
(() => {
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const drugs={
  none:{name:'薬なし',path:'まず条件を変え、需要と供給を比べよう。',care:'症状の有無だけでは、虚血の有無は判断できません。'},
  beta:{name:'β遮断薬',target:'heart',path:'β1遮断 → 心拍数・収縮力↓ → 酸素需要↓。心拍数の低下は拡張期の灌流時間にも有利な方向です。',care:'脈拍・血圧：心拍数や心臓の仕事を抑えるため。症状の変化も併せて観察します。'},
  nitrate:{name:'硝酸薬',target:'wall',path:'静脈拡張 → 静脈還流↓ → 前負荷↓ → 心室壁応力↓ → 酸素需要↓。冠血管への作用もありますが、固定した狭窄を単純に解除する図ではありません。',care:'血圧・頭痛・ふらつき：血管拡張に伴う変化を見るため。胸部症状への反応も確認します。'},
  dhp:{name:'Ca拮抗薬（DHP系）',target:'wall',path:'主に血管拡張 → 後負荷↓ → 壁応力・酸素需要↓方向。冠血管の緊張にも作用します。この図は後負荷への作用を示します。',care:'血圧・浮腫・脈拍：血管拡張や反射性の心拍変化などを捉えるため。'},
  nondhp:{name:'Ca拮抗薬（非DHP系）',target:'heart',path:'心拍数・収縮力↓方向 → 酸素需要↓。DHP系とは心臓への作用が異なります。',care:'脈拍・血圧・心電図：心拍数や房室伝導を抑える作用を見るため。心機能にも注意します。'},
  antiplatelet:{name:'抗血小板薬',target:'thrombus',path:'血小板活性化 → 凝集 → 血栓形成の経路に BLOCK。心血管イベント予防・急性冠症候群治療などで用います。既存の血栓を溶かす作用や、即時の症状改善は示しません。',care:'出血の兆候：血小板による止血も抑えるため。皮下出血、便・尿の変化などを観察します。'}
 };
 function state(input={}){
  const hr=clamp(Number(input.hr??35),0,100),contractility=clamp(Number(input.contractility??50),0,100),narrowing=clamp(Number(input.narrowing??0),0,100),wall=clamp(Number(input.wall??50),0,100),oxygen=clamp(Number(input.oxygen??100),0,100),drug=drugs[input.drug]?input.drug:'none';
  let rate=.65+hr*.01,force=.6+contractility*.008,stress=.7+wall*.006;
  if(drug==='beta'){rate*=.78;force*=.83;}if(drug==='nondhp'){rate*=.85;force*=.9;}if(drug==='nitrate')stress*=.78;if(drug==='dhp')stress*=.86;
  const demand=rate*force*stress,diastole=clamp(1-Math.max(0,rate-1.3)*.6,.6,1),capacity=(2.3-2.1*narrowing/100)*(input.thrombus?.22:1),flow=Math.min(demand*1.08,capacity)*diastole,supply=flow*(.4+.006*oxygen),deficit=Math.max(0,(demand-supply)/demand);
  return {hr,contractility,narrowing,wall,oxygen,drug,rate,force,stress,demand,supply,flow,capacity,diastole,deficit,ischemia:deficit>.001,thrombus:!!input.thrombus,block:drug==='antiplatelet',target:drugs[drug].target||'',lumen:Math.max(5,30*(1-narrowing*.008)),beatSeconds:1/rate};
 }
 function advance(previous,s){const p=previous||{burden:0,risk:false};const burden=clamp(p.burden+(s.ischemia?s.deficit*.065:-.035),0,1);return {burden,risk:p.risk||(burden>.7&&s.deficit>.4)};}
 window.ISCHEMIA_MODEL={state,advance,drugs};
})();
