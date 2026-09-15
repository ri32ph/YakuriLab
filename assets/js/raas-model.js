/* Qualitative teaching sequence. Stage numbers are narrative order, not biological time.
   Outputs separate vascular resistance and sodium/water retention for LAB 30–32 reuse. */
(function(root){
  const stages = [
    {title:'循環血液量が減る', text:'心臓に戻る血液が減り、心拍出量・血圧が低下する方向へ。', organs:['heart']},
    {title:'腎臓が変化を感知する', text:'循環血液量↓ → 腎灌流圧（腎臓に入る血液の圧）↓ → レニン分泌↑。腎臓は血液量そのものを直接測っているわけではありません。', organs:['kidneys']},
    {title:'肝臓由来の材料に作用する', text:'肝臓は、材料となるアンジオテンシノーゲンを普段から血液中に供給しています。レニンがこの材料に作用します。', organs:['liver']},
    {title:'Ang Iが作られる', text:'レニンがアンジオテンシノーゲンを切断し、アンジオテンシンI（Ang I）を作ります。', organs:['liver','vessels']},
    {title:'ACEがAng IIへ変える', text:'血管内皮などのACEが、Ang IをアンジオテンシンII（Ang II）に変えます。ACEは肺以外にも存在します。', organs:['vessels']},
    {title:'血管を縮める・副腎へ伝える', text:'Ang IIが主にAT1受容体を介して血管を収縮させ、血管抵抗を上げます。同時に、副腎皮質からアルドステロンの分泌を促します。', organs:['vessels','adrenals']},
    {title:'腎臓でNa⁺・水を保つ', text:'アルドステロンが腎臓でNa⁺の再吸収を増やします。水の保持にもつながり、尿へ失う量を減らす方向に働きます。', organs:['kidneys','adrenals']},
    {title:'血圧・循環血液量を支える', text:'血管収縮とNa⁺・水の保持が、低下を補う方向に働きます。失った血液が直ちに元へ戻るわけではありません。', organs:['heart','vessels','kidneys']}
  ];
  function state(volume=50,stage=0,enabled=true){
    volume=Number.isFinite(Number(volume))?Math.max(0,Math.min(100,Number(volume))):50;
    stage=Number.isFinite(Number(stage))?Math.max(0,Math.min(7,Math.floor(Number(stage)))):0;
    const low=volume<50, active=low&&enabled, drive=Math.max(0,(50-volume)/50);
    return {volume,stage:low?stage:0,low,enabled,drive,volumeLabel:low?'少ない':volume>50?'多い':'標準',
      renin:active&&stage>=1,angiotensin:active&&stage>=4,aldosterone:active&&stage>=5,
      resistance:active&&stage>=5?drive:0,retention:active&&stage>=6?drive:0,
      supported:active&&stage>=7,organs:active?stages[stage].organs:[],
      title:low&&!enabled?'RAASによる補正を外して比較':low?stages[stage].title:volume>50?'RAASを高める刺激が弱まる':'まず、循環血液量を減らしてみよう',
      text:low&&!enabled?'同じ血液量低下でも、RAASによる血管収縮とNa⁺・水の保持が加わりません。ほかの循環調節はこの比較では計算していません。':low?stages[stage].text:volume>50?'このモデルでは、腎臓への血流が保たれるとRAASの追加の活性化は起こりません。':'標準状態でもRAASには基礎的な働きがあります。ここでは、血液量の低下で反応が強まる様子を観察します。'};
  }
  root.RAAS_MODEL={state,stages};
})(typeof window==='undefined'?globalThis:window);
