(() => {
  const SEGMENTS = Object.freeze([
    { id:'glomerulus', short:'糸球体', name:'糸球体・濾過', na:0, water:0, transporter:'濾過', permeability:'濾過されたNa⁺・水が尿細管へ入る', detail:'血液から尿細管へ。ここでの100を出発点にします。' },
    { id:'proximal', short:'近位', name:'近位尿細管', na:67, water:67, transporter:'NHE3・SGLT2など', permeability:'Na⁺と水をともに多く戻す', detail:'Na⁺・水に加え、グルコース、アミノ酸、HCO₃⁻なども多く再吸収します。' },
    { id:'descending', short:'下行脚', name:'Henle係蹄 下行脚', na:0, water:14, transporter:'水透過性', permeability:'水が通りやすい', detail:'水が血管側へ移り、尿細管液は濃くなる方向です。' },
    { id:'thick-ascending', short:'太い上行脚', name:'Henle係蹄 太い上行脚', na:25, water:0, transporter:'NKCC2', permeability:'水はほとんど通さない', detail:'Na⁺・K⁺・2Cl⁻を戻しますが、水はほとんどついてきません。' },
    { id:'distal', short:'遠位', name:'遠位尿細管', na:5, water:0, transporter:'NCC', permeability:'NaClをさらに調整', detail:'NCCを介してNaClを再吸収する調整部位です。' },
    { id:'collecting', short:'集合管', name:'集合管・遠位ネフロン', na:2, water:3, transporter:'ENaC / MR・AQP2', permeability:'Na⁺と水を別々に調節', detail:'アルドステロンはMRを介してNa⁺再吸収を促す方向、ADHはV2受容体・AQP2を介して水透過性を上げる方向です。' },
    { id:'urine', short:'尿', name:'尿として排泄', na:0, water:0, transporter:'排泄', permeability:'体外へ', detail:'再吸収されず尿細管内に残ったものが尿へ出ます。' }
  ]);

  const DRUGS = Object.freeze({
    none:{ id:'none', label:'薬なし', category:'基準', segment:null, target:'—', naBlock:0, waterBlock:0, distalNa:'基準', kDirection:'基準', effect:'正常な再吸収を観察', examples:'—', observation:['尿量','体重','浮腫','血圧','Na⁺','K⁺','腎機能'] },
    loop:{ id:'loop', label:'ループ利尿薬', category:'基本', segment:'thick-ascending', target:'NKCC2', naBlock:.82, waterBlock:0, distalNa:'大きく増加', kDirection:'低下方向に注意', effect:'NaCl再吸収↓ → 下流Na⁺↑ → Na⁺・水排泄↑方向', examples:'フロセミド、アゾセミド、トラセミド', observation:['尿量','体重','血圧','脱水徴候','Na⁺','K⁺','腎機能'] },
    thiazide:{ id:'thiazide', label:'サイアザイド系・類似薬', category:'基本', segment:'distal', target:'NCC', naBlock:.78, waterBlock:0, distalNa:'増加', kDirection:'低下方向に注意', effect:'NaCl再吸収↓ → 下流Na⁺↑ → Na⁺・水排泄↑方向', examples:'ヒドロクロロチアジド、トリクロルメチアジド、インダパミド', observation:['血圧','体重','Na⁺','K⁺','腎機能'] },
    mra:{ id:'mra', label:'MRA', category:'基本・K保持性', segment:'collecting', target:'MR', naBlock:.58, waterBlock:0, distalNa:'尿中へ増加', kDirection:'上昇方向に注意', effect:'アルドステロン→MRを遮断 → ENaCなどを介するNa⁺再吸収↓方向', examples:'スピロノラクトン、エプレレノン、エサキセレノン', observation:['K⁺','腎機能','血圧','体重'] },
    enac:{ id:'enac', label:'ENaC阻害薬', category:'基本・K保持性', segment:'collecting', target:'ENaC', naBlock:.72, waterBlock:0, distalNa:'尿中へ増加', kDirection:'上昇方向に注意', effect:'Na⁺チャネルを直接遮断 → Na⁺再吸収↓方向', examples:'アミロライド、トリアムテレン', observation:['K⁺','腎機能','血圧','体重'] },
    ca:{ id:'ca', label:'炭酸脱水酵素阻害薬', category:'発展', segment:'proximal', target:'炭酸脱水酵素', naBlock:.16, waterBlock:.12, distalNa:'増加', kDirection:'低下方向に注意', effect:'HCO₃⁻・Na⁺再吸収↓ → NaHCO₃・水排泄↑方向', examples:'アセタゾラミド', observation:['酸塩基平衡','Na⁺','K⁺','腎機能'] },
    osmotic:{ id:'osmotic', label:'浸透圧利尿薬', category:'発展・別機序', segment:'proximal', target:'尿細管液の浸透圧', naBlock:0, waterBlock:.34, distalNa:'二次的に変化', kDirection:'変動に注意', effect:'尿細管液の浸透圧↑ → 水再吸収↓方向 → 尿量↑方向', examples:'マンニトール', observation:['尿量','浸透圧','体液量','Na⁺','腎機能'] },
    sglt2:{ id:'sglt2', label:'SGLT2阻害薬', category:'関連する薬', segment:'proximal', target:'SGLT2', naBlock:.08, waterBlock:.08, distalNa:'増加方向', kDirection:'一律ではない', effect:'Na⁺・グルコース再吸収↓ → 尿糖排泄↑＋Na⁺排泄への影響', examples:'個別薬は糖尿病治療薬LABで扱います', observation:['尿糖','体液量','腎機能','脱水徴候'] }
  });

  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
  function simulate({adh=1,drugClass='none'}={}){
    const drug=DRUGS[drugClass]||DRUGS.none;
    const adhLevel=clamp(adh,0,1);
    let remainingNa=100,remainingWater=100;
    const stages=SEGMENTS.map((segment,index)=>{
      let naReabs=segment.na,waterReabs=segment.water;
      if(segment.id==='collecting')waterReabs=3+9*adhLevel;
      if(segment.id===drug.segment){
        naReabs*=1-drug.naBlock;
        if(drug.id==='osmotic')waterReabs*=1-drug.waterBlock;
        else waterReabs*=1-drug.waterBlock;
      }
      if(drug.id==='osmotic'&&['descending','collecting'].includes(segment.id))waterReabs*=.72;
      if(drug.id==='loop'&&segment.id==='collecting')waterReabs*=.72;
      naReabs=Math.min(remainingNa,Math.max(0,naReabs));
      waterReabs=Math.min(remainingWater,Math.max(0,waterReabs));
      remainingNa-=naReabs;remainingWater-=waterReabs;
      return {...segment,index,naReabs,waterReabs,remainingNa,remainingWater,blocked:segment.id===drug.segment&&drug.id!=='none'};
    });
    const normal=drug.id==='none'?null:simulate({adh:adhLevel,drugClass:'none'});
    if(drug.id!=='none'&&drug.id!=='osmotic'){
      const uncoupledWater=Math.max(0,remainingNa-(normal?.urineNa||1))*.35;
      remainingWater=Math.min(100,remainingWater+uncoupledWater);
      stages[stages.length-1].remainingWater=remainingWater;
    }
    const urineNa=remainingNa,urineWater=remainingWater;
    return {adh:adhLevel,drug,stages,urineNa,urineWater,
      distalNaDelivery:drug.id==='none'?0:Math.max(0,urineNa-(normal?.urineNa||0)),
      sodiumExcretionIndex:clamp(urineNa/12*100,0,100),waterExcretionIndex:clamp(urineWater/30*100,0,100),
      urineConcentration:adhLevel>.5?'濃い尿方向':'薄い尿方向',
      urineVolume:adhLevel>.5?'少ない方向':'多い方向'};
  }
  function stageState(stage,{adh=1,drugClass='none'}={}){
    const state=simulate({adh,drugClass});return state.stages[clamp(stage,0,state.stages.length-1)];
  }
  window.NEPHRON_MODEL=Object.freeze({SEGMENTS,DRUGS,simulate,stageState});
})();
