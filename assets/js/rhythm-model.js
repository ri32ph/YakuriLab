/* Teaching time is deliberately stretched. No clinical intervals or diagnosis. */
(() => {
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const drugs={
  none:{name:'薬なし',targets:[],text:'まず電気の流れを観察しよう。',care:'脈拍数・規則性と、血圧・意識・胸部症状・呼吸を合わせて見ます。ECGだけでは有効な拍出は分かりません。'},
  na:{name:'Na⁺チャネル遮断',targets:['his','branches','purkinje','ventricles'],text:'速い反応型の心筋で、急速な立ち上がり・伝導を抑える方向。ここでは伝導遅延を示す代表例です。',care:'QRSなど：心室内の伝導への作用を見るため。IA・IB・ICでは作用が異なり、この図の変化量を共通効果とは考えません。'},
  beta:{name:'β遮断',targets:['sa','av'],text:'β1作用↓ → 洞結節の自動能↓・AV伝導↓方向。洞結節の発火間隔、RR・PRの変化を見よう。',care:'心拍数・PR・血圧：自動能とAV伝導の抑制を見るため。徐脈や循環の変化にも注意します。'},
  k:{name:'K⁺チャネル遮断',targets:['ventricles'],text:'再分極に関わるK⁺電流↓ → 活動電位持続時間・不応期に影響。この例は延長する方向を示します。',care:'QT・電解質など：再分極の延長と催不整脈作用に関係するため。抗不整脈薬でも不整脈を起こすことがあります。'},
  ca:{name:'Ca²⁺チャネル遮断（非DHP系）',targets:['av','sa'],text:'結節組織のCa²⁺電流↓ → 主にAV伝導↓方向。DHP系Ca拮抗薬とは区別します。',care:'PR・心拍数・血圧：AV伝導や心拍への作用を見るため。心機能や併用薬でも反応が変わります。'}
 };
 function parameters(input={}){
  const speed=clamp(Number(input.speed??50),0,100),av=clamp(Number(input.av??50),0,100),weak=clamp(Number(input.weak??0),0,2),drug=drugs[input.drug]?input.drug:'none',mode=['normal','reentry','af','vt','vf'].includes(input.mode)?input.mode:'normal';
  const period=(5.3-.035*speed)*(drug==='beta'?1.35:drug==='ca'?1.12:1),delay=(.82-.0064*av)+(weak? .38:0)+(drug==='beta'?.28:drug==='ca'?.43:0),qrs=drug==='na'?.30:.17,apScale=drug==='k'?1.35:1;
  return {speed,av,weak,drug,mode,period,delay,qrs,apScale,fastDelay:drug==='na'?.18:0};
 }
 const triangle=(x,a,b,c,height)=>x<a||x>c?0:x<b?height*(x-a)/(b-a):height*(c-x)/(c-b);
 function ventricularAP(age,drug='none'){
  const up=drug==='na'?.17:.065,k=drug==='k'?1.35:1,end=.99*k+up;
  if(age<0||age>=end)return {value:-85,phase:4,ion:'静止膜電位',flow:'',progress:0};
  if(age<up)return {value:-85+115*age/up,phase:0,ion:'Na⁺流入 → 急速な脱分極',flow:'na',progress:age/up};
  if(age<up+.10)return {value:30-20*(age-up)/.10,phase:1,ion:'初期再分極',flow:'k',progress:(age-up)/.1};
  if(age<up+.58*k)return {value:10-10*(age-up-.1)/(.58*k-.1),phase:2,ion:'Ca²⁺流入とK⁺流出 → プラトー',flow:'ca',progress:(age-up-.1)/(.58*k-.1)};
  return {value:-85*(age-up-.58*k)/(.41*k),phase:3,ion:'K⁺流出 → 再分極',flow:'k',progress:(age-up-.58*k)/(.41*k)};
 }
 function nodalAP(age,p){
  const a=((age%p.period)+p.period)%p.period,up=p.drug==='ca'?.26:.18;
  if(a<up)return {value:-40+60*a/up,phase:0,ion:'Ca²⁺流入 → 洞結節の立ち上がり',flow:'ca',progress:a/up};
  if(a<.7)return {value:20-80*(a-up)/(.7-up),phase:3,ion:'K⁺流出 → 再分極',flow:'k',progress:(a-up)/(.7-up)};
  return {value:-60+20*(a-.7)/(p.period-.7),phase:4,ion:'拡張期に徐々に脱分極 → 閾値へ',flow:'auto',progress:(a-.7)/(p.period-.7)};
 }
 function ecg(t,beats,mode){
  if(mode==='vf')return .34*Math.sin(t*19)+.24*Math.sin(t*31.7)+.17*Math.sin(t*12.3);
  let y=mode==='af'?.045*Math.sin(t*33)+.025*Math.sin(t*51):0;
  for(const b of beats){if(b.a!==null)y+=triangle(t-b.a,0,.10,.23,.19);if(b.v===null)continue;const x=t-b.v,w=b.p.qrs*(b.kind==='ectopic'||b.kind==='vt'?1.7:1);
   y+=triangle(x,0,w*.18,w*.3,-.18)+triangle(x,w*.20,w*.45,w*.70,1.12)+triangle(x,w*.6,w*.8,w,-.3);
   y+=triangle(x,.40*b.p.apScale,.64*b.p.apScale,1.03*b.p.apScale,b.kind==='ectopic'?-.24:.30);
  }return y;
 }
 function circulation(beats,t,p){
  if(p.mode==='vf')return {hr:'測定対象外',fill:'協調した収縮・有効な拍出なし',sv:'有効な拍出なし',co:'著しく低下する方向',rate:0};
  const times=beats.filter(b=>b.v!==null&&b.v<=t).map(b=>b.v).sort((a,b)=>a-b),intervals=times.slice(1).map((v,i)=>v-times[i]),rr=intervals.length?intervals.slice(-4).reduce((a,b)=>a+b)/Math.min(4,intervals.length):p.period;
  const rate=3.55/Math.max(.3,rr),filling=clamp(rr/2.6,.2,1),sv=filling*(p.mode==='af'?.8:p.mode==='vt'?.62:1),co=rate*sv;
  return {rate,hr:p.mode==='af'?'不規則':rate>1.15?'増加方向':rate<.85?'低下方向':'標準付近',fill:filling<.9?'拡張期短縮 → 低下方向':p.mode==='af'?'心房収縮の寄与↓':'保たれる方向',sv:sv<.9?'低下し得る':p.weak===2?'各拍と間隔による':'標準付近',co:p.mode!=='normal'||p.weak===2?'維持しにくい／変動し得る':rate>1.4?'HR増加だけでは増えない':co<.85?'低下し得る':'充満・SVにも左右される'};
 }
 function create(){
  let t=0,next=.30,beats=[],count=0,mode='normal',queued=null,latestP=parameters(),afIndex=0;
  const afIntervals=[1.6,2.5,1.85,3.1,1.35,2.75,2.1];
  function add(origin,p,kind='sinus'){
   const a=kind==='sinus'?origin+.12:null,av=kind==='sinus'?origin+.37:kind==='af'?origin:null,blocked=kind==='sinus'&&p.weak===2&&count%2===0;
   let v=kind==='sinus'?(blocked?null:av+p.delay+.24+p.fastDelay):kind==='af'?origin+p.delay:origin;
   const previous=beats.filter(b=>b.v!==null&&b.v<=v).sort((a,b)=>a.v-b.v).at(-1);if(v!==null&&previous&&v-previous.v<.95*previous.p.apScale)v=null;
   const beat={origin,a,av,v,blocked:blocked||v===null,kind,p:{...p}};beats.push(beat);return beat;
  }
  function snapshot(){
   const p=latestP,recent=beats.filter(b=>b.origin<=t&&t-b.origin<7),vBeat=recent.filter(b=>b.v!==null&&b.v<=t).sort((a,b)=>a.v-b.v).at(-1),aBeat=recent.filter(b=>b.a!==null&&b.a<=t).at(-1),b=recent.at(-1),age=b?t-b.origin:-1;
   let stage='rest',message='次の刺激を待つ';
   if(p.mode==='vf'){stage='vf';message='心室内の電気活動が無秩序。有効な拍出が失われる状態。';}
   else if(b){
    if(b.kind==='sinus'){
     if(t<b.a){stage='sa';message='洞結節が発火 → 心房へ';}
     else if(t<b.av){stage='atria';message='心房が脱分極（P波）。このあと心房が収縮。';}
     else if(t<b.av+b.p.delay){stage='av';message='AV結節で少し待つ → 心房から心室へ血液を送り込む時間をつくる';}
     else if(b.blocked&&t<b.av+b.p.delay+.5){stage='blocked';message='AV結節で伝導が途絶。このP波に続くQRSはありません。';}
     else if(b.v!==null&&t<b.v){stage=t<b.v-.12?'his':'branches';message='His束 → 右脚・左脚 → Purkinje線維へ';}
    }else if(b.kind==='af'&&t<b.v){stage='av';message='不規則な心房刺激の一部がAV結節を通過';}
    if(vBeat&&t-vBeat.v<.14){stage=vBeat.kind==='ectopic'?'ectopic':'purkinje';message=vBeat.kind==='ectopic'?'心室の別の場所から、予定外の興奮':'心室へ電気が広がる（QRS）。収縮はこのあと。';}
    else if(vBeat&&t-vBeat.v<.34){stage='ventricles';message='心室脱分極に続いて、心室が収縮';}
    else if(vBeat&&t-vBeat.v>.40*vBeat.p.apScale&&t-vBeat.v<1.03*vBeat.p.apScale){stage='repol';message='心室の再分極（T波）。電気的な回復の過程。';}
   }
   const atrialContract=!!aBeat&&t-aBeat.a>.16&&t-aBeat.a<.43&&p.mode!=='af',ventricularContract=!!vBeat&&t-vBeat.v>.15&&t-vBeat.v<.63&&p.mode!=='vf';
   return {t,p,beats,beat:b,lastV:vBeat,stage,message,atrialContract,ventricularContract,ecg:ecg(t,recent,p.mode),ventAP:ventricularAP(vBeat?t-vBeat.v:-1,vBeat?.p.drug||p.drug),nodeAP:nodalAP(b?age:t,p),circulation:circulation(beats,t,p),reentryPhase:(t%1.8)/1.8,afPassed:!!b&&b.kind==='af'&&t-b.origin<.35,ectopicPending:queued!==null};
  }
  return {
   step(dt,input){latestP=parameters(input);if(latestP.mode!==mode)throw Error('Reset engine before changing rhythm mode');t=Math.min(48,t+Math.max(0,Math.min(dt,.1)));
    while(next<=t&&mode!=='vf'){count++;const p=parameters(input);add(next,p,mode==='normal'?'sinus':mode==='af'?'af':mode==='vt'?'vt':'reentry');const interval=mode==='af'?afIntervals[afIndex++%afIntervals.length]*(p.drug==='beta'?1.35:p.drug==='ca'?1.3:1):mode==='vt'?1.2:mode==='reentry'?1.8:p.period;next+=interval;}
    if(queued!==null&&t>=queued){add(queued,parameters(input),'ectopic');queued=null;}return snapshot();
   },
   snapshot,
   reset(input={}){t=0;next=.3;beats=[];count=0;queued=null;afIndex=0;latestP=parameters(input);mode=latestP.mode;return snapshot();},
   ectopic(){if(mode!=='normal'||queued!==null||t>=46)return false;const last=beats.filter(b=>b.v!==null&&b.v<=t).at(-1),nowSafe=last?last.v+1.08*last.p.apScale:t+.15;const upcoming=beats.find(b=>b.v!==null&&b.v>t);queued=Math.max(t+.15,nowSafe,upcoming?upcoming.v+1.08*upcoming.p.apScale:0);return true;}
  };
 }
 window.RHYTHM_MODEL={parameters,ventricularAP,nodalAP,ecg,circulation,create,drugs};
})();
