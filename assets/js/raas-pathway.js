/* Reusable in LAB 30: mount(container), then render(state).
   Stable data-target keys: renin, angiotensin-i, ace, angiotensin-ii, at1, mr.
   This component displays physiology; it does not simulate drug efficacy. */
(function(root){
  const nodes=[
    ['trigger',0,'循環血液量↓ → 腎灌流圧↓'],['renin',1,'腎臓 → レニン↑'],
    ['substrate',2,'肝臓由来のアンジオテンシノーゲン'],['angiotensin-i',3,'レニンが切断 → Ang I'],
    ['ace',4,'ACE'],['angiotensin-ii',4,'Ang II↑']
  ];
  function mount(container,options={}){
    if(options.mode==='drug')return mountDrug(container);
    container.innerHTML='<div class="path-trunk">'+nodes.map(([key,step,label])=>`<span class="path-node" data-target="${key}" data-step="${step}">${key==='trigger'&&options.triggerLabel?options.triggerLabel:label}</span>`).join('')+'</div><div class="path-split"><div class="path-arm"><span class="path-node" data-target="at1" data-step="5">まず：AT1受容体 → 血管収縮</span><span class="path-node" data-step="5">TPR↑ → 血圧↑方向</span></div><div class="path-arm"><span class="path-node" data-step="5">副腎皮質 → アルドステロン↑</span><span class="path-node" data-target="mr" data-step="6">その後：腎臓の受容体 → Na⁺再吸収↑</span><span class="path-node" data-step="6">水分保持↑ → 循環血液量↑方向</span><span class="path-node" data-step="7">血圧・循環を維持する方向</span></div></div>';
    return {render(s){container.hidden=!s.low||!s.enabled;container.querySelectorAll('[data-step]').forEach(el=>{const n=Number(el.dataset.step);el.hidden=n>s.stage;el.classList.toggle('current',n===s.stage);});container.querySelector('.path-split').hidden=s.stage<5;}};
  }
  function mountDrug(container){
    container.innerHTML='<div class="path-trunk"><span class="path-node" data-target="renin">腎臓 → レニン</span><span class="path-node" data-target="angiotensin-i">Ang I</span><span class="path-node" data-target="ace">ACE</span><span class="path-node" data-target="angiotensin-ii">Ang II</span><span class="path-node" data-target="at1">AT1受容体</span></div><div class="path-split"><div class="path-arm"><span class="path-node" data-effect="vascular">血管収縮 → TPRを上げる方向</span></div><div class="path-arm"><span class="path-node" data-target="aldosterone">副腎皮質 → アルドステロン</span><span class="path-node" data-target="mr">腎臓のミネラルコルチコイド受容体</span><span class="path-node" data-effect="retention">Na⁺再吸収 → 水分保持</span></div></div><p class="path-note small"></p>';
    const baseline=new Map(Array.from(container.querySelectorAll('.path-node'),el=>[el,el.textContent]));
    return {render(s){
      for(const [el,text] of baseline){el.textContent=text;el.classList.remove('blocked','diminished');}
      const target=key=>container.querySelector(`[data-target="${key}"]`);
      for(const key of s.targets||[]){const el=target(key);if(el){el.classList.add('blocked');el.textContent+=(key==='renin'?' ｜ β1 BLOCK → 分泌↓':' ｜ BLOCK');}}
      const vascular=container.querySelector('[data-effect="vascular"]'),retention=container.querySelector('[data-effect="retention"]');
      if(s.id==='ace'||s.id==='beta'){target('angiotensin-ii').textContent='Ang II生成↓';target('angiotensin-ii').classList.add('diminished');}
      if(s.id==='arb')target('angiotensin-ii').textContent='Ang II：生成を止めない';
      if(['ace','arb','beta'].includes(s.id)){
        vascular.textContent='血管収縮↓方向 → TPR↓方向';vascular.classList.add('diminished');
        target('aldosterone').textContent='副腎皮質 → アルドステロン分泌刺激↓方向';
      }
      if(['ace','arb','beta','mra'].includes(s.id)){retention.textContent='Na⁺再吸収↓方向 → 水分保持↓方向';retention.classList.add('diminished');}
      container.querySelector('.path-note').textContent=s.id==='arb'?'AT1は血管と副腎などに存在します。受容体を介する作用を抑え、Ang IIの生成は止めません。':s.id==='ace'?'ACEによるAng II生成を抑えます。ACEは肺以外の血管内皮などにも存在します。':s.id==='mra'?'アルドステロンの受容体作用を遮断。K⁺排泄↓方向 → 高K血症に注意。':s.id==='beta'?'β1遮断がレニン分泌を抑えます。血管・体液量への下流の寄与も模式的に示しています。':'RAASは血管収縮とNa⁺・水分保持を通じて循環を支えます。';
    }};
  }
  root.RAAS_PATHWAY={mount};
})(typeof window==='undefined'?globalThis:window);
