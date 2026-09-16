/* Independent, instance-scoped views: conduction anatomy, append-only ECG and cell AP. */
(() => {
 const NS='http://www.w3.org/2000/svg';
 function mountHeart(container){
 container.innerHTML=`<svg viewBox="0 0 520 310" role="img" aria-label="正面から見た心臓の模式図。洞結節、心房、AV結節、His束、右脚左脚、Purkinje線維、心室">
 <path d="${window.CORONARY_HEART.outline}" transform="translate(90 14)" fill="#f8dadd" stroke="#d9919c" stroke-width="3"/>
 <g data-chamber="atria"><path d="M177 110 Q177 67 219 88 L250 131 L200 139Z M270 112 Q317 66 351 107 L331 141 L276 134Z" fill="#efb16a" opacity=".55"/></g>
 <g data-chamber="ventricles"><path d="M193 153 Q201 204 256 263 L247 162Z M268 164 L271 263 Q333 224 351 155Z" fill="#80a3d2" opacity=".45"/></g>
 <path d="M258 142 L265 264" stroke="#fff" stroke-width="5"/>
 <g fill="none" stroke="#8c99aa" stroke-width="4" stroke-linecap="round"><path data-wire="atria" d="M188 111 Q211 130 252 151 M188 111 Q252 76 321 119"/><path data-wire="his" d="M252 151 L263 177"/><path data-wire="branches" d="M263 177 L233 227 M263 177 L290 232"/><path data-wire="purkinje" d="M233 227 Q209 242 201 180 M233 227 L254 249 M290 232 Q332 216 337 177 M290 232 L276 250"/></g>
 <g class="conduction-nodes"><circle data-node="sa" cx="188" cy="111" r="10"/><circle data-node="av" cx="252" cy="151" r="11"/><circle data-node="his" cx="263" cy="177" r="6"/><circle data-node="branches" cx="233" cy="227" r="5"/><circle data-node="purkinje" cx="290" cy="232" r="5"/></g>
 <g class="electrical-labels" fill="#44546a" font-size="13"><text x="13" y="42">洞結節</text><path d="M69 43 L180 104"/><text x="13" y="91">右心房</text><path d="M68 93 L177 123"/><text x="13" y="148">房室結節（AV）</text><path d="M115 146 L240 151"/><text x="13" y="208">右脚</text><path d="M48 205 L232 220"/><text x="405" y="92">左心房</text><path d="M399 93 L336 114"/><text x="405" y="149">His束</text><path d="M399 150 L270 177"/><text x="405" y="208">左脚</text><path d="M399 205 L293 223"/><text x="358" y="267">Purkinje線維</text><path d="M359 255 L315 221"/><text x="132" y="297">右心室</text><text x="284" y="297">左心室</text></g>
 <circle data-signal r="7" fill="#e0aa3c" stroke="#fff" stroke-width="2" visibility="hidden"/><text data-stop x="251" y="176" fill="#ba3952" font-size="27" font-weight="800" visibility="hidden">×</text>
 <g data-atrial-chaos fill="#d58a24"><circle cx="203" cy="113" r="6"/><circle cx="224" cy="122" r="6"/><circle cx="294" cy="113" r="6"/><circle cx="319" cy="126" r="6"/></g>
 <g data-vent-chaos fill="#315b9a"><circle cx="219" cy="188" r="7"/><circle cx="240" cy="217" r="7"/><circle cx="287" cy="201" r="7"/><circle cx="313" cy="183" r="7"/></g>
 <circle data-ectopic cx="312" cy="195" r="13" fill="none" stroke="#a34e93" stroke-width="4" visibility="hidden"/></svg>
 <div class="electrical-legend"><span>● 心房の電気</span><span>● 心室の電気</span><span>縮む動き＝収縮</span></div><div class="chamber-states"><span data-a-state></span><span data-v-state></span></div><div class="current-stage" data-stage role="status"></div><p class="af-filter" data-af-filter hidden></p>
 <div class="reentry-circuit" data-circuit hidden><svg viewBox="0 0 370 100" role="img" aria-label="一方向性ブロックを回り込み、回復した組織を再興奮させる回路"><path d="M70 50 C80 -3 270 -3 278 50 C267 105 81 105 70 50" fill="none" stroke="#aac0d9" stroke-width="8"/><text x="12" y="31">遅い伝導</text><text x="38" y="54">↓</text><text x="294" y="38">↓ ×</text><text x="294" y="68">↑ ○</text><text x="138" y="56">回復した組織へ</text><circle data-loop-dot r="8" fill="#a34e93"/></svg><p>遅い伝導・回路の長さ・不応期などの条件がそろうと、回り込んだ刺激が再び組織を興奮させます。</p></div>`;
 const q=s=>container.querySelector(s);
 return {render(s,started=false){
  const af=s.p.mode==='af',vf=s.p.mode==='vf',active=started?s.stage:'rest',targets=window.RHYTHM_MODEL.drugs[s.p.drug].targets;
  container.dataset.stage=active;container.dataset.atrialContraction=String(started&&s.atrialContract);container.dataset.ventricularContraction=String(started&&s.ventricularContract);
  container.querySelectorAll('[data-node]').forEach(e=>{const key=e.dataset.node;e.setAttribute('fill',active===key?'#e0aa3c':'#fff');e.setAttribute('stroke',targets.includes(key)?'#a34e93':'#506982');e.setAttribute('stroke-width',targets.includes(key)?5:2);});
  container.querySelectorAll('[data-wire]').forEach(e=>{const on=e.dataset.wire===active;e.setAttribute('stroke',on?'#e0aa3c':targets.includes(e.dataset.wire)?'#a34e93':'#8c99aa');});
  for(const [key,contract]of [['atria',s.atrialContract],['ventricles',s.ventricularContract]]){const group=q(`[data-chamber="${key}"]`);group.style.transform=started&&contract?'scale(.94)':'scale(1)';group.setAttribute('opacity',active===key||key==='ventricles'&&['purkinje','ectopic'].includes(active)?'1':'.75');group.classList.toggle('cell-target',targets.includes(key));}
  const locations={sa:[188,111],atria:[219,128],av:[252,151],his:[263,177],branches:[242,210],purkinje:[293,232],ventricles:[313,197],ectopic:[312,195],repol:[284,220]};let pos=locations[active];const beat=s.beat;
  if(beat&&beat.kind==='sinus'&&pos){let from,to,f;if(active==='atria'){from=[188,111];to=[252,151];f=(s.t-beat.a)/(beat.av-beat.a);}else if(active==='his'){from=[252,151];to=[263,177];f=(s.t-beat.av-beat.p.delay)/Math.max(.01,beat.v-.12-beat.av-beat.p.delay);}else if(active==='branches'){from=[263,177];to=[233,227];f=(s.t-beat.v+.12)/.12;}if(from){f=Math.max(0,Math.min(1,f));pos=[from[0]+(to[0]-from[0])*f,from[1]+(to[1]-from[1])*f];}}
  q('[data-signal]').setAttribute('visibility',pos?'visible':'hidden');if(pos){q('[data-signal]').setAttribute('cx',pos[0]);q('[data-signal]').setAttribute('cy',pos[1]);q('[data-signal]').setAttribute('fill',['purkinje','ventricles','repol','ectopic'].includes(active)?'#315b9a':'#e0aa3c');}
  q('[data-af-filter]').hidden=!af;q('[data-af-filter]').textContent=s.afPassed?'心房の多数の刺激 → AV結節：一部が通過 ↓ 心室へ':'心房の多数の刺激 → AV結節：全てを通さない ×';
  q('[data-stop]').setAttribute('visibility',active==='blocked'?'visible':'hidden');q('[data-ectopic]').setAttribute('visibility',active==='ectopic'?'visible':'hidden');
  for(const [selector,on]of [['[data-atrial-chaos]',af],['[data-vent-chaos]',vf]]){const g=q(selector);g.style.display=on&&started?'':'none';[...g.children].forEach((e,i)=>e.style.opacity=.2+.8*Math.abs(Math.sin(s.t*(7+i)+i)));}
  q('[data-a-state]').textContent=af?'心房：有効な収縮なし':s.atrialContract&&started?'心房：電気のあとに収縮':'心房：弛緩';q('[data-v-state]').textContent=vf?'心室：有効な拍出なし':s.ventricularContract&&started?'心室：電気のあとに収縮':'心室：弛緩';
  q('[data-stage]').textContent=!started?'STARTで、洞結節からの伝導を見よう。':({normal:'',af:'AFモデル｜',vt:'VTモデル｜',vf:'VFモデル｜',reentry:'旋回モデル｜'}[s.p.mode]+s.message);
  q('[data-circuit]').hidden=s.p.mode!=='reentry';if(s.p.mode==='reentry'){const a=-Math.PI/2-s.reentryPhase*Math.PI*2;q('[data-loop-dot]').setAttribute('cx',174+104*Math.cos(a));q('[data-loop-dot]').setAttribute('cy',50+38*Math.sin(a));}
 }};
 }
 function mountECG(container){
  container.innerHTML=`<svg viewBox="0 0 800 150" preserveAspectRatio="none" role="img" aria-label="時間とともに追記する模式心電図。縦軸は相対振幅、横軸は学習時間"><path d="M25 12 V125 H780 M25 92 H780" fill="none" stroke="#d7e0e9"/><g data-markers></g><polyline data-ecg fill="none" stroke="#315b9a" stroke-width="2.5"/><text x="25" y="145">0</text><text x="622" y="145">学習時間 → 48</text></svg>`;
  let samples=[];const line=container.querySelector('[data-ecg]'),markers=container.querySelector('[data-markers]');let marked=new Set();
  return {reset(){samples=[];line.setAttribute('points','');markers.replaceChildren();marked=new Set();},append(s){samples.push([25+s.t/48*755,92-s.ecg*58]);line.setAttribute('points',samples.map(p=>p.join(',')).join(' '));
   for(const [i,b]of s.beats.entries())for(const [type,time]of [['P',b.a],['QRS',b.v],['T',b.v===null?null:b.v+.64*b.p.apScale]]){const key=i+type;if(time===null||time>s.t||marked.has(key))continue;marked.add(key);if(i>2)continue;const e=document.createElementNS(NS,'text');e.setAttribute('x',25+time/48*755);e.setAttribute('y',type==='QRS'?18:type==='P'?70:62);e.setAttribute('class','ecg-wave-label');e.textContent=type;markers.append(e);}
  },get samples(){return samples.map(x=>[...x]);}};
 }
 function mountAP(container){
  container.innerHTML=`<div class="ap-caption" data-ap-caption></div><svg viewBox="0 0 560 185" role="img" aria-label="細胞の膜電位の相対変化。灰色は1周期の参考線、色線と点が現在までの変化"><path d="M40 12 V151 H537" fill="none" stroke="#ccd6e2"/><text x="4" y="24">＋</text><text x="4" y="146">−</text><text x="439" y="178">1周期 →</text><polyline data-ap-reference fill="none" stroke="#c7d1de" stroke-width="3"/><polyline data-ap-progress fill="none" stroke="#d95c5c" stroke-width="3"/><circle data-ap-dot r="5" fill="#d95c5c"/></svg><div class="ion-membrane"><span>細胞外</span><div class="ion-channels"><span data-ion="na">Na⁺<b>↓</b></span><span data-ion="ca">Ca²⁺<b>↓</b></span><span data-ion="k">K⁺<b>↑</b></span></div><span>細胞内</span></div><p class="ap-phase" data-ap-phase></p>`;
  return {render(s,type='ventricle',started=false){const M=window.RHYTHM_MODEL,p=(type==='node'?s.beats.filter(b=>b.kind==='sinus').at(-1)?.p:null)||s.p,node=type==='node',cycle=node?p.period:1.6,curve=[];let elapsed=0;
    const last=(node?s.beats.filter(b=>b.kind==='sinus'):s.beats.filter(b=>b.v!==null&&b.v<=s.t)).at(-1);if(last)elapsed=node?(s.t-last.origin)%p.period:s.t-last.v;
    const current=node?M.nodalAP(elapsed,p):M.ventricularAP(last?elapsed:-1,last?.p.drug||p.drug);const drug=node?p.drug:last?.p.drug||p.drug;
    for(let i=0;i<=120;i++){const a=i/120*cycle,v=node?M.nodalAP(a===cycle?a-.001:a,p).value:M.ventricularAP(a,drug).value;curve.push([40+i/120*485,145-(v+90)/125*125]);}
    const q=sel=>container.querySelector(sel);q('[data-ap-caption]').textContent=node?'洞結節｜自動能：ゆっくり閾値へ → Ca²⁺で立ち上がる':'心室筋｜Na⁺で立ち上がる → Ca²⁺のプラトー → K⁺で戻る';q('[data-ap-reference]').setAttribute('points',curve.map(x=>x.join(',')).join(' '));const progress=started?curve.slice(0,Math.max(1,Math.ceil(Math.min(cycle,elapsed)/cycle*120)+1)):[];q('[data-ap-progress]').setAttribute('points',progress.map(x=>x.join(',')).join(' '));const dot=progress.at(-1);q('[data-ap-dot]').style.display=dot?'':'none';if(dot){q('[data-ap-dot]').setAttribute('cx',dot[0]);q('[data-ap-dot]').setAttribute('cy',dot[1]);}
    q('[data-ap-phase]').textContent=started?`${current.ion}（Phase ${current.phase}）`:'STARTで、心臓の電気と合わせて観察できます。';q('[data-ap-phase]').dataset.phase=current.phase;
    container.querySelectorAll('[data-ion]').forEach(e=>{e.classList.toggle('ion-active',started&&(e.dataset.ion===current.flow||current.phase===2&&e.dataset.ion==='k'));e.style.setProperty('--ion-offset',(started?current.progress*13:0)+'px');});
    if(node&&['af','vt','vf','reentry'].includes(p.mode)){q('[data-ap-phase]').textContent='洞結節の単一細胞モデルは正常伝導モードで観察できます。この異常リズムを洞結節発火で説明する図ではありません。';q('[data-ap-progress]').setAttribute('points','');q('[data-ap-dot]').style.display='none';}
    if(p.mode==='vf'){q('[data-ap-phase]').textContent='VFでは多数の細胞が無秩序に活動します。単一の同期した活動電位としては表示しません。';q('[data-ap-progress]').setAttribute('points','');q('[data-ap-dot]').style.display='none';}
  }};
 }
 window.CARDIAC_ELECTRICAL_VIEW={mountHeart,mountECG,mountAP};
})();
