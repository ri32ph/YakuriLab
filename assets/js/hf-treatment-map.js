(function(root){
'use strict';
function mount(container){
 const graph=root.HEART_FAILURE_MAP.mount(container);
 return {render(s,{motion=false}={}){
  container.querySelectorAll('.treatment-block').forEach(el=>el.remove());
  graph.render(s.view,{motion,emphasis:s.emphasis});
  container.dataset.treated=String(s.after);
  const copy=(key,text)=>container.querySelector(`[data-copy="${key}"]`).textContent=text;
  for(const el of container.querySelectorAll('[data-target]'))el.classList.remove('attenuated');
  for(const el of container.querySelectorAll('[data-organ]'))el.classList.remove('treatment-organ');
  if(!s.after)return;
  const c=s.changed;
  copy('heart','ポンプ機能低下は残す。COの変化は予測しない');
  if(c.sympathetic)copy('sympathetic','β1作用↓ → 心拍数↓方向・過剰な刺激↓');
  if(c.raas)copy('raas',c.angiotensin?'Ang II生成↓方向 → RAASの作用↓':'AT1を介する作用↓（Ang IIの生成は止めない）');
  if(c.vessels)copy('vessels','血管収縮↓方向 → TPR↓方向');
  if(c.sodium)copy('volume','Na⁺保持↓方向 → 水分保持↓方向');
  if(s.active.includes('sglt2')||s.active.includes('loop'))copy('kidneys',s.active.includes('sglt2')&&s.active.includes('loop')?'近位尿細管 ＋ ヘンレ係蹄に作用':s.active.includes('loop')?'ヘンレ係蹄：Na⁺再吸収↓':'近位尿細管：Na⁺・糖再吸収↓');
  copy('result',c.load?'長期的な心負荷を抑える方向':c.sglt2Benefit?'心不全への有益性：複数の機序':'主にうっ血・症状を改善する方向');
  copy('congestion',c.volume?'肺うっ血・下肢浮腫↓方向（過剰な体液が減った場合）':'心拍数・慢性の交感神経刺激↓方向。うっ血はこの表示では変更しない');
  container.querySelector('.return-loop>span').textContent='↶ 悪循環への介入を模式表示（反応・回復の程度は予測しない）';
  for(const [key,labels] of Object.entries(s.blocks)){
   const node=container.querySelector(`[data-target="${key}"]`);
   for(const label of labels){const mark=document.createElement('span');mark.className='treatment-block';mark.textContent=label;node.append(mark);}
  }
  const downstream={sympathetic:c.sympathetic,raas:c.raas,vessels:c.vessels,volume:c.volume,congestion:c.volume,load:c.load};
  for(const [key,on] of Object.entries(downstream))if(on)container.querySelector(`[data-target="${key}"]`)?.classList.add('attenuated');
  const organs=[];if(c.sympathetic)organs.push('heart');if(s.channels.kidneys||c.aldosteroneAction)organs.push('kidneys');
  // Gold path highlights are inherited from disease; blue emphasis indicates the selected treatment site.
  for(const organ of organs)container.querySelector(`[data-organ="${organ}"]`)?.classList.add('treatment-organ');
 }};
}
root.HF_TREATMENT_MAP={mount};
})(typeof window==='undefined'?globalThis:window);
