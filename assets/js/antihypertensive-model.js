/* Direction-only teaching data; no dose, potency ranking, patient model or BP prediction.
   metrics order: HR, CO, vessel diameter, TPR, effective RAAS action, volume, BP.
   RAAS action is deliberately distinct from circulating renin/Ang II concentration. */
(function(root){
'use strict';
const metrics=[['hr','心拍数'],['co','心拍出量 CO'],['diameter','血管径'],['tpr','血管抵抗 TPR'],['raas','RAASの作用'],['volume','循環血液量'],['bp','血圧']];
const drugs={
 none:{name:'薬を重ねる前',place:'心臓・血管・腎臓・RAAS',organs:[],targets:[],values:[0,0,0,0,0,0,0],
  paths:['心臓から送り出す量と、血管の流れにくさが血圧に関わります。','腎臓・体液量とRAASも、この2つを調節します。'],
  detail:'まず全体像を見てから、左の「薬を選んで重ねる」を開いてみよう。',safety:[],observe:[]},
 dhp:{name:'Ca拮抗薬（DHP系）',place:'血管のL型Ca²⁺チャネル',organs:['vessels'],targets:['calcium'],values:[0,0,1,-1,0,0,-1],
  paths:['L型Ca²⁺チャネル遮断 → 血管平滑筋の収縮↓ → 血管拡張 → TPR↓ → 血圧↓方向'],
  detail:'基本表示は血管への直接作用です。ジヒドロピリジン（DHP）系を代表とし、心拍数への反射は発展表示で扱います。',
  safety:['血管拡張 → 頭痛・ほてり。','細動脈の拡張 → 毛細血管での圧の変化 → 末梢浮腫。全身の水分過剰だけでは説明できません。'],
  observe:['血圧・めまい：降圧の程度とふらつき','足首などの浮腫：部位と変化','頭痛・ほてり：血管拡張に伴う症状']},
 ace:{name:'ACE阻害薬',place:'Ang IをAng IIへ変えるACE',organs:['vessels','kidneys','adrenals'],targets:['ace'],values:[0,-1,1,-1,-1,-1,-1],
  paths:['Ang I → ACEを阻害 → Ang II生成↓ → 血管収縮↓ → TPR↓','アルドステロン分泌刺激↓方向 → Na⁺再吸収↓方向 → 水分保持↓方向 → 血圧↓方向'],
  detail:'Ang IIの生成を減らします。循環血液量・COの↓は体液保持が弱まる寄与を示し、実際のCOが必ず低下するという意味ではありません。',
  safety:['RAASの作用低下 → 低血圧・めまい。','アルドステロンの作用低下 → K⁺排泄↓方向 → 高K血症に注意。腎機能の変化も確認します。'],
  observe:['血圧・めまい：降圧の程度','血清K⁺・腎機能：高K血症や機能変化','空咳、唇・舌の腫れ：ACE阻害に関連する症状']},
 arb:{name:'ARB',place:'Ang IIが働くAT1受容体',organs:['vessels','kidneys','adrenals'],targets:['at1'],values:[0,-1,1,-1,-1,-1,-1],
  paths:['Ang II → AT1受容体を遮断 → 血管収縮↓ → TPR↓','AT1を介するアルドステロン分泌刺激↓方向 → Na⁺・水分保持↓方向 → 血圧↓方向'],
  detail:'Ang IIそのものの生成を止める薬ではありません。血中Ang IIが増える場合も、AT1受容体を介した作用は抑えられます。COの↓は体液量による寄与の表示です。',
  safety:['AT1を介する作用の低下 → 低血圧・めまい。','アルドステロンの作用低下 → K⁺上昇に注意。腎機能の変化も確認します。'],
  observe:['血圧・めまい：降圧の程度','血清K⁺・腎機能：高K血症や機能変化']},
 thiazide:{name:'サイアザイド系・類似利尿薬',place:'腎臓でのNa⁺再吸収',organs:['kidneys'],targets:['ncc'],values:[0,-1,0,0,0,-1,-1],
  paths:['腎Na⁺再吸収↓ → Na⁺排泄↑ → 水分排泄↑','循環血液量↓ → 一回拍出量・CO↓方向 → 血圧↓方向'],
  detail:'初期の体液量への作用を示します。長期的な降圧にはTPR低下も関与し、血液量の減少だけでは説明できません。',
  safety:['Na⁺・水分の排泄↑ → 脱水・低血圧。','低Na血症・低K血症など、電解質の変化にも注意します。'],
  observe:['血圧・ふらつき：低血圧の徴候','体重・尿量・口渇など：体液量と脱水徴候','血清Na⁺・K⁺・腎機能：電解質と機能変化']},
 beta:{name:'β遮断薬',place:'心臓と腎臓のβ1受容体',organs:['heart','kidneys'],targets:['beta1-heart','renin'],values:[-1,-1,0,0,-1,0,-1],
  paths:['心臓のβ1遮断 → 心拍数↓・収縮力↓方向 → CO↓ → 血圧↓方向','腎傍糸球体細胞のβ1遮断 → レニン分泌↓ → RAASの作用↓方向'],
  detail:'β1遮断を中心に示します。β1選択性や血管拡張などの付加作用は薬剤で異なり、RAAS低下に続く体液量・血管の変化は基本指標から省略しています。',
  safety:['心拍数・房室伝導の抑制 → 徐脈などに注意。','β2遮断による気管支への影響は、薬剤の選択性や患者の状態で異なります。'],
  observe:['血圧・脈拍：降圧と徐脈','めまい・倦怠感：循環への影響','息苦しさ・喘鳴：気道への影響にも注意']},
 mra:{name:'MRA（発展）',place:'腎臓のミネラルコルチコイド受容体',organs:['kidneys'],targets:['mr'],values:[0,-1,0,0,-1,-1,-1],
  paths:['アルドステロン → ミネラルコルチコイド受容体を遮断','Na⁺再吸収↓方向 → Na⁺・水分保持↓方向 → 血圧↓方向'],
  detail:'アルドステロンの受容体での作用を抑えます。アルドステロンの生成そのものを止める表示にはしていません。',
  safety:['K⁺排泄↓方向 → 高K血症に注意。'],observe:['血清K⁺・腎機能：高K血症と機能変化','血圧・めまい：降圧の程度','体重・浮腫：体液量の変化']}
};
function state(id='none',compensate=false){
 const d=drugs[id]||drugs.none, key=drugs[id]?id:'none';
 const directions=Object.fromEntries(metrics.map(([k],i)=>[k,d.values[i]]));
 let compensation='';
 if(compensate&&key==='dhp'){directions.hr=1;compensation='血管拡張 → 血圧↓方向 → 圧受容体反射 → 交感神経↑ → 心拍数↑方向。薬剤・作用の速さなどで程度は異なります。';}
 if(compensate&&key==='thiazide'){directions.raas=1;compensation='循環血液量↓ → 腎灌流圧低下など → レニン分泌↑ → RAAS活性化。体はNa⁺・水分を保つ方向に補正しようとします。';}
 if(compensate&&!compensation&&key!=='none')compensation='補正反応は複数の系にまたがります。この薬効群の反射・フィードバックは数値化せず、直接作用を表示しています。';
 return {id:key,...d,directions,compensation,compensate:Boolean(compensate),
  // Drawing dimensions only; these values do not represent drug strength.
  lumen:directions.diameter>0?25:18,volumeLevel:directions.volume<0?0.45:0.72};
}
function label(key,value){return key==='diameter'?(value>0?'広い':value<0?'狭い':'→'):key==='bp'?(value<0?'↓方向':'標準付近'):value<0?'↓':value>0?'↑':'→';}
root.ANTIHYPERTENSIVE_MODEL={drugs,metrics,state,label};
})(typeof window==='undefined'?globalThis:window);
