/* Relative illustrative indices only: no LVEF, diagnostic threshold, clinical time or prognosis.
   Phase 0 isolates pump/output, 1 shows compensation, 2 shows sustained burden.
   CO = relative HR * relative SV. Independent node keys are reusable by LAB 32. */
(function(root){
'use strict';
const phases=['初期','代償期','持続'];
function state(pump=100,phase=0){
 pump=Number.isFinite(Number(pump))?Math.max(20,Math.min(100,Number(pump))):100;
 phase=Number.isFinite(Number(phase))?Math.max(0,Math.min(2,Math.floor(Number(phase)))):0;
 const deficit=(100-pump)/100,low=deficit>0;
 if(!low)phase=0;
 const compensated=low&&phase>=1,persistent=low&&phase===2;
 const sympathetic=compensated?deficit:0,raas=compensated?deficit:0;
 const heartRate=1+.28*sympathetic;
 const strokeVolume=1-deficit*(phase===0?.7:phase===1?.58:.82);
 const cardiacOutput=heartRate*strokeVolume;
 const resistance=1+.45*sympathetic,volume=1+deficit*(phase===0?0:phase===1?.15:.55);
 const congestion=persistent?.9*deficit:0,load=deficit*(phase===0?0:phase===1?.25:.85);
 const pressureIndex=cardiacOutput*resistance;
 return {pump,phase,phaseName:phases[phase],low,compensated,persistent,deficit,heartRate,strokeVolume,cardiacOutput,resistance,volume,congestion,load,sympathetic,raas,pressureIndex,
  // Separate physiology channels; the renderer never infers EF from these indices.
  nodes:{heart:deficit,kidneys:1-cardiacOutput,sympathetic,raas,volume:volume-1,vessels:resistance-1,congestion,load},
  title:!low?'まず、心臓のポンプ機能を下げてみよう':phase===0?'1回に送り出す量が減る → CO低下':phase===1?'短期的には：循環を維持する方向':'助けようとした反応が、持続すると負担にもなる',
  text:!low?'心臓・血管・腎臓が協力して、全身の循環を保っています。':phase===0?'全身へ送り出す血液が減ります。体は血流・血圧を保とうとします。「時間を進める」で代償反応を見よう。':phase===1?'交感神経とRAASが働き、心拍数・血管抵抗・Na⁺と水の保持を増やします。ポンプ機能が元に戻ったわけではありません。':'血管収縮は送り出す抵抗を増やし、Na⁺・水分保持は充満圧・静脈圧を上げる方向に働きます。心負荷・うっ血が悪化に関わる例を見ています。',
  pressureLabel:!low?'標準付近':phase===0?'低下方向':phase===1?'低下を補う方向':'維持を図るが、負担も増加',
  perfusionLabel:!low?'保たれている':phase===1?'維持しようとする（低下は残る）':'低下方向',
  congestionLabel:persistent?'増える方向':'少ない（追加表示なし）'};
}
const symptoms={
 lungs:{title:'息切れ・呼吸困難・起坐呼吸',organs:['lungs'],target:'congestion',text:'左心系の充満圧↑方向 → 肺静脈・肺毛細血管圧↑方向 → 肺うっ血。息切れや、横になると苦しく座ると楽になる起坐呼吸などにつながることがあります。'},
 legs:{title:'浮腫・体重増加',organs:['legs'],target:'volume',text:'右心系の充満圧・体静脈圧↑方向 → 下肢などの静脈うっ血。Na⁺・水分の貯留も重なり、浮腫や体重増加につながることがあります。'},
 perfusion:{title:'疲労感・活動耐容能低下',organs:['heart','kidneys'],target:'heart',text:'CO低下 → 臓器や筋肉へ届く血液が不足する方向。疲れやすさや、活動を続けにくいことにつながる場合があります。これらの症状にはほかの原因もあります。'}
};
root.HEART_FAILURE_MODEL={state,phases,symptoms};
})(typeof window==='undefined'?globalThis:window);
