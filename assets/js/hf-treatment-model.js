/* Mechanism teaching data for chronic HFrEF. No doses, outcome scores or patient predictions.
   A channel is marked affected once: combining drugs never sums arbitrary efficacy values. */
(function(root){
'use strict';
const family=['arni','ace','arb'];
const drugs={
 arni:{name:'ARNI',role:'longterm',targets:['raas'],blocks:{raas:'AT1 BLOCK ＋ NP作用↑'},effects:['raas','vessels','sodium','volume','load','np'],
  mechanism:['AT1受容体遮断 → RAAS系の作用↓','ネプリライシン阻害 → ナトリウム利尿ペプチド（NP）系の作用↑'],
  note:'RAAS系の抑制と、血管拡張・Na⁺排泄などを促すNP系の増強という2方向で働きます。',
  observe:['血圧：血管・体液量への作用による低血圧やふらつき','腎機能・K⁺：RAAS系への介入に伴う変化'],
  caution:'ARNIはARBを含みます。ACE阻害薬や別のARBを追加する表示にはしません。'},
 ace:{name:'ACE阻害薬',role:'longterm',targets:['raas'],blocks:{raas:'ACE BLOCK'},effects:['raas','vessels','sodium','volume','load','angiotensin'],
  mechanism:['ACEを阻害 → Ang II生成↓方向','血管収縮↓・アルドステロン作用↓方向 → 心負荷を抑える方向'],
  note:'Ang IからAng IIへの変換を抑えます。レニンが必ず減るという意味ではありません。',
  observe:['血圧：血管抵抗低下などによるふらつき','腎機能・K⁺：RAAS抑制に伴う変化','咳など：ブラジキニン分解低下に関連する空咳・血管性浮腫'],caution:'ARNI・ARBと同時に選択する枠ではありません。'},
 arb:{name:'ARB',role:'longterm',targets:['raas'],blocks:{raas:'AT1 BLOCK'},effects:['raas','vessels','sodium','volume','load'],
  mechanism:['Ang II → AT1受容体を遮断','血管収縮・アルドステロン分泌刺激↓方向'],
  note:'Ang IIの生成そのものは止めません。受容体を介した作用を抑えます。',
  observe:['血圧：血管・体液量の変化','腎機能・K⁺：RAAS系抑制に伴う変化'],caution:'ARNIにはARBが含まれます。この枠の3種類は入れ替えて比較します。'},
 beta:{name:'β遮断薬',role:'longterm',targets:['sympathetic'],blocks:{sympathetic:'β1 BLOCK'},effects:['sympathetic','heartRate','load'],
  mechanism:['β1作用↓ → 心拍数↓方向・心筋への過剰な交感神経刺激↓','慢性的な心負荷・リモデリングを抑える方向'],
  note:'心収縮力を下げる薬なのに、なぜ心不全に使うの？ 短期の陰性変力作用に加えて、慢性の交感神経過活動を抑える意義があります。',
  observe:['脈拍・血圧：徐脈や低血圧','心不全症状：息切れ・浮腫・倦怠感などの変化','開始・増量時：循環と症状の変化を合わせて確認'],
  caution:'慢性HFrEFで有効性が示された薬剤を想定します。急性増悪時の新規導入・増量を単純に勧める表示ではありません。'},
 mra:{name:'MRA',role:'longterm',targets:['volume'],blocks:{volume:'MR BLOCK'},effects:['aldosteroneAction','sodium','volume','load'],
  mechanism:['アルドステロン → ミネラルコルチコイド受容体（MR）を遮断','Na⁺保持↓方向・心血管リモデリング↓方向'],
  note:'アルドステロンの産生そのものを止める薬ではありません。受容体での作用を抑えます。',
  observe:['K⁺：K⁺排泄↓方向 → 高K血症に注意','腎機能：K⁺排泄や薬の使用条件に関わる','血圧：治療に伴う変化'],caution:'高K血症と腎機能の変化に注意します。'},
 sglt2:{name:'SGLT2阻害薬',role:'longterm',targets:['kidneys'],blocks:{kidneys:'近位尿細管：SGLT2 BLOCK'},effects:['sodium','volume','sglt2Benefit'],
  mechanism:['腎近位尿細管のSGLT2を阻害 → Na⁺・糖再吸収↓','尿中へのNa⁺・糖排泄↑'],
  note:'心不全での有益性は単純な利尿だけでは説明できません。複数の機序が考えられ、ここでは全効果を一本の経路に結びつけません。',
  observe:['体液量：体重・口渇・ふらつきなどから体液減少を確認','腎機能：開始後を含め変化を追う','感染症状：性器周囲のかゆみ・痛みなど','病態に応じてケトアシドーシスに注意：食事摂取不良や急性疾患時など。血糖が著しく高くない場合もあります'],
  caution:'単なる利尿薬として扱わず、慢性心不全への有益性と安全性を別々に確認します。'},
 loop:{name:'ループ利尿薬',role:'congestion',targets:['kidneys'],blocks:{kidneys:'ヘンレ係蹄：NKCC2 BLOCK'},effects:['sodium','volume','decongestion'],
  mechanism:['ヘンレ係蹄の太い上行脚でNKCC2阻害 → Na⁺再吸収↓','Na⁺・水分排泄↑ → 体液量・うっ血↓ → 呼吸困難・浮腫の改善方向'],
  note:'主にうっ血・症状を改善する役割です。過剰な体液が減れば体重も低下する方向に働きます。',
  observe:['体重・浮腫・呼吸状態：うっ血の改善と体液減少','尿量：排泄への作用を体重や症状と合わせて見る','血圧・腎機能：体液減少による循環への影響','Na⁺・K⁺など：電解質喪失を確認'],
  caution:'うっ血を減らす働きと、長期予後への介入は同じ指標ではありません。'}
};
function choose(current,id,append=false){
 if(!drugs[id])return [...current];
 const old=append?current.filter(x=>drugs[x]):[];
 return [...new Set([...old.filter(x=>!family.includes(id)||!family.includes(x)),id])];
}
function state(ids=[],after=true){
 let selected=[];for(const id of ids)selected=choose(selected,id,true);
 const active=after?selected:[], effects=new Set(active.flatMap(id=>drugs[id].effects));
 const base=root.HEART_FAILURE_MODEL.state(40,2),view={...base,nodes:{...base.nodes}};
 // Fixed drawing attenuation means direction only, not a predicted effect size or additive efficacy.
 if(effects.has('heartRate'))view.heartRate=1+(base.heartRate-1)*.5;
 if(effects.has('vessels'))view.resistance=1+(base.resistance-1)*.5;
 if(effects.has('volume')){view.volume=1+(base.volume-1)*.5;view.congestion=base.congestion*.55;}
 const blocks={};for(const id of active)for(const [key,label] of Object.entries(drugs[id].blocks)){(blocks[key]??=[]).push(label);}
 const changed=Object.fromEntries([...effects].map(key=>[key,true]));
 const longterm=active.some(id=>drugs[id].role==='longterm');
 return {selected,active,after:after&&selected.length>0,base,view,changed,blocks,longterm,
  emphasis:Object.fromEntries(active.flatMap(id=>drugs[id].targets).map(key=>[key,true])),
  // Independent display channels retained for extensions and overlays.
  channels:{heartRate:effects.has('heartRate'),sympathetic:effects.has('sympathetic'),raas:effects.has('raas'),angiotensin:effects.has('angiotensin'),aldosterone:effects.has('aldosteroneAction')||effects.has('raas'),vessels:effects.has('vessels'),kidneys:active.some(id=>drugs[id].targets.includes('kidneys')),sodium:effects.has('sodium'),volume:effects.has('volume'),lungs:effects.has('volume'),legs:effects.has('volume'),load:effects.has('load')}};
}
root.HF_TREATMENT_MODEL={drugs,family,choose,state};
})(typeof window==='undefined'?globalThis:window);
